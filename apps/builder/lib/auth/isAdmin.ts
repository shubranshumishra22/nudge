import { SupabaseClient } from '@supabase/supabase-js'

export async function isAdmin(
  userId: string,
  supabase: SupabaseClient
): Promise<boolean> {
  if (!userId) return false
  const { data } = await supabase
    .from('admin_users')
    .select('is_admin')
    .eq('user_id', userId)
    .maybeSingle()
  return data?.is_admin === true
}
