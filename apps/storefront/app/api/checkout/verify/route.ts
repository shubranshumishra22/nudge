import { NextResponse } from 'next/server'
import { createClient } from '@supabase/supabase-js'
import crypto from 'crypto'

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY!
const supabase = createClient(supabaseUrl, supabaseServiceKey)

async function triggerNotifications(orderId: string) {
  try {
    const { notifyStoreOwner, notifyCustomer } = await import('@/lib/notifications')
    notifyStoreOwner(orderId)
    notifyCustomer(orderId)
  } catch {}
}

export async function POST(request: Request) {
  try {
    const text = await request.text()
    const sigHeader = request.headers.get('x-razorpay-signature')
    const webhookSecret = process.env.RAZORPAY_WEBHOOK_SECRET

    if (webhookSecret && sigHeader) {
      const expectedSig = crypto
        .createHmac('sha256', webhookSecret)
        .update(text)
        .digest('hex')

      if (expectedSig !== sigHeader) {
        return NextResponse.json({ error: 'Invalid signature' }, { status: 400 })
      }
    }

    const payload = JSON.parse(text)
    const event = payload.event
    const entity = payload.payload?.payment?.entity

    if (!entity) {
      return NextResponse.json({ ok: true })
    }

    const razorpayOrderId = entity.order_id
    const razorpayPaymentId = entity.id

    if (event === 'payment.captured') {
      const { data: payment } = await supabase
        .from('payments')
        .select('order_id')
        .eq('razorpay_order_id', razorpayOrderId)
        .single()

      if (payment) {
        await supabase
          .from('payments')
          .update({
            razorpay_payment_id: razorpayPaymentId,
            status: 'captured',
            method: entity.method || null,
            captured_at: new Date().toISOString(),
          })
          .eq('razorpay_order_id', razorpayOrderId)

        await supabase
          .from('orders')
          .update({ status: 'confirmed' })
          .eq('id', payment.order_id)

        triggerNotifications(payment.order_id)
      }
    } else if (event === 'payment.failed') {
      const { data: payment } = await supabase
        .from('payments')
        .select('order_id')
        .eq('razorpay_order_id', razorpayOrderId)
        .single()

      if (payment) {
        await supabase
          .from('payments')
          .update({
            status: 'failed',
            error_code: entity.error_code || null,
            error_description: entity.error_description || null,
          })
          .eq('razorpay_order_id', razorpayOrderId)

        await supabase
          .from('orders')
          .update({ status: 'cancelled' })
          .eq('id', payment.order_id)
      }
    }

    return NextResponse.json({ ok: true })
  } catch (err) {
    console.error('Webhook error:', err)
    return NextResponse.json({ ok: true })
  }
}
