import { NextResponse } from 'next/server'
import { createClient } from '@supabase/supabase-js'

function getDb() {
  return createClient(process.env.NEXT_PUBLIC_SUPABASE_URL!, process.env.SUPABASE_SERVICE_ROLE_KEY!)
}

export async function PATCH(request: Request, { params }: { params: { id: string } }) {
  try {
    const body = await request.json()
    const { error } = await getDb().from('store_themes').update(body).eq('store_id', params.id)
    if (error) return NextResponse.json({ error: error.message }, { status: 500 })
    return NextResponse.json({ success: true })
  } catch (err) { return NextResponse.json({ error: 'Internal error' }, { status: 500 }) }
}

export async function DELETE(request: Request, { params }: { params: { id: string } }) {
  try {
    const supabase = getDb()
    await supabase.from('order_items').delete().eq('order_id', params.id)
    await supabase.from('orders').delete().eq('store_id', params.id)
    await supabase.from('products').delete().eq('store_id', params.id)
    await supabase.from('store_themes').delete().eq('store_id', params.id)
    await supabase.from('store_domains').delete().eq('store_id', params.id)
    await supabase.from('stores').delete().eq('id', params.id)
    return NextResponse.json({ success: true })
  } catch (err) { return NextResponse.json({ error: 'Internal error' }, { status: 500 }) }
}
