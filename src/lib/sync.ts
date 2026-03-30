/**
 * sync.ts — Synchronisation Sportmonks → Supabase
 *
 * Stratégie :
 *  1. Récupère toutes les ligues + saison courante
 *  2. Pour chaque saison : topscorers → IDs de joueurs pertinents
 *  3. Batch-fetch profils complets (25/req)
 *  4. Upsert dans Supabase (clé : sportmonks_id)
 */
import { supabaseAdmin } from './supabase'
import { generatePlayerInsight } from './claude'

const BASE      = 'https://api.sportmonks.com/v3/football'
const TOKEN     = process.env.SPORTMONKS_API_KEY!

// ── Helpers ──────────────────────────────────────────────────────────────────

// eslint-disable-next-line @typescript-eslint/no-explicit-any
async function smFetch(path: string, params: Record<string, string> = {}): Promise<any> {
  const url = new URL(`${BASE}${path}`)
  url.searchParams.set('api_token', TOKEN)
  Object.entries(params).forEach(([k, v]) => url.searchParams.set(k, v))
  const res = await fetch(url.toString(), { cache: 'no-store' })
  if (!res.ok) return null
  return res.json()
}

function slugify(name: string): string {
  return (name ?? '')
    .toLowerCase()
    .normalize('NFD').replace(/[\u0300-\u036f]/g, '')
    .replace(/\s+/g, '-')
    .replace(/[^a-z0-9-]/g, '')
    .replace(/-+/g, '-')
    .replace(/^-|-$/g, '')
}

function initials(name: string): string {
  return (name ?? '').split(' ').map(w => w[0] ?? '').join('').slice(0, 2).toUpperCase() || '??'
}

function calcAge(dob: string): number {
  if (!dob) return 0
  return Math.floor((Date.now() - new Date(dob).getTime()) / (1000 * 60 * 60 * 24 * 365.25))
}

// eslint-disable-next-line @typescript-eslint/no-explicit-any
function getDetail(details: any[], typeId: number, field = 'total'): number {
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const d = details.find((x: any) => x.type_id === typeId)
  return parseFloat(d?.value?.[field] ?? d?.value?.total ?? 0) || 0
}

// eslint-disable-next-line @typescript-eslint/no-explicit-any
function mapPlayer(p: any, leagueName: string, leagueSlug: string, seasonName: string) {
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const stats   = (p.statistics ?? []).sort((a: any, b: any) => (b.season_id ?? 0) - (a.season_id ?? 0))[0]
  const details = stats?.details ?? []
  const pos     = p.position?.code ?? 'MIL'

  // ── Trophies — stocke les IDs (noms non disponibles sur free plan) ─────────
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const trophies_json = (p.trophies ?? []).map((tr: any) => ({
    league_id: tr.league_id ?? null,
    season_id: tr.season_id ?? null,
    trophy_id: tr.trophy_id ?? null,
    team_id:   tr.team_id ?? null,
  }))

  // ── Transfers ──────────────────────────────────────────────────────────────
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const transfers_json = (p.transfers ?? []).map((tr: any) => ({
    from_team_id: tr.from_team_id ?? null,
    to_team_id:   tr.to_team_id   ?? null,
    date:         tr.date ?? '',
    amount:       tr.amount ?? null,       // en euros
    type_id:      tr.type_id ?? null,      // 218=prêt, 219=permanent
    completed:    tr.completed ?? false,
  }))

  // ── Detailed position ──────────────────────────────────────────────────────
  const detailed_position = p.detailedPosition?.name ?? p.detailed_position?.name ?? ''

  // ── Recent form — non disponible sans fetcher les fixtures séparément ──────
  // `latest` retourne des entrées de lineup (fixture_id seulement), pas les scores
  const recent_form = ''

  return {
    slug:              p.slug ?? slugify(p.name ?? ''),
    name:              p.name ?? '',
    common_name:       p.display_name ?? p.common_name ?? p.name ?? '',
    team:              p.teams?.[0]?.name ?? '',
    team_logo_url:     p.teams?.[0]?.image_path ?? '',
    league:            leagueName,
    league_slug:       leagueSlug,
    nationality:       p.nationality?.name ?? p.country?.name ?? '',
    flag_url:          p.nationality?.image_path ?? p.country?.image_path ?? '',
    flag_emoji:        '',
    position:          (['ATT','MIL','DEF','GK'].includes(pos) ? pos : 'MIL') as 'ATT'|'MIL'|'DEF'|'GK',
    position_name:     p.position?.name ?? '',
    detailed_position,
    age:               calcAge(p.date_of_birth ?? ''),
    date_of_birth:     p.date_of_birth ?? '',
    height:            p.height ?? 0,
    weight:            p.weight ?? 0,
    preferred_foot:    p.preferred_foot ?? '',
    shirt_number:      p.shirt_number ?? p.jersey_number ?? 0,
    market_value:      '',
    image_url:         p.image_path ?? '',
    sportmonks_id:     p.id,
    season:            stats?.season?.name ?? seasonName,
    // Stats
    goals:             getDetail(details, 52) || getDetail(details, 54),
    assists:           getDetail(details, 79) || getDetail(details, 80),
    matches:           getDetail(details, 321) || getDetail(details, 119),
    minutes:           getDetail(details, 116),
    pass_accuracy:     getDetail(details, 80, 'average'),
    dribbles:          getDetail(details, 78, 'average'),
    duels_won:         getDetail(details, 294, 'average'),
    shots_on_target:   getDetail(details, 86),
    yellow_cards:      getDetail(details, 84),
    red_cards:         getDetail(details, 83),
    rating:            getDetail(details, 118, 'average'),
    xg:                getDetail(details, 117),
    recent_form,
    // Enrichissement
    trophies_json:     trophies_json.length > 0 ? trophies_json : null,
    transfers_json:    transfers_json.length > 0 ? transfers_json : null,
    initials:          initials(p.common_name ?? p.name ?? ''),
    avatar_bg:         'rgba(0,71,130,.12)',
    avatar_color:      '#004782',
    is_featured:       false,
    ai_insight:        null as string | null,
  }
}

// ── AI Insight ────────────────────────────────────────────────────────────────
// ── Rate-limit safe delay ─────────────────────────────────────────────────────
const sleep = (ms: number) => new Promise(r => setTimeout(r, ms))

// ── Main sync ─────────────────────────────────────────────────────────────────
export interface SyncResult {
  synced:  number
  updated: number
  errors:  number
  skipped: number
  leagues: number
  seasons: number
  players: number
}

export async function syncPlayers(): Promise<SyncResult> {
  const result: SyncResult = { synced: 0, updated: 0, errors: 0, skipped: 0, leagues: 0, seasons: 0, players: 0 }

  // ── 1. Toutes les ligues + saison courante ──────────────────────────────────
  console.log('[sync] Fetching leagues…')
  let page = 1
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const allLeagues: any[] = []

  while (true) {
    const res = await smFetch('/leagues', { include: 'currentSeason', per_page: '50', page: String(page) })
    if (!res?.data?.length) break
    allLeagues.push(...res.data)
    if (!res.pagination?.has_more) break
    page++
    await sleep(250)
  }

  result.leagues = allLeagues.length
  console.log(`[sync] ${allLeagues.length} leagues`)

  // Deduplicate seasons, keep league info per season
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const seasonMap = new Map<number, { name: string; league: string; leagueSlug: string }>()

  for (const league of allLeagues) {
    const s = league.currentseason
    if (!s?.id) continue
    if (!seasonMap.has(s.id)) {
      seasonMap.set(s.id, {
        name:        s.name ?? '',
        league:      league.name ?? '',
        leagueSlug:  slugify(league.short_code ?? league.name ?? ''),
      })
    }
  }

  result.seasons = seasonMap.size
  console.log(`[sync] ${seasonMap.size} unique seasons`)

  // ── 2. Teams par saison → squads → collecter tous les joueurs ───────────────
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const playerMap = new Map<number, { raw: any; seasonId: number }>()

  for (const [seasonId, info] of seasonMap) {
    try {
      // 2a. Teams de la saison
      let teamPage = 1
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      const teams: any[] = []
      while (true) {
        const res = await smFetch(`/teams/seasons/${seasonId}`, { per_page: '50', page: String(teamPage) })
        if (!res?.data?.length) break
        teams.push(...res.data)
        if (!res.pagination?.has_more) break
        teamPage++
        await sleep(250)
      }
      console.log(`[sync] season ${seasonId} (${info.league}): ${teams.length} teams`)

      // 2b. Squad de chaque team
      for (const team of teams) {
        try {
          const res = await smFetch(`/squads/teams/${team.id}`, { include: 'player' })
          if (!res?.data) { await sleep(200); continue }
          // eslint-disable-next-line @typescript-eslint/no-explicit-any
          for (const entry of (res.data ?? [])) {
            const p = entry.player ?? entry
            if (!p?.id || playerMap.has(p.id)) continue
            p._team = team
            playerMap.set(p.id, { raw: p, seasonId })
          }
          await sleep(300)
        } catch (e) {
          console.warn(`[sync] squad team ${team.id}:`, e)
        }
      }
    } catch (e) {
      console.warn(`[sync] teams season ${seasonId}:`, e)
    }
  }

  result.players = playerMap.size
  console.log(`[sync] ${playerMap.size} unique players to sync`)

  if (playerMap.size === 0) {
    console.warn('[sync] No players found — check Sportmonks plan access')
    return result
  }

  // ── 3. Charger les stats actuelles en BD (pour détecter les changements) ──
  const { data: existingRows } = await supabaseAdmin
    .from('players')
    .select('sportmonks_id, goals, assists, matches, rating, ai_insight')

  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const existingMap = new Map<number, any>(
    (existingRows ?? []).map(r => [r.sportmonks_id, r])
  )

  // ── 4. Fetch profils Sportmonks par lots de 5 (parallel) ──────────────────
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const rows: any[] = []
  const entries = [...playerMap.entries()]
  const BATCH = 5
  const DELAY = 400

  for (let i = 0; i < entries.length; i += BATCH) {
    const chunk = entries.slice(i, i + BATCH)

    const fetched = await Promise.all(
      chunk.map(async ([playerId, { raw: partialPlayer, seasonId }]) => {
        try {
          const res = await smFetch(`/players/${playerId}`, {
            include: 'teams;statistics.details;statistics.season;position;detailedPosition;nationality;trophies;transfers;latest',
          })
          // eslint-disable-next-line @typescript-eslint/no-explicit-any
          const p: any = res?.data ?? partialPlayer
          const info = seasonMap.get(seasonId) ?? { name: '2024-25', league: '', leagueSlug: '' }
          if (!res?.data && p._team) p.teams = [p._team]

          const row = mapPlayer(p, info.league, info.leagueSlug, info.name)
          const existing = existingMap.get(playerId)

          // Détecter si les stats ont changé
          const statsChanged = !existing
            || existing.goals   !== row.goals
            || existing.assists !== row.assists
            || existing.matches !== row.matches
            || existing.rating  !== row.rating

          // Générer l'insight IA uniquement si changé ou jamais généré
          if (statsChanged || !existing?.ai_insight) {
            row.ai_insight = await generatePlayerInsight(row as any)
            console.log(`[sync] AI insight generated for ${row.name}`)
          } else {
            row.ai_insight = existing.ai_insight
          }

          return row
        } catch (e) {
          console.error(`[sync] player ${playerId}:`, e)
          result.errors++
          return null
        }
      })
    )

    rows.push(...fetched.filter(Boolean))
    console.log(`[sync] fetched ${Math.min(i + BATCH, entries.length)}/${entries.length}`)
    await sleep(DELAY)
  }

  // ── 5. Upsert en un seul appel par lot de 100 ─────────────────────────────
  const UPSERT_CHUNK = 100
  const changedPlayerIds: number[] = []

  for (let i = 0; i < rows.length; i += UPSERT_CHUNK) {
    const chunk = rows.slice(i, i + UPSERT_CHUNK)
    const { data: upserted, error } = await supabaseAdmin
      .from('players')
      .upsert(chunk, { onConflict: 'sportmonks_id' })
      .select('id, sportmonks_id')
    if (error) {
      console.error('[sync] upsert batch error:', error.message)
      result.errors += chunk.length
    } else {
      result.synced += chunk.length
      // Collecter les IDs des joueurs dont les stats ont changé
      for (const row of chunk) {
        const existing = existingMap.get(row.sportmonks_id)
        if (!existing
          || existing.goals   !== row.goals
          || existing.assists !== row.assists
          || existing.matches !== row.matches
          || existing.rating  !== row.rating) {
          const saved = (upserted ?? []).find((u: any) => u.sportmonks_id === row.sportmonks_id)
          if (saved?.id) changedPlayerIds.push(saved.id)
        }
      }
    }
  }

  // ── 6. Invalider les insights des comparaisons affectées ──────────────────
  if (changedPlayerIds.length > 0) {
    console.log(`[sync] Invalidating insights for ${changedPlayerIds.length} changed players`)
    const { error } = await supabaseAdmin
      .from('comparisons')
      .update({ insight_fr: null, insight_en: null, insight_es: null, updated_at: new Date().toISOString() })
      .or(
        changedPlayerIds.map(id => `player_a_id.eq.${id},player_b_id.eq.${id}`).join(',')
      )
    if (error) console.error('[sync] insight invalidation error:', error.message)
    else console.log('[sync] Insights invalidated — will regenerate on next visit')
  }

  console.log('[sync] Done:', result)
  return result
}
