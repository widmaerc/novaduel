/**
 * Sportmonks v3 — Référence complète des endpoints
 *
 * Usage :
 *   import { EP } from '@/lib/endpoints';
 *   sm(EP.PLAYER_BY_ID.replace('{id}', String(playerId)))
 *   sm(EP.PLAYERS_SEARCH.replace('{name}', query))
 *
 * Les clés correspondent exactement à celles du fichier endpoints.params.
 * BASE Football : https://api.sportmonks.com/v3/football  (géré dans sportmonks.ts)
 * BASE Core     : https://api.sportmonks.com/v3/core
 */

// ── LIVESCORES ──────────────────────────────────────────────
export const LIVESCORES_INPLAY           = '/livescores/inplay';
export const LIVESCORES_ALL              = '/livescores';
export const LIVESCORES_LATEST           = '/livescores/latest';

// ── FIXTURES ────────────────────────────────────────────────
export const FIXTURES_ALL                = '/fixtures';
export const FIXTURE_BY_ID               = '/fixtures/{id}';
export const FIXTURES_BY_IDS             = '/fixtures/multi/{ids}';
export const FIXTURES_BY_DATE            = '/fixtures/date/{date}';
export const FIXTURES_BY_DATE_RANGE      = '/fixtures/between/{startDate}/{endDate}';
export const FIXTURES_BY_DATE_RANGE_TEAM = '/fixtures/between/{startDate}/{endDate}/{teamId}';
export const FIXTURES_HEAD_TO_HEAD       = '/fixtures/head-to-head/{team1Id}/{team2Id}';
export const FIXTURES_SEARCH             = '/fixtures/search/{name}';
export const FIXTURES_UPCOMING_MARKET    = '/fixtures/upcoming/markets/{marketId}';
export const FIXTURES_UPCOMING_TV        = '/fixtures/upcoming/tv-stations/{tvStationId}';
export const FIXTURES_PAST_TV            = '/fixtures/past/tv-stations/{tvStationId}';
export const FIXTURES_LATEST             = '/fixtures/latest';
export const FIXTURES_BY_PLAYER          = '/fixtures/players/{playerId}';

// ── PLAYERS ─────────────────────────────────────────────────
export const PLAYERS_ALL                 = '/players';
export const PLAYER_BY_ID                = '/players/{id}';
export const PLAYERS_BY_IDS              = '/players/multi/{ids}';
export const PLAYERS_BY_COUNTRY          = '/players/countries/{countryId}';
export const PLAYERS_SEARCH              = '/players/search/{name}';
export const PLAYERS_LATEST              = '/players/latest';

// ── TEAMS ───────────────────────────────────────────────────
export const TEAMS_ALL                   = '/teams';
export const TEAM_BY_ID                  = '/teams/{id}';
export const TEAMS_BY_COUNTRY            = '/teams/countries/{countryId}';
export const TEAMS_BY_SEASON             = '/teams/seasons/{seasonId}';
export const TEAMS_SEARCH                = '/teams/search/{name}';

// ── LEAGUES ─────────────────────────────────────────────────
export const LEAGUES_ALL                 = '/leagues';
export const LEAGUES_LIVE                = '/leagues/live';
export const LEAGUES_BY_DATE             = '/leagues/date/{date}';
export const LEAGUES_BY_COUNTRY          = '/leagues/countries/{countryId}';
export const LEAGUES_SEARCH              = '/leagues/search/{name}';
export const LEAGUES_BY_TEAM             = '/leagues/teams/{teamId}';
export const LEAGUES_CURRENT_BY_TEAM     = '/leagues/teams/{teamId}/current';

// ── SEASONS ─────────────────────────────────────────────────
export const SEASONS_ALL                 = '/seasons';
export const SEASON_BY_ID                = '/seasons/{id}';
export const SEASONS_BY_TEAM             = '/seasons/teams/{teamId}';
export const SEASONS_SEARCH              = '/seasons/search/{name}';

// ── STANDINGS ───────────────────────────────────────────────
export const STANDINGS_ALL               = '/standings';
export const STANDINGS_BY_SEASON         = '/standings/seasons/{seasonId}';
export const STANDINGS_BY_ROUND          = '/standings/rounds/{roundId}';
export const STANDINGS_CORRECTION        = '/standings/corrections/seasons/{seasonId}';
export const STANDINGS_LIVE_BY_LEAGUE    = '/standings/live/leagues/{leagueId}';

// ── TOPSCORERS ──────────────────────────────────────────────
export const TOPSCORERS_BY_SEASON        = '/topscorers/seasons/{seasonId}';
export const TOPSCORERS_BY_STAGE         = '/topscorers/stages/{stageId}';

// Filtres topscorers — usage : filters=seasontopscorerTypes:{id}
export const TOPSCORE_FILTER_GOALS       = 'seasontopscorerTypes:208';
export const TOPSCORE_FILTER_ASSISTS     = 'seasontopscorerTypes:209';

// ── STATISTICS ──────────────────────────────────────────────
export const STATISTICS_BY_SEASON        = '/statistics/seasons/{seasonId}';
export const STATISTICS_BY_STAGE         = '/statistics/stages/{stageId}';
export const STATISTICS_BY_ROUND         = '/statistics/rounds/{roundId}';

// ── SCHEDULES ───────────────────────────────────────────────
export const SCHEDULES_BY_SEASON         = '/schedules/seasons/{seasonId}';
export const SCHEDULES_BY_TEAM           = '/schedules/teams/{teamId}';
export const SCHEDULES_BY_SEASON_TEAM    = '/schedules/seasons/{seasonId}/teams/{teamId}';

// ── STAGES ──────────────────────────────────────────────────
export const STAGES_ALL                  = '/stages';
export const STAGE_BY_ID                 = '/stages/{id}';
export const STAGES_BY_SEASON            = '/stages/seasons/{seasonId}';
export const STAGES_SEARCH               = '/stages/search/{name}';

// ── ROUNDS ──────────────────────────────────────────────────
export const ROUNDS_ALL                  = '/rounds';
export const ROUND_BY_ID                 = '/rounds/{id}';
export const ROUNDS_BY_SEASON            = '/rounds/seasons/{seasonId}';
export const ROUNDS_SEARCH               = '/rounds/search/{name}';

// ── SQUADS ──────────────────────────────────────────────────
export const SQUAD_BY_TEAM               = '/squads/teams/{teamId}';
export const SQUAD_EXTENDED_BY_TEAM      = '/squads/teams/{teamId}/extended';
export const SQUAD_BY_TEAM_SEASON        = '/squads/seasons/{seasonId}/teams/{teamId}';

// ── COACHES ─────────────────────────────────────────────────
export const COACHES_ALL                 = '/coaches';
export const COACH_BY_ID                 = '/coaches/{id}';
export const COACHES_BY_COUNTRY          = '/coaches/countries/{countryId}';
export const COACHES_SEARCH              = '/coaches/search/{name}';
export const COACHES_LATEST              = '/coaches/latest';

// ── REFEREES ────────────────────────────────────────────────
export const REFEREES_ALL                = '/referees';
export const REFEREE_BY_ID               = '/referees/{id}';
export const REFEREES_BY_COUNTRY         = '/referees/countries/{countryId}';
export const REFEREES_BY_SEASON          = '/referees/seasons/{seasonId}';
export const REFEREES_SEARCH             = '/referees/search/{name}';

// ── TRANSFERS ───────────────────────────────────────────────
export const TRANSFERS_ALL               = '/transfers';
export const TRANSFER_BY_ID              = '/transfers/{id}';
export const TRANSFERS_LATEST            = '/transfers/latest';
export const TRANSFERS_BY_DATE_RANGE     = '/transfers/between/{startDate}/{endDate}';
export const TRANSFERS_BY_TEAM           = '/transfers/teams/{teamId}';
export const TRANSFERS_BY_PLAYER         = '/transfers/players/{playerId}';

// ── TRANSFER RUMOURS ────────────────────────────────────────
export const TRANSFER_RUMOURS_ALL        = '/transfer-rumours';
export const TRANSFER_RUMOUR_BY_ID       = '/transfer-rumours/{id}';
export const TRANSFER_RUMOURS_DATE_RANGE = '/transfer-rumours/between/{startDate}/{endDate}';
export const TRANSFER_RUMOURS_BY_TEAM    = '/transfer-rumours/teams/{teamId}';
export const TRANSFER_RUMOURS_BY_PLAYER  = '/transfer-rumours/players/{playerId}';

// ── VENUES ──────────────────────────────────────────────────
export const VENUES_ALL                  = '/venues';
export const VENUE_BY_ID                 = '/venues/{id}';
export const VENUES_BY_SEASON            = '/venues/seasons/{seasonId}';
export const VENUES_SEARCH               = '/venues/search/{name}';

// ── TV STATIONS ─────────────────────────────────────────────
export const TV_STATIONS_ALL             = '/tv-stations';
export const TV_STATION_BY_ID            = '/tv-stations/{id}';
export const TV_STATIONS_BY_FIXTURE      = '/tv-stations/fixtures/{fixtureId}';

// ── STATES ──────────────────────────────────────────────────
export const STATES_ALL                  = '/states';
export const STATE_BY_ID                 = '/states/{id}';

// ── TYPES ───────────────────────────────────────────────────
export const TYPES_ALL                   = '/types';
export const TYPE_BY_ID                  = '/types/{id}';
export const TYPES_BY_ENTITY             = '/types/entities/{entity}';

// ── NEWS ────────────────────────────────────────────────────
export const NEWS_PRE_MATCH              = '/news/pre-match';
export const NEWS_PRE_MATCH_BY_SEASON    = '/news/pre-match/seasons/{seasonId}';
export const NEWS_PRE_MATCH_UPCOMING     = '/news/pre-match/upcoming';
export const NEWS_POST_MATCH             = '/news/post-match';
export const NEWS_POST_MATCH_BY_SEASON   = '/news/post-match/seasons/{seasonId}';

// ── COMMENTARIES ────────────────────────────────────────────
export const COMMENTARIES_ALL            = '/commentaries';
export const COMMENTARIES_BY_FIXTURE     = '/commentaries/fixtures/{fixtureId}';

// ── RIVALS ──────────────────────────────────────────────────
export const RIVALS_ALL                  = '/rivals';
export const RIVALS_BY_TEAM              = '/rivals/teams/{teamId}';

// ── EXPECTED (xG) ───────────────────────────────────────────
export const EXPECTED_BY_TEAM            = '/expected/teams/{teamId}';
export const EXPECTED_BY_PLAYER          = '/expected/players/{playerId}';

// ── EXPECTED LINEUPS (Premium) ──────────────────────────────
export const EXPECTED_LINEUP_BY_TEAM     = '/expected-lineups/teams/{teamId}';
export const EXPECTED_LINEUP_BY_PLAYER   = '/expected-lineups/players/{playerId}';

// ── PREDICTIONS ─────────────────────────────────────────────
export const PREDICTIONS_ALL             = '/predictions/probabilities';
export const PREDICTIONS_BY_LEAGUE       = '/predictions/predictability/leagues/{leagueId}';
export const PREDICTIONS_BY_FIXTURE      = '/predictions/probabilities/fixtures/{fixtureId}';
export const PREDICTIONS_VALUE_BETS      = '/predictions/value-bets';
export const PREDICTIONS_VALUE_BETS_FIXTURE = '/predictions/value-bets/fixtures/{fixtureId}';

// ── ODDS PRE-MATCH ──────────────────────────────────────────
export const ODDS_ALL                    = '/odds';
export const ODDS_BY_FIXTURE             = '/odds/fixtures/{fixtureId}';
export const ODDS_BY_FIXTURE_BOOKMAKER   = '/odds/fixtures/{fixtureId}/bookmakers/{bookmakerId}';
export const ODDS_BY_FIXTURE_MARKET      = '/odds/fixtures/{fixtureId}/markets/{marketId}';
export const ODDS_LATEST                 = '/odds/latest';

// ── ODDS INPLAY ─────────────────────────────────────────────
export const ODDS_INPLAY_ALL             = '/odds/inplay';
export const ODDS_INPLAY_BY_FIXTURE      = '/odds/inplay/fixtures/{fixtureId}';
export const ODDS_INPLAY_FIXTURE_BK      = '/odds/inplay/fixtures/{fixtureId}/bookmakers/{bookmakerId}';
export const ODDS_INPLAY_FIXTURE_MKT     = '/odds/inplay/fixtures/{fixtureId}/markets/{marketId}';
export const ODDS_INPLAY_LATEST          = '/odds/inplay/latest';

// ── ODDS PREMIUM ────────────────────────────────────────────
export const ODDS_PREMIUM_ALL            = '/odds/premium';
export const ODDS_PREMIUM_BY_FIXTURE     = '/odds/premium/fixtures/{fixtureId}';
export const ODDS_PREMIUM_FIXTURE_BK     = '/odds/premium/fixtures/{fixtureId}/bookmakers/{bookmakerId}';
export const ODDS_PREMIUM_FIXTURE_MKT    = '/odds/premium/fixtures/{fixtureId}/markets/{marketId}';
export const ODDS_PREMIUM_RANGE          = '/odds/premium/updated/between/{startTime}/{endTime}';
export const ODDS_PREMIUM_HIST_RANGE     = '/odds/premium/historical/between/{startTime}/{endTime}';
export const ODDS_PREMIUM_HIST_ALL       = '/odds/premium/historical';

// ── MARKETS ─────────────────────────────────────────────────
export const MARKETS_ALL                 = '/markets';
export const MARKETS_PREMIUM             = '/markets/premium';
export const MARKET_BY_ID                = '/markets/{id}';
export const MARKETS_SEARCH              = '/markets/search/{name}';

// ── BOOKMAKERS ──────────────────────────────────────────────
export const BOOKMAKERS_ALL              = '/bookmakers';
export const BOOKMAKERS_PREMIUM          = '/bookmakers/premium';
export const BOOKMAKER_BY_ID             = '/bookmakers/{id}';
export const BOOKMAKERS_SEARCH           = '/bookmakers/search/{name}';
export const BOOKMAKERS_BY_FIXTURE       = '/bookmakers/fixtures/{fixtureId}';
export const BOOKMAKERS_MATCH_ID_MAP     = '/bookmakers/match-id-mappings/fixtures/{fixtureId}';

// ── MATCH FACTS (Beta) ──────────────────────────────────────
export const MATCH_FACTS_ALL             = '/match-facts';
export const MATCH_FACTS_BY_FIXTURE      = '/match-facts/fixtures/{fixtureId}';
export const MATCH_FACTS_DATE_RANGE      = '/match-facts/between/{startDate}/{endDate}';
export const MATCH_FACTS_BY_LEAGUE       = '/match-facts/leagues/{leagueId}';

// ── TEAM RANKINGS (Beta) ────────────────────────────────────
export const TEAM_RANKINGS_ALL           = '/team-rankings';
export const TEAM_RANKINGS_BY_TEAM       = '/team-rankings/teams/{teamId}';
export const TEAM_RANKINGS_BY_DATE       = '/team-rankings/date/{date}';

// ── TEAM OF THE WEEK (Beta) ─────────────────────────────────
export const TOTW_ALL                    = '/team-of-the-week';
export const TOTW_BY_ROUND               = '/team-of-the-week/rounds/{roundId}';
export const TOTW_LATEST                 = '/team-of-the-week/latest';

// ── CORE (base: https://api.sportmonks.com/v3/core) ─────────
// Usage : smCore(COUNTRIES_ALL) — nécessite un caller séparé avec base core
export const COUNTRIES_ALL               = '/countries';
export const COUNTRY_BY_ID               = '/countries/{id}';
export const COUNTRIES_SEARCH            = '/countries/search/{name}';
export const CONTINENTS_ALL              = '/continents';
export const CONTINENT_BY_ID             = '/continents/{id}';
export const REGIONS_ALL                 = '/regions';
export const REGION_BY_ID                = '/regions/{id}';
export const CITIES_ALL                  = '/cities';
export const CITY_BY_ID                  = '/cities/{id}';
export const TIMEZONES_ALL               = '/timezones';


// =============================================================
// Helpers — résolution de paramètres dans les chemins
// =============================================================

type Params = Record<string, string | number>;

/**
 * Résout les paramètres dans un chemin d'endpoint.
 * @example
 * resolve(PLAYER_BY_ID, { id: 123 })
 * // → '/players/123'
 *
 * resolve(FIXTURES_BY_DATE_RANGE, { startDate: '2026-01-01', endDate: '2026-03-31' })
 * // → '/fixtures/between/2026-01-01/2026-03-31'
 */
export function resolve(path: string, params: Params): string {
  return Object.entries(params).reduce(
    (p, [k, v]) => p.replace(`{${k}}`, String(v)),
    path
  );
}

/**
 * Regroupe tous les endpoints par catégorie pour référence.
 * Utile pour affichage ou génération de doc.
 */
export const EP_CATEGORIES = {
  livescores:        { LIVESCORES_INPLAY, LIVESCORES_ALL, LIVESCORES_LATEST },
  fixtures:          { FIXTURES_ALL, FIXTURE_BY_ID, FIXTURES_BY_IDS, FIXTURES_BY_DATE, FIXTURES_BY_DATE_RANGE, FIXTURES_BY_DATE_RANGE_TEAM, FIXTURES_HEAD_TO_HEAD, FIXTURES_SEARCH, FIXTURES_LATEST, FIXTURES_BY_PLAYER },
  players:           { PLAYERS_ALL, PLAYER_BY_ID, PLAYERS_BY_COUNTRY, PLAYERS_SEARCH, PLAYERS_LATEST },
  teams:             { TEAMS_ALL, TEAM_BY_ID, TEAMS_BY_COUNTRY, TEAMS_BY_SEASON, TEAMS_SEARCH },
  leagues:           { LEAGUES_ALL, LEAGUES_LIVE, LEAGUES_BY_DATE, LEAGUES_BY_COUNTRY, LEAGUES_SEARCH, LEAGUES_BY_TEAM, LEAGUES_CURRENT_BY_TEAM },
  seasons:           { SEASONS_ALL, SEASON_BY_ID, SEASONS_BY_TEAM, SEASONS_SEARCH },
  standings:         { STANDINGS_ALL, STANDINGS_BY_SEASON, STANDINGS_BY_ROUND, STANDINGS_CORRECTION, STANDINGS_LIVE_BY_LEAGUE },
  topscorers:        { TOPSCORERS_BY_SEASON, TOPSCORERS_BY_STAGE },
  statistics:        { STATISTICS_BY_SEASON, STATISTICS_BY_STAGE, STATISTICS_BY_ROUND },
  schedules:         { SCHEDULES_BY_SEASON, SCHEDULES_BY_TEAM, SCHEDULES_BY_SEASON_TEAM },
  stages:            { STAGES_ALL, STAGE_BY_ID, STAGES_BY_SEASON, STAGES_SEARCH },
  rounds:            { ROUNDS_ALL, ROUND_BY_ID, ROUNDS_BY_SEASON, ROUNDS_SEARCH },
  squads:            { SQUAD_BY_TEAM, SQUAD_EXTENDED_BY_TEAM, SQUAD_BY_TEAM_SEASON },
  coaches:           { COACHES_ALL, COACH_BY_ID, COACHES_BY_COUNTRY, COACHES_SEARCH, COACHES_LATEST },
  referees:          { REFEREES_ALL, REFEREE_BY_ID, REFEREES_BY_COUNTRY, REFEREES_BY_SEASON, REFEREES_SEARCH },
  transfers:         { TRANSFERS_ALL, TRANSFER_BY_ID, TRANSFERS_LATEST, TRANSFERS_BY_DATE_RANGE, TRANSFERS_BY_TEAM, TRANSFERS_BY_PLAYER },
  transfer_rumours:  { TRANSFER_RUMOURS_ALL, TRANSFER_RUMOUR_BY_ID, TRANSFER_RUMOURS_DATE_RANGE, TRANSFER_RUMOURS_BY_TEAM, TRANSFER_RUMOURS_BY_PLAYER },
  venues:            { VENUES_ALL, VENUE_BY_ID, VENUES_BY_SEASON, VENUES_SEARCH },
  tv_stations:       { TV_STATIONS_ALL, TV_STATION_BY_ID, TV_STATIONS_BY_FIXTURE },
  states:            { STATES_ALL, STATE_BY_ID },
  types:             { TYPES_ALL, TYPE_BY_ID, TYPES_BY_ENTITY },
  news:              { NEWS_PRE_MATCH, NEWS_PRE_MATCH_BY_SEASON, NEWS_PRE_MATCH_UPCOMING, NEWS_POST_MATCH, NEWS_POST_MATCH_BY_SEASON },
  commentaries:      { COMMENTARIES_ALL, COMMENTARIES_BY_FIXTURE },
  rivals:            { RIVALS_ALL, RIVALS_BY_TEAM },
  expected:          { EXPECTED_BY_TEAM, EXPECTED_BY_PLAYER },
  expected_lineups:  { EXPECTED_LINEUP_BY_TEAM, EXPECTED_LINEUP_BY_PLAYER },
  predictions:       { PREDICTIONS_ALL, PREDICTIONS_BY_LEAGUE, PREDICTIONS_BY_FIXTURE, PREDICTIONS_VALUE_BETS, PREDICTIONS_VALUE_BETS_FIXTURE },
  odds:              { ODDS_ALL, ODDS_BY_FIXTURE, ODDS_BY_FIXTURE_BOOKMAKER, ODDS_BY_FIXTURE_MARKET, ODDS_LATEST },
  odds_inplay:       { ODDS_INPLAY_ALL, ODDS_INPLAY_BY_FIXTURE, ODDS_INPLAY_FIXTURE_BK, ODDS_INPLAY_FIXTURE_MKT, ODDS_INPLAY_LATEST },
  odds_premium:      { ODDS_PREMIUM_ALL, ODDS_PREMIUM_BY_FIXTURE, ODDS_PREMIUM_FIXTURE_BK, ODDS_PREMIUM_FIXTURE_MKT, ODDS_PREMIUM_RANGE, ODDS_PREMIUM_HIST_RANGE, ODDS_PREMIUM_HIST_ALL },
  markets:           { MARKETS_ALL, MARKETS_PREMIUM, MARKET_BY_ID, MARKETS_SEARCH },
  bookmakers:        { BOOKMAKERS_ALL, BOOKMAKERS_PREMIUM, BOOKMAKER_BY_ID, BOOKMAKERS_SEARCH, BOOKMAKERS_BY_FIXTURE, BOOKMAKERS_MATCH_ID_MAP },
  match_facts:       { MATCH_FACTS_ALL, MATCH_FACTS_BY_FIXTURE, MATCH_FACTS_DATE_RANGE, MATCH_FACTS_BY_LEAGUE },
  team_rankings:     { TEAM_RANKINGS_ALL, TEAM_RANKINGS_BY_TEAM, TEAM_RANKINGS_BY_DATE },
  totw:              { TOTW_ALL, TOTW_BY_ROUND, TOTW_LATEST },
  core:              { COUNTRIES_ALL, COUNTRY_BY_ID, COUNTRIES_SEARCH, CONTINENTS_ALL, CONTINENT_BY_ID, REGIONS_ALL, REGION_BY_ID, CITIES_ALL, CITY_BY_ID, TIMEZONES_ALL },
} as const;
