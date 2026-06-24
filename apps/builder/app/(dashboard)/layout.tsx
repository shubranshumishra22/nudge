import { createClient, SupabaseClient } from '@supabase/supabase-js'
import { notFound, redirect } from 'next/navigation'
import { cookies } from 'next/headers'
import { createServerSupabaseClient } from '@nudge/db'
import DashboardLayoutClient from './DashboardLayoutClient'

let dbClient: SupabaseClient | null = null

function getDb() {
  if (!dbClient) {
    const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL
    const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY
    if (!supabaseUrl || !supabaseServiceKey) {
      throw new Error('Supabase environment variables are missing')
    }
    dbClient = createClient(supabaseUrl, supabaseServiceKey)
  }
  return dbClient
}

async function getDashboardData(storeSlug: string) {
  const db = getDb()
  const { data: store } = await db.from('stores').select('*').eq('slug', storeSlug).single()
  if (!store) return null
  const { data: theme } = await db.from('store_themes').select('*').eq('store_id', store.id).single()
  const { data: owner } = await db.from('profiles').select('*').eq('id', store.owner_id).single()
  return { store, theme, owner }
}

export default async function DashboardLayout({ children }: { children: React.ReactNode }) {
  const cookieStore = await cookies()
  const supabase = createServerSupabaseClient({
    get(name) { return cookieStore.get(name)?.value },
    set() {},
    remove() {},
  })
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) redirect('/login')

  const db = getDb()
  const { data: stores } = await db.from('stores').select('id, slug, name, status').eq('owner_id', user.id)
  const activeStore = stores?.[0]

  const { data: profile } = await db.from('profiles').select('plan').eq('id', user.id).maybeSingle()
  const plan = profile?.plan || 'free'

  return (
    <DashboardLayoutClient user={user} stores={stores || []} activeStore={activeStore || null} plan={plan}>
      {children}
    </DashboardLayoutClient>
  )
}
