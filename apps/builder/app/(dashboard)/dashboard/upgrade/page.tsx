import { createClient, SupabaseClient } from '@supabase/supabase-js'
import { cookies } from 'next/headers'
import { createServerSupabaseClient } from '@nudge/db'
import { redirect } from 'next/navigation'
import UpgradeClient from './UpgradeClient'

let dbClient: SupabaseClient | null = null

function getDb() {
  if (!dbClient) {
    const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL
    const supabaseKey = process.env.SUPABASE_SERVICE_ROLE_KEY
    if (!supabaseUrl || !supabaseKey) {
      throw new Error('Supabase environment variables are missing')
    }
    dbClient = createClient(supabaseUrl, supabaseKey)
  }
  return dbClient
}

export default async function UpgradePage() {
  const cookieStore = await cookies()
  const supabase = createServerSupabaseClient({ get(name) { return cookieStore.get(name)?.value }, set() {}, remove() {} })
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) redirect('/login')

  const db = getDb()
  const { data: profile } = await db.from('profiles').select('*').eq('id', user.id).single()

  return <UpgradeClient profile={profile} />
}
