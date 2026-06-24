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
        backgroundColor: 'var(--bg)',
        color: 'var(--ink)',
        '--admin-bg': 'var(--bg)',
        '--admin-surface': 'var(--surface)',
        '--admin-surface-2': 'var(--bg-subtle)',
        '--admin-border': 'var(--sand-border)',
        '--admin-text': 'var(--ink)',
        '--admin-text-2': 'var(--muted)',
        '--admin-text-3': '#8C8375',
        '--admin-accent': 'var(--saffron)'
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
