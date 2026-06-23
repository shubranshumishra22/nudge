import { NextResponse } from 'next/server'
import type { NextRequest } from 'next/server'
import { createClient } from '@supabase/supabase-js'

export async function middleware(request: NextRequest) {
  const supabase = createClient(process.env.NEXT_PUBLIC_SUPABASE_URL!, process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!)
  const { hostname, pathname } = new URL(request.url)
  let slug: string | null = null

  const subdomainMatch = hostname.match(/^([a-z0-9-]+)\.nudge\.store$/)
  if (subdomainMatch) {
    slug = subdomainMatch[1]
  }

  if (!slug && !hostname.includes('localhost') && !hostname.startsWith('192.') && !hostname.startsWith('10.')) {
    const { data } = await supabase
      .from('store_domains')
      .select('store_id')
      .eq('domain', hostname)
      .eq('verified', true)
      .maybeSingle()

    if (data?.store_id) {
      const { data: storeData } = await supabase
        .from('stores')
        .select('slug')
        .eq('id', data.store_id)
        .single()

      if (storeData) {
        slug = storeData.slug
      }
    }
  }

  if (slug) {
    const url = request.nextUrl.clone()
    url.pathname = `/${slug}${pathname === '/' ? '' : pathname}`
    url.search = request.nextUrl.search
    return NextResponse.rewrite(url)
  }

  return NextResponse.next()
}

export const config = {
  matcher: ['/((?!api|_next/static|_next/image|favicon.ico).*)'],
}
