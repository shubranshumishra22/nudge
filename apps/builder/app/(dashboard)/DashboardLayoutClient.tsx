'use client'

import { useState, useRef, useEffect, useCallback } from 'react'
import Link from 'next/link'
import { usePathname, useRouter } from 'next/navigation'
import { LayoutDashboard, Package, ShoppingBag, Paintbrush, Settings, ArrowUpCircle, Menu, X, ChevronUp, Sparkles, LogOut, ChevronLeft, PanelLeftClose, Sun, Moon } from 'lucide-react'
import { createBrowserSupabaseClient } from '@nudge/db'
import { useTheme } from '@/lib/ThemeProvider'
import ChatBox from './dashboard/components/ChatBox'

const navItems = [
  { href: '/dashboard', label: 'Home', icon: LayoutDashboard },
  { href: '/builder', label: 'AI Builder', icon: Sparkles, badge: 'NEW' as const },
  { href: '/dashboard/products', label: 'Products', icon: Package },
  { href: '/dashboard/orders', label: 'Orders', icon: ShoppingBag },
  { href: '/dashboard/appearance', label: 'Appearance', icon: Paintbrush },
  { href: '/dashboard/settings', label: 'Settings', icon: Settings },
]

const upgradeItem = { href: '/dashboard/upgrade', label: 'Upgrade', icon: ArrowUpCircle }

const SIDEBAR_MIN = 180
const SIDEBAR_MAX = 400
const SIDEBAR_DEFAULT = 220
const SIDEBAR_COLLAPSED_WIDTH = 0

function getInitials(name: string) {
  return name.split(' ').map((n) => n[0]).join('').toUpperCase().slice(0, 2) || 'U'
}

function truncateEmail(email: string, max = 22) {
  return email.length > max ? email.slice(0, max) + '…' : email
}

export default function DashboardLayoutClient({
  user,
  stores,
  activeStore,
  plan,
  children,
}: {
  user: any
  stores: any[]
  activeStore: any
  plan: string
  children: React.ReactNode
}) {
  const pathname = usePathname()
  const router = useRouter()
  const { theme, toggleTheme } = useTheme()
  const [sidebarOpen, setSidebarOpen] = useState(false)
  const [sidebarWidth, setSidebarWidth] = useState(SIDEBAR_DEFAULT)
  const [sidebarCollapsed, setSidebarCollapsed] = useState(false)
  const isBuilder = pathname.startsWith('/builder')
  const resizingRef = useRef(false)

  useEffect(() => {
    const saved = localStorage.getItem('nudge-sidebar-width')
    const collapsed = localStorage.getItem('nudge-sidebar-collapsed')
    if (saved) setSidebarWidth(Number(saved))
    if (collapsed === 'true') setSidebarCollapsed(true)
  }, [])

  useEffect(() => {
    localStorage.setItem('nudge-sidebar-width', String(sidebarWidth))
  }, [sidebarWidth])

  useEffect(() => {
    localStorage.setItem('nudge-sidebar-collapsed', String(sidebarCollapsed))
  }, [sidebarCollapsed])

  const startResize = useCallback((e: React.MouseEvent) => {
    e.preventDefault()
    resizingRef.current = true
    document.body.style.cursor = 'col-resize'
    document.body.style.userSelect = 'none'

    const handleMouseMove = (ev: MouseEvent) => {
      if (!resizingRef.current) return
      const newWidth = Math.max(SIDEBAR_MIN, Math.min(SIDEBAR_MAX, ev.clientX))
      setSidebarWidth(newWidth)
    }

    const handleMouseUp = () => {
      resizingRef.current = false
      document.body.style.cursor = ''
      document.body.style.userSelect = ''
      document.removeEventListener('mousemove', handleMouseMove)
      document.removeEventListener('mouseup', handleMouseUp)
    }

    document.addEventListener('mousemove', handleMouseMove)
    document.addEventListener('mouseup', handleMouseUp)
  }, [])

  const toggleCollapse = useCallback(() => {
    setSidebarCollapsed(prev => !prev)
  }, [])

  const navLink = (item: typeof navItems[number]) => {
    const href = item.label === 'AI Builder' && activeStore
      ? `/builder?store=${activeStore.id}`
      : item.href
    const active = pathname === item.href || (item.href !== '/dashboard' && pathname.startsWith(item.href)) || (item.label === 'AI Builder' && pathname.startsWith('/builder'))
    return (
      <Link
        key={item.label}
        href={href}
        className={`flex items-center gap-3 rounded-lg px-3 py-2.5 text-sm transition-colors ${
          active
            ? 'bg-[var(--bg-subtle)] font-medium text-[var(--text-primary)]'
            : 'text-[var(--text-secondary)] hover:bg-[var(--bg-subtle)] hover:text-[var(--text-primary)]'
        }`}
      >
        <item.icon size={18} className="shrink-0" />
        {item.label}
        {(item as any).badge && (
          <span
            className="ml-auto rounded-full px-1.5 py-0.5 text-[10px] font-medium"
            style={{ backgroundColor: 'var(--accent-subtle)', color: 'var(--accent)' }}
          >
            {(item as any).badge}
          </span>
        )}
      </Link>
    )
  }

  async function handleLogout() {
    const supabase = createBrowserSupabaseClient()
    await supabase.auth.signOut()
    router.push('/login')
  }

  const ownerStore = activeStore

  return (
    <div className="flex min-h-screen" style={{ backgroundColor: 'var(--bg-base)', color: 'var(--text-primary)' }}>
      <aside
        className={`fixed left-0 top-0 z-30 flex-col border-r transition-[width] duration-200 md:flex ${
          sidebarOpen ? 'flex' : 'hidden'
        }`}
        style={{
          width: sidebarCollapsed ? 0 : sidebarWidth,
          height: '100vh',
          top: 0,
          overflow: 'hidden',
          backgroundColor: 'var(--bg-surface)',
          borderColor: 'var(--border-default)',
        }}
      >
        <div className="flex items-center justify-between gap-2 border-b px-5 py-4" style={{ minWidth: SIDEBAR_MIN, borderColor: 'var(--border-default)' }}>
          <div className="flex items-center gap-2">
            <img src="https://i.postimg.cc/fyvVwyF5/Chat-GPT-Image-Jun-22-2026-08-08-03-PM.png" alt="Nudge" className="h-7 w-7 rounded-[8px] object-cover" />
            <span className="text-sm font-bold tracking-tight" style={{ color: 'var(--text-primary)' }}>Nudge</span>
          </div>
          <div className="flex items-center gap-1">
            <button
              onClick={toggleTheme}
              className="rounded-md p-1 transition-colors text-[var(--text-secondary)] hover:bg-[var(--bg-subtle)] hover:text-[var(--text-primary)]"
              aria-label="Toggle theme"
            >
              {theme === 'dark' ? <Sun size={16} /> : <Moon size={16} />}
            </button>
            <button
              onClick={toggleCollapse}
              className="rounded-md p-1 transition-colors text-[var(--text-secondary)] hover:bg-[var(--bg-subtle)] hover:text-[var(--text-primary)]"
            >
              <PanelLeftClose size={16} />
            </button>
          </div>
        </div>

        <nav className="flex-1 space-y-0.5 px-3 py-4" style={{ minWidth: SIDEBAR_MIN }}>
          {navItems.map(navLink)}
          <div className="my-2 border-t" style={{ borderColor: 'var(--border-default)' }} />
          {(() => {
            const active = pathname === upgradeItem.href
            return (
              <Link
                href={upgradeItem.href}
                className={`flex items-center gap-3 rounded-lg px-3 py-2.5 text-sm transition-colors ${
                  active
                    ? 'bg-[var(--bg-subtle)] font-medium text-[var(--text-primary)]'
                    : 'text-[var(--text-secondary)] hover:bg-[var(--bg-subtle)] hover:text-[var(--text-primary)]'
                }`}
              >
                <upgradeItem.icon size={18} className="shrink-0" />
                {upgradeItem.label}
              </Link>
            )
          })()}
        </nav>

        <div className="border-t px-4 py-4" style={{ minWidth: SIDEBAR_MIN, borderColor: 'var(--border-default)' }}>
          <div className="flex items-center gap-3">
            <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-[var(--bg-inverse)] text-xs font-medium text-[var(--text-inverse)]">
              {getInitials(user.email || '')}
            </div>
            <div className="min-w-0 flex-1">
              <p className="truncate text-xs font-medium" style={{ color: 'var(--text-primary)' }}>{truncateEmail(user.email || '')}</p>
              <span className="inline-block rounded-full px-2 py-0.5 text-[10px] font-medium uppercase tracking-wider text-[var(--text-secondary)] bg-[var(--bg-subtle)]">{plan}</span>
            </div>
          </div>

          {plan === 'free' && (
            <Link
              href="/dashboard/settings?upgrade=true"
              className="mt-3 flex items-center justify-center gap-2 rounded-lg px-3 py-2.5 text-xs font-semibold transition-opacity hover:opacity-90"
              style={{ backgroundColor: 'var(--bg-inverse)', color: 'var(--text-inverse)' }}
            >
              <ChevronUp size={14} />
              Upgrade to Pro
            </Link>
          )}
          <button
            onClick={handleLogout}
            className="mt-2 flex w-full items-center gap-2 rounded-lg px-3 py-2 text-xs transition-colors text-[var(--text-secondary)] hover:bg-[var(--bg-subtle)] hover:text-[var(--text-primary)]"
          >
            <LogOut size={14} />
            Log out
          </button>
        </div>

        <div
          className="absolute right-0 top-0 z-40 h-full w-1 cursor-col-resize hover:w-1.5 hover:bg-[var(--text-primary)]/10 active:bg-[var(--text-primary)]/20"
          onMouseDown={startResize}
        />
      </aside>

      {sidebarCollapsed && (
        <button
          onClick={toggleCollapse}
          className="fixed left-3 z-30 hidden rounded-md p-1.5 transition-colors text-[var(--text-secondary)] hover:bg-[var(--bg-subtle)] hover:text-[var(--text-primary)] md:block"
          style={{ top: 12 }}
        >
          <Menu size={18} />
        </button>
      )}

      <div className="fixed bottom-0 left-0 right-0 z-30 flex border-t md:hidden" style={{ backgroundColor: 'var(--bg-surface)', borderColor: 'var(--border-default)' }}>
        {[...navItems, upgradeItem].slice(0, 5).map((item) => {
          const href = item.label === 'AI Builder' && activeStore
            ? `/builder?store=${activeStore.id}`
            : item.href
          const active = pathname === item.href || (item.href !== '/dashboard' && pathname.startsWith(item.href)) || (item.label === 'AI Builder' && pathname.startsWith('/builder'))
          return (
            <Link
              key={item.label}
              href={href}
              className={`flex flex-1 flex-col items-center gap-1 py-2 text-[10px] ${
                active ? 'text-[var(--text-primary)]' : 'text-[var(--text-secondary)]'
              }`}
            >
              <item.icon size={18} />
              {item.label}
            </Link>
          )
        })}
      </div>

      <div
        className="flex-1 transition-[margin] duration-200"
        style={{ marginLeft: sidebarCollapsed ? 0 : sidebarWidth }}
      >
        {!isBuilder && (
          <header className="sticky top-0 z-20 flex items-center border-b px-4 py-3 backdrop-blur md:hidden" style={{ backgroundColor: 'var(--bg-surface-glass)', borderColor: 'var(--border-default)' }}>
            <button onClick={() => setSidebarOpen(!sidebarOpen)} style={{ color: 'var(--text-primary)' }}>
              {sidebarOpen ? <X size={20} /> : <Menu size={20} />}
            </button>
          </header>
        )}
        <div className={isBuilder ? '' : 'p-4 pb-20 md:p-8'}>{children}</div>
      </div>

      {activeStore && <ChatBox storeId={activeStore.id} />}
    </div>
  )
}
