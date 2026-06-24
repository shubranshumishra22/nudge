import { NextResponse } from 'next/server'
import { verifyAdminAuth } from '@/lib/auth/adminAuthCheck'

interface ActivityEvent {
  type: string
  description: string
  timestamp: string
  iconType: 'green' | 'blue' | 'purple' | 'yellow' | 'red' | 'white' | 'orange'
}

export async function GET() {
  const { authorized, db } = await verifyAdminAuth()
  if (!authorized) {
    return NextResponse.json({ error: 'Forbidden' }, { status: 403 })
  }

  try {
    const events: ActivityEvent[] = []

    // 1. Fetch profiles for signups
    const { data: profiles } = await db
      .from('profiles')
      .select('id, full_name, plan, created_at')
      .order('created_at', { ascending: false })
      .limit(10)

    if (profiles) {
      for (const p of profiles) {
        events.push({
          type: 'user_signup',
          description: `New user signed up: ${p.full_name || 'Someone'} joined`,
          timestamp: p.created_at,
          iconType: 'purple'
        })
        if (p.plan === 'pro') {
          events.push({
            type: 'pro_upgrade',
            description: `Pro upgrade: ${p.full_name || 'Someone'} upgraded to Pro`,
            timestamp: p.created_at, // Approximating timestamp for demo
            iconType: 'white'
          })
        }
      }
    }

    // 2. Fetch stores for creations/publishes
    const { data: stores } = await db
      .from('stores')
      .select('name, created_at, status, owner_id')
      .order('created_at', { ascending: false })
      .limit(10)

    if (stores) {
      for (const s of stores) {
        events.push({
          type: 'store_create',
          description: `New store created: "${s.name}"`,
          timestamp: s.created_at,
          iconType: 'green'
        })
        if (s.status === 'live') {
          events.push({
            type: 'store_published',
            description: `Store published: "${s.name}" is now live`,
            timestamp: s.created_at,
            iconType: 'blue'
          })
        }
      }
    }

    // 3. Fetch orders
    const { data: orders } = await db
      .from('orders')
      .select('id, total, created_at, store_id, stores(name)')
      .order('created_at', { ascending: false })
      .limit(10)

    if (orders) {
      for (const o of orders) {
        const storeName = (o.stores as any)?.name || 'a store'
        events.push({
          type: 'order_placed',
          description: `New order: ₹${Number(o.total).toFixed(2)} order on "${storeName}"`,
          timestamp: o.created_at,
          iconType: 'yellow'
        })
      }
    }

    // 4. Fetch contact messages
    const { data: messages } = await db
      .from('contact_messages')
      .select('name, business_type, created_at')
      .order('created_at', { ascending: false })
      .limit(10)

    if (messages) {
      for (const m of messages) {
        events.push({
          type: 'message_received',
          description: `New message: Message from ${m.name} (${m.business_type || 'General'})`,
          timestamp: m.created_at,
          iconType: 'orange'
        })
      }
    }

    // 5. Fetch AI generation failures
    const { data: aiLogs } = await db
      .from('ai_generation_logs')
      .select('created_at, input_payload, error_message')
      .eq('success', false)
      .order('created_at', { ascending: false })
      .limit(10)

    if (aiLogs) {
      for (const log of aiLogs) {
        const bizType = (log.input_payload as any)?.business_type || 'store'
        events.push({
          type: 'ai_failed',
          description: `AI generation failed: Generation failed for ${bizType}`,
          timestamp: log.created_at,
          iconType: 'red'
        })
      }
    }

    // Sort by timestamp desc, limit to 20
    const sortedEvents = events
      .sort((a, b) => new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime())
      .slice(0, 20)

    return NextResponse.json(sortedEvents)
  } catch (err) {
    console.error('Activity endpoint error:', err)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}
