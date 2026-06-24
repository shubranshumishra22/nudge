import { NextResponse } from 'next/server'
import { verifyAdminAuth } from '@/lib/auth/adminAuthCheck'

export async function GET(request: Request) {
  const { authorized, db } = await verifyAdminAuth()
  if (!authorized) {
    return NextResponse.json({ error: 'Forbidden' }, { status: 403 })
  }

  const { searchParams } = new URL(request.url)
  const status = searchParams.get('status') || 'All'

  try {
    let query = db.from('contact_messages').select('*')

    if (status !== 'All') {
      query = query.eq('status', status.toLowerCase())
    }

    const { data: messages, error } = await query.order('created_at', { ascending: false })

    if (error) {
      console.error('Error fetching contact messages:', error)
      return NextResponse.json({ error: error.message }, { status: 500 })
    }

    return NextResponse.json(messages)
  } catch (err) {
    console.error('Messages API endpoint error:', err)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}
