'use client'

import { useEffect, useState } from 'react'
import { 
  Settings, 
  Database, 
  Cpu, 
  ShieldAlert, 
  Trash2, 
  CheckCircle2, 
  XCircle,
  HelpCircle,
  RefreshCcw,
  Sliders,
  Check
} from 'lucide-react'

interface SettingsData {
  settings: Record<string, string>
  rowCounts: Record<string, number>
  envStatus: Record<string, boolean>
  dbConnected: boolean
}

export default function AdminSettingsPage() {
  const [data, setData] = useState<SettingsData | null>(null)
  const [loading, setLoading] = useState(true)
  
  // Toggle states
  const [updatingKeys, setUpdatingKeys] = useState<string[]>([])
  const [flushingRedis, setFlushingRedis] = useState(false)
  const [flushSuccess, setFlushSuccess] = useState(false)

  async function fetchSettings() {
    try {
      setLoading(true)
      const res = await fetch('/api/admin/settings')
      if (!res.ok) throw new Error('Failed to fetch settings data')
      const stats = await res.json()
      setData(stats)
    } catch (err) {
      console.error('Error fetching settings:', err)
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    fetchSettings()
  }, [])

  async function updateSetting(key: string, currentValue: string) {
    // Toggle Boolean strings
    const newValue = currentValue === 'true' ? 'false' : 'true'
    
    try {
      setUpdatingKeys(prev => [...prev, key])
      const res = await fetch('/api/admin/settings', {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ key, value: newValue })
      })

      if (!res.ok) throw new Error('Failed to update setting')
      
      // Update local state
      setData(prev => {
        if (!prev) return null
        return {
          ...prev,
          settings: {
            ...prev.settings,
            [key]: newValue
          }
        }
      })
    } catch (err) {
      console.error(`Error updating setting ${key}:`, err)
      alert(`Failed to save setting: ${key}`)
    } finally {
      setUpdatingKeys(prev => prev.filter(k => k !== key))
    }
  }

  async function handleRedisFlush() {
    if (!confirm('Are you sure you want to flush the Upstash Redis database? This will clear all rate limits and active user session states.')) return

    try {
      setFlushingRedis(true)
      setFlushSuccess(false)
      const res = await fetch('/api/admin/settings/redis', {
        method: 'POST'
      })

      if (!res.ok) {
        const errData = await res.json()
        throw new Error(errData.error || 'Failed to flush Redis')
      }

      setFlushSuccess(true)
      setTimeout(() => setFlushSuccess(false), 3000)
    } catch (err: any) {
      console.error('Error flushing Redis:', err)
      alert(err.message || 'Failed to flush Redis cache database')
    } finally {
      setFlushingRedis(false)
    }
  }

  if (loading && !data) {
    return (
      <div className="flex flex-col gap-6 animate-pulse">
        <div className="h-10 w-1/4 rounded bg-white/5" />
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div className="h-64 rounded-xl bg-white/5" />
          <div className="h-64 rounded-xl bg-white/5" />
        </div>
      </div>
    )
  }

  // Ensure defaults if missing in DB settings
  const settings = data?.settings || {}
  const rowCounts = data?.rowCounts || {}
  const envStatus = data?.envStatus || {}

  const isSignupsEnabled = settings['new_signups_enabled'] !== 'false'
  const isAiEnabled = settings['ai_generation_enabled'] !== 'false'
  const isMaintenanceMode = settings['maintenance_mode'] === 'true'

  return (
    <div className="flex flex-col gap-8">
      {/* Page Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 border-b border-white/5 pb-6">
        <div>
          <h2 className="text-2xl font-serif font-bold text-white flex items-center gap-2">
            <Settings className="text-[var(--admin-accent)]" size={24} />
            System Control Panel
          </h2>
          <p className="text-xs text-[#6B6B67] mt-1">
            Toggle signup limits, review API keys check, clear memory storage caches, and examine counts.
          </p>
        </div>
        <button
          onClick={fetchSettings}
          className="flex items-center gap-1.5 px-3 py-1.5 text-xs font-semibold rounded-lg bg-white/5 border border-white/10 text-white hover:bg-white/10 transition-colors"
        >
          <RefreshCcw size={13} className={loading ? 'animate-spin' : ''} />
          Reload settings
        </button>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        {/* LEFT COLUMN: System Config & Redis */}
        <div className="flex flex-col gap-6">
          {/* Global Feature Flags */}
          <div className="bg-[#1A1A1A] border border-white/5 rounded-xl p-6 flex flex-col gap-5">
            <h3 className="text-sm font-semibold tracking-wider text-[#6B6B67] uppercase flex items-center gap-2">
              <Sliders size={16} className="text-indigo-400" />
              Global System Settings
            </h3>
            
            <div className="flex flex-col gap-4">
              {/* Toggle 1: Signups */}
              <div className="flex items-center justify-between p-4 rounded-lg bg-[#242424]/40 border border-white/[0.02]">
                <div className="flex flex-col gap-1 min-w-0 pr-4">
                  <span className="text-xs font-bold text-white">Enable New User Signups</span>
                  <p className="text-[11px] text-[#6B6B67]">Allows new credentials to register on the platform.</p>
                </div>
                <button
                  disabled={updatingKeys.includes('new_signups_enabled')}
                  onClick={() => updateSetting('new_signups_enabled', isSignupsEnabled ? 'true' : 'false')}
                  className={`w-12 h-6 rounded-full transition-all relative ${
                    isSignupsEnabled ? 'bg-indigo-500' : 'bg-white/10'
                  } disabled:opacity-50`}
                >
                  <span 
                    className={`absolute top-1 h-4 w-4 rounded-full bg-white transition-all ${
                      isSignupsEnabled ? 'left-7' : 'left-1'
                    }`}
                  />
                </button>
              </div>

              {/* Toggle 2: AI Generations */}
              <div className="flex items-center justify-between p-4 rounded-lg bg-[#242424]/40 border border-white/[0.02]">
                <div className="flex flex-col gap-1 min-w-0 pr-4">
                  <span className="text-xs font-bold text-white">Enable AI Code generation</span>
                  <p className="text-[11px] text-[#6B6B67]">Controls if storefront creations pipelines are active.</p>
                </div>
                <button
                  disabled={updatingKeys.includes('ai_generation_enabled')}
                  onClick={() => updateSetting('ai_generation_enabled', isAiEnabled ? 'true' : 'false')}
                  className={`w-12 h-6 rounded-full transition-all relative ${
                    isAiEnabled ? 'bg-indigo-500' : 'bg-white/10'
                  } disabled:opacity-50`}
                >
                  <span 
                    className={`absolute top-1 h-4 w-4 rounded-full bg-white transition-all ${
                      isAiEnabled ? 'left-7' : 'left-1'
                    }`}
                  />
                </button>
              </div>

              {/* Toggle 3: Maintenance Mode */}
              <div className="flex items-center justify-between p-4 rounded-lg bg-[#242424]/40 border border-white/[0.02]">
                <div className="flex flex-col gap-1 min-w-0 pr-4">
                  <span className="text-xs font-bold text-white">Global Maintenance Mode</span>
                  <p className="text-[11px] text-[#6B6B67]">Redirects all public facing builder pages to offline notice.</p>
                </div>
                <button
                  disabled={updatingKeys.includes('maintenance_mode')}
                  onClick={() => updateSetting('maintenance_mode', isMaintenanceMode ? 'true' : 'false')}
                  className={`w-12 h-6 rounded-full transition-all relative ${
                    isMaintenanceMode ? 'bg-[#EF4444]' : 'bg-white/10'
                  } disabled:opacity-50`}
                >
                  <span 
                    className={`absolute top-1 h-4 w-4 rounded-full bg-white transition-all ${
                      isMaintenanceMode ? 'left-7' : 'left-1'
                    }`}
                  />
                </button>
              </div>
            </div>
          </div>

          {/* Redis controller */}
          <div className="bg-[#1A1A1A] border border-white/5 rounded-xl p-6 flex flex-col gap-5">
            <h3 className="text-sm font-semibold tracking-wider text-[#6B6B67] uppercase flex items-center gap-2">
              <ShieldAlert size={16} className="text-red-400" />
              Redis Cache & Limit Controller
            </h3>
            
            <p className="text-xs text-[#A1A1AA] leading-relaxed">
              Flush Upstash sliding-window Redis cache keys. This clears user IP submission counts, model bandit weight states, and restores regular generation limits.
            </p>

            <div className="flex items-center gap-4">
              <button
                disabled={flushingRedis}
                onClick={handleRedisFlush}
                className="flex items-center gap-2 px-4 py-2.5 rounded-lg bg-red-500/10 text-red-400 hover:bg-red-500/20 border border-red-500/25 text-xs font-bold transition-all disabled:opacity-50"
              >
                <Trash2 size={14} />
                {flushingRedis ? 'Flushing Redis...' : 'Flush Redis Database'}
              </button>
              {flushSuccess && (
                <span className="text-xs text-emerald-400 flex items-center gap-1 font-mono">
                  <Check size={14} />
                  Redis cleared successfully
                </span>
              )}
            </div>
          </div>
        </div>

        {/* RIGHT COLUMN: Diagnostics & Stats */}
        <div className="flex flex-col gap-6">
          {/* Connection Diagnostics */}
          <div className="bg-[#1A1A1A] border border-white/5 rounded-xl p-6 flex flex-col gap-5">
            <h3 className="text-sm font-semibold tracking-wider text-[#6B6B67] uppercase flex items-center gap-2">
              <Cpu size={16} className="text-emerald-400" />
              Environment Check & API Keys
            </h3>

            <div className="flex flex-col gap-3 font-mono text-xs">
              {Object.entries(envStatus).map(([key, isConfigured]) => (
                <div 
                  key={key} 
                  className="flex items-center justify-between p-2 rounded bg-[#242424]/40 border border-white/[0.01]"
                >
                  <span className="text-[#A1A1AA] text-[11px] truncate select-all pr-2">{key}</span>
                  {isConfigured ? (
                    <span className="flex items-center gap-1 text-emerald-400 font-semibold text-[10px]">
                      <CheckCircle2 size={12} />
                      Configured
                    </span>
                  ) : (
                    <span className="flex items-center gap-1 text-red-400 font-semibold text-[10px]">
                      <XCircle size={12} />
                      Missing
                    </span>
                  )}
                </div>
              ))}
            </div>
          </div>

          {/* Table Counts */}
          <div className="bg-[#1A1A1A] border border-white/5 rounded-xl p-6 flex flex-col gap-5">
            <h3 className="text-sm font-semibold tracking-wider text-[#6B6B67] uppercase flex items-center gap-2">
              <Database size={16} className="text-amber-400" />
              Database Catalog Counters
            </h3>

            <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
              {Object.entries(rowCounts).map(([table, count]) => (
                <div key={table} className="p-3.5 rounded-lg bg-[#242424]/40 border border-white/[0.02] flex flex-col">
                  <span className="text-[10px] font-bold text-[#6B6B67] uppercase tracking-wider block truncate">
                    {table.replace('_', ' ')}
                  </span>
                  <span className="text-xl font-serif font-bold text-white mt-1 block">
                    {count}
                  </span>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
