/**
 * NovaDuel — Pré-chauffe des comparaisons populaires
 *
 * Lit data/top-comparisons.json, crée les entrées manquantes dans `comparisons`
 * et génère les insights IA (fr/en/es) pour chaque paire.
 *
 * Usage :
 *   npx tsx --env-file=.env.local scripts/seed-comparisons.ts
 *
 * Options :
 *   --dry-run   : affiche les paires sans écrire en base
 *   --no-ai     : crée les comparaisons sans générer les insights
 */
import './env';
import fs from 'fs';
import path from 'path';
import { supabaseAdmin } from '../src/lib/supabase';
import { getPlayerBySlug } from '../src/lib/data';
import { generateComparisonInsight } from '../src/lib/claude';

const DRY_RUN = process.argv.includes('--dry-run');
const NO_AI   = process.argv.includes('--no-ai');
const SLEEP_MS = 2000; // entre chaque appel AI pour éviter le rate-limit

const wait = (ms: number) => new Promise(r => setTimeout(r, ms));

function canonicalSlug(slugA: string, slugB: string): string {
  return [slugA, slugB].sort().join('-vs-');
}

async function getExistingComparison(slug: string) {
  const { data } = await supabaseAdmin
    .from('comparisons')
    .select('id, slug, insight_fr, insight_en, insight_es, player_a_id, player_b_id')
    .eq('slug', slug)
    .single();
  return data;
}

async function upsertComparison(slug: string, playerAId: number, playerBId: number) {
  const now = new Date().toISOString();
  const { data, error } = await supabaseAdmin
    .from('comparisons')
    .upsert(
      {
        slug,
        player_a_id: playerAId,
        player_b_id: playerBId,
        is_generated: true,
        is_featured: false,
        views: 0,
        created_at: now,
        updated_at: now,
      },
      { onConflict: 'slug', ignoreDuplicates: true },
    )
    .select('id, slug')
    .single();

  if (error) console.error(`  [supabase] upsert error for ${slug}:`, error.message);
  return data;
}

async function saveInsights(slug: string, insights: { fr?: string; en?: string; es?: string }) {
  const updates: Record<string, string> = { updated_at: new Date().toISOString() };
  if (insights.fr) updates.insight_fr = insights.fr;
  if (insights.en) updates.insight_en = insights.en;
  if (insights.es) updates.insight_es = insights.es;

  const { error } = await supabaseAdmin
    .from('comparisons')
    .update(updates)
    .eq('slug', slug);

  if (error) console.error(`  [supabase] update insights error for ${slug}:`, error.message);
}

async function main() {
  const jsonPath = path.resolve(process.cwd(), 'data', 'top-comparisons.json');
  const raw = JSON.parse(fs.readFileSync(jsonPath, 'utf-8')) as {
    top_comparisons: [string, string][];
  };

  const pairs = raw.top_comparisons;
  console.log(`\n▶ ${pairs.length} comparaisons à traiter${DRY_RUN ? ' (dry-run)' : ''}${NO_AI ? ' (sans IA)' : ''}\n`);

  let created = 0;
  let skipped = 0;
  let insightsGenerated = 0;
  let notFound = 0;

  for (let i = 0; i < pairs.length; i++) {
    const [slugA, slugB] = pairs[i];
    const slug = canonicalSlug(slugA, slugB);

    process.stdout.write(`[${String(i + 1).padStart(2)}/${pairs.length}] ${slug} ... `);

    // 1. Chercher les deux joueurs
    const [playerA, playerB] = await Promise.all([
      getPlayerBySlug(slugA, 'fr').catch(() => null),
      getPlayerBySlug(slugB, 'fr').catch(() => null),
    ]);

    if (!playerA || !playerB) {
      const missing = [!playerA && slugA, !playerB && slugB].filter(Boolean).join(', ');
      console.log(`⚠ joueur(s) introuvable(s): ${missing}`);
      notFound++;
      continue;
    }

    if (DRY_RUN) {
      console.log(`✓ ${playerA.name} vs ${playerB.name} (dry-run)`);
      continue;
    }

    // 2. Vérifier si la comparaison existe déjà
    let existing = await getExistingComparison(slug);

    if (!existing) {
      const inserted = await upsertComparison(slug, playerA.id!, playerB.id!);
      if (inserted) {
        created++;
        existing = await getExistingComparison(slug);
      }
    }

    if (NO_AI) {
      console.log(`✓ créée (sans IA)`);
      continue;
    }

    // 3. Générer les insights manquants
    const needFr = !existing?.insight_fr;
    const needEn = !existing?.insight_en;
    const needEs = !existing?.insight_es;

    if (!needFr && !needEn && !needEs) {
      console.log(`✓ insights déjà présents`);
      skipped++;
      continue;
    }

    const insights: { fr?: string; en?: string; es?: string } = {};

    const locales: Array<['fr' | 'en' | 'es', boolean]> = [
      ['fr', needFr],
      ['en', needEn],
      ['es', needEs],
    ];

    for (const [locale, needed] of locales) {
      if (!needed) continue;
      try {
        await wait(SLEEP_MS);
        insights[locale] = await generateComparisonInsight(playerA, playerB, locale);
        insightsGenerated++;
      } catch (err) {
        console.error(`\n  [claude] erreur insight ${locale}:`, err);
      }
    }

    await saveInsights(slug, insights);

    const generated = Object.keys(insights).join('/');
    console.log(`✓ ${playerA.name} vs ${playerB.name} — insights générés: ${generated || 'aucun'}`);
  }

  console.log(`
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
✅ Terminé
   Comparaisons créées    : ${created}
   Insights générés       : ${insightsGenerated}
   Déjà complets (skip)   : ${skipped}
   Joueurs introuvables   : ${notFound}
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
`);
  process.exit(0);
}

main().catch(err => {
  console.error('Erreur fatale:', err);
  process.exit(1);
});
