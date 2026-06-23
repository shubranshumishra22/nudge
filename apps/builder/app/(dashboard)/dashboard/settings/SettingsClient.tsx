'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { Trash2 } from 'lucide-react'

export default function SettingsClient({ store: initial, owner }: { store: any; owner: any }) {
  const router = useRouter()
  const [store, setStore] = useState(initial)
  const [saving, setSaving] = useState(false)
  const [deleteConfirm, setDeleteConfirm] = useState(false)

  const update = (key: string, value: any) => setStore({ ...store, [key]: value })

  const handleSave = async (section: string) => {
    setSaving(true)
    await fetch(`/api/stores/${store.id}/theme`, { method: 'PATCH', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({
      name: store.name, slug: store.slug, description: store.description, tagline: store.tagline,
      whatsapp_number: store.whatsapp_number, contact_email: store.contact_email, contact_address: store.contact_address,
      delivery_fee: store.delivery_fee, free_delivery_above: store.free_delivery_above, cod_enabled: store.cod_enabled,
    }) })
    if (section !== 'delivery') {
      await fetch('/api/revalidate', { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ slug: store.slug }) })
    } else {
      await fetch('/api/revalidate', { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ slug: store.slug }) })
    }
    setSaving(false)
  }

  const handleDelete = async () => {
    await fetch(`/api/stores/${store.id}`, { method: 'DELETE' })
    router.push('/dashboard')
  }

  const inputClass = 'w-full rounded-[10px] border px-4 py-2.5 text-sm outline-none transition-colors focus:border-[var(--border-focus)] bg-[var(--bg-surface)] border-[var(--border-default)] text-[var(--text-primary)]'
  const labelClass = 'mb-1 block text-xs font-medium text-[var(--text-secondary)]'
  const sectionClass = 'rounded-xl border p-6 bg-[var(--bg-surface)] border-[var(--border-default)] text-[var(--text-primary)]'

  return (
    <div className="max-w-2xl">
      <h1 className="font-serif text-2xl font-bold tracking-tight" style={{ color: 'var(--text-primary)' }}>Settings</h1>

      <div className="mt-6 space-y-6">
        <div className={sectionClass}>
          <h2 className="text-sm font-semibold">Store info</h2>
          <div className="mt-4 space-y-4">
            <div><label className={labelClass}>Store name</label><input className={inputClass} value={store.name} onChange={(e) => update('name', e.target.value)} /></div>
            <div><label className={labelClass}>Tagline</label><input className={inputClass} value={store.tagline || ''} onChange={(e) => update('tagline', e.target.value)} placeholder="Short tagline for your store" /></div>
            <div><label className={labelClass}>Description</label><textarea rows={3} className={inputClass} value={store.description || ''} onChange={(e) => update('description', e.target.value)} /></div>
            <button onClick={() => handleSave('info')} disabled={saving} className="rounded-[10px] px-5 py-2.5 text-sm font-semibold transition-opacity hover:opacity-90 disabled:opacity-50" style={{ backgroundColor: 'var(--bg-inverse)', color: 'var(--text-inverse)' }}>Save</button>
          </div>
        </div>

        <div className={sectionClass}>
          <h2 className="text-sm font-semibold">Contact</h2>
          <div className="mt-4 space-y-4">
            <div><label className={labelClass}>WhatsApp number</label><input className={inputClass} value={store.whatsapp_number || ''} onChange={(e) => update('whatsapp_number', e.target.value)} placeholder="9876543210" /></div>
            <div><label className={labelClass}>Email</label><input className={inputClass} type="email" value={store.contact_email || ''} onChange={(e) => update('contact_email', e.target.value)} /></div>
            <div><label className={labelClass}>Address</label><textarea rows={2} className={inputClass} value={store.contact_address || ''} onChange={(e) => update('contact_address', e.target.value)} /></div>
            <button onClick={() => handleSave('contact')} disabled={saving} className="rounded-[10px] px-5 py-2.5 text-sm font-semibold transition-opacity hover:opacity-90 disabled:opacity-50" style={{ backgroundColor: 'var(--bg-inverse)', color: 'var(--text-inverse)' }}>Save</button>
          </div>
        </div>

        <div className={sectionClass}>
          <h2 className="text-sm font-semibold">Delivery</h2>
          <div className="mt-4 space-y-4">
            <div className="grid grid-cols-2 gap-4">
              <div><label className={labelClass}>Delivery fee (₹)</label><input type="number" className={inputClass} value={store.delivery_fee || 0} onChange={(e) => update('delivery_fee', parseInt(e.target.value) || 0)} /></div>
              <div><label className={labelClass}>Free above (₹)</label><input type="number" className={inputClass} value={store.free_delivery_above || ''} onChange={(e) => update('free_delivery_above', e.target.value ? parseInt(e.target.value) : null)} placeholder="Leave empty to disable" /></div>
            </div>
            <label className="flex items-center gap-2 text-sm"><input type="checkbox" checked={store.cod_enabled || false} onChange={(e) => update('cod_enabled', e.target.checked)} className="h-4 w-4" /> Enable cash on delivery</label>
            <button onClick={() => handleSave('delivery')} disabled={saving} className="rounded-[10px] px-5 py-2.5 text-sm font-semibold transition-opacity hover:opacity-90 disabled:opacity-50" style={{ backgroundColor: 'var(--bg-inverse)', color: 'var(--text-inverse)' }}>Save</button>
          </div>
        </div>

        <div className={sectionClass}>
          <h2 className="text-sm font-semibold">Domain</h2>
          <div className="mt-4">
            <p className="text-sm">
              <a
                href={
                  process.env.NEXT_PUBLIC_STOREFRONT_URL
                    ? `${process.env.NEXT_PUBLIC_STOREFRONT_URL}/${store.slug}`
                    : `https://${store.slug}.nudge.store`
                }
                target="_blank"
                rel="noopener noreferrer"
                className="rounded px-2 py-0.5 text-xs transition-colors underline underline-offset-2"
                style={{ backgroundColor: 'var(--bg-subtle)', color: 'var(--text-primary)' }}
              >
                {process.env.NEXT_PUBLIC_STOREFRONT_URL
                  ? `${process.env.NEXT_PUBLIC_STOREFRONT_URL.replace(/^https?:\/\//, '')}/${store.slug}`
                  : `${store.slug}.nudge.store`}
              </a>
            </p>
            <p className="mt-2 text-xs" style={{ color: 'var(--text-secondary)' }}>Upgrade to Pro to connect a custom domain.</p>
          </div>
        </div>

        <div className={sectionClass}>
          <h2 className="text-sm font-semibold">Notifications</h2>
          <div className="mt-4 space-y-4">
            <div><label className={labelClass}>WhatsApp number for order alerts</label><input className={inputClass} value={store.whatsapp_number || ''} onChange={(e) => update('whatsapp_number', e.target.value)} /></div>
            <div><label className={labelClass}>Email for order alerts</label><input className={inputClass} type="email" value={owner?.email || store.contact_email || ''} /></div>
            <button onClick={() => handleSave('notifications')} disabled={saving} className="rounded-[10px] px-5 py-2.5 text-sm font-semibold transition-opacity hover:opacity-90 disabled:opacity-50" style={{ backgroundColor: 'var(--bg-inverse)', color: 'var(--text-inverse)' }}>Save</button>
          </div>
        </div>

        <div className={`${sectionClass} border-red-200 dark:border-red-950/50`}>
          <h2 className="text-sm font-semibold text-red-600 dark:text-red-400">Danger zone</h2>
          <p className="mt-1 text-xs" style={{ color: 'var(--text-secondary)' }}>Permanently delete your store and all its data.</p>
          <button onClick={() => setDeleteConfirm(true)} className="mt-3 flex items-center gap-2 rounded-[10px] border px-4 py-2.5 text-sm font-medium transition-colors border-red-200 dark:border-red-900/50 text-red-600 dark:text-red-400 hover:bg-red-50 dark:hover:bg-red-950/20"><Trash2 size={16} />Delete store</button>
        </div>
      </div>

      {deleteConfirm && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 backdrop-blur-sm">
          <div className="w-full max-w-sm rounded-xl p-6 shadow-xl border" style={{ backgroundColor: 'var(--bg-surface)', borderColor: 'var(--border-default)', color: 'var(--text-primary)' }}>
            <h3 className="text-sm font-semibold">Delete {store.name}?</h3>
            <p className="mt-2 text-xs" style={{ color: 'var(--text-secondary)' }}>This permanently deletes your store, products, orders, and all data. This cannot be undone.</p>
            <div className="mt-4 flex justify-end gap-3">
              <button onClick={() => setDeleteConfirm(false)} className="rounded-[10px] border px-4 py-2 text-xs font-medium hover:bg-[var(--bg-subtle)] transition-colors" style={{ borderColor: 'var(--border-default)', color: 'var(--text-secondary)' }}>Cancel</button>
              <button onClick={handleDelete} className="rounded-[10px] bg-red-600 px-4 py-2 text-xs font-medium text-white hover:opacity-90 transition-opacity">Delete permanently</button>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
