import { NextRequest, NextResponse } from 'next/server'
import { updateCurrentSeason } from '@/lib/season'

export async function GET(req: NextRequest) {
  const auth = req.headers.get('authorization')

  if (process.env.CRON_SECRET && auth !== `Bearer ${process.env.CRON_SECRET}`) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  }

  try {
    const result = await updateCurrentSeason()
    return NextResponse.json({ ok: true, ...result })
  } catch (e) {
    console.error('[cron] update-season error:', e)
    return NextResponse.json({ ok: false, error: String(e) }, { status: 500 })
  }
}

export const maxDuration = 10
