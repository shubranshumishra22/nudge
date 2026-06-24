'use client'

import { useState } from 'react'
import { Search, Plus, Pencil, Trash2, X, GripVertical, Upload } from 'lucide-react'

interface Product {
  id: string; name: string; slug: string; description: string | null; price: number
  compare_at_price: number | null; category: string | null; sku: string | null
  stock_status: string; stock_quantity: number | null; is_featured: boolean; sort_order: number
}

export default function ProductsClient({
  store, products: initial, categories, imageMap,
}: {
  store: any; products: Product[]; categories: string[]; imageMap: Record<string, string>
}) {
  const [products, setProducts] = useState(initial)
  const [search, setSearch] = useState('')
  const [selected, setSelected] = useState<Set<string>>(new Set())
  const [panel, setPanel] = useState<{ mode: 'add' | 'edit'; product?: Product } | null>(null)
  const [deleteConfirm, setDeleteConfirm] = useState<Product | null>(null)
  const [uploadedImages, setUploadedImages] = useState<string[]>([])

  const allSelected = selected.size === products.length
  const filtered = products.filter((p) => p.name.toLowerCase().includes(search.toLowerCase()))

  function toggleAll() { if (allSelected) setSelected(new Set()); else setSelected(new Set(products.map((p) => p.id))) }
  function toggleOne(id: string) { const s = new Set(selected); s.has(id) ? s.delete(id) : s.add(id); setSelected(s) }

  const handleBulkDelete = async () => {
    if (!confirm(`Delete ${selected.size} products?`)) return
    for (const id of selected) {
      await fetch('/api/products', { method: 'DELETE', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ id }) })
    }
    setProducts((p) => p.filter((x) => !selected.has(x.id)))
    setSelected(new Set())
  }

  return (
    <div>
      <div className="flex items-center justify-between">
        <h1 className="font-serif text-2xl font-bold tracking-tight" style={{ color: 'var(--text-primary)' }}>Products</h1>
        <button onClick={() => { setPanel({ mode: 'add' }); setUploadedImages([]) }} className="flex items-center gap-2 rounded-[10px] px-4 py-2.5 text-sm font-semibold transition-opacity hover:opacity-90" style={{ backgroundColor: 'var(--bg-inverse)', color: 'var(--text-inverse)' }}>
          <Plus size={16} /> Add product
        </button>
      </div>

      <div className="mt-4 flex items-center gap-3">
        <div className="relative flex-1">
          <Search size={16} className="absolute left-3 top-1/2 -translate-y-1/2" style={{ color: 'var(--text-secondary)' }} />
          <input
            className="w-full rounded-[10px] border py-2.5 pl-9 pr-4 text-sm outline-none transition-colors focus:border-[var(--border-focus)]"
            style={{ backgroundColor: 'var(--bg-surface)', borderColor: 'var(--border-default)', color: 'var(--text-primary)' }}
            placeholder="Search products..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
          />
        </div>
        {selected.size > 0 && (
          <button onClick={handleBulkDelete} className="flex items-center gap-1.5 rounded-[10px] border px-3 py-2.5 text-xs font-medium transition-colors" style={{ borderColor: 'rgba(239,68,68,0.3)', color: '#EF4444' }}>
            <Trash2 size={14} /> Delete {selected.size}
          </button>
        )}
      </div>

      <div className="mt-4 overflow-x-auto rounded-xl border" style={{ borderColor: 'var(--border-default)' }}>
        <table className="w-full text-left text-sm">
          <thead className="border-b text-xs" style={{ backgroundColor: 'var(--bg-subtle)', borderColor: 'var(--border-default)', color: 'var(--text-secondary)' }}>
            <tr>
              <th className="w-10 px-3 py-3"><input type="checkbox" checked={allSelected} onChange={toggleAll} className="h-4 w-4 bg-transparent" /></th>
              <th className="px-3 py-3 font-medium">Image</th>
              <th className="px-3 py-3 font-medium">Name</th>
              <th className="px-3 py-3 font-medium">Price</th>
              <th className="px-3 py-3 font-medium">Category</th>
              <th className="px-3 py-3 font-medium">Stock</th>
              <th className="w-20 px-3 py-3 font-medium">Actions</th>
            </tr>
          </thead>
          <tbody>
            {filtered.map((p) => (
              <tr key={p.id} className="border-b last:border-0 hover:bg-[var(--bg-subtle)]/50 transition-colors" style={{ borderColor: 'var(--border-default)' }}>
                <td className="px-3 py-3"><input type="checkbox" checked={selected.has(p.id)} onChange={() => toggleOne(p.id)} className="h-4 w-4 bg-transparent" /></td>
                <td className="px-3 py-3">
                  <div className="h-10 w-10 overflow-hidden rounded-lg bg-[var(--bg-subtle)]" style={{ border: '1px solid var(--border-default)' }}>
                    {imageMap[p.id] ? <img src={imageMap[p.id]} alt="" className="h-full w-full object-cover" /> : <div className="flex h-full items-center justify-center text-xs" style={{ color: 'var(--text-tertiary)' }}>—</div>}
                  </div>
                </td>
                <td className="px-3 py-3 font-medium" style={{ color: 'var(--text-primary)' }}>{p.name}</td>
                <td className="px-3 py-3" style={{ color: 'var(--text-primary)' }}>₹{p.price.toLocaleString('en-IN')}</td>
                <td className="px-3 py-3 text-xs" style={{ color: 'var(--text-secondary)' }}>{p.category || '—'}</td>
                <td className="px-3 py-3">
                  <span className={`inline-block rounded-full px-2 py-0.5 text-[10px] font-medium`} style={{
                    backgroundColor: p.stock_status === 'in_stock' ? 'rgba(34,197,94,0.12)' : p.stock_status === 'limited' ? 'rgba(234,179,8,0.12)' : 'rgba(239,68,68,0.12)',
                    color: p.stock_status === 'in_stock' ? '#22c55e' : p.stock_status === 'limited' ? '#eab308' : '#EF4444',
                  }}>{p.stock_status.replace(/_/g, ' ')}</span>
                </td>
                <td className="px-3 py-3">
                  <div className="flex items-center gap-2">
                    <button onClick={() => { setPanel({ mode: 'edit', product: p }); setUploadedImages(imageMap[p.id] ? [imageMap[p.id]] : []) }} className="transition-colors text-[var(--text-secondary)] hover:text-[var(--text-primary)]"><Pencil size={15} /></button>
                    <button onClick={() => setDeleteConfirm(p)} className="transition-colors text-[var(--text-secondary)] hover:text-red-600"><Trash2 size={15} /></button>
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {panel && <ProductPanel store={store} panel={panel} images={uploadedImages} onClose={() => setPanel(null)} onSaved={(p: Product) => { if (panel.mode === 'add') setProducts((prev) => [...prev, p]); else setProducts((prev) => prev.map((x) => x.id === p.id ? p : x)); setPanel(null) }} />}
      {deleteConfirm && <DeleteDialog product={deleteConfirm} onClose={() => setDeleteConfirm(null)} onDeleted={(id: string) => { setProducts((p) => p.filter((x) => x.id !== id)); setDeleteConfirm(null) }} />}
    </div>
  )
}

function ProductPanel({ store, panel, images: initialImages, onClose, onSaved }: any) {
  const isEdit = panel.mode === 'edit'
  const product = panel.product || {}
  const [form, setForm] = useState({ name: product.name || '', price: product.price?.toString() || '', compare_at_price: product.compare_at_price?.toString() || '', description: product.description || '', category: product.category || '', sku: product.sku || '', stock_status: product.stock_status || 'in_stock', stock_quantity: product.stock_quantity?.toString() || '', is_featured: product.is_featured || false })
  const [images, setImages] = useState<string[]>(initialImages)
  const [saving, setSaving] = useState(false)

  const handleUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (!file) return
    const formData = new FormData()
    formData.append('file', file)
    const res = await fetch('/api/upload/image', { method: 'POST', body: formData })
    const data = await res.json()
    if (data.url) setImages((prev) => [...prev, data.url])
  }

  const handleSave = async () => {
    setSaving(true)
    const body: any = { store_id: store.id, name: form.name, price: parseFloat(form.price), compare_at_price: form.compare_at_price ? parseFloat(form.compare_at_price) : null, description: form.description, category: form.category, sku: form.sku, stock_status: form.stock_status, stock_quantity: form.stock_status === 'limited' ? parseInt(form.stock_quantity) : null, is_featured: form.is_featured, images }
    if (isEdit) body.id = product.id

    const res = await fetch('/api/products', { method: isEdit ? 'PATCH' : 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify(body) })
    const data = await res.json()
    if (data.product) {
      fetch('/api/revalidate', { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ slug: store.slug }) })
      onSaved(data.product)
    }
    setSaving(false)
  }

  return (
    <>
      <div className="fixed inset-0 z-40 bg-black/40 backdrop-blur-sm" onClick={onClose} />
      <div className="fixed right-0 top-0 z-50 flex h-full w-full flex-col shadow-xl md:w-[400px]" style={{ backgroundColor: 'var(--bg-surface)', borderLeft: '1px solid var(--border-default)', color: 'var(--text-primary)' }}>
        <div className="flex items-center justify-between border-b px-5 py-4" style={{ borderColor: 'var(--border-default)' }}>
          <h2 className="text-sm font-semibold">{isEdit ? 'Edit product' : 'Add product'}</h2>
          <button onClick={onClose} style={{ color: 'var(--text-secondary)' }} className="hover:text-[var(--text-primary)]"><X size={18} /></button>
        </div>
        <div className="flex-1 overflow-y-auto px-5 py-4">
          <div className="space-y-4">
            <div>
              <label className="mb-1 block text-xs font-medium" style={{ color: 'var(--text-secondary)' }}>Name *</label>
              <input className="w-full rounded-[10px] border px-3 py-2.5 text-sm outline-none transition-colors focus:border-[var(--border-focus)]" style={{ backgroundColor: 'var(--bg-base)', borderColor: 'var(--border-default)', color: 'var(--text-primary)' }} value={form.name} onChange={(e) => setForm({ ...form, name: e.target.value })} />
            </div>
            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="mb-1 block text-xs font-medium" style={{ color: 'var(--text-secondary)' }}>Price (₹) *</label>
                <input type="number" className="w-full rounded-[10px] border px-3 py-2.5 text-sm outline-none transition-colors focus:border-[var(--border-focus)]" style={{ backgroundColor: 'var(--bg-base)', borderColor: 'var(--border-default)', color: 'var(--text-primary)' }} value={form.price} onChange={(e) => setForm({ ...form, price: e.target.value })} />
              </div>
              <div>
                <label className="mb-1 block text-xs font-medium" style={{ color: 'var(--text-secondary)' }}>Compare-at price</label>
                <input type="number" className="w-full rounded-[10px] border px-3 py-2.5 text-sm outline-none transition-colors focus:border-[var(--border-focus)]" style={{ backgroundColor: 'var(--bg-base)', borderColor: 'var(--border-default)', color: 'var(--text-primary)' }} value={form.compare_at_price} onChange={(e) => setForm({ ...form, compare_at_price: e.target.value })} />
              </div>
            </div>
            <div>
              <label className="mb-1 block text-xs font-medium" style={{ color: 'var(--text-secondary)' }}>Description</label>
              <textarea rows={3} className="w-full rounded-[10px] border px-3 py-2.5 text-sm outline-none transition-colors focus:border-[var(--border-focus)]" style={{ backgroundColor: 'var(--bg-base)', borderColor: 'var(--border-default)', color: 'var(--text-primary)' }} value={form.description} onChange={(e) => setForm({ ...form, description: e.target.value })} />
            </div>
            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="mb-1 block text-xs font-medium" style={{ color: 'var(--text-secondary)' }}>Category</label>
                <input list="cats" className="w-full rounded-[10px] border px-3 py-2.5 text-sm outline-none transition-colors focus:border-[var(--border-focus)]" style={{ backgroundColor: 'var(--bg-base)', borderColor: 'var(--border-default)', color: 'var(--text-primary)' }} value={form.category} onChange={(e) => setForm({ ...form, category: e.target.value })} /><datalist id="cats">{(store.categories || []).map((c: string) => <option key={c} value={c} />)}</datalist>
              </div>
              <div>
                <label className="mb-1 block text-xs font-medium" style={{ color: 'var(--text-secondary)' }}>SKU</label>
                <input className="w-full rounded-[10px] border px-3 py-2.5 text-sm outline-none transition-colors focus:border-[var(--border-focus)]" style={{ backgroundColor: 'var(--bg-base)', borderColor: 'var(--border-default)', color: 'var(--text-primary)' }} value={form.sku} onChange={(e) => setForm({ ...form, sku: e.target.value })} />
              </div>
            </div>
            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="mb-1 block text-xs font-medium" style={{ color: 'var(--text-secondary)' }}>Stock status</label>
                <select className="w-full rounded-[10px] border px-3 py-2.5 text-sm outline-none transition-colors focus:border-[var(--border-focus)]" style={{ backgroundColor: 'var(--bg-base)', borderColor: 'var(--border-default)', color: 'var(--text-primary)' }} value={form.stock_status} onChange={(e) => setForm({ ...form, stock_status: e.target.value })}>
                  <option value="in_stock" style={{ backgroundColor: 'var(--bg-surface)' }}>In stock</option>
                  <option value="limited" style={{ backgroundColor: 'var(--bg-surface)' }}>Limited</option>
                  <option value="out_of_stock" style={{ backgroundColor: 'var(--bg-surface)' }}>Out of stock</option>
                </select>
              </div>
              {form.stock_status === 'limited' && (
                <div>
                  <label className="mb-1 block text-xs font-medium" style={{ color: 'var(--text-secondary)' }}>Quantity</label>
                  <input type="number" className="w-full rounded-[10px] border px-3 py-2.5 text-sm outline-none transition-colors focus:border-[var(--border-focus)]" style={{ backgroundColor: 'var(--bg-base)', borderColor: 'var(--border-default)', color: 'var(--text-primary)' }} value={form.stock_quantity} onChange={(e) => setForm({ ...form, stock_quantity: e.target.value })} />
                </div>
              )}
            </div>
            <div>
              <label className="mb-1 block text-xs font-medium" style={{ color: 'var(--text-secondary)' }}>Images</label>
              <div className="flex flex-wrap gap-2">
                {images.map((url: string, i: number) => (
                  <div key={i} className="relative h-16 w-16 overflow-hidden rounded-lg border" style={{ borderColor: 'var(--border-default)' }}>
                    <img src={url} alt="" className="h-full w-full object-cover" />
                    <button className="absolute right-0.5 top-0.5 flex h-4 w-4 items-center justify-center rounded-full bg-black/50 text-white" onClick={() => setImages(images.filter((_, j) => j !== i))}><X size={10} /></button>
                  </div>
                ))}
                {images.length < 5 && (
                  <label className="flex h-16 w-16 cursor-pointer items-center justify-center rounded-lg border border-dashed transition-colors hover:bg-[var(--bg-subtle)]" style={{ borderColor: 'var(--border-default)', color: 'var(--text-secondary)' }}>
                    <input type="file" accept="image/*" className="hidden" onChange={handleUpload} />
                    <Upload size={18} />
                  </label>
                )}
              </div>
            </div>
            <label className="flex items-center gap-2 text-sm" style={{ color: 'var(--text-primary)' }}><input type="checkbox" checked={form.is_featured} onChange={(e) => setForm({ ...form, is_featured: e.target.checked })} className="h-4 w-4" /> Featured product</label>
          </div>
        </div>
        <div className="border-t px-5 py-4" style={{ borderColor: 'var(--border-default)' }}>
          <button onClick={handleSave} disabled={saving || !form.name || !form.price} className="w-full rounded-[10px] py-3 text-sm font-semibold transition-opacity hover:opacity-90 disabled:opacity-50" style={{ backgroundColor: 'var(--bg-inverse)', color: 'var(--text-inverse)' }}>{saving ? 'Saving...' : 'Save'}</button>
        </div>
      </div>
    </>
  )
}

function DeleteDialog({ product, onClose, onDeleted }: any) {
  const [deleting, setDeleting] = useState(false)
  const handleDelete = async () => {
    setDeleting(true)
    await fetch('/api/products', { method: 'DELETE', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ id: product.id }) })
    onDeleted(product.id)
  }
  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 backdrop-blur-sm">
      <div className="w-full max-w-sm rounded-xl p-6 shadow-xl border" style={{ backgroundColor: 'var(--bg-surface)', borderColor: 'var(--border-default)', color: 'var(--text-primary)' }}>
        <h3 className="text-sm font-semibold">Delete {product.name}?</h3>
        <p className="mt-2 text-xs" style={{ color: 'var(--text-secondary)' }}>This cannot be undone.</p>
        <div className="mt-4 flex justify-end gap-3">
          <button onClick={onClose} className="rounded-[10px] border px-4 py-2 text-xs font-medium hover:bg-[var(--bg-subtle)] transition-colors" style={{ borderColor: 'var(--border-default)', color: 'var(--text-secondary)' }}>Cancel</button>
          <button onClick={handleDelete} disabled={deleting} className="rounded-[10px] px-4 py-2 text-xs font-medium transition-opacity disabled:opacity-50" style={{ backgroundColor: '#EF4444', color: 'white' }}>{deleting ? 'Deleting...' : 'Delete'}</button>
        </div>
      </div>
    </div>
  )
}
