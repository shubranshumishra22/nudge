'use client'

import { useState } from 'react'
import { 
  Store, 
  ArrowLeft, 
  Settings, 
  Package, 
  ShoppingBag, 
  Play, 
  Ban, 
  CheckCircle,
  Copy,
  ChevronDown,
  ChevronUp,
  FileCode,
  DollarSign
} from 'lucide-react'
import Link from 'next/link'

interface StoreDetailClientProps {
  store: {
    id: string
    name: string
    slug: string
    owner_id: string
    owner_email: string
    business_type: string
    status: 'live' | 'draft' | 'suspended'
    design_tokens: any
    created_at: string
  }
  products: any[]
  orders: any[]
}

export default function StoreDetailClient({ store: initialStore, products, orders }: StoreDetailClientProps) {
  const [store, setStore] = useState(initialStore)
  const [isUpdating, setIsUpdating] = useState(false)
  const [jsonExpanded, setJsonExpanded] = useState(true)
  const [copied, setCopied] = useState(false)

  async function updateStatus(newStatus: 'live' | 'draft' | 'suspended') {
    const confirmMessage = newStatus === 'suspended'
      ? 'Are you sure you want to suspend this store?'
      : newStatus === 'live'
      ? 'Are you sure you want to force publish this store live?'
      : 'Are you sure you want to revert this store to draft?'

    if (!confirm(confirmMessage)) return

    try {
      setIsUpdating(true)
      const res = await fetch(`/api/admin/stores/${store.id}/status`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ status: newStatus })
      })

      if (!res.ok) throw new Error('Failed to update status')
      
      setStore(prev => ({ ...prev, status: newStatus }))
    } catch (err) {
      console.error('Error updating store status:', err)
      alert('Failed to update status')
    } finally {
      setIsUpdating(false)
    }
  }

  function handleCopyJson() {
    navigator.clipboard.writeText(JSON.stringify(store.design_tokens, null, 2))
    setCopied(true)
    setTimeout(() => setCopied(false), 2000)
  }

  const totalRevenue = orders
    .filter(o => o.status !== 'cancelled')
    .reduce((sum, o) => sum + (o.total || 0), 0)

  return (
    <div className="flex flex-col gap-8">
      {/* Header and Back Link */}
      <div className="flex flex-col gap-4">
        <Link 
          href="/admin/stores"
          className="flex items-center gap-2 text-xs font-semibold text-[#6B6B67] hover:text-white transition-colors self-start"
        >
          <ArrowLeft size={14} />
          Back to storefronts
        </Link>
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-6 border-b border-white/5 pb-6">
          <div className="flex items-start gap-4">
            <div className="p-3 bg-[#242424] rounded-xl border border-white/5 text-[var(--admin-accent)]">
              <Store size={28} />
            </div>
            <div>
              <div className="flex items-center gap-3">
                <h2 className="text-2xl font-serif font-bold text-white">{store.name}</h2>
                <span className={`inline-flex items-center px-2 py-0.5 rounded-full text-[10px] font-bold uppercase border ${
                  store.status === 'live' 
                    ? 'bg-emerald-500/10 text-emerald-400 border-emerald-500/20' 
                    : store.status === 'suspended'
                    ? 'bg-red-500/10 text-red-400 border-red-500/20'
                    : 'bg-zinc-500/10 text-zinc-400 border-zinc-500/20'
                }`}>
                  {store.status}
                </span>
              </div>
              <p className="text-xs text-[#6B6B67] mt-1">
                ID: <span className="font-mono">{store.id}</span> • Niche: <span className="capitalize">{store.business_type || 'General'}</span>
              </p>
            </div>
          </div>

          {/* Quick Actions Panel */}
          <div className="flex items-center gap-2">
            {store.status !== 'live' && (
              <button
                disabled={isUpdating}
                onClick={() => updateStatus('live')}
                className="flex items-center gap-1.5 px-3 py-2 text-xs rounded bg-emerald-500 text-black hover:bg-emerald-400 font-bold transition-all disabled:opacity-50"
              >
                <Play size={13} fill="currentColor" />
                Force Publish Live
              </button>
            )}
            
            {store.status === 'suspended' ? (
              <button
                disabled={isUpdating}
                onClick={() => updateStatus('draft')}
                className="flex items-center gap-1.5 px-3 py-2 text-xs rounded bg-white/5 border border-white/10 text-white hover:bg-white/10 font-bold transition-all disabled:opacity-50"
              >
                <CheckCircle size={13} />
                Lift Suspension
              </button>
            ) : (
              <button
                disabled={isUpdating}
                onClick={() => updateStatus('suspended')}
                className="flex items-center gap-1.5 px-3 py-2 text-xs rounded bg-[#7F1D1D] text-[#FCA5A5] hover:bg-[#991B1B] font-bold transition-all disabled:opacity-50"
              >
                <Ban size={13} />
                Suspend Storefront
              </button>
            )}
          </div>
        </div>
      </div>

      {/* Stats Summary Grid */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
        <div className="bg-[#1A1A1A] border border-white/5 p-5 rounded-xl">
          <span className="text-[10px] font-bold text-[#6B6B67] uppercase tracking-wider block">Owner Address</span>
          <span className="text-sm font-semibold text-white mt-1 block truncate font-mono" title={store.owner_email}>
            {store.owner_email}
          </span>
          <span className="text-[9px] font-mono text-[#6B6B67] block mt-1">ID: {store.owner_id.substring(0, 8)}...</span>
        </div>
        <div className="bg-[#1A1A1A] border border-white/5 p-5 rounded-xl">
          <span className="text-[10px] font-bold text-[#6B6B67] uppercase tracking-wider block">Total Products</span>
          <span className="text-2xl font-serif font-bold text-white mt-1 block">
            {products.length}
          </span>
          <span className="text-[9px] font-mono text-[#6B6B67] block mt-1">Items in catalog</span>
        </div>
        <div className="bg-[#1A1A1A] border border-white/5 p-5 rounded-xl">
          <span className="text-[10px] font-bold text-[#6B6B67] uppercase tracking-wider block">Total Orders</span>
          <span className="text-2xl font-serif font-bold text-white mt-1 block">
            {orders.length}
          </span>
          <span className="text-[9px] font-mono text-[#6B6B67] block mt-1">Completed purchases</span>
        </div>
        <div className="bg-[#1A1A1A] border border-white/5 p-5 rounded-xl">
          <span className="text-[10px] font-bold text-[#6B6B67] uppercase tracking-wider block">Revenue (INR)</span>
          <span className="text-2xl font-serif font-bold text-white mt-1 block">
            ₹{totalRevenue.toLocaleString('en-IN', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
          </span>
          <span className="text-[9px] font-mono text-[#6B6B67] block mt-1">Total sales GMV</span>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Main Details and Design Tokens */}
        <div className="lg:col-span-2 flex flex-col gap-6">
          {/* Design Tokens Collapsible JSON Viewer */}
          <div className="bg-[#1A1A1A] border border-white/5 rounded-xl overflow-hidden">
            <button
              onClick={() => setJsonExpanded(!jsonExpanded)}
              className="w-full flex items-center justify-between px-6 py-4 bg-[#242424] text-sm font-semibold text-white border-b border-white/5"
            >
              <div className="flex items-center gap-2 text-indigo-400">
                <FileCode size={16} />
                <span>Collapsible Design Token JSON Viewer</span>
              </div>
              <div className="flex items-center gap-4 text-xs text-[#6B6B67] font-semibold">
                <span className="font-mono">JSONB Payload</span>
                {jsonExpanded ? <ChevronUp size={16} /> : <ChevronDown size={16} />}
              </div>
            </button>

            {jsonExpanded && (
              <div className="p-6 flex flex-col gap-4">
                <div className="flex items-center justify-between">
                  <span className="text-[10px] font-mono text-[#6B6B67]">
                    store.design_tokens
                  </span>
                  <button
                    onClick={handleCopyJson}
                    className="flex items-center gap-1 text-[11px] font-semibold text-[#A1A1AA] hover:text-white transition-colors"
                  >
                    <Copy size={12} />
                    {copied ? 'Copied!' : 'Copy Schema'}
                  </button>
                </div>
                <div className="bg-[#0F0F0E] border border-white/5 rounded-lg p-4 overflow-x-auto max-h-[400px]">
                  <pre className="font-mono text-xs text-emerald-400 leading-relaxed">
                    {JSON.stringify(store.design_tokens || {}, null, 2)}
                  </pre>
                </div>
              </div>
            )}
          </div>

          {/* Products List Panel */}
          <div className="bg-[#1A1A1A] border border-white/5 rounded-xl p-6 flex flex-col gap-4">
            <h3 className="text-sm font-semibold tracking-wider text-[#6B6B67] uppercase flex items-center gap-2">
              <Package size={16} className="text-amber-400" />
              Products Catalog
            </h3>
            {products.length === 0 ? (
              <p className="text-xs text-[#6B6B67] py-4 text-center">No products created in this store.</p>
            ) : (
              <div className="border border-white/5 rounded-lg overflow-hidden">
                <table className="w-full text-left border-collapse text-xs">
                  <thead>
                    <tr className="bg-[#242424] border-b border-white/5 text-[#6B6B67] font-semibold">
                      <th className="p-2.5">Image</th>
                      <th className="p-2.5">Name</th>
                      <th className="p-2.5">Price</th>
                      <th className="p-2.5">Created At</th>
                    </tr>
                  </thead>
                  <tbody>
                    {products.map((p) => (
                      <tr key={p.id} className="border-b border-white/5 hover:bg-white/[0.02]">
                        <td className="p-2.5">
                          {p.image_url ? (
                            <img src={p.image_url} alt="" className="h-8 w-8 object-cover rounded bg-white/5" />
                          ) : (
                            <div className="h-8 w-8 rounded bg-white/5 flex items-center justify-center text-[10px] text-[#6B6B67]">
                              No img
                            </div>
                          )}
                        </td>
                        <td className="p-2.5 font-semibold text-white">{p.name || 'Untitled Product'}</td>
                        <td className="p-2.5 font-mono text-[#A1A1AA]">₹{Number(p.price || 0).toFixed(2)}</td>
                        <td className="p-2.5 font-mono text-[#6B6B67]">
                          {new Date(p.created_at).toLocaleDateString()}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
          </div>
        </div>

        {/* Right Pane: Recent Orders */}
        <div className="bg-[#1A1A1A] border border-white/5 rounded-xl p-6 flex flex-col gap-4 h-fit">
          <h3 className="text-sm font-semibold tracking-wider text-[#6B6B67] uppercase flex items-center gap-2">
            <ShoppingBag size={16} className="text-pink-400" />
            Recent Sales
          </h3>
          {orders.length === 0 ? (
            <p className="text-xs text-[#6B6B67] py-4 text-center">No orders placed on this storefront yet.</p>
          ) : (
            <div className="flex flex-col gap-3">
              {orders.map((o) => {
                let badgeColor = 'bg-zinc-500/10 text-zinc-400 border-zinc-500/20'
                if (o.status === 'completed' || o.status === 'paid') badgeColor = 'bg-emerald-500/10 text-emerald-400 border-emerald-500/20'
                if (o.status === 'cancelled') badgeColor = 'bg-red-500/10 text-red-400 border-red-500/20'

                return (
                  <div key={o.id} className="p-3 rounded-lg bg-[#242424]/40 border border-white/[0.02] flex items-center justify-between text-xs">
                    <div className="flex flex-col gap-0.5">
                      <span className="font-mono text-[10px] text-[#6B6B67]">#{o.id.substring(0, 8)}</span>
                      <span className="font-semibold text-white">{o.customer_name || 'Anonymous Guest'}</span>
                      <span className="text-[10px] text-[#6B6B67]">
                        {new Date(o.created_at).toLocaleDateString()}
                      </span>
                    </div>
                    <div className="flex flex-col items-end gap-1.5">
                      <span className="font-mono font-bold text-white">₹{Number(o.total || 0).toFixed(2)}</span>
                      <span className={`px-2 py-0.5 rounded text-[9px] font-bold uppercase border ${badgeColor}`}>
                        {o.status}
                      </span>
                    </div>
                  </div>
                )
              })}
            </div>
          )}
        </div>
      </div>
    </div>
  )
}
