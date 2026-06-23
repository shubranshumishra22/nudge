import { notFound } from 'next/navigation'
import type { Metadata } from 'next'

export const dynamic = 'force-dynamic'
import { createClient } from '@supabase/supabase-js'
import { StoreProvider, type StoreData } from '@/components/StoreProvider'
import Header from '@/components/templates/Minimal/Header'
import Footer from '@/components/templates/Minimal/Footer'

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
const supabase = createClient(supabaseUrl, supabaseAnonKey)

async function getStoreData(slug: string): Promise<StoreData | null> {
  const { data: store } = await supabase
    .from('stores')
    .select('*')
    .eq('slug', slug)
    .single()

  if (!store || store.status !== 'live') return null

  const { data: theme } = await supabase
    .from('store_themes')
    .select('*')
    .eq('store_id', store.id)
    .single()

  const { data: products } = await supabase
    .from('products')
    .select('*')
    .eq('store_id', store.id)
    .order('sort_order')

  const { data: owner } = await supabase
    .from('profiles')
    .select('plan')
    .eq('id', store.owner_id)
    .single()

  return {
    store,
    theme: theme!,
    products: products || [],
    ownerPlan: (owner as { plan?: string })?.plan ?? 'free',
  }
}

export async function generateMetadata({ params }: { params: { slug: string } }): Promise<Metadata> {
  const { data: store } = await supabase
    .from('stores')
    .select('name, description, tagline')
    .eq('slug', params.slug)
    .single()

  if (!store) return { title: 'Store not found' }

  return {
    title: store.name,
    description: store.description || store.tagline || `Shop at ${store.name}`,
    openGraph: {
      title: store.name,
      description: store.description || store.tagline || '',
      siteName: 'Nudge Commerce',
      type: 'website',
    },
  }
}

export default async function StoreLayout({
  children,
  params,
}: {
  children: React.ReactNode
  params: { slug: string }
}) {
  const storeData = await getStoreData(params.slug)

  if (!storeData) {
    notFound()
  }

  return (
    <StoreProvider storeData={storeData}>
      {storeData.theme.custom_css && (
        <style>{storeData.theme.custom_css}</style>
      )}
      <div className="flex min-h-screen flex-col" style={{ backgroundColor: storeData.theme.background_color || '#FAFAF8' }}>
        <Header />
        <main className="flex-1">{children}</main>
        <Footer />
      </div>
    </StoreProvider>
  )
}
