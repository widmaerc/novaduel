/**
 * NovaDuel — Mise à jour automatique des comparaisons populaires via SerpAPI
 *
 * Stratégie :
 * 1. Récupère tous les joueurs de dn_players
 * 2. Interroge SerpAPI Google Trends par batches de 4 + 1 référence
 * 3. Normalise les scores entre batches via le joueur de référence
 * 4. Classe les joueurs, génère les meilleures paires
 * 5. Écrit data/top-comparisons.json
 *
 * Usage :
 *   npx tsx --env-file=.env.local scripts/update-top-comparisons.ts
 *
 * Variables d'environnement requises :
 *   SERPAPI_KEY — clé API depuis serpapi.com/manage-api-key
 *
 * Coût : ~20 requêtes/run sur les 250/mois du free tier
 */
import './env';
import fs from 'fs';
import path from 'path';
import { supabaseAdmin } from '../src/lib/supabase';

// ── Config ────────────────────────────────────────────────────────────────────

const TOP_PLAYERS_COUNT = 25; // joueurs à conserver dans top_players
const TOP_PAIRS_COUNT   = 50; // paires à conserver dans top_comparisons
const BATCH_SIZE        = 4;  // keywords par batch (+ 1 référence = 5 max Google Trends)
const REFERENCE_KEYWORD = 'lionel messi'; // référence de normalisation inter-batches
const REFERENCE_SLUG    = 'lionel-messi';

const CANDIDATE_COUNT = 60; // joueurs pré-filtrés par rating avant envoi à SerpAPI

const SERPAPI_KEY = process.env.SERPAPI_KEY!;

const wait = (ms: number) => new Promise(r => setTimeout(r, ms));

// ── SerpAPI helpers ───────────────────────────────────────────────────────────

interface TrendsItem {
  keyword: string;
  values: { date: string; value: number }[];
}

async function queryGoogleTrends(keywords: string[]): Promise<TrendsItem[]> {
  const params = new URLSearchParams({
    engine: 'google_trends',
    q: keywords.join(','),
    date: 'today 3-m', // 3 derniers mois
    hl: 'en',
    api_key: SERPAPI_KEY,
  });

  const res = await fetch(`https://serpapi.com/search?${params}`);

  if (!res.ok) {
    throw new Error(`SerpAPI HTTP ${res.status}: ${await res.text()}`);
  }

  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const json: any = await res.json();

  if (json.error) {
    throw new Error(`SerpAPI error: ${json.error}`);
  }

  // Mapper interest_over_time.timeline_data → TrendsItem[]
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const timeline: any[] = json?.interest_over_time?.timeline_data ?? [];

  // Construire une map keyword → valeurs
  const kwMap = new Map<string, number[]>();
  for (const keyword of keywords) {
    kwMap.set(keyword, []);
  }

  for (const point of timeline) {
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    for (const v of point.values ?? []) {
      const kw = v.query as string;
      const val = typeof v.extracted_value === 'number' ? v.extracted_value : parseInt(v.value ?? '0', 10);
      if (kwMap.has(kw)) {
        kwMap.get(kw)!.push(val);
      }
    }
  }

  return [...kwMap.entries()].map(([keyword, vals]) => ({
    keyword,
    values: vals.map((value, i) => ({ date: String(i), value })),
  }));
}

function avgScore(item: TrendsItem): number {
  if (!item.values.length) return 0;
  return item.values.reduce((s, v) => s + v.value, 0) / item.values.length;
}

// ── Slug ↔ keyword mapping ────────────────────────────────────────────────────

function stripAccents(str: string): string {
  return str.normalize('NFD').replace(/[\u0300-\u036f]/g, '');
}

function buildKeyword(
  name: string,
  firstname: string | null,
  lastname: string | null,
): string {
  // Name complet (pas d'abréviation) → on l'utilise directement
  if (!name.includes('.')) {
    const keyword = stripAccents(name.trim()).toLowerCase();
    // Si mononym (ex: "Antony", "Malcom") → ajouter le premier mot du lastname pour désambiguïser
    if (!keyword.includes(' ') && lastname) {
      const lastFirst = lastname.trim().split(/\s+/)[0];
      if (lastFirst) return `${keyword} ${stripAccents(lastFirst).toLowerCase()}`;
    }
    return keyword;
  }

  // Name abrégé (ex: "L. Messi") → trouver le prénom qui commence par la bonne lettre
  if (firstname) {
    const abbrevLetter = name.trim()[0]?.toUpperCase();
    const matchingFirst = firstname.trim().split(/[\s-]+/)
      .find(w => w[0]?.toUpperCase() === abbrevLetter);
    if (matchingFirst) {
      const expanded = name.replace(/^\S+\.\s*/, `${matchingFirst} `).trim();
      return stripAccents(expanded).toLowerCase();
    }
  }

  // Fallback : name nettoyé
  return stripAccents(name.replace(/\./g, '').trim()).toLowerCase();
}

// ── Main ──────────────────────────────────────────────────────────────────────

async function main() {
  if (!SERPAPI_KEY) {
    console.error('❌ SERPAPI_KEY requis dans .env.local');
    process.exit(1);
  }

  // 1. Charger les joueurs depuis Supabase via RPC SQL filtré
  console.log('📥 Chargement des candidats depuis Supabase...');
  const { data: rows, error } = await supabaseAdmin.rpc('get_trend_players');

  if (error) {
    console.error('❌ Erreur Supabase RPC:', error.message);
    process.exit(1);
  }

  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const players = (rows as any[])
    .filter((r: any) => r.slug && r.slug !== REFERENCE_SLUG)
    .map((r: any) => ({
      slug:    r.slug as string,
      keyword: buildKeyword(r.name, r.firstname, r.lastname),
    }))
    .filter((p: any) => p.keyword.split(' ').every((w: string) => w.length >= 3)) // exclut les mots trop courts (van, de, da...)
    .slice(0, CANDIDATE_COUNT);

  // Ajouter la référence si absente
  if (!players.find((p: any) => p.slug === REFERENCE_SLUG)) {
    players.unshift({ slug: REFERENCE_SLUG, keyword: REFERENCE_KEYWORD });
  }

  console.log(`✓ ${players.length} joueurs candidats\n`);

  // 2. Calibrage référence
  const scores = new Map<string, number>();
  let refScore = 0;

  console.log(`📡 Calibrage référence: "${REFERENCE_KEYWORD}"...`);
  const refItems = await queryGoogleTrends([REFERENCE_KEYWORD]);
  const refItem  = refItems.find(i => i.keyword === REFERENCE_KEYWORD);
  refScore = refItem ? avgScore(refItem) : 50;
  scores.set(REFERENCE_SLUG, 100);
  console.log(`   Score brut référence: ${refScore.toFixed(1)}\n`);

  // 3. Batches de 4 + référence
  const nonRef = players.filter(p => p.slug !== REFERENCE_SLUG);
  const batches: typeof players[] = [];
  for (let i = 0; i < nonRef.length; i += BATCH_SIZE) {
    batches.push(nonRef.slice(i, i + BATCH_SIZE));
  }

  for (let bi = 0; bi < batches.length; bi++) {
    const batch = batches[bi];
    const kwds  = [REFERENCE_KEYWORD, ...batch.map(p => p.keyword)];

    process.stdout.write(`📡 Batch ${bi + 1}/${batches.length}: ${batch.map(p => p.keyword).join(', ')} ... `);

    let items: TrendsItem[] = [];
    try {
      items = await queryGoogleTrends(kwds);
    } catch (err) {
      console.log(`⚠ erreur: ${err}`);
      await wait(3000);
      continue;
    }

    const batchRef      = items.find(i => i.keyword === REFERENCE_KEYWORD);
    const batchRefScore = batchRef ? avgScore(batchRef) : refScore;
    const normFactor    = batchRefScore > 0 ? (refScore / batchRefScore) : 1;

    for (const p of batch) {
      const item = items.find(i => i.keyword === p.keyword);
      if (item) {
        scores.set(p.slug, Math.round(avgScore(item) * normFactor));
      }
    }

    console.log(`✓`);
    await wait(1200); // éviter le rate limit SerpAPI
  }

  // 4. Classer les joueurs
  const ranked = [...scores.entries()]
    .sort((a, b) => b[1] - a[1])
    .slice(0, TOP_PLAYERS_COUNT);

  const topSlugs = ranked.map(([slug]) => slug);

  console.log('\n🏆 Top joueurs:');
  ranked.forEach(([slug, score], i) => {
    console.log(`   ${String(i + 1).padStart(2)}. ${slug.padEnd(30)} ${score}`);
  });

  // 5. Générer les meilleures paires
  const pairs: { slugA: string; slugB: string; score: number }[] = [];
  for (let i = 0; i < topSlugs.length; i++) {
    for (let j = i + 1; j < topSlugs.length; j++) {
      const a = topSlugs[i];
      const b = topSlugs[j];
      const [sA, sB] = [[a, b].sort()[0], [a, b].sort()[1]];
      pairs.push({
        slugA: sA,
        slugB: sB,
        score: (scores.get(a) ?? 0) * (scores.get(b) ?? 0),
      });
    }
  }

  pairs.sort((a, b) => b.score - a.score);
  const topPairs = pairs.slice(0, TOP_PAIRS_COUNT).map(p => [p.slugA, p.slugB] as [string, string]);

  // 6. Écrire le JSON
  const now = new Date();
  const lastUpdated = now.toISOString().replace('T', ' ').slice(0, 16) + ' UTC';
  const dateFrom = new Date(Date.now() - 90 * 24 * 60 * 60 * 1000).toISOString().slice(0, 10);
  const dateTo   = now.toISOString().slice(0, 10);

  const output = {
    _comment: `Généré automatiquement par update-top-comparisons.ts via SerpAPI Google Trends (${dateFrom} → ${dateTo}).`,
    last_updated: `last update ${lastUpdated}`,
    top_players: topSlugs,
    top_comparisons: topPairs,
  };

  const outPath = path.resolve(process.cwd(), 'data', 'top-comparisons.json');
  fs.writeFileSync(outPath, JSON.stringify(output, null, 2));

  console.log(`\n✅ ${outPath} mis à jour`);
  console.log(`   ${topSlugs.length} joueurs | ${topPairs.length} paires\n`);
  process.exit(0);
}

main().catch(err => {
  console.error('Erreur fatale:', err);
  process.exit(1);
});
