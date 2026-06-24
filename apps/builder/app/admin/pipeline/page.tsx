'use client'

import { useEffect, useState } from 'react'
import { 
  Activity, 
  Cpu, 
  Terminal, 
  CheckCircle2, 
  XCircle, 
  Clock, 
  Sparkles, 
  ChevronDown, 
  ChevronUp, 
  Copy, 
  RotateCcw,
  Sliders,
  Play
} from 'lucide-react'

interface BanditStat {
  model: string
  task: string
  score: number
  calls: number
  wins: number
  last_updated: string
}

interface GenerationLog {
  id: string
  store_id: string
  task_type: string
  model_used: string
  prompt_tokens: number
  completion_tokens: number
  duration_ms: number
  success: boolean
  error_message: string | null
  input_payload: any
  output_response: any
  created_at: string
}

export default function AdminPipelinePage() {
  const [activeTab, setActiveTab] = useState<'bandit' | 'logs'>('bandit')
  const [banditStats, setBanditStats] = useState<BanditStat[]>([])
  const [logs, setLogs] = useState<GenerationLog[]>([])
  const [expandedLogId, setExpandedLogId] = useState<string | null>(null)
  
  const [loading, setLoading] = useState(true)
  const [logFilter, setLogFilter] = useState<'All' | 'success' | 'failure'>('All')

  // Stats summaries
  const [totalCalls, setTotalCalls] = useState(0)
  const [successRate, setSuccessRate] = useState(100)
  const [avgLatency, setAvgLatency] = useState(0)

  async function fetchBanditData() {
    try {
      const res = await fetch('/api/admin/pipeline/bandit')
      if (!res.ok) throw new Error('Failed to fetch bandit stats')
      const data = await res.json()
      setBanditStats(data || [])
    } catch (err) {
      console.error('Error loading bandit stats:', err)
    }
  }

  async function fetchLogsData() {
    try {
      let url = '/api/admin/pipeline/logs'
      if (logFilter === 'success') url += '?success=true'
      if (logFilter === 'failure') url += '?success=false'
      
      const res = await fetch(url)
      if (!res.ok) throw new Error('Failed to fetch pipeline logs')
      const data = await res.json()
      setLogs(data || [])

      // Calculate stats based on logs fetched (last 50 runs)
      if (data && data.length > 0) {
        const successes = data.filter((l: GenerationLog) => l.success).length
        const totalDuration = data.reduce((sum: number, l: GenerationLog) => sum + (l.duration_ms || 0), 0)
        setSuccessRate(Math.round((successes / data.length) * 100))
        setAvgLatency(Math.round(totalDuration / data.length))
        setTotalCalls(data.length)
      }
    } catch (err) {
      console.error('Error loading logs:', err)
    }
  }

  async function loadAll() {
    setLoading(true)
    await Promise.all([fetchBanditData(), fetchLogsData()])
    setLoading(false)
  }

  useEffect(() => {
    loadAll()
  }, [logFilter])

  function handleCopyText(text: string) {
    navigator.clipboard.writeText(text)
    alert('Copied schema structure to clipboard')
  }

  return (
    <div className="flex flex-col gap-8">
      {/* Page Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 border-b border-white/5 pb-6">
        <div>
          <h2 className="text-2xl font-serif font-bold text-white flex items-center gap-2">
            <Activity className="text-[var(--admin-accent)]" size={24} />
            AI Pipeline & Bandit Router
          </h2>
          <p className="text-xs text-[#6B6B67] mt-1">
            Analyze reinforcement learning bandit choices, win rates, latencies, and execution payloads.
          </p>
        </div>
        <button
          onClick={loadAll}
          className="flex items-center gap-1.5 px-3.5 py-2 text-xs font-semibold rounded-lg bg-white/5 border border-white/10 text-white hover:bg-white/10 transition-all shrink-0"
        >
          <RotateCcw size={13} />
          Reload Pipeline Metrics
        </button>
      </div>

      {/* KPI Cards */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
        <div className="bg-[#1A1A1A] border border-white/5 p-5 rounded-xl">
          <div className="flex items-center justify-between">
            <span className="text-[10px] font-bold text-[#6B6B67] uppercase tracking-wider">Success Rate</span>
            <CheckCircle2 size={16} className="text-emerald-400" />
          </div>
          <span className="text-2xl font-serif font-bold text-white mt-1 block">
            {loading ? '...' : `${successRate}%`}
          </span>
          <span className="text-[9px] font-mono text-[#6B6B67] block mt-1">Recent 50 executions</span>
        </div>
        <div className="bg-[#1A1A1A] border border-white/5 p-5 rounded-xl">
          <div className="flex items-center justify-between">
            <span className="text-[10px] font-bold text-[#6B6B67] uppercase tracking-wider">Average Delay</span>
            <Clock size={16} className="text-amber-400" />
          </div>
          <span className="text-2xl font-serif font-bold text-white mt-1 block">
            {loading ? '...' : `${(avgLatency / 1000).toFixed(1)}s`}
          </span>
          <span className="text-[9px] font-mono text-[#6B6B67] block mt-1">From model launch to result</span>
        </div>
        <div className="bg-[#1A1A1A] border border-white/5 p-5 rounded-xl">
          <div className="flex items-center justify-between">
            <span className="text-[10px] font-bold text-[#6B6B67] uppercase tracking-wider">RL Router Algorithm</span>
            <Sparkles size={16} className="text-indigo-400" />
          </div>
          <span className="text-sm font-semibold text-white mt-1 block font-mono">
            Thompson Sampling
          </span>
          <span className="text-[9px] font-mono text-[#6B6B67] block mt-1">Bandit model selection active</span>
        </div>
        <div className="bg-[#1A1A1A] border border-white/5 p-5 rounded-xl">
          <div className="flex items-center justify-between">
            <span className="text-[10px] font-bold text-[#6B6B67] uppercase tracking-wider">Audit Log Status</span>
            <Terminal size={16} className="text-emerald-400 animate-pulse" />
          </div>
          <span className="text-2xl font-serif font-bold text-white mt-1 block">
            {loading ? '...' : logs.length}
          </span>
          <span className="text-[9px] font-mono text-[#6B6B67] block mt-1">Tracked runs logged</span>
        </div>
      </div>

      {/* Tabs bar */}
      <div className="flex border-b border-white/5">
        <button
          onClick={() => setActiveTab('bandit')}
          className="px-6 py-3 text-xs font-semibold uppercase tracking-wider border-b-2 transition-all flex items-center gap-2"
          style={{
            borderColor: activeTab === 'bandit' ? '#F97316' : 'transparent',
            color: activeTab === 'bandit' ? '#FAFAF8' : '#6B6B67'
          }}
        >
          <Sliders size={14} />
          Active Bandit Pools
        </button>
        <button
          onClick={() => setActiveTab('logs')}
          className="px-6 py-3 text-xs font-semibold uppercase tracking-wider border-b-2 transition-all flex items-center gap-2"
          style={{
            borderColor: activeTab === 'logs' ? '#F97316' : 'transparent',
            color: activeTab === 'logs' ? '#FAFAF8' : '#6B6B67'
          }}
        >
          <Terminal size={14} />
          Pipeline Audit Logs
        </button>
      </div>

      {/* TAB CONTENT: Bandit model pools */}
      {activeTab === 'bandit' && (
        <div className="bg-[#1A1A1A] border border-white/5 rounded-xl p-6 flex flex-col gap-6">
          <div>
            <h3 className="text-sm font-semibold tracking-wider text-white">Bandit Router Models</h3>
            <p className="text-xs text-[#6B6B67] mt-1">Exploitation/exploration weights across tasks based on customer performance scores.</p>
          </div>

          {loading ? (
            <div className="flex flex-col gap-4 animate-pulse">
              {Array.from({ length: 4 }).map((_, i) => (
                <div key={i} className="h-12 rounded bg-white/5" />
              ))}
            </div>
          ) : banditStats.length === 0 ? (
            <p className="text-xs text-[#6B6B67] py-6 text-center">No bandit metrics logged yet. Run a store build to generate weights.</p>
          ) : (
            <div className="border border-white/5 rounded-lg overflow-hidden">
              <table className="w-full text-left border-collapse text-xs">
                <thead>
                  <tr className="bg-[#242424] border-b border-white/5 text-[#6B6B67] font-semibold">
                    <th className="p-3">Task Area</th>
                    <th className="p-3">LLM Model Target</th>
                    <th className="p-3 text-center">Exploitation Score (Beta Weight)</th>
                    <th className="p-3 text-center">Calls</th>
                    <th className="p-3 text-center">Wins</th>
                    <th className="p-3 text-center">Win Rate</th>
                  </tr>
                </thead>
                <tbody>
                  {banditStats.map((stat, i) => {
                    const winRate = stat.calls > 0 ? Math.round((stat.wins / stat.calls) * 100) : 0
                    const pctVal = Math.round(stat.score * 100)

                    return (
                      <tr key={i} className="border-b border-white/5 hover:bg-white/[0.02]">
                        <td className="p-3 font-bold uppercase tracking-wider text-indigo-400">
                          {stat.task}
                        </td>
                        <td className="p-3 font-mono text-white select-all">{stat.model}</td>
                        <td className="p-3">
                          <div className="flex items-center gap-3 justify-center min-w-[150px]">
                            <span className="font-mono w-8 text-right">{stat.score.toFixed(3)}</span>
                            <div className="h-2 w-24 rounded bg-white/5 overflow-hidden">
                              <div className="h-full bg-indigo-500 rounded" style={{ width: `${pctVal}%` }} />
                            </div>
                          </div>
                        </td>
                        <td className="p-3 font-mono text-center text-[#A1A1AA]">{stat.calls}</td>
                        <td className="p-3 font-mono text-center text-[#A1A1AA]">{stat.wins}</td>
                        <td className="p-3">
                          <div className="flex items-center justify-center gap-1.5">
                            <span className={`font-mono font-bold ${winRate > 70 ? 'text-emerald-400' : winRate > 40 ? 'text-amber-400' : 'text-zinc-500'}`}>
                              {winRate}%
                            </span>
                          </div>
                        </td>
                      </tr>
                    )
                  })}
                </tbody>
              </table>
            </div>
          )}
        </div>
      )}

      {/* TAB CONTENT: Audit logs */}
      {activeTab === 'logs' && (
        <div className="bg-[#1A1A1A] border border-white/5 rounded-xl p-6 flex flex-col gap-6">
          <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
            <div>
              <h3 className="text-sm font-semibold tracking-wider text-white">AI Generation Audit Log</h3>
              <p className="text-xs text-[#6B6B67] mt-1">Detailed inputs and responses of AI pipeline actions.</p>
            </div>
            
            {/* Filter controls */}
            <div className="flex items-center gap-2 bg-[#242424] border border-white/5 rounded-lg px-3 py-1.5">
              <span className="text-[10px] font-bold text-[#6B6B67] uppercase tracking-wider">Filter:</span>
              <select
                value={logFilter}
                onChange={(e) => setLogFilter(e.target.value as any)}
                className="bg-transparent text-xs text-white focus:outline-none cursor-pointer"
              >
                <option value="All" className="bg-[#1A1A1A]">All Runs</option>
                <option value="success" className="bg-[#1A1A1A]">Successes Only</option>
                <option value="failure" className="bg-[#1A1A1A]">Failures Only</option>
              </select>
            </div>
          </div>

          {loading ? (
            <div className="flex flex-col gap-4 animate-pulse">
              {Array.from({ length: 4 }).map((_, i) => (
                <div key={i} className="h-10 rounded bg-white/5" />
              ))}
            </div>
          ) : logs.length === 0 ? (
            <p className="text-xs text-[#6B6B67] py-6 text-center">No audit logs matching selection.</p>
          ) : (
            <div className="flex flex-col gap-3">
              {logs.map((log) => {
                const isExpanded = expandedLogId === log.id

                return (
                  <div 
                    key={log.id} 
                    className="border border-white/5 rounded-xl bg-[#242424]/20 overflow-hidden transition-all"
                  >
                    {/* Header Row clickable */}
                    <button
                      onClick={() => setExpandedLogId(isExpanded ? null : log.id)}
                      className="w-full text-left p-4 flex flex-col md:flex-row md:items-center justify-between gap-4 hover:bg-white/[0.01]"
                    >
                      <div className="flex items-center gap-3.5 min-w-0">
                        {log.success ? (
                          <CheckCircle2 size={16} className="text-emerald-400 shrink-0" />
                        ) : (
                          <XCircle size={16} className="text-red-400 shrink-0" />
                        )}
                        <div className="min-w-0">
                          <div className="flex items-center gap-2.5">
                            <span className="text-xs font-bold uppercase tracking-wider text-indigo-400">
                              {log.task_type}
                            </span>
                            <span className="font-mono text-[10px] text-[#6B6B67] select-all">
                              ID: {log.id.substring(0, 8)}...
                            </span>
                          </div>
                          <span className="font-mono text-[11px] text-[#A1A1AA] mt-0.5 block truncate">
                            {log.model_used}
                          </span>
                        </div>
                      </div>

                      <div className="flex items-center gap-6 shrink-0 text-xs">
                        <span className="font-mono text-[#6B6B67]">
                          {(log.duration_ms / 1000).toFixed(2)}s
                        </span>
                        <span className="font-mono text-[#6B6B67]">
                          {log.prompt_tokens + log.completion_tokens} tokens
                        </span>
                        <span className="text-[10px] text-[#6B6B67] font-mono">
                          {new Date(log.created_at).toLocaleTimeString()}
                        </span>
                        {isExpanded ? <ChevronUp size={16} className="text-[#6B6B67]" /> : <ChevronDown size={16} className="text-[#6B6B67]" />}
                      </div>
                    </button>

                    {/* Collapsed/Expanded Payload detail */}
                    {isExpanded && (
                      <div className="p-6 border-t border-white/5 bg-[#0F0F0E]/40 flex flex-col gap-6">
                        {log.error_message && (
                          <div className="p-4 rounded-lg bg-red-500/10 border border-red-500/20 text-xs text-red-400 font-mono">
                            <p className="font-bold text-red-500 mb-1">Execution Error Stack:</p>
                            {log.error_message}
                          </div>
                        )}

                        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                          {/* Inputs */}
                          <div className="flex flex-col gap-2">
                            <div className="flex items-center justify-between">
                              <span className="text-[10px] font-bold text-[#6B6B67] uppercase tracking-wider">Input Prompt / Payload</span>
                              <button
                                onClick={() => handleCopyText(JSON.stringify(log.input_payload, null, 2))}
                                className="text-[10px] font-bold text-[#A1A1AA] hover:text-white flex items-center gap-1"
                              >
                                <Copy size={11} /> Copy
                              </button>
                            </div>
                            <div className="bg-[#0F0F0E] border border-white/5 rounded-lg p-4 overflow-x-auto max-h-72">
                              <pre className="font-mono text-xs text-emerald-400 leading-relaxed whitespace-pre-wrap">
                                {JSON.stringify(log.input_payload, null, 2)}
                              </pre>
                            </div>
                          </div>

                          {/* Output response */}
                          <div className="flex flex-col gap-2">
                            <div className="flex items-center justify-between">
                              <span className="text-[10px] font-bold text-[#6B6B67] uppercase tracking-wider">Output Result JSON</span>
                              <button
                                onClick={() => handleCopyText(JSON.stringify(log.output_response, null, 2))}
                                className="text-[10px] font-bold text-[#A1A1AA] hover:text-white flex items-center gap-1"
                              >
                                <Copy size={11} /> Copy
                              </button>
                            </div>
                            <div className="bg-[#0F0F0E] border border-white/5 rounded-lg p-4 overflow-x-auto max-h-72">
                              <pre className="font-mono text-xs text-[#FAFAF8] leading-relaxed whitespace-pre-wrap">
                                {JSON.stringify(log.output_response, null, 2)}
                              </pre>
                            </div>
                          </div>
                        </div>
                      </div>
                    )}
                  </div>
                )
              })}
            </div>
          )}
        </div>
      )}
    </div>
  )
}
