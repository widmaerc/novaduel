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
    r === 'V' || r === 'W' ? '#22c55e' : r === 'N' || r === 'D' ? '#f59e0b' : '#ef4444';

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

      <main className="max-w-[1440px] mx-auto px-10 pb-20">

        {/* ── HERO ─────────────────────────────────────────── */}
        <section className="a1 relative grid grid-cols-[420px_1fr] gap-10 items-end py-9 pb-10 border-b border-[#c2c6d2]/20 mb-10">

          {/* Left: player visual */}
          <div className="relative">
            {/* Breadcrumb */}
            <div className="text-[12px] text-[#727782] mb-5 flex items-center gap-1.5">
              <Link href={`/${locale}`} className="text-[#727782] hover:text-primary transition-colors no-underline">{t('breadcrumb.home')}</Link> ›
              <Link href={localizedHref(locale, '/players')} className="text-[#727782] hover:text-primary transition-colors no-underline">{t('breadcrumb.players')}</Link> ›
              <span className="text-[#191c1d]">{p.name}</span>
            </div>

            {/* Avatar area */}
            {(() => {
              const avatarPalette: Record<string, { from: string; to: string; text: string }> = {
                ATT: { from: '#fef2f2', to: '#fee2e2', text: '#dc2626' },
                MIL: { from: '#eff6ff', to: '#dbeafe', text: '#004782' },
                DEF: { from: '#f0fdf4', to: '#dcfce7', text: '#15803d' },
                GK:  { from: '#f5f3ff', to: '#ede9fe', text: '#6d28d9' },
              }
              const pal = avatarPalette[player.position] ?? { from: '#f3f4f6', to: '#e5e7eb', text: '#727782' }
              return (
            <div className="relative rounded-2xl overflow-hidden h-[450px] flex items-center justify-center shadow-inner group"
              style={{ background: `linear-gradient(135deg, ${pal.from}, ${pal.to})` }}>
              <div className="absolute inset-0 bg-[radial-gradient(circle_at_50%_40%,rgba(255,255,255,0.5),transparent)]" />

              <span className="font-hl font-black text-[120px] select-none tracking-tighter z-1 uppercase"
                style={{ color: pal.text, opacity: 0.15 }}>
                {p.initials}
              </span>

              {/* Decorative accent */}
              <div className="absolute inset-0 border-[16px] border-white/40 pointer-events-none" />

              {/* Elite badge */}
              <div className="absolute top-4 left-4 z-10">
                <span className="bg-primary/80 !text-white font-hl font-extrabold text-[8px] uppercase tracking-[0.15em] py-1.5 px-3.5 rounded-full backdrop-blur-md border border-white/20">
                  <span className="opacity-90">⭐ {tc('labels.elite_badge')}</span>
                </span>
              </div>

              {/* Rating glass */}
              <div className="glass-panel absolute top-4 right-4 z-10 rounded-2xl p-3 px-4 text-center shadow-lg">
                <div className="text-[9px] font-extrabold uppercase tracking-[0.12em] text-primary/70 mb-1">{tc('labels.global_rating')}</div>
                <div className="count font-hl font-black text-[32px] text-primary leading-none">{p.ratingDisplay}</div>
                <div className="flex gap-0.5 justify-center mt-1.5">
                  {[...Array(5)].map((_, i) => (
                    <span key={i} className={`w-1.5 h-1.5 rounded-full ${i < p.ratingStars ? 'bg-primary' : 'bg-[#c2c6d2]'}`} />
                  ))}
                </div>
              </div>

              {/* Shirt number badge */}
              {(player.shirt_number ?? 0) > 0 && (
                <div className="glass-panel absolute bottom-4 right-4 z-10 rounded-xl px-3 py-1.5 text-center shadow-lg min-w-[48px]">
                  <div className="text-[8px] font-extrabold uppercase tracking-[0.12em] text-primary/60 leading-none mb-0.5">#</div>
                  <div className="font-hl font-black text-[22px] text-primary leading-none">{player.shirt_number}</div>
                </div>
              )}

              {/* Form dots */}
              <div className="absolute bottom-4 left-4 z-10 flex gap-1.5 items-center">
                <span className="text-[9px] font-bold text-white/70 uppercase tracking-[0.08em] mr-1">{tc('stats.form')}</span>
                {p.form.map((r, i) => (
                  <div key={i} className="w-6 h-6 rounded-full flex items-center justify-center font-hl font-extrabold text-[10px] text-white border-2 border-white/30" style={{ backgroundColor: formColor(r) }}>{r}</div>
                ))}
              </div>
            </div>
              )
            })()}
          </div>

          {/* Right: identity */}
          <div className="pb-3">
            <div className="flex items-center gap-2.5 mb-4">
              <span className="bg-primary/10 text-primary border border-primary/20 rounded-full text-[9px] font-extrabold uppercase tracking-[0.12em] py-1 px-3">{p.positionLabel}</span>
              <span className="flex items-center gap-1.5 text-[12px] text-[#424751]">
                <TeamBadge teamId={0} teamName={player.team ?? ''} size={18} />
                {p.team} · {p.league}
              </span>
              <span className="text-xl">{p.flag}</span>
            </div>

            <h1 className="font-hl font-black text-[38px] md:text-[44px] lg:text-[48px] leading-[0.95] -tracking-[1.5px] text-primary uppercase mb-2">
              {p.firstName}<br />
              <span className="text-[#727782]">{p.lastName}</span>
            </h1>
            <div className="text-[14px] text-[#727782] italic mb-7">{p.nicknames}</div>

            {/* Quick info grid */}
            <div className="grid grid-cols-4 gap-4 bg-[#f3f4f5] rounded-2xl p-5 mb-7">
              {[
                { label: t('profile.nationality'), value: p.nationality },
                { label: t('profile.age'), value: `${p.age} ${tc('units.years')}` },
                { label: t('profile.position'), value: tc(`positions.${(player.position === 'MIL' ? 'mid' : player.position).toLowerCase()}`) },
                { label: t('profile.value'), value: p.marketValue, blue: true },
              ].map((item) => (
                <div key={item.label}>
                  <div className="text-[9px] font-extrabold uppercase tracking-[0.1em] text-[#727782] mb-1">{item.label}</div>
                  <div className={`text-[13px] font-semibold ${item.blue ? 'text-primary' : 'text-[#191c1d]'}`}>{item.value}</div>
                </div>
              ))}
            </div>

            {/* CTA */}
            <div className="flex gap-2.5 flex-wrap">
              <Link href={localizedHref(locale, `/compare?a=${p.id}`)} className="flex items-center gap-2 bg-primary !text-white py-3 px-6 rounded-full font-hl font-extrabold text-[12px] uppercase tracking-[0.08em] no-underline shadow-[0_4px_16px_rgba(0,71,130,0.25)] hover:bg-[#185fa5] transition-all">
                <span className="material-symbols-outlined text-base !text-white">compare_arrows</span>
                <span className="!text-white">{tc('buttons.compare')} {p.firstName}</span>
              </Link>
              <button className="flex items-center gap-2 bg-white text-primary border-1.5 border-primary/20 py-3 px-5 rounded-full font-hl font-bold text-[12px] uppercase tracking-[0.06em] cursor-pointer hover:bg-primary/5 transition-all">
                <span className="material-symbols-outlined text-base">bookmark</span>
                {tc('buttons.save')}
              </button>
              <button className="flex items-center gap-2 bg-white text-[#424751] border-1.5 border-[#e1e3e4] py-3 px-5 rounded-full font-hl font-bold text-[12px] uppercase tracking-[0.06em] cursor-pointer hover:bg-[#f3f4f5] transition-all">
                <span className="material-symbols-outlined text-base">share</span>
                {tc('buttons.share')}
              </button>
            </div>
          </div>
        </section>

        {/* ── BENTO GRID ──────────────────────────────────── */}
        <div className="grid grid-cols-[280px_1fr_280px] gap-5 items-start">

          {/* ─ LEFT SIDEBAR ─ */}
          <div className="flex flex-col gap-4">

            {/* Quick scout */}
            <div className="a2 bg-white rounded-2xl border border-[#c2c6d2]/20 p-5 overflow-hidden shadow-sm">
              <div className="-mx-5 -mt-5 px-5 py-2.5 mb-4 bg-[#f8f9fa] border-b border-[#eef0f2]">
                <h3 className="font-hl font-extrabold text-[13px] text-primary">{t('profile.quick_scout_title')}</h3>
              </div>
              <div className="flex flex-col">
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
                  <div key={row.label} className="pl-row flex justify-between items-center py-2 border-b border-[#f3f4f5] last:border-0">
                    <span className="text-[12px] text-[#424751]">{row.label}</span>
                    <span className={`text-[12px] font-semibold ${row.blue ? 'text-primary' : 'text-[#191c1d]'}`}>{row.value}</span>
                  </div>
                ))}
              </div>
            </div>

            {/* Similar profiles */}
            <div className="a3 bg-primary rounded-2xl p-5 relative overflow-hidden">
              <div className="absolute -top-5 -right-5 w-25 h-25 bg-white/5 rounded-full pointer-events-none" />
              <div className="-mx-5 -mt-5 px-5 py-2.5 mb-4 bg-white/10 border-b border-white/15 relative z-1">
                <h3 className="font-hl font-extrabold text-[13px] text-white">{t('sections.similar_profiles')}</h3>
              </div>
              <div className="flex flex-col gap-1.5 relative z-1">
                {p.similar.map((s) => (
                  <Link key={s.name} href={localizedHref(locale, `/player/${s.slug}`)} className="flex items-center justify-between p-2 px-3 bg-white/10 rounded-xl no-underline hover:bg-white/20 transition-colors group/s">
                    <div className="flex items-center gap-2.5">
                      <div className="w-7 h-7 rounded-full bg-white/20 flex items-center justify-center font-hl font-extrabold text-[9px] text-white uppercase">{s.initials}</div>
                      <span className="text-[12px] font-semibold text-white group-hover/s:text-blue-200 transition-colors">{s.name}</span>
                    </div>
                    <span className="text-[10px] font-bold text-[#a4c9ff]">{s.match} %</span>
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
            <div className="a4 bg-white rounded-2xl border-l-4 border-primary p-6 shadow-sm relative overflow-hidden">
              <div className="absolute -bottom-2 -right-2 opacity-[0.03] pointer-events-none">
                <span className="material-symbols-outlined text-[100px] text-primary">psychology</span>
              </div>
              <div className="-mx-6 -mt-6 px-6 py-3 mb-4 bg-[#EFF6FF] border-b border-[#dbeafe] flex items-center gap-2.5">
                <span className="material-symbols-outlined text-[20px] text-primary">psychology</span>
                <h3 className="font-hl font-extrabold text-[15px] text-primary">{t('ai.title')}</h3>
                <span className="bg-primary/10 text-primary text-[8px] font-extrabold uppercase tracking-[0.1em] py-1 px-2 rounded-full ml-auto">{t('ai.badge')}</span>
              </div>
              <div className="relative z-1">
                <FormattedInsight text={p.aiInsight} />
              </div>
            </div>

            {/* Career — un tableau par compétition */}
            {(() => {
              // Grouper par compétition
              const byComp = new Map<string, typeof p.career>()
              for (const row of p.career) {
                if (!byComp.has(row.competition)) byComp.set(row.competition, [])
                byComp.get(row.competition)!.push(row)
              }
              if (!byComp.size) return null
              return (
                <div className="a5 flex flex-col gap-4">
                  <h3 className="font-hl font-extrabold text-[14px] text-primary">{t('career.title')}</h3>
                  {Array.from(byComp.entries()).map(([comp, rows]) => (
                    <div key={comp} className="bg-white rounded-2xl border border-[#c2c6d2]/20 overflow-hidden shadow-sm">
                      <div className="px-5 py-3 border-b border-[#f3f4f5] flex items-center gap-2">
                        <span className="bg-[#EFF6FF] text-primary text-[9px] font-extrabold uppercase tracking-[0.08em] py-1 px-2.5 rounded">{comp}</span>
                        <span className="text-[10px] text-[#727782]">{rows.length} saison{rows.length > 1 ? 's' : ''}</span>
                      </div>
                      <div className="overflow-x-auto">
                        <table className="w-full border-collapse">
                          <thead>
                            <tr className="bg-[#f3f4f5]">
                              {[tc('labels.season'), tc('labels.team'), tc('stats.matches_played_abbr'), tc('stats.goals_assists_abbr'), tc('stats.rating')].map((h) => (
                                <th key={h} className={`py-2 px-5 text-[9px] font-black uppercase tracking-[0.08em] text-[#727782] ${h === tc('labels.season') || h === tc('labels.team') ? 'text-left' : 'text-center'}`}>{h}</th>
                              ))}
                            </tr>
                          </thead>
                          <tbody>
                            {rows.map((row) => (
                              <tr key={`${row.season}-${row.team}`} className="border-b border-[#f3f4f5] last:border-0 hover:bg-[#f3f4f5] transition-colors">
                                <td className="py-2.5 px-5 text-[12px] font-bold text-[#191c1d]">{row.season}</td>
                                <td className="py-2.5 px-5 text-[12px] text-[#424751] flex items-center gap-1.5">
                                  <TeamBadge teamId={row.team_id ?? 0} teamName={row.team} size={16} />
                                  {row.team}
                                </td>
                                <td className="py-2.5 px-5 text-center font-hl font-bold text-[12px] text-[#191c1d]">{row.matches}</td>
                                <td className="py-2.5 px-5 text-center font-hl font-bold text-[12px] text-[#191c1d]">{row.goals} / {row.assists}</td>
                                <td className="py-2.5 px-5 text-center">
                                  {row.rating > 0
                                    ? <span className="text-[10px] font-black py-0.5 px-2 rounded-lg" style={{ backgroundColor: row.ratingColor, color: row.ratingText }}>{row.rating.toFixed(1)}</span>
                                    : <span className="text-[10px] text-[#c2c6d2]">—</span>
                                  }
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
            <div className="a2 bg-white rounded-2xl border border-[#c2c6d2]/20 p-5 overflow-hidden shadow-sm">
              <div className="-mx-5 -mt-5 px-5 py-2.5 mb-4 bg-[#f8f9fa] border-b border-[#eef0f2] text-center">
                <h3 className="font-hl font-extrabold text-[13px] text-primary">{t('sections.skill_matrix')}</h3>
              </div>
              <div className="relative h-[180px] flex items-center justify-center">
                <svg width="100%" height="100%" viewBox="0 0 100 100" className="drop-shadow-[0_4px_12px_rgba(0,71,130,0.1)]">
                  <polygon points="50,15 85,38 72,82 28,82 15,38" fill="none" stroke="#e1e3e4" strokeWidth="0.5"/>
                  <polygon points="50,25 75,41 66,72 34,72 25,41" fill="none" stroke="#e1e3e4" strokeWidth="0.5"/>
                  <polygon points="50,35 65,45 60,62 40,62 35,45" fill="none" stroke="#e1e3e4" strokeWidth="0.5"/>
                  <polygon points="50,18 82,40 68,78 32,75 20,42" fill="rgba(0,71,130,0.12)" stroke="var(--color-primary)" strokeWidth="1.2"/>
                  <circle cx="50" cy="18" r="1.5" fill="var(--color-primary)"/>
                  <circle cx="82" cy="40" r="1.5" fill="var(--color-primary)"/>
                  <circle cx="68" cy="78" r="1.5" fill="var(--color-primary)"/>
                  <circle cx="32" cy="75" r="1.5" fill="var(--color-primary)"/>
                  <circle cx="20"  cy="42" r="1.5" fill="var(--color-primary)"/>
                  <text className="radar-label" x="50" y="10" textAnchor="middle">{tRadar('speed')}</text>
                  <text className="radar-label" x="88" y="42" textAnchor="start">{tRadar('dribble')}</text>
                  <text className="radar-label" x="72" y="88" textAnchor="middle">{tRadar('passes')}</text>
                  <text className="radar-label" x="28" y="88" textAnchor="middle">{tRadar('tech')}</text>
                  <text className="radar-label" x="12" y="42" textAnchor="end">{tRadar('finish')}</text>
                </svg>
              </div>
              <div className="grid grid-cols-2 gap-2.5 mt-3">
                <div className="text-center bg-[#f3f4f5] rounded-lg p-2.5">
                  <div className="text-[11px] text-[#424751] mb-1">{tRadar('creativity')}</div>
                  <div className="font-hl font-black text-[20px] text-primary">{p.radar.creativity}</div>
                </div>
                <div className="text-center bg-[#f3f4f5] rounded-lg p-2.5">
                  <div className="text-[11px] text-[#424751] mb-1">{tRadar('vision')}</div>
                  <div className="font-hl font-black text-[20px] text-primary">{p.radar.vision}</div>
                </div>
              </div>
            </div>

            {/* Tactical roles */}
            <div className="a3 bg-[#f3f4f5] rounded-2xl border border-[#c2c6d2]/20 p-5.5 overflow-hidden">
              <div className="-mx-5.5 -mt-5.5 px-5.5 py-2.5 mb-4 bg-[#e8eaec] border-b border-[#d8dce0]">
                <h3 className="font-hl font-extrabold text-[14px] text-primary">{t('sections.tactical_roles')}</h3>
              </div>
              <div className="flex flex-col gap-3">
                {p.tacticalRoles.map((role) => (
                  <div key={role.role}>
                    <div className="flex justify-between text-[12px] font-bold text-[#191c1d] mb-1">
                      <span>{role.role}</span><span>{role.pct}%</span>
                    </div>
                    <div className="h-1 bg-[#e1e3e4] rounded-full overflow-hidden">
                      <div className="bar-grow h-full rounded-full" style={{ width:`${role.pct}%`, backgroundColor: role.pct >= 70 ? 'var(--color-primary)' : '#727782' }} />
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* Strengths & weaknesses */}
            <div className="a4 bg-white rounded-2xl border border-[#c2c6d2]/20 p-5.5 overflow-hidden shadow-sm">
              <div className="-mx-5.5 -mt-5.5 px-5.5 py-2.5 mb-4 bg-[#f8f9fa] border-b border-[#eef0f2]">
                <h3 className="font-hl font-extrabold text-[14px] text-primary">{t('sections.strengths_weaknesses')}</h3>
              </div>
              <div className="flex flex-col gap-2">
                {p.strengths.map((s) => (
                  <div key={s} className="flex items-start gap-2.5 p-2 rounded-lg">
                    <span className="text-[15px] shrink-0">✅</span>
                    <div className="text-[13px] font-bold text-[#191c1d]">{s}</div>
                  </div>
                ))}
                <div className="h-px bg-[#f3f4f5] my-1" />
                {p.weaknesses.map((w) => (
                  <div key={w} className="flex items-start gap-2.5 p-2 rounded-lg">
                    <span className="text-[15px] shrink-0">⚠️</span>
                    <div className="text-[13px] font-medium text-[#727782]">{w}</div>
                  </div>
                ))}
              </div>
            </div>

            {/* Trophées & Palmarès */}
            <div className="a5 bg-white rounded-2xl border border-[#c2c6d2]/20 p-5 overflow-hidden shadow-sm">
              <div className="-mx-5 -mt-5 px-5 py-2.5 mb-4 bg-[#f8f9fa] border-b border-[#eef0f2] flex items-center gap-2">
                <span className="material-symbols-outlined text-[18px] text-primary">emoji_events</span>
                <h3 className="font-hl font-extrabold text-[13px] text-primary">{t('sections.trophies')}</h3>
                {trophyWins.length > 0 && (
                  <span className="ml-auto bg-primary/10 text-primary text-[9px] font-extrabold uppercase tracking-[0.1em] py-0.5 px-2 rounded-full">
                    {trophyWins.length} 🏆
                  </span>
                )}
              </div>
              {trophyList.length === 0 ? (
                <p className="text-[12px] text-[#727782] italic">{t('sections.no_trophies')}</p>
              ) : (
                <div className="flex flex-col gap-1">
                  {trophyWins.map((trophy, i) => (
                    <div key={`w-${i}`} className="flex items-start gap-2 py-1.5 border-b border-[#f3f4f5] last:border-0">
                      <span className="text-[14px] shrink-0 mt-0.5">🏆</span>
                      <div className="min-w-0">
                        <div className="text-[11px] font-bold text-[#191c1d] truncate">{trophy.league}</div>
                        <div className="text-[10px] text-[#727782]">{trophy.season} · <span className="text-primary font-semibold">{t('sections.trophies_winner')}</span></div>
                      </div>
                    </div>
                  ))}
                  {trophyRunners.map((trophy, i) => (
                    <div key={`r-${i}`} className="flex items-start gap-2 py-1.5 border-b border-[#f3f4f5] last:border-0">
                      <span className="text-[14px] shrink-0 mt-0.5">🥈</span>
                      <div className="min-w-0">
                        <div className="text-[11px] font-bold text-[#424751] truncate">{trophy.league}</div>
                        <div className="text-[10px] text-[#727782]">{trophy.season} · <span className="text-[#727782] font-semibold">{t('sections.trophies_runner_up')}</span></div>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>

            {/* Pro CTA */}
            <div className="a6 bg-slate-900 rounded-2xl p-5.5 text-white">
              <div className="text-[10px] font-black uppercase tracking-[0.15em] text-blue-400 mb-2">{tc('labels.pro_scouting')}</div>
              <div className="text-[13px] font-medium text-white/75 leading-relaxed mb-4.5">{tc('labels.pro_scouting_sub')}</div>
              <button className="w-full py-2.5 bg-blue-600 border-0 rounded-lg font-hl font-extrabold text-[12px] uppercase tracking-[0.08em] text-white cursor-pointer hover:bg-blue-700 transition-colors">
                {tc('labels.pro_scouting_cta')}
              </button>
            </div>
          </div>
        </div>
      </main>
    </>
  );
}
