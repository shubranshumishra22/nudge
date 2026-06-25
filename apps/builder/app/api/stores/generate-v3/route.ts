import { NextResponse } from 'next/server';
import { cookies } from 'next/headers';
import { createClient } from '@supabase/supabase-js';
import { createServerSupabaseClient } from '@nudge/db';
import { runPipelineV3 } from '@/lib/pipeline/v3';
import { z } from 'zod';
import { randomUUID } from 'crypto';

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
});

function slugify(text: string): string {
  return text
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/^-+|-+$/g, '')
    .slice(0, 40);
}

function fontStyleFromHeading(fontHeading: string): 'modern' | 'classic' | 'playful' | 'minimal' {
  const normalized = fontHeading.toLowerCase();
  if (normalized.includes('playfair') || normalized.includes('serif')) return 'classic';
  if (normalized.includes('comic') || normalized.includes('cursive')) return 'playful';
  if (normalized.includes('inter') || normalized.includes('system')) return 'modern';
  return 'minimal';
}

async function uniqueSlug(db: any, base: string): Promise<string> {
  for (let i = 0; i < 10; i++) {
    const suffix = Math.random().toString(36).slice(2, 6);
    const slug = `${base}-${suffix}`;
    const { data } = await db.from('stores').select('id').eq('slug', slug).maybeSingle();
    if (!data) return slug;
  }
  return `${base}-${Date.now().toString(36)}`;
}

async function checkRateLimit(
  userId: string,
  plan: string,
): Promise<{ allowed: boolean; resetAt: number | null }> {
  const redisUrl = process.env.UPSTASH_REDIS_REST_URL;
  const redisToken = process.env.UPSTASH_REDIS_REST_TOKEN;

  if (!redisUrl || !redisToken) {
    return { allowed: true, resetAt: null };
  }

  const { Ratelimit } = await import('@upstash/ratelimit');
  const { Redis } = await import('@upstash/redis');

  // V3 rate limits: 2 per hour for free, 10 per hour for pro
  const limit = plan === 'pro' ? 10 : 2;

  const ratelimit = new Ratelimit({
    redis: new Redis({ url: redisUrl, token: redisToken }),
    limiter: Ratelimit.slidingWindow(limit, '1 h'),
    analytics: true,
    prefix: 'nudge:generate-v3',
  });

  const { success, reset } = await ratelimit.limit(userId);
  return { allowed: success, resetAt: reset };
}

export async function POST(request: Request) {
  const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!;
  const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY!;
  const cookieStore = cookies();

  const supabase = createServerSupabaseClient({
    get(name: string) { return cookieStore.get(name)?.value; },
    set(name: string, value: string, options: Record<string, unknown>) { try { cookieStore.set(name, value, options); } catch {} },
    remove(name: string, options: Record<string, unknown>) { try { cookieStore.set(name, '', options); } catch {} },
  });

  const db = createClient(supabaseUrl, supabaseServiceKey);

  const { data: { user } } = await supabase.auth.getUser();
  if (!user) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  const { data: profile } = await db
    .from('profiles')
    .select('plan')
    .eq('id', user.id)
    .maybeSingle();

  if (!profile) {
    await db.from('profiles').insert({
      id: user.id,
      full_name: user.email?.split('@')[0] || null,
      plan: 'free',
      onboarding_completed: false,
    });
  }

  const plan = (profile as { plan?: string })?.plan ?? 'free';

  const { isAdmin } = await import('@/lib/auth/isAdmin');
  const userIsAdmin = await isAdmin(user.id, db);

  let allowed = true;
  let resetAt: number | null = null;

  if (!userIsAdmin) {
    const rateLimitRes = await checkRateLimit(user.id, plan);
    allowed = rateLimitRes.allowed;
    resetAt = rateLimitRes.resetAt;
  }

  if (!allowed) {
    return NextResponse.json(
      { error: 'Generation limit reached', resetAt },
      { status: 429, headers: { 'Retry-After': String(Math.ceil(((resetAt ?? Date.now()) - Date.now()) / 1000)) } },
    );
  }

  const body = await request.json();
  const parsed = generateSchema.safeParse(body);

  if (!parsed.success) {
    return NextResponse.json(
      { error: parsed.error.issues[0]?.message ?? 'Invalid input' },
      { status: 400 },
    );
  }

  const input = parsed.data;
  const baseSlug = slugify(input.business_name);
  const slug = await uniqueSlug(db, baseSlug);
  const storeId = randomUUID();

  // 1. Create the store immediately in draft status with null ai_config (signals building state)
  const { error: storeError } = await db
    .from('stores')
    .insert({
      id: storeId,
      owner_id: user.id,
      name: input.business_name,
      slug,
      description: input.description,
      business_type: input.business_type,
      ai_config: null, // null indicates building state
      currency: 'INR',
      delivery_fee: 0,
      status: 'draft',
    });

  if (storeError) {
    return NextResponse.json({ error: storeError.message ?? 'Failed to create store record' }, { status: 500 });
  }

  // 2. Mark onboarding as completed immediately so middleware allows user to dashboard/builder
  await db
    .from('profiles')
    .update({ onboarding_completed: true })
    .eq('id', user.id);

  // Injects _store_id and _slug into input before calling pipeline
  const pipelineInput = {
    ...input,
    _store_id: storeId,
    _slug: slug,
  };

  // 3. Spawn V3 pipeline execution in the background
  generateStoreV3InBackground(db, storeId, user.id, pipelineInput, slug).catch((err) => {
    console.error('Unhandled background V3 store generation crash:', err);
  });

  // 4. Return success response immediately
  return NextResponse.json({
    success: true,
    store_id: storeId,
    slug,
    preview_url: `/onboard/preview?store=${storeId}`,
  });
}

async function generateStoreV3InBackground(
  db: any,
  storeId: string,
  userId: string,
  input: any,
  slug: string
) {
  try {
    const result = await runPipelineV3(input, db);

    if (result.success) {
      const pipelineRes = result.winning_worker.pipeline_result;

      // Insert theme from design output
      const { error: themeError } = await db.from('store_themes').insert({
        store_id: storeId,
        primary_color: pipelineRes.design.primary_color,
        accent_color: pipelineRes.design.accent_color,
        background_color: pipelineRes.design.background_color,
        font_style: fontStyleFromHeading(pipelineRes.design.font_heading),
        hero_headline: pipelineRes.content.hero_headline,
        hero_subheading: pipelineRes.content.hero_subheadline,
        sections_order: pipelineRes.research.common_sections,
        sections_enabled: {
          hero: true,
          products: true,
          about: true,
          contact: true,
        },
      });

      if (themeError) {
        console.error('Theme creation failed for V3 store:', themeError);
      }

      // Insert products
      for (let i = 0; i < input.products.length; i++) {
        const p = input.products[i];
        const { data: product, error: productError } = await db.from('products').insert({
          store_id: storeId,
          name: p.name,
          slug: slugify(p.name),
          description: p.description || '',
          price: p.price,
          category: input.business_type,
          is_featured: i === 0,
          sort_order: i,
        }).select('id').single();

        if (productError) {
          console.error('Product creation failed for V3 store:', productError);
        } else if (product && p.image_url) {
          const { error: imageError } = await db.from('product_images').insert({
            product_id: product.id,
            url: p.image_url,
            alt_text: p.name,
            sort_order: 0,
            is_primary: true,
          });

          if (imageError) {
            console.error('Product image creation failed for V3 store:', imageError);
          }
        }
      }

      // Update store details and config last to signal completion
      const { error: storeUpdateError } = await db
        .from('stores')
        .update({
          ai_config: pipelineRes as unknown as Record<string, unknown>,
        })
        .eq('id', storeId);

      if (storeUpdateError) {
        throw storeUpdateError;
      }

      // Log generation to ai_generation_logs
      await db.from('ai_generation_logs').insert({
        owner_id: userId,
        store_id: storeId,
        input_payload: input as unknown as Record<string, unknown>,
        output_config: pipelineRes as unknown as Record<string, unknown>,
        model_used: Object.values(result.models_selected).join(', '),
        tokens_used: null,
        duration_ms: result.total_duration_ms,
        success: true,
        error_message: null,
      });
    } else {
      // Pipeline failed completely - save failure status in config
      await db
        .from('stores')
        .update({
          ai_config: { error: 'Pipeline V3 failed completely', success: false } as any,
        })
        .eq('id', storeId);

      await db.from('ai_generation_logs').insert({
        owner_id: userId,
        store_id: storeId,
        input_payload: input as unknown as Record<string, unknown>,
        output_config: null,
        model_used: '',
        tokens_used: null,
        duration_ms: 0,
        success: false,
        error_message: 'Pipeline V3 execution failed',
      });
    }
  } catch (err) {
    console.error('Background V3 store generation crashed:', err);
    // Mark the store with an error status in ai_config so UI can show it
    await db
      .from('stores')
      .update({
        ai_config: { error: err instanceof Error ? err.message : 'Pipeline crashed', success: false } as any,
      })
      .eq('id', storeId);

    await db.from('ai_generation_logs').insert({
      owner_id: userId,
      store_id: storeId,
      input_payload: input as unknown as Record<string, unknown>,
      output_config: null,
      model_used: '',
      tokens_used: null,
      duration_ms: 0,
      success: false,
      error_message: err instanceof Error ? err.message : String(err),
    });
  }
}
