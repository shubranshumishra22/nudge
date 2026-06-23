import { NextResponse } from 'next/server'
import { createClient } from '@supabase/supabase-js'

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY!
const supabase = createClient(supabaseUrl, supabaseServiceKey)

export async function POST(request: Request) {
  try {
    const { storeId, items, customer, address } = await request.json()

    if (!storeId || !items?.length || !customer?.name || !address) {
      return NextResponse.json({ error: 'Missing required fields' }, { status: 400 })
    }

    const { data: store } = await supabase
      .from('stores')
      .select('*')
      .eq('id', storeId)
      .single()

    if (!store) {
      return NextResponse.json({ error: 'Store not found' }, { status: 404 })
    }

    if (!store.cod_enabled) {
      return NextResponse.json({ error: 'COD not available for this store' }, { status: 400 })
    }

    const productIds = items.map((i: any) => i.productId)
    const { data: dbProducts } = await supabase
      .from('products')
      .select('*')
      .in('id', productIds)

    if (!dbProducts || dbProducts.length !== productIds.length) {
      return NextResponse.json({ error: 'Some products not found' }, { status: 400 })
    }

    for (const item of items) {
      const dbP = dbProducts.find((p) => p.id === item.productId)
      if (dbP?.stock_status === 'out_of_stock') {
        return NextResponse.json({ error: `${dbP.name} is out of stock` }, { status: 400 })
      }
    }

    const subtotal = dbProducts.reduce((sum, p) => {
      const item = items.find((i: any) => i.productId === p.id)
      return sum + p.price * (item?.quantity || 0)
    }, 0)

    const deliveryFee = subtotal >= (store.free_delivery_above || Infinity) ? 0 : store.delivery_fee
    const total = subtotal + deliveryFee

    const { data: order, error: orderError } = await supabase
      .from('orders')
      .insert({
        store_id: storeId,
        customer_name: customer.name,
        customer_phone: customer.phone || null,
        customer_email: customer.email || null,
        delivery_address: address,
        subtotal,
        delivery_fee: deliveryFee,
        total,
        status: 'confirmed',
        payment_method: 'cod',
      })
      .select('id')
      .single()

    if (orderError || !order) {
      return NextResponse.json({ error: 'Failed to create order' }, { status: 500 })
    }

    const orderItems = dbProducts.map((p) => {
      const item = items.find((i: any) => i.productId === p.id)
      return {
        order_id: order.id,
        product_id: p.id,
        product_name: p.name,
        product_image: null,
        unit_price: p.price,
        quantity: item?.quantity || 0,
        total_price: p.price * (item?.quantity || 0),
      }
    })

    await supabase.from('order_items').insert(orderItems)

    try {
      const { notifyStoreOwner, notifyCustomer } = await import('@/lib/notifications')
      notifyStoreOwner(order.id)
      notifyCustomer(order.id)
    } catch {}

    return NextResponse.json({ orderId: order.id })
  } catch (err) {
    console.error('COD error:', err)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}
