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

  const storeId = params.id
  if (!storeId) {
    return NextResponse.json({ error: 'Store ID required' }, { status: 400 })
  }

  try {
    const body = await request.json()
    const { status } = body

    if (!['live', 'draft', 'suspended'].includes(status)) {
      return NextResponse.json({ error: 'Invalid status value' }, { status: 400 })
    }

    const { error } = await db
      .from('stores')
      .update({
        status,
        updated_at: new Date().toISOString()
      })
      .eq('id', storeId)

    if (error) {
      console.error('Error updating store status:', error)
      return NextResponse.json({ error: error.message }, { status: 500 })
    }

    return NextResponse.json({ success: true, status })
  } catch (err) {
    console.error('Store status update API error:', err)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}
