import { NextResponse } from 'next/server'
import { verifyAdminAuth } from '@/lib/auth/adminAuthCheck'

export async function POST() {
  const { authorized } = await verifyAdminAuth()
  if (!authorized) {
    return NextResponse.json({ error: 'Forbidden' }, { status: 403 })
  }

  const redisUrl = process.env.UPSTASH_REDIS_REST_URL
  const redisToken = process.env.UPSTASH_REDIS_REST_TOKEN

  if (!redisUrl || !redisToken) {
    return NextResponse.json({ error: 'Redis credentials not configured' }, { status: 400 })
  }

  try {
    const { Redis } = await import('@upstash/redis')
    const redis = new Redis({ url: redisUrl, token: redisToken })
    
    // Flush the database
    await redis.flushdb()
    
    return NextResponse.json({ success: true, message: 'Redis database flushed successfully.' })
  } catch (err: any) {
    console.error('Error flushing Redis cache:', err)
    return NextResponse.json({ error: err.message || 'Internal server error' }, { status: 500 })
  }
}
