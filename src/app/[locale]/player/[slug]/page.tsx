import { getTranslations, getLocale } from 'next-intl/server';
import Link from 'next/link';
import { notFound } from 'next/navigation';
import type { Metadata } from 'next';
import { getPlayerBySlug } from '@/lib/data';
import TeamBadge from '@/components/ui/TeamBadge';
import { getCurrentSeason } from '@/lib/season';
import { FormattedInsight } from '@/components/FormattedInsight';
import { buildAlternates } from '@/lib/hreflang';
import { localizedHref } from '@/lib/localizedPaths';
import Breadcrumbs from '@/components/layout/Breadcrumbs';
import PlayerAvatar from '@/components/compare/PlayerAvatar';
import PlayerStatsSection from '@/components/player/PlayerStatsSection';
import SimilarProfilesWidget from '@/components/player/SimilarProfilesWidget';
import AITrigger from '@/components/player/AITrigger';
import PlayerCareerSection from '@/components/player/PlayerCareerSection';
import TrophiesAccordion from '@/components/player/TrophiesAccordion';
import RadarChart from '@/components/player/RadarChart';
import StatFootnotes from '@/components/shared/StatFootnotes';
import { Suspense } from 'react';

type Props = { params: Promise<{ locale: string; slug: string }> };

// Pre-render top players for all locales at build time
export async function generateStaticParams() {
  // eslint-disable-next-line @typescript-eslint/no-require-imports
  const topData = require('../../../../../data/top-comparisons.json') as { top_players: string[] };
  const locales = ['fr', 'en', 'es'];
  return locales.flatMap(locale =>
    topData.top_players.map(slug => ({ locale, slug }))
  );
}

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { slug, locale } = await params;
  const player = await getPlayerBySlug(slug, locale);
  const t = await getTranslations('PlayerPage');
  const tc = await getTranslations('Common');

  if (!player) return { title: tc('labels.not_available') };

  const name = player.common_name || player.name;
  const title = `${name} ${new Date().getFullYear()} — ${t('seo.suffix')}`;
  const description = t('seo.title', { name, season: player.season });
  const url = `${process.env.NEXT_PUBLIC_APP_URL ?? 'https://novaduel.com'}/${locale}/player/${slug}`;

  return {
    title,
    description,
    alternates: buildAlternates(`/player/${slug}`, locale),
    openGraph: {
      type: 'profile',
      title,
      description,
      url,
      siteName: 'NovaDuel',
    },
    twitter: {
      card: 'summary_large_image',
      title,
      description,
    },
  };
}

export default async function PlayerPage({ params }: Props) {
  const { slug } = await params;
  const [t, tc, tRadar, locale, player, currentSeason] = await Promise.all([
    getTranslations('PlayerPage'),
    getTranslations('Common'),
    getTranslations('Radar'),
    getLocale(),
    params.then(p => getPlayerBySlug(p.slug, p.locale)),
    getCurrentSeason(),
  ]);

  if (!player) notFound();

  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const isMissingData = (player as any).is_missing_data === true;
  const typedPlayer = player as any;
  const aiInsight = typedPlayer[`insight_${locale}`] || player.ai_insight || '';
  const analysis = (typeof player.ai_analysis === 'object' && player.ai_analysis) ? (player.ai_analysis as any) : null;

  // ─── Derived values ───────────────────────────────────────────────
  const minPerGoal      = (!isMissingData && player.goals > 0) ? Math.round(player.minutes / player.goals) : 0;


  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const trophyList: { league: string; country: string; season: string; place: string }[] =
    Array.isArray(player.trophies_json)
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      ? (player.trophies_json as any[]).filter(t => t?.league)
      : [];
  const trophyWins    = trophyList.filter(t => t.place === 'Winner');
  const trophyRunners = trophyList.filter(t => t.place === 'Runner-up');
  const form = player.recent_form ? player.recent_form.split(',') : [];
  const nameParts = player.name.split(' ');
  const firstName = nameParts[0];
  const lastName = nameParts.slice(1).join(' ');
  const ratingStars = isMissingData ? 0 : Math.round((Number(player.rating) / 10) * 5);


  const p = {
    ...player,
    firstName,
    lastName,
    flag: player.flag_emoji || '',
    positionLabel: tc(`positions.${(player.position === 'MIL' ? 'mid' : player.position).toLowerCase()}_full`),
    marketValue: player.market_value || '—',
    ratingStars,
    ratingDisplay: isMissingData ? 'N/D' : player.rating,
    nicknames: player.common_name !== player.name ? `"${player.common_name}"` : '',
    height: player.height ? `${Math.floor(player.height / 100)}${tc('units.meters')}${player.height % 100}` : '—',
    foot: player.preferred_foot || '—',
    number: player.shirt_number ? `${tc('units.number_abbr')} ${player.shirt_number}` : '—',
    contract: '—',
    birth: player.date_of_birth ? player.date_of_birth.replace(/-/g, '/') : '—',
    weight: player.weight ? `${player.weight} ${tc('units.kg')}` : '—',
    yellowCards: isMissingData ? 'N/D' : player.yellow_cards,
    redCards: isMissingData ? 'N/D' : player.red_cards,
    minutesTotal: isMissingData ? 'N/D' : (player.minutes > 0 ? String(player.minutes) : '—'),
    minutesPerGoal: isMissingData ? 'N/D' : (minPerGoal > 0 ? `${minPerGoal}'` : '—'),
    form: isMissingData ? [] : form,
    aiInsight,
    aiTags: [] as string[],
    radar: { 
      creativity: isMissingData ? 0 : Math.round(Number(player.pass_accuracy)), 
      vision: isMissingData ? 0 : Math.round(Number(player.pass_accuracy) * 0.97) 
    },
    tacticalRoles: (analysis && analysis.roles) ? analysis.roles : (isMissingData ? [] : [
      { role: t('sections.tactical_roles'), pct: 90 },
      { role: tc(`positions.${(player.position === 'MIL' ? 'mid' : player.position).toLowerCase()}_full`), pct: 75 },
    ]),
    strengths: (analysis && analysis.strengths) ? analysis.strengths : (isMissingData ? [] : [tc("labels.not_available")]),
    weaknesses: (analysis && analysis.weaknesses) ? analysis.weaknesses : (isMissingData ? [] : [tc("labels.not_available")]),
  };

  const formColor = (r: string) =>
    r === 'V' || r === 'W' ? '#22c55e' : r === 'N' || r === 'D' ? '#94a3b8' : '#ef4444';

  const jsonLd = {
    '@context': 'https://schema.org',
    '@graph': [
      {
        '@type': ['Person', 'Athlete'],
        '@id': `https://novaduel.com/${locale}/player/${player.slug}`,
        'url': `https://novaduel.com/${locale}/player/${player.slug}`,
        'name': player.name,
        'givenName': player.name.split(' ')[0],
        'familyName': player.name.split(' ').slice(1).join(' '),
        'alternateName': player.common_name,
        'description': aiInsight.slice(0, 160),
        'image': player.image_url || undefined,
        'nationality': player.nationality ? {
          '@type': 'Country',
          'name': player.nationality,
        } : undefined,
        'birthDate': player.date_of_birth || undefined,
        'height': player.height ? { '@type': 'QuantitativeValue', 'value': player.height, 'unitCode': 'CMT', 'unitText': 'cm' } : undefined,
        'weight': player.weight ? { '@type': 'QuantitativeValue', 'value': player.weight, 'unitCode': 'KGM', 'unitText': 'kg' } : undefined,
        'sport': 'Football',
        'hasOccupation': {
          '@type': 'Occupation',
          'name': player.position_name || p.positionLabel,
          'occupationLocation': { '@type': 'Country', 'name': player.nationality || 'France' },
        },
        'memberOf': {
          '@type': 'SportsOrganization',
          'name': player.team || undefined,
          'sport': 'Football',
        },
        'knowsAbout': ['Football', player.league, player.team].filter(Boolean),
      },
      {
        '@type': 'BreadcrumbList',
        'itemListElement': [
          {
            '@type': 'ListItem',
            'position': 1,
            'name': t('breadcrumb.home'),
            'item': `https://novaduel.com/${locale}`
          },
          {
            '@type': 'ListItem',
            'position': 2,
            'name': t('breadcrumb.players'),
            'item': `https://novaduel.com${localizedHref(locale, '/players')}`
          },
          {
            '@type': 'ListItem',
            'position': 3,
            'name': player.name,
            'item': `https://novaduel.com/${locale}/player/${player.slug}`
          }
        ]
      }
    ]
  };

  return (
    <>
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }}
      />

      <main className="max-w-[1440px] mx-auto px-6 lg:px-10 pb-16 relative overflow-hidden">
        <div className="hero-mesh" />

        {/* ── HERO ─────────────────────────────────────────── */}
        <section className="relative z-10 grid grid-cols-1 lg:grid-cols-[420px_1fr] gap-8 lg:gap-12 items-center lg:items-end py-4 lg:py-6 pb-6 border-b border-slate-200/40 mb-3">

          {/* Left: player visual */}
          <div className="relative">
            <Breadcrumbs 
              locale={locale}
              items={[
                { label: t('breadcrumb.home'), href: '/' },
                { label: t('breadcrumb.players'), href: '/players' },
                { label: p.common_name || p.name }
              ]}
            />

            {/* Avatar area */}
            {(() => {
              const avatarPalette: Record<string, { from: string; to: string; text: string }> = {
                ATT: { from: 'var(--color-primary-light)', to: 'var(--color-primary-fixed)', text: 'var(--color-primary)' },
                MIL: { from: '#eff6ff', to: '#dbeafe', text: '#1e40af' },
                DEF: { from: 'var(--color-primary-dim)', to: 'var(--color-primary-light)', text: 'var(--color-primary)' },
                GK:  { from: 'var(--color-primary-fixed)', to: 'var(--color-primary-light)', text: '#1d4ed8' },
              }
              const pal = avatarPalette[player.position] ?? { from: '#f8fafc', to: '#f1f5f9', text: '#334155' }
              return (
            <div className="glass-card relative rounded-3xl overflow-hidden h-[380px] sm:h-[480px] flex items-center justify-center shadow-2xl group border-white/60 w-full"
              style={{ background: `linear-gradient(135deg, ${pal.from} 0%, ${pal.to} 100%)` }}>
              <div className="absolute inset-0 bg-[radial-gradient(circle_at_50%_30%,rgba(255,255,255,0.7),transparent)]" />

              <span className="font-hl font-black text-[150px] select-none tracking-tighter z-1 uppercase"
                style={{ color: pal.text, opacity: 0.08 }}>
                {p.initials}
              </span>

              {/* Decorative accent */}
              <div className="absolute inset-0 border-[1px] border-white/40 pointer-events-none" />

              {/* Elite badge */}
              <div className="absolute top-6 left-6 z-10">
                <span className="ai-gradient text-white font-hl font-black text-[9px] uppercase tracking-[0.2em] py-2 px-5 rounded-full shadow-[0_8px_20px_rgba(30,64,175,0.25)] border border-white/20">
                  <span className="opacity-80">★</span> <span className="ml-1.5">{tc('labels.elite_badge')}</span>
                </span>
              </div>

              {/* Rating glass */}
              <div className="absolute top-6 right-6 z-10 rounded-2xl p-5 px-6 text-center shadow-2xl glass backdrop-blur-2xl border-white/60 bg-white/60">
                <div className="label-caps mb-1.5 opacity-60 text-[9px] tracking-widest">{tc('labels.global_rating')}</div>
                <div className="font-hl font-black text-[42px] text-primary leading-none drop-shadow-sm tracking-tight">{p.ratingDisplay}</div>
                <div className="flex gap-1.5 justify-center mt-3">
                  {[...Array(5)].map((_, i) => (
                    <div key={i} className={`w-1.5 h-1.5 rounded-full ${i < p.ratingStars ? 'bg-primary shadow-[0_0_10px_rgba(30,64,175,0.6)] animate-pulse-soft' : 'bg-slate-200'}`} />
                  ))}
                </div>
              </div>

              {/* Shirt number badge */}
              {(player.shirt_number ?? 0) > 0 && (
                <div className="absolute bottom-6 right-6 z-10 rounded-2xl px-5 py-3 text-center shadow-xl glass border-white/60 bg-white/50 min-w-[64px]">
                  <div className="label-caps opacity-40 leading-none mb-1 text-[10px]">#</div>
                  <div className="font-hl font-black text-[28px] text-primary leading-none">{player.shirt_number}</div>
                </div>
              )}

              {/* Form dots */}
              <div className="absolute bottom-6 left-6 z-10 flex gap-1.5 items-center bg-white/40 backdrop-blur-md p-2 px-3 rounded-2xl border border-white/40 shadow-sm">
                <span className="label-caps text-slate-500/80 mr-2 text-[9px]">{tc('stats.form')}</span>
                <div className="flex gap-1">
                  {p.form.map((r, i) => (
                    <div key={i} className="w-6 h-6 rounded-lg flex items-center justify-center font-hl font-black text-[10px] text-white shadow-sm" style={{ backgroundColor: formColor(r) }}>{r}</div>
                  ))}
                </div>
              </div>
            </div>
              )
            })()}
          </div>

          {/* Right: identity */}
          <div className="pb-3 w-full">
            <div className="flex flex-col gap-3 mb-8">
              <div className="flex items-center gap-2.5 text-[18px] text-slate-700 font-bold">
                <TeamBadge teamId={0} teamName={player.team ?? ''} size={24} />
                {p.team} <span className="text-slate-300 mx-2">·</span> {p.league}
                <span className="ml-1 text-3xl drop-shadow-sm tracking-normal">{p.flag}</span>
              </div>
              <div className="flex items-center">
                <span className="bg-primary/10 text-primary border border-primary/20 rounded-full text-[13px] font-black uppercase tracking-[0.1em] py-1 px-5 shadow-sm">
                  {p.positionLabel}
                </span>
              </div>
            </div>

            <h1 className="font-hl font-black text-[48px] md:text-[54px] lg:text-[64px] leading-[0.9] -tracking-[0.03em] text-slate-900 uppercase mb-3">
              {p.firstName}<br />
              <span className="text-slate-400">{p.lastName}</span>
            </h1>
            <div className="text-[16px] text-slate-500 font-medium italic mb-10 pl-1">{p.nicknames}</div>

            {/* Slim Identity Grid */}
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 lg:gap-6 glass-card p-4 px-6 mb-6 max-w-3xl bg-white/40 border-white/60">
              {[
                { label: t('profile.nationality'), value: p.nationality },
                { label: t('profile.age'), value: `${p.age} ${tc('units.years')}` },
                { label: t('profile.position'), value: p.positionLabel },
                { label: t('profile.height'), value: p.height },
                { label: t('profile.weight'), value: p.weight },
                { label: t('profile.number'), value: p.number },
                { label: t('profile.birth'), value: p.birth },
                { label: tc('stats.minutes'), value: p.minutesTotal },
              ].map((item) => (
                <div key={item.label} className="min-w-0">
                  <div className="label-caps mb-1 !text-[9px] truncate opacity-50">{item.label}</div>
                  <div className="text-[16px] sm:text-[17px] font-black tracking-tight truncate text-slate-900">{item.value}</div>
                </div>
              ))}
            </div>

            {/* CTA */}
            <div className="flex gap-4 flex-wrap">
              <Link href={localizedHref(locale, `/compare?a=${p.id}`)} className="ai-gradient flex items-center gap-3 text-white py-4 px-8 rounded-full font-hl font-bold text-[13px] uppercase tracking-widest no-underline shadow-xl shadow-blue-900/20 hover:scale-[1.02] active:scale-[0.98] transition-all">
                <span className="material-symbols-outlined text-[20px] !text-white">analytics</span>
                <span className="!text-white">{tc('buttons.compare')} {p.firstName}</span>
              </Link>
              <button className="flex items-center gap-2 bg-white text-slate-800 border-2 border-slate-100 py-4 px-6 rounded-full font-hl font-bold text-[13px] uppercase tracking-wider cursor-pointer hover:bg-slate-50 transition-all shadow-sm">
                <span className="material-symbols-outlined text-[20px] text-slate-400">bookmark</span>
                {tc('buttons.save')}
              </button>
              <button className="flex items-center gap-2 bg-white text-slate-800 border-2 border-slate-100 py-4 px-6 rounded-full font-hl font-bold text-[13px] uppercase tracking-wider cursor-pointer hover:bg-slate-50 transition-all shadow-sm">
                <span className="material-symbols-outlined text-[20px] text-slate-400">share</span>
                {tc('buttons.share')}
              </button>
            </div>
          </div>
        </section>

        {/* ── BENTO GRID ──────────────────────────────────── */}
        <div className="grid grid-cols-1 lg:grid-cols-[280px_1fr_280px] gap-6 items-start">

          {/* ─ LEFT SIDEBAR (Order 2 on mobile, 1 on desktop) ─ */}
          <div className="flex flex-col gap-4 order-2 lg:order-1">
            {/* Radar */}
            <div className="glass-card bg-white p-6 shadow-sm overflow-hidden">
              <div className="flex items-center justify-center gap-2 mb-8">
                <span className="material-symbols-outlined text-primary text-[20px]">radar</span>
                <h3 className="label-caps text-primary text-[11px]">{t('sections.skill_matrix')}</h3>
              </div>
              <RadarChart 
                data={{
                  finish: player.radar_finish,
                  dribble: player.radar_dribble,
                  passes: player.radar_passes,
                  vision: player.radar_vision,
                  creativity: player.radar_creativity
                }}
                labels={{
                  finish: tRadar('finish'),
                  dribble: tRadar('dribble'),
                  passes: tRadar('passes'),
                  vision: tRadar('vision'),
                  creativity: tRadar('creativity')
                }}
              />
              <div className="grid grid-cols-2 gap-3 mt-4">
                <div className="text-center bg-slate-50 rounded-2xl p-4 border border-slate-100">
                  <div className="label-caps mb-1 opacity-70 text-[9px]">{tRadar('creativity')}</div>
                  <div className="font-hl font-black text-[22px] text-primary">{player.radar_creativity}</div>
                </div>
                <div className="text-center bg-slate-50 rounded-2xl p-4 border border-slate-100">
                  <div className="label-caps mb-1 opacity-70 text-[9px]">{tRadar('vision')}</div>
                  <div className="font-hl font-black text-[22px] text-primary">{player.radar_vision}</div>
                </div>
              </div>
            </div>

            <SimilarProfilesWidget playerId={player.id} />

            <div className="glass-card bg-white p-6 overflow-hidden shadow-sm">
              <div className="flex items-center gap-2 mb-6">
                <span className="material-symbols-outlined text-primary text-[20px]">emoji_events</span>
                <h3 className="label-caps text-primary text-[11px]">{t('sections.trophies')}</h3>
              </div>
              <TrophiesAccordion 
                wins={trophyWins} 
                runners={trophyRunners} 
                translations={{
                  winner: t('sections.trophies_winner'),
                  runner_up: t('sections.trophies_runner_up'),
                  no_trophies: t('sections.no_trophies')
                }}
              />
            </div>
          </div>

          {/* ─ MIDDLE COLUMN (Order 1 on mobile, 2 on desktop) ─ */}
          <div className="flex flex-col gap-5 order-1 lg:order-2">
            <PlayerStatsSection
              slug={slug}
              currentSeason={currentSeason}
              isMissingData={isMissingData}
              initialStats={{
                goals:           isMissingData ? 0 : player.goals,
                assists:         isMissingData ? 0 : player.assists,
                matches:         isMissingData ? 0 : player.matches,
                minutes:         isMissingData ? 0 : player.minutes,
                rating:          isMissingData ? 0 : Number(player.rating) || 0,
                pass_accuracy:   isMissingData ? 0 : Number(player.pass_accuracy) || 0,
                dribbles:        isMissingData ? 0 : Number(player.dribbles) || 0,
                duels_won:       isMissingData ? 0 : Number(player.duels_won) || 0,
                shots_on_target: isMissingData ? 0 : Number(player.shots_on_target) || 0,
                yellow_cards:    isMissingData ? 0 : player.yellow_cards,
                red_cards:       isMissingData ? 0 : player.red_cards,
              }}
            />

            <div className="glass-card bg-white p-0 shadow-sm relative overflow-hidden border-blue-100/50">
              <div className="ai-gradient text-white p-5 flex items-center gap-3">
                <span className="material-symbols-outlined text-[24px] !text-white">auto_awesome</span>
                <div className="flex flex-col">
                  <h3 className="label-caps !text-white text-[12px] !opacity-100 tracking-[0.12em] font-black">
                    {t('ai.title')}
                    <a href="#foot-6" className="ml-1 text-white/40 hover:text-white transition-colors no-underline">
                      <sup className="text-[8px] font-black"> [6]</sup>
                    </a>
                  </h3>
                  <span className="text-[10px] text-white/70 font-bold tracking-wider">
                    {tc('labels.season')} {currentSeason}
                  </span>
                </div>
                <span className="bg-white/20 text-white text-[9px] font-black uppercase tracking-wider py-1 px-3 rounded-full ml-auto backdrop-blur-md border border-white/10">{t('ai.badge')}</span>
              </div>
              <div className="p-8 relative z-1 bg-gradient-to-b from-blue-50/30 to-transparent">
                <FormattedInsight text={p.aiInsight} />
                <AITrigger 
                   playerId={player.id} 
                   locale={locale} 
                   slug={slug} 
                   hasInsight={!!p.aiInsight} 
                />
              </div>
            </div>

            {/* Career History (DESKTOP ONLY: Under Insight) */}
            <div className="hidden lg:block">
              <Suspense fallback={<div className="h-20" />}>
                <PlayerCareerSection playerId={player.id} locale={locale} />
              </Suspense>
            </div>
          </div>

          {/* ─ RIGHT SIDEBAR (Order 3) ─ */}
          <div className="flex flex-col gap-4 order-3 lg:order-3">
            <div className="glass-card bg-slate-50/80 p-6 overflow-hidden border-slate-200/50">
              <div className="flex items-center gap-2 mb-6">
                <span className="material-symbols-outlined text-primary text-[20px]">tactic</span>
                <h3 className="label-caps text-primary text-[11px]">{t('sections.tactical_roles')}</h3>
              </div>
              <div className="flex flex-col gap-4">
                {p.tacticalRoles.map((role: any) => (
                  <div key={typeof role === 'string' ? role : role.role}>
                    <div className="flex justify-between items-end mb-1.5">
                      <span className="text-[12px] font-semibold text-slate-900">{typeof role === 'string' ? role : role.role}</span>
                      <span className="font-hl font-extrabold text-[14px] text-primary">{typeof role === 'string' ? 90 : role.pct}%</span>
                    </div>
                    <div className="h-1.5 bg-slate-100 rounded-full overflow-hidden shadow-inner">
                      <div className="bar-grow h-full rounded-full shadow-sm" style={{ width:`${typeof role === 'string' ? 90 : role.pct}%`, backgroundColor: 'var(--color-primary)' }} />
                    </div>
                  </div>
                ))}
              </div>
            </div>

            <div className="glass-card bg-white p-6 overflow-hidden shadow-sm">
              <div className="flex items-center gap-2 mb-6">
                <span className="material-symbols-outlined text-primary text-[20px]">insights</span>
                <h3 className="label-caps text-primary text-[11px]">{t('sections.strengths_weaknesses')}</h3>
              </div>
              <div className="flex flex-col gap-3">
                {p.strengths.map((s: string) => (
                  <div key={s} className="flex items-start gap-3 p-2.5 bg-emerald-50/50 rounded-2xl border border-emerald-100/50 group hover:bg-emerald-50 transition-colors">
                    <span className="material-symbols-outlined text-emerald-600 text-[18px]">check_circle</span>
                    <div className="text-[12px] font-semibold text-slate-800 leading-snug">{s}</div>
                  </div>
                ))}
                {p.weaknesses.map((w: string) => (
                  <div key={w} className="flex items-start gap-3 p-2.5 bg-amber-50/50 rounded-2xl border border-amber-100/50 group hover:bg-amber-50 transition-colors">
                    <span className="material-symbols-outlined text-amber-600 text-[18px]">warning</span>
                    <div className="text-[12px] font-normal text-slate-600 leading-snug">{w}</div>
                  </div>
                ))}
              </div>
            </div>

            <div className="rounded-3xl p-7 text-white bg-slate-900 relative overflow-hidden shadow-2xl">
              <div className="absolute top-0 right-0 w-32 h-32 bg-blue-500/10 rounded-full blur-3xl" />
              <div className="relative z-1">
                <div className="label-caps !text-white text-[10px] mb-3 font-black tracking-[0.12em]">{tc('labels.pro_scouting')}</div>
                <div className="text-[14px] font-medium text-slate-300 leading-relaxed mb-6">{tc('labels.pro_scouting_sub')}</div>
                <button className="w-full py-3.5 ai-gradient border-0 rounded-xl font-hl font-black text-[12px] uppercase tracking-widest text-white cursor-pointer hover:scale-[1.02] transition-transform shadow-lg shadow-blue-900/40">
                  {tc('labels.pro_scouting_cta')}
                </button>
              </div>
            </div>
          </div>

          {/* Career History (MOBILE ONLY: Absolute end) */}
          <div className="lg:hidden order-last">
            <Suspense fallback={<div className="h-20" />}>
              <PlayerCareerSection playerId={player.id} locale={locale} />
            </Suspense>
          </div>

        </div>
      </main>
      <StatFootnotes />
    </>
  );
}
