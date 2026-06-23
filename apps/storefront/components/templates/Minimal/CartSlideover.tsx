'use client'

import { useEffect, useRef } from 'react'
import Link from 'next/link'
import Image from 'next/image'
import { useStore } from '@/components/StoreProvider'
import { useCart } from '@/store/cart'

export default function CartSlideover({ open, onClose }: { open: boolean; onClose: () => void }) {
  const { store, theme } = useStore()
  const { items, itemCount, subtotal, updateQuantity, removeItem } = useCart()
  const overlayRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    if (open) document.body.style.overflow = 'hidden'
    else document.body.style.overflow = ''
    return () => { document.body.style.overflow = '' }
  }, [open])

  useEffect(() => {
    function handleKey(e: KeyboardEvent) { if (e.key === 'Escape') onClose() }
    window.addEventListener('keydown', handleKey)
    return () => window.removeEventListener('keydown', handleKey)
  }, [onClose])

  return (
    <>
      <div ref={overlayRef} className={`fixed inset-0 z-50 bg-black/40 transition-opacity duration-240 ${open ? 'opacity-100' : 'pointer-events-none opacity-0'}`} onClick={onClose} />
      <div className={`fixed right-0 top-0 z-50 flex h-full w-full flex-col bg-white shadow-xl transition-transform duration-240 ease-out md:w-[400px] ${open ? 'translate-x-0' : 'translate-x-full'}`}>
        <div className="flex items-center justify-between border-b px-4 py-4">
          <h2 className="text-lg font-semibold">Cart {itemCount > 0 && `(${itemCount})`}</h2>
          <button onClick={onClose} className="text-muted-foreground hover:text-foreground">
            <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round"><path d="M18 6 6 18"/><path d="m6 6 12 12"/></svg>
          </button>
        </div>

        <div className="flex-1 overflow-y-auto px-4 py-4">
          {items.length === 0 ? (
            <p className="mt-8 text-center text-sm text-muted-foreground">Your cart is empty</p>
          ) : (
            <div className="space-y-4">
              {items.map((item) => (
                <div key={item.productId} className="flex gap-3">
                  <div className="relative h-20 w-20 flex-shrink-0 overflow-hidden rounded-lg bg-muted">
                    {item.image ? (
                      <Image src={item.image} alt={item.name} fill sizes="80px" className="object-cover" />
                    ) : (
                      <div className="flex h-full items-center justify-center text-muted-foreground">
                        <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5"><rect x="3" y="3" width="18" height="18" rx="2"/><circle cx="8.5" cy="8.5" r="1.5"/><path d="m3 16 4-4 3 3 5-5 6 6"/></svg>
                      </div>
                    )}
                  </div>
                  <div className="flex flex-1 flex-col justify-between">
                    <div>
                      <p className="text-sm font-medium">{item.name}</p>
                      <p className="text-sm text-muted-foreground">₹{item.price.toLocaleString('en-IN')}</p>
                    </div>
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-2">
                        <button onClick={() => updateQuantity(item.productId, item.quantity - 1)} className="flex h-7 w-7 items-center justify-center rounded-md border text-sm">-</button>
                        <span className="w-6 text-center text-sm">{item.quantity}</span>
                        <button onClick={() => updateQuantity(item.productId, item.quantity + 1)} className="flex h-7 w-7 items-center justify-center rounded-md border text-sm">+</button>
                      </div>
                      <button onClick={() => removeItem(item.productId)} className="text-xs text-muted-foreground underline underline-offset-2 hover:text-red-500">Remove</button>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>

        {items.length > 0 && (
          <div className="border-t px-4 py-4">
            <div className="flex items-center justify-between text-sm">
              <span className="text-muted-foreground">Subtotal</span>
              <span className="font-semibold">₹{subtotal.toLocaleString('en-IN')}</span>
            </div>
            <Link
              href={`/${store.slug}/checkout`}
              onClick={onClose}
              className="mt-4 flex w-full items-center justify-center rounded-[10px] px-4 py-3 text-sm font-semibold text-white transition-opacity hover:opacity-90"
              style={{ backgroundColor: theme.primary_color }}
            >
              Checkout
            </Link>
          </div>
        )}
      </div>
    </>
  )
}
