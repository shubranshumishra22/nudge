'use client'

import AdminSidebar from './AdminSidebar'
import AdminHeader from './AdminHeader'

interface AdminShellProps {
  children: React.ReactNode
  title: string
  unreadMessagesCount?: number
}

export default function AdminShell({
  children,
  title,
  unreadMessagesCount = 0
}: AdminShellProps) {
  return (
    <div
      className="flex min-h-screen font-sans"
      style={{
        backgroundColor: '#0F0F0E',
        color: '#FAFAF8',
        '--admin-bg': '#0F0F0E',
        '--admin-surface': '#1A1A1A',
        '--admin-surface-2': '#242424',
        '--admin-border': 'rgba(255,255,255,0.08)',
        '--admin-text': '#FAFAF8',
        '--admin-text-2': '#A1A1AA',
        '--admin-text-3': '#6B6B67',
        '--admin-accent': '#F97316'
      } as React.CSSProperties}
    >
      {/* 240px Fixed Sidebar */}
      <AdminSidebar unreadMessagesCount={unreadMessagesCount} />

      {/* Main Layout Area */}
      <div 
        className="flex-1 flex flex-col min-w-0" 
        style={{ marginLeft: '240px' }}
      >
        <AdminHeader title={title} />
        
        {/* Scrollable Page Wrapper */}
        <main className="flex-1 overflow-y-auto p-6 md:p-8">
          <div className="mx-auto max-w-7xl">
            {children}
          </div>
        </main>
      </div>
    </div>
  )
}
