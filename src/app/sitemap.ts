import { MetadataRoute } from 'next';
import { supabaseAdmin } from '@/lib/supabase';
import { localizedHref } from '@/lib/localizedPaths';

const BASE_URL = process.env.NEXT_PUBLIC_APP_URL ?? 'https://novaduel.com';
const LOCALES = ['fr', 'en', 'es'] as const;

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const entries: MetadataRoute.Sitemap = [];

  // ── Pages statiques ───────────────────────────────────────────────────────
  const staticPages: { path: string; priority: number; freq: MetadataRoute.Sitemap[number]['changeFrequency'] }[] = [
    { path: '',          priority: 1.0, freq: 'daily'  },
    { path: '/compare',  priority: 0.9, freq: 'daily'  },
    { path: '/players',  priority: 0.8, freq: 'weekly' },
  ];

  for (const { path, priority, freq } of staticPages) {
    for (const locale of LOCALES) {
      const loc = path ? localizedHref(locale, path) : `/${locale}`;
      entries.push({ url: `${BASE_URL}${loc}`, changeFrequency: freq, priority });
    }
  }

  // ── Joueurs ───────────────────────────────────────────────────────────────
  const { data: players } = await supabaseAdmin
    .from('players')
    .select('slug, updated_at')
    .not('slug', 'is', null)
    .order('updated_at', { ascending: false });

  for (const p of players ?? []) {
    for (const locale of LOCALES) {
      entries.push({
        url: `${BASE_URL}${localizedHref(locale, `/player/${p.slug}`)}`,
        lastModified: p.updated_at ? new Date(p.updated_at) : new Date(),
        changeFrequency: 'weekly',
        priority: 0.7,
      });
    }
  }

  // ── Comparaisons ─────────────────────────────────────────────────────────
  const { data: comparisons } = await supabaseAdmin
    .from('comparisons')
    .select('slug, updated_at')
    .not('slug', 'is', null)
    .order('updated_at', { ascending: false });

  for (const c of comparisons ?? []) {
    for (const locale of LOCALES) {
      entries.push({
        url: `${BASE_URL}${localizedHref(locale, `/compare/${c.slug}`)}`,
        lastModified: c.updated_at ? new Date(c.updated_at) : new Date(),
        changeFrequency: 'weekly',
        priority: 0.8,
      });
    }
  }

  return entries;
}
