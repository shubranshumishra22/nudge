'use client'

import { useState } from 'react'
import Link from 'next/link'
import { useStore } from '@/components/StoreProvider'
import { useCart } from '@/store/cart'
import CartSlideover from './CartSlideover'

export default function Header() {
  const { store, theme } = useStore()
  const itemCount = useCart((s) => s.itemCount)
  const [mobileOpen, setMobileOpen] = useState(false)
  const [cartOpen, setCartOpen] = useState(false)

  const navLinks = [
    { label: 'Home', href: `/${store.slug}` },
    { label: 'Products', href: `/${store.slug}/products` },
  ]
  if (theme.about_text) {
    navLinks.push({ label: 'About', href: `/${store.slug}#about` })
  }

  return (
    <>
      <header className="sticky top-0 z-40 w-full border-b bg-white/80 backdrop-blur-md">
        <div className="mx-auto flex h-16 max-w-6xl items-center justify-between px-4">
          <Link
            href={`/${store.slug}`}
            className="font-serif text-xl font-bold tracking-tight"
            style={{ color: theme.primary_color }}
          >
            {store.logo_url ? (
              <img src={store.logo_url} alt={store.name} className="h-8 w-auto" />
            ) : (
              store.name
            )}
          </Link>

          <nav className="hidden items-center gap-6 md:flex">
            {navLinks.map((l) => (
              <Link
                key={l.href}
                href={l.href}
                className="text-sm font-medium text-muted-foreground transition-colors hover:text-foreground"
              >
                {l.label}
              </Link>
            ))}
            <button
              onClick={() => setCartOpen(true)}
              className="relative ml-4"
            >
              <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                <circle cx="9" cy="21" r="1"/><circle cx="20" cy="21" r="1"/>
                <path d="M1 1h4l2.68 13.39a2 2 0 0 0 2 1.61h9.72a2 2 0 0 0 2-1.61L23 6H6"/>
              </svg>
              {itemCount > 0 && (
                <span className="absolute -right-2 -top-2 flex h-5 w-5 items-center justify-center rounded-full text-[11px] font-bold text-white" style={{ backgroundColor: theme.primary_color }}>
                  {itemCount}
                </span>
              )}
            </button>
          </nav>

          <div className="flex items-center gap-3 md:hidden">
            <button onClick={() => setCartOpen(true)} className="relative">
              <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                <circle cx="9" cy="21" r="1"/><circle cx="20" cy="21" r="1"/>
                <path d="M1 1h4l2.68 13.39a2 2 0 0 0 2 1.61h9.72a2 2 0 0 0 2-1.61L23 6H6"/>
              </svg>
              {itemCount > 0 && (
                <span className="absolute -right-2 -top-2 flex h-5 w-5 items-center justify-center rounded-full text-[11px] font-bold text-white" style={{ backgroundColor: theme.primary_color }}>
                  {itemCount}
                </span>
              )}
            </button>
            <button onClick={() => setMobileOpen(!mobileOpen)}>
              <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round">
                {mobileOpen ? (
                  <>
                    <path d="M18 6L6 18"/><path d="M6 6l12 12"/>
                  </>
                ) : (
                  <>
                    <path d="M4 6h16"/><path d="M4 12h16"/><path d="M4 18h16"/>
                  </>
                )}
              </svg>
            </button>
          </div>
        </div>

        {mobileOpen && (
          <div className="border-t bg-white px-4 py-4 md:hidden">
            <nav className="flex flex-col gap-4">
              {navLinks.map((l) => (
                <Link
                  key={l.href}
                  href={l.href}
                  onClick={() => setMobileOpen(false)}
                  className="text-sm font-medium text-muted-foreground"
                >
                  {l.label}
                </Link>
              ))}
            </nav>
          </div>
        )}
      </header>

      <CartSlideover open={cartOpen} onClose={() => setCartOpen(false)} />
    </>
  )
}
