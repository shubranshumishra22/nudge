import { NextResponse } from 'next/server'
import { cookies } from 'next/headers'
import { createClient } from '@supabase/supabase-js'
import { createServerSupabaseClient } from '@nudge/db'
import { runPipeline } from '@/lib/pipeline'
import { z } from 'zod'

const generateSchema = z.object({
  business_name: z.string().min(2).max(60),
  business_type: z.enum([
    'cafe', 'bakery', 'clothing', 'fitness',
    'handmade', 'restaurant', 'beauty', 'generic',
  ]),
  description: z.string().min(10).max(500),
  primary_color: z.string().regex(/^#[0-9A-Fa-f]{6}$/),
  products: z
    .array(
      z.object({
        name: z.string().min(1),
        price: z.number().min(0),
        description: z.string().optional(),
        image_url: z.string().optional(),
      }),
    )
    .max(20)
    .default([]),
})

function slugify(text: string): string {
  return text
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/^-+|-+$/g, '')
    .slice(0, 40)
}

function fontStyleFromHeading(fontHeading: string): 'modern' | 'classic' | 'playful' | 'minimal' {
  const normalized = fontHeading.toLowerCase()
  if (normalized.includes('playfair') || normalized.includes('serif')) return 'classic'
  if (normalized.includes('comic') || normalized.includes('cursive')) return 'playful'
  if (normalized.includes('inter') || normalized.includes('system')) return 'modern'
  return 'minimal'
}

async function uniqueSlug(db: any, base: string): Promise<string> {
  for (let i = 0; i < 10; i++) {
    const suffix = Math.random().toString(36).slice(2, 6)
    const slug = `${base}-${suffix}`
    const { data } = await db.from('stores').select('id').eq('slug', slug).maybeSingle()
    if (!data) return slug
  }
  return `${base}-${Date.now().toString(36)}`
}

async function checkRateLimit(
  userId: string,
  plan: string,
): Promise<{ allowed: boolean; resetAt: number | null }> {
  const redisUrl = process.env.UPSTASH_REDIS_REST_URL
  const redisToken = process.env.UPSTASH_REDIS_REST_TOKEN

  if (!redisUrl || !redisToken) {
    return { allowed: true, resetAt: null }
  }

  const { Ratelimit } = await import('@upstash/ratelimit')
  const { Redis } = await import('@upstash/redis')

  const limit = plan === 'pro' ? 20 : 3

  const ratelimit = new Ratelimit({
    redis: new Redis({ url: redisUrl, token: redisToken }),
    limiter: Ratelimit.slidingWindow(limit, '1 h'),
    analytics: true,
    prefix: 'nudge:generate',
  })

  const { success, reset } = await ratelimit.limit(userId)
  return { allowed: success, resetAt: reset }
}

export async function POST(request: Request) {
  const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!
  const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY!
  const cookieStore = cookies()

  const supabase = createServerSupabaseClient({
    get(name: string) { return cookieStore.get(name)?.value },
    set(name: string, value: string, options: Record<string, unknown>) { try { cookieStore.set(name, value, options) } catch {} },
    remove(name: string, options: Record<string, unknown>) { try { cookieStore.set(name, '', options) } catch {} },
  })

  const db = createClient(supabaseUrl, supabaseServiceKey)

  const { data: { user } } = await supabase.auth.getUser()
  if (!user) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  }

  const { data: profile } = await db
    .from('profiles')
    .select('plan')
    .eq('id', user.id)
    .maybeSingle()

  if (!profile) {
    await db.from('profiles').insert({
      id: user.id,
      full_name: user.email?.split('@')[0] || null,
      plan: 'free',
      onboarding_completed: false,
    })
  }

  const plan = (profile as { plan?: string })?.plan ?? 'free'

  const { allowed, resetAt } = await checkRateLimit(user.id, plan)
  if (!allowed) {
    return NextResponse.json(
      { error: 'Generation limit reached', resetAt },
      { status: 429, headers: { 'Retry-After': String(Math.ceil(((resetAt ?? Date.now()) - Date.now()) / 1000)) } },
    )
  }

  const body = await request.json()
  const parsed = generateSchema.safeParse(body)

  if (!parsed.success) {
    return NextResponse.json(
      { error: parsed.error.issues[0]?.message ?? 'Invalid input' },
      { status: 400 },
    )
  }

  const input = parsed.data
  const baseSlug = slugify(input.business_name)
  const slug = await uniqueSlug(db, baseSlug)

  // Run the multi-agent pipeline
  const result = await runPipeline(input)

  if (result.success) {
    // Create store
    const { data: store, error: storeError } = await db
      .from('stores')
      .insert({
        owner_id: user.id,
        name: input.business_name,
        slug,
        description: input.description,
        business_type: input.business_type,
        ai_config: result as unknown as Record<string, unknown>,
        currency: 'INR',
        delivery_fee: 0,
        status: 'draft',
      })
      .select('id')
      .single()

    if (storeError || !store) {
      return NextResponse.json({ error: storeError?.message ?? 'Failed to create store' }, { status: 500 })
    }

    // Insert theme from design output
    const { error: themeError } = await db.from('store_themes').insert({
      store_id: store.id,
      primary_color: result.design.primary_color,
      accent_color: result.design.accent_color,
      background_color: result.design.background_color,
      font_style: fontStyleFromHeading(result.design.font_heading),
      hero_headline: result.content.hero_headline,
      hero_subheading: result.content.hero_subheadline,
      sections_order: result.research.common_sections,
      sections_enabled: {
        hero: true,
        products: true,
        about: true,
        contact: true,
      },
    })

    if (themeError) {
      console.error('Theme creation failed:', themeError)
    }

    // Insert products
    for (let i = 0; i < input.products.length; i++) {
      const p = input.products[i]
      const { data: product, error: productError } = await db.from('products').insert({
        store_id: store.id,
        name: p.name,
        slug: slugify(p.name),
        description: p.description || '',
        price: p.price,
        category: input.business_type,
        is_featured: i === 0,
        sort_order: i,
      }).select('id').single()

      if (productError) {
        console.error('Product creation failed:', productError)
      } else if (product && p.image_url) {
        const { error: imageError } = await db.from('product_images').insert({
          product_id: product.id,
          url: p.image_url,
          alt_text: p.name,
          sort_order: 0,
          is_primary: true,
        })

        if (imageError) {
          console.error('Product image creation failed:', imageError)
        }
      }
    }

    // Save generated HTML to storage
    const { error: uploadError } = await db.storage
      .from('storefronts')
      .upload(`${store.id}/index.html`, new Blob([result.build.html], { type: 'text/html' }), {
        upsert: true,
        contentType: 'text/html',
      })

    if (uploadError) {
      console.error('HTML upload failed:', uploadError)
    }

    // Log generation
    await db.from('ai_generation_logs').insert({
      owner_id: user.id,
      store_id: store.id,
      input_payload: input as unknown as Record<string, unknown>,
      output_config: result as unknown as Record<string, unknown>,
      model_used: result.models_used.join(', '),
      tokens_used: null,
      duration_ms: result.duration_ms,
      success: true,
      error_message: null,
    })

    return NextResponse.json({
      success: true,
      store_id: store.id,
      slug,
      preview_url: `/onboard/preview?store=${store.id}`,
    })
  } else {
    // Partial failure — save whatever we have
    let partialStore = null
    const { data: store } = await db
      .from('stores')
      .insert({
        owner_id: user.id,
        name: input.business_name,
        slug,
        description: input.description,
        business_type: input.business_type,
        ai_config: result as unknown as Record<string, unknown>,
        currency: 'INR',
        delivery_fee: 0,
        status: 'draft',
      })
      .select('id')
      .single()

    if (store) {
      partialStore = store
      // Save whatever HTML we have
      await db.storage
        .from('storefronts')
        .upload(`${store.id}/index.html`, new Blob([result.build.html], { type: 'text/html' }), {
          upsert: true,
          contentType: 'text/html',
        })
    }

    await db.from('ai_generation_logs').insert({
      owner_id: user.id,
      store_id: partialStore?.id || null,
      input_payload: input as unknown as Record<string, unknown>,
      output_config: result as unknown as Record<string, unknown>,
      model_used: result.models_used.join(', '),
      tokens_used: null,
      duration_ms: result.duration_ms,
      success: false,
      error_message: result.error || 'Unknown error',
    })

    return NextResponse.json(
      {
        success: false,
        error: result.error || 'Pipeline failed',
        partial: true,
        store_id: partialStore?.id || null,
      },
      { status: 500 },
    )
  }
}
