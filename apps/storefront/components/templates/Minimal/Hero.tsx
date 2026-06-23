'use client'

import Link from 'next/link'
import Image from 'next/image'
import { useStore } from '@/components/StoreProvider'

export default function Hero() {
  const { store, theme } = useStore()

  const headline = theme.hero_headline || store.name
  const subheading = theme.hero_subheading || store.tagline || ''

  if (theme.hero_image_url) {
    return (
      <section className="relative flex min-h-[80vh] items-center justify-center">
        <Image
          src={theme.hero_image_url}
          alt=""
          fill
          priority
          sizes="100vw"
          className="object-cover"
        />
        <div className="absolute inset-0 bg-black/50" />
        <div className="relative z-10 max-w-2xl px-4 text-center text-white">
          <h1 className="font-serif text-4xl font-bold tracking-tight md:text-6xl">
            {headline}
          </h1>
          {subheading && (
            <p className="mt-4 text-lg opacity-90 md:text-xl">{subheading}</p>
          )}
          <Link
            href={`/${store.slug}/products`}
            className="mt-8 inline-block rounded-[10px] bg-white px-8 py-3 text-sm font-semibold text-black transition-opacity hover:opacity-90"
          >
            Shop now
          </Link>
        </div>
      </section>
    )
  }

  return (
    <section
      className="flex min-h-[80vh] items-center justify-center px-4"
      style={{ backgroundColor: theme.primary_color }}
    >
      <div className="max-w-2xl text-center text-white">
        <h1 className="font-serif text-4xl font-bold tracking-tight md:text-6xl">
          {headline}
        </h1>
        {subheading && (
          <p className="mt-4 text-lg opacity-90 md:text-xl">{subheading}</p>
        )}
        <Link
          href={`/${store.slug}/products`}
          className="mt-8 inline-block rounded-[10px] bg-white px-8 py-3 text-sm font-semibold text-black transition-opacity hover:opacity-90"
        >
          Shop now
        </Link>
      </div>
    </section>
  )
}
