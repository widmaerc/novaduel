import type { Metadata } from 'next';
import { getTranslations } from 'next-intl/server';
import { buildAlternates } from '@/lib/hreflang';
import { getGlobalPlayersCount, getGlobalLeaguesCount } from '@/lib/sportmonks';
import { supabaseAdmin } from '@/lib/supabase';
import HeroSearch      from '@/components/home/HeroSearch';
import StatsBar        from '@/components/home/StatsBar';
import LiveMatches     from '@/components/home/LiveMatches';
import FeaturedDuel    from '@/components/home/FeaturedDuel';
import PerformanceSurge from '@/components/home/PerformanceSurge';
import TopPlayersLists from '@/components/home/TopPlayersLists';
import Editorial       from '@/components/home/Editorial';
import Leagues        from '@/components/home/Leagues';
import Newsletter      from '@/components/home/Newsletter';

type Props = { params: Promise<{ locale: string }> };

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { locale } = await params;
  const t = await getTranslations({ locale, namespace: 'HomePage' });

  return {
    title: t('seo.title'),
    description: t('seo.description'),
    alternates: buildAlternates(),
  };
}

export const revalidate = 120

export default async function HomePage() {
  const [playersCount, leaguesCount, { data: topComparisons }] = await Promise.all([
    getGlobalPlayersCount(),
    getGlobalLeaguesCount(),
    supabaseAdmin
      .from('comparisons')
      .select('slug, views, player_a:players!player_a_id(slug, name, common_name, team, position, initials, avatar_bg, avatar_color, goals, matches, duels_won, pass_accuracy), player_b:players!player_b_id(slug, name, common_name, team, position, initials, avatar_bg, avatar_color, goals, matches, duels_won, pass_accuracy)')
      .gt('views', 0)
      .order('views', { ascending: false })
      .limit(6),
  ])

  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const topList = (topComparisons ?? []).map((c: any, i: number) => ({
    rank:   i + 1,
    slug:   c.slug as string,
    labelA: (c.player_a?.common_name || c.player_a?.name) as string,
    labelB: (c.player_b?.common_name || c.player_b?.name) as string,
    views:  c.views as number,
    playerA: c.player_a,
    playerB: c.player_b,
  }))

  const featuredDuel  = topList[0] ?? null
  const sidebarTrends = topList.slice(1, 6).map((t, i) => ({ ...t, rank: i + 1 }))
  const trends        = topList.slice(0, 3)

  return (
    <>
      <HeroSearch trends={trends} />
      <StatsBar playersCount={playersCount} leaguesCount={leaguesCount} />
      <LiveMatches />
      <FeaturedDuel featuredDuel={featuredDuel} trends={sidebarTrends} />
      <PerformanceSurge />
      <TopPlayersLists />
      <Leagues />
      <Editorial />
      <Newsletter />
    </>
  );
}
