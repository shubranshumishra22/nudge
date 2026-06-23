'use client'

import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { useStore } from '@/components/StoreProvider'
import { useCart } from '@/store/cart'

declare global {
  interface Window {
    Razorpay: any
  }
}

interface FormData {
  name: string
  phone: string
  email: string
  line1: string
  line2: string
  city: string
  state: string
  pincode: string
}

export default function CheckoutPage() {
  const { store, theme } = useStore()
  const { items, subtotal, clearCart } = useCart()
  const router = useRouter()
  const [form, setForm] = useState<FormData>({
    name: '', phone: '+91', email: '', line1: '', line2: '', city: '', state: '', pincode: '',
  })
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')
  const [method, setMethod] = useState<'online' | 'cod'>('online')

  const codEnabled = (store as any).cod_enabled === true

  useEffect(() => {
    if (form.pincode.length === 6 && form.pincode.match(/^\d{6}$/)) {
      fetch(`https://api.postalpincode.in/pincode/${form.pincode}`)
        .then((r) => r.json())
        .then((data) => {
          if (data?.[0]?.Status === 'Success') {
            const post = data[0].PostOffice[0]
            setForm((f) => ({
              ...f,
              city: post.District || f.city,
              state: post.State || f.state,
            }))
          }
        })
        .catch(() => {})
    }
  }, [form.pincode])

  function validate() {
    if (!form.name || !form.phone || form.phone.length < 10 || !form.line1 || !form.city || !form.state || form.pincode.length !== 6) {
      setError('Please fill in all required fields')
      return false
    }
    return true
  }

  async function handleRazorpay() {
    setLoading(true)
    setError('')

    try {
      const res = await fetch('/api/checkout/create', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          storeId: store.id,
          items: items.map((i) => ({
            productId: i.productId,
            name: i.name,
            price: i.price,
            image: i.image,
            quantity: i.quantity,
          })),
          customer: { name: form.name, phone: form.phone, email: form.email || undefined },
          address: {
            line1: form.line1,
            line2: form.line2,
            city: form.city,
            state: form.state,
            pincode: form.pincode,
          },
        }),
      })

      const data = await res.json()
      if (!res.ok) throw new Error(data.error || 'Failed to create order')

      if (data.razorpayOrderId && typeof window.Razorpay !== 'undefined') {
        const options = {
          key: data.razorpayKeyId,
          amount: data.amount,
          currency: 'INR',
          name: store.name,
          order_id: data.razorpayOrderId,
          prefill: { name: form.name, contact: form.phone, email: form.email },
          handler: async function (response: any) {
            const verifyRes = await fetch('/api/checkout/verify', {
              method: 'POST',
              headers: { 'Content-Type': 'application/json' },
              body: JSON.stringify({
                orderId: data.orderId,
                razorpayOrderId: response.razorpay_order_id,
                razorpayPaymentId: response.razorpay_payment_id,
                razorpaySignature: response.razorpay_signature,
              }),
            })
            const verifyData = await verifyRes.json()
            if (verifyRes.ok) {
              clearCart()
              router.push(`/${store.slug}/order/${data.orderId}`)
            } else {
              setError(verifyData.error || 'Payment verification failed')
            }
          },
          modal: { ondismiss: () => setLoading(false) },
        }
        const rzp = new window.Razorpay(options)
        rzp.open()
      } else {
        clearCart()
        router.push(`/${store.slug}/order/${data.orderId}`)
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Something went wrong')
      setLoading(false)
    }
  }

  async function handleCod() {
    setLoading(true)
    setError('')

    try {
      const res = await fetch('/api/checkout/cod', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          storeId: store.id,
          items: items.map((i) => ({
            productId: i.productId,
            name: i.name,
            price: i.price,
            image: i.image,
            quantity: i.quantity,
          })),
          customer: { name: form.name, phone: form.phone, email: form.email || undefined },
          address: {
            line1: form.line1,
            line2: form.line2,
            city: form.city,
            state: form.state,
            pincode: form.pincode,
          },
        }),
      })

      const data = await res.json()
      if (!res.ok) throw new Error(data.error || 'Failed to place order')

      clearCart()
      router.push(`/${store.slug}/order/${data.orderId}`)
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Something went wrong')
      setLoading(false)
    }
  }

  async function handlePlaceOrder() {
    if (!validate()) return
    if (method === 'cod') {
      await handleCod()
    } else {
      await handleRazorpay()
    }
  }

  if (items.length === 0) {
    return (
      <div className="mx-auto max-w-6xl px-4 py-16 text-center">
        <p className="text-muted-foreground">Your cart is empty.</p>
        <button
          onClick={() => router.push(`/${store.slug}`)}
          className="mt-4 text-sm font-medium underline underline-offset-2"
        >
          Continue shopping
        </button>
      </div>
    )
  }

  const deliveryFee = subtotal >= (store.free_delivery_above || Infinity) ? 0 : store.delivery_fee
  const total = subtotal + deliveryFee

  const inputClass = 'w-full rounded-[10px] border border-input bg-white px-4 py-3 text-sm outline-none transition-colors focus:border-foreground focus:ring-1 focus:ring-foreground'
  const labelClass = 'mb-1.5 block text-sm font-medium text-foreground'

  return (
    <div className="mx-auto max-w-6xl px-4 py-8">
      <h1 className="font-serif text-3xl font-bold tracking-tight">Checkout</h1>

      {error && (
        <div className="mt-4 rounded-lg bg-red-50 px-4 py-3 text-sm text-red-600">{error}</div>
      )}

      <div className="mt-8 grid gap-8 md:grid-cols-5">
        <div className="md:col-span-3">
          <div className="space-y-5">
            <div className="grid gap-4 md:grid-cols-2">
              <div>
                <label className={labelClass}>Full name *</label>
                <input className={inputClass} placeholder="John Doe" value={form.name} onChange={(e) => setForm({ ...form, name: e.target.value })} required />
              </div>
              <div>
                <label className={labelClass}>Phone *</label>
                <input className={inputClass} placeholder="+91 98765 43210" value={form.phone} onChange={(e) => setForm({ ...form, phone: e.target.value })} required />
              </div>
            </div>
            <div>
              <label className={labelClass}>Email</label>
              <input className={inputClass} type="email" placeholder="john@example.com" value={form.email} onChange={(e) => setForm({ ...form, email: e.target.value })} />
            </div>
            <div>
              <label className={labelClass}>Address line 1 *</label>
              <input className={inputClass} placeholder="Street address" value={form.line1} onChange={(e) => setForm({ ...form, line1: e.target.value })} required />
            </div>
            <div>
              <label className={labelClass}>Address line 2</label>
              <input className={inputClass} placeholder="Apartment, floor, etc." value={form.line2} onChange={(e) => setForm({ ...form, line2: e.target.value })} />
            </div>
            <div className="grid gap-4 md:grid-cols-3">
              <div>
                <label className={labelClass}>Pincode *</label>
                <input className={inputClass} placeholder="6-digit" maxLength={6} value={form.pincode} onChange={(e) => setForm({ ...form, pincode: e.target.value.replace(/\D/g, '') })} required />
              </div>
              <div>
                <label className={labelClass}>City *</label>
                <input className={inputClass} value={form.city} onChange={(e) => setForm({ ...form, city: e.target.value })} required />
              </div>
              <div>
                <label className={labelClass}>State *</label>
                <input className={inputClass} value={form.state} onChange={(e) => setForm({ ...form, state: e.target.value })} required />
              </div>
            </div>

            {codEnabled && (
              <div className="flex items-center gap-4 rounded-xl border bg-white p-4">
                <label className="flex items-center gap-3 cursor-pointer">
                  <input
                    type="radio"
                    name="payment"
                    checked={method === 'online'}
                    onChange={() => setMethod('online')}
                    className="h-4 w-4"
                  />
                  <div>
                    <p className="text-sm font-medium">Pay online</p>
                    <p className="text-xs text-muted-foreground">Credit card, UPI, Net Banking</p>
                  </div>
                </label>
                <label className="flex items-center gap-3 cursor-pointer">
                  <input
                    type="radio"
                    name="payment"
                    checked={method === 'cod'}
                    onChange={() => setMethod('cod')}
                    className="h-4 w-4"
                  />
                  <div>
                    <p className="text-sm font-medium">Cash on delivery</p>
                    <p className="text-xs text-muted-foreground">Pay when you receive</p>
                  </div>
                </label>
              </div>
            )}

            <button
              onClick={handlePlaceOrder}
              disabled={loading}
              className="w-full rounded-[10px] py-3 text-sm font-semibold text-white transition-opacity hover:opacity-90 disabled:opacity-50"
              style={{ backgroundColor: theme.primary_color }}
            >
              {loading
                ? 'Processing...'
                : method === 'cod'
                ? `Place order (COD) — ₹${total.toLocaleString('en-IN')}`
                : `Pay ₹${total.toLocaleString('en-IN')}`}
            </button>
          </div>
        </div>

        <div className="md:col-span-2">
          <div className="sticky top-24 rounded-xl border bg-white p-6">
            <h2 className="text-lg font-semibold">Order summary</h2>
            <div className="mt-4 space-y-3">
              {items.map((item) => (
                <div key={item.productId} className="flex gap-3">
                  <div className="h-14 w-14 flex-shrink-0 overflow-hidden rounded-lg bg-muted">
                    {item.image ? (
                      <img src={item.image} alt={item.name} className="h-full w-full object-cover" />
                    ) : (
                      <div className="flex h-full items-center justify-center text-muted-foreground">
                        <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5"><rect x="3" y="3" width="18" height="18" rx="2"/><circle cx="8.5" cy="8.5" r="1.5"/><path d="m3 16 4-4 3 3 5-5 6 6"/></svg>
                      </div>
                    )}
                  </div>
                  <div className="flex-1">
                    <p className="text-sm font-medium">{item.name}</p>
                    <p className="text-xs text-muted-foreground">Qty: {item.quantity}</p>
                  </div>
                  <p className="text-sm font-medium">₹{(item.price * item.quantity).toLocaleString('en-IN')}</p>
                </div>
              ))}
            </div>
            <div className="mt-6 space-y-2 border-t pt-4 text-sm">
              <div className="flex justify-between">
                <span className="text-muted-foreground">Subtotal</span>
                <span>₹{subtotal.toLocaleString('en-IN')}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-muted-foreground">Delivery</span>
                <span>{deliveryFee === 0 ? 'Free' : `₹${deliveryFee.toLocaleString('en-IN')}`}</span>
              </div>
              <div className="flex justify-between border-t pt-2 font-semibold">
                <span>Total</span>
                <span>₹{total.toLocaleString('en-IN')}</span>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
