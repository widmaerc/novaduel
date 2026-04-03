'use server'

import { revalidatePath } from 'next/cache';
import { supabase } from '@/lib/supabase';
import { generatePlayerAnalysis } from '@/lib/claude';

export async function triggerAIAnalysis(playerId: number, locale: string, slug: string) {
  try {
    // 1. Fetch player data from DB
    const { data: player, error: fetchError } = await supabase
      .from('dn_players')
      .select('*')
      .eq('id', playerId)
      .single();

    if (fetchError || !player) throw new Error('Player not found');

    // 2. Generate Analysis
    // We map the row to what generatePlayerAnalysis expects (simplistic mapping here)
    const analysis = await generatePlayerAnalysis(player as any, locale);

    // 3. Update DB
    const updateData: any = {
      ai_analysis: analysis // Always update structured data
    };
    
    // Map insight to the correct language column
    if (locale === 'fr') updateData.insight_fr = analysis.insight;
    else if (locale === 'en') updateData.insight_en = analysis.insight;
    else if (locale === 'es') updateData.insight_es = analysis.insight;

    const { error: updateError } = await supabase
      .from('dn_players')
      .update(updateData)
      .eq('id', playerId);

    if (updateError) throw updateError;

    // 4. Revalidate
    revalidatePath(`/${locale}/player/${slug}`);
    return { success: true };
  } catch (err) {
    console.error('Trigger AI Analysis Error:', err);
    return { success: false, error: String(err) };
  }
}
