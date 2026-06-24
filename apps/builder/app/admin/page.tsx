'use client'

import { useEffect, useState } from 'react'
import { 
  Users, 
  Store, 
  ShoppingBag, 
  IndianRupee, 
  Sparkles, 
  Activity, 
  MessageSquare,
  ChevronRight,
  TrendingUp
} from 'lucide-react'
import Link from 'next/link'
import StatsCard from '@/components/admin/StatsCard'

interface StatsData {
  total_stores: number
  live_stores: number
  draft_stores: number
  stores_this_week: number
  stores_today: number
  total_users: number
  users_this_week: number
  free_users: number
  pro_users: number
  agency_users: number
  total_orders: number
  total_gmv: number
  gmv_this_month: number
  orders_today: number
  unread_messages: number
  ai_calls_today: number
  ai_errors_today: number
  avg_generation_ms: number
}

interface ActivityEvent {
  type: string
  description: string
  timestamp: string
  iconType: 'green' | 'blue' | 'purple' | 'yellow' | 'red' | 'white' | 'orange'
}

export default function AdminOverviewPage() {
  const [stats, setStats] = useState<StatsData | null>(null)
  const [activities, setActivities] = useState<ActivityEvent[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    async function fetchData() {
      try {
        setLoading(true)
        const [statsRes, activityRes] = await Promise.all([
          fetch('/api/admin/stats'),
          fetch('/api/admin/activity')
        ])

        if (!statsRes.ok || !activityRes.ok) {
          throw new Error('Failed to load dashboard data')
        }

        const statsData = await statsRes.json()
        const activityData = await activityRes.json()

        setStats(statsData)
        setActivities(activityData)
      } catch (err: any) {
        console.error('Error fetching admin overview data:', err)
        setError(err.message || 'An unexpected error occurred')
      } finally {
        setLoading(false)
      }
    }

    fetchData()
  }, [])

  if (error) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[50vh] text-center gap-4">
        <div className="p-3 bg-red-500/10 border border-red-500/20 text-red-500 rounded-xl">
          Error loading dashboard data. Please try again.
        </div>
        <button
          onClick={() => window.location.reload()}
          className="px-4 py-2 text-xs font-semibold rounded-lg bg-white/5 hover:bg-white/10 border border-white/10 text-white transition-all"
        >
          Retry
        </button>
      </div>
    )
  }

  // Pre-calculate user percentages for the plan ratio graph
  const totalUsersCount = stats ? stats.total_users || 1 : 1
  const freePct = stats ? Math.round((stats.free_users / totalUsersCount) * 100) : 0
  const proPct = stats ? Math.round((stats.pro_users / totalUsersCount) * 100) : 0
  const agencyPct = stats ? Math.round((stats.agency_users / totalUsersCount) * 100) : 0

  const liveStorePct = stats ? Math.round((stats.live_stores / (stats.total_stores || 1)) * 100) : 0

  const aiErrorRate = stats && stats.ai_calls_today > 0
    ? Math.round((stats.ai_errors_today / stats.ai_calls_today) * 100)
    : 0

  return (
    <div className="flex flex-col gap-8">
      {/* Welcome header section */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 border-b border-white/5 pb-6">
        <div>
          <h2 className="text-2xl font-serif font-bold text-white">Platform Health Overview</h2>
          <p className="text-xs text-[#6B6B67] mt-1">Real-time SaaS operational status and financial analytics.</p>
        </div>
        <div className="flex items-center gap-3">
          <span className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-[#1A1A1A] border border-white/5 text-xs text-emerald-400 font-medium">
            <span className="h-1.5 w-1.5 rounded-full bg-emerald-400 animate-pulse"></span>
            Real-time Sync Active
          </span>
        </div>
      </div>

      {/* KPI Stats Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
        {loading ? (
          Array.from({ length: 4 }).map((_, i) => (
            <div key={i} className="h-28 rounded-xl bg-[#1A1A1A] border border-white/5 animate-pulse" />
          ))
        ) : (
          <>
            <StatsCard 
              label="Total Users" 
              value={stats?.total_users || 0} 
              icon={Users} 
              colorClass="text-indigo-400"
              trend={stats?.users_this_week ? `+${stats.users_this_week} this week` : 'No new signups this week'}
            />
            <StatsCard 
              label="Total Stores" 
              value={stats?.total_stores || 0} 
              icon={Store} 
              colorClass="text-emerald-400"
              trend={stats?.stores_this_week ? `+${stats.stores_this_week} this week` : 'No new stores this week'}
            />
            <StatsCard 
              label="Total Orders" 
              value={stats?.total_orders || 0} 
              icon={ShoppingBag} 
              colorClass="text-amber-400"
              trend={stats?.orders_today ? `+${stats.orders_today} today` : 'No orders today'}
            />
            <StatsCard 
              label="Total GMV" 
              value={`₹${(stats?.total_gmv || 0).toLocaleString('en-IN', { maximumFractionDigits: 0 })}`}
              icon={IndianRupee} 
              colorClass="text-pink-400"
              trend={stats?.gmv_this_month ? `₹${stats.gmv_this_month.toLocaleString('en-IN', { maximumFractionDigits: 0 })} last 30d` : 'No sales last 30d'}
            />
          </>
        )}
      </div>

      {/* Plan Distribution and AI Health Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* User Plan Distribution */}
        <div className="p-6 rounded-xl border border-white/5 bg-[#1A1A1A] flex flex-col gap-6">
          <div className="flex items-center justify-between">
            <h3 className="text-sm font-semibold tracking-wider text-[#6B6B67] uppercase">User Subscription Plans</h3>
            <span className="text-xs text-[#FAFAF8] font-mono font-bold bg-white/5 border border-white/10 px-2 py-0.5 rounded">
              Total: {stats?.total_users || 0}
            </span>
          </div>

          {loading ? (
            <div className="h-32 flex items-center justify-center">
              <div className="h-6 w-full max-w-sm rounded bg-white/5 animate-pulse" />
            </div>
          ) : (
            <div className="flex flex-col gap-5 justify-center flex-1">
              {/* Stacked Progress Bar */}
              <div className="h-6 w-full rounded-lg overflow-hidden flex bg-white/5">
                <div 
                  style={{ width: `${freePct}%` }} 
                  className="bg-zinc-500 transition-all duration-500 hover:opacity-90"
                  title={`Free: ${stats?.free_users} (${freePct}%)`}
                />
                <div 
                  style={{ width: `${proPct}%` }} 
                  className="bg-amber-500 transition-all duration-500 hover:opacity-90"
                  title={`Pro: ${stats?.pro_users} (${proPct}%)`}
                />
                <div 
                  style={{ width: `${agencyPct}%` }} 
                  className="bg-indigo-500 transition-all duration-500 hover:opacity-90"
                  title={`Agency: ${stats?.agency_users} (${agencyPct}%)`}
                />
              </div>

              {/* Legends */}
              <div className="grid grid-cols-3 gap-4 text-center">
                <div className="flex flex-col items-center p-2 rounded-lg bg-[#242424]/40 border border-white/[0.02]">
                  <span className="text-[10px] font-bold text-zinc-400 uppercase tracking-wider flex items-center gap-1.5">
                    <span className="h-2 w-2 rounded-full bg-zinc-500" />
                    Free Plan
                  </span>
                  <span className="text-lg font-serif font-bold text-white mt-1">{stats?.free_users || 0}</span>
                  <span className="text-[10px] font-mono text-[#6B6B67] mt-0.5">{freePct}% of total</span>
                </div>
                <div className="flex flex-col items-center p-2 rounded-lg bg-[#242424]/40 border border-white/[0.02]">
                  <span className="text-[10px] font-bold text-amber-400 uppercase tracking-wider flex items-center gap-1.5">
                    <span className="h-2 w-2 rounded-full bg-amber-500 animate-pulse" />
                    Pro Plan
                  </span>
                  <span className="text-lg font-serif font-bold text-white mt-1">{stats?.pro_users || 0}</span>
                  <span className="text-[10px] font-mono text-[#6B6B67] mt-0.5">{proPct}% of total</span>
                </div>
                <div className="flex flex-col items-center p-2 rounded-lg bg-[#242424]/40 border border-white/[0.02]">
                  <span className="text-[10px] font-bold text-indigo-400 uppercase tracking-wider flex items-center gap-1.5">
                    <span className="h-2 w-2 rounded-full bg-indigo-500" />
                    Agency Plan
                  </span>
                  <span className="text-lg font-serif font-bold text-white mt-1">{stats?.agency_users || 0}</span>
                  <span className="text-[10px] font-mono text-[#6B6B67] mt-0.5">{agencyPct}% of total</span>
                </div>
              </div>
            </div>
          )}
        </div>

        {/* AI Health Overview */}
        <div className="p-6 rounded-xl border border-white/5 bg-[#1A1A1A] flex flex-col gap-6">
          <div className="flex items-center justify-between">
            <h3 className="text-sm font-semibold tracking-wider text-[#6B6B67] uppercase">AI Generation Metrics (24h)</h3>
            <span className="text-xs text-[#FAFAF8] font-mono font-bold bg-[#EF4444]/10 border border-[#EF4444]/20 text-[#FCA5A5] px-2 py-0.5 rounded flex items-center gap-1">
              <Sparkles size={11} className="text-[#FCA5A5]" />
              Bandit Powered
            </span>
          </div>

          {loading ? (
            <div className="h-32 flex flex-col gap-4 animate-pulse">
              <div className="h-4 w-1/3 rounded bg-white/5" />
              <div className="h-8 w-2/3 rounded bg-white/5" />
              <div className="h-4 w-1/2 rounded bg-white/5" />
            </div>
          ) : (
            <div className="grid grid-cols-3 gap-4 flex-1 items-center">
              <div className="flex flex-col p-4 rounded-lg bg-[#242424]/40 border border-white/[0.02]">
                <span className="text-[10px] font-bold text-[#6B6B67] uppercase tracking-wider">AI Calls Today</span>
                <span className="text-2xl font-serif font-bold text-white mt-1.5">{stats?.ai_calls_today || 0}</span>
                <span className="text-[10px] font-mono text-emerald-400 mt-1">Active load</span>
              </div>
              <div className="flex flex-col p-4 rounded-lg bg-[#242424]/40 border border-white/[0.02]">
                <span className="text-[10px] font-bold text-[#6B6B67] uppercase tracking-wider">Error Rate</span>
                <span className={`text-2xl font-serif font-bold mt-1.5 ${aiErrorRate > 10 ? 'text-red-400' : aiErrorRate > 3 ? 'text-amber-400' : 'text-emerald-400'}`}>
                  {aiErrorRate}%
                </span>
                <span className="text-[10px] font-mono text-[#6B6B67] mt-1">{stats?.ai_errors_today || 0} failures</span>
              </div>
              <div className="flex flex-col p-4 rounded-lg bg-[#242424]/40 border border-white/[0.02]">
                <span className="text-[10px] font-bold text-[#6B6B67] uppercase tracking-wider">Avg Latency</span>
                <span className="text-2xl font-serif font-bold text-white mt-1.5">
                  {stats?.avg_generation_ms ? `${(stats.avg_generation_ms / 1000).toFixed(1)}s` : '0s'}
                </span>
                <span className="text-[10px] font-mono text-[#6B6B67] mt-1">E2E Generation</span>
              </div>
            </div>
          )}
        </div>
      </div>

      {/* Activity Timeline and Store Stats Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Recent Activity Timeline */}
        <div className="lg:col-span-2 p-6 rounded-xl border border-white/5 bg-[#1A1A1A] flex flex-col gap-6">
          <div className="flex items-center justify-between">
            <h3 className="text-sm font-semibold tracking-wider text-[#6B6B67] uppercase">System Audit Log</h3>
            <Link 
              href="/admin/pipeline" 
              className="text-xs font-semibold text-[var(--admin-accent)] hover:underline flex items-center gap-0.5"
            >
              Pipeline Health
              <ChevronRight size={13} />
            </Link>
          </div>

          {loading ? (
            <div className="flex flex-col gap-4 animate-pulse">
              {Array.from({ length: 4 }).map((_, i) => (
                <div key={i} className="h-10 rounded bg-white/5" />
              ))}
            </div>
          ) : activities.length === 0 ? (
            <div className="py-8 text-center text-xs text-[#6B6B67]">No activity logged in the last 24h.</div>
          ) : (
            <div className="relative border-l border-white/5 pl-4 ml-2 flex flex-col gap-6">
              {activities.map((act, index) => {
                let dotColor = 'bg-zinc-500'
                if (act.iconType === 'green') dotColor = 'bg-emerald-400'
                if (act.iconType === 'blue') dotColor = 'bg-blue-400'
                if (act.iconType === 'purple') dotColor = 'bg-indigo-400'
                if (act.iconType === 'yellow') dotColor = 'bg-amber-400'
                if (act.iconType === 'red') dotColor = 'bg-red-500'
                if (act.iconType === 'orange') dotColor = 'bg-orange-400'
                if (act.iconType === 'white') dotColor = 'bg-white'

                return (
                  <div key={index} className="relative flex flex-col gap-1">
                    <span 
                      className={`absolute -left-[21px] top-1.5 h-2 w-2 rounded-full border border-[#1A1A1A] ${dotColor}`}
                    />
                    <div className="flex items-center justify-between gap-4">
                      <span className="text-xs font-medium text-[#FAFAF8]">{act.description}</span>
                      <span className="text-[10px] font-mono text-[#6B6B67]">
                        {new Date(act.timestamp).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                      </span>
                    </div>
                  </div>
                )
              })}
            </div>
          )}
        </div>

        {/* Quick Actions & Store Status Details */}
        <div className="p-6 rounded-xl border border-white/5 bg-[#1A1A1A] flex flex-col gap-6">
          <div>
            <h3 className="text-sm font-semibold tracking-wider text-[#6B6B67] uppercase">Store Live Status</h3>
            <p className="text-xs text-[#6B6B67] mt-1">Ratio of published stores across the platform.</p>
          </div>

          {loading ? (
            <div className="h-20 rounded bg-white/5 animate-pulse" />
          ) : (
            <div className="flex flex-col gap-4">
              <div className="flex justify-between items-end text-xs font-mono">
                <span className="text-[#FAFAF8]">{stats?.live_stores || 0} / {stats?.total_stores || 0} Live</span>
                <span className="text-[#6B6B67]">{liveStorePct}%</span>
              </div>
              <div className="h-2 w-full rounded-full bg-white/5 overflow-hidden">
                <div 
                  className="h-full bg-emerald-400 rounded-full" 
                  style={{ width: `${liveStorePct}%` }}
                />
              </div>
              <div className="grid grid-cols-2 gap-4 text-center mt-2">
                <div className="p-2.5 rounded bg-[#242424]/40 border border-white/[0.02]">
                  <span className="text-[9px] font-bold text-emerald-400 uppercase tracking-widest block">Live Stores</span>
                  <span className="text-base font-serif font-bold text-white mt-1 block">{stats?.live_stores || 0}</span>
                </div>
                <div className="p-2.5 rounded bg-[#242424]/40 border border-white/[0.02]">
                  <span className="text-[9px] font-bold text-zinc-400 uppercase tracking-widest block">Drafts</span>
                  <span className="text-base font-serif font-bold text-white mt-1 block">{stats?.draft_stores || 0}</span>
                </div>
              </div>
            </div>
          )}

          <div className="border-t border-white/5 pt-6 flex flex-col gap-3">
            <h4 className="text-[10px] font-bold tracking-wider text-[#6B6B67] uppercase">Quick Navigation</h4>
            <div className="grid grid-cols-2 gap-2">
              <Link 
                href="/admin/users" 
                className="p-3 text-center rounded-lg border border-white/5 bg-[#242424]/40 hover:bg-[#242424]/80 text-xs font-semibold text-white transition-all"
              >
                Manage Users
              </Link>
              <Link 
                href="/admin/stores" 
                className="p-3 text-center rounded-lg border border-white/5 bg-[#242424]/40 hover:bg-[#242424]/80 text-xs font-semibold text-white transition-all"
              >
                Manage Stores
              </Link>
              <Link 
                href="/admin/messages" 
                className="p-3 text-center rounded-lg border border-white/5 bg-[#242424]/40 hover:bg-[#242424]/80 text-xs font-semibold text-white transition-all"
              >
                Inbox ({stats?.unread_messages || 0})
              </Link>
              <Link 
                href="/admin/settings" 
                className="p-3 text-center rounded-lg border border-white/5 bg-[#242424]/40 hover:bg-[#242424]/80 text-xs font-semibold text-white transition-all"
              >
                System Config
              </Link>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
