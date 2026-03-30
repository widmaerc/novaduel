import { NextRequest, NextResponse } from 'next/server'
import { supabaseAdmin } from '@/lib/supabase'

export async function GET(
  _req: NextRequest,
  { params }: { params: Promise<{ slug: string }> },
) {
  const { slug } = await params

  const { data: player } = await supabaseAdmin
    .from('players')
    .select('league, league_slug, season, sportmonks_id')
    .eq('slug', slug)
    .single()

  if (!player) return NextResponse.json({ competitions: [], seasons: [] })

  // Build list from DB data (one entry per player for now)
  const competitions = player.league
    ? [{ id: player.league_slug ?? player.league, name: player.league, logo: null }]
    : []

  const seasons = player.season ? [player.season] : []

  return NextResponse.json({ competitions, seasons })
}
