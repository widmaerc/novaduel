import type { Metadata } from 'next'
import { getTranslations } from 'next-intl/server'
import { supabaseAdmin } from '@/lib/supabase'
import { getFeaturedPlayers } from '@/lib/data'
import CompareSearchBar from '@/components/compare/CompareSearchBar'
import { buildAlternates } from '@/lib/hreflang'
import { localizedHref } from '@/lib/localizedPaths'

// Revalidate every 2 minutes so view counts stay fresh
export const revalidate = 120

type Props = { params: Promise<{ locale: string }> }

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { locale } = await params
  const t = await getTranslations({ locale, namespace: 'Comparison' })
  return {
    title: t('seo_index.title'),
    description: t('seo_index.description'),
    alternates: buildAlternates('/compare'),
  }
}

export default async function CompareIndexPage({ params }: Props) {
  const { locale } = await params
  const t = await getTranslations({ locale, namespace: 'Comparison' })
  const tc = await getTranslations({ locale, namespace: 'Common' })

  // Fetch trending comparisons (most viewed) — bypass Redis for accurate counts
  const { data: trendsRaw } = await supabaseAdmin
    .from('comparisons')
    .select('slug, views, player_a:dn_players!player_a_id(id, name, firstname, lastname, slug, statistics), player_b:dn_players!player_b_id(id, name, firstname, lastname, slug, statistics)')
    .order('views', { ascending: false })
    .limit(10)

  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  function enrichDnPlayer(p: any) {
    if (!p) return null
    const stats: any[] = p.statistics ?? []
    const best = stats.reduce((acc: any, s: any) =>
      (s.games?.appearences ?? 0) > (acc?.games?.appearences ?? 0) ? s : acc, stats[0] ?? null)
    
    const initials = (p.firstname && p.lastname)
      ? `${p.firstname[0]}${p.lastname[0]}`.toUpperCase()
      : (p.name ?? '??').split(' ').map((w: string) => w[0]).join('').slice(0, 2).toUpperCase()
      
    return {
      name: p.name,
      common_name: p.name,
      initials,
      team: best?.team?.name ?? '—',
    }
  }

  const trends = (trendsRaw ?? []).map((c: any) => ({
    slug: c.slug,
    labelA: c.player_a?.name || '?',
    labelB: c.player_b?.name || '?',
    pA: enrichDnPlayer(c.player_a),
    pB: enrichDnPlayer(c.player_b),
    views: c.views
  }))
  const players  = await getFeaturedPlayers()

  return (
    <div className="relative overflow-hidden">
      {/* Background decoration */}
      <div className="hero-mesh absolute inset-0 opacity-40 pointer-events-none" />
      
      <div className="max-w-[1280px] mx-auto px-4 sm:px-6 lg:px-8 py-10 md:py-16 relative z-10">
        {/* Header */}
        <div className="max-w-2xl mb-10">
          <p className="label-caps !text-primary mb-2 opacity-80">{t('label')}</p>
          <h1 className="font-hl font-black text-3xl md:text-5xl text-slate-900 leading-[1.1] mb-4 text-gradient">
            {t('title')}
          </h1>
          <p className="text-sm md:text-base text-slate-500 font-medium leading-relaxed">
            {t('sub')}
          </p>
        </div>

        {/* Search bar & Trends */}
        <div className="max-w-4xl mx-auto mb-16">
          <CompareSearchBar locale={locale} isHero={true} />
          
          {/* Trending Comparisons Area */}
          {trends.length > 0 && (
            <div className="mt-8 space-y-4">
              <div className="flex items-center gap-3">
                <span className="label-caps !text-slate-400 text-[10px] tracking-[0.2em] uppercase">{tc('labels.trends')} :</span>
                <div className="h-px bg-slate-100 flex-1" />
              </div>
              <div className="flex flex-wrap items-center gap-2">
                {trends.map((tr) => (
                  <a
                    key={tr.slug}
                    href={localizedHref(locale, `/compare/${tr.slug}`)}
                    className="glass-card !rounded-full px-4 py-2 text-[11px] font-bold text-slate-800 hover:text-primary hover:border-primary transition-all flex items-center gap-2.5 group shadow-sm bg-white/50 border-slate-200/50"
                  >
                    <span className="font-hl truncate max-w-[120px]">{tr.labelA}</span>
                    <span className="inline-flex items-center justify-center w-5 h-5 rounded-full bg-slate-900 text-white text-[8px] font-black shadow-lg shadow-slate-900/10 group-hover:bg-primary transition-colors">VS</span>
                    <span className="font-hl truncate max-w-[120px]">{tr.labelB}</span>
                  </a>
                ))}
              </div>
            </div>
          )}
        </div>

        {/* Featured players to compare */}

        {/* Featured players to compare */}
        {players.length > 0 && (
          <section>
            <div className="flex items-center gap-3 mb-6">
              <div className="h-px bg-slate-100 flex-1" />
              <h2 className="label-caps !text-slate-400 whitespace-nowrap px-4">
                {t('featured_players')}
              </h2>
              <div className="h-px bg-slate-100 flex-1" />
            </div>

            <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-4">
              {players.slice(0, 8).map((p, idx) => (
                <a 
                  key={p.slug} 
                  href={`/${locale}/player/${p.slug}`}
                  className="glass-card flex items-center gap-3 p-3 no-underline hover:bg-slate-50 transition-all group"
                >
                  <div 
                    className={`w-10 h-10 rounded-xl flex items-center justify-center font-hl font-bold text-[10px] shrink-0 transition-all shadow-sm ${
                      idx % 2 === 0 ? 'bg-primary/5 text-primary border border-primary/10' : 'bg-slate-100 text-slate-600'
                    } group-hover:bg-primary group-hover:text-white group-hover:border-primary`}
                  >
                    {p.initials ?? p.name?.slice(0, 2).toUpperCase()}
                  </div>
                  <div className="min-w-0">
                    <div className="font-bold text-xs text-slate-800 truncate group-hover:text-primary transition-colors font-hl">
                      {p.common_name || p.name}
                    </div>
                    <div className="label-caps !text-[8px] !text-slate-400 truncate mt-0.5">
                      {p.team}
                    </div>
                  </div>
                </a>
              ))}
            </div>
          </section>
        )}
      </div>
    </div>
  )
}
