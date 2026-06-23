'use client'

import { useState } from 'react'
import { X, ChevronDown } from 'lucide-react'

const tabs = ['All', 'New', 'Processing', 'Shipped', 'Delivered', 'Cancelled']

const statusStyles: Record<string, string> = {
  pending: 'bg-yellow-100 text-yellow-700 dark:bg-yellow-950/30 dark:text-yellow-400', confirmed: 'bg-blue-100 text-blue-700 dark:bg-blue-950/30 dark:text-blue-400',
  processing: 'bg-purple-100 text-purple-700 dark:bg-purple-950/30 dark:text-purple-400', shipped: 'bg-indigo-100 text-indigo-700 dark:bg-indigo-950/30 dark:text-indigo-400',
  delivered: 'bg-green-100 text-green-700 dark:bg-green-950/30 dark:text-green-400', cancelled: 'bg-red-100 text-red-700 dark:bg-red-950/30 dark:text-red-400',
}

export default function OrdersClient({ store, orders: initial }: { store: any; orders: any[] }) {
  const [orders, setOrders] = useState(initial)
  const [tab, setTab] = useState('All')
  const [detail, setDetail] = useState<any>(null)
  const [ownerNotes, setOwnerNotes] = useState('')

  const filtered = tab === 'All' ? orders : orders.filter((o) => o.status.toLowerCase() === tab.toLowerCase())

  const handleStatusChange = async (orderId: string, status: string) => {
    setOrders((prev) => prev.map((o) => o.id === orderId ? { ...o, status } : o))
    if (detail?.id === orderId) setDetail({ ...detail, status })
    await fetch(`/api/orders/${orderId}`, { method: 'PATCH', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ status }) })
  }

  const handleNotesSave = async (orderId: string) => {
    await fetch(`/api/orders/${orderId}`, { method: 'PATCH', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ owner_notes: ownerNotes }) })
  }

  return (
    <div>
      <h1 className="font-serif text-2xl font-bold tracking-tight" style={{ color: 'var(--text-primary)' }}>Orders</h1>

      <div className="mt-4 flex gap-1 rounded-xl p-1 text-xs" style={{ backgroundColor: 'var(--bg-subtle)' }}>
        {tabs.map((t) => (
          <button
            key={t}
            onClick={() => setTab(t)}
            className="flex-1 rounded-lg py-2 font-medium transition-colors"
            style={
              tab === t
                ? { backgroundColor: 'var(--bg-surface)', color: 'var(--text-primary)', boxShadow: 'var(--shadow-sm)' }
                : { color: 'var(--text-secondary)' }
            }
          >
            {t}
          </button>
        ))}
      </div>

      {filtered.length === 0 ? (
        <p className="mt-8 text-sm text-muted-foreground" style={{ color: 'var(--text-secondary)' }}>No orders found.</p>
      ) : (
        <div className="mt-4 overflow-x-auto rounded-xl border" style={{ borderColor: 'var(--border-default)' }}>
          <table className="w-full text-left text-sm">
            <thead className="border-b text-xs" style={{ backgroundColor: 'var(--bg-subtle)', borderColor: 'var(--border-default)', color: 'var(--text-secondary)' }}>
              <tr><th className="px-4 py-3 font-medium">Order</th><th className="px-4 py-3 font-medium">Customer</th><th className="px-4 py-3 font-medium">Items</th><th className="px-4 py-3 font-medium">Total</th><th className="px-4 py-3 font-medium">Status</th><th className="px-4 py-3 font-medium">Date</th><th className="px-4 py-3 font-medium"></th></tr>
            </thead>
            <tbody>
              {filtered.map((o) => (
                <tr key={o.id} className="border-b last:border-0 hover:bg-[var(--bg-subtle)]/50 transition-colors cursor-pointer" style={{ borderColor: 'var(--border-default)' }} onClick={() => { setDetail(o); setOwnerNotes(o.owner_notes || '') }}>
                  <td className="px-4 py-3 font-mono text-xs" style={{ color: 'var(--text-primary)' }}>{o.order_number || o.id.slice(0, 8)}</td>
                  <td className="px-4 py-3" style={{ color: 'var(--text-primary)' }}>{o.customer_name}</td>
                  <td className="px-4 py-3 text-xs" style={{ color: 'var(--text-secondary)' }}>{o.order_items?.length || 0}</td>
                  <td className="px-4 py-3 font-medium" style={{ color: 'var(--text-primary)' }}>₹{o.total.toLocaleString('en-IN')}</td>
                  <td className="px-4 py-3">
                    <select
                      value={o.status}
                      onClick={(e) => e.stopPropagation()}
                      onChange={(e) => { e.stopPropagation(); handleStatusChange(o.id, e.target.value) }}
                      className={`rounded-full px-2.5 py-0.5 text-[11px] font-medium outline-none border transition-colors ${statusStyles[o.status] || 'bg-gray-100'}`}
                      style={{ backgroundColor: 'var(--bg-surface)', borderColor: 'var(--border-default)' }}
                    >
                      {Object.keys(statusStyles).map((s) => <option key={s} value={s} style={{ backgroundColor: 'var(--bg-surface)', color: 'var(--text-primary)' }}>{s}</option>)}
                    </select>
                  </td>
                  <td className="px-4 py-3 text-xs" style={{ color: 'var(--text-secondary)' }}>{new Date(o.created_at).toLocaleDateString('en-IN')}</td>
                  <td className="px-4 py-3"><button onClick={(e) => { e.stopPropagation(); setDetail(o); setOwnerNotes(o.owner_notes || '') }} className="text-xs underline underline-offset-2 transition-colors text-[var(--text-secondary)] hover:text-[var(--text-primary)]">View</button></td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}

      {detail && (
        <>
          <div className="fixed inset-0 z-40 bg-black/40 backdrop-blur-sm" onClick={() => setDetail(null)} />
          <div className="fixed right-0 top-0 z-50 flex h-full w-full flex-col shadow-xl md:w-[500px]" style={{ backgroundColor: 'var(--bg-surface)', borderLeft: '1px solid var(--border-default)', color: 'var(--text-primary)' }}>
            <div className="flex items-center justify-between border-b px-5 py-4" style={{ borderColor: 'var(--border-default)' }}>
              <h2 className="text-sm font-semibold">Order {detail.order_number || detail.id.slice(0, 8)}</h2>
              <button onClick={() => setDetail(null)} style={{ color: 'var(--text-secondary)' }} className="hover:text-[var(--text-primary)]"><X size={18} /></button>
            </div>
            <div className="flex-1 overflow-y-auto px-5 py-4">
              <div className="space-y-5">
                <div className="flex items-center justify-between">
                  <span className="text-xs" style={{ color: 'var(--text-secondary)' }}>{new Date(detail.created_at).toLocaleDateString('en-IN', { dateStyle: 'long' })}</span>
                  <select
                    value={detail.status}
                    onChange={(e) => handleStatusChange(detail.id, e.target.value)}
                    className={`rounded-full px-3 py-1 text-xs font-medium outline-none border transition-colors ${statusStyles[detail.status] || 'bg-gray-100'}`}
                    style={{ backgroundColor: 'var(--bg-surface)', borderColor: 'var(--border-default)' }}
                  >
                    {Object.keys(statusStyles).map((s) => <option key={s} value={s} style={{ backgroundColor: 'var(--bg-surface)', color: 'var(--text-primary)' }}>{s}</option>)}
                  </select>
                </div>

                <div>
                  <h3 className="text-xs font-semibold uppercase tracking-wide" style={{ color: 'var(--text-secondary)' }}>Customer</h3>
                  <p className="mt-1 text-sm font-medium">{detail.customer_name}</p>
                  {detail.customer_phone && <a href={`https://wa.me/91${detail.customer_phone.replace(/[^0-9]/g, '')}`} target="_blank" rel="noopener noreferrer" className="text-xs underline underline-offset-2" style={{ color: 'var(--text-secondary)' }}>{detail.customer_phone}</a>}
                  {detail.customer_email && <p className="text-xs" style={{ color: 'var(--text-secondary)' }}>{detail.customer_email}</p>}
                </div>

                {detail.delivery_address && (
                  <div>
                    <h3 className="text-xs font-semibold uppercase tracking-wide" style={{ color: 'var(--text-secondary)' }}>Delivery address</h3>
                    <p className="mt-1 text-sm">{detail.delivery_address.line1}{detail.delivery_address.line2 ? `, ${detail.delivery_address.line2}` : ''}<br />{detail.delivery_address.city}, {detail.delivery_address.state} — {detail.delivery_address.pincode}</p>
                  </div>
                )}

                <div>
                  <h3 className="text-xs font-semibold uppercase tracking-wide" style={{ color: 'var(--text-secondary)' }}>Items</h3>
                  <div className="mt-2 space-y-2">
                    {(detail.order_items || []).map((item: any) => (
                      <div key={item.id} className="flex items-center justify-between text-sm">
                        <span>{item.product_name} <span style={{ color: 'var(--text-secondary)' }}>x{item.quantity}</span></span>
                        <span>₹{(item.unit_price * item.quantity).toLocaleString('en-IN')}</span>
                      </div>
                    ))}
                  </div>
                  <div className="mt-3 border-t pt-3 text-sm" style={{ borderColor: 'var(--border-default)' }}>
                    <div className="flex justify-between"><span style={{ color: 'var(--text-secondary)' }}>Subtotal</span><span>₹{detail.subtotal.toLocaleString('en-IN')}</span></div>
                    {detail.delivery_fee > 0 && <div className="flex justify-between mt-1"><span style={{ color: 'var(--text-secondary)' }}>Delivery</span><span>₹{detail.delivery_fee.toLocaleString('en-IN')}</span></div>}
                    <div className="flex justify-between mt-1 font-semibold"><span>Total</span><span>₹{detail.total.toLocaleString('en-IN')}</span></div>
                  </div>
                </div>

                <div>
                  <h3 className="text-xs font-semibold uppercase tracking-wide" style={{ color: 'var(--text-secondary)' }}>Payment</h3>
                  <p className="mt-1 text-sm capitalize">{detail.payment_method}</p>
                </div>

                {detail.notes && (
                  <div>
                    <h3 className="text-xs font-semibold uppercase tracking-wide" style={{ color: 'var(--text-secondary)' }}>Customer note</h3>
                    <p className="mt-1 text-sm" style={{ color: 'var(--text-secondary)' }}>{detail.notes}</p>
                  </div>
                )}

                <div>
                  <h3 className="text-xs font-semibold uppercase tracking-wide" style={{ color: 'var(--text-secondary)' }}>Owner notes</h3>
                  <textarea
                    rows={3}
                    className="mt-1 w-full rounded-[10px] border px-3 py-2.5 text-sm outline-none transition-colors focus:border-[var(--border-focus)]"
                    style={{ backgroundColor: 'var(--bg-base)', borderColor: 'var(--border-default)', color: 'var(--text-primary)' }}
                    placeholder="Internal notes..."
                    value={ownerNotes}
                    onChange={(e) => setOwnerNotes(e.target.value)}
                    onBlur={() => handleNotesSave(detail.id)}
                  />
                </div>

                <button onClick={() => window.print()} className="w-full rounded-[10px] border py-3 text-sm font-medium hover:bg-[var(--bg-subtle)] transition-colors" style={{ borderColor: 'var(--border-default)', color: 'var(--text-primary)' }}>Print receipt</button>
              </div>
            </div>
          </div>
        </>
      )}
    </div>
  )
}
