import { notFound, redirect } from 'next/navigation'
import type { Metadata }      from 'next'
import { getTranslations }    from 'next-intl/server'
import { buildAlternates }    from '@/lib/hreflang'
import { localizedHref }      from '@/lib/localizedPaths'
import { getComparisonBySlug } from '@/lib/data'
import { getCompetStats, getRadarSkills } from '@/lib/compareHelpers'
import type { Player as DBPlayer } from '@/types'
import type { Player as CmpPlayer, Locale } from '@/components/compare/types'
import { Suspense } from 'react'

import CompareSearchBar            from '@/components/compare/CompareSearchBar'
import ComparisonHero              from '@/components/compare/ComparisonHero'
import Breadcrumbs from '@/components/layout/Breadcrumbs'
import ViewCounter                 from '@/components/compare/ViewCounter'
import StatsDetails                from '@/components/compare/StatsDetails'
import { CompetitionStatsTable } from '@/components/compare/PalmaresVerdictCompetition'
import { AIInsightBlock, SkillRadar, SimilarDuels }           from '@/components/compare/AIRadarSimilar'
import PlayerProfileCard           from '@/components/compare/PlayerProfileCard'
import CompareAITrigger            from '@/components/compare/CompareAITrigger'
import SimilarDuelsSection         from '@/components/compare/SimilarDuelsSection'
import StatFootnotes               from '@/components/shared/StatFootnotes'

type Props = { params: Promise<{ locale: string; slug: string }> }

// ── Mapper DB Player → Compare Player ────────────────────────────────────────
function toComparePlayer(p: DBPlayer): CmpPlayer {
  return {
    id:             p.id ?? 0,
    slug:           p.slug ?? '',
    name:           p.name ?? '',
    common_name:    p.common_name ?? p.name ?? '',
    team:           p.team ?? '',
    team_logo_url:  p.team_logo_url ?? '',
    league:         p.league ?? '',
    league_slug:    p.league_slug ?? '',
    nationality:    p.nationality ?? '',
    flag_url:       p.flag_url ?? '',
    flag_emoji:     p.flag_emoji ?? '',
    position:       (p.position as CmpPlayer['position']) ?? 'ATT',
    position_name:  p.position_name ?? '',
    age:            p.age ?? 0,
    date_of_birth:  p.date_of_birth ?? '1990-01-01',
    height:         p.height ?? 0,
    weight:         p.weight ?? 0,
    preferred_foot: p.preferred_foot ?? '',
    shirt_number:   p.shirt_number ?? 0,
    market_value:   p.market_value ?? '',
    image_url:      p.image_url ?? '',
    season:         p.season ?? '2025-26',
    goals:          Number(p.goals)            || 0,
    assists:        Number(p.assists)          || 0,
    matches:        Number(p.matches)          || 0,
    minutes:        Number(p.minutes)          || 0,
    pass_accuracy:  Number(p.pass_accuracy)    || 0,
    dribbles:       Number(p.dribbles)         || 0,
    duels_won:      Number(p.duels_won)        || 0,
    shots_on_target:Number(p.shots_on_target)  || 0,
    yellow_cards:   Number(p.yellow_cards)     || 0,
    red_cards:      Number(p.red_cards)        || 0,
    rating:         Number(p.rating)           || 0,
    xg:             Number(p.xg)              || 0,
    recent_form:    p.recent_form ?? '',
    initials:       p.initials ?? p.name?.slice(0, 2).toUpperCase() ?? '??',
    avatar_bg:      p.avatar_bg ?? 'rgba(0,71,130,.1)',
    avatar_color:   p.avatar_color ?? '#004782',
    is_featured:    p.is_featured ?? false,
    created_at:     p.created_at ?? '',
    updated_at:     p.updated_at ?? '',
  }
}

// ── Metadata ──────────────────────────────────────────────────────────────────
export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { slug, locale } = await params
  const t = await getTranslations({ locale, namespace: 'Comparison' })
  const comparison = await getComparisonBySlug(slug, locale)
  if (!comparison?.player_a || !comparison?.player_b) return { title: 'NovaDuel' }
  const A = comparison.player_a
  const B = comparison.player_b
  
  return {
    title: t('seo.title', { name1: A.common_name || A.name, name2: B.common_name || B.name }),
    description: t('seo.description', { name1: A.name, name2: B.name }),
    alternates: buildAlternates(`/compare/${slug}`),
  }
}

// ── Page ──────────────────────────────────────────────────────────────────────
export default async function ComparePage({ params }: Props) {
  const { slug, locale } = await params
  const t = await getTranslations({ locale, namespace: 'Comparison' })
  const tc = await getTranslations({ locale, namespace: 'Common' })

  // Canonical ordering
  const parts = slug.split('-vs-')
  if (parts.length === 2) {
    const canonical = [parts[0], parts[1]].sort().join('-vs-')
    if (canonical !== slug) redirect(localizedHref(locale, `/compare/${canonical}`))
  }

  const comparison = await getComparisonBySlug(slug, locale)
  if (!comparison?.player_a || !comparison?.player_b) notFound()

  const dbA = comparison.player_a
  const dbB = comparison.player_b

  // Canonical text slug redirect
  const canonicalText = [dbA.slug, dbB.slug].filter(Boolean).sort().join('-vs-')
  if (canonicalText && canonicalText !== slug) redirect(localizedHref(locale, `/compare/${canonicalText}`))

  const pA = toComparePlayer(dbA)
  const pB = toComparePlayer(dbB)

  const winnerSlug = comparison.winner_slug
    ?? (pA.rating >= pB.rating ? pA.slug : pB.slug)

  const [skillsA, skillsB] = await Promise.all([
    Promise.resolve(getRadarSkills(dbA)),
    Promise.resolve(getRadarSkills(dbB)),
  ])
  
  const insightKey = locale === 'es' ? 'insight_es' : locale === 'en' ? 'insight_en' : 'insight_fr';
  const insight = comparison[insightKey] ?? comparison.insight_fr ?? ''

  const statsA = getCompetStats(dbA)
  const statsB = getCompetStats(dbB)

  const initA = { slug: pA.slug, name: pA.name, club: pA.team, position: pA.position,
    initials: pA.initials, avatar_bg: pA.avatar_bg, avatar_color: pA.avatar_color, image_url: pA.image_url }
  const initB = { slug: pB.slug, name: pB.name, club: pB.team, position: pB.position,
    initials: pB.initials, avatar_bg: pB.avatar_bg, avatar_color: pB.avatar_color, image_url: pB.image_url }

  const jsonLd = {
    '@context': 'https://schema.org',
    '@type': 'BreadcrumbList',
    'itemListElement': [
      {
        '@type': 'ListItem',
        'position': 1,
        'name': tc('nav.home'),
        'item': `https://novaduel.com/${locale}`
      },
      {
        '@type': 'ListItem',
        'position': 2,
        'name': t('breadcrumb.comparisons'),
        'item': `https://novaduel.com${localizedHref(locale, '/compare')}`
      },
      {
        '@type': 'ListItem',
        'position': 3,
        'name': `${pA.common_name} vs ${pB.common_name}`,
        'item': `https://novaduel.com${localizedHref(locale, `/compare/${slug}`)}`
      }
    ]
  };

  return (
    <div className="max-w-[1280px] mx-auto px-3 sm:px-4 lg:px-6 pb-20">
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }}
      />

      <h1 className="sr-only">
        {t('seo.title', { name1: pA.common_name || pA.name, name2: pB.common_name || pB.name })}
      </h1>

      <Breadcrumbs 
        locale={locale}
        items={[
          { label: tc('nav.home'), href: '/' },
          { label: t('breadcrumb.comparisons'), href: '/compare' },
          { label: `${pA.common_name} vs ${pB.common_name}` }
        ]}
        extra={<ViewCounter slug={slug} initialViews={comparison.views ?? 0} />}
      />

      <div className="mb-3">
        <CompareSearchBar locale={locale} initialPlayerA={initA} initialPlayerB={initB} />
      </div>

      <div className="mb-4">
        <ComparisonHero playerA={pA} playerB={pB} winnerSlug={winnerSlug} />
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-[1fr_300px] gap-4 items-start">
        <div className="flex flex-col gap-4">
          <StatsDetails 
            playerA={pA} playerB={pB} 
            labels={{
              title: t('stats.title'),
              categories: {
                attack: tc('stats.attack'),
                passing: tc('stats.passing'),
                defense: tc('stats.defense'),
                physical: tc('stats.physical')
              },
              rows: {
                goals: tc('stats.goals'),
                assists: tc('stats.assists'),
                matches: tc('stats.matches'),
                xg: 'xG',
                dribbles: tc('stats.dribbles'),
                minutes_per_goal: tc('stats.minutes_per_goal'),
                pass_accuracy: tc('stats.pass_accuracy'),
                duels_won: tc('stats.duels_won'),
                yellow_cards: tc('stats.yellow_cards'),
                red_cards: tc('stats.red_cards'),
                shots_on_target: tc('stats.shots_on_target'),
                minutes: tc('stats.minutes')
              },
              lowerIsBetterHint: t('stats.lowerIsBetterHint')
            }}
          />

          <CompetitionStatsTable 
            playerA={pA} playerB={pB} 
            statsA={statsA} statsB={statsB} 
            labels={{
              title: t('competitions.title'),
              headers: [
                tc('stats.header.competition'),
                tc('stats.header.rating'),
                tc('stats.header.matches'),
                tc('stats.header.goals_assists'),
                tc('stats.header.assists'),
                tc('stats.header.yellow'),
                tc('stats.header.red')
              ]
            }}
          />

          <div className="hidden md:block">
            <SkillRadar 
              playerA={pA} playerB={pB} 
              skillsA={skillsA} skillsB={skillsB} 
              labels={{
                title: tc('radar.title'),
                skills: [
                  tc('radar.finishing'),
                  tc('radar.dribbling'),
                  tc('radar.passing'),
                  tc('radar.physical'),
                  tc('radar.vision')
                ]
              }}
            />
          </div>

          <div className="block lg:hidden">
            <Suspense fallback={<div className="h-32 bg-slate-50 rounded-2xl animate-pulse" />}>
              <SimilarDuelsSection playerAId={dbA.id ?? 0} playerBId={dbB.id ?? 0} locale={locale} />
            </Suspense>
          </div>
        </div>

        <div className="flex flex-col gap-4">
          <AIInsightBlock
            insight={insight} playerA={pA} playerB={pB}
            winnerSlug={winnerSlug}
            labels={{
              title: t('insight.title'),
              badge: t('insight.badge'),
              config: [t('insight.consistency'), t('insight.explosivity')]
            }}
          />
          <CompareAITrigger slug={slug} locale={locale} hasInsight={!!insight} />

          <div className="hidden lg:block">
            <Suspense fallback={<div className="h-32 bg-slate-50 rounded-2xl animate-pulse" />}>
              <SimilarDuelsSection playerAId={dbA.id ?? 0} playerBId={dbB.id ?? 0} locale={locale} />
            </Suspense>
          </div>
        </div>
      </div>

      <div className="mt-8">
        <StatFootnotes locale={locale} />
      </div>
    </div>
  )
}
