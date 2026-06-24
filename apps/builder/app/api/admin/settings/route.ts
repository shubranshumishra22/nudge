import { NextResponse } from 'next/server'
import { verifyAdminAuth } from '@/lib/auth/adminAuthCheck'

export async function GET() {
  const { authorized, db } = await verifyAdminAuth()
  if (!authorized) {
    return NextResponse.json({ error: 'Forbidden' }, { status: 403 })
  }

  try {
    // 1. Fetch settings
    const { data: dbSettings, error: settingsErr } = await db
      .from('admin_settings')
      .select('*')

    if (settingsErr) {
      console.error('Error fetching admin settings:', settingsErr)
      return NextResponse.json({ error: settingsErr.message }, { status: 500 })
    }

    const settings: Record<string, string> = {}
    if (dbSettings) {
      for (const s of dbSettings) {
        settings[s.key] = s.value
      }
    }

    // 2. Fetch row counts
    const tables = ['profiles', 'stores', 'products', 'orders', 'contact_messages', 'ai_generation_logs']
    const rowCounts: Record<string, number> = {}

    for (const t of tables) {
      const { count, error } = await db
        .from(t)
        .select('*', { count: 'exact', head: true })
      
      rowCounts[t] = error ? 0 : (count || 0)
    }

    // 3. Environment check
    const envVars = [
      'NEXT_PUBLIC_SUPABASE_URL',
      'SUPABASE_SERVICE_ROLE_KEY',
      'OPENROUTER_API_KEY',
      'UPSTASH_REDIS_REST_URL',
      'UPSTASH_REDIS_REST_TOKEN',
      'NEXT_PUBLIC_STOREFRONT_URL'
    ]
    const envStatus: Record<string, boolean> = {}
    for (const key of envVars) {
      envStatus[key] = !!process.env[key]
    }

    return NextResponse.json({
      settings,
      rowCounts,
      envStatus,
      dbConnected: true
    })
  } catch (err) {
    console.error('Settings GET API error:', err)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}

export async function PATCH(request: Request) {
  const { authorized, db } = await verifyAdminAuth()
  if (!authorized) {
    return NextResponse.json({ error: 'Forbidden' }, { status: 403 })
  }

  try {
    const body = await request.json()
    const { key, value } = body

    if (!key || value === undefined) {
      return NextResponse.json({ error: 'Key and value required' }, { status: 400 })
    }

    const { error } = await db
      .from('admin_settings')
      .upsert({
        key,
        value: String(value),
        updated_at: new Date().toISOString()
      })

    if (error) {
      console.error('Error saving admin setting:', error)
      return NextResponse.json({ error: error.message }, { status: 500 })
    }

    return NextResponse.json({ success: true, key, value })
  } catch (err) {
    console.error('Settings PATCH API error:', err)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}
