'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import Image from 'next/image'
import { useStore } from '@/components/StoreProvider'
import { useCart } from '@/store/cart'

export default function ProductDetailClient({ data }: { data: any }) {
  const { store, product, images } = data
  const { theme } = useStore()
  const addItem = useCart((s) => s.addItem)
  const router = useRouter()
  const [quantity, setQuantity] = useState(1)
  const [added, setAdded] = useState(false)
  const [selectedImage, setSelectedImage] = useState(0)

  const handleAddToCart = () => {
    for (let i = 0; i < quantity; i++) {
      addItem({
        productId: product.id,
        name: product.name,
        price: product.price,
        image: images?.[0]?.url || null,
      })
    }
    setAdded(true)
    setTimeout(() => setAdded(false), 600)
  }

  const handleBuyNow = () => {
    for (let i = 0; i < quantity; i++) {
      addItem({
        productId: product.id,
        name: product.name,
        price: product.price,
        image: images?.[0]?.url || null,
      })
    }
    router.push(`/${store.slug}/checkout`)
  }

  const allImages = images.length > 0
    ? images
    : [{ url: null, alt_text: product.name }]

  return (
    <div className="mx-auto max-w-6xl px-4 py-8">
      <div className="grid gap-8 md:grid-cols-2">
        <div>
          <div className="flex snap-x snap-mandatory overflow-x-auto rounded-xl" style={{ scrollSnapType: 'x mandatory' }}>
            {allImages.map((img: any, i: number) => (
              <div key={i} className="relative aspect-square w-full flex-shrink-0 snap-center overflow-hidden bg-muted">
                {img.url ? (
                  <Image
                    src={img.url}
                    alt={img.alt_text || product.name}
                    fill
                    sizes="(max-width: 768px) 100vw, 50vw"
                    priority={i === 0}
                    className="object-cover"
                  />
                ) : (
                  <div className="flex h-full items-center justify-center text-muted-foreground">
                    <svg width="60" height="60" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5">
                      <rect x="3" y="3" width="18" height="18" rx="2"/><circle cx="8.5" cy="8.5" r="1.5"/><path d="m3 16 4-4 3 3 5-5 6 6"/>
                    </svg>
                  </div>
                )}
              </div>
            ))}
          </div>
          {allImages.length > 1 && (
            <div className="mt-3 flex gap-2">
              {allImages.map((_: any, i: number) => (
                <button
                  key={i}
                  onClick={() => setSelectedImage(i)}
                  className={`h-2 flex-1 rounded-full transition-colors ${
                    i === selectedImage ? 'bg-foreground' : 'bg-muted-foreground/20'
                  }`}
                />
              ))}
            </div>
          )}
        </div>

        <div className="flex flex-col justify-center">
          <h1 className="font-serif text-3xl font-bold tracking-tight">{product.name}</h1>
          <p className="mt-3 text-2xl font-semibold">₹{product.price.toLocaleString('en-IN')}</p>
          {product.compare_at_price && product.compare_at_price > product.price && (
            <p className="mt-1 text-sm text-muted-foreground line-through">₹{product.compare_at_price.toLocaleString('en-IN')}</p>
          )}
          {product.description && (
            <p className="mt-4 leading-relaxed text-muted-foreground">{product.description}</p>
          )}

          <div className="mt-8 space-y-4">
            <div className="flex items-center gap-4">
              <span className="text-sm font-medium">Quantity</span>
              <div className="flex items-center gap-3">
                <button onClick={() => setQuantity(Math.max(1, quantity - 1))} className="flex h-9 w-9 items-center justify-center rounded-[10px] border text-sm">-</button>
                <span className="w-8 text-center font-medium">{quantity}</span>
                <button onClick={() => setQuantity(quantity + 1)} className="flex h-9 w-9 items-center justify-center rounded-[10px] border text-sm">+</button>
              </div>
            </div>

            <button onClick={handleAddToCart} className="w-full rounded-[10px] border border-input py-3 text-sm font-semibold transition-all hover:bg-accent">
              {added ? '✓ Added to cart' : 'Add to cart'}
            </button>
            <button onClick={handleBuyNow} className="w-full rounded-[10px] py-3 text-sm font-semibold text-white transition-opacity hover:opacity-90" style={{ backgroundColor: theme.primary_color }}>
              Buy now
            </button>
          </div>
        </div>
      </div>
    </div>
  )
}
