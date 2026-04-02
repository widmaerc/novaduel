// SPORTMONKS DISABLED — remplacé par API-Football (endpoints-apifootball.ts)
/*
// Sportmonks v3 — Référence complète des endpoints
//
// Usage :
//   import { EP } from '@/lib/endpoints';
//   sm(EP.PLAYER_BY_ID.replace('{id}', String(playerId)))
//
// BASE Football : https://api.sportmonks.com/v3/football  (géré dans sportmonks.ts)
// BASE Core     : https://api.sportmonks.com/v3/core

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

// Helpers
type Params = Record<string, string | number>;

export function resolve(path: string, params: Params): string {
  return Object.entries(params).reduce(
    (p, [k, v]) => p.replace(`{${k}}`, String(v)),
    path
  );
}
*/
