'use client'

import { useEffect, useState } from 'react'
import { useRouter } from 'next/navigation'
import { RotateCcw } from 'lucide-react'

interface AdminHeaderProps {
  title: string
}

export default function AdminHeader({ title }: AdminHeaderProps) {
  const router = useRouter()
  const [time, setTime] = useState('')
  const [isRefreshing, setIsRefreshing] = useState(false)

  useEffect(() => {
    const updateClock = () => {
      const now = new Date()
      setTime(now.toLocaleTimeString('en-US', { hour12: false }))
    }
    updateClock()
    const timer = setInterval(updateClock, 1000)
    return () => clearInterval(timer)
  }, [])

  const handleRefresh = () => {
    setIsRefreshing(true)
    router.refresh()
    setTimeout(() => setIsRefreshing(false), 800)
  }

  return (
    <header
      className="flex items-center justify-between px-6 z-10 shrink-0"
      style={{
        height: '52px',
        backgroundColor: '#1A1A1A',
        borderBottom: '1px solid rgba(255,255,255,0.08)',
        color: '#FAFAF8'
      }}
    >
      <h1 className="text-sm font-semibold tracking-tight text-white">{title}</h1>
      <div className="flex items-center gap-6">
        <div className="flex items-center gap-2">
          <span className="relative flex h-2 w-2">
            <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-[#4ADE80] opacity-75"></span>
            <span className="relative inline-flex rounded-full h-2 w-2 bg-[#4ADE80]"></span>
          </span>
          <span className="text-xs text-[#6B6B67]">System operational</span>
        </div>

        <button
          onClick={handleRefresh}
          className="text-[#6B6B67] hover:text-white transition-colors"
          title="Refresh current page"
        >
          <RotateCcw size={15} className={isRefreshing ? 'animate-spin' : ''} />
        </button>

        <div className="text-xs font-mono text-[#6B6B67] select-none">
          {time}
        </div>
      </div>
    </header>
  )
}
