/**
 * API-Football v3 — CLIENT HTTP — SERVER-SIDE ONLY
 * Never import this file in client components.
 *
 * Base URL : https://v3.football.api-sports.io
 * Auth     : header x-apisports-key
 */
import { cached, TTL } from './redis';
import * as EP from './endpoints-apifootball';

const BASE  = 'https://v3.football.api-sports.io';
const TOKEN = process.env.API_FOOTBALL_KEY!;

// ─── Caller de base ───────────────────────────────────────────────────────────

type Params = Record<string, string | number | boolean>;

// eslint-disable-next-line @typescript-eslint/no-explicit-any
async function afRaw(path: string, params: Params = {}): Promise<{ response: any[]; results: number; paging?: { current: number; total: number } } | null> {
  const url = new URL(`${BASE}${path}`);
  Object.entries(params).forEach(([k, v]) => url.searchParams.set(k, String(v)));

  const res = await fetch(url.toString(), {
    headers: { 'x-apisports-key': TOKEN },
    next: { revalidate: 3600 },
  });

  if (!res.ok) {
    if (res.status === 404 || res.status === 403) return null;
    console.error(`API-Football ${res.status}: ${path}`);
    return null;
  }

  const json = await res.json();

  // API-Football envoie les erreurs dans le corps avec status 200
  if (json.errors && Object.keys(json.errors).length > 0) {
    console.error(`API-Football error on ${path}:`, json.errors);
    return null;
  }

  return json;
}

// Exporté pour les routes API qui ont besoin d'un accès direct (ex: stats par saison)
export async function afFetch(path: string, params: Params = {}) {
  return afRaw(path, params);
}

// Retourne directement response[] ou null
async function af<T>(path: string, params: Params = {}): Promise<T[] | null> {
  const json = await afRaw(path, params);
  return json ? (json.response as T[]) : null;
}

// Retourne le premier élément de response ou null
async function afOne<T>(path: string, params: Params = {}): Promise<T | null> {
  const data = await af<T>(path, params);
  return data && data.length > 0 ? data[0] : null;
}

// ─── Timezone ─────────────────────────────────────────────────────────────────

export async function getTimezones(): Promise<string[]> {
  return cached(
    'af:timezones',
    async () => {
      const data = await af<string>(EP.TIMEZONE);
      return data ?? [];
    },
    TTL.timezones  // ~30 days — timezone list never changes
  );
}

// ─── Pays ─────────────────────────────────────────────────────────────────────

export async function getCountries(params: { name?: string; code?: string; search?: string } = {}) {
  return cached(
    `af:countries:${JSON.stringify(params)}`,
    () => af(EP.COUNTRIES, params),
    TTL.stats
  );
}

// ─── Ligues ───────────────────────────────────────────────────────────────────

export async function getLeagues(params: {
  id?: number; name?: string; country?: string; code?: string;
  season?: number; team?: number; type?: string; current?: string;
  search?: string; last?: number;
} = {}) {
  const cacheKey = Object.keys(params).length === 0 ? 'af:leagues:all' : `af:leagues:${JSON.stringify(params)}`;
  return cached(
    cacheKey,
    () => af(EP.LEAGUES, params),
    TTL.leagues  // 24h — reference data per API-Football doc recommendation
  );
}

export async function getLeagueSeasons() {
  return cached(
    'af:leagues:seasons',
    () => af<number>(EP.LEAGUES_SEASONS),
    TTL.stats
  );
}

// ─── Équipes ──────────────────────────────────────────────────────────────────

export async function getTeams(params: {
  id?: number; name?: string; league?: number; season?: number;
  country?: string; code?: string; venue?: number; search?: string;
} = {}) {
  return cached(
    `af:teams:${JSON.stringify(params)}`,
    () => af(EP.TEAMS, params),
    TTL.stats
  );
}

export async function getTeamStatistics(league: number, season: number, team: number, date?: string) {
  return cached(
    `af:teams:stats:${league}:${season}:${team}`,
    () => afOne(EP.TEAMS_STATISTICS, { league, season, team, ...(date ? { date } : {}) }),
    TTL.stats
  );
}

export async function getTeamSeasons(teamId: number) {
  return cached(
    `af:teams:seasons:${teamId}`,
    () => af<number>(EP.TEAMS_SEASONS, { team: teamId }),
    TTL.stats
  );
}

export async function getTeamCountries() {
  return cached(
    'af:teams:countries',
    () => af(EP.TEAMS_COUNTRIES),
    TTL.stats
  );
}

// ─── Stades ───────────────────────────────────────────────────────────────────

export async function getVenues(params: { id?: number; name?: string; city?: string; country?: string; search?: string } = {}) {
  return cached(
    `af:venues:${JSON.stringify(params)}`,
    () => af(EP.VENUES, params),
    TTL.stats
  );
}

// ─── Classements ─────────────────────────────────────────────────────────────

export async function getStandings(season: number, league?: number, team?: number) {
  return cached(
    `af:standings:${season}:${league ?? 'all'}:${team ?? 'all'}`,
    () => af(EP.STANDINGS, { season, ...(league ? { league } : {}), ...(team ? { team } : {}) }),
    TTL.stats
  );
}

// ─── Fixtures ─────────────────────────────────────────────────────────────────

export async function getFixtureRounds(league: number, season: number, current?: boolean) {
  return cached(
    `af:fixtures:rounds:${league}:${season}:${current ?? false}`,
    () => af<string>(EP.FIXTURES_ROUNDS, { league, season, ...(current !== undefined ? { current } : {}) }),
    TTL.stats
  );
}

export async function getFixtures(params: {
  id?: number; ids?: string; live?: string; date?: string;
  league?: number; season?: number; team?: number;
  last?: number; next?: number; from?: string; to?: string;
  round?: string; status?: string; venue?: number; timezone?: string;
}) {
  return cached(
    `af:fixtures:${JSON.stringify(params)}`,
    () => af(EP.FIXTURES, params),
    TTL.livescores
  );
}

// Scores en direct (live="all" ou liste de league ids séparés par "-")
export async function getLiveScores(leagueIds?: number[]) {
  const live = leagueIds?.length ? leagueIds.join('-') : 'all';
  return cached(
    `af:livescores:${live}`,
    () => af(EP.FIXTURES, { live }),
    TTL.livescores
  );
}

export async function getFixtureH2H(team1: number, team2: number, params: {
  date?: string; league?: number; season?: number;
  last?: number; next?: number; from?: string; to?: string;
  status?: string; venue?: number; timezone?: string;
} = {}) {
  return cached(
    `af:h2h:${team1}-${team2}:${JSON.stringify(params)}`,
    () => af(EP.FIXTURES_H2H, { h2h: `${team1}-${team2}`, ...params }),
    TTL.stats
  );
}

export async function getFixtureStatistics(fixtureId: number, team?: number) {
  return cached(
    `af:fixture:stats:${fixtureId}:${team ?? 'all'}`,
    () => af(EP.FIXTURES_STATISTICS, { fixture: fixtureId, ...(team ? { team } : {}) }),
    TTL.stats
  );
}

export async function getFixtureEvents(fixtureId: number, params: { team?: number; player?: number; type?: string } = {}) {
  return cached(
    `af:fixture:events:${fixtureId}:${JSON.stringify(params)}`,
    () => af(EP.FIXTURES_EVENTS, { fixture: fixtureId, ...params }),
    TTL.stats
  );
}

export async function getFixtureLineups(fixtureId: number, params: { team?: number; player?: number; type?: string } = {}) {
  return cached(
    `af:fixture:lineups:${fixtureId}:${JSON.stringify(params)}`,
    () => af(EP.FIXTURES_LINEUPS, { fixture: fixtureId, ...params }),
    TTL.stats
  );
}

export async function getFixturePlayers(fixtureId: number, team?: number) {
  return cached(
    `af:fixture:players:${fixtureId}:${team ?? 'all'}`,
    () => af(EP.FIXTURES_PLAYERS, { fixture: fixtureId, ...(team ? { team } : {}) }),
    TTL.stats
  );
}

// ─── Blessures ────────────────────────────────────────────────────────────────

export async function getInjuries(params: {
  fixture?: number; league?: number; season?: number;
  team?: number; player?: number; date?: string; timezone?: string;
} = {}) {
  return cached(
    `af:injuries:${JSON.stringify(params)}`,
    () => af(EP.INJURIES, params),
    TTL.stats
  );
}

// ─── Prédictions ─────────────────────────────────────────────────────────────

export async function getPredictions(fixtureId: number) {
  return cached(
    `af:predictions:${fixtureId}`,
    () => af(EP.PREDICTIONS, { fixture: fixtureId }),
    TTL.stats
  );
}

// ─── Coachs ───────────────────────────────────────────────────────────────────

export async function getCoach(params: { id?: number; team?: number; search?: string } = {}) {
  return cached(
    `af:coach:${JSON.stringify(params)}`,
    () => af(EP.COACHES, params),
    TTL.stats
  );
}

// ─── Joueurs ──────────────────────────────────────────────────────────────────

// Profil sans stats (plus léger)
export async function getPlayerProfile(playerId: number) {
  return cached(
    `af:player:profile:${playerId}`,
    () => afOne(EP.PLAYERS_PROFILES, { player: playerId }),
    TTL.player
  );
}

export async function searchPlayerProfiles(query: string) {
  return cached(
    `af:player:search:${query}`,
    () => af(EP.PLAYERS_PROFILES, { search: query }),
    TTL.player
  );
}

// Profil + stats (requiert season)
export async function getPlayer(playerId: number, season: number) {
  return cached(
    `af:player:${playerId}:${season}`,
    () => afOne(EP.PLAYERS, { id: playerId, season }),
    TTL.player
  );
}

export async function searchPlayers(query: string, league?: number, team?: number) {
  const params: Params = { search: query };
  if (league) params.league = league;
  if (team)   params.team   = team;
  return cached(
    `af:players:search:${query}:${league ?? ''}:${team ?? ''}`,
    () => af(EP.PLAYERS, params),
    TTL.player
  );
}

export async function getPlayersByTeam(teamId: number, season: number) {
  return cached(
    `af:players:team:${teamId}:${season}`,
    async () => {
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      const all: any[] = [];
      let page = 1;
      let totalPages = 1;
      while (page <= totalPages) {
        const json = await afRaw(EP.PLAYERS, { team: teamId, season, page });
        if (!json || !Array.isArray(json.response)) break;
        all.push(...json.response);
        totalPages = json.paging?.total ?? 1;
        if (page >= totalPages) break;
        page++;
      }
      return all;
    },
    TTL.player
  );
}

export async function getPlayerSeasons(playerId: number) {
  return cached(
    `af:player:seasons:${playerId}`,
    () => af<number>(EP.PLAYERS_SEASONS, { player: playerId }),
    TTL.stats
  );
}

export async function getPlayerSquads(params: { team?: number; player?: number }) {
  return cached(
    `af:squads:${JSON.stringify(params)}`,
    () => af(EP.PLAYERS_SQUADS, params),
    TTL.stats
  );
}

export async function getPlayerTeams(playerId: number) {
  return cached(
    `af:player:teams:${playerId}`,
    () => af(EP.PLAYERS_TEAMS, { player: playerId }),
    TTL.stats
  );
}

// ─── Tops (buteurs, passeurs, cartons) ────────────────────────────────────────

export async function getTopScorers(league: number, season: number) {
  return cached(
    `af:topscorers:${league}:${season}`,
    () => af(EP.PLAYERS_TOPSCORERS, { league, season }),
    TTL.topscorers  // 24h
  );
}

export async function getTopAssists(league: number, season: number) {
  return cached(
    `af:topassists:${league}:${season}`,
    () => af(EP.PLAYERS_TOPASSISTS, { league, season }),
    TTL.topscorers  // 24h
  );
}

export async function getTopYellowCards(league: number, season: number) {
  return cached(
    `af:topyellowcards:${league}:${season}`,
    () => af(EP.PLAYERS_TOPYELLOWCARDS, { league, season }),
    TTL.stats
  );
}

export async function getTopRedCards(league: number, season: number) {
  return cached(
    `af:topredcards:${league}:${season}`,
    () => af(EP.PLAYERS_TOPREDCARDS, { league, season }),
    TTL.stats
  );
}

// ─── Transferts / Trophées / Blessés ─────────────────────────────────────────

export async function getTransfers(params: { player?: number; team?: number }) {
  return cached(
    `af:transfers:${JSON.stringify(params)}`,
    () => af(EP.TRANSFERS, params),
    TTL.stats
  );
}

export async function getTrophies(params: { player?: number; coach?: number }) {
  return cached(
    `af:trophies:${JSON.stringify(params)}`,
    () => af(EP.TROPHIES, params),
    TTL.stats
  );
}

export async function getSidelined(params: { player?: number; coach?: number }) {
  return cached(
    `af:sidelined:${JSON.stringify(params)}`,
    () => af(EP.SIDELINED, params),
    TTL.stats
  );
}

// ─── Cotes ────────────────────────────────────────────────────────────────────

export async function getOdds(params: {
  fixture?: number; league?: number; season?: number;
  date?: string; timezone?: string; page?: number;
  bookmaker?: number; bet?: number;
} = {}) {
  return cached(
    `af:odds:${JSON.stringify(params)}`,
    () => af(EP.ODDS, params),
    TTL.stats
  );
}

export async function getOddsBookmakers(params: { id?: number; search?: string } = {}) {
  return cached(
    `af:odds:bookmakers:${JSON.stringify(params)}`,
    () => af(EP.ODDS_BOOKMAKERS, params),
    TTL.stats
  );
}

export async function getOddsBets(params: { id?: number; search?: string } = {}) {
  return cached(
    `af:odds:bets:${JSON.stringify(params)}`,
    () => af(EP.ODDS_BETS, params),
    TTL.stats
  );
}

export async function getOddsLive(params: { fixture?: number; league?: number; bet?: number } = {}) {
  return cached(
    `af:odds:live:${JSON.stringify(params)}`,
    () => af(EP.ODDS_LIVE, params),
    TTL.livescores
  );
}

export async function getOddsLiveBets(params: { id?: number; search?: string } = {}) {
  return cached(
    `af:odds:live:bets:${JSON.stringify(params)}`,
    () => af(EP.ODDS_LIVE_BETS, params),
    TTL.stats
  );
}
