import { NextRequest, NextResponse } from 'next/server'
import { syncPlayers } from '@/lib/sync-players'

export async function GET(req: NextRequest) {
  const auth = req.headers.get('authorization')

  if (process.env.CRON_SECRET && auth !== `Bearer ${process.env.CRON_SECRET}`) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  }

  console.log('[cron] sync-players start')
  const start = Date.now()

  try {
    const result = await syncPlayers()
    const duration = ((Date.now() - start) / 1000).toFixed(1)
    return NextResponse.json({ ok: true, duration: `${duration}s`, ...result })
  } catch (e) {
    console.error('[cron] sync-players error:', e)
    return NextResponse.json({ ok: false, error: String(e) }, { status: 500 })
  }
}

export const maxDuration = 300 // 5 min
