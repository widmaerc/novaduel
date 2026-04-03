'use server'

import { revalidatePath } from 'next/cache';
import { supabaseAdmin } from '@/lib/supabase';
import { generateComparisonInsight } from '@/lib/claude';
import { redis } from '@/lib/redis';
import { getPlayerBySlug } from '@/lib/data';

export async function triggerComparisonInsight(
  slug: string,
  locale: string,
) {
  try {
    const parts = slug.split('-vs-');
    if (parts.length !== 2) throw new Error('Invalid slug');

    const [playerA, playerB] = await Promise.all([
      getPlayerBySlug(parts[0], locale),
      getPlayerBySlug(parts[1], locale),
    ]);

    if (!playerA || !playerB) throw new Error('Players not found');

    const insight = await generateComparisonInsight(playerA, playerB, locale);
    if (!insight) throw new Error('Empty insight');

    const insightKey = locale === 'es' ? 'insight_es' : locale === 'en' ? 'insight_en' : 'insight_fr';

    const { error } = await supabaseAdmin
      .from('comparisons')
      .update({ [insightKey]: insight, updated_at: new Date().toISOString() })
      .eq('slug', slug);

    if (error) throw error;

    await redis.del(`comparison:af:slug:${slug}:${locale}`).catch(() => {});
    revalidatePath(`/${locale}/compare/${slug}`);
    return { success: true };
  } catch (err) {
    console.error('triggerComparisonInsight error:', err);
    return { success: false, error: String(err) };
  }
}
