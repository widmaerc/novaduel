'use server'

import { revalidatePath } from 'next/cache';
import { supabaseAdmin } from '@/lib/supabase';
import { generatePlayerAnalysis } from '@/lib/claude';
import { getTrophies, getSidelined } from '@/lib/apifootball';
import { mapApiFootballToPlayer, dnRowToApiEntry } from '@/lib/data';
import { redis } from '@/lib/redis';

export async function triggerAIAnalysis(playerId: number, locale: string, slug: string) {
  try {
    // 1. Fetch player data from DB
    const { data: row, error: fetchError } = await supabaseAdmin
      .from('dn_players')
      .select('*')
      .eq('id', playerId)
      .single();

    if (fetchError || !row) throw new Error('Player not found');

    // Mapper le row DB en objet Player avec les champs plats attendus par Claude
    const player = mapApiFootballToPlayer(dnRowToApiEntry(row));

    // 2. Generate AI analysis + fetch trophies/sidelined in parallel
    const [analysis, trophies, sidelined] = await Promise.all([
      generatePlayerAnalysis(player, locale),
      !row.trophies_json  ? getTrophies({ player: playerId }).catch(() => null)  : Promise.resolve(null),
      !row.transfers_json ? getSidelined({ player: playerId }).catch(() => null) : Promise.resolve(null),
    ]);

    // 3. Update DB
    const updateData: any = { ai_analysis: analysis };

    if (locale === 'fr') updateData.insight_fr = analysis.insight;
    else if (locale === 'en') updateData.insight_en = analysis.insight;
    else if (locale === 'es') updateData.insight_es = analysis.insight;

    if (trophies)  updateData.trophies_json  = trophies;
    if (sidelined) updateData.transfers_json = sidelined;

    const { error: updateError } = await supabaseAdmin
      .from('dn_players')
      .update(updateData)
      .eq('id', playerId);

    if (updateError) throw updateError;

    // 4. Invalider le cache Redis du joueur puis revalider la page
    await redis.del(`player:af:slug:${slug}:${locale}`).catch(() => {});
    revalidatePath(`/${locale}/player/${slug}`);
    return { success: true };
  } catch (err) {
    console.error('Trigger AI Analysis Error:', err);
    return { success: false, error: String(err) };
  }
}
