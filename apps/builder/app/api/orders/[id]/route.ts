import { NextResponse } from 'next/server'
import { createClient } from '@supabase/supabase-js'

export async function PATCH(request: Request, { params }: { params: { id: string } }) {
  const supabase = createClient(process.env.NEXT_PUBLIC_SUPABASE_URL!, process.env.SUPABASE_SERVICE_ROLE_KEY!)
  try {
    const body = await request.json()
    const updates: any = {}
    if (body.status) updates.status = body.status
    if (body.owner_notes !== undefined) updates.owner_notes = body.owner_notes

    const { error } = await supabase.from('orders').update(updates).eq('id', params.id)
    if (error) return NextResponse.json({ error: error.message }, { status: 500 })
    return NextResponse.json({ success: true })
  } catch (err) { return NextResponse.json({ error: 'Internal error' }, { status: 500 }) }
}
