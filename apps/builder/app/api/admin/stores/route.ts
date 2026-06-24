import { NextResponse } from 'next/server'
import { verifyAdminAuth } from '@/lib/auth/adminAuthCheck'

export async function GET(request: Request) {
  const { authorized, db } = await verifyAdminAuth()
  if (!authorized) {
    return NextResponse.json({ error: 'Forbidden' }, { status: 403 })
  }

  const { searchParams } = new URL(request.url)
  const search = searchParams.get('search') || ''
  const status = searchParams.get('status') || 'All'
  const type = searchParams.get('type') || 'All'
  const sort = searchParams.get('sort') || 'Newest'
  const page = parseInt(searchParams.get('page') || '1', 10)
  const limit = 50
  const offset = (page - 1) * limit

  try {
    // 1. Fetch user emails to map IDs to owner emails
    const { data: { users: sbUsers } } = await db.auth.admin.listUsers()
    const emailMap = new Map<string, string>()
    if (sbUsers) {
      for (const u of sbUsers) {
        emailMap.set(u.id, u.email || '')
      }
    }

    // 2. Fetch stores query
    let query = db.from('stores').select('*')

    if (status !== 'All') {
      query = query.eq('status', status.toLowerCase())
    }
    if (type !== 'All') {
      query = query.eq('business_type', type.toLowerCase())
    }

    const { data: stores, error: storesErr } = await query
    if (storesErr) {
      console.error('Error fetching stores:', storesErr)
      return NextResponse.json({ error: storesErr.message }, { status: 500 })
    }

    // 3. Query all products and orders to aggregate counts and revenue in-memory
    const { data: allProducts } = await db.from('products').select('id, store_id')
    const { data: allOrders } = await db.from('orders').select('id, store_id, total, status')

    const productMap = new Map<string, number>() // store_id -> count
    if (allProducts) {
      for (const p of allProducts) {
        productMap.set(p.store_id, (productMap.get(p.store_id) || 0) + 1)
      }
    }

    const orderCountMap = new Map<string, number>() // store_id -> count
    const revenueMap = new Map<string, number>() // store_id -> sum total
    if (allOrders) {
      for (const o of allOrders) {
        orderCountMap.set(o.store_id, (orderCountMap.get(o.store_id) || 0) + 1)
        if (o.status !== 'cancelled') {
          revenueMap.set(o.store_id, (revenueMap.get(o.store_id) || 0) + (o.total || 0))
        }
      }
    }

    // 4. Map into rich object rows
    let storeRows = (stores || []).map((s: any) => {
      const email = emailMap.get(s.owner_id) || 'unknown@nudge.store'
      const productsCount = productMap.get(s.id) || 0
      const ordersCount = orderCountMap.get(s.id) || 0
      const revenue = (revenueMap.get(s.id) || 0) / 100 // converted to Rupees

      return {
        id: s.id,
        name: s.name,
        slug: s.slug,
        owner_id: s.owner_id,
        owner_email: email,
        business_type: s.business_type,
        status: s.status,
        products_count: productsCount,
        orders_count: ordersCount,
        revenue,
        created_at: s.created_at
      }
    })

    // Filter by search (store name or slug)
    if (search) {
      const term = search.toLowerCase()
      storeRows = storeRows.filter(
        (r: any) => r.name.toLowerCase().includes(term) || r.slug.toLowerCase().includes(term)
      )
    }

    // Sort rows
    if (sort === 'Newest') {
      storeRows.sort((a: any, b: any) => new Date(b.created_at).getTime() - new Date(a.created_at).getTime())
    } else if (sort === 'Most orders') {
      storeRows.sort((a: any, b: any) => b.orders_count - a.orders_count)
    } else if (sort === 'Most revenue') {
      storeRows.sort((a: any, b: any) => b.revenue - a.revenue)
    }

    const totalCount = storeRows.length
    const paginatedRows = storeRows.slice(offset, offset + limit)

    return NextResponse.json({
      stores: paginatedRows,
      totalCount,
      page,
      totalPages: Math.ceil(totalCount / limit)
    })
  } catch (err) {
    console.error('Stores API endpoint error:', err)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}
