'use client'

import { useEffect, useState } from 'react'
import { 
  Users, 
  Search, 
  Filter, 
  Crown, 
  ExternalLink,
  ChevronDown
} from 'lucide-react'
import DataTable, { Column } from '@/components/admin/DataTable'

interface UserRow {
  id: string
  email: string
  full_name: string
  plan: 'free' | 'pro' | 'agency'
  plan_expires_at: string | null
  stores_count: number
  orders_count: number
  created_at: string
}

export default function AdminUsersPage() {
  const [users, setUsers] = useState<UserRow[]>([])
  const [totalCount, setTotalCount] = useState(0)
  const [page, setPage] = useState(1)
  const [totalPages, setTotalPages] = useState(1)
  const [loading, setLoading] = useState(true)

  // Filters
  const [search, setSearch] = useState('')
  const [planFilter, setPlanFilter] = useState('All')
  const [sortFilter, setSortFilter] = useState('Newest')

  // Selected user for modal
  const [selectedUser, setSelectedUser] = useState<UserRow | null>(null)
  const [isUpdating, setIsUpdating] = useState(false)
  const [updatePlan, setUpdatePlan] = useState<'free' | 'pro' | 'agency'>('free')

  async function fetchUsers() {
    try {
      setLoading(true)
      const params = new URLSearchParams({
        page: page.toString(),
        search,
        plan: planFilter,
        sort: sortFilter
      })
      const res = await fetch(`/api/admin/users?${params.toString()}`)
      if (!res.ok) throw new Error('Failed to fetch users')
      const data = await res.json()
      setUsers(data.users || [])
      setTotalCount(data.totalCount || 0)
      setTotalPages(data.totalPages || 1)
    } catch (err) {
      console.error('Error listing users:', err)
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    fetchUsers()
  }, [page, planFilter, sortFilter])

  // Simple debounce search
  useEffect(() => {
    const timer = setTimeout(() => {
      setPage(1)
      fetchUsers()
    }, 300)
    return () => clearTimeout(timer)
  }, [search])

  async function handlePlanUpdate() {
    if (!selectedUser) return
    try {
      setIsUpdating(true)
      const res = await fetch(`/api/admin/users/${selectedUser.id}/plan`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ plan: updatePlan })
      })

      if (!res.ok) throw new Error('Failed to update plan')
      
      // Update local state
      setUsers(prev => prev.map(u => {
        if (u.id === selectedUser.id) {
          return { ...u, plan: updatePlan }
        }
        return u
      }))
      setSelectedUser(null)
    } catch (err) {
      console.error('Error updating plan:', err)
      alert('Failed to update user plan')
    } finally {
      setIsUpdating(false)
    }
  }

  const columns: Column<UserRow>[] = [
    {
      key: 'id',
      label: 'ID',
      render: (u) => (
        <span className="font-mono text-xs opacity-60 hover:opacity-100 transition-opacity">
          {u.id.substring(0, 8)}...
        </span>
      )
    },
    {
      key: 'full_name',
      label: 'Name',
      render: (u) => (
        <div>
          <p className="font-semibold text-white">{u.full_name || 'No name'}</p>
        </div>
      )
    },
    {
      key: 'email',
      label: 'Email',
      render: (u) => (
        <span className="font-mono text-xs text-[#A1A1AA]">{u.email}</span>
      )
    },
    {
      key: 'plan',
      label: 'Plan',
      render: (u) => {
        let badgeColor = 'bg-zinc-500/10 text-zinc-400 border-zinc-500/20'
        if (u.plan === 'pro') badgeColor = 'bg-amber-500/10 text-amber-400 border-amber-500/20'
        if (u.plan === 'agency') badgeColor = 'bg-indigo-500/10 text-indigo-400 border-indigo-500/20'

        return (
          <span className={`inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-[10px] font-bold uppercase border ${badgeColor}`}>
            {u.plan}
          </span>
        )
      }
    },
    {
      key: 'stores_count',
      label: 'Stores',
      render: (u) => <span className="font-mono">{u.stores_count}</span>
    },
    {
      key: 'orders_count',
      label: 'Orders',
      render: (u) => <span className="font-mono">{u.orders_count}</span>
    },
    {
      key: 'created_at',
      label: 'Joined',
      render: (u) => (
        <span className="font-mono text-xs opacity-65">
          {new Date(u.created_at).toLocaleDateString()}
        </span>
      )
    },
    {
      key: 'actions',
      label: 'Actions',
      render: (u) => (
        <button
          onClick={() => {
            setSelectedUser(u)
            setUpdatePlan(u.plan)
          }}
          className="flex items-center gap-1 px-2.5 py-1 text-xs rounded bg-white/5 border border-white/10 text-white hover:bg-white/10 transition-all font-semibold"
        >
          <Crown size={12} className="text-amber-400" />
          Update Plan
        </button>
      )
    }
  ]

  return (
    <div className="flex flex-col gap-6">
      {/* Page Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 border-b border-white/5 pb-6">
        <div>
          <h2 className="text-2xl font-serif font-bold text-white flex items-center gap-2">
            <Users className="text-[var(--admin-accent)]" size={24} />
            Platform Users
          </h2>
          <p className="text-xs text-[#6B6B67] mt-1">
            Total users registered: {totalCount}. Modify billing tiers and view activity.
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
            placeholder="Search by name or email..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="w-full pl-9 pr-4 py-2 text-xs bg-[#242424] border border-white/5 rounded-lg text-white placeholder-[#6B6B67] focus:outline-none focus:border-white/20 transition-colors"
          />
        </div>

        {/* Multi-Filter Selects */}
        <div className="flex flex-wrap items-center gap-3 w-full md:w-auto">
          <div className="flex items-center gap-2 bg-[#242424] border border-white/5 rounded-lg px-3 py-1.5">
            <span className="text-[10px] font-bold text-[#6B6B67] uppercase tracking-wider">Plan:</span>
            <select
              value={planFilter}
              onChange={(e) => {
                setPage(1)
                setPlanFilter(e.target.value)
              }}
              className="bg-transparent text-xs text-white focus:outline-none cursor-pointer"
            >
              <option value="All" className="bg-[#1A1A1A]">All Plans</option>
              <option value="free" className="bg-[#1A1A1A]">Free</option>
              <option value="pro" className="bg-[#1A1A1A]">Pro</option>
              <option value="agency" className="bg-[#1A1A1A]">Agency</option>
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
              <option value="Oldest" className="bg-[#1A1A1A]">Oldest</option>
              <option value="Most stores" className="bg-[#1A1A1A]">Most Stores</option>
              <option value="Most orders" className="bg-[#1A1A1A]">Most Orders</option>
            </select>
          </div>
        </div>
      </div>

      {/* Data Table */}
      <DataTable
        columns={columns}
        data={users}
        loading={loading}
        currentPage={page}
        totalPages={totalPages}
        onPageChange={setPage}
      />

      {/* Plan Update Modal */}
      {selectedUser && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-[#0F0F0E]/80 backdrop-blur-sm transition-opacity">
          <div className="relative w-full max-w-md bg-[#1A1A1A] border border-white/10 rounded-xl p-6 shadow-xl flex flex-col gap-6">
            <div>
              <h3 className="text-base font-serif font-semibold text-white flex items-center gap-2">
                <Crown className="text-amber-400" size={18} />
                Update User Plan
              </h3>
              <p className="text-xs text-[#6B6B67] mt-1.5">
                Assigning a new subscription tier to <span className="text-white font-mono">{selectedUser.email}</span>.
              </p>
            </div>

            {/* Selection */}
            <div className="flex flex-col gap-2">
              <label className="text-[10px] font-bold text-[#6B6B67] uppercase tracking-wider">Select Tier</label>
              <div className="grid grid-cols-3 gap-2">
                {(['free', 'pro', 'agency'] as const).map((p) => (
                  <button
                    key={p}
                    onClick={() => setUpdatePlan(p)}
                    className={`py-3 rounded-lg border text-xs font-semibold capitalize transition-all ${
                      updatePlan === p 
                        ? 'bg-white/10 text-white border-white/20' 
                        : 'bg-transparent text-[#6B6B67] border-white/5 hover:border-white/10 hover:text-white'
                    }`}
                  >
                    {p}
                  </button>
                ))}
              </div>
            </div>

            {/* Explanation Warning */}
            <div className="p-3 bg-white/5 border border-white/10 rounded-lg text-[11px] text-[#A1A1AA] flex flex-col gap-1">
              <span className="font-bold text-white uppercase tracking-wider text-[9px] text-amber-400">System Note:</span>
              {updatePlan === 'agency' && 'Agency plan grants permanent premium store creations and zero AI limits.'}
              {updatePlan === 'pro' && 'Pro plan updates expiry to 30 days from now.'}
              {updatePlan === 'free' && 'Free plan resets regular AI limits and custom domain status.'}
            </div>

            {/* Actions */}
            <div className="flex items-center justify-end gap-3">
              <button
                disabled={isUpdating}
                onClick={() => setSelectedUser(null)}
                className="px-4 py-2 text-xs font-semibold text-[#6B6B67] hover:text-white transition-colors"
              >
                Cancel
              </button>
              <button
                disabled={isUpdating}
                onClick={handlePlanUpdate}
                className="px-4 py-2 text-xs font-semibold bg-white text-black hover:bg-white/90 rounded-lg transition-all"
              >
                {isUpdating ? 'Saving...' : 'Apply Changes'}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
