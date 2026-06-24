'use client'

import { useEffect, useState, useCallback } from 'react'
import { 
  ShoppingBag, 
  Search, 
  Filter, 
  IndianRupee,
  Calendar,
  CreditCard
} from 'lucide-react'
import DataTable, { Column } from '@/components/admin/DataTable'

interface OrderRow {
  id: string
  order_number: string
  store_name: string
  customer_name: string
  customer_email: string
  customer_phone: string
  total: number
  payment_method: string
  status: 'pending' | 'completed' | 'cancelled' | 'paid'
  created_at: string
}

export default function AdminOrdersPage() {
  const [orders, setOrders] = useState<OrderRow[]>([])
  const [totalCount, setTotalCount] = useState(0)
  const [page, setPage] = useState(1)
  const [totalPages, setTotalPages] = useState(1)
  const [loading, setLoading] = useState(true)

  // Filters
  const [search, setSearch] = useState('')
  const [statusFilter, setStatusFilter] = useState('All')
  const [paymentFilter, setPaymentFilter] = useState('All')

  const fetchOrders = useCallback(async () => {
    try {
      setLoading(true)
      const params = new URLSearchParams({
        page: page.toString(),
        search,
        status: statusFilter,
        payment: paymentFilter
      })
      const res = await fetch(`/api/admin/orders?${params.toString()}`)
      if (!res.ok) throw new Error('Failed to fetch orders')
      const data = await res.json()
      setOrders(data.orders || [])
      setTotalCount(data.totalCount || 0)
      setTotalPages(data.totalPages || 1)
    } catch (err) {
      console.error('Error listing orders:', err)
    } finally {
      setLoading(false)
    }
  }, [page, search, statusFilter, paymentFilter])

  useEffect(() => {
    fetchOrders()
  }, [fetchOrders])

  // Simple debounce search
  useEffect(() => {
    const timer = setTimeout(() => {
      setPage(1)
      fetchOrders()
    }, 300)
    return () => clearTimeout(timer)
  }, [search, fetchOrders])

  const columns: Column<OrderRow>[] = [
    {
      key: 'order_number',
      label: 'Order Num',
      render: (o) => (
        <span className="font-mono text-xs font-semibold text-white">
          {o.order_number || `#${o.id.substring(0, 8)}`}
        </span>
      )
    },
    {
      key: 'store_name',
      label: 'Storefront',
      render: (o) => <span className="font-semibold text-indigo-400">{o.store_name}</span>
    },
    {
      key: 'customer_name',
      label: 'Customer',
      render: (o) => (
        <div>
          <p className="font-medium text-white">{o.customer_name || 'Guest'}</p>
          {o.customer_email && <span className="text-[10px] text-[#6B6B67] font-mono block">{o.customer_email}</span>}
        </div>
      )
    },
    {
      key: 'total',
      label: 'Grand Total',
      render: (o) => (
        <span className="font-mono font-bold text-white">
          ₹{o.total ? o.total.toFixed(2) : '0.00'}
        </span>
      )
    },
    {
      key: 'payment_method',
      label: 'Payment',
      render: (o) => (
        <span className="capitalize text-xs font-mono text-[#A1A1AA]">
          {o.payment_method || 'UPI / Card'}
        </span>
      )
    },
    {
      key: 'status',
      label: 'Status',
      render: (o) => {
        let badgeColor = 'bg-zinc-500/10 text-zinc-400 border-zinc-500/20'
        if (o.status === 'completed' || o.status === 'paid') badgeColor = 'bg-emerald-500/10 text-emerald-400 border-emerald-500/20'
        if (o.status === 'cancelled') badgeColor = 'bg-red-500/10 text-red-400 border-red-500/20'

        return (
          <span className={`inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-[10px] font-bold uppercase border ${badgeColor}`}>
            {o.status}
          </span>
        )
      }
    },
    {
      key: 'created_at',
      label: 'Placed At',
      render: (o) => (
        <span className="font-mono text-xs opacity-65">
          {new Date(o.created_at).toLocaleDateString()} {new Date(o.created_at).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
        </span>
      )
    }
  ]

  return (
    <div className="flex flex-col gap-6">
      {/* Page Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 border-b border-white/5 pb-6">
        <div>
          <h2 className="text-2xl font-serif font-bold text-white flex items-center gap-2">
            <ShoppingBag className="text-[var(--admin-accent)]" size={24} />
            Global Platform Orders
          </h2>
          <p className="text-xs text-[#6B6B67] mt-1">
            Total transactions across all hosted stores: {totalCount}.
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
            placeholder="Search by order # or customer..."
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
              <option value="All" className="bg-[#1A1A1A]">All Statuses</option>
              <option value="pending" className="bg-[#1A1A1A]">Pending</option>
              <option value="paid" className="bg-[#1A1A1A]">Paid</option>
              <option value="completed" className="bg-[#1A1A1A]">Completed</option>
              <option value="cancelled" className="bg-[#1A1A1A]">Cancelled</option>
            </select>
          </div>

          <div className="flex items-center gap-2 bg-[#242424] border border-white/5 rounded-lg px-3 py-1.5">
            <span className="text-[10px] font-bold text-[#6B6B67] uppercase tracking-wider">Method:</span>
            <select
              value={paymentFilter}
              onChange={(e) => {
                setPage(1)
                setPaymentFilter(e.target.value)
              }}
              className="bg-transparent text-xs text-white focus:outline-none cursor-pointer"
            >
              <option value="All" className="bg-[#1A1A1A]">All Payment Methods</option>
              <option value="upi" className="bg-[#1A1A1A]">UPI</option>
              <option value="card" className="bg-[#1A1A1A]">Card</option>
              <option value="cod" className="bg-[#1A1A1A]">COD</option>
            </select>
          </div>
        </div>
      </div>

      {/* Data Table */}
      <DataTable
        columns={columns}
        data={orders}
        loading={loading}
        currentPage={page}
        totalPages={totalPages}
        onPageChange={setPage}
      />
    </div>
  )
}
