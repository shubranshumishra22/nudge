'use client'

import Link from 'next/link'
import { usePathname } from 'next/navigation'
import { 
  LayoutDashboard, 
  Activity, 
  Users, 
  Store, 
  ShoppingBag, 
  MessageSquare, 
  Settings, 
  ArrowLeft 
} from 'lucide-react'

interface AdminSidebarProps {
  unreadMessagesCount?: number
}

export default function AdminSidebar({ unreadMessagesCount = 0 }: AdminSidebarProps) {
  const pathname = usePathname()

  const sections = [
    {
      label: 'OVERVIEW',
      items: [
        { href: '/admin', label: 'Dashboard', icon: LayoutDashboard },
        { href: '/admin/pipeline', label: 'Pipeline Health', icon: Activity }
      ]
    },
    {
      label: 'USERS & STORES',
      items: [
        { href: '/admin/users', label: 'Users', icon: Users },
        { href: '/admin/stores', label: 'Stores', icon: Store },
        { href: '/admin/orders', label: 'Orders', icon: ShoppingBag }
      ]
    },
    {
      label: 'COMMUNICATIONS',
      items: [
        { 
          href: '/admin/messages', 
          label: 'Messages', 
          icon: MessageSquare,
          badge: unreadMessagesCount > 0 ? unreadMessagesCount : undefined
        }
      ]
    },
    {
      label: 'SYSTEM',
      items: [
        { href: '/admin/settings', label: 'Settings', icon: Settings }
      ]
    }
  ]

  const navLink = (item: any) => {
    // Exact match for /admin, prefix match for others
    const active = item.href === '/admin' 
      ? pathname === '/admin' 
      : pathname.startsWith(item.href)

    return (
      <Link
        key={item.label}
        href={item.href}
        className="flex items-center justify-between px-3.5 py-2.5 text-xs font-semibold rounded-lg transition-all"
        style={{
          color: active ? '#FAFAF8' : '#6B6B67',
          backgroundColor: active ? 'rgba(255,255,255,0.08)' : 'transparent',
          borderLeft: active ? '2px solid #F97316' : '2px solid transparent',
          borderRadius: active ? '0px 8px 8px 0px' : '8px'
        }}
        onMouseEnter={(e) => {
          if (!active) {
            e.currentTarget.style.color = '#FAFAF8'
            e.currentTarget.style.backgroundColor = 'rgba(255,255,255,0.04)'
          }
        }}
        onMouseLeave={(e) => {
          if (!active) {
            e.currentTarget.style.color = '#6B6B67'
            e.currentTarget.style.backgroundColor = 'transparent'
          }
        }}
      >
        <div className="flex items-center gap-3">
          <item.icon size={16} className="shrink-0" />
          <span>{item.label}</span>
        </div>
        {item.badge !== undefined && (
          <span 
            className="flex h-5 items-center justify-center rounded-full px-1.5 text-[10px] font-mono font-bold text-white bg-[#EF4444]"
          >
            {item.badge}
          </span>
        )}
      </Link>
    )
  }

  return (
    <aside
      className="fixed left-0 top-0 flex flex-col justify-between shrink-0"
      style={{
        width: '240px',
        height: '100vh',
        backgroundColor: '#1A1A1A',
        borderRight: '1px solid rgba(255,255,255,0.08)',
        color: '#FAFAF8'
      }}
    >
      <div className="flex flex-col">
        {/* Top: Logo + Admin Badge */}
        <div className="flex items-center justify-between border-b px-5 py-4" style={{ borderColor: 'rgba(255,255,255,0.08)' }}>
          <div className="flex items-center gap-2">
            <img 
              src="https://i.postimg.cc/fyvVwyF5/Chat-GPT-Image-Jun-22-2026-08-08-03-PM.png" 
              alt="Nudge" 
              className="h-7 w-7 rounded-[8px] object-cover" 
            />
            <span className="text-sm font-bold tracking-tight text-white">Nudge</span>
          </div>
          <span 
            className="rounded px-2 py-0.5 text-[10px] font-bold tracking-widest uppercase text-white bg-[#EF4444]"
          >
            Admin
          </span>
        </div>

        {/* Navigation sections */}
        <nav className="flex flex-col gap-6 px-3.5 py-6">
          {sections.map((sec) => (
            <div key={sec.label} className="flex flex-col gap-1.5">
              <span className="px-3.5 text-[9px] font-bold tracking-wider text-[#6B6B67] mb-1 uppercase">
                {sec.label}
              </span>
              {sec.items.map(navLink)}
            </div>
          ))}
        </nav>
      </div>

      {/* Bottom info & signout link */}
      <div className="border-t p-4 flex flex-col gap-3" style={{ borderColor: 'rgba(255,255,255,0.08)' }}>
        <div className="flex items-center gap-3">
          <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-white/10 text-xs font-semibold text-white">
            NA
          </div>
          <div className="min-w-0 flex-1">
            <p className="truncate text-xs font-semibold text-white">Nudge Admin</p>
            <span 
              className="inline-block rounded-full px-2 py-0.5 text-[9px] font-bold tracking-wider uppercase bg-[#7F1D1D] text-[#FCA5A5] mt-0.5"
            >
              ADMIN
            </span>
          </div>
        </div>

        <Link
          href="/dashboard"
          className="flex items-center gap-2 text-xs font-medium text-[#6B6B67] hover:text-white transition-colors"
        >
          <ArrowLeft size={13} />
          <span>Back to app</span>
        </Link>
      </div>
    </aside>
  )
}
