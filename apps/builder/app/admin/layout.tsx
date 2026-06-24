import { redirect } from 'next/navigation'
import { verifyAdminAuth } from '@/lib/auth/adminAuthCheck'
import AdminShell from '@/components/admin/AdminShell'

export const metadata = {
  title: 'Nudge Admin Dashboard',
  description: 'Manage platform metrics, users, stores, and messages.'
}

export default async function AdminLayout({
  children
}: {
  children: React.ReactNode
}) {
  const { authorized, db } = await verifyAdminAuth()
  
  if (!authorized) {
    redirect('/dashboard?error=unauthorized')
  }

  // Fetch unread contact messages count for sidebar badge
  const { count } = await db
    .from('contact_messages')
    .select('*', { count: 'exact', head: true })
    .eq('status', 'unread')

  return (
    <AdminShell title="Nudge Admin" unreadMessagesCount={count || 0}>
      {children}
    </AdminShell>
  )
}
