'use client'

import { useState } from 'react'
import ProductGrid from '@/components/templates/Minimal/ProductGrid'

export default function ProductsClient({
  products,
  categories,
  slug,
}: {
  products: any[]
  categories: string[]
  slug: string
}) {
  const [activeCategory, setActiveCategory] = useState<string | null>(null)

  const filtered = activeCategory
    ? products.filter((p) => p.category === activeCategory)
    : products

  return (
    <div className="mx-auto max-w-6xl px-4 py-8">
      <h1 className="font-serif text-3xl font-bold tracking-tight">Products</h1>

      {categories.length > 1 && (
        <div className="mt-6 flex flex-wrap gap-2">
          <button
            onClick={() => setActiveCategory(null)}
            className={`rounded-full px-4 py-1.5 text-xs font-medium transition-colors ${
              activeCategory === null
                ? 'bg-foreground text-background'
                : 'border bg-white text-muted-foreground hover:bg-accent'
            }`}
          >
            All
          </button>
          {categories.map((cat) => (
            <button
              key={cat}
              onClick={() => setActiveCategory(cat)}
              className={`rounded-full px-4 py-1.5 text-xs font-medium transition-colors ${
                activeCategory === cat
                  ? 'bg-foreground text-background'
                  : 'border bg-white text-muted-foreground hover:bg-accent'
              }`}
            >
              {cat}
            </button>
          ))}
        </div>
      )}

      <div className="mt-8">
        <ProductGrid products={filtered} showHeading={false} />
      </div>
    </div>
  )
}
