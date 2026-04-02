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

  // Fetch comparisons: featured first, then most viewed — bypass Redis for accurate counts
  const { data: featuredRaw } = await supabaseAdmin
    .from('comparisons')
    .select('slug, views, is_featured, player_a:players!player_a_id(name, common_name, initials, avatar_bg, avatar_color), player_b:players!player_b_id(name, common_name, initials, avatar_bg, avatar_color)')
    .or('is_featured.eq.true,views.gt.0')
    .order('views', { ascending: false })
    .limit(6)

  const featured = featuredRaw ?? []
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

        {/* Search bar */}
        <div className="max-w-4xl mx-auto mb-16">
          <CompareSearchBar locale={locale} isHero={true} />
        </div>

        {/* Popular comparisons */}
        {featured.length > 0 && (
          <section className="mb-16">
            <div className="flex items-center gap-3 mb-6">
              <div className="h-px bg-slate-100 flex-1" />
              <h2 className="label-caps !text-slate-400 whitespace-nowrap px-4">
                {t('popular_title')}
              </h2>
              <div className="h-px bg-slate-100 flex-1" />
            </div>
            
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {featured.map((c: any) => {
                const pA = c.player_a
                const pB = c.player_b
                if (!pA || !pB) return null
                return (
                  <a 
                    key={c.slug} 
                    href={localizedHref(locale, `/compare/${c.slug}`)}
                    className="glass-card group flex items-center gap-4 p-4 no-underline hover:bg-slate-50 transition-all border-slate-200/50"
                  >
                    <div className="flex -space-x-3 shrink-0">
                      <div 
                        className="w-10 h-10 rounded-xl flex items-center justify-center font-hl font-bold text-[11px] border-2 border-white shadow-sm transition-transform group-hover:-translate-x-1"
                        style={{ background: pA.avatar_bg ?? 'rgba(30,64,175,0.1)', color: pA.avatar_color ?? '#1e40af' }}
                      >
                        {pA.initials ?? pA.name?.slice(0, 2).toUpperCase()}
                      </div>
                      <div 
                        className="w-10 h-10 rounded-xl flex items-center justify-center font-hl font-bold text-[11px] border-2 border-white shadow-sm transition-transform group-hover:translate-x-1"
                        style={{ background: pB.avatar_bg ?? 'rgba(146,0,15,0.1)', color: pB.avatar_color ?? '#92000f' }}
                      >
                        {pB.initials ?? pB.name?.slice(0, 2).toUpperCase()}
                      </div>
                    </div>
                    <div className="flex-1 min-w-0">
                      <div className="font-bold text-sm text-slate-800 truncate group-hover:text-primary transition-colors">
                        {pA.common_name || pA.name} <span className="text-slate-300 font-medium px-1">vs</span> {pB.common_name || pB.name}
                      </div>
                      <div className="label-caps !text-[9px] !text-slate-400 mt-1">
                        {c.views ?? 0} {t('views')}
                      </div>
                    </div>
                    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3" className="text-slate-200 group-hover:text-primary group-hover:translate-x-1 transition-all">
                      <path d="m9 18 6-6-6-6"/>
                    </svg>
                  </a>
                )
              })}
            </div>
          </section>
        )}

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
              {players.slice(0, 8).map((p) => (
                <a 
                  key={p.slug} 
                  href={`/${locale}/player/${p.slug}`}
                  className="glass-card flex items-center gap-3 p-3 no-underline hover:bg-slate-50 transition-all group"
                >
                  <div 
                    className="w-10 h-10 rounded-xl flex items-center justify-center font-hl font-bold text-[10px] shrink-0 bg-slate-100 text-slate-600 group-hover:bg-primary group-hover:text-white transition-all shadow-sm"
                  >
                    {p.initials ?? p.name?.slice(0, 2).toUpperCase()}
                  </div>
                  <div className="min-w-0">
                    <div className="font-bold text-xs text-slate-800 truncate group-hover:text-primary transition-colors">
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
