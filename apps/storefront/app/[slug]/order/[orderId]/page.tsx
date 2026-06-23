import { createClient } from '@supabase/supabase-js'
import { notFound } from 'next/navigation'
import OrderClient from './OrderClient'

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
const supabase = createClient(supabaseUrl, supabaseAnonKey)

async function getOrder(slug: string, orderId: string) {
  const { data: store } = await supabase
    .from('stores')
    .select('id, slug, name, whatsapp_number')
    .eq('slug', slug)
    .single()

  if (!store) return null

  const { data: order } = await supabase
    .from('orders')
    .select('*')
    .eq('id', orderId)
    .eq('store_id', store.id)
    .single()

  if (!order) return null

  const { data: items } = await supabase
    .from('order_items')
    .select('*')
    .eq('order_id', order.id)

  return { store, order, items: items || [] }
}

export default async function OrderPage({
  params,
}: {
  params: { slug: string; orderId: string }
}) {
  const data = await getOrder(params.slug, params.orderId)
  if (!data) notFound()

  return <OrderClient data={data} />
}
