'use client'

import { useState } from 'react'
import Link from 'next/link'
import Image from 'next/image'
import { useStore } from '@/components/StoreProvider'
import { useCart } from '@/store/cart'

function Price({ amount }: { amount: number }) {
  return <span>₹{amount.toLocaleString('en-IN')}</span>
}

function ProductCard({ product, index }: { product: any; index: number }) {
  const addItem = useCart((s) => s.addItem)
  const [added, setAdded] = useState(false)

  const handleAdd = () => {
    addItem({
      productId: product.id,
      name: product.name,
      price: product.price,
      image: product.image || null,
    })
    setAdded(true)
    setTimeout(() => setAdded(false), 300)
  }

  return (
    <div className="group">
      <Link href={`/${product.store_slug}/p/${product.id}`}>
        <div className="relative aspect-square overflow-hidden rounded-xl bg-muted">
          {product.image ? (
            <Image
              src={product.image}
              alt={product.name}
              fill
              sizes="(max-width: 768px) 50vw, 33vw"
              priority={index < 4}
              loading={index < 4 ? undefined : 'lazy'}
              className="object-cover transition-transform duration-300 group-hover:scale-105"
            />
          ) : (
            <div className="flex h-full items-center justify-center text-muted-foreground">
              <svg width="40" height="40" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5">
                <rect x="3" y="3" width="18" height="18" rx="2"/><circle cx="8.5" cy="8.5" r="1.5"/><path d="m3 16 4-4 3 3 5-5 6 6"/>
              </svg>
            </div>
          )}
        </div>
      </Link>
      <div className="mt-3 space-y-1">
        <Link href={`/${product.store_slug}/p/${product.id}`} className="block">
          <h3 className="text-sm font-medium">{product.name}</h3>
        </Link>
        <p className="text-sm text-muted-foreground">
          <Price amount={product.price} />
        </p>
        <button
          onClick={handleAdd}
          className="mt-1 w-full rounded-[10px] border border-input px-3 py-2 text-xs font-medium transition-all hover:bg-accent"
        >
          {added ? '✓ Added' : 'Add to cart'}
        </button>
      </div>
    </div>
  )
}

export default function ProductGrid({
  products,
  showHeading = true,
}: {
  products: any[]
  showHeading?: boolean
}) {
  const { store } = useStore()

  const productsWithSlug = products.map((p) => ({
    ...p,
    store_slug: store.slug,
  }))

  return (
    <section className="mx-auto max-w-6xl px-4 py-16">
      {showHeading && (
        <h2 className="font-serif text-2xl font-bold tracking-tight md:text-3xl">
          Products
        </h2>
      )}
      <div className="mt-8 grid grid-cols-2 gap-4 md:grid-cols-3 md:gap-6">
        {productsWithSlug.map((product, i) => (
          <ProductCard key={product.id} product={product} index={i} />
        ))}
      </div>
    </section>
  )
}
