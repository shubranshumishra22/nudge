import { redirect, notFound } from 'next/navigation'
import { verifyAdminAuth } from '@/lib/auth/adminAuthCheck'
import StoreDetailClient from '@/components/admin/StoreDetailClient'

export default async function AdminStoreDetailPage({
  params
}: {
  params: { id: string }
}) {
  const { authorized, db } = await verifyAdminAuth()
  
  if (!authorized) {
    redirect('/dashboard?error=unauthorized')
  }

  const storeId = params.id
  if (!storeId) {
    notFound()
  }

  // 1. Fetch store
  const { data: store, error: storeErr } = await db
    .from('stores')
    .select('*')
    .eq('id', storeId)
    .single()

  if (storeErr || !store) {
    console.error('Error fetching store details:', storeErr)
    notFound()
  }

  // Fetch owner email
  let ownerEmail = 'unknown@nudge.store'
  try {
    const { data: { user: sbUser } } = await db.auth.admin.getUserById(store.owner_id)
    if (sbUser) {
      ownerEmail = sbUser.email || 'unknown@nudge.store'
    }
  } catch (err) {
    console.error('Error fetching owner profile details:', err)
  }

  // 2. Fetch products
  const { data: products } = await db
    .from('products')
    .select('*')
    .eq('store_id', storeId)
    .order('created_at', { ascending: false })

  // 3. Fetch orders
  const { data: orders } = await db
    .from('orders')
    .select('*')
    .eq('store_id', storeId)
    .order('created_at', { ascending: false })

  const enrichedStore = {
    ...store,
    owner_email: ownerEmail
  }

  return (
    <StoreDetailClient 
      store={enrichedStore} 
      products={products || []} 
      orders={orders || []} 
    />
  )
}
