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

  const messageId = params.id
  if (!messageId) {
    return NextResponse.json({ error: 'Message ID required' }, { status: 400 })
  }

  try {
    const body = await request.json()
    const { status, admin_notes } = body

    const updates: Record<string, any> = {
      updated_at: new Date().toISOString()
    }

    if (status !== undefined) {
      if (!['unread', 'read', 'replied', 'archived'].includes(status)) {
        return NextResponse.json({ error: 'Invalid status' }, { status: 400 })
      }
      updates.status = status
    }

    if (admin_notes !== undefined) {
      updates.admin_notes = admin_notes
    }

    const { data, error } = await db
      .from('contact_messages')
      .update(updates)
      .eq('id', messageId)
      .select('*')
      .single()

    if (error) {
      console.error('Error updating contact message:', error)
      return NextResponse.json({ error: error.message }, { status: 500 })
    }

    return NextResponse.json({ success: true, message: data })
  } catch (err) {
    console.error('Message PATCH error:', err)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}

export async function DELETE(
  request: Request,
  { params }: { params: { id: string } }
) {
  const { authorized, db } = await verifyAdminAuth()
  if (!authorized) {
    return NextResponse.json({ error: 'Forbidden' }, { status: 403 })
  }

  const messageId = params.id
  if (!messageId) {
    return NextResponse.json({ error: 'Message ID required' }, { status: 400 })
  }

  try {
    const { error } = await db
      .from('contact_messages')
      .delete()
      .eq('id', messageId)

    if (error) {
      console.error('Error deleting contact message:', error)
      return NextResponse.json({ error: error.message }, { status: 500 })
    }

    return NextResponse.json({ success: true })
  } catch (err) {
    console.error('Message DELETE error:', err)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}
