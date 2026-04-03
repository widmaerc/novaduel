/**
 * NovaDuel — Couche de données centralisée
 * Ordre de priorité : Supabase → Redis → API-Football
 * SERVER-SIDE ONLY
 */
import { supabaseAdmin } from './supabase';
import { getPlayer, getFixtures } from './apifootball';
import { cached, TTL } from './redis';
import { getCurrentSeason } from './season';
import type { Player } from '../types';


// ─── Helpers ─────────────────────────────────────────────────────────────────

export function slugify(name: string): string {
  return (name ?? '')
    .toLowerCase()
    .normalize('NFD').replace(/[\u0300-\u036f]/g, '')
    .replace(/\s+/g, '-')
    .replace(/[^a-z0-9-]/g, '')
    .replace(/-+/g, '-')
    .replace(/^-|-$/g, '');
}

/**
 * Construit un slug SEO propre (Nom Complet).
 * - "L. Messi" -> "Lionel Messi" -> "lionel-messi"
 * - "Bruno Fernandes" -> "bruno-fernandes"
 * - Sécurisé : Pas d'ID brute dans l'URL.
 */
export function buildSlug(name: string, _id: number, firstname?: string | null, lastname?: string | null): string {
  // 1. Si le name est abrégé (contient un point)
  if (name.includes('.') && firstname && lastname) {
    const first = firstname.trim().split(/\s+/)[0]; 
    const last  = lastname.trim().split(/\s+/)[0];
    const s = slugify(`${first} ${last}`);
    if (s) return s;
  }

  // 2. Sinon, prendre le name complet tel quel
  return slugify(name) || 'joueur';
}

export function displayName(name: string, firstname?: string | null, lastname?: string | null): string {
  if (firstname && lastname) {
    const first = firstname.trim().split(/\s+/)[0]
    const last  = lastname.trim().split(/\s+/)[0]
    if (first && last) return `${first} ${last}`
  }
  return name
}

export function makeInitials(name: string, firstname?: string | null, lastname?: string | null): string {
  if (firstname && lastname) {
    const f = firstname.trim()[0] ?? ''
    const l = lastname.trim()[0] ?? ''
    if (f && l) return (f + l).toUpperCase()
  }
  return (name ?? '').split(' ').map(w => w[0] ?? '').join('').slice(0, 2).toUpperCase() || '??';
}

function calcAge(dob: string): number {
  if (!dob) return 0;
  return Math.floor((Date.now() - new Date(dob).getTime()) / (1000 * 60 * 60 * 24 * 365.25));
}

// Parse "178 cm" → 178 ou "73 kg" → 73
function parseMeasure(val: string | number | null | undefined): number {
  if (!val) return 0;
  if (typeof val === 'number') return val;
  return parseInt(val.toString().replace(/[^\d]/g, ''), 10) || 0;
}

export function mapPosition(pos: string): 'ATT' | 'MIL' | 'DEF' | 'GK' {
  const p = (pos ?? '').toLowerCase();
  if (p.includes('attack') || p.includes('forward')) return 'ATT';
  if (p.includes('midfiel')) return 'MIL';
  if (p.includes('defend')) return 'DEF';
  if (p.includes('goal')) return 'GK';
  return 'ATT';
}

// ─── Mapper API-Football → Player ────────────────────────────────────────────

// eslint-disable-next-line @typescript-eslint/no-explicit-any
export function mapApiFootballToPlayer(entry: any): Omit<Player, 'created_at' | 'updated_at'> {
  const p    = entry.player ?? entry;
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const stats = (entry.statistics ?? []) as any[];

  // Statistiques de la ligue principale (plus d'apparitions)
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const mainStats = [...stats].sort((a: any, b: any) =>
    (b.games?.appearences ?? 0) - (a.games?.appearences ?? 0)
  )[0] ?? {};

  const dob  = p.birth?.date || null; // null au lieu de '' pour PostgreSQL
  const apiName    = p.name ?? `${p.firstname ?? ''} ${p.lastname ?? ''}`.trim();
  const shortName  = displayName(apiName, p.firstname, p.lastname);

  const slug = buildSlug(apiName, p.id, p.firstname, p.lastname);

  // pass_accuracy peut être "80%" (string) ou 80 (number)
  const passAcc = (() => {
    const raw = mainStats.passes?.accuracy;
    if (!raw) return 0;
    return parseFloat(raw.toString().replace('%', '')) || 0;
  })();

  const m = mainStats.games?.appearences || 1;
  const g90 = (mainStats.goals?.total || 0) / m;
  const a90 = (mainStats.goals?.assists || 0) / m;
  const kp90 = (mainStats.passes?.key || 0) / m;
  const d90 = (mainStats.dribbles?.success || 0) / m;

  return {
    slug,
    name:             shortName || `Player ${p.id}`,
    common_name:      shortName || null,
    team:             mainStats.team?.name || null,
    team_logo_url:    mainStats.team?.logo || null,
    league:           mainStats.league?.name || null,
    league_slug:      slugify(mainStats.league?.name ?? '') || null,
    nationality:      p.nationality || null,
    flag_url:         p.nationality
                        ? `https://media.api-sports.io/flags/${p.nationality.toLowerCase().replace(/\s+/g, '-')}.svg`
                        : null,
    flag_emoji:       null,
    position:         mapPosition(mainStats.games?.position ?? ''),
    position_name:    mainStats.games?.position || null,
    detailed_position: null,
    age:              dob ? calcAge(dob) : (p.age ?? 0),
    date_of_birth:    dob,
    height:           parseMeasure(p.height),
    weight:           parseMeasure(p.weight),
    preferred_foot:   null,
    shirt_number:     mainStats.games?.number ?? 0,
    market_value:     null,
    id:               p.id as number,
    image_url:        p.photo || null,
    season:           String(mainStats.league?.season ?? 2025),
    goals:            mainStats.goals?.total ?? 0,
    assists:          mainStats.goals?.assists ?? 0,
    matches:          mainStats.games?.appearences ?? 0,
    minutes:          mainStats.games?.minutes ?? 0,
    pass_accuracy:    passAcc,
    dribbles:         mainStats.dribbles?.success ?? 0,
    duels_won:        mainStats.duels?.won ?? 0,
    shots_on_target:  mainStats.shots?.on ?? 0,
    yellow_cards:     mainStats.cards?.yellow ?? 0,
    red_cards:        mainStats.cards?.red ?? 0,
    rating:           parseFloat(mainStats.games?.rating ?? '0') || 0,
    xg:               0,
    recent_form:      null,
    initials:         makeInitials(apiName, p.firstname, p.lastname),
    avatar_bg:        'rgba(0,71,130,.12)',
    avatar_color:     '#004782',
    is_featured:      false,
    ai_insight:       null,
    // Radar Metrics Calculation (0-100)
    radar_finish:     Math.min(100, Math.round((Math.min(g90, 0.8) / 0.8 * 60) + ((mainStats.shots?.on || 0) / (mainStats.shots?.total || 1) * 40))),
    radar_dribble:    Math.min(100, Math.round((Math.min(d90, 3) / 3 * 70) + ((mainStats.dribbles?.success || 0) / (mainStats.dribbles?.attempts || 1) * 30))),
    radar_passes:     Math.min(100, Math.round(passAcc)),
    radar_vision:     Math.min(100, Math.round((Math.min(kp90, 2) / 2 * 70) + (passAcc * 0.3))),
    radar_creativity: Math.min(100, Math.round((Math.min(a90, 0.4) / 0.4 * 50) + (Math.min(kp90, 2) / 2 * 50))),
    ai_analysis:      null,
    insight_fr:       null,
    insight_en:       null,
    insight_es:       null,
    trophies_json:    null,
    transfers_json:   null,
  };
}

// ─── Reshape dn_players row → API-Football entry ─────────────────────────────

// eslint-disable-next-line @typescript-eslint/no-explicit-any
export function dnRowToApiEntry(row: any) {
  return {
    player: {
      id:          row.id,
      name:        row.name,
      firstname:   row.firstname,
      lastname:    row.lastname,
      birth: {
        date:    row.birth_date    ?? null,
        place:   row.birth_place   ?? null,
        country: row.birth_country ?? null,
      },
      nationality: row.nationality ?? null,
      height:      row.height ? `${row.height} cm` : null,
      weight:      row.weight ? `${row.weight} kg` : null,
      photo:       row.photo ?? null,
      age:         row.age  ?? null,
    },
    statistics: row.statistics ?? [],
  };
}

// ─── getPlayerBySlug ──────────────────────────────────────────────────────────

export async function getPlayerBySlug(slug: string, locale: string = 'fr'): Promise<Player | null> {
  return cached(
    `player:af:slug:${slug}:${locale}`,
    async () => {
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      let afId: number | null = null;
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      let dnRow: any = null;

      // 1. Slug purement numérique (legacy)
      if (/^\d+$/.test(slug)) {
        afId = parseInt(slug, 10);
        const { data } = await supabaseAdmin.from('dn_players').select('*').eq('id', afId).single();
        dnRow = data;
      }

      // 2. Slug avec ID en fin "nom-prenom-276" (legacy backward-compat)
      if (!dnRow) {
        const idMatch = slug.match(/-(\d+)$/);
        if (idMatch) {
          afId = parseInt(idMatch[1], 10);
          const { data } = await supabaseAdmin.from('dn_players').select('*').eq('id', afId).single();
          dnRow = data;
        }
      }

      // 3. Lookup direct par colonne slug (peuplée lors du sync)
      if (!dnRow) {
        const { data } = await supabaseAdmin.from('dn_players').select('*').eq('slug', slug).single();
        dnRow = data;
        afId = dnRow?.id ?? null;
      }

      if (!afId) return null;

      // 3. Mapper vers Player
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      let playerObj: any;
      if (dnRow) {
        playerObj = mapApiFootballToPlayer(dnRowToApiEntry(dnRow));
        // Enrichissement stocké dans dn_players
        if (dnRow.ai_insight)     playerObj.ai_insight     = dnRow.ai_insight;
        if (dnRow.insight_fr)     playerObj.insight_fr     = dnRow.insight_fr;
        if (dnRow.insight_en)     playerObj.insight_en     = dnRow.insight_en;
        if (dnRow.insight_es)     playerObj.insight_es     = dnRow.insight_es;
        if (dnRow.ai_analysis)    playerObj.ai_analysis    = dnRow.ai_analysis;
        if (dnRow.trophies_json)  playerObj.trophies_json  = dnRow.trophies_json;
        if (dnRow.transfers_json) playerObj.transfers_json = dnRow.transfers_json;
      } else {
        // dn_players pas encore synchronisé → appel direct API
        const profile = await getPlayer(afId, await getCurrentSeason()).catch(() => null);
        if (!profile) return null;
        playerObj = mapApiFootballToPlayer(profile);
      }

      // 4. Trophées + Blessés (on-demand si absents)
      const needsTrophies  = !playerObj.trophies_json;
      const needsSidelined = !playerObj.transfers_json;
      if (needsTrophies || needsSidelined) {
        const { getTrophies, getSidelined } = await import('./apifootball');
        const [trophies, sidelined] = await Promise.all([
          needsTrophies  ? getTrophies({ player: afId }).catch(() => null)  : Promise.resolve(null),
          needsSidelined ? getSidelined({ player: afId }).catch(() => null) : Promise.resolve(null),
        ]);
        if (trophies)  playerObj.trophies_json  = trophies;
        if (sidelined) playerObj.transfers_json = sidelined;
      }

      // 5. Insights multilingues
      const insightKey = locale === 'es' ? 'insight_es' : locale === 'en' ? 'insight_en' : 'insight_fr';
      if (locale === 'fr' && !playerObj.insight_fr && playerObj.ai_insight) {
        playerObj.insight_fr = playerObj.ai_insight;
      }
      if (!playerObj[insightKey]) {
        const { generatePlayerInsight } = await import('./claude');
        const insight = await generatePlayerInsight(playerObj as Player, locale).catch(() => '');
        if (insight) playerObj[insightKey] = insight;
      }
      playerObj.ai_insight = playerObj[insightKey] || playerObj.ai_insight;

      // 6. Persister l'enrichissement dans dn_players
      const updates: Record<string, unknown> = { updated_at: new Date().toISOString() };
      if (playerObj[insightKey])      updates[insightKey]      = playerObj[insightKey];
      if (playerObj.trophies_json)    updates.trophies_json    = playerObj.trophies_json;
      if (playerObj.transfers_json)   updates.transfers_json   = playerObj.transfers_json;
      if (Object.keys(updates).length > 1) {
        await supabaseAdmin.from('dn_players').update(updates).eq('id', afId).then(() => {}, () => {});
      }

      return playerObj as Player;
    },
    TTL.player,
  );
}

// ─── getSimilarPlayers ────────────────────────────────────────────────────────

export async function getSimilarPlayers(playerId: number, limit: number = 4): Promise<Player[]> {
  return cached(
    `players:similar:v4:${playerId}:${limit}`,
    async () => {
      const { data, error } = await supabaseAdmin.rpc('get_similar_players', {
        target_id: playerId,
        limit_count: limit
      });

      if (error) {
        console.error('[Supabase] get_similar_players:', error.message);
        return [];
      }

      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      return (data || []).map((row: any) => 
        mapApiFootballToPlayer(dnRowToApiEntry(row))
      ) as unknown as Player[];
    },
    TTL.player
  );
}

// ─── getComparisonBySlug ──────────────────────────────────────────────────────


export async function getComparisonBySlug(slug: string, locale: string = 'fr') {
  return cached(
    `comparison:af:slug:${slug}:${locale}`,
    async () => {
      const parts = slug.split('-vs-');
      if (parts.length !== 2) return null;

      const [slugA, slugB] = parts;
      const [playerA, playerB] = await Promise.all([
        getPlayerBySlug(slugA, locale),
        getPlayerBySlug(slugB, locale),
      ]);

      if (!playerA || !playerB) return null;

      const canonicalSlug = [playerA.slug, playerB.slug].sort().join('-vs-');

      const { data } = await supabaseAdmin
        .from('comparisons')
        .select('*')
        .eq('slug', canonicalSlug)
        .single();

      const insightKey = locale === 'es' ? 'insight_es' : locale === 'en' ? 'insight_en' : 'insight_fr';

      if (!data) {
        const { generateComparisonInsight } = await import('./claude');
        const insight = await generateComparisonInsight(playerA, playerB, locale).catch(() => '');

        const newComp = {
          slug: canonicalSlug,
          player_a_id: playerA.id,
          player_b_id: playerB.id,
          [insightKey]: insight,
          is_generated: true,
          views: 0,
          is_featured: false,
          created_at: new Date().toISOString(),
          updated_at: new Date().toISOString(),
        };

        const { data: savedComp, error } = await supabaseAdmin
          .from('comparisons')
          .insert(newComp)
          .select('*')
          .single();

        if (error) console.error(`[Supabase] insert comparison ${canonicalSlug}:`, error.message);

        return { ...(savedComp || newComp), player_a: playerA, player_b: playerB };
      }

      if (!data[insightKey]) {
        const { generateComparisonInsight } = await import('./claude');
        const insight = await generateComparisonInsight(playerA, playerB, locale).catch(() => '');
        if (insight) {
          await supabaseAdmin
            .from('comparisons')
            .update({ [insightKey]: insight, updated_at: new Date().toISOString() })
            .eq('slug', canonicalSlug);
          data[insightKey] = insight;
        }
      }

      return { ...data, player_a: playerA, player_b: playerB };
    },
    TTL.comparison,
  );
}

// ─── getFeaturedPlayers ───────────────────────────────────────────────────────

export async function getFeaturedPlayers(): Promise<Player[]> {
  return cached(
    'players:featured',
    async () => {
      const season = await getCurrentSeason();
      const { data } = await supabaseAdmin
        .from('dn_players')
        .select('id, name, firstname, lastname, nationality, photo, age, birth_date, birth_place, birth_country, height, weight, statistics')
        .eq('season', season)
        .limit(200);
      if (!data?.length) return [];
      // Trier par apparitions pour obtenir les joueurs les plus actifs
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      const sorted = [...data].sort((a: any, b: any) =>
        ((b.statistics as any)?.[0]?.games?.appearences ?? 0) -
        ((a.statistics as any)?.[0]?.games?.appearences ?? 0)
      ).slice(0, 10);
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      return sorted.map((row: any) =>
        mapApiFootballToPlayer(dnRowToApiEntry(row)) as unknown as Player
      );
    },
    TTL.player,
  );
}

// ─── getFeaturedComparisons ───────────────────────────────────────────────────

export async function getFeaturedComparisons() {
  return cached(
    'comparisons:featured',
    async () => {
      const { data } = await supabaseAdmin
        .from('comparisons')
        .select('*, player_a:players!player_a_id(*), player_b:players!player_b_id(*)')
        .eq('is_featured', true)
        .order('views', { ascending: false })
        .limit(6);
      return data ?? [];
    },
    TTL.comparison,
  );
}

export async function incrementComparisonViews(slug: string) {
  await supabaseAdmin.rpc('increment_views', { p_slug: slug }).maybeSingle();
}

// ─── getMatchData ─────────────────────────────────────────────────────────────

// ─── getPlayerCareer ──────────────────────────────────────────────────────────

export interface CareerRow {
  season:      string
  team:        string
  team_id:     number | null
  team_logo:   string | null
  competition: string
  matches:     number
  goals:       number
  assists:     number
  rating:      number
  ratingColor: string
  ratingText:  string
}

export async function getPlayerCareer(afId: number): Promise<CareerRow[]> {
  return (await cached(
    `player:career:${afId}`,
    async () => {
      const { afFetch } = await import('./apifootball');

      // 1. Toutes les saisons du joueur
      const seasonsRaw = await afFetch('/players/seasons', { player: afId });
      const years: number[] = ((seasonsRaw?.response ?? []) as number[]).sort((a, b) => b - a);

      if (!years.length) return null; // null = pas mis en cache → on réessaiera

      // 2. Fetch stats pour chaque saison (séquentiel pour ne pas exploser le quota)
      const sleep = (ms: number) => new Promise(r => setTimeout(r, ms));
      const rows: CareerRow[] = [];

      for (const year of years) {
        const res = await afFetch('/players', { id: afId, season: year });
        const statistics: any[] = res?.response?.[0]?.statistics ?? [];

        for (const s of statistics) {
          if (!s.league?.name || !s.team?.name) continue;
          if (!(s.games?.appearences > 0)) continue;

          const rating = parseFloat(s.games?.rating ?? '0') || 0;
          rows.push({
            season:      `${year}/${year + 1}`,
            team:        s.team.name,
            team_id:     s.team.id ?? null,
            team_logo:   s.team.logo ?? null,
            competition: s.league.name,
            matches:     s.games.appearences ?? 0,
            goals:       s.goals?.total      ?? 0,
            assists:     s.goals?.assists     ?? 0,
            rating,
            ratingColor: rating >= 7.5 ? '#eff6ff' : rating >= 6.5 ? '#f8fafc' : rating > 0 ? '#f1f5f9' : '#f8f9fa',
            ratingText:  rating >= 7.5 ? '#1e40af' : rating >= 6.5 ? '#334155' : rating > 0 ? '#64748b' : '#94a3b8',
          });
        }

        await sleep(220); // respect 300 req/min
      }

      return rows.length ? rows : null;
    },
    TTL.career,
  )) ?? [];
}

export async function getMatchData(id: number) {
  return cached(
    `match:af:${id}`,
    async () => {
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      const fixtures = await getFixtures({ id }) as any[] | null;
      const match = fixtures?.[0];
      if (!match) return null;

      return {
        id:           match.fixture.id,
        name:         `${match.teams.home.name} vs ${match.teams.away.name}`,
        date:         match.fixture.date,
        status:       match.fixture.status?.long ?? 'En attente',
        result_info:  match.fixture.status?.short ?? '',
        league:       match.league?.name ?? '',
        league_image: match.league?.logo ?? '',
        team1: {
          id:     match.teams.home.id,
          name:   match.teams.home.name,
          image:  match.teams.home.logo,
          score:  match.goals.home,
          winner: match.teams.home.winner,
        },
        team2: {
          id:     match.teams.away.id,
          name:   match.teams.away.name,
          image:  match.teams.away.logo,
          score:  match.goals.away,
          winner: match.teams.away.winner,
        },
      };
    },
    TTL.comparison,
  );
}
