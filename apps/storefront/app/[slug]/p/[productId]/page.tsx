export const revalidate = 60

import { createClient } from '@supabase/supabase-js'
import type { Metadata } from 'next'
import { notFound } from 'next/navigation'
import ProductDetailClient from './ProductDetailClient'

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
const supabase = createClient(supabaseUrl, supabaseAnonKey)

async function getProduct(slug: string, productId: string) {
  const { data: store } = await supabase
    .from('stores')
    .select('id, slug, name')
    .eq('slug', slug)
    .single()

  if (!store) return null

  const { data: product } = await supabase
    .from('products')
    .select('*')
    .eq('id', productId)
    .eq('store_id', store.id)
    .single()

  if (!product) return null

  const { data: images } = await supabase
    .from('product_images')
    .select('url, alt_text, is_primary')
    .eq('product_id', product.id)
    .order('sort_order')

  return { store, product, images: images || [] }
}

export async function generateMetadata({ params }: { params: { slug: string; productId: string } }): Promise<Metadata> {
  const data = await getProduct(params.slug, params.productId)
  if (!data) return { title: 'Product not found' }

  return {
    title: `${data.product.name} — ${data.store.name}`,
    description: data.product.description || `Buy ${data.product.name} from ${data.store.name}`,
    openGraph: {
      title: `${data.product.name} — ${data.store.name}`,
      description: data.product.description || '',
      images: data.images?.[0]?.url ? [{ url: data.images[0].url }] : [],
    },
  }
}

export default async function ProductPage({
  params,
}: {
  params: { slug: string; productId: string }
}) {
  const data = await getProduct(params.slug, params.productId)
  if (!data) notFound()

  return <ProductDetailClient data={data} />
}
