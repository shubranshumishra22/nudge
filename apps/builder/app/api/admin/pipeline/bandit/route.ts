import { NextResponse } from 'next/server'
import { verifyAdminAuth } from '@/lib/auth/adminAuthCheck'
import { getBanditStats, MODEL_POOL } from '@/lib/pipeline/v3/modelBandit'

export async function GET() {
  const { authorized } = await verifyAdminAuth()
  if (!authorized) {
    return NextResponse.json({ error: 'Forbidden' }, { status: 403 })
  }

  try {
    const stats = await getBanditStats()

    // Populate default stats for models in MODEL_POOL that don't have stats yet
    const statsMap = new Map<string, any>()
    for (const stat of stats) {
      statsMap.set(`${stat.task}:${stat.model}`, stat)
    }

    const mergedStats = [...stats]

    for (const [task, models] of Object.entries(MODEL_POOL)) {
      for (const model of models) {
        const key = `${task}:${model}`
        if (!statsMap.has(key)) {
          const defaultStat = {
            model,
            task: task as any,
            score: 0.5,
            calls: 0,
            wins: 0,
            last_updated: new Date().toISOString()
          }
          mergedStats.push(defaultStat)
          statsMap.set(key, defaultStat)
        }
      }
    }

    // Sort by win_rate or score desc
    mergedStats.sort((a, b) => b.score - a.score)

    return NextResponse.json(mergedStats)
  } catch (err) {
    console.error('Bandit stats error:', err)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}
