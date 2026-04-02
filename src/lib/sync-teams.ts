/**
 * sync-teams.ts — Synchronisation API-Football /teams → Supabase dn_teams
 *
 * Pour chaque ligue de MAJOR_LEAGUES :
 *  - Appelle GET /teams?league=&season=
 *  - Mappe team + venue (stocké en JSONB)
 *  - Upsert dans dn_teams (conflict sur id)
 *  - Upsert dans dn_team_leagues (junction team ↔ ligue)
 */
import { supabaseAdmin } from './supabase';
import { getCurrentSeason } from './season';

const BASE  = 'https://v3.football.api-sports.io';
const TOKEN = process.env.API_FOOTBALL_KEY!;

// ── Helpers ───────────────────────────────────────────────────────────────────

// eslint-disable-next-line @typescript-eslint/no-explicit-any
async function afFetch(path: string, params: Record<string, string | number> = {}): Promise<any> {
  const url = new URL(`${BASE}${path}`);
  Object.entries(params).forEach(([k, v]) => url.searchParams.set(k, String(v)));
  const res = await fetch(url.toString(), {
    headers: { 'x-apisports-key': TOKEN },
    cache: 'no-store',
  });
  if (!res.ok) return null;
  const json = await res.json();
  if (json.errors && Object.keys(json.errors).length > 0) {
    console.error(`[sync-teams] API error on ${path}:`, json.errors);
    return null;
  }
  return json;
}

const sleep = (ms: number) => new Promise(r => setTimeout(r, ms));

// ── Ligues à synchroniser ─────────────────────────────────────────────────────

const MAJOR_LEAGUES = [
  { id: 61,  name: 'Ligue 1'          },
  { id: 39,  name: 'Premier League'   },
  { id: 140, name: 'La Liga'          },
  { id: 135, name: 'Serie A'          },
  { id: 78,  name: 'Bundesliga'       },
  { id: 253, name: 'MLS'              },
  { id: 307, name: 'Saudi Pro League' },
  { id: 2,   name: 'Champions League' },
  { id: 3,   name: 'Europa League'    },
];

// ── Mapper API-Football → ligne dn_teams ──────────────────────────────────────

// eslint-disable-next-line @typescript-eslint/no-explicit-any
function mapTeamRow(entry: any) {
  const t = entry.team;
  const v = entry.venue ?? null;

  return {
    id:       t.id          as number,
    name:     t.name        as string,
    code:     t.code        ?? null,
    country:  t.country     ?? null,
    founded:  t.founded     ?? null,
    national: t.national    ?? false,
    logo:     t.logo        ?? null,
    venue:    v ? {
      id:       v.id       ?? null,
      name:     v.name     ?? null,
      address:  v.address  ?? null,
      city:     v.city     ?? null,
      capacity: v.capacity ?? null,
      surface:  v.surface  ?? null,
      image:    v.image    ?? null,
    } : null,
  };
}

// ── Résultat ──────────────────────────────────────────────────────────────────

export interface SyncTeamsResult {
  leagues:  number;
  teams:    number;
  upserted: number;
  errors:   number;
  requests: number;
}

// ── Main sync ─────────────────────────────────────────────────────────────────

export async function syncTeams(): Promise<SyncTeamsResult> {
  const result: SyncTeamsResult = { leagues: 0, teams: 0, upserted: 0, errors: 0, requests: 0 };
  const season = await getCurrentSeason();

  // Map global pour dédupliquer (une équipe peut être dans CL + ligue nationale)
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const teamMap = new Map<number, ReturnType<typeof mapTeamRow>>();

  // { teamId → Set<leagueId> }
  const leagueMap = new Map<number, Set<number>>();

  // ── 1. Récupérer les équipes de chaque ligue ──────────────────────────────

  for (const league of MAJOR_LEAGUES) {
    console.log(`[sync-teams] Fetching ${league.name}…`);

    const res = await afFetch('/teams', { league: league.id, season });
    result.requests++;

    if (!res?.response) {
      console.warn(`[sync-teams] No response for ${league.name}`);
      await sleep(220);
      continue;
    }

    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    for (const entry of res.response as any[]) {
      if (!entry?.team?.id) continue;
      const row = mapTeamRow(entry);

      // Garder la première entrée (toutes les ligues renvoient la même fiche équipe)
      if (!teamMap.has(row.id)) {
        teamMap.set(row.id, row);
      }

      // Enregistrer l'association team ↔ ligue
      if (!leagueMap.has(row.id)) leagueMap.set(row.id, new Set());
      leagueMap.get(row.id)!.add(league.id);
    }

    console.log(`[sync-teams] ${league.name}: ${res.response.length} équipes`);
    result.leagues++;
    await sleep(220); // ~270 req/min — sous la limite de 300
  }

  result.teams = teamMap.size;
  console.log(`[sync-teams] ${teamMap.size} équipes uniques collectées`);

  // ── 2. Upsert dn_teams par lots de 100 ───────────────────────────────────

  const rows = Array.from(teamMap.values());
  const CHUNK = 100;

  for (let i = 0; i < rows.length; i += CHUNK) {
    const chunk = rows.slice(i, i + CHUNK);

    const { error } = await supabaseAdmin
      .from('dn_teams')
      .upsert(
        chunk.map(r => ({ ...r, updated_at: new Date().toISOString() })),
        { onConflict: 'id', ignoreDuplicates: false }
      );

    if (error) {
      console.error(`[sync-teams] upsert chunk ${i}-${i + chunk.length}:`, error.message);
      result.errors++;
    } else {
      result.upserted += chunk.length;
    }

    console.log(`[sync-teams] dn_teams : ${Math.min(i + CHUNK, rows.length)}/${rows.length}`);
  }

  // ── 3. Upsert dn_team_leagues ─────────────────────────────────────────────

  const junctionRows: { team_id: number; league_id: number; season: number }[] = [];
  for (const [teamId, leagueIds] of leagueMap) {
    for (const leagueId of leagueIds) {
      junctionRows.push({ team_id: teamId, league_id: leagueId, season });
    }
  }

  for (let i = 0; i < junctionRows.length; i += CHUNK) {
    const chunk = junctionRows.slice(i, i + CHUNK);

    const { error } = await supabaseAdmin
      .from('dn_team_leagues')
      .upsert(chunk, { onConflict: 'team_id,league_id,season', ignoreDuplicates: true });

    if (error) {
      console.error(`[sync-teams] upsert dn_team_leagues chunk ${i}:`, error.message);
      result.errors++;
    }
  }

  console.log(`[sync-teams] Done:`, result);
  return result;
}
