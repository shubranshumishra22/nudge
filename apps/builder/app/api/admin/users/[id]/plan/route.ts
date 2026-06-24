import { NextResponse } from 'next/server'
import { verifyAdminAuth } from '@/lib/auth/adminAuthCheck'

export async function PATCH(
  request: Request,
  { params }: { params: { id: string } }
) {
  const { authorized, db } = await verifyAdminAuth()
  if (!authorized) {
    return NextResponse.json({ error: 'Forbidden' }, { status: 403 })
  }

  const userId = params.id
  if (!userId) {
    return NextResponse.json({ error: 'User ID required' }, { status: 400 })
  }

  try {
    const body = await request.json()
    const { plan } = body

    if (!['free', 'pro', 'agency'].includes(plan)) {
      return NextResponse.json({ error: 'Invalid plan type' }, { status: 400 })
    }

    const expiresAt = plan === 'agency' 
      ? '2099-12-31 23:59:59+00' 
      : plan === 'pro' 
      ? new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toISOString() // 30 days expiry for pro demo
      : null

    const { error } = await db
      .from('profiles')
      .update({
        plan,
        plan_expires_at: expiresAt,
        updated_at: new Date().toISOString()
      })
      .eq('id', userId)

    if (error) {
      console.error('Error updating user plan:', error)
      return NextResponse.json({ error: error.message }, { status: 500 })
    }

    return NextResponse.json({ success: true, plan, expiresAt })
  } catch (err) {
    console.error('Plan update API error:', err)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}
