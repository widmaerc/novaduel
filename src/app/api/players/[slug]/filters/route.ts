import { NextRequest, NextResponse } from 'next/server'
import { supabaseAdmin } from '@/lib/supabase'
import { getCurrentSeason } from '@/lib/season'
import { afFetch } from '@/lib/apifootball'
import { cached, TTL } from '@/lib/redis'

interface FilterOption { id: number | null; key: string; name: string; logo: string | null }

// Clé unique pour une ligue ou une équipe : id si disponible, sinon nom normalisé
function optionKey(id: number | null | undefined, name: string | null | undefined): string {
  return id != null ? String(id) : `name:${(name ?? '').toLowerCase().trim()}`
}

// eslint-disable-next-line @typescript-eslint/no-explicit-any
function extractFilters(statistics: any[]) {
  const leagueMap  = new Map<string, FilterOption>()
  // leagueKey → teams[]
  const leagueTeams = new Map<string, Map<string, FilterOption>>()

  for (const s of statistics) {
    const lg = s.league
    const tm = s.team
    if (!lg?.id && !lg?.name) continue   // rien d'exploitable

    const lgKey = optionKey(lg.id, lg.name)
    const tmValid = tm?.id != null || !!tm?.name
    const tmKey   = tmValid ? optionKey(tm.id, tm.name) : null

    if (!leagueMap.has(lgKey)) {
      leagueMap.set(lgKey, { id: lg.id ?? null, key: lgKey, name: lg.name ?? '', logo: lg.logo ?? null })
      leagueTeams.set(lgKey, new Map())
    }
    if (tmValid && tmKey) {
      leagueTeams.get(lgKey)!.set(tmKey, { id: tm.id ?? null, key: tmKey, name: tm.name ?? '', logo: tm.logo ?? null })
    }
  }

  // All unique teams (union across all leagues)
  const allTeams = new Map<string, FilterOption>()
  for (const [, tms] of leagueTeams) {
    for (const [k, tm] of tms) allTeams.set(k, tm)
  }

  return {
    leagues:     Array.from(leagueMap.values()),
    teams:       Array.from(allTeams.values()),
    leagueTeams: Object.fromEntries(
      Array.from(leagueTeams.entries()).map(([lgKey, tms]) => [lgKey, Array.from(tms.values())])
    ) as Record<string, FilterOption[]>,
  }
}

export async function GET(
  req: NextRequest,
  { params }: { params: Promise<{ slug: string }> },
) {
  const { slug } = await params
  const seasonParam = req.nextUrl.searchParams.get('season')

  const { data: playerRow } = await supabaseAdmin
    .from('dn_players').select('id').eq('slug', slug).single()
  const afId = playerRow?.id ?? null
  if (!afId) return NextResponse.json({ leagues: [], teams: [], leagueTeams: {}, seasons: [] })

  const currentSeason = await getCurrentSeason()
  const targetSeason  = seasonParam ? parseInt(seasonParam, 10) : currentSeason

  // Saisons disponibles — cached indépendamment (change rarement)
  const seasons = await cached(
    `player:seasons:${afId}`,
    async () => {
      const raw = await afFetch('/players/seasons', { player: afId })
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      const years: number[] = (raw?.response ?? [currentSeason]) as number[]
      return years
        .sort((a, b) => b - a)
        .map(y => ({ year: y, label: `${y}/${y + 1}`, isStored: y === currentSeason }))
    },
    TTL.stats,
  )

  // Ligues + équipes pour la saison demandée
  const filtersForSeason = await cached(
    `player:filters:${afId}:${targetSeason}`,
    async () => {
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      let statistics: any[] = []

      if (targetSeason === currentSeason) {
        // Saison stockée → dn_players, 0 appel API
        const { data } = await supabaseAdmin
          .from('dn_players')
          .select('statistics')
          .eq('id', afId)
          .single()
        statistics = (data?.statistics ?? []) as any[]
      } else {
        // Saison passée → API
        const res = await afFetch('/players', { id: afId, season: targetSeason })
        statistics = res?.response?.[0]?.statistics ?? []
        // Si l'API ne retourne rien, ne pas mettre en cache (plan ou saison indispo)
        if (!statistics.length) return null
      }

      return extractFilters(statistics)
    },
    TTL.stats,
  )

  const base = filtersForSeason ?? { leagues: [], teams: [], leagueTeams: {} }
  return NextResponse.json({ ...base, seasons, unavailable: !filtersForSeason })
}
