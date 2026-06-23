import { createServerClient, type CookieMethods } from '@supabase/ssr'
import type { Database } from '../types'

export function createMiddlewareSupabaseClient(cookies: CookieMethods) {
  const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!
  const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
  return createServerClient(supabaseUrl, supabaseAnonKey, { cookies })
}
