'use client'

import { useEffect, useState } from 'react'
import Link from 'next/link'

function AnimatedCheckmark() {
  const [drawn, setDrawn] = useState(false)

  useEffect(() => {
    const t = setTimeout(() => setDrawn(true), 100)
    return () => clearTimeout(t)
  }, [])

  return (
    <svg width="80" height="80" viewBox="0 0 80 80" className="mx-auto">
      <circle
        cx="40" cy="40" r="36"
        fill="none"
        stroke="#22c55e"
        strokeWidth="4"
        strokeDasharray="226"
        strokeDashoffset={drawn ? '0' : '226'}
        style={{ transition: 'stroke-dashoffset 400ms ease' }}
      />
      <path
        d="M25 40l10 10 20-20"
        fill="none"
        stroke="#22c55e"
        strokeWidth="4"
        strokeLinecap="round"
        strokeLinejoin="round"
        strokeDasharray="50"
        strokeDashoffset={drawn ? '0' : '50'}
        style={{ transition: 'stroke-dashoffset 300ms ease 200ms' }}
      />
    </svg>
  )
}

export default function OrderClient({ data }: { data: any }) {
  const { store, order, items } = data

  const whatsappNumber = store.whatsapp_number?.replace(/[^0-9]/g, '')

  return (
    <div className="mx-auto max-w-2xl px-4 py-16 text-center">
      <AnimatedCheckmark />

      <h1 className="mt-6 font-serif text-3xl font-bold tracking-tight">
        Order confirmed!
      </h1>
      <p className="mt-2 text-muted-foreground">
        {order.order_number
          ? `Order #${order.order_number}`
          : 'Thank you for your order'}
      </p>

      <div className="mt-8 rounded-xl border bg-white p-6 text-left">
        <h2 className="text-sm font-semibold uppercase tracking-wide text-muted-foreground">
          Items
        </h2>
        <div className="mt-3 space-y-3">
          {items.map((item: any) => (
            <div key={item.id} className="flex justify-between text-sm">
              <span>
                {item.product_name}{' '}
                <span className="text-muted-foreground">x{item.quantity}</span>
              </span>
              <span className="font-medium">
                ₹{item.total_price.toLocaleString('en-IN')}
              </span>
            </div>
          ))}
        </div>
        <div className="mt-4 border-t pt-4 text-sm">
          <div className="flex justify-between">
            <span className="text-muted-foreground">Subtotal</span>
            <span>₹{order.subtotal.toLocaleString('en-IN')}</span>
          </div>
          {order.delivery_fee > 0 && (
            <div className="mt-1 flex justify-between">
              <span className="text-muted-foreground">Delivery</span>
              <span>₹{order.delivery_fee.toLocaleString('en-IN')}</span>
            </div>
          )}
          <div className="mt-1 flex justify-between font-semibold">
            <span>Total</span>
            <span>₹{order.total.toLocaleString('en-IN')}</span>
          </div>
        </div>

        {order.delivery_address && (
          <div className="mt-4 border-t pt-4 text-sm">
            <h3 className="font-medium">Delivering to</h3>
            <p className="mt-1 text-muted-foreground">
              {order.customer_name}
              <br />
              {(order.delivery_address as any).line1}
              {(order.delivery_address as any).line2 && <><br />{(order.delivery_address as any).line2}</>}
              <br />
              {(order.delivery_address as any).city}, {(order.delivery_address as any).state} — {(order.delivery_address as any).pincode}
            </p>
          </div>
        )}
      </div>

      <div className="mt-8 flex flex-col items-center gap-4">
        <Link
          href={`/${store.slug}`}
          className="text-sm font-medium underline underline-offset-2"
        >
          Continue shopping
        </Link>

        {whatsappNumber && (
          <a
            href={`https://wa.me/91${whatsappNumber}?text=Hi!%20I%20have%20a%20question%20about%20my%20order%20${order.order_number || ''}`}
            target="_blank"
            rel="noopener noreferrer"
            className="flex items-center gap-2 rounded-[10px] border border-input px-6 py-3 text-sm font-medium transition-colors hover:bg-accent"
          >
            <svg width="18" height="18" viewBox="0 0 24 24" fill="#25D366">
              <path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.29.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 01-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 01-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 012.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0012.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 005.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893a11.821 11.821 0 00-3.48-8.413z"/>
            </svg>
            Track your order on WhatsApp
          </a>
        )}
      </div>
    </div>
  )
}
