import { NextResponse } from 'next/server'
import { createClient } from '@supabase/supabase-js'
import crypto from 'crypto'

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY!
const supabase = createClient(supabaseUrl, supabaseServiceKey)

export async function POST(request: Request) {
  try {
    const body = await request.json()
    const { storeId, items, customer, address } = body

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

    const productIds = items.map((i: any) => i.productId)
    const { data: dbProducts } = await supabase
      .from('products')
      .select('*')
      .in('id', productIds)

    if (!dbProducts || dbProducts.length !== productIds.length) {
      return NextResponse.json({ error: 'Some products not found' }, { status: 400 })
    }

    const productMap = new Map(dbProducts.map((p) => [p.id, p]))

    for (const item of items) {
      const dbP = productMap.get(item.productId)
      if (!dbP) {
        return NextResponse.json({ error: `Product ${item.productId} not found` }, { status: 400 })
      }
      if (dbP.stock_status === 'out_of_stock') {
        return NextResponse.json({ error: `${dbP.name} is out of stock` }, { status: 400 })
      }
      if (dbP.stock_quantity !== null && item.quantity > dbP.stock_quantity) {
        return NextResponse.json({ error: `Only ${dbP.stock_quantity} of ${dbP.name} available` }, { status: 400 })
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
        status: 'pending',
        payment_method: 'online',
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

    const { error: itemsError } = await supabase.from('order_items').insert(orderItems)
    if (itemsError) {
      console.error('Failed to insert order items:', itemsError)
    }

    if (dbProducts.some((p) => p.stock_quantity !== null)) {
      for (const p of dbProducts) {
        if (p.stock_quantity !== null) {
          const item = items.find((i: any) => i.productId === p.id)
          await supabase
            .from('products')
            .update({ stock_quantity: p.stock_quantity - (item?.quantity || 0) })
            .eq('id', p.id)
        }
      }
    }

    const razorpayKeyId = process.env.RAZORPAY_KEY_ID
    const razorpaySecret = process.env.RAZORPAY_KEY_SECRET

    if (razorpayKeyId && razorpaySecret) {
      const razorpayAuth = Buffer.from(`${razorpayKeyId}:${razorpaySecret}`).toString('base64')
      const rzpRes = await fetch('https://api.razorpay.com/v1/orders', {
        method: 'POST',
        headers: {
          Authorization: `Basic ${razorpayAuth}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          amount: Math.round(total * 100),
          currency: 'INR',
          receipt: order.id.slice(0, 40),
          notes: { order_id: order.id, store_id: storeId },
        }),
      })

      const rzpData = await rzpRes.json()

      if (rzpRes.ok && rzpData.id) {
        await supabase.from('payments').insert({
          order_id: order.id,
          razorpay_order_id: rzpData.id,
          amount: total,
          status: 'pending',
        })

        return NextResponse.json({
          orderId: order.id,
          razorpayOrderId: rzpData.id,
          razorpayKeyId,
          amount: rzpData.amount,
          currency: 'INR',
          storeName: store.name,
          customerName: customer.name,
          customerPhone: customer.phone,
          customerEmail: customer.email,
        })
      }
      console.error('Razorpay order creation failed:', rzpData)
    }

    return NextResponse.json({ orderId: order.id })
  } catch (err) {
    console.error('Checkout error:', err)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}
