import type { Metadata } from 'next'
import { getTranslations } from 'next-intl/server'
import { supabaseAdmin } from '@/lib/supabase'
import { getFeaturedPlayers } from '@/lib/data'
import CompareSearchBar from '@/components/compare/CompareSearchBar'
import { buildAlternates } from '@/lib/hreflang'
import { localizedHref } from '@/lib/localizedPaths'
import Breadcrumbs from '@/components/layout/Breadcrumbs'

// Revalidate every 2 minutes so view counts stay fresh
export const revalidate = 120

type Props = { params: Promise<{ locale: string }> }

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { locale } = await params
  const t = await getTranslations({ locale, namespace: 'Comparison' })
  return {
    title: t('seo_index.title'),
    description: t('seo_index.description'),
    alternates: buildAlternates('/compare', locale),
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

  const siteUrl = process.env.NEXT_PUBLIC_APP_URL ?? 'https://novaduel.com';

  const collectionSchema = {
    '@context': 'https://schema.org',
    '@type': 'CollectionPage',
    name: t('title'),
    description: t('sub'),
    url: `${siteUrl}/${locale}/compare`,
    mainEntity: {
      '@type': 'ItemList',
      itemListElement: trends.slice(0, 10).map((tr, idx) => ({
        '@type': 'ListItem',
        position: idx + 1,
        name: `${tr.labelA} vs ${tr.labelB}`,
        url: `${siteUrl}${localizedHref(locale, `/compare/${tr.slug}`)}`,
      })),
    },
  };

  return (
    <>
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(collectionSchema) }} />
    <div className="relative overflow-hidden">
      {/* Background decoration */}
      <div className="hero-mesh absolute inset-0 opacity-40 pointer-events-none" />
      
      <div className="max-w-[1280px] mx-auto px-4 sm:px-6 lg:px-8 py-2 relative z-20">
        <Breadcrumbs 
          locale={locale}
          items={[
            { label: tc('nav.home'), href: '/' },
            { label: t('breadcrumb.comparisons') }
          ]}
        />
      </div>
      
      <div className="max-w-[1280px] mx-auto px-4 sm:px-6 lg:px-8 py-10 md:py-16 relative z-10">
        {/* Header - Elite Style */}
        <div className="flex flex-col items-center text-center mb-16 px-4">
          <div className="label-caps !text-[#004782] mb-6 tracking-[0.3em] font-black text-xs">
            {t('label')}
          </div>
          <h1 className="font-hl font-black text-4xl md:text-6xl lg:text-7xl text-slate-900 leading-[1.05] mb-8 uppercase max-w-4xl tracking-tight">
            {t('title').split(' ').slice(0, -2).join(' ')} 
            <br />
            <span className="text-[#004782]">{t('title').split(' ').slice(-2).join(' ')}</span>
          </h1>
          <p className="text-sm md:text-base text-slate-500 font-medium max-w-2xl leading-relaxed text-balance">
            {t('sub')}
          </p>
        </div>

        {/* Search bar & Trends - Full Width */}
        <div className="w-full mb-16 px-4 md:px-0">
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
                    className="bg-white border border-slate-200 rounded-full px-5 py-2.5 text-[11px] font-bold text-slate-800 hover:text-[#004782] hover:border-[#004782] hover:shadow-md transition-all flex items-center gap-3 shadow-sm group"
                  >
                    <span className="font-hl truncate max-w-[120px] uppercase tracking-wide">{tr.labelA}</span>
                    <span className="inline-flex items-center justify-center w-6 h-6 rounded-full bg-[#004782] text-white text-[8px] font-black shadow-lg shadow-blue-900/10 transition-transform group-hover:scale-110">VS</span>
                    <span className="font-hl truncate max-w-[120px] uppercase tracking-wide">{tr.labelB}</span>
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

            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
              {players.slice(0, 8).map((p, idx) => (
                <a 
                  key={p.slug} 
                  href={`/${locale}/player/${p.slug}`}
                  className="bg-white border border-slate-200 rounded-2xl flex items-center gap-4 p-4 no-underline hover:border-[#004782] hover:shadow-xl transition-all group shadow-sm relative overflow-hidden"
                >
                  <div className="absolute top-0 right-0 w-16 h-16 bg-slate-50 rotate-45 translate-x-8 -translate-y-8 group-hover:bg-blue-50 transition-colors" />
                  
                  <div 
                    className={`w-12 h-12 rounded-xl flex items-center justify-center font-hl font-bold text-[11px] shrink-0 transition-all shadow-sm relative z-10 ${
                      idx % 2 === 0 ? 'bg-[#004782]/5 text-[#004782] border border-[#004782]/10' : 'bg-slate-100 text-slate-600'
                    } group-hover:bg-[#004782] group-hover:text-white group-hover:border-[#004782]`}
                  >
                    {p.initials ?? p.name?.slice(0, 2).toUpperCase()}
                  </div>
                  <div className="min-w-0 relative z-10">
                    <div className="font-black text-[13px] text-slate-900 truncate group-hover:text-[#004782] transition-colors font-hl uppercase tracking-tight">
                      {p.common_name || p.name}
                    </div>
                    <div className="label-caps !text-[9px] !text-slate-400 truncate mt-1 font-bold">
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
    </>
  )
}
