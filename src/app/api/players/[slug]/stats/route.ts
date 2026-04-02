import { NextRequest, NextResponse } from 'next/server'
import { supabaseAdmin } from '@/lib/supabase'
import { getCurrentSeason } from '@/lib/season'
import { cached, TTL } from '@/lib/redis'

// Compute flat stats from a single API-Football statistics entry
// eslint-disable-next-line @typescript-eslint/no-explicit-any
function computeStats(s: any, season: number) {
  return {
    season,
    league_id:        s.league?.id          ?? null,
    league_name:      s.league?.name        ?? null,
    league_logo:      s.league?.logo        ?? null,
    team_id:          s.team?.id            ?? null,
    team_name:        s.team?.name          ?? null,
    team_logo:        s.team?.logo          ?? null,
    goals:            s.goals?.total        ?? 0,
    assists:          s.goals?.assists      ?? 0,
    matches:          s.games?.appearences  ?? 0,
    minutes:          s.games?.minutes      ?? 0,
    rating:           parseFloat(s.games?.rating ?? '0') || 0,
    pass_accuracy:    parseFloat((s.passes?.accuracy ?? '0').toString().replace('%', '')) || 0,
    dribbles:         s.dribbles?.success   ?? 0,
    duels_won:        s.duels?.total > 0
      ? Math.round(((s.duels?.won ?? 0) / s.duels.total) * 100)
      : 0,
    shots_on_target:  s.shots?.on           ?? 0,
    yellow_cards:     s.cards?.yellow       ?? 0,
    red_cards:        s.cards?.red          ?? 0,
  }
}

// Merge (sum) multiple stats entries when no league/team filter is active
// eslint-disable-next-line @typescript-eslint/no-explicit-any
function mergeStats(entries: any[], season: number) {
  const totals = {
    season,
    league_id: null as number | null,
    league_name: null as string | null,
    league_logo: null as string | null,
    team_id: null as number | null,
    team_name: null as string | null,
    team_logo: null as string | null,
    goals: 0, assists: 0, matches: 0, minutes: 0,
    rating: 0, pass_accuracy: 0, dribbles: 0, duels_won: 0,
    shots_on_target: 0, yellow_cards: 0, red_cards: 0,
  }

  if (entries.length === 1) return computeStats(entries[0], season)

  let ratingCount = 0
  let duelsTotal = 0
  let duelsWon = 0

  for (const s of entries) {
    totals.goals           += s.goals?.total        ?? 0
    totals.assists         += s.goals?.assists      ?? 0
    totals.matches         += s.games?.appearences  ?? 0
    totals.minutes         += s.games?.minutes      ?? 0
    totals.dribbles        += s.dribbles?.success   ?? 0
    totals.shots_on_target += s.shots?.on           ?? 0
    totals.yellow_cards    += s.cards?.yellow       ?? 0
    totals.red_cards       += s.cards?.red          ?? 0

    const r = parseFloat(s.games?.rating ?? '0') || 0
    if (r > 0) { totals.rating += r; ratingCount++ }

    const acc = parseFloat((s.passes?.accuracy ?? '0').toString().replace('%', '')) || 0
    if (acc > 0) totals.pass_accuracy += acc

    duelsTotal += s.duels?.total ?? 0
    duelsWon   += s.duels?.won   ?? 0
  }

  if (ratingCount > 0)    totals.rating       = Math.round((totals.rating / ratingCount) * 10) / 10
  if (entries.length > 0) totals.pass_accuracy = Math.round(totals.pass_accuracy / entries.length)
  if (duelsTotal > 0)     totals.duels_won    = Math.round((duelsWon / duelsTotal) * 100)

  return totals
}

export async function GET(
  req: NextRequest,
  { params }: { params: Promise<{ slug: string }> },
) {
  const { slug } = await params
  const sp = req.nextUrl.searchParams

  const leagueKey = sp.get('league_key') ?? null   // "276" ou "name:ligue 1"
  const teamKey   = sp.get('team_key')   ?? null   // "33"  ou "name:psg"
  const season    = sp.get('season')     ? parseInt(sp.get('season')!, 10) : null

  const { data: playerRow } = await supabaseAdmin
    .from('dn_players').select('id').eq('slug', slug).single()
  const afId = playerRow?.id ?? null
  if (!afId) return NextResponse.json({ error: 'Invalid slug' }, { status: 400 })

  const currentSeason = await getCurrentSeason()
  const targetSeason  = season ?? currentSeason

  const cacheKey = `player:stats:${afId}:${targetSeason}:${leagueKey ?? 'all'}:${teamKey ?? 'all'}`

  const result = await cached(
    cacheKey,
    async () => {
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      let statsArray: any[] = []

      if (targetSeason === currentSeason) {
        // Use stored dn_players data (no API call)
        const { data } = await supabaseAdmin
          .from('dn_players')
          .select('statistics')
          .eq('id', afId)
          .single()

        statsArray = (data?.statistics ?? []) as any[]
      } else {
        // Past season → call API-Football
        const { afFetch } = await import('@/lib/apifootball')
        const res = await afFetch('/players', { id: afId, season: targetSeason })
        statsArray = res?.response?.[0]?.statistics ?? []
      }

      // Helpers pour matcher par id ou par nom selon la clé
      function matchKey(key: string, id: number | null | undefined, name: string | null | undefined): boolean {
        if (key.startsWith('name:')) return (name ?? '').toLowerCase().trim() === key.slice(5)
        return id != null && String(id) === key
      }

      // Filter by league and/or team
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      let filtered: any[] = statsArray
      if (leagueKey) filtered = filtered.filter((s: any) => matchKey(leagueKey, s.league?.id, s.league?.name))
      if (teamKey)   filtered = filtered.filter((s: any) => matchKey(teamKey,   s.team?.id,   s.team?.name))

      if (filtered.length === 0) return null

      return mergeStats(filtered, targetSeason)
    },
    TTL.stats,
  )

  if (!result) return NextResponse.json({ error: 'No stats found' }, { status: 404 })
  return NextResponse.json(result)
}
