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
  const payment = searchParams.get('payment') || 'All'
  const from = searchParams.get('from')
  const to = searchParams.get('to')
  const page = parseInt(searchParams.get('page') || '1', 10)
  const limit = 50
  const offset = (page - 1) * limit

  try {
    let query = db
      .from('orders')
      .select('*, stores(name)')

    if (status !== 'All') {
      query = query.eq('status', status.toLowerCase())
    }
    if (payment !== 'All') {
      query = query.eq('payment_method', payment.toLowerCase())
    }
    if (from) {
      query = query.gte('created_at', new Date(from).toISOString())
    }
    if (to) {
      query = query.lte('created_at', new Date(to).toISOString())
    }

    const { data: orders, error } = await query.order('created_at', { ascending: false })

    if (error) {
      console.error('Error fetching orders:', error)
      return NextResponse.json({ error: error.message }, { status: 500 })
    }

     let rows = (orders || []).map((o: any) => ({
      id: o.id,
      order_number: o.order_number,
      store_name: (o.stores as any)?.name || 'Deleted Store',
      customer_name: o.customer_name,
      customer_email: o.customer_email || '',
      customer_phone: o.customer_phone || '',
      total: o.total / 100, // convert to Rupees
      payment_method: o.payment_method,
      status: o.status,
      created_at: o.created_at
    }))

    // Filter by search (order number or customer name/phone)
    if (search) {
      const term = search.toLowerCase()
      rows = rows.filter(
        (r: any) => r.order_number?.toLowerCase().includes(term) ||
             r.customer_name?.toLowerCase().includes(term) ||
             r.customer_phone?.toLowerCase().includes(term)
      )
    }

    const totalCount = rows.length
    const paginatedRows = rows.slice(offset, offset + limit)

    return NextResponse.json({
      orders: paginatedRows,
      totalCount,
      page,
      totalPages: Math.ceil(totalCount / limit)
    })
  } catch (err) {
    console.error('Orders API endpoint error:', err)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}
