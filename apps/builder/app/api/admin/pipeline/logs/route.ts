import { NextResponse } from 'next/server'
import { verifyAdminAuth } from '@/lib/auth/adminAuthCheck'

export async function GET(request: Request) {
  const { authorized, db } = await verifyAdminAuth()
  if (!authorized) {
    return NextResponse.json({ error: 'Forbidden' }, { status: 403 })
  }

  const { searchParams } = new URL(request.url)
  const success = searchParams.get('success') // 'true' or 'false' or null

  try {
    let query = db.from('ai_generation_logs').select('*')

    if (success === 'true') {
      query = query.eq('success', true)
    } else if (success === 'false') {
      query = query.eq('success', false)
    }

    const { data: logs, error } = await query
      .order('created_at', { ascending: false })
      .limit(50)

    if (error) {
      console.error('Error fetching generation logs:', error)
      return NextResponse.json({ error: error.message }, { status: 500 })
    }

    return NextResponse.json(logs)
  } catch (err) {
    console.error('Pipeline logs error:', err)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}
