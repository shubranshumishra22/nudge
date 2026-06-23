'use client'

import Image from 'next/image'
import { useStore } from '@/components/StoreProvider'

export default function About() {
  const { store, theme } = useStore()

  if (!theme.about_text) return null

  return (
    <section id="about" className="mx-auto max-w-6xl px-4 py-16">
      <div className="grid gap-8 md:grid-cols-2 md:items-center">
        <div>
          <h2 className="font-serif text-2xl font-bold tracking-tight md:text-3xl">About us</h2>
          <p className="mt-4 leading-relaxed text-muted-foreground">{theme.about_text}</p>
        </div>
        <div className="flex items-center justify-center">
          {store.logo_url ? (
            <Image src={store.logo_url} alt={store.name} width={192} height={192} className="max-h-48 w-auto opacity-80" />
          ) : (
            <div className="flex h-48 w-48 items-center justify-center rounded-2xl" style={{ backgroundColor: theme.accent_color + '20' }}>
              <span className="font-serif text-6xl font-bold opacity-30" style={{ color: theme.primary_color }}>
                {store.name.charAt(0)}
              </span>
            </div>
          )}
        </div>
      </div>
    </section>
  )
}
