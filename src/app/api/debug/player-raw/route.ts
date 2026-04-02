// SPORTMONKS DISABLED — cette route debug appelait directement Sportmonks
/*
import { NextRequest, NextResponse } from 'next/server'
import { supabaseAdmin } from '@/lib/supabase'

const BASE  = 'https://api.sportmonks.com/v3/football'
const TOKEN = process.env.SPORTMONKS_API_KEY!

export async function GET(req: NextRequest) {
  const slugParam = req.nextUrl.searchParams.get('slug') ?? ''

  const { data: dbPlayer } = await supabaseAdmin
    .from('players')
    .select('sportmonks_id, name, slug, goals, assists, rating, pass_accuracy')
    .eq('slug', slugParam)
    .single()

  if (!dbPlayer?.sportmonks_id) {
    return NextResponse.json({ error: 'Player not found', slug: slugParam }, { status: 404 })
  }

  const url = new URL(`${BASE}/players/${dbPlayer.sportmonks_id}`)
  url.searchParams.set('api_token', TOKEN)
  url.searchParams.set('include', 'statistics.details;statistics.season;latest;transfers;trophies')

  const res  = await fetch(url.toString(), { cache: 'no-store' })
  const json = await res.json()

  const stats   = (json?.data?.statistics ?? [])
    .sort((a: any, b: any) => (b.season_id ?? 0) - (a.season_id ?? 0))
  const details = stats[0]?.details ?? []

  const latest   = json?.data?.latest ?? []
  const trophies = json?.data?.trophies ?? []
  const transfers = json?.data?.transfers ?? []

  return NextResponse.json({
    db: dbPlayer,
    sportmonks_id: dbPlayer.sportmonks_id,
    latest_season_id: stats[0]?.season_id,
    details_count: details.length,
    details: details.map((d: any) => ({ type_id: d.type_id, value: d.value })),
    all_seasons: stats.map((s: any) => ({ season_id: s.season_id, details_count: s.details?.length ?? 0 })),
    latest_count: latest.length,
    latest_sample: latest.slice(0, 3),
    trophies_count: trophies.length,
    trophies_sample: trophies.slice(0, 3),
    transfers_count: transfers.length,
    transfers_sample: transfers.slice(0, 3),
  })
}
*/

export function GET() {
  return new Response('disabled', { status: 410 });
}
