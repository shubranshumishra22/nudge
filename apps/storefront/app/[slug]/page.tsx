export const revalidate = 60

import { createClient } from '@supabase/supabase-js'
import { notFound } from 'next/navigation'
import Hero from '@/components/templates/Minimal/Hero'
import ProductGrid from '@/components/templates/Minimal/ProductGrid'
import About from '@/components/templates/Minimal/About'
import Contact from '@/components/templates/Minimal/Contact'
import CustomSection from '@/components/templates/Minimal/CustomSection'

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
const supabase = createClient(supabaseUrl, supabaseAnonKey)

async function getPageData(slug: string) {
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

  const { data: allProducts } = await supabase
    .from('products')
    .select('*')
    .eq('store_id', store.id)
    .order('sort_order')

  const { data: images } = await supabase
    .from('product_images')
    .select('product_id, url')
    .in('product_id', (allProducts || []).map((p) => p.id))

  const imageMap = new Map<string, string>()
  for (const img of images || []) {
    if (!imageMap.has(img.product_id)) {
      imageMap.set(img.product_id, img.url)
    }
  }

  const products = (allProducts || []).map((p) => ({
    ...p,
    image: imageMap.get(p.id) || null,
    store_slug: slug,
  }))

  return { store, theme, products }
}

export default async function StoreHomePage({
  params,
}: {
  params: { slug: string }
}) {
  const data = await getPageData(params.slug)
  if (!data) notFound()

  const { store, theme, products } = data

  const sections = (theme.sections_order as string[]) || []
  const enabled = (theme.sections_enabled as Record<string, boolean>) || {}
  const customSections = (theme.custom_sections as any[]) || []
  const featuredProducts = products
    .filter((p: any) => p.is_featured)
    .slice(0, 4)
  const fallbackProducts = products.slice(0, 4)

  return (
    <>
      {sections.includes('hero') && enabled.hero !== false && (
        <Hero />
      )}
      {sections.includes('products') && enabled.products !== false && (
        <ProductGrid
          products={featuredProducts.length > 0 ? featuredProducts : fallbackProducts}
        />
      )}
      {sections.includes('about') && enabled.about !== false && (
        <About />
      )}
      {sections.includes('contact') && enabled.contact !== false && (
        <Contact />
      )}
      {customSections.map((cs: any) => (
        sections.includes(cs.id) && enabled[cs.id] !== false && (
          <CustomSection key={cs.id} html={cs.html} css={cs.css} />
        )
      ))}
    </>
  )
}
