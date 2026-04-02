/**
 * API-Football v3 — Référence complète des endpoints
 * BASE : https://v3.football.api-sports.io  (géré dans apifootball.ts)
 * Auth : header  x-apisports-key: YOUR_API_KEY  (sur toutes les requêtes)
 *
 * Tous les endpoints sont GET.
 * Les paramètres passent en query string — utiliser buildUrl() ou URLSearchParams.
 *
 * Usage :
 *   import * as EP from '@/lib/endpoints-apifootball';
 *   af(EP.PLAYERS, { id: 276, season: 2024 })
 *   af(EP.FIXTURES, { live: 'all' })
 *   af(EP.FIXTURES_H2H, { h2h: '33-34', last: 5 })
 */

// ── TIMEZONE ─────────────────────────────────────────────────
// params : (aucun)
export const TIMEZONE                     = '/timezone';

// ── COUNTRIES ────────────────────────────────────────────────
// params : name? | code? | search?
export const COUNTRIES                    = '/countries';

// ── LEAGUES ──────────────────────────────────────────────────
// params : id? | name? | country? | code? | season? | team? | type? | current? | search? | last?
export const LEAGUES                      = '/leagues';
// params : (aucun)
export const LEAGUES_SEASONS              = '/leagues/seasons';

// ── TEAMS ────────────────────────────────────────────────────
// params : id? | name? | league? | season? | country? | code? | venue? | search?
export const TEAMS                        = '/teams';
// params : league (requis) + season (requis) + team (requis) | date?
export const TEAMS_STATISTICS             = '/teams/statistics';
// params : team (requis)
export const TEAMS_SEASONS                = '/teams/seasons';
// params : (aucun)
export const TEAMS_COUNTRIES              = '/teams/countries';

// ── VENUES ───────────────────────────────────────────────────
// params : id? | name? | city? | country? | search?
export const VENUES                       = '/venues';

// ── STANDINGS ────────────────────────────────────────────────
// params : season (requis) | league? | team?
export const STANDINGS                    = '/standings';

// ── FIXTURES ─────────────────────────────────────────────────
// params : league (requis) + season (requis) | current? | dates? | timezone?
export const FIXTURES_ROUNDS              = '/fixtures/rounds';

// params :
//   id? | ids? (ex: "1-2-3")
//   live? ("all" ou ids de ligues séparés par "-")
//   date? (YYYY-MM-DD)
//   league? | season? | team?
//   last? | next?
//   from? | to?
//   round? | status? | venue? | timezone?
export const FIXTURES                     = '/fixtures';

// params : h2h (requis, ex: "33-34") | date? | league? | season? | last? | next? | from? | to? | status? | venue? | timezone?
export const FIXTURES_H2H                 = '/fixtures/headtohead';

// params : fixture (requis) | team? | type? | half?
export const FIXTURES_STATISTICS          = '/fixtures/statistics';

// params : fixture (requis) | team? | player? | type?
export const FIXTURES_EVENTS              = '/fixtures/events';

// params : fixture (requis) | team? | player? | type?
export const FIXTURES_LINEUPS             = '/fixtures/lineups';

// params : fixture (requis) | team?
export const FIXTURES_PLAYERS             = '/fixtures/players';

// ── INJURIES ─────────────────────────────────────────────────
// params : fixture? | league?+season? | team?+season? | player?+season? | date? | ids? | timezone?
export const INJURIES                     = '/injuries';

// ── PREDICTIONS ──────────────────────────────────────────────
// params : fixture (requis)
export const PREDICTIONS                  = '/predictions';

// ── COACHES ──────────────────────────────────────────────────
// params : id? | team? | search?
export const COACHES                      = '/coachs';

// ── PLAYERS ──────────────────────────────────────────────────
// params : player? | search? | page?
export const PLAYERS_PROFILES             = '/players/profiles';

// params : player?
export const PLAYERS_SEASONS              = '/players/seasons';

// params : id?+season? | team?+season? | league?+season? | search?+league? | search?+team? | page?
export const PLAYERS                      = '/players';

// params : team? | player?
export const PLAYERS_SQUADS               = '/players/squads';

// params : player (requis)
export const PLAYERS_TEAMS                = '/players/teams';

// params : league (requis) + season (requis)
export const PLAYERS_TOPSCORERS           = '/players/topscorers';

// params : league (requis) + season (requis)
export const PLAYERS_TOPASSISTS           = '/players/topassists';

// params : league (requis) + season (requis)
export const PLAYERS_TOPYELLOWCARDS       = '/players/topyellowcards';

// params : league (requis) + season (requis)
export const PLAYERS_TOPREDCARDS          = '/players/topredcards';

// ── TRANSFERS ────────────────────────────────────────────────
// params : player? | team?
export const TRANSFERS                    = '/transfers';

// ── TROPHIES ─────────────────────────────────────────────────
// params : player? | players? (ids séparés par virgule) | coach? | coachs?
export const TROPHIES                     = '/trophies';

// ── SIDELINED ────────────────────────────────────────────────
// params : player? | players? | coach? | coachs?
export const SIDELINED                    = '/sidelined';

// ── ODDS PRE-MATCH ───────────────────────────────────────────
// params : fixture? | league? | season? | date? | timezone? | page? | bookmaker? | bet?
export const ODDS                         = '/odds';

// params : page?
export const ODDS_MAPPING                 = '/odds/mapping';

// params : id? | search?
export const ODDS_BOOKMAKERS              = '/odds/bookmakers';

// params : id? | search?
export const ODDS_BETS                    = '/odds/bets';

// ── ODDS LIVE ────────────────────────────────────────────────
// params : fixture? | league? | bet?
export const ODDS_LIVE                    = '/odds/live';

// params : id? | search?
export const ODDS_LIVE_BETS               = '/odds/live/bets';


// =============================================================
// Helpers
// =============================================================

type Params = Record<string, string | number | boolean>;

/**
 * Construit une URL avec query params.
 * @example
 * buildUrl(PLAYERS, { id: 276, season: 2024 })
 * // → '/players?id=276&season=2024'
 *
 * buildUrl(FIXTURES, { live: 'all' })
 * // → '/fixtures?live=all'
 */
export function buildUrl(path: string, params: Params = {}): string {
  const entries = Object.entries(params).filter(([, v]) => v !== undefined && v !== null && v !== '');
  if (entries.length === 0) return path;
  const qs = entries.map(([k, v]) => `${k}=${encodeURIComponent(v)}`).join('&');
  return `${path}?${qs}`;
}

/**
 * Regroupe tous les endpoints par catégorie.
 */
export const EP_CATEGORIES = {
  meta:           { TIMEZONE, COUNTRIES },
  leagues:        { LEAGUES, LEAGUES_SEASONS },
  teams:          { TEAMS, TEAMS_STATISTICS, TEAMS_SEASONS, TEAMS_COUNTRIES },
  venues:         { VENUES },
  standings:      { STANDINGS },
  fixtures:       { FIXTURES_ROUNDS, FIXTURES, FIXTURES_H2H, FIXTURES_STATISTICS, FIXTURES_EVENTS, FIXTURES_LINEUPS, FIXTURES_PLAYERS },
  injuries:       { INJURIES },
  predictions:    { PREDICTIONS },
  coaches:        { COACHES },
  players:        { PLAYERS_PROFILES, PLAYERS_SEASONS, PLAYERS, PLAYERS_SQUADS, PLAYERS_TEAMS, PLAYERS_TOPSCORERS, PLAYERS_TOPASSISTS, PLAYERS_TOPYELLOWCARDS, PLAYERS_TOPREDCARDS },
  transfers:      { TRANSFERS },
  trophies:       { TROPHIES },
  sidelined:      { SIDELINED },
  odds:           { ODDS, ODDS_MAPPING, ODDS_BOOKMAKERS, ODDS_BETS },
  odds_live:      { ODDS_LIVE, ODDS_LIVE_BETS },
} as const;
