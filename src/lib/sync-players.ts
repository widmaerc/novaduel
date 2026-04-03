/**
 * sync-players.ts — Synchronisation API-Football /players → Supabase dn_players
 *
 * Stratégie :
 *  - Pagine /players?league&season pour chaque ligue de MAJOR_LEAGUES
 *  - Déduplique par player.id (garde l'entrée avec le plus d'apparitions)
 *  - Filtre les joueurs sans aucune stat (apparences nulles)
 *  - player.* → colonnes plates | statistics[] → JSONB
 *  - Upsert par lots de 100 (conflict sur id)
 *  - Plan Pro : 300 req/min → sleep 220ms entre chaque requête
 */
import { supabaseAdmin } from './supabase';
import { getCurrentSeason } from './season';
import { buildSlug } from './data';
import { redis } from './redis';

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
    console.error(`[sync-players] API error on ${path}:`, json.errors);
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

// ── Mapper API-Football → ligne dn_players ────────────────────────────────────

// eslint-disable-next-line @typescript-eslint/no-explicit-any
function mapPlayerRow(entry: any, season: number) {
  const p = entry.player;
  const stats = entry.statistics ?? [];

  return {
    id:           p.id          as number,
    slug:         buildSlug(p.name as string, p.id as number, p.firstname ?? null, p.lastname ?? null),
    name:         p.name        as string,
    firstname:    p.firstname   ?? null,
    lastname:     p.lastname    ?? null,
    age:          p.age         ?? null,
    birth_date:   p.birth?.date ?? null,
    birth_place:  p.birth?.place   ?? null,
    birth_country:p.birth?.country ?? null,
    nationality:  p.nationality ?? null,
    height:       p.height ? parseInt(p.height) || null : null,
    weight:       p.weight ? parseInt(p.weight) || null : null,
    injured:      p.injured     ?? false,
    photo:        p.photo       ?? null,
    statistics:   stats,
    season,
  };
}

// ── Résultat ──────────────────────────────────────────────────────────────────

export interface SyncPlayersResult {
  leagues:  number;
  players:  number;
  upserted: number;
  skipped:  number;
  errors:   number;
  requests: number;
}

// ── Main sync ─────────────────────────────────────────────────────────────────

export async function syncPlayers(): Promise<SyncPlayersResult> {
  const result: SyncPlayersResult = { leagues: 0, players: 0, upserted: 0, skipped: 0, errors: 0, requests: 0 };
  const season = await getCurrentSeason();

  console.log(`[sync-players] Starting sync (season ${season})…`);

  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const playerMap = new Map<number, any>(); // id → entry avec le plus d'apparitions

  // ── 1. Paginer tous les joueurs de chaque ligue ───────────────────────────

  for (const league of MAJOR_LEAGUES) {
    console.log(`[sync-players] Fetching ${league.name}…`);
    let page = 1;
    let totalPages = 1;

    while (page <= totalPages) {
      const res = await afFetch('/players', { league: league.id, season, page });
      result.requests++;

      if (!res) { page++; await sleep(220); continue; }

      totalPages = res.paging?.total ?? 1;

      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      for (const entry of (res.response ?? []) as any[]) {
        if (!entry?.player?.id) continue;

        // Garder l'entrée avec le plus d'apparitions si le joueur apparaît dans plusieurs ligues
        const existing   = playerMap.get(entry.player.id);
        const newApps    = entry.statistics?.[0]?.games?.appearences ?? 0;
        const prevApps   = existing?.statistics?.[0]?.games?.appearences ?? 0;
        if (!existing || newApps > prevApps) {
          playerMap.set(entry.player.id, entry);
        }
      }

      if (page % 10 === 0) {
        console.log(`[sync-players] ${league.name}: page ${page}/${totalPages} (${playerMap.size} joueurs total)`);
      }

      page++;
      await sleep(220); // ~270 req/min — sous la limite de 300
    }

    console.log(`[sync-players] ${league.name}: done (${totalPages} pages)`);
    result.leagues++;
  }

  result.players = playerMap.size;
  console.log(`[sync-players] ${playerMap.size} joueurs uniques collectés (${result.requests} req API)`);

  // ── 2. Charger les slugs + apparitions existantes ────────────────────────

  const { data: existingRows, error: slugError } = await supabaseAdmin
    .from('dn_players')
    .select('id, slug, statistics');

  if (slugError) {
    console.error('[sync-players] Error fetching existing rows:', slugError);
  }

  const usedSlugs   = new Set(existingRows?.map(s => s.slug) || []);
  const playerSlugs = new Map(existingRows?.map(s => [s.id, s.slug]) || []);
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const prevAppsMap = new Map(existingRows?.map(s => [
    s.id,
    (s.statistics as any)?.[0]?.games?.appearences ?? 0
  ]) || []);

  // ── 3. Mapper + filtrer ───────────────────────────────────────────────────

  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const rows: ReturnType<typeof mapPlayerRow>[] = [];

  for (const [, entry] of playerMap) {
    const apps = entry.statistics?.[0]?.games?.appearences ?? 0;

    // Ignorer les joueurs sans aucune apparition
    if (!apps) {
      result.skipped++;
      continue;
    }

    try {
      const p = entry.player;
      
      // 1. Calculer le slug de base selon la règle (Abréviation vs Nom Complet)
      // buildSlug gère déjà le cas : name avec '.' -> firstname+lastname, sinon -> name
      const baseSlug = buildSlug(p.name as string, p.id as number, p.firstname ?? null, p.lastname ?? null);
      
      // 2. Gérer l'ID déjà existant pour ce joueur pour éviter de changer son slug s'il est déjà bon
      // Mais on ne garde l'ancien que s'il respecte le nouveau format de buildSlug
      let finalSlug = baseSlug;
      const currentSlugInDb = playerSlugs.get(p.id);

      if (currentSlugInDb && (currentSlugInDb === baseSlug || currentSlugInDb.startsWith(baseSlug + '-'))) {
        finalSlug = currentSlugInDb;
      } else {
        // Nouveau ou format incorrect -> On cherche un slug unique
        let counter = 1;
        while (usedSlugs.has(finalSlug)) {
          finalSlug = `${baseSlug}-${counter}`;
          counter++;
        }
      }

      usedSlugs.add(finalSlug);

      const row = mapPlayerRow(entry, season);
      row.slug = finalSlug; // On force le slug calculé
      rows.push(row);
    } catch (e) {
      console.error(`[sync-players] map error player ${entry.player?.id}:`, e);
      result.errors++;
    }
  }

  console.log(`[sync-players] ${rows.length} joueurs à upsert (${result.skipped} skipped — 0 apparitions)`);

  // ── 3. Upsert dn_players par lots de 100 ─────────────────────────────────

  const CHUNK = 100;

  for (let i = 0; i < rows.length; i += CHUNK) {
    const chunk = rows.slice(i, i + CHUNK);

    const { error } = await supabaseAdmin
      .from('dn_players')
      .upsert(
        chunk.map(r => ({ ...r, updated_at: new Date().toISOString() })),
        { onConflict: 'id', ignoreDuplicates: false }
      );

    if (error) {
      console.error(`[sync-players] upsert chunk ${i}:`, error.message);
      result.errors++;
    } else {
      result.upserted += chunk.length;
    }

    console.log(`[sync-players] dn_players : ${Math.min(i + CHUNK, rows.length)}/${rows.length}`);
  }

  // ── 4. Invalider les insights des joueurs dont les stats ont changé ────────

  const changed = rows.filter(row => {
    const newApps  = (row.statistics as any)?.[0]?.games?.appearences ?? 0;
    const prevApps = prevAppsMap.get(row.id) ?? 0;
    return newApps !== prevApps;
  });

  if (changed.length > 0) {
    console.log(`[sync-players] ${changed.length} joueurs avec stats changées → invalidation insights`);

    // Nuller les insights en DB par lots de 100
    const changedIds = changed.map(r => r.id);
    for (let i = 0; i < changedIds.length; i += CHUNK) {
      const chunk = changedIds.slice(i, i + CHUNK);
      await supabaseAdmin
        .from('dn_players')
        .update({ insight_fr: null, insight_en: null, insight_es: null, ai_analysis: null })
        .in('id', chunk)
        .then(() => {}, (e) => console.error('[sync-players] insight null error:', e));
    }

    // Invalider les clés Redis correspondantes
    const redisKeys = changed.flatMap(r => {
      const slug = playerSlugs.get(r.id) ?? r.slug;
      return ['fr', 'en', 'es'].map(l => `player:af:slug:${slug}:${l}`);
    });
    if (redisKeys.length > 0) {
      await redis.del(...redisKeys).catch(() => {});
    }

    console.log(`[sync-players] ${redisKeys.length} clés Redis invalidées`);
  }

  console.log(`[sync-players] Done:`, result);
  return result;
}
