// SPORTMONKS DISABLED — remplacé par API-Football (apifootball.ts)
/*
// Sportmonks Football API v3 — SERVER-SIDE ONLY
// Never import this file in client components.
import { cached, TTL } from './redis';
import {
  PLAYERS_ALL, PLAYER_BY_ID, PLAYERS_BY_IDS, PLAYERS_SEARCH,
  LEAGUES_ALL,
  SEASONS_ALL,
  LIVESCORES_INPLAY, LIVESCORES_LATEST,
  FIXTURES_ALL, FIXTURE_BY_ID, FIXTURES_BY_PLAYER,
  TOPSCORERS_BY_SEASON, TOPSCORE_FILTER_GOALS, TOPSCORE_FILTER_ASSISTS,
  resolve,
} from './endpoints';

const BASE = 'https://api.sportmonks.com/v3/football';
const TOKEN = process.env.SPORTMONKS_API_KEY!;

// Generic API caller with silent fail for 404s
// eslint-disable-next-line @typescript-eslint/no-explicit-any
async function smRaw(path: string, params: Record<string, string> = {}): Promise<{ data: any, pagination?: any } | null> {
  const url = new URL(`${BASE}${path}`);
  url.searchParams.set('api_token', TOKEN);
  Object.entries(params).forEach(([k, v]) => url.searchParams.set(k, v));

  const res = await fetch(url.toString(), { next: { revalidate: 3600 } });

  // If free plan restricts access or throws 404, return null gracefully instead of crashing
  if (!res.ok) {
    if (res.status === 404 || res.status === 403) return null;
    console.error(`Sportmonks ${res.status}: ${path}`);
    return null;
  }

  return res.json();
}

async function sm<T>(path: string, params: Record<string, string> = {}): Promise<T | null> {
  const json = await smRaw(path, params);
  return json ? (json.data as T) : null;
}

// ─── Global Stats ────────────────────────────────────────────────────────────

// To get the total number of players available on your plan
export async function getGlobalPlayersCount(): Promise<number> {
  return cached(
    'global:players:count',
    async () => {
      const res = await smRaw(PLAYERS_ALL, { per_page: '1' });
      return res?.pagination?.count || 0;
    },
    TTL.player
  );
}

export async function getGlobalLeaguesCount(): Promise<number> {
  return cached(
    'global:leagues:count',
    async () => {
      const res = await smRaw(LEAGUES_ALL, { per_page: '1' });
      return res?.pagination?.count || 0;
    },
    TTL.stats
  );
}

export async function getLeagues() {
  return cached(
    'leagues',
    () => sm(LEAGUES_ALL),
    TTL.stats
  );
}

export async function getSeasons(currentOnly = false) {
  const cacheKey = currentOnly ? 'seasons:current:v2' : 'seasons:all:v3';
  return cached(
    cacheKey,
    async () => {
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      const all: any[] = [];
      let page = 1;
      let hasMore = true;
      const params: Record<string, string> = { per_page: '150', page: '1' };
      if (currentOnly) params.is_current = '1';
      while (hasMore && page <= 20) {
        const res = await smRaw(SEASONS_ALL, { ...params, page: String(page) });
        if (!res || !Array.isArray(res.data)) break;
        all.push(...res.data);
        hasMore = !!res.pagination?.has_more;
        page++;
      }
      // Sportmonks ignore is_current=1 sur certains plans — filtre sur le champ is_current
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      return currentOnly ? all.filter((s: any) => s.is_current === true) : all;
    },
    TTL.stats
  );
}

// ─── Livescores ───────────────────────────────────────────────────────────────

export async function getLiveScores() {
  return cached(
    'livescores:inplay',
    () => sm(LIVESCORES_INPLAY, { include: 'scores;periods;league' }),
    TTL.livescores
  );
}

// No Redis cache — /latest must always be fresh (only returns changes in last 10s)
export async function getLiveScoresLatest() {
  return sm(LIVESCORES_LATEST, { include: 'scores;periods;league' });
}

// ─── Featured Duels & Scorer Trends ─────────────────────────────────────────

export async function getTrendingFixtures() {
  return cached(
    'fixtures:trending',
    () => sm(FIXTURES_ALL, { include: 'participants' }),
    TTL.stats
  );
}

export async function getFixture(id: number) {
  return cached(
    `fixture:${id}`,
    () => sm(resolve(FIXTURE_BY_ID, { id }), { include: 'participants;statistics;state;scores;league' }),
    TTL.stats
  );
}

export async function getTopScorers(seasonId: number) {
  return cached(
    `topscorers:${seasonId}`,
    () => sm(resolve(TOPSCORERS_BY_SEASON, { seasonId }), { include: 'player;team' }),
    TTL.stats
  );
}

export interface CurrentSeason {
  id:           number;
  name:         string;
  league_id:    number;
  starting_at:  string;
  ending_at:    string;
  finished:     boolean;
  pending:      boolean;
  is_current:   boolean;
  games_in_current_week: boolean;
}

// Gets all current seasons, sorted desc by ID (most recent first)
export async function getCurrentSeasons(): Promise<CurrentSeason[]> {
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const data = await getSeasons(true) as any[] | null;
  if (!Array.isArray(data)) return [];
  return (data as CurrentSeason[])
    .filter(s => s.id > 0)
    .sort((a, b) => b.id - a.id);
}

// Returns top scorers and top assisters for the first accessible current season
export async function getTopPlayersCurrentSeason() {
  return cached(
    'topplayers:current:v21',
    async () => {
      const seasons = await getCurrentSeasons();

      type StatGroup = { entries: any[]; season: CurrentSeason; meta: { label: string; unit: string } };
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      let bestScorers:   StatGroup | null = null;
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      let bestAssisters: StatGroup | null = null;

      for (const season of seasons) {
        if (bestScorers && bestAssisters) break; // both found, stop early

        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        // Free plan limits per_page to 25 — paginate until we have 2+ type_ids or no more pages
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        const raw: any[] = [];
        let page = 1;
        let hasMore = true;
        while (hasMore && page <= 5) {
          const res = await smRaw(resolve(TOPSCORERS_BY_SEASON, { seasonId: season.id }), {
            include: 'player;participant', per_page: '25', page: String(page),
          });
          if (!res || !Array.isArray(res.data)) break;
          raw.push(...res.data);
          hasMore = !!res.pagination?.has_more;
          // eslint-disable-next-line @typescript-eslint/no-explicit-any
          const typeIds = new Set(raw.map((e: any) => e.type_id));
          if (typeIds.has(52) && typeIds.has(79)) break; // goals + assists found
          page++;
        }
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        const allTypeIds = [...new Set(raw.map((e: any) => e.type_id))];
        console.log('[topscorers] season', season.id, '| pages:', page, '| type_ids:', allTypeIds);
        if (raw.length === 0) continue;

        // Group by type_id, sort each group by position asc
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        const groups = new Map<number, any[]>();
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        for (const e of raw) {
          const b = groups.get(e.type_id) ?? [];
          b.push(e);
          groups.set(e.type_id, b);
        }
        // Known type_ids (confirmed via /core/types)
        const TYPE_NAMES: Record<number, { label: string; unit: string }> = {
          52:  { label: 'Top Scorers',   unit: 'buts'   },
          79:  { label: 'Top Passeurs',  unit: 'passes' },
          83:  { label: 'Cartons rouges', unit: 'CR'   },
          84:  { label: 'Cartons jaunes', unit: 'CJ'   },
          86:  { label: 'Tirs cadrés',    unit: 'tirs' },
        };

        // Pick the two type_ids with the most entries, prefer known ones
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        const rankedGroups = [...groups.entries()]
          .map(([typeId, entries]) => ({
            typeId,
            meta: TYPE_NAMES[typeId] ?? { label: `Stat #${typeId}`, unit: '' },
            // eslint-disable-next-line @typescript-eslint/no-explicit-any
            entries: entries.sort((a: any, b: any) => a.position - b.position).slice(0, 5),
          }))
          .sort((a, b) => b.entries.length - a.entries.length);

        if (!bestScorers   && rankedGroups[0]?.entries.length) bestScorers   = { entries: rankedGroups[0].entries, meta: rankedGroups[0].meta, season };
        if (!bestAssisters && rankedGroups[1]?.entries.length) bestAssisters = { entries: rankedGroups[1].entries, meta: rankedGroups[1].meta, season };
      }

      if (!bestScorers) return null;

      return {
        seasonId:         bestScorers.season.id,
        seasonName:       bestScorers.season.name,
        assistSeasonName: bestAssisters?.season.name ?? '',
        scorers:          bestScorers.entries,
        assisters:        bestAssisters?.entries ?? [],
        scorersLabel:     bestScorers.meta.label,
        scorersUnit:      bestScorers.meta.unit,
        assistersLabel:   bestAssisters?.meta.label ?? '',
        assistersUnit:    bestAssisters?.meta.unit ?? '',
      };
    },
    TTL.stats
  );
}

// ─── Top scorers current season (optionally filtered by league) ──────────────

export async function getTopScorersCurrentSeason(leagueId?: number, type: 'goals' | 'assists' = 'goals') {
  const cacheKey = `topscorers:current:${type}:${leagueId ?? 'all'}:v1`;
  const filter = type === 'assists' ? TOPSCORE_FILTER_ASSISTS : TOPSCORE_FILTER_GOALS;

  return cached(
    cacheKey,
    async () => {
      const allSeasons = await getCurrentSeasons();
      const seasons = leagueId
        ? allSeasons.filter(s => s.league_id === leagueId)
        : allSeasons;

      const results = await Promise.all(
        seasons.map(async season => {
          const res = await smRaw(resolve(TOPSCORERS_BY_SEASON, { seasonId: season.id }), {
            include: 'player;participant;type',
            filters: filter,
            per_page: '10',
          });
          // eslint-disable-next-line @typescript-eslint/no-explicit-any
          const scorers: any[] = Array.isArray(res?.data) ? res!.data : [];
          return { season, scorers };
        })
      );

      return results.filter(r => r.scorers.length > 0);
    },
    TTL.stats
  );
}

// ─── Player profile ──────────────────────────────────────────────────────────

export async function searchPlayers(query: string) {
  return cached(
    `search:players:${query}`,
    () => sm(resolve(PLAYERS_SEARCH, { name: encodeURIComponent(query) }), {
      include: 'teams;nationality',
    }),
    TTL.player
  );
}

export async function getPlayer(playerId: number) {
  return cached(
    `player:${playerId}`,
    () => sm(resolve(PLAYER_BY_ID, { id: playerId }), {
      include: 'teams;country;statistics.season;statistics.details;position',
    }),
    TTL.player
  );
}

export async function getPlayersMulti(playerIds: number[]) {
  return cached(
    `players:multi:${playerIds.join()}`,
    () => sm(resolve(PLAYERS_BY_IDS, { ids: playerIds.join(',') }), {
      include: 'teams;country;statistics.details;statistics.season;position',
    }),
    TTL.player
  );
}

export async function getPlayerRecentFixtures(playerId: number) {
  return cached(
    `player:${playerId}:fixtures`,
    () => sm(resolve(FIXTURES_BY_PLAYER, { playerId }), { include: 'league' }),
    TTL.stats
  );
}
*/
