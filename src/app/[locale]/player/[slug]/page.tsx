import { getTranslations, getLocale } from 'next-intl/server';
import Link from 'next/link';
import { notFound } from 'next/navigation';
import type { Metadata } from 'next';
import { getPlayerBySlug, getPlayerCareer } from '@/lib/data';
import TeamBadge from '@/components/ui/TeamBadge';
import { getCurrentSeason } from '@/lib/season';
import { FormattedInsight } from '@/components/FormattedInsight';
import { buildAlternates } from '@/lib/hreflang';
import { localizedHref } from '@/lib/localizedPaths';
import Breadcrumbs from '@/components/layout/Breadcrumbs';
import PlayerAvatar from '@/components/compare/PlayerAvatar';
import PlayerStatsSection from '@/components/player/PlayerStatsSection';

type Props = { params: Promise<{ locale: string; slug: string }> };

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { slug, locale } = await params;
  const player = await getPlayerBySlug(slug, locale);
  const t = await getTranslations('PlayerPage');
  const tc = await getTranslations('Common');
  
  if (!player) return { title: tc('labels.not_available') };
  
  return {
    title: `${player.name} ${new Date().getFullYear()} — ${t('seo.suffix')}`,
    description: t('seo.title', { name: player.name, season: player.season }),
    alternates: buildAlternates(`/player/${slug}`),
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

  const career = player ? await getPlayerCareer(player.id) : [];

  if (!player) notFound();

  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const isMissingData = (player as any).is_missing_data === true;

  const aiInsight = player.ai_insight ?? '';

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
    birth: player.date_of_birth ? new Date(`${player.date_of_birth}T00:00:00Z`).toLocaleDateString(locale === 'fr' ? 'fr-FR' : locale === 'es' ? 'es-ES' : 'en-GB', { day: 'numeric', month: 'long', year: 'numeric', timeZone: 'UTC' }) : '—',
    weight: player.weight ? `${player.weight} ${tc('units.kg')}` : '—',
    yellowCards: isMissingData ? 'N/D' : player.yellow_cards,
    redCards: isMissingData ? 'N/D' : player.red_cards,
    minutesTotal: isMissingData ? 'N/D' : (player.minutes > 0 ? String(player.minutes) : '—'),
    minutesPerGoal: isMissingData ? 'N/D' : (minPerGoal > 0 ? `${minPerGoal}'` : '—'),
    form: isMissingData ? [] : form,
    aiInsight,
    aiTags: [] as string[],
    career,
    similar: [
      { name: 'Kylian Mbappé', initials: 'KM', match: '98', slug: 'kylian-mbappe' },
      { name: 'Erling Haaland', initials: 'EH', match: '94', slug: 'erling-haaland' },
      { name: 'Vinícius Jr.', initials: 'VJ', match: '92', slug: 'vinicius-junior' },
    ] as { name: string; initials: string; match: string; slug: string }[],
    radar: { creativity: isMissingData ? 0 : Math.round(Number(player.pass_accuracy)), vision: isMissingData ? 0 : Math.round(Number(player.pass_accuracy) * 0.97) },
    tacticalRoles: isMissingData ? [] : [
      { role: t('sections.tactical_roles'), pct: 90 },
      { role: tc(`positions.${(player.position === 'MIL' ? 'mid' : player.position).toLowerCase()}_full`), pct: 75 },
    ],
    strengths: isMissingData ? [] : [tc("labels.not_available")],
    weaknesses: isMissingData ? [] : [tc("labels.not_available")],
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
        <section className="relative z-10 grid grid-cols-[420px_1fr] gap-12 items-end py-4 pb-6 border-b border-slate-200/40 mb-3">

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
            <div className="glass-card relative rounded-3xl overflow-hidden h-[480px] flex items-center justify-center shadow-2xl group border-white/60"
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
          <div className="pb-3">
            <div className="flex items-center gap-3 mb-6">
              <span className="bg-primary/10 text-primary border border-primary/20 rounded-full text-[10px] font-bold uppercase tracking-wider py-1 px-4">{p.positionLabel}</span>
              <span className="flex items-center gap-2 text-[13px] text-slate-600 font-medium">
                <TeamBadge teamId={0} teamName={player.team ?? ''} size={20} />
                {p.team} <span className="text-slate-300 mx-1">·</span> {p.league}
              </span>
              <span className="text-2xl drop-shadow-sm">{p.flag}</span>
            </div>

            <h1 className="font-hl font-black text-[48px] md:text-[54px] lg:text-[64px] leading-[0.9] -tracking-[0.03em] text-slate-900 uppercase mb-3">
              {p.firstName}<br />
              <span className="text-slate-400">{p.lastName}</span>
            </h1>
            <div className="text-[16px] text-slate-500 font-medium italic mb-10 pl-1">{p.nicknames}</div>

            {/* Quick info grid */}
            <div className="grid grid-cols-4 gap-6 glass-card p-6 px-8 mb-10 max-w-2xl bg-white/40 border-white/60">
              {[
                { label: t('profile.nationality'), value: p.nationality },
                { label: t('profile.age'), value: `${p.age} ${tc('units.years')}` },
                { label: t('profile.position'), value: tc(`positions.${(player.position === 'MIL' ? 'mid' : player.position).toLowerCase()}`) },
                { label: t('profile.value'), value: p.marketValue, blue: true },
              ].map((item) => (
                <div key={item.label}>
                  <div className="label-caps mb-1.5">{item.label}</div>
                  <div className={`text-[15px] font-semibold ${item.blue ? 'text-primary' : 'text-slate-900'}`}>{item.value}</div>
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
        <div className="grid grid-cols-[280px_1fr_280px] gap-3 items-start">

          {/* ─ LEFT SIDEBAR ─ */}
          <div className="flex flex-col gap-4">

            {/* Quick scout */}
            <div className="glass-card bg-white p-5 overflow-hidden">
              <div className="flex items-center gap-2 mb-6">
                <span className="material-symbols-outlined text-primary text-[20px]">fact_check</span>
                <h3 className="label-caps text-primary text-[11px]">{t('profile.quick_scout_title')}</h3>
              </div>
              <div className="flex flex-col space-y-1">
                {[
                  { label: t('profile.height'), value: p.height },
                  { label: t('profile.weight'), value: p.weight },
                  { label: t('profile.foot'), value: p.foot },
                  { label: t('profile.number'), value: p.number },
                  { label: t('profile.contract'), value: p.contract },
                  { label: t('profile.birth'), value: p.birth },
                  { label: tc('stats.minutes'), value: p.minutesTotal },
                  { label: t('stats.yellow_cards'), value: String(p.yellowCards) },
                  { label: tc('stats.red_cards'), value: String(p.redCards) },
                  { label: tc('stats.min_per_goal'), value: p.minutesPerGoal, blue: true },
                ].map((row) => (
                  <div key={row.label} className="flex justify-between items-center py-1.5 border-b border-slate-50 last:border-0 hover:bg-slate-50/50 px-2 -mx-2 rounded-lg transition-colors">
                    <span className="text-[12px] text-slate-500 font-medium">{row.label}</span>
                    <span className={`text-[12px] font-semibold ${row.blue ? 'text-primary' : 'text-slate-900'}`}>{row.value}</span>
                  </div>
                ))}
              </div>
            </div>

            {/* Similar profiles */}
            <div className="ai-gradient rounded-3xl p-6 relative overflow-hidden shadow-lg shadow-blue-900/10">
              <div className="absolute -top-10 -right-10 w-32 h-32 bg-white/10 rounded-full blur-2xl pointer-events-none" />
              <div className="flex items-center gap-2 mb-6">
                <span className="material-symbols-outlined text-white/80 text-[20px]">people</span>
                <h3 className="label-caps !text-white text-[11px] !opacity-100 tracking-[0.12em] font-black">{t('sections.similar_profiles')}</h3>
              </div>
              <div className="flex flex-col gap-2">
                {p.similar.map((s) => (
                  <Link key={s.name} href={localizedHref(locale, `/player/${s.slug}`)} className="flex items-center justify-between p-2.5 bg-white/10 rounded-2xl no-underline hover:bg-white/20 transition-all border border-white/5 hover:border-white/20 group/s">
                    <div className="flex items-center gap-2.5">
                      <div className="w-7 h-7 rounded-full bg-white/30 flex items-center justify-center font-hl font-extrabold text-[9px] text-white uppercase shadow-inner border border-white/10">{s.initials}</div>
                      <span className="text-[12px] font-semibold text-white group-hover/s:translate-x-0.5 transition-transform">{s.name}</span>
                    </div>
                    <span className="text-[9px] font-extrabold text-white bg-white/20 px-2 py-1 rounded-lg border border-white/10 group-hover:bg-white/30 transition-colors">{s.match}%</span>
                  </Link>
                ))}
              </div>
            </div>
          </div>

          {/* ─ MIDDLE COLUMN ─ */}
          <div className="flex flex-col gap-5">

            {/* Stats filtrable : Saison / Ligue / Équipe + KPI + Barres */}
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

            {/* AI Insight */}
            <div className="glass-card bg-white p-0 shadow-sm relative overflow-hidden border-blue-100/50">
              <div className="ai-gradient text-white p-5 flex items-center gap-3">
                <span className="material-symbols-outlined text-[24px] !text-white">auto_awesome</span>
                <h3 className="label-caps !text-white text-[12px] !opacity-100 tracking-[0.12em] font-black">{t('ai.title')}</h3>
                <span className="bg-white/20 text-white text-[9px] font-black uppercase tracking-wider py-1 px-3 rounded-full ml-auto backdrop-blur-md border border-white/10">{t('ai.badge')}</span>
              </div>
              <div className="p-8 relative z-1 bg-gradient-to-b from-blue-50/30 to-transparent">
                <FormattedInsight text={p.aiInsight} />
              </div>
            </div>

            {/* Career — un tableau par compétition */}
            {(() => {
              const byComp = new Map<string, typeof p.career>()
              for (const row of p.career) {
                if (!byComp.has(row.competition)) byComp.set(row.competition, [])
                byComp.get(row.competition)!.push(row)
              }
              if (!byComp.size) return null
              return (
                <div className="flex flex-col gap-6 mt-4">
                  <div className="flex items-center gap-2 px-1">
                    <span className="material-symbols-outlined text-primary text-[20px]">history_edu</span>
                    <h3 className="label-caps text-primary text-[12px]">{t('career.title')}</h3>
                  </div>
                  
                  {Array.from(byComp.entries()).map(([comp, rows]) => (
                    <div key={comp} className="glass-card !bg-white rounded-2xl overflow-hidden border border-gray-100 shadow-sm">
                      {/* Section Header - Standings Style */}
                      <div className="px-4 py-3 md:px-5 md:py-3.5 border-b border-gray-50 flex items-center justify-between gap-2 bg-slate-50/30">
                        <span className="label-caps !text-slate-900 !text-[10px] font-black font-hl tracking-[0.15em]">{comp}</span>
                        <div className="flex items-center gap-2">
                          <span className="label-caps text-primary bg-primary/5 px-2 py-0.5 rounded-md text-[8px] font-black">{rows.length} {rows.length > 1 ? tc('labels.seasons') : tc('labels.season')}</span>
                        </div>
                      </div>

                      <div className="overflow-x-auto">
                        <table className="w-full border-collapse">
                          <thead>
                            <tr className="bg-slate-50/50 border-b border-gray-50">
                              <th className="py-2 px-3 text-[9px] font-black text-slate-500 uppercase tracking-widest text-left w-20">{tc('labels.season')}</th>
                              <th className="py-2 px-3 text-[9px] font-black text-slate-500 uppercase tracking-widest text-left">{tc('labels.team')}</th>
                              <th className="py-2 px-3 text-[9px] font-black font-hl text-slate-500 uppercase tracking-widest text-center w-12">{tc('stats.matches_played_abbr')}</th>
                              <th className="py-2 px-3 text-[9px] font-black font-hl text-slate-500 uppercase tracking-widest text-center w-16">{tc('stats.goals_assists_abbr')}</th>
                              <th className="py-2 px-3 text-[9px] font-black text-slate-900 uppercase tracking-widest text-center w-16">{tc('stats.rating')}</th>
                            </tr>
                          </thead>
                          <tbody className="divide-y divide-gray-50">
                            {rows.map((row) => (
                              <tr key={`${row.season}-${row.team}`} className="hover:bg-slate-50/50 transition-all group">
                                <td className="py-2 px-3">
                                  <span className="label-caps !text-slate-400 !text-[9px] font-black group-hover:text-primary transition-colors">
                                    {row.season}
                                  </span>
                                </td>
                                <td className="py-2 px-3">
                                  <div className="flex items-center gap-2.5">
                                    <div className="p-1 px-1.5 bg-white rounded-md shadow-[0_1px_3px_rgba(0,0,0,0.05)] border border-slate-100 group-hover:scale-110 transition-transform">
                                      <TeamBadge teamId={row.team_id ?? 0} teamName={row.team} size={14} />
                                    </div>
                                    <span className="text-[12px] font-bold text-slate-800 truncate max-w-[150px] tracking-tight group-hover:text-primary transition-colors">
                                      {row.team}
                                    </span>
                                  </div>
                                </td>
                                <td className="py-2 px-3 text-center text-[10px] font-bold font-hl text-slate-500">
                                  {row.matches || 0}
                                </td>
                                <td className="py-2 px-3">
                                  <div className="flex items-center justify-center gap-1.5 font-hl text-[10px]">
                                    <span className="text-slate-900 font-extrabold">{row.goals || 0}</span>
                                    <span className="text-slate-300 font-medium">/</span>
                                    <span className="text-primary font-extrabold">{row.assists || 0}</span>
                                  </div>
                                </td>
                                <td className="py-2 px-3 text-center">
                                  {row.rating > 0 ? (
                                    <span 
                                      className="inline-block min-w-[32px] font-hl font-black text-[10px] py-0.5 px-1.5 rounded-lg shadow-sm border border-blue-100 bg-blue-50/50 text-blue-600"
                                    >
                                      {row.rating.toFixed(1)}
                                    </span>
                                  ) : (
                                    <span className="label-caps text-slate-300 !text-[8px] font-semibold">—</span>
                                  )}
                                </td>
                              </tr>
                            ))}
                          </tbody>
                        </table>
                      </div>
                    </div>
                  ))}
                </div>
              )
            })()}
          </div>

          {/* ─ RIGHT SIDEBAR ─ */}
          <div className="flex flex-col gap-4">

            {/* Radar */}
            <div className="glass-card bg-white p-6 shadow-sm overflow-hidden">
              <div className="flex items-center justify-center gap-2 mb-8">
                <span className="material-symbols-outlined text-primary text-[20px]">radar</span>
                <h3 className="label-caps text-primary text-[11px]">{t('sections.skill_matrix')}</h3>
              </div>
              <div className="relative h-[240px] flex items-center justify-center -mt-4">
                <svg width="100%" height="100%" viewBox="0 0 100 100" className="drop-shadow-[0_8px_32px_rgba(30,64,175,0.2)] overflow-visible">
                  <defs>
                    <radialGradient id="radarGradient" cx="50%" cy="50%" r="50%" fx="50%" fy="50%">
                      <stop offset="0%" stopColor="#3b82f6" stopOpacity="0.3" />
                      <stop offset="100%" stopColor="#1e40af" stopOpacity="0.1" />
                    </radialGradient>
                    <filter id="glow">
                      <feGaussianBlur stdDeviation="1.5" result="coloredBlur"/>
                      <feMerge>
                        <feMergeNode in="coloredBlur"/><feMergeNode in="SourceGraphic"/>
                      </feMerge>
                    </filter>
                  </defs>
                  
                  {/* Axis */}
                  <polygon points="50,15 85,38 72,82 28,82 15,38" fill="none" stroke="#e2e8f0" strokeWidth="0.5"/>
                  <polygon points="50,25 75,41 66,72 34,72 25,41" fill="none" stroke="#e2e8f0" strokeWidth="0.5"/>
                  <polygon points="50,35 65,45 60,62 40,62 35,45" fill="none" stroke="#e2e8f0" strokeWidth="0.5"/>
                  
                  {/* Potential Area (Dashed) */}
                  <polygon points="50,12 87,36 74,85 26,85 13,36" 
                    className="radar-area-potential opacity-40 transition-all duration-1000" />

                  {/* Radar Area (Filled) */}
                  <polygon points="50,18 82,40 68,78 32,75 20,42" 
                    fill="url(#radarGradient)" 
                    stroke="var(--color-primary)" 
                    strokeWidth="1.5" 
                    filter="url(#glow)"
                    className="radar-area-current shadow-xl transition-all duration-1000" />
                  
                  {/* Data Points */}
                  {[
                    { x: 50, y: 18 }, { x: 82, y: 40 }, { x: 68, y: 78 }, { x: 32, y: 75 }, { x: 20, y: 42 }
                  ].map((pt, i) => (
                    <circle key={i} cx={pt.x} cy={pt.y} r="1.5" fill="var(--color-primary)" stroke="white" strokeWidth="0.5" />
                  ))}
                  
                  {/* Labels */}
                  <text className="label-caps font-black opacity-40 capitalize" style={{ fontSize: '4.5px' }} x="50" y="8" textAnchor="middle">{tRadar('speed')}</text>
                  <text className="label-caps font-black opacity-40 capitalize" style={{ fontSize: '4.5px' }} x="92" y="42" textAnchor="start">{tRadar('dribble')}</text>
                  <text className="label-caps font-black opacity-40 capitalize" style={{ fontSize: '4.5px' }} x="72" y="90" textAnchor="middle">{tRadar('passes')}</text>
                  <text className="label-caps font-black opacity-40 capitalize" style={{ fontSize: '4.5px' }} x="28" y="90" textAnchor="middle">{tRadar('tech')}</text>
                  <text className="label-caps font-black opacity-40 capitalize" style={{ fontSize: '4.5px' }} x="8" y="42" textAnchor="end">{tRadar('finish')}</text>
                </svg>
              </div>
              <div className="grid grid-cols-2 gap-3 mt-4">
                <div className="text-center bg-slate-50 rounded-2xl p-4 border border-slate-100">
                  <div className="label-caps mb-1 opacity-70 text-[9px]">{tRadar('creativity')}</div>
                  <div className="font-hl font-black text-[22px] text-primary">{p.radar.creativity}</div>
                </div>
                <div className="text-center bg-slate-50 rounded-2xl p-4 border border-slate-100">
                  <div className="label-caps mb-1 opacity-70 text-[9px]">{tRadar('vision')}</div>
                  <div className="font-hl font-black text-[22px] text-primary">{p.radar.vision}</div>
                </div>
              </div>
            </div>

            {/* Tactical roles */}
            <div className="glass-card bg-slate-50/80 p-6 overflow-hidden border-slate-200/50">
              <div className="flex items-center gap-2 mb-6">
                <span className="material-symbols-outlined text-primary text-[20px]">tactic</span>
                <h3 className="label-caps text-primary text-[11px]">{t('sections.tactical_roles')}</h3>
              </div>
              <div className="flex flex-col gap-4">
                {p.tacticalRoles.map((role) => (
                  <div key={role.role}>
                    <div className="flex justify-between items-end mb-1.5">
                      <span className="text-[12px] font-semibold text-slate-900">{role.role}</span>
                      <span className="font-hl font-extrabold text-[14px] text-primary">{role.pct}%</span>
                    </div>
                    <div className="h-1.5 bg-slate-200 rounded-full overflow-hidden shadow-inner">
                      <div className="bar-grow h-full rounded-full shadow-sm" style={{ width:`${role.pct}%`, backgroundColor: role.pct >= 70 ? 'var(--color-primary)' : '#94a3b8' }} />
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* Strengths & weaknesses */}
            <div className="glass-card bg-white p-6 overflow-hidden shadow-sm">
              <div className="flex items-center gap-2 mb-6">
                <span className="material-symbols-outlined text-primary text-[20px]">insights</span>
                <h3 className="label-caps text-primary text-[11px]">{t('sections.strengths_weaknesses')}</h3>
              </div>
              <div className="flex flex-col gap-3">
                {p.strengths.map((s) => (
                  <div key={s} className="flex items-start gap-3 p-2.5 bg-emerald-50/50 rounded-2xl border border-emerald-100/50 group hover:bg-emerald-50 transition-colors">
                    <span className="material-symbols-outlined text-emerald-600 text-[18px]">check_circle</span>
                    <div className="text-[12px] font-semibold text-slate-800 leading-snug">{s}</div>
                  </div>
                ))}
                {p.weaknesses.map((w) => (
                  <div key={w} className="flex items-start gap-3 p-2.5 bg-amber-50/50 rounded-2xl border border-amber-100/50 group hover:bg-amber-50 transition-colors">
                    <span className="material-symbols-outlined text-amber-600 text-[18px]">warning</span>
                    <div className="text-[12px] font-normal text-slate-600 leading-snug">{w}</div>
                  </div>
                ))}
              </div>
            </div>

            {/* Trophées & Palmarès */}
            <div className="glass-card bg-white p-6 overflow-hidden shadow-sm">
              <div className="flex items-center gap-2 mb-6">
                <span className="material-symbols-outlined text-primary text-[20px]">emoji_events</span>
                <h3 className="label-caps text-primary text-[11px]">{t('sections.trophies')}</h3>
                {trophyWins.length > 0 && (
                  <span className="ml-auto ai-gradient text-white text-[10px] font-black py-0.5 px-2.5 rounded-full shadow-sm ring-4 ring-blue-50">
                    {trophyWins.length}
                  </span>
                )}
              </div>
              {trophyList.length === 0 ? (
                <p className="text-[12px] text-slate-400 italic px-1">{t('sections.no_trophies')}</p>
              ) : (
                <div className="flex flex-col gap-2">
                  {trophyWins.map((trophy, i) => (
                    <div key={`w-${i}`} className="flex items-center gap-3 p-2.5 bg-slate-50/50 rounded-2xl border border-slate-100 group hover:border-blue-200 transition-all">
                      <span className="text-xl drop-shadow-sm group-hover:scale-110 transition-transform">🏆</span>
                      <div className="min-w-0">
                        <div className="text-[12px] font-semibold text-slate-900 truncate">{trophy.league}</div>
                        <div className="label-caps text-primary text-[8px] mt-0.5">{trophy.season} <span className="opacity-40 mx-1">·</span> {t('sections.trophies_winner')}</div>
                      </div>
                    </div>
                  ))}
                  {trophyRunners.map((trophy, i) => (
                    <div key={`r-${i}`} className="flex items-center gap-3 p-2.5 bg-slate-50/50 rounded-2xl border border-slate-100 group hover:border-slate-200 transition-all">
                      <span className="text-xl drop-shadow-sm opacity-60">🥈</span>
                      <div className="min-w-0">
                        <div className="text-[12px] font-semibold text-slate-700 truncate">{trophy.league}</div>
                        <div className="label-caps text-slate-400 text-[8px] mt-0.5">{trophy.season} <span className="opacity-40 mx-1">·</span> {t('sections.trophies_runner_up')}</div>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>

            {/* Pro CTA */}
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
        </div>
      </main>
    </>
  );
}
