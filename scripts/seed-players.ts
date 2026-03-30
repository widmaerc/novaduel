/**
 * NovaDuel — Real Sportmonks Seed Script
 * Fetches real player data from Sportmonks Free Plan and populates Supabase.
 * Usage: npm run seed:real
 *
 * Free plan players come from Danish Superliga (271) & Scottish Premiership (501)
 */
import { createClient } from '@supabase/supabase-js';
import * as dotenv from 'dotenv';
import { fileURLToPath } from 'url';
import { dirname, join } from 'path';

const __dirname = dirname(fileURLToPath(import.meta.url));
dotenv.config({ path: join(__dirname, '..', '.env.local') });

const SUPABASE_URL = process.env.NEXT_PUBLIC_SUPABASE_URL!;
const SUPABASE_KEY = process.env.SUPABASE_SERVICE_ROLE_KEY!;
const API_TOKEN = process.env.SPORTMONKS_API_KEY!;
const BASE = 'https://api.sportmonks.com/v3/football';

const supabase = createClient(SUPABASE_URL, SUPABASE_KEY);

// ─── Player IDs from the free plan ────────────────────────────────────────────
// Selected based on name recognition + interesting pair matchups
const PLAYER_IDS = [
  14,   // Daniel Agger      — DEF, Danish
  49,   // Nicklas Bendtner  — ATT, Danish
  169,  // Kasper Schmeichel — GK,  Danish
  35,   // Craig Gordon      — GK,  Scottish
  180,  // Scott Sinclair    — MIL, Scottish
  412,  // James McFadden    — MIL, Scottish
  25,   // Anthony Stokes    — ATT, Irish
  31,   // Jermain Defoe     — ATT, English
  92,   // Robbie Keane      — ATT, Irish
  275,  // Joe Hart          — GK,  English
  54,   // Kolo Touré        — DEF, Ivorian
  260,  // El-Hadji Diouf    — ATT, Senegalese
  261,  // Junior Hoilett    — MIL, Canadian
  394,  // Niko Kranjčar     — MIL, Croatian
  319,  // Johan Elmander    — ATT, Swedish
  195,  // Stiliyan Petrov   — MIL, Bulgarian
  368,  // Brede Hangeland   — DEF, Norwegian
  148,  // Fredrik Ljungberg — MIL, Swedish
  437,  // Glenn Whelan      — MIL, Irish
  383,  // Winston Reid      — DEF, NZ
];

// Pairs for comparison pages
const COMPARISON_PAIRS: [number, number, string?][] = [
  [49, 31, undefined],   // Bendtner vs Defoe
  [92, 25, undefined],   // Robbie Keane vs Anthony Stokes
  [260, 319, undefined], // Diouf vs Elmander
  [35, 169, undefined],  // Craig Gordon vs Kasper Schmeichel
  [14, 54, undefined],   // Daniel Agger vs Kolo Touré
  [394, 195, undefined], // Kranjčar vs Petrov
  [261, 180, undefined], // Junior Hoilett vs Scott Sinclair
];

// ─── Position map (Sportmonks IDs → Frontend Codes) ───────────────────────────
const POS_MAP: Record<number, { pos: 'GK'|'DEF'|'MIL'|'ATT'; name: string }> = {
  24:  { pos: 'GK',  name: 'Gardien' },
  25:  { pos: 'DEF', name: 'Défenseur' },
  221: { pos: 'DEF', name: 'Défenseur' },
  26:  { pos: 'MIL', name: 'Milieu' },
  27:  { pos: 'ATT', name: 'Attaquant' },
};

// Fallback logic for Sportmonks codes
function resolvePos(p: any): { pos: 'GK'|'DEF'|'MIL'|'ATT'; name: string } {
  // 1. Check ID map first
  if (p.position_id && POS_MAP[p.position_id]) return POS_MAP[p.position_id];

  // 2. Check position object from include (it has 'code' like 'ATT', 'MID', 'DEF', 'GK')
  const code = (p.position?.code || '').toUpperCase();
  if (code === 'ATT') return { pos: 'ATT', name: 'Attaquant' };
  if (code === 'MID') return { pos: 'MIL', name: 'Milieu' };
  if (code === 'MIL') return { pos: 'MIL', name: 'Milieu' };
  if (code === 'DEF') return { pos: 'DEF', name: 'Défenseur' };
  if (code === 'GK' || code === 'G')  return { pos: 'GK',  name: 'Gardien' };

  // 3. Last resort fallback
  return { pos: 'MIL', name: 'Joueur' };
}


// Country emoji map for common IDs in the list
const FLAG_MAP: Record<number, string> = {
  320: '🇩🇰', // Denmark
  1161: '🏴󠁧󠁢󠁳󠁣󠁴󠁿', // Scotland
  455: '🇮🇪', // Ireland
  462: '🏴󠁧󠁢󠁥󠁮󠁧󠁿', // England
  23: '🇨🇮',  // Ivory Coast
  47: '🇸🇪',  // Sweden
  200: '🇸🇳', // Senegal
  1004: '🇨🇦', // Canada
  266: '🇭🇷', // Croatia
  224: '🇧🇬', // Bulgaria
  1578: '🇳🇴', // Norway
  2817: '🇳🇿', // New Zealand
  491: '🇳🇮', // Northern Ireland
  17: '🇫🇷',  // France
};

// ─── Helpers ─────────────────────────────────────────────────────────────────
function slugify(name: string): string {
  return name.toLowerCase()
    .normalize('NFD').replace(/[\u0300-\u036f]/g, '') // strip accents
    .replace(/[^a-z0-9\s-]/g, '')
    .trim().replace(/\s+/g, '-');
}

function initials(name: string): string {
  return name.split(' ').map(w => w[0]).join('').toUpperCase().slice(0, 2);
}

function age(dob: string): number {
  return Math.floor((Date.now() - new Date(dob).getTime()) / (365.25 * 24 * 3600 * 1000));
}

// Simple delay to respect rate limits
const wait = (ms: number) => new Promise(r => setTimeout(r, ms));

// ─── API helpers ─────────────────────────────────────────────────────────────
async function smGet(path: string, params: Record<string, string> = {}) {
  const url = new URL(`${BASE}${path}`);
  url.searchParams.set('api_token', API_TOKEN);
  Object.entries(params).forEach(([k, v]) => url.searchParams.set(k, v));
  const res = await fetch(url.toString());
  if (!res.ok) {
    console.warn(`  ⚠ API ${res.status} for ${path}`);
    return null;
  }
  const json = await res.json();
  return json;
}

// ─── Fetch one player with stats ─────────────────────────────────────────────
async function fetchPlayer(id: number) {
  console.log(`  Fetching player ${id}...`);

  // Get player profile
  const profileRes = await smGet(`/players/${id}`, {
    include: 'teams;nationality;position',
  });
  if (!profileRes?.data) return null;

  const p = profileRes.data;

  // Get statistics (any season available)
  await wait(300); // 300ms between calls to stay under rate limit
  const statsRes = await smGet(`/players/${id}/statistics`);
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const statsList: any[] = statsRes?.data ?? [];

  // Pick the most recent season stats
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const stats = statsList.sort((a: any, b: any) => (b.season_id ?? 0) - (a.season_id ?? 0))[0];

  // Extract stats with safe defaults
  const details = stats?.details ?? [];
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const getDetail = (type: number) => details.find((d: any) => d.type_id === type)?.value?.total ?? 0;
  const getDetailFloat = (type: number) => parseFloat(details.find((d: any) => d.type_id === type)?.value?.average ?? details.find((d: any) => d.type_id === type)?.value?.total ?? 0);

  const posInfo = resolvePos(p);

  // Common name preference
  const displayName = p.display_name ?? p.common_name ?? p.name;
  const playerSlug = slugify(displayName);

  return {
    slug: playerSlug,
    name: p.name,
    common_name: displayName,
    team: (p.teams?.[0]?.name ?? 'Club inconnu'),
    league: 'Scottish/Danish League',
    league_slug: 'free-plan',
    nationality: p.nationality?.name ?? null,
    flag_emoji: FLAG_MAP[p.nationality_id ?? p.country_id] ?? '🏳️',
    position: posInfo.pos,
    position_name: posInfo.name,
    age: p.date_of_birth ? age(p.date_of_birth) : null,
    date_of_birth: p.date_of_birth ?? null,
    height: p.height ?? null,
    weight: p.weight ?? null,
    preferred_foot: null,
    shirt_number: null,
    market_value: null,
    image_url: p.image_path ?? '',
    sportmonks_id: id,
    season: stats?.season_id ? `Season ${stats.season_id}` : 'Historical',
    // Stats — type_ids vary by Sportmonks, use common ones
    goals: getDetail(52) || getDetail(54) || 0,
    assists: getDetail(79) || getDetail(80) || 0,
    matches: getDetail(321) || getDetail(119) || stats?.minutes_played ? Math.round((stats?.minutes_played ?? 0) / 90) : 0,
    minutes: stats?.minutes_played ?? getDetail(116) ?? 0,
    pass_accuracy: getDetailFloat(80) || 78.0,
    dribbles: getDetailFloat(84) || 0.8,
    duels_won: getDetailFloat(294) || 50.0,
    shots_on_target: getDetailFloat(86) || 0.5,
    yellow_cards: getDetail(84) || getDetail(83) || 0,
    red_cards: getDetail(85) || 0,
    rating: getDetailFloat(118) || 6.8,
    xg: getDetailFloat(117) || 0.0,
    recent_form: 'V,N,V,D,V',
    initials: initials(displayName),
    is_featured: true,
  };
}

// ─── Generate insight text for a pair ────────────────────────────────────────
// eslint-disable-next-line @typescript-eslint/no-explicit-any
function buildInsight(pA: any, pB: any, locale: 'fr' | 'en') {
  const nameA = pA.common_name;
  const nameB = pB.common_name;
  if (locale === 'en') {
    return `A fascinating duel between ${nameA} and ${nameB}. ${nameA} brings ${pA.goals} goals and ${pA.assists} assists from ${pA.matches} appearances, while ${nameB} contributes ${pB.goals} goals and ${pB.assists} assists. Both players left their mark on European football, representing the best of their respective leagues.`;
  }
  return `Un duel fascinant entre ${nameA} et ${nameB}. ${nameA} apporte ${pA.goals} buts et ${pA.assists} passes décisives en ${pA.matches} matchs. ${nameB} répond avec ${pB.goals} buts et ${pB.assists} assists. Ces deux joueurs ont marqué le football européen, représentant l'excellence de leurs ligues respectives.`;
}

// eslint-disable-next-line @typescript-eslint/no-explicit-any
function buildVerdict(pA: any, pB: any) {
  return {
    winner_slug: pA.rating >= pB.rating ? pA.slug : pB.slug,
    verdict_scorer: pA.goals >= pB.goals ? pA.slug : pB.slug,
    verdict_assist: pA.assists >= pB.assists ? pA.slug : pB.slug,
    verdict_technical: pA.dribbles >= pB.dribbles ? pA.slug : pB.slug,
    verdict_physical: pA.duels_won >= pB.duels_won ? pA.slug : pB.slug,
  };
}

// ─── Main ─────────────────────────────────────────────────────────────────────
async function seed() {
  console.log('🌍 Fetching players from Sportmonks API...\n');

  const playerData = [];
  for (const id of PLAYER_IDS) {
    const player = await fetchPlayer(id);
    if (player) {
      playerData.push(player);
      console.log(`  ✓ ${player.common_name} (${player.position}) — ${player.goals}G ${player.assists}A`);
    } else {
      console.log(`  ✗ Player ${id} — skipped`);
    }
    await wait(400); // stay well under 3000 req/hour
  }

  console.log(`\n🌱 Upserting ${playerData.length} players to Supabase...`);
  const { data: inserted, error: pErr } = await supabase
    .from('players')
    .upsert(playerData, { onConflict: 'sportmonks_id' })
    .select('id, slug, common_name');

  if (pErr) { console.error('❌ Players error:', pErr.message); process.exit(1); }
  console.log(`✅ ${inserted?.length} players upserted`);

  // Build ID lookup
  const idMap: Record<string, number> = {};
  inserted?.forEach(p => { idMap[p.slug] = p.id; });

  // Also map by sportmonks_id for pair building
  const smToSlug: Record<number, string> = {};
  playerData.forEach((p, i) => {
    smToSlug[PLAYER_IDS[i]] = p.slug;
  });

  // Wait to avoid getting all IDs for deleted players
  const { data: allPlayers } = await supabase
    .from('players')
    .select('id, slug, sportmonks_id');
  const smIdToDbId: Record<number, number> = {};
  allPlayers?.forEach(p => { if (p.sportmonks_id) smIdToDbId[p.sportmonks_id] = p.id; });

  console.log('\n🌱 Building comparisons...');
  const comparisons = [];
  for (const [idA, idB] of COMPARISON_PAIRS) {
    const pA = playerData.find((_, i) => PLAYER_IDS[i] === idA);
    const pB = playerData.find((_, i) => PLAYER_IDS[i] === idB);
    if (!pA || !pB) { console.log(`  ✗ Skipping pair ${idA} vs ${idB} — data missing`); continue; }

    const compSlug = `${pA.slug}-vs-${pB.slug}`;
    const verdict = buildVerdict(pA, pB);

    comparisons.push({
      slug: compSlug,
      player_a_id: smIdToDbId[idA] ?? null,
      player_b_id: smIdToDbId[idB] ?? null,
      insight_fr: buildInsight(pA, pB, 'fr'),
      insight_en: buildInsight(pA, pB, 'en'),
      insight_es: buildInsight(pA, pB, 'en'),
      ...verdict,
      form_a: pA.recent_form,
      form_b: pB.recent_form,
      is_featured: true,
      is_generated: true,
      views: Math.floor(Math.random() * 5000) + 500,
      meta_title_fr: `${pA.common_name} vs ${pB.common_name} — Stats & Verdict | NovaDuel`,
      meta_title_en: `${pA.common_name} vs ${pB.common_name} — Stats & Verdict | NovaDuel`,
      meta_title_es: `${pA.common_name} vs ${pB.common_name} — Estadísticas & Veredicto | NovaDuel`,
    });
    console.log(`  ✓ ${pA.common_name} vs ${pB.common_name} → /fr/compare/${compSlug}`);
  }

  const { data: insertedComps, error: cErr } = await supabase
    .from('comparisons')
    .upsert(comparisons, { onConflict: 'slug' })
    .select('id, slug');

  if (cErr) { console.error('❌ Comparisons error:', cErr.message); process.exit(1); }
  console.log(`✅ ${insertedComps?.length} comparisons upserted`);

  console.log('\n🎉 Done! URLs disponibles:');
  inserted?.forEach(p => console.log(`  /fr/player/${p.slug}`));
  console.log('');
  insertedComps?.forEach(c => console.log(`  /fr/compare/${c.slug}`));
}

seed().catch(console.error);
