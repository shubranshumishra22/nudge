import { cookies } from 'next/headers'
import { createClient } from '@supabase/supabase-js'
import { createServerSupabaseClient } from '@nudge/db'
import { isAdmin } from './isAdmin'

export interface AdminAuthResult {
  authorized: boolean
  user?: any
  db?: any // service role client (bypasses RLS)
  errorResponse?: any
}

export async function verifyAdminAuth(): Promise<AdminAuthResult> {
  const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!
  const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY!
  const cookieStore = cookies()

  const supabase = createServerSupabaseClient({
    get(name) { return cookieStore.get(name)?.value },
    set() {},
    remove() {}
  })

  const { data: { user } } = await supabase.auth.getUser()
  if (!user) {
    return { authorized: false }
  }

  // Create service role client to check admin table (which has RLS)
  const db = createClient(supabaseUrl, supabaseServiceKey)

  const isUserAdmin = await isAdmin(user.id, db)
  if (!isUserAdmin) {
    return { authorized: false }
  }

  return {
    authorized: true,
    user,
    db
  }
}
