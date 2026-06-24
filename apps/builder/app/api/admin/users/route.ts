import { NextResponse } from 'next/server'
import { verifyAdminAuth } from '@/lib/auth/adminAuthCheck'

export async function GET(request: Request) {
  const { authorized, db } = await verifyAdminAuth()
  if (!authorized) {
    return NextResponse.json({ error: 'Forbidden' }, { status: 403 })
  }

  const { searchParams } = new URL(request.url)
  const search = searchParams.get('search') || ''
  const plan = searchParams.get('plan') || 'All'
  const sort = searchParams.get('sort') || 'Newest'
  const from = searchParams.get('from')
  const to = searchParams.get('to')
  const page = parseInt(searchParams.get('page') || '1', 10)
  const limit = 50
  const offset = (page - 1) * limit

  try {
    // 1. Fetch user emails from auth.users to map to profiles
    const { data: authUsers, error: authErr } = await db
      .from('profiles')
      .select('id') // We need to fetch all profiles first to build filters

    if (authErr) {
      console.error('Error fetching profiles:', authErr)
      return NextResponse.json({ error: authErr.message }, { status: 500 })
    }

    // Supabase JS client doesn't allow joining auth.users easily from profiles,
    // but profiles has full_name, plan, and ID. Let's fetch auth.users metadata if possible
    // actually, we can query auth.users list if we have admin rights. Let's do that:
    const { data: { users: sbUsers }, error: usersErr } = await db.auth.admin.listUsers()
    const emailMap = new Map<string, string>() // id -> email
    if (sbUsers) {
      for (const u of sbUsers) {
        emailMap.set(u.id, u.email || '')
      }
    }

    // 2. Fetch profiles
    let query = db.from('profiles').select('*')

    if (plan !== 'All') {
      query = query.eq('plan', plan)
    }

    if (from) {
      query = query.gte('created_at', new Date(from).toISOString())
    }
    if (to) {
      query = query.lte('created_at', new Date(to).toISOString())
    }

    const { data: profiles, error: profileErr } = await query

    if (profileErr) {
      console.error('Error fetching user profiles:', profileErr)
      return NextResponse.json({ error: profileErr.message }, { status: 500 })
    }

    // 3. For each profile, fetch stores and compute order counts
    const { data: allStores } = await db
      .from('stores')
      .select('id, owner_id')

    const { data: allOrders } = await db
      .from('orders')
      .select('id, store_id')

    const storeMap = new Map<string, string[]>() // owner_id -> store_ids[]
    if (allStores) {
      for (const s of allStores) {
        const list = storeMap.get(s.owner_id) || []
        list.push(s.id)
        storeMap.set(s.owner_id, list)
      }
    }

    const orderCountMap = new Map<string, number>() // store_id -> order_count
    if (allOrders) {
      for (const o of allOrders) {
        orderCountMap.set(o.store_id, (orderCountMap.get(o.store_id) || 0) + 1)
      }
    }

    // Map profiles into extended UI rows
    let userRows = (profiles || []).map((p: any) => {
      const email = emailMap.get(p.id) || 'unknown@nudge.store'
      const storeIds = storeMap.get(p.id) || []
      const storesCount = storeIds.length
      let ordersCount = 0
      for (const storeId of storeIds) {
        ordersCount += orderCountMap.get(storeId) || 0
      }

      return {
        id: p.id,
        email,
        full_name: p.full_name || '',
        plan: p.plan,
        plan_expires_at: p.plan_expires_at,
        stores_count: storesCount,
        orders_count: ordersCount,
        created_at: p.created_at
      }
    })

    // Filter by search (name or email)
    if (search) {
      const term = search.toLowerCase()
      userRows = userRows.filter(
        (r: any) => r.full_name.toLowerCase().includes(term) || r.email.toLowerCase().includes(term)
      )
    }

    // Sort rows
    if (sort === 'Newest') {
      userRows.sort((a: any, b: any) => new Date(b.created_at).getTime() - new Date(a.created_at).getTime())
    } else if (sort === 'Oldest') {
      userRows.sort((a: any, b: any) => new Date(a.created_at).getTime() - new Date(b.created_at).getTime())
    } else if (sort === 'Most stores') {
      userRows.sort((a: any, b: any) => b.stores_count - a.stores_count)
    } else if (sort === 'Most orders') {
      userRows.sort((a: any, b: any) => b.orders_count - a.orders_count)
    }

    const totalCount = userRows.length
    const paginatedRows = userRows.slice(offset, offset + limit)

    return NextResponse.json({
      users: paginatedRows,
      totalCount,
      page,
      totalPages: Math.ceil(totalCount / limit)
    })
  } catch (err) {
    console.error('Users API endpoint error:', err)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}
