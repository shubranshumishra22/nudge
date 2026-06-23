export const revalidate = 60

import { createClient } from '@supabase/supabase-js'
import { notFound } from 'next/navigation'
import ProductsClient from './ProductsClient'

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
const supabase = createClient(supabaseUrl, supabaseAnonKey)

async function getProducts(slug: string) {
  const { data: store } = await supabase
    .from('stores')
    .select('id')
    .eq('slug', slug)
    .single()

  if (!store) return null

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

  const categories = [...new Set(products.map((p: any) => p.category).filter(Boolean))] as string[]

  return { products, categories }
}

export default async function ProductsPage({
  params,
}: {
  params: { slug: string }
}) {
  const data = await getProducts(params.slug)
  if (!data) notFound()

  return <ProductsClient products={data.products} categories={data.categories} slug={params.slug} />
}
