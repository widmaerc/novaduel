import { getTranslations, getLocale } from 'next-intl/server';
import Link from 'next/link';
import { notFound } from 'next/navigation';
import type { Metadata } from 'next';
import { getPlayerBySlug } from '@/lib/data';
import { FormattedInsight } from '@/components/FormattedInsight';
import { buildAlternates } from '@/lib/hreflang';
import { localizedHref } from '@/lib/localizedPaths';

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
  const [t, tc, tRadar, locale, player] = await Promise.all([
    getTranslations('PlayerPage'),
    getTranslations('Common'),
    getTranslations('Radar'),
    getLocale(),
    params.then(p => getPlayerBySlug(p.slug, p.locale)),
  ]);

  if (!player) notFound();

  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const isMissingData = (player as any).is_missing_data === true;

  const aiInsight = player.ai_insight ?? '';

  // ─── Derived values ───────────────────────────────────────────────
  const minPerGoal = (!isMissingData && player.goals > 0) ? Math.round(player.minutes / player.goals) : 0;
  const form = player.recent_form ? player.recent_form.split(',') : [];
  const nameParts = player.name.split(' ');
  const firstName = nameParts[0];
  const lastName = nameParts.slice(1).join(' ');
  const ratingStars = isMissingData ? 0 : Math.round((Number(player.rating) / 10) * 5);

  const playerStatsList = [
    { label: tc('stats.goals_match'), value: isMissingData ? 'N/D' : (Number(player.matches) > 0 ? (Number(player.goals) / Number(player.matches)).toFixed(2) : '0.00'), pct: isMissingData ? 0 : Math.min(100, (Number(player.goals) / Math.max(Number(player.matches), 1)) * 100) },
    { label: tc('stats.pass_acc'), value: isMissingData ? 'N/D' : `${player.pass_accuracy}%`, pct: isMissingData ? 0 : Number(player.pass_accuracy) },
    { label: tc('stats.dribbles_match'), value: isMissingData ? 'N/D' : String(player.dribbles), pct: isMissingData ? 0 : Math.min(100, Number(player.dribbles) * 20) },
    { label: tc('stats.duels_won'), value: isMissingData ? 'N/D' : `${player.duels_won}%`, pct: isMissingData ? 0 : Number(player.duels_won) },
    { label: tc('stats.shots_on_target'), value: isMissingData ? 'N/D' : String(player.shots_on_target), pct: isMissingData ? 0 : Math.min(100, Number(player.shots_on_target) * 25) },
    { label: tc('stats.xg'), value: isMissingData ? 'N/D' : String(player.xg), pct: isMissingData ? 0 : Math.min(100, (Number(player.xg) / 30) * 100) },
  ];

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
    birth: player.date_of_birth ? new Date(player.date_of_birth).toLocaleDateString(locale === 'fr' ? 'fr-FR' : locale === 'es' ? 'es-ES' : 'en-GB', { day: 'numeric', month: 'long', year: 'numeric' }) : '—',
    yellowCards: isMissingData ? 'N/D' : player.yellow_cards,
    minutesPerGoal: isMissingData ? 'N/D' : (minPerGoal > 0 ? `${minPerGoal}'` : '—'),
    form: isMissingData ? [] : form,
    kpi: { 
      goals: isMissingData ? 'N/D' : player.goals, 
      assists: isMissingData ? 'N/D' : player.assists, 
      matches: isMissingData ? 'N/D' : player.matches, 
      passes: isMissingData ? 'N/D' : `${player.pass_accuracy}%` 
    },
    stats: playerStatsList,
    aiInsight,
    aiTags: [] as string[],
    career: [] as { season: string; team: string; competition: string; status: string; matches: number; goals: number; assists: number; rating: number; ratingColor: string; ratingText: string }[],
    similar: [
      { name: 'Kylian Mbappé', initials: 'KM', match: '98', slug: 'kylian-mbappe' },
      { name: 'Erling Haaland', initials: 'EH', match: '94', slug: 'erling-haaland' },
      { name: 'Vinícius Jr.', initials: 'VJ', match: '92', slug: 'vinicius-junior' },
    ] as { name: string; initials: string; match: string; slug: string }[],
    radar: { creativity: isMissingData ? 0 : Math.round(Number(player.pass_accuracy)), vision: isMissingData ? 0 : Math.round(Number(player.pass_accuracy) * 0.97) },
    tacticalRoles: isMissingData ? [] : [
      { role: t('sections.tactical_roles'), pct: 90 },
      { role: player.positionLabel, pct: 75 },
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
        '@type': 'Person',
        'name': player.name,
        'alternateName': player.common_name,
        'description': aiInsight.slice(0, 160),
        'image': player.image_url,
        'nationality': {
          '@type': 'Country',
          'name': player.nationality,
        },
        'birthDate': player.date_of_birth,
        'height': player.height ? { '@type': 'QuantitativeValue', 'value': player.height, 'unitCode': 'CMT' } : undefined,
        'weight': player.weight ? { '@type': 'QuantitativeValue', 'value': player.weight, 'unitCode': 'KGM' } : undefined,
        'memberOf': {
          '@type': 'SportsOrganization',
          'name': player.team,
          'logo': player.team_logo_url
        },
        'jobTitle': player.position_name || player.position,
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
            <div className="relative rounded-2xl overflow-hidden h-[450px] flex items-center justify-center shadow-inner group">
              <div className="absolute inset-0 bg-[linear-gradient(135deg,#f3f4f6,#e5e7eb)]" />
              <div className="absolute inset-0 bg-[radial-gradient(circle_at_50%_40%,rgba(0,71,130,0.06),transparent)]" />
              
              <span className="font-hl font-black text-[100px] text-primary/[0.07] select-none tracking-tighter z-1 uppercase">
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

              {/* Form dots */}
              <div className="absolute bottom-4 left-4 z-10 flex gap-1.5 items-center">
                <span className="text-[9px] font-bold text-white/70 uppercase tracking-[0.08em] mr-1">{tc('stats.form')}</span>
                {p.form.map((r, i) => (
                  <div key={i} className="w-6 h-6 rounded-full flex items-center justify-center font-hl font-extrabold text-[10px] text-white border-2 border-white/30" style={{ backgroundColor: formColor(r) }}>{r}</div>
                ))}
              </div>
            </div>
          </div>

          {/* Right: identity */}
          <div className="pb-3">
            <div className="flex items-center gap-2.5 mb-4">
              <span className="bg-primary/10 text-primary border border-primary/20 rounded-full text-[9px] font-extrabold uppercase tracking-[0.12em] py-1 px-3">{p.positionLabel}</span>
              <span className="text-[12px] text-[#424751]">{p.team} · {p.league}</span>
              <span className="text-xl">{p.flag}</span>
            </div>

            <h1 className="font-hl font-black text-[38px] md:text-[44px] lg:text-[48px] leading-[0.95] -tracking-[1.5px] text-primary uppercase mb-2">
              {p.firstName}<br />
              <span className="text-[#c2c6d2]/50">{p.lastName}</span>
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
            <div className="a2 bg-white rounded-2xl border border-[#c2c6d2]/20 p-5 shadow-sm">
              <h3 className="font-hl font-extrabold text-[13px] text-primary mb-4">{t('profile.quick_scout_title')}</h3>
              <div className="flex flex-col">
                {[
                  { label: t('profile.height'), value: p.height },
                  { label: t('profile.foot'), value: p.foot },
                  { label: t('profile.number'), value: p.number },
                  { label: t('profile.contract'), value: p.contract },
                  { label: t('profile.birth'), value: p.birth },
                  { label: t('stats.yellow_cards'), value: String(p.yellowCards) },
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
              <h3 className="font-hl font-extrabold text-[13px] text-white mb-4 relative z-1">{t('sections.similar_profiles')}</h3>
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

            {/* KPI Cards */}
            <div className="a2 grid grid-cols-4 gap-3">
              {[
                { label: t('stats.kpi_goals'), value: p.kpi.goals, sub: 'Top 10%', blue: true },
                { label: t('stats.kpi_assists'), value: p.kpi.assists, sub: 'Top 3%', blue: true },
                { label: t('stats.kpi_matches'), value: p.kpi.matches, sub: '2025–26', blue: false },
                { label: t('stats.kpi_passes'), value: p.kpi.passes, sub: '+6% vs moy.', blue: true },
              ].map((kpi) => (
                <div key={kpi.label} className="bg-white rounded-xl p-4 text-center border border-[#c2c6d2]/20 shadow-sm">
                  <div className="text-[9px] font-black uppercase tracking-[0.1em] text-[#727782] mb-1.5">{kpi.label}</div>
                  <div className="count font-hl font-black text-[28px] leading-none" style={{ color: kpi.blue ? 'var(--color-primary)' : '#191c1d' }}>{kpi.value}</div>
                  <div className={`text-[9px] font-bold mt-1 ${kpi.blue ? 'text-live' : 'text-[#424751]'}`}>{kpi.sub}</div>
                </div>
              ))}
            </div>

            {/* Stats bars */}
            <div className="a3 bg-white rounded-2xl border border-[#c2c6d2]/20 p-5 shadow-sm">
              <h3 className="font-hl font-extrabold text-[14px] text-primary mb-5">{t('stats.title')}</h3>
              <div className="flex flex-col gap-3">
                {p.stats.map((s) => (
                  <div key={s.label} className="flex items-center gap-3">
                    <span className="text-[11px] text-[#424751] w-[130px] shrink-0">{s.label}</span>
                    <div className="flex-1 h-1 bg-[#e1e3e4] rounded-full overflow-hidden">
                      <div className="bar-grow h-full bg-primary rounded-full" style={{ width: `${s.pct}%` }} />
                    </div>
                    <span className="font-hl font-bold text-[12px] text-[#191c1d] w-9 text-right">{s.value}</span>
                  </div>
                ))}
              </div>
            </div>

            {/* AI Insight */}
            <div className="a4 bg-white rounded-2xl border-l-4 border-primary p-6 shadow-sm relative overflow-hidden">
              <div className="absolute -bottom-2 -right-2 opacity-[0.03] pointer-events-none">
                <span className="material-symbols-outlined text-[100px] text-primary">psychology</span>
              </div>
              <div className="flex items-center gap-2.5 mb-4">
                <span className="material-symbols-outlined text-[20px] text-primary">psychology</span>
                <h3 className="font-hl font-extrabold text-[15px] text-primary">{t('ai.title')}</h3>
                <span className="bg-primary/10 text-primary text-[8px] font-extrabold uppercase tracking-[0.1em] py-1 px-2 rounded-full ml-auto">{t('ai.badge')}</span>
              </div>
              <div className="relative z-1">
                <FormattedInsight text={p.aiInsight} />
              </div>
            </div>

            {/* Career table */}
            <div className="a5 bg-white rounded-2xl border border-[#c2c6d2]/20 overflow-hidden shadow-sm">
              <div className="p-4 px-6 border-b border-[#f3f4f5] flex items-center justify-between">
                <h3 className="font-hl font-extrabold text-[14px] text-primary">{t('career.title')}</h3>
              </div>
              <div className="overflow-x-auto">
                <table className="w-full border-collapse">
                  <thead>
                    <tr className="bg-[#f3f4f5]">
                      {[tc('labels.season'),tc('labels.team'),tc('labels.competition'),tc('stats.matches_played_abbr'),tc('stats.goals_assists_abbr'),tc('stats.rating')].map((h) => (
                        <th key={h} className={`py-2 px-5 text-[9px] font-black uppercase tracking-[0.08em] text-[#727782] ${h === tc('labels.season') || h === tc('labels.team') || h === tc('labels.competition') ? 'text-left' : 'text-center'}`}>{h}</th>
                      ))}
                    </tr>
                  </thead>
                  <tbody>
                    {p.career.map((row) => (
                      <tr key={row.season} className="tr-hover group border-b border-[#f3f4f5] last:border-0 grow transition-colors hover:bg-[#f3f4f5]">
                        <td className="py-2.5 px-5 text-[12px] font-bold text-[#191c1d]">{row.season}</td>
                        <td className="py-2.5 px-5 text-[12px] text-[#424751]">{row.team}</td>
                        <td className="py-2.5 px-5 text-nowrap">
                          <span className="bg-[#EFF6FF] text-primary text-[9px] font-bold py-0.5 px-2 rounded">{row.competition}</span>
                        </td>
                        <td className="py-2.5 px-5 text-center font-hl font-bold text-[12px] text-[#191c1d]">{row.matches}</td>
                        <td className="py-2.5 px-5 text-center font-hl font-bold text-[12px] text-[#191c1d]">{row.goals} / {row.assists}</td>
                        <td className="py-2.5 px-5 text-center">
                          <span className="text-[10px] font-black py-0.5 px-2 rounded-lg" style={{ backgroundColor: row.ratingColor, color: row.ratingText }}>{row.rating}</span>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          </div>

          {/* ─ RIGHT SIDEBAR ─ */}
          <div className="flex flex-col gap-4">

            {/* Radar */}
            <div className="a2 bg-white rounded-2xl border border-[#c2c6d2]/20 p-5 shadow-sm">
              <h3 className="font-hl font-extrabold text-[13px] text-primary text-center mb-4">{t('sections.skill_matrix')}</h3>
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
            <div className="a3 bg-[#f3f4f5] rounded-2xl border border-[#c2c6d2]/20 p-5.5">
              <h3 className="font-hl font-extrabold text-[14px] text-primary mb-4">{t('sections.tactical_roles')}</h3>
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
            <div className="a4 bg-white rounded-2xl border border-[#c2c6d2]/20 p-5.5 shadow-sm">
              <h3 className="font-hl font-extrabold text-[14px] text-primary mb-4">{t('sections.strengths_weaknesses')}</h3>
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

            {/* Pro CTA */}
            <div className="a5 bg-slate-900 rounded-2xl p-5.5 text-white">
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
