import dotenv from 'dotenv';
dotenv.config({ path: '.env.local' });
import { supabaseAdmin } from '../src/lib/supabase';
import { buildSlug } from '../src/lib/data';

async function migrate() {
  console.log('🚀 Démarrage de la migration des slugs (SEO Mode)...');

  // 1. Récupérer TOUS les joueurs de dn_players (Pagination)
  const allPlayers = [];
  let from = 0;
  const step = 1000;
  let hasMore = true;

  while (hasMore) {
    const { data: chunk, error } = await supabaseAdmin
      .from('dn_players')
      .select('id, name, firstname, lastname, season')
      .range(from, from + step - 1);
    
    if (error) {
      console.error('❌ Erreur lors de la récupération des joueurs:', error);
      return;
    }
    
    if (!chunk || chunk.length === 0) {
      hasMore = false;
    } else {
      allPlayers.push(...chunk);
      from += step;
    }
  }

  console.log(`📦 ${allPlayers.length} joueurs à traiter dans dn_players.`);

  // 2. Calculer les nouveaux slugs et gérer les doublons
  const usedSlugs = new Set<string>();
  const updates: { id: number; slug: string; name: string; season: number }[] = [];

  for (const p of allPlayers) {
    let baseSlug = buildSlug(p.name, p.id, p.firstname, p.lastname);
    let finalSlug = baseSlug;
    let counter = 1;

    while (usedSlugs.has(finalSlug)) {
      finalSlug = `${baseSlug}-${counter}`;
      counter++;
    }

    usedSlugs.add(finalSlug);
    updates.push({ id: p.id, slug: finalSlug, name: p.name, season: p.season });
  }

  // 3. Mise à jour groupée dn_players (par lots de 100)
  console.log('📝 Mise à jour des slugs dans dn_players...');
  for (let i = 0; i < updates.length; i += 100) {
    const chunk = updates.slice(i, i + 100);
    const { error: upError } = await supabaseAdmin
      .from('dn_players')
      .upsert(chunk, { onConflict: 'id' });

    if (upError) console.error(`❌ Erreur lot dn_players ${i}:`, upError.message);
    else process.stdout.write('.');
  }
  console.log('\n✅ dn_players mis à jour.');

  // 4. Propagation vers la table "players" (stats)
  // On extrait l'ID API de la fin de l'ancien slug pour faire le lien
  console.log('📊 Propagation vers la table "players" (stats)...');
  
  const statsRows = [];
  let sFrom = 0;
  let sHasMore = true;

  while (sHasMore) {
    const { data: sChunk, error: sError } = await supabaseAdmin
      .from('players')
      .select('id, slug')
      .range(sFrom, sFrom + step - 1);
    
    if (sError) {
      console.error('❌ Erreur stats:', sError);
      return;
    }

    if (!sChunk || sChunk.length === 0) {
      sHasMore = false;
    } else {
      statsRows.push(...sChunk);
      sFrom += step;
    }
  }

  const slugMap = new Map(updates.map(u => [u.id, u.slug]));
  const statsUpdates: { id: number; slug: string }[] = [];

  for (const row of statsRows) {
    const idMatch = row.slug?.match(/-(\d+)$/);
    if (idMatch) {
      const afId = parseInt(idMatch[1], 10);
      const newSlug = slugMap.get(afId);
      if (newSlug) {
        statsUpdates.push({ id: row.id, slug: newSlug });
      }
    }
  }

  // Mise à jour groupée table stats (par lots de 100)
  console.log(`📝 Mise à jour de ${statsUpdates.length} records dans la table stats...`);
  for (let i = 0; i < statsUpdates.length; i += 100) {
    const chunk = statsUpdates.slice(i, i + 100);
    const { error: sUpError } = await supabaseAdmin
      .from('players')
      .upsert(chunk, { onConflict: 'id' });

    if (sUpError) console.error(`❌ Erreur lot stats ${i}:`, sUpError.message);
    else process.stdout.write('.');
  }

  console.log(`\n✅ ${statsUpdates.length} records mis à jour.`);
}

migrate();
