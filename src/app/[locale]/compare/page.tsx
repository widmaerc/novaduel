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
    <div className="max-w-[1280px] mx-auto px-3 sm:px-4 lg:px-6 pb-20">

      {/* Header */}
      <div className="pt-6 pb-4">
        <p className="text-[10px] font-black uppercase tracking-[.12em] text-[#004782] mb-1">{t('label')}</p>
        <h1 className="font-headline font-black text-[22px] sm:text-[28px] text-[#191c1d] leading-tight mb-1">
          {t('title')}
        </h1>
        <p className="text-[13px] text-[#727782]">
          {t('sub')}
        </p>
      </div>

      {/* Search bar */}
      <div className="mb-8">
        <CompareSearchBar locale={locale} />
      </div>

      {/* Popular comparisons */}
      {featured.length > 0 && (
        <section className="mb-10">
          <h2 className="font-headline font-bold text-[13px] text-[#727782] uppercase tracking-[.08em] mb-3">
            {t('popular_title')}
          </h2>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
            {/* eslint-disable-next-line @typescript-eslint/no-explicit-any */}
            {featured.map((c: any) => {
              const pA = c.player_a
              const pB = c.player_b
              if (!pA || !pB) return null
              return (
                <a key={c.slug} href={localizedHref(locale, `/compare/${c.slug}`)}
                  className="flex items-center gap-3 bg-white rounded-xl border border-[#c2c6d2] shadow-sm px-4 py-3 no-underline hover:shadow-md hover:border-[#004782]/30 transition-all">
                  <div className="flex flex-shrink-0">
                    <div className="w-9 h-9 rounded-full flex items-center justify-center font-headline font-black text-[11px] border-2 border-white z-10"
                      style={{ background: pA.avatar_bg ?? 'rgba(0,71,130,.1)', color: pA.avatar_color ?? '#004782' }}>
                      {pA.initials ?? pA.name?.slice(0, 2).toUpperCase()}
                    </div>
                    <div className="w-9 h-9 rounded-full flex items-center justify-center font-headline font-black text-[11px] border-2 border-white -ml-3"
                      style={{ background: pB.avatar_bg ?? 'rgba(146,0,15,.1)', color: pB.avatar_color ?? '#92000f' }}>
                      {pB.initials ?? pB.name?.slice(0, 2).toUpperCase()}
                    </div>
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="font-semibold text-[13px] text-[#191c1d] truncate">
                      {pA.common_name || pA.name} <span className="text-[#727782] font-normal">vs</span> {pB.common_name || pB.name}
                    </div>
                    <div className="text-[10px] text-[#727782] mt-px">
                      {c.views ?? 0} {t('views')}
                    </div>
                  </div>
                  <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="#c2c6d2" strokeWidth="2" className="flex-shrink-0">
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
          <h2 className="font-headline font-bold text-[13px] text-[#727782] uppercase tracking-[.08em] mb-3">
            {t('featured_players')}
          </h2>
          <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-3">
            {players.slice(0, 8).map((p) => (
              <a key={p.slug} href={`/${locale}/player/${p.slug}`}
                className="flex items-center gap-2.5 bg-white rounded-xl border border-[#c2c6d2] shadow-sm px-3 py-2.5 no-underline hover:shadow-md hover:border-[#004782]/30 transition-all">
                <div className="w-8 h-8 rounded-full flex items-center justify-center font-headline font-black text-[10px] flex-shrink-0"
                  style={{ background: p.avatar_bg ?? 'rgba(0,71,130,.1)', color: p.avatar_color ?? '#004782' }}>
                  {p.initials ?? p.name?.slice(0, 2).toUpperCase()}
                </div>
                <div className="min-w-0">
                  <div className="font-semibold text-[12px] text-[#191c1d] truncate">{p.common_name || p.name}</div>
                  <div className="text-[10px] text-[#727782] truncate">{p.team}</div>
                </div>
              </a>
            ))}
          </div>
        </section>
      )}

    </div>
  )
}
