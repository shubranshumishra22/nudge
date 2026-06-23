import { NextResponse } from 'next/server'
import { createClient } from '@supabase/supabase-js'
import { cookies } from 'next/headers'
import { createServerSupabaseClient } from '@nudge/db'

export async function POST(
  request: Request,
  { params }: { params: { id: string } }
) {
  try {
    const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!
    const supabaseKey = process.env.SUPABASE_SERVICE_ROLE_KEY!
    const db = createClient(supabaseUrl, supabaseKey)
    const cookieStore = await cookies()
    const supabase = createServerSupabaseClient({ get(name) { return cookieStore.get(name)?.value }, set() {}, remove() {} })
    const { data: { user } } = await supabase.auth.getUser()
    if (!user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

    const { data: store } = await db.from('stores').select('*').eq('id', params.id).eq('owner_id', user.id).single()
    if (!store) return NextResponse.json({ error: 'Store not found' }, { status: 404 })

    await db.from('stores').update({ status: 'live', published_at: new Date().toISOString() }).eq('id', params.id)

    await db.from('profiles').update({ onboarding_completed: true }).eq('id', user.id)

    const storefrontUrl = process.env.NEXT_PUBLIC_STOREFRONT_URL
    const storeUrl = storefrontUrl
      ? `${storefrontUrl}/${store.slug}`
      : `https://${store.slug}.nudge.store`

    return NextResponse.json({
      slug: store.slug,
      url: storeUrl,
    })
  } catch (err) {
    return NextResponse.json({ error: 'Internal error' }, { status: 500 })
  }
}
