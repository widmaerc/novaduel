import type { Metadata } from 'next';
import { getTranslations, getLocale } from 'next-intl/server';
import { buildAlternates } from '@/lib/hreflang';
import { mapPosition } from '@/lib/data';
import { getLeagues } from '@/lib/apifootball';
import { supabaseAdmin } from '@/lib/supabase';
import HeroSearch      from '@/components/home/HeroSearch';
import StatsBar        from '@/components/home/StatsBar';
import LeagueTable     from '@/components/home/LeagueTable';
import TopRatedPlayers from '@/components/home/TopRatedPlayers';
import FeaturedDuel    from '@/components/home/FeaturedDuel';
import PerformanceSurge from '@/components/home/PerformanceSurge';
import TopPlayersLists from '@/components/home/TopPlayersLists';
import Editorial       from '@/components/home/Editorial';
import Leagues        from '@/components/home/Leagues';
import Newsletter      from '@/components/home/Newsletter';
import StatFootnotes   from '@/components/shared/StatFootnotes';

type Props = { params: Promise<{ locale: string }> };

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { locale } = await params;
  const t = await getTranslations({ locale, namespace: 'HomePage' });

  return {
    title: t('seo.title'),
    description: t('seo.description'),
    alternates: buildAlternates('', locale),
  };
}

export const revalidate = 120

export default async function HomePage() {
  const [leagues, { count: playersCount }, { data: topComparisons }, locale] = await Promise.all([
    getLeagues(),
    supabaseAdmin.from('dn_players').select('id', { count: 'exact', head: true }),
    supabaseAdmin
      .from('comparisons')
      .select('slug, views, player_a:dn_players!player_a_id(id, name, firstname, lastname, slug, statistics), player_b:dn_players!player_b_id(id, name, firstname, lastname, slug, statistics)')
      .gt('views', 0)
      .order('views', { ascending: false })
      .limit(6),
    getLocale(),
  ])

  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  function enrichDnPlayer(p: any) {
    if (!p) return null;
    const stats: any[] = p.statistics ?? [];
    // Pick the stat entry with the most appearances
    const best = stats.reduce((acc: any, s: any) =>
      (s.games?.appearences ?? 0) > (acc?.games?.appearences ?? 0) ? s : acc, stats[0] ?? null);
    const initials = (p.firstname && p.lastname)
      ? `${p.firstname[0]}${p.lastname[0]}`.toUpperCase()
      : (p.name ?? '??').split(' ').map((w: string) => w[0]).join('').slice(0, 2).toUpperCase();
    return {
      name:         p.name,
      common_name:  p.name,
      slug:         p.slug,
      initials,
      team:         best?.team?.name    ?? '—',
      position:     mapPosition(best?.games?.position ?? ''),
      goals:        best?.goals?.total   ?? 0,
      assists:      best?.goals?.assists ?? 0,
      matches:      best?.games?.appearences ?? 0,
      minutes:      best?.games?.minutes ?? 0,
      dribbles:     best?.dribbles?.success ?? 0,
      shots_on_target: best?.shots?.on ?? 0,
      yellow_cards:  best?.cards?.yellow ?? 0,
      red_cards:     best?.cards?.red ?? 0,
      pass_accuracy: best?.passes?.accuracy ?? 0,
      duels_won:     best?.duels?.total > 0 ? Math.round((best?.duels?.won / best?.duels?.total) * 100) : 0,
    };
  }

  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const topList = (topComparisons ?? []).map((c: any, i: number) => ({
    rank:   i + 1,
    slug:   c.slug as string,
    labelA: (c.player_a?.name) as string,
    labelB: (c.player_b?.name) as string,
    views:  c.views as number,
    playerA: enrichDnPlayer(c.player_a),
    playerB: enrichDnPlayer(c.player_b),
  }))

  const featuredDuel  = topList[0] ?? null
  const sidebarTrends = topList.slice(1, 6).map((t, i) => ({ ...t, rank: i + 1 }))
  const trends        = topList.slice(0, 3)

  return (
    <>
      <HeroSearch trends={trends} />
      <StatsBar playersCount={playersCount ?? 0} leaguesCount={9} />
      <FeaturedDuel featuredDuel={featuredDuel} trends={sidebarTrends} />
      <div className="max-w-[1280px] mx-auto px-3 sm:px-4 lg:px-6 grid grid-cols-1 lg:grid-cols-2 gap-5 my-8">
        <LeagueTable />
        <TopRatedPlayers />
      </div>
      {/* <PerformanceSurge /> */}
      <TopPlayersLists />
      <Leagues />
      <Editorial />
      <Newsletter />
      <StatFootnotes locale={locale} />
    </>
  );
}
