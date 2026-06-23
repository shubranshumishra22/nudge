'use client'

import { useState } from 'react'
import { GripVertical, Instagram, Facebook, Twitter, Youtube, Upload, X } from 'lucide-react'

const fontStyles = [
  { id: 'modern', label: 'Modern', preview: 'Inter, system-ui' },
  { id: 'classic', label: 'Classic', preview: 'Georgia, serif' },
  { id: 'playful', label: 'Playful', preview: "'Comic Neue', cursive" },
  { id: 'minimal', label: 'Minimal', preview: "'SF Pro', -apple-system" },
]

const defaultSections = [
  { id: 'hero', label: 'Hero banner' },
  { id: 'products', label: 'Featured products' },
  { id: 'about', label: 'About' },
  { id: 'contact', label: 'Contact' },
]

export default function AppearanceClient({ store, theme: initial }: { store: any; theme: any }) {
  const [theme, setTheme] = useState(initial || { primary_color: '#4F46E5', accent_color: '#F59E0B', background_color: '#FAFAF8', font_style: 'modern', sections_order: ['hero', 'products', 'about', 'contact'], sections_enabled: { hero: true, products: true, about: true, contact: true }, social_links: {} })
  const [saving, setSaving] = useState(false)

  const update = (key: string, value: any) => setTheme({ ...theme, [key]: value })

  const toggleSection = (id: string) => {
    const enabled = { ...(theme.sections_enabled || {}) }
    enabled[id] = !enabled[id]
    update('sections_enabled', enabled)
  }

  const moveSection = (index: number, dir: number) => {
    const order = [...(theme.sections_order || [])]
    const target = index + dir
    if (target < 0 || target >= order.length) return
    ;[order[index], order[target]] = [order[target], order[index]]
    update('sections_order', order)
  }

  const handleSave = async () => {
    setSaving(true)
    await fetch(`/api/stores/${store.id}/theme`, { method: 'PATCH', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({
      primary_color: theme.primary_color,
      accent_color: theme.accent_color,
      background_color: theme.background_color,
      font_style: theme.font_style,
      sections_order: theme.sections_order,
      sections_enabled: theme.sections_enabled,
      social_links: theme.social_links,
    }) })
    await fetch('/api/revalidate', { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ slug: store.slug }) })
    setSaving(false)
  }

  return (
    <div>
      <h1 className="font-serif text-2xl font-bold tracking-tight" style={{ color: 'var(--text-primary)' }}>Appearance</h1>

      <div className="mt-6 grid gap-8 lg:grid-cols-2">
        <div className="space-y-8">
          <section>
            <h2 className="text-sm font-semibold" style={{ color: 'var(--text-primary)' }}>Colors</h2>
            <div className="mt-3 grid grid-cols-3 gap-4">
              {['primary_color', 'accent_color', 'background_color'].map((key) => (
                <div key={key}>
                  <label className="mb-1 block text-xs capitalize" style={{ color: 'var(--text-secondary)' }}>{key.replace('_', ' ')}</label>
                  <div className="flex items-center gap-2">
                    <input type="color" value={theme[key] || '#000000'} onChange={(e) => update(key, e.target.value)} className="h-9 w-9 cursor-pointer rounded-lg border" style={{ borderColor: 'var(--border-default)', backgroundColor: 'transparent' }} />
                    <input
                      value={theme[key] || ''}
                      onChange={(e) => update(key, e.target.value)}
                      className="flex-1 rounded-[10px] border px-2.5 py-2 text-xs outline-none transition-colors focus:border-[var(--border-focus)]"
                      style={{ backgroundColor: 'var(--bg-surface)', borderColor: 'var(--border-default)', color: 'var(--text-primary)' }}
                    />
                  </div>
                </div>
              ))}
            </div>
          </section>

          <section>
            <h2 className="text-sm font-semibold" style={{ color: 'var(--text-primary)' }}>Typography</h2>
            <div className="mt-3 grid grid-cols-2 gap-3">
              {fontStyles.map((f) => (
                <button
                  key={f.id}
                  onClick={() => update('font_style', f.id)}
                  className="rounded-xl border p-4 text-left transition-colors"
                  style={
                    theme.font_style === f.id
                      ? { borderColor: 'var(--bg-inverse)', backgroundColor: 'var(--bg-subtle)' }
                      : { borderColor: 'var(--border-default)', backgroundColor: 'transparent' }
                  }
                  onMouseEnter={(e) => {
                    if (theme.font_style !== f.id) e.currentTarget.style.backgroundColor = 'var(--bg-subtle)'
                  }}
                  onMouseLeave={(e) => {
                    if (theme.font_style !== f.id) e.currentTarget.style.backgroundColor = 'transparent'
                  }}
                >
                  <p className="text-sm font-medium" style={{ color: 'var(--text-primary)' }}>{f.label}</p>
                  <p className="mt-1 text-xs" style={{ color: 'var(--text-secondary)', fontFamily: f.preview }}>Aa</p>
                </button>
              ))}
            </div>
          </section>

          <section>
            <h2 className="text-sm font-semibold" style={{ color: 'var(--text-primary)' }}>Sections</h2>
            <div className="mt-3 space-y-2">
              {defaultSections.map((s, i) => (
                <div key={s.id} className="flex items-center justify-between rounded-xl border px-4 py-3" style={{ backgroundColor: 'var(--bg-surface)', borderColor: 'var(--border-default)', color: 'var(--text-primary)' }}>
                  <div className="flex items-center gap-3">
                    <div className="flex flex-col gap-0.5">
                      <button onClick={() => moveSection(i, -1)} className="transition-colors text-[var(--text-secondary)] hover:text-[var(--text-primary)] disabled:opacity-30" disabled={i === 0}><svg width="10" height="6" viewBox="0 0 10 6" fill="currentColor"><path d="M5 0L10 6H0z"/></svg></button>
                      <button onClick={() => moveSection(i, 1)} className="transition-colors text-[var(--text-secondary)] hover:text-[var(--text-primary)] disabled:opacity-30" disabled={i === defaultSections.length - 1}><svg width="10" height="6" viewBox="0 0 10 6" fill="currentColor"><path d="M5 6L0 0h10z"/></svg></button>
                    </div>
                    <span className="text-sm">{s.label}</span>
                  </div>
                  <button onClick={() => toggleSection(s.id)} className={`relative h-5 w-9 rounded-full transition-colors ${theme.sections_enabled?.[s.id] !== false ? 'bg-[var(--bg-inverse)]' : 'bg-zinc-300 dark:bg-zinc-700'}`}>
                    <span className={`absolute left-0.5 top-0.5 h-4 w-4 rounded-full bg-white dark:bg-zinc-900 transition-transform ${theme.sections_enabled?.[s.id] !== false ? 'translate-x-4' : ''}`} />
                  </button>
                </div>
              ))}
            </div>
          </section>

          <section>
            <h2 className="text-sm font-semibold" style={{ color: 'var(--text-primary)' }}>Social links</h2>
            <div className="mt-3 space-y-3">
              {[
                { key: 'instagram', icon: Instagram, label: 'Instagram' },
                { key: 'facebook', icon: Facebook, label: 'Facebook' },
                { key: 'twitter', icon: Twitter, label: 'Twitter / X' },
                { key: 'youtube', icon: Youtube, label: 'YouTube' },
              ].map((s) => {
                const Icon = s.icon
                const links = (theme.social_links || {}) as Record<string, string>
                return (
                  <div key={s.key} className="flex items-center gap-3">
                    <Icon size={16} style={{ color: 'var(--text-secondary)' }} />
                    <input
                      placeholder={`${s.label} URL`}
                      value={links[s.key] || ''}
                      onChange={(e) => update('social_links', { ...links, [s.key]: e.target.value })}
                      className="flex-1 rounded-[10px] border px-3 py-2.5 text-sm outline-none transition-colors focus:border-[var(--border-focus)]"
                      style={{ backgroundColor: 'var(--bg-surface)', borderColor: 'var(--border-default)', color: 'var(--text-primary)' }}
                    />
                  </div>
                )
              })}
            </div>
          </section>

          <button onClick={handleSave} disabled={saving} className="w-full rounded-[10px] py-3 text-sm font-semibold transition-opacity hover:opacity-90 disabled:opacity-50" style={{ backgroundColor: 'var(--bg-inverse)', color: 'var(--text-inverse)' }}>{saving ? 'Saving...' : 'Save changes'}</button>
        </div>

        <div className="hidden lg:block">
          <div className="sticky top-24 overflow-hidden rounded-xl border" style={{ borderColor: 'var(--border-default)' }}>
            <div className="px-4 py-2 text-xs font-medium" style={{ backgroundColor: 'var(--bg-subtle)', color: 'var(--text-secondary)' }}>Preview</div>
            <iframe src={`/api/builder/preview?store_id=${store.id}`} className="h-[600px] w-full bg-white" title="Store preview" />
          </div>
        </div>
      </div>
    </div>
  )
}
