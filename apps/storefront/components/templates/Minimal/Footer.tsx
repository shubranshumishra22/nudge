'use client'

import Link from 'next/link'
import Image from 'next/image'
import { useStore } from '@/components/StoreProvider'

export default function Footer() {
  const { store, theme } = useStore()

  const socialLinks = (theme.social_links as Record<string, string>) || {}

  return (
    <footer className="border-t" style={{ backgroundColor: theme.background_color || '#FAFAF8' }}>
      <div className="mx-auto max-w-6xl px-4 py-12">
        <div className="flex flex-col items-center justify-between gap-6 md:flex-row">
          <div className="text-center md:text-left">
            <Link href={`/${store.slug}`} className="font-serif text-lg font-bold" style={{ color: theme.primary_color }}>
              {store.logo_url ? (
                <Image src={store.logo_url} alt={store.name} width={120} height={32} className="h-8 w-auto" />
              ) : (
                store.name
              )}
            </Link>
            {store.tagline && (
              <p className="mt-1 text-sm text-muted-foreground">{store.tagline}</p>
            )}
          </div>

          <div className="flex items-center gap-4">
            {socialLinks.instagram && (
              <a href={socialLinks.instagram} target="_blank" rel="noopener noreferrer" className="text-muted-foreground transition-colors hover:text-foreground">
                <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><rect x="2" y="2" width="20" height="20" rx="5"/><circle cx="12" cy="12" r="5"/><circle cx="17.5" cy="6.5" r="1.5" fill="currentColor"/></svg>
              </a>
            )}
            {socialLinks.facebook && (
              <a href={socialLinks.facebook} target="_blank" rel="noopener noreferrer" className="text-muted-foreground transition-colors hover:text-foreground">
                <svg width="20" height="20" viewBox="0 0 24 24" fill="currentColor"><path d="M18 2h-3a5 5 0 0 0-5 5v3H7v4h3v8h4v-8h3l1-4h-4V7a1 1 0 0 1 1-1h3z"/></svg>
              </a>
            )}
            {socialLinks.twitter && (
              <a href={socialLinks.twitter} target="_blank" rel="noopener noreferrer" className="text-muted-foreground transition-colors hover:text-foreground">
                <svg width="20" height="20" viewBox="0 0 24 24" fill="currentColor"><path d="M18.244 2.25h3.308l-7.227 8.26 8.502 11.24H16.17l-5.214-6.817L4.99 21.75H1.68l7.73-8.835L1.254 2.25H8.08l4.713 6.231zm-1.161 17.52h1.833L7.084 4.126H5.117z"/></svg>
              </a>
            )}
          </div>
        </div>

      </div>
    </footer>
  )
}
