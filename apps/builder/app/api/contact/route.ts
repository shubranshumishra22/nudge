import { NextResponse } from 'next/server'
import { createClient } from '@supabase/supabase-js'
import { z } from 'zod'

const contactSchema = z.object({
  name: z.string().min(2).max(60),
  email: z.string().email(),
  business_type: z.enum([
    'Coffee Shop', 'Bakery', 'Clothing Brand', 'Fitness',
    'Handmade Products', 'Restaurant', 'Beauty', 'Other'
  ]),
  message: z.string().min(20).max(1000)
})

async function checkRateLimit(ip: string): Promise<boolean> {
  const redisUrl = process.env.UPSTASH_REDIS_REST_URL
  const redisToken = process.env.UPSTASH_REDIS_REST_TOKEN

  if (!redisUrl || !redisToken) {
    return true
  }

  try {
    const { Ratelimit } = await import('@upstash/ratelimit')
    const { Redis } = await import('@upstash/redis')

    const ratelimit = new Ratelimit({
      redis: new Redis({ url: redisUrl, token: redisToken }),
      limiter: Ratelimit.slidingWindow(3, '1 h'),
      analytics: true,
      prefix: 'contact',
    })

    const { success } = await ratelimit.limit(ip)
    return success
  } catch (err) {
    console.error('Rate limiting error:', err)
    return true
  }
}

export async function POST(request: Request) {
  try {
    const ip = request.headers.get('x-forwarded-for') ?? 'unknown'
    const allowed = await checkRateLimit(ip)
    if (!allowed) {
      return NextResponse.json(
        { error: 'Too many messages. Try again later.' },
        { status: 429 }
      )
    }

    const body = await request.json()
    const parsed = contactSchema.safeParse(body)
    if (!parsed.success) {
      return NextResponse.json(
        { error: parsed.error.issues[0]?.message ?? 'Invalid input' },
        { status: 400 }
      )
    }

    const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!
    const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY!
    const db = createClient(supabaseUrl, supabaseServiceKey)

    const { name, email, business_type, message } = parsed.data

    const { error } = await db.from('contact_messages').insert({
      name,
      email,
      business_type,
      message,
      ip_address: ip,
      status: 'unread'
    })

    if (error) {
      console.error('Error inserting contact message:', error)
      return NextResponse.json({ error: 'Failed to save message' }, { status: 500 })
    }

    return NextResponse.json({ success: true })
  } catch (err) {
    console.error('Contact handler error:', err)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}
