import type { Metadata } from 'next'
import { notFound } from 'next/navigation'
import Link from 'next/link'
import { supabaseAdmin } from '@/lib/supabase'
import { buildAlternates } from '@/lib/hreflang'
import { localizedHref } from '@/lib/localizedPaths'
import { buildSlug, displayName, makeInitials, mapPosition } from '@/lib/data'
import Breadcrumbs from '@/components/layout/Breadcrumbs'

export const revalidate = 3600 // re-génère toutes les heures

// ── Config ligues ─────────────────────────────────────────────────────────────

const LEAGUES: Record<string, {
  name: string
  country: { fr: string; en: string; es: string }
  flag: string
  description: { fr: string; en: string; es: string }
}> = {
  '39': {
    name: 'Premier League',
    country: { fr: 'Angleterre', en: 'England', es: 'Inglaterra' },
    flag: '🏴󠁧󠁢󠁥󠁮󠁧󠁿',
    description: {
      fr: 'Statistiques complètes des meilleurs joueurs de Premier League. Buts, passes décisives, notes et comparaisons IA.',
      en: 'Complete stats for the best Premier League players. Goals, assists, ratings and AI comparisons.',
      es: 'Estadísticas completas de los mejores jugadores de Premier League. Goles, asistencias, notas y comparaciones IA.',
    },
  },
  '61': {
    name: 'Ligue 1',
    country: { fr: 'France', en: 'France', es: 'Francia' },
    flag: '🇫🇷',
    description: {
      fr: 'Statistiques complètes des meilleurs joueurs de Ligue 1. Buts, passes décisives, notes et comparaisons IA.',
      en: 'Complete stats for the best Ligue 1 players. Goals, assists, ratings and AI comparisons.',
      es: 'Estadísticas completas de los mejores jugadores de Ligue 1. Goles, asistencias, notas y comparaciones IA.',
    },
  },
  '140': {
    name: 'La Liga',
    country: { fr: 'Espagne', en: 'Spain', es: 'España' },
    flag: '🇪🇸',
    description: {
      fr: 'Statistiques complètes des meilleurs joueurs de La Liga. Buts, passes décisives, notes et comparaisons IA.',
      en: 'Complete stats for the best La Liga players. Goals, assists, ratings and AI comparisons.',
      es: 'Estadísticas completas de los mejores jugadores de La Liga. Goles, asistencias, notas y comparaciones IA.',
    },
  },
  '135': {
    name: 'Serie A',
    country: { fr: 'Italie', en: 'Italy', es: 'Italia' },
    flag: '🇮🇹',
    description: {
      fr: 'Statistiques complètes des meilleurs joueurs de Serie A. Buts, passes décisives, notes et comparaisons IA.',
      en: 'Complete stats for the best Serie A players. Goals, assists, ratings and AI comparisons.',
      es: 'Estadísticas completas de los mejores jugadores de Serie A. Goles, asistencias, notas y comparaciones IA.',
    },
  },
  '78': {
    name: 'Bundesliga',
    country: { fr: 'Allemagne', en: 'Germany', es: 'Alemania' },
    flag: '🇩🇪',
    description: {
      fr: 'Statistiques complètes des meilleurs joueurs de Bundesliga. Buts, passes décisives, notes et comparaisons IA.',
      en: 'Complete stats for the best Bundesliga players. Goals, assists, ratings and AI comparisons.',
      es: 'Estadísticas completas de los mejores jugadores de Bundesliga. Goles, asistencias, notas y comparaciones IA.',
    },
  },
}

const L10N = {
  fr: {
    breadcrumb_leagues: 'Ligues',
    players: 'joueurs',
    top_rated: 'Meilleurs joueurs',
    top_scorers: 'Meilleurs buteurs',
    top_assists: 'Meilleurs passeurs',
    rank: '#',
    player: 'Joueur',
    club: 'Club',
    pos: 'Poste',
    rating: 'Note',
    goals: 'Buts',
    assists: 'Passes D.',
    matches: 'Matchs',
    view_profile: 'Voir le profil',
    compare_cta: 'Comparer des joueurs de',
    compare_btn: 'Lancer une comparaison',
    season: 'Saison en cours',
  },
  en: {
    breadcrumb_leagues: 'Leagues',
    players: 'players',
    top_rated: 'Top Rated',
    top_scorers: 'Top Scorers',
    top_assists: 'Top Assists',
    rank: '#',
    player: 'Player',
    club: 'Club',
    pos: 'Pos',
    rating: 'Rating',
    goals: 'Goals',
    assists: 'Assists',
    matches: 'Matches',
    view_profile: 'View profile',
    compare_cta: 'Compare players from',
    compare_btn: 'Start a comparison',
    season: 'Current season',
  },
  es: {
    breadcrumb_leagues: 'Ligas',
    players: 'jugadores',
    top_rated: 'Mejor valorados',
    top_scorers: 'Máximos goleadores',
    top_assists: 'Más asistencias',
    rank: '#',
    player: 'Jugador',
    club: 'Club',
    pos: 'Pos',
    rating: 'Nota',
    goals: 'Goles',
    assists: 'Asistencias',
    matches: 'Partidos',
    view_profile: 'Ver perfil',
    compare_cta: 'Compara jugadores de',
    compare_btn: 'Iniciar comparación',
    season: 'Temporada actual',
  },
}

// ── Static params ─────────────────────────────────────────────────────────────

export function generateStaticParams() {
  const locales = ['fr', 'en', 'es']
  return locales.flatMap(locale =>
    Object.keys(LEAGUES).map(id => ({ locale, id }))
  )
}

// ── Metadata ──────────────────────────────────────────────────────────────────

type Props = { params: Promise<{ locale: string; id: string }> }

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { locale, id } = await params
  const league = LEAGUES[id]
  if (!league) return { title: 'NovaDuel' }

  const loc = (locale as keyof typeof L10N) in L10N ? locale as keyof typeof L10N : 'en'
  const country = league.country[loc]
  const description = league.description[loc]
  const title = `${league.name} ${new Date().getFullYear()} — Stats, Buts, Notes | NovaDuel`
  const url = `${process.env.NEXT_PUBLIC_APP_URL ?? 'https://novaduel.com'}/${locale}/leagues/${id}`

  return {
    title,
    description,
    alternates: buildAlternates(`/leagues/${id}`, locale),
    openGraph: {
      type: 'website',
      title,
      description,
      url,
      siteName: 'NovaDuel',
    },
    twitter: { card: 'summary_large_image', title, description },
  }
}

// ── Page ──────────────────────────────────────────────────────────────────────

export default async function LeaguePage({ params }: Props) {
  const { locale, id } = await params
  const league = LEAGUES[id]
  if (!league) notFound()

  const loc = (locale as keyof typeof L10N) in L10N ? locale as keyof typeof L10N : 'en'
  const t = L10N[loc]
  const leagueId = parseInt(id)

  // Fetch players — filter by league id in JSONB statistics
  const { data: raw } = await supabaseAdmin
    .from('dn_players')
    .select('id, name, firstname, lastname, photo, statistics, slug')
    .not('slug', 'is', null)
    .limit(5000)

  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const allPlayers = (raw ?? []).map((p: any) => {
    const s = p.statistics?.[0] ?? {}
    return {
      id: p.id as number,
      slug: (p.slug ?? buildSlug(p.name, p.id, p.firstname, p.lastname)) as string,
      name: displayName(p.name, p.firstname, p.lastname),
      initials: makeInitials(p.name, p.firstname, p.lastname),
      position: mapPosition(s.games?.position ?? ''),
      team: (s.team?.name ?? '') as string,
      leagueId: s.league?.id as number,
      rating: parseFloat(s.games?.rating ?? '0') || 0,
      goals: (s.goals?.total ?? 0) as number,
      assists: (s.goals?.assists ?? 0) as number,
      matches: (s.games?.appearences ?? 0) as number,
    }
  }).filter(p => p.leagueId === leagueId && p.matches > 0)

  const byRating  = [...allPlayers].sort((a, b) => b.rating  - a.rating).slice(0, 20)
  const byGoals   = [...allPlayers].sort((a, b) => b.goals   - a.goals).slice(0, 10)
  const byAssists = [...allPlayers].sort((a, b) => b.assists - a.assists).slice(0, 10)

  const BASE = process.env.NEXT_PUBLIC_APP_URL ?? 'https://novaduel.com'

  const jsonLd = {
    '@context': 'https://schema.org',
    '@graph': [
      {
        '@type': 'BreadcrumbList',
        itemListElement: [
          { '@type': 'ListItem', position: 1, name: 'NovaDuel', item: `${BASE}/${locale}` },
          { '@type': 'ListItem', position: 2, name: league.name, item: `${BASE}/${locale}/leagues/${id}` },
        ],
      },
      {
        '@type': 'SportsOrganization',
        name: league.name,
        sport: 'Football',
        url: `${BASE}/${locale}/leagues/${id}`,
        location: { '@type': 'Country', name: league.country.en },
        member: byRating.slice(0, 5).map(p => ({
          '@type': 'Person',
          name: p.name,
          url: `${BASE}${localizedHref(locale, `/player/${p.slug}`)}`,
        })),
      },
      {
        '@type': 'ItemList',
        name: `${t.top_rated} — ${league.name}`,
        numberOfItems: byRating.length,
        itemListElement: byRating.map((p, i) => ({
          '@type': 'ListItem',
          position: i + 1,
          name: p.name,
          url: `${BASE}${localizedHref(locale, `/player/${p.slug}`)}`,
        })),
      },
    ],
  }

  return (
    <>
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }} />

      <div className="pb-20">
        {/* ── Hero ── */}
        <div className="hero-mesh border-b border-slate-200">
          <div className="max-w-[1280px] mx-auto px-4 sm:px-6 py-2">
            <Breadcrumbs
              locale={locale}
              items={[
                { label: 'NovaDuel', href: '/' },
                { label: t.breadcrumb_leagues },
                { label: league.name },
              ]}
            />
          </div>
          <div className="max-w-[1280px] mx-auto px-4 sm:px-6 py-8 md:py-12">
            <div className="flex flex-col md:flex-row md:items-end justify-between gap-6">
              <div>
                <div className="flex items-center gap-4 mb-4">
                  <span className="text-5xl">{league.flag}</span>
                  <div>
                    <span className="label-caps !text-primary !font-extrabold block mb-1">
                      {league.country[loc]}
                    </span>
                    <h1 className="font-hl font-black text-4xl sm:text-5xl lg:text-6xl text-slate-900 leading-none tracking-tighter uppercase">
                      {league.name}
                    </h1>
                  </div>
                </div>
                <p className="text-slate-500 font-medium max-w-xl mt-4 text-sm leading-relaxed">
                  {league.description[loc]}
                </p>
              </div>

              <div className="glass-card shadow-xl !bg-white/40 !py-3 !px-6 flex items-center gap-4 flex-shrink-0">
                <div className="w-10 h-10 rounded-xl ai-gradient flex items-center justify-center text-white shadow-lg">
                  <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5">
                    <path d="M16 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2"/><circle cx="8.5" cy="7" r="4"/><path d="M20 8l2 2-2 2M15 10h6"/>
                  </svg>
                </div>
                <div>
                  <div className="label-caps !text-[9px] !text-slate-400">{t.season}</div>
                  <div className="font-hl font-black text-xl text-slate-900">{allPlayers.length} <span className="text-sm font-semibold text-slate-500">{t.players}</span></div>
                </div>
              </div>
            </div>
          </div>
        </div>

        <div className="max-w-[1280px] mx-auto px-4 sm:px-6 mt-8 space-y-10">

          {/* ── Top Rated ── */}
          <section>
            <h2 className="font-hl font-black text-2xl text-slate-900 uppercase tracking-tight mb-4 flex items-center gap-3">
              <span className="w-1.5 h-6 bg-primary rounded-full shadow-[0_0_10px_rgba(30,64,175,0.4)]" />
              {t.top_rated}
            </h2>
            <PlayerTable players={byRating} locale={locale} t={t} showRating />
          </section>

          <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
            {/* ── Top Scorers ── */}
            <section>
              <h2 className="font-hl font-black text-xl text-slate-900 uppercase tracking-tight mb-4 flex items-center gap-3">
                <span className="w-1.5 h-5 bg-emerald-500 rounded-full" />
                {t.top_scorers}
              </h2>
              <PlayerTable players={byGoals} locale={locale} t={t} showGoals />
            </section>

            {/* ── Top Assists ── */}
            <section>
              <h2 className="font-hl font-black text-xl text-slate-900 uppercase tracking-tight mb-4 flex items-center gap-3">
                <span className="w-1.5 h-5 bg-amber-500 rounded-full" />
                {t.top_assists}
              </h2>
              <PlayerTable players={byAssists} locale={locale} t={t} showAssists />
            </section>
          </div>

          {/* ── Compare CTA ── */}
          <div className="rounded-3xl bg-slate-900 p-8 md:p-12 flex flex-col md:flex-row items-center justify-between gap-8">
            <div>
              <div className="label-caps !text-primary !font-black mb-2">{league.flag} {league.name}</div>
              <p className="text-white font-hl font-black text-2xl">{t.compare_cta} {league.name}</p>
            </div>
            <Link
              href={localizedHref(locale, '/compare')}
              className="ai-gradient text-white font-hl font-black px-8 py-4 rounded-full text-sm uppercase tracking-widest no-underline hover:scale-105 transition-transform shadow-xl shadow-blue-900/30 whitespace-nowrap flex-shrink-0"
            >
              {t.compare_btn}
            </Link>
          </div>
        </div>
      </div>
    </>
  )
}

// ── Player Table Component ─────────────────────────────────────────────────────

type PlayerRow = {
  id: number; slug: string; name: string; initials: string
  position: string; team: string; rating: number
  goals: number; assists: number; matches: number
}

function PlayerTable({
  players, locale, t, showRating, showGoals, showAssists, compact,
}: {
  players: PlayerRow[]
  locale: string
  t: typeof L10N['en']
  showRating?: boolean
  showGoals?: boolean
  showAssists?: boolean
  compact?: boolean
}) {
  const POS_COLORS: Record<string, { bg: string; color: string }> = {
    ATT: { bg: '#fffbeb', color: '#d97706' },
    MIL: { bg: '#eff6ff', color: '#1e40af' },
    DEF: { bg: '#f0fdf4', color: '#15803d' },
    GK:  { bg: '#faf5ff', color: '#7e22ce' },
  }

  return (
    <div className="glass-card !p-0 shadow-lg border-slate-200/60 overflow-hidden">
      <div className="overflow-x-auto">
      <table className="w-full border-collapse min-w-[480px]">
        <thead>
          <tr className="bg-slate-50/80 border-b border-slate-100">
            <th className="px-4 py-3 text-left w-8"><span className="label-caps !text-slate-400">{t.rank}</span></th>
            <th className="px-4 py-3 text-left"><span className="label-caps !text-slate-400">{t.player}</span></th>
            {!compact && <th className="px-4 py-3 text-center hidden sm:table-cell"><span className="label-caps !text-slate-400">{t.pos}</span></th>}
            {showRating  && <th className="px-4 py-3 text-center"><span className="label-caps !text-slate-400">{t.rating}</span></th>}
            {showGoals   && <th className="px-4 py-3 text-center"><span className="label-caps !text-slate-400">{t.goals}</span></th>}
            {showAssists && <th className="px-4 py-3 text-center"><span className="label-caps !text-slate-400">{t.assists}</span></th>}
            {!compact && <th className="px-4 py-3 text-center hidden sm:table-cell"><span className="label-caps !text-slate-400">{t.matches}</span></th>}
          </tr>
        </thead>
        <tbody className="divide-y divide-slate-50">
          {players.map((p, idx) => {
            const pos = POS_COLORS[p.position] ?? { bg: '#f8fafc', color: '#64748b' }
            const ratingColor = p.rating >= 8 ? '#16a34a' : p.rating >= 7 ? '#1e40af' : '#64748b'
            return (
              <tr key={p.id} className="group hover:bg-slate-50 transition-colors">
                <td className="px-4 py-3">
                  <span className="font-hl font-bold text-xs text-slate-400">{String(idx + 1).padStart(2, '0')}</span>
                </td>
                <td className="px-4 py-3">
                  <Link href={localizedHref(locale, `/player/${p.slug}`)} className="flex items-center gap-3 no-underline group/link">
                    <div className="w-9 h-9 rounded-xl flex items-center justify-center font-hl font-black text-xs flex-shrink-0 border shadow-sm transition-transform group-hover/link:scale-105"
                      style={{ background: pos.bg, color: pos.color, borderColor: pos.bg }}>
                      {p.initials}
                    </div>
                    <span className="font-hl font-extrabold text-sm text-slate-900 group-hover/link:text-primary transition-colors truncate max-w-[120px] sm:max-w-none">
                      {p.name}
                    </span>
                  </Link>
                </td>
                {!compact && (
                  <td className="px-4 py-3 text-center hidden sm:table-cell">
                    <span className="text-[10px] font-bold uppercase px-2 py-0.5 rounded-lg border"
                      style={{ background: pos.bg, color: pos.color, borderColor: pos.bg }}>
                      {p.position}
                    </span>
                  </td>
                )}
                {showRating && (
                  <td className="px-4 py-3 text-center">
                    <span className="font-hl font-black text-base" style={{ color: ratingColor }}>
                      {p.rating > 0 ? p.rating.toFixed(2) : '—'}
                    </span>
                  </td>
                )}
                {showGoals && (
                  <td className="px-4 py-3 text-center">
                    <span className="font-hl font-black text-base text-slate-900">{p.goals}</span>
                  </td>
                )}
                {showAssists && (
                  <td className="px-4 py-3 text-center">
                    <span className="font-hl font-black text-base text-slate-900">{p.assists}</span>
                  </td>
                )}
                {!compact && (
                  <td className="px-4 py-3 text-center hidden sm:table-cell">
                    <span className="font-semibold text-sm text-slate-500">{p.matches}</span>
                  </td>
                )}
              </tr>
            )
          })}
        </tbody>
      </table>
      </div>
    </div>
  )
}
