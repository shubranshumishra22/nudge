'use client'

import { useEffect, useState } from 'react'
import { 
  Store, 
  Search, 
  Filter, 
  ExternalLink,
  Ban,
  CheckCircle,
  Eye,
  AlertTriangle
} from 'lucide-react'
import Link from 'next/link'
import DataTable, { Column } from '@/components/admin/DataTable'

interface StoreRow {
  id: string
  name: string
  slug: string
  owner_id: string
  owner_email: string
  business_type: string
  status: 'live' | 'draft' | 'suspended'
  products_count: number
  orders_count: number
  revenue: number
  created_at: string
}

export default function AdminStoresPage() {
  const [stores, setStores] = useState<StoreRow[]>([])
  const [totalCount, setTotalCount] = useState(0)
  const [page, setPage] = useState(1)
  const [totalPages, setTotalPages] = useState(1)
  const [loading, setLoading] = useState(true)

  // Filters
  const [search, setSearch] = useState('')
  const [statusFilter, setStatusFilter] = useState('All')
  const [typeFilter, setTypeFilter] = useState('All')
  const [sortFilter, setSortFilter] = useState('Newest')

  async function fetchStores() {
    try {
      setLoading(true)
      const params = new URLSearchParams({
        page: page.toString(),
        search,
        status: statusFilter,
        type: typeFilter,
        sort: sortFilter
      })
      const res = await fetch(`/api/admin/stores?${params.toString()}`)
      if (!res.ok) throw new Error('Failed to fetch stores')
      const data = await res.json()
      setStores(data.stores || [])
      setTotalCount(data.totalCount || 0)
      setTotalPages(data.totalPages || 1)
    } catch (err) {
      console.error('Error listing stores:', err)
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    fetchStores()
  }, [page, statusFilter, typeFilter, sortFilter])

  // Simple debounce search
  useEffect(() => {
    const timer = setTimeout(() => {
      setPage(1)
      fetchStores()
    }, 300)
    return () => clearTimeout(timer)
  }, [search])

  async function toggleStoreSuspension(storeId: string, currentStatus: 'live' | 'draft' | 'suspended') {
    const newStatus = currentStatus === 'suspended' ? 'draft' : 'suspended'
    const confirmMessage = currentStatus === 'suspended' 
      ? 'Are you sure you want to lift this store suspension?' 
      : 'Are you sure you want to suspend this store? This will restrict user access.'

    if (!confirm(confirmMessage)) return

    try {
      const res = await fetch(`/api/admin/stores/${storeId}/status`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ status: newStatus })
      })

      if (!res.ok) throw new Error('Failed to update status')
      
      // Update local state
      setStores(prev => prev.map(s => {
        if (s.id === storeId) {
          return { ...s, status: newStatus }
        }
        return s
      }))
    } catch (err) {
      console.error('Error suspending/unsuspending store:', err)
      alert('Failed to update store status')
    }
  }

  const columns: Column<StoreRow>[] = [
    {
      key: 'name',
      label: 'Store Name',
      render: (s) => (
        <div>
          <p className="font-semibold text-white">{s.name}</p>
          <span className="font-mono text-xs opacity-50 block">/{s.slug}</span>
        </div>
      )
    },
    {
      key: 'owner_email',
      label: 'Owner Email',
      render: (s) => (
        <span className="font-mono text-xs text-[#A1A1AA]">{s.owner_email}</span>
      )
    },
    {
      key: 'business_type',
      label: 'Niche / Type',
      render: (s) => (
        <span className="capitalize text-xs text-[#FAFAF8] bg-white/5 border border-white/5 px-2 py-0.5 rounded">
          {s.business_type || 'General'}
        </span>
      )
    },
    {
      key: 'status',
      label: 'Status',
      render: (s) => {
        let badgeColor = 'bg-zinc-500/10 text-zinc-400 border-zinc-500/20'
        if (s.status === 'live') badgeColor = 'bg-emerald-500/10 text-emerald-400 border-emerald-500/20'
        if (s.status === 'suspended') badgeColor = 'bg-red-500/10 text-red-400 border-red-500/20'

        return (
          <span className={`inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-[10px] font-bold uppercase border ${badgeColor}`}>
            {s.status}
          </span>
        )
      }
    },
    {
      key: 'products_count',
      label: 'Products',
      render: (s) => <span className="font-mono">{s.products_count}</span>
    },
    {
      key: 'orders_count',
      label: 'Orders',
      render: (s) => <span className="font-mono">{s.orders_count}</span>
    },
    {
      key: 'revenue',
      label: 'Total Revenue',
      render: (s) => <span className="font-mono">₹{s.revenue ? s.revenue.toFixed(2) : '0.00'}</span>
    },
    {
      key: 'actions',
      label: 'Actions',
      render: (s) => (
        <div className="flex items-center gap-2">
          <Link
            href={`/admin/stores/${s.id}`}
            className="flex items-center gap-1 px-2 py-1 text-xs rounded bg-white/5 border border-white/10 text-white hover:bg-white/10 transition-all font-semibold"
          >
            <Eye size={12} />
            Details
          </Link>
          <button
            onClick={() => toggleStoreSuspension(s.id, s.status)}
            className={`flex items-center gap-1 px-2 py-1 text-xs rounded border transition-all font-semibold ${
              s.status === 'suspended'
                ? 'bg-emerald-500/10 text-emerald-400 border-emerald-500/20 hover:bg-emerald-500/20'
                : 'bg-red-500/10 text-red-400 border-red-500/20 hover:bg-red-500/20'
            }`}
          >
            <Ban size={12} />
            {s.status === 'suspended' ? 'Lift Ban' : 'Suspend'}
          </button>
        </div>
      )
    }
  ]

  return (
    <div className="flex flex-col gap-6">
      {/* Page Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 border-b border-white/5 pb-6">
        <div>
          <h2 className="text-2xl font-serif font-bold text-white flex items-center gap-2">
            <Store className="text-[var(--admin-accent)]" size={24} />
            Platform Storefronts
          </h2>
          <p className="text-xs text-[#6B6B67] mt-1">
            Total stores hosted: {totalCount}. Monitor metrics and suspend abusive accounts.
          </p>
        </div>
      </div>

      {/* Filters Bar */}
      <div className="flex flex-col md:flex-row gap-4 justify-between items-center bg-[#1A1A1A] p-4 rounded-xl border border-white/5">
        {/* Search */}
        <div className="relative w-full md:max-w-xs">
          <Search size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-[#6B6B67]" />
          <input
            type="text"
            placeholder="Search by store name or slug..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="w-full pl-9 pr-4 py-2 text-xs bg-[#242424] border border-white/5 rounded-lg text-white placeholder-[#6B6B67] focus:outline-none focus:border-white/20 transition-colors"
          />
        </div>

        {/* Multi-Filter Selects */}
        <div className="flex flex-wrap items-center gap-3 w-full md:w-auto">
          <div className="flex items-center gap-2 bg-[#242424] border border-white/5 rounded-lg px-3 py-1.5">
            <span className="text-[10px] font-bold text-[#6B6B67] uppercase tracking-wider">Status:</span>
            <select
              value={statusFilter}
              onChange={(e) => {
                setPage(1)
                setStatusFilter(e.target.value)
              }}
              className="bg-transparent text-xs text-white focus:outline-none cursor-pointer"
            >
              <option value="All" className="bg-[#1A1A1A]">All</option>
              <option value="live" className="bg-[#1A1A1A]">Live</option>
              <option value="draft" className="bg-[#1A1A1A]">Draft</option>
              <option value="suspended" className="bg-[#1A1A1A]">Suspended</option>
            </select>
          </div>

          <div className="flex items-center gap-2 bg-[#242424] border border-white/5 rounded-lg px-3 py-1.5">
            <span className="text-[10px] font-bold text-[#6B6B67] uppercase tracking-wider">Niche:</span>
            <select
              value={typeFilter}
              onChange={(e) => {
                setPage(1)
                setTypeFilter(e.target.value)
              }}
              className="bg-transparent text-xs text-white focus:outline-none cursor-pointer"
            >
              <option value="All" className="bg-[#1A1A1A]">All Types</option>
              <option value="streetwear" className="bg-[#1A1A1A]">Streetwear</option>
              <option value="clothing" className="bg-[#1A1A1A]">Clothing</option>
              <option value="apparel" className="bg-[#1A1A1A]">Apparel</option>
              <option value="fashion" className="bg-[#1A1A1A]">Fashion</option>
            </select>
          </div>

          <div className="flex items-center gap-2 bg-[#242424] border border-white/5 rounded-lg px-3 py-1.5">
            <span className="text-[10px] font-bold text-[#6B6B67] uppercase tracking-wider">Sort:</span>
            <select
              value={sortFilter}
              onChange={(e) => {
                setPage(1)
                setSortFilter(e.target.value)
              }}
              className="bg-transparent text-xs text-white focus:outline-none cursor-pointer"
            >
              <option value="Newest" className="bg-[#1A1A1A]">Newest</option>
              <option value="Most orders" className="bg-[#1A1A1A]">Most Orders</option>
              <option value="Most revenue" className="bg-[#1A1A1A]">Most Revenue</option>
            </select>
          </div>
        </div>
      </div>

      {/* Data Table */}
      <DataTable
        columns={columns}
        data={stores}
        loading={loading}
        currentPage={page}
        totalPages={totalPages}
        onPageChange={setPage}
      />
    </div>
  )
}
