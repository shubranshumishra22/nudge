import { createClient } from '@supabase/supabase-js'
import { redirect } from 'next/navigation'
import { cookies } from 'next/headers'
import { createServerSupabaseClient } from '@nudge/db'
import BuilderShell from '@/components/builder/BuilderShell'

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY!
const db = createClient(supabaseUrl, supabaseServiceKey)

export default async function BuilderPage({
  searchParams,
}: {
  searchParams: { store?: string }
}) {
  const cookieStore = await cookies()
  const supabase = createServerSupabaseClient({
    get(name: string) { return cookieStore.get(name)?.value },
    set() {},
    remove() {},
  })
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) redirect('/login')

  const storeId = searchParams.store
  if (!storeId) redirect('/dashboard')

  const { data: store } = await db
    .from('stores')
    .select('id')
    .eq('id', storeId)
    .eq('owner_id', user.id)
    .single()

  if (!store) redirect('/dashboard')

  return <BuilderShell storeId={store.id} />
}
