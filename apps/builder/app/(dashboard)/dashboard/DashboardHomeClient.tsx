'use client'

import { useState } from 'react'
import Link from 'next/link'
import { Package, Plus, Share2, Eye, Palette, Copy, Check } from 'lucide-react'

function StatusBadge({ status }: { status: string }) {
  const styles: Record<string, string> = {
    live: 'bg-green-100 text-green-700 dark:bg-green-950/30 dark:text-green-400',
    draft: 'bg-yellow-100 text-yellow-700 dark:bg-yellow-950/30 dark:text-yellow-400',
    suspended: 'bg-red-100 text-red-700 dark:bg-red-950/30 dark:text-red-400',
    pending: 'bg-blue-100 text-blue-700 dark:bg-blue-950/30 dark:text-blue-400',
    confirmed: 'bg-green-100 text-green-700 dark:bg-green-950/30 dark:text-green-400',
    cancelled: 'bg-red-100 text-red-700 dark:bg-red-950/30 dark:text-red-400',
    delivered: 'bg-green-100 text-green-700 dark:bg-green-950/30 dark:text-green-400',
  }
  return (
    <span className={`inline-block rounded-full px-2.5 py-0.5 text-[11px] font-medium ${styles[status] || 'bg-gray-100 text-gray-700 dark:bg-zinc-800 dark:text-zinc-300'}`}>
      {status}
    </span>
  )
}

export default function DashboardHomeClient({
  greeting, name, store, stats, orders,
}: {
  greeting: string; name: string; store: any; stats: any; orders: any[]
}) {
  const [copied, setCopied] = useState(false)

  if (!store) {
    return (
      <div className="flex flex-col items-center justify-center py-20 text-center">
        <Package size={40} style={{ color: 'var(--text-secondary)' }} className="opacity-40" />
        <h2 className="mt-4 font-serif text-2xl font-bold" style={{ color: 'var(--text-primary)' }}>Welcome to Nudge</h2>
        <p className="mt-2 text-sm" style={{ color: 'var(--text-secondary)' }}>Create your first store to get started.</p>
        <Link href="/onboard" className="mt-6 rounded-[10px] px-6 py-3 text-sm font-semibold transition-opacity hover:opacity-90" style={{ backgroundColor: 'var(--bg-inverse)', color: 'var(--text-inverse)' }}>Create store</Link>
      </div>
    )
  }

  const storeUrl = `/api/builder/preview?store_id=${store.id}`

  const quickActions = [
    { label: 'Add product', icon: Plus, href: '/dashboard/products', desc: 'Add a new product' },
    { label: 'Share store', icon: Share2, href: '#', desc: 'Copy store link', onClick: () => { navigator.clipboard.writeText(storeUrl); setCopied(true); setTimeout(() => setCopied(false), 2000) } },
    { label: 'View live', icon: Eye, href: storeUrl, external: true, desc: 'Visit storefront' },
    { label: 'Edit appearance', icon: Palette, href: '/dashboard/appearance', desc: 'Customize theme' },
  ]

  return (
    <div>
      <h1 className="font-serif text-2xl font-bold tracking-tight" style={{ color: 'var(--text-primary)' }}>{greeting}, {name}.</h1>

      <div className="mt-4 flex items-center gap-3">
        <StatusBadge status={store.status} />
        <button
          onClick={() => { navigator.clipboard.writeText(storeUrl); setCopied(true); setTimeout(() => setCopied(false), 2000) }}
          className="flex items-center gap-1.5 rounded-md px-3 py-1.5 text-xs transition-colors bg-[var(--bg-subtle)] text-[var(--text-secondary)] hover:text-[var(--text-primary)]"
        >
          <code className="text-[11px]">Preview</code>
          {copied ? <Check size={12} /> : <Copy size={12} />}
        </button>
        <a href={storeUrl} target="_blank" rel="noopener noreferrer" className="text-xs underline underline-offset-2 text-[var(--text-secondary)] hover:text-[var(--text-primary)]">View live store</a>
      </div>

      <div className="mt-6 grid gap-4 sm:grid-cols-3">
        {[
          { label: 'Total orders', value: stats?.totalOrders ?? 0 },
          { label: 'Revenue this month', value: `₹${(stats?.revenueThisMonth || 0).toLocaleString('en-IN')}` },
          { label: 'Products listed', value: stats?.productCount ?? 0 },
        ].map((s) => (
          <div key={s.label} className="rounded-xl p-5" style={{ backgroundColor: 'var(--bg-subtle)' }}>
            <p className="text-xs" style={{ color: 'var(--text-secondary)' }}>{s.label}</p>
            <p className="mt-1 font-serif text-2xl font-bold tracking-tight" style={{ color: 'var(--text-primary)' }}>{s.value}</p>
          </div>
        ))}
      </div>

      <div className="mt-8 grid grid-cols-2 gap-3 sm:grid-cols-4">
        {quickActions.map((a) => {
          const Icon = a.icon
          const inner = (
            <div
              className="flex flex-col items-center gap-2 rounded-xl border border-dashed p-5 text-center transition-colors hover:bg-[var(--bg-subtle)]"
              style={{ borderColor: 'var(--border-default)' }}
            >
              <Icon size={22} style={{ color: 'var(--text-secondary)' }} />
              <div>
                <p className="text-xs font-medium" style={{ color: 'var(--text-primary)' }}>{a.label}</p>
                <p className="text-[10px]" style={{ color: 'var(--text-secondary)' }}>{copied && a.label === 'Share store' ? 'Copied!' : a.desc}</p>
              </div>
            </div>
          )
          if (a.external) return <a key={a.label} href={a.href} target="_blank" rel="noopener noreferrer">{inner}</a>
          if (a.onClick) return <button key={a.label} onClick={a.onClick} className="text-left w-full">{inner}</button>
          return <Link key={a.label} href={a.href} className="w-full">{inner}</Link>
        })}
      </div>

      <div className="mt-8">
        <div className="flex items-center justify-between">
          <h2 className="text-sm font-semibold" style={{ color: 'var(--text-primary)' }}>Recent orders</h2>
          <Link href="/dashboard/orders" className="text-xs underline underline-offset-2" style={{ color: 'var(--text-secondary)' }}>View all orders →</Link>
        </div>
        {orders.length === 0 ? (
          <p className="mt-4 text-sm text-muted-foreground" style={{ color: 'var(--text-secondary)' }}>No orders yet.</p>
        ) : (
          <div className="mt-4 overflow-x-auto rounded-xl border" style={{ borderColor: 'var(--border-default)' }}>
            <table className="w-full text-left text-sm">
              <thead className="border-b text-xs" style={{ backgroundColor: 'var(--bg-subtle)', borderColor: 'var(--border-default)', color: 'var(--text-secondary)' }}>
                <tr>
                  <th className="px-4 py-3 font-medium">Order</th>
                  <th className="px-4 py-3 font-medium">Customer</th>
                  <th className="px-4 py-3 font-medium">Items</th>
                  <th className="px-4 py-3 font-medium">Amount</th>
                  <th className="px-4 py-3 font-medium">Status</th>
                  <th className="px-4 py-3 font-medium">Date</th>
                </tr>
              </thead>
              <tbody>
                {orders.map((o) => (
                  <tr key={o.id} className="border-b last:border-0 hover:bg-[var(--bg-subtle)]/50 transition-colors" style={{ borderColor: 'var(--border-default)' }}>
                    <td className="px-4 py-3 font-mono text-xs" style={{ color: 'var(--text-primary)' }}>{o.order_number || o.id.slice(0, 8)}</td>
                    <td className="px-4 py-3" style={{ color: 'var(--text-primary)' }}>{o.customer_name}</td>
                    <td className="px-4 py-3" style={{ color: 'var(--text-secondary)' }}>{o.order_items?.length || 0}</td>
                    <td className="px-4 py-3 font-medium" style={{ color: 'var(--text-primary)' }}>₹{o.total.toLocaleString('en-IN')}</td>
                    <td className="px-4 py-3"><StatusBadge status={o.status} /></td>
                    <td className="px-4 py-3 text-xs" style={{ color: 'var(--text-secondary)' }}>{new Date(o.created_at).toLocaleDateString('en-IN')}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  )
}
