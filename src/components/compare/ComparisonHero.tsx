'use client';
import { useState } from 'react'
import { useTranslations } from 'next-intl'
import { useParams } from 'next/navigation'
import { localizedHref } from '@/lib/localizedPaths'
import PlayerAvatar from './PlayerAvatar'
import type { Player, FormResult } from './types'

// ── SeasonFilterTabs ─────────────────────────────────────────────────────────
interface SeasonFilterTabsProps {
  tabs:     string[]
  active:   string
  onChange: (tab: string) => void
}

export function SeasonFilterTabs({ tabs, active, onChange }: SeasonFilterTabsProps) {
  return (
    <div className="flex border-t border-[#f3f4f5] overflow-x-auto scrollbar-hide">
      {tabs.map(tab => (
        <button key={tab} onClick={() => onChange(tab)}
          className={`flex-shrink-0 px-3 py-2.5 text-[11px] font-semibold whitespace-nowrap text-center border-none border-b-2 transition-all ${
            active === tab
              ? 'text-[#004782] border-b-[#004782] font-bold bg-[#EFF6FF]'
              : 'text-[#727782] border-b-transparent bg-transparent hover:text-[#004782] hover:bg-[#f3f4f5]'
          }`}
          style={{ flex: '1 0 auto' }}>
          {tab}
        </button>
      ))}
    </div>
  )
}

// ── FormDots ──────────────────────────────────────────────────────────────────
function FormDots({ form, t }: { form: string; t: any }) {
  const results = (form || '').split(',').slice(0, 5) as FormResult[]
  const colors: Record<FormResult, string> = { V: '#22c55e', N: '#f59e0b', D: '#ef4444' }
  const labels: Record<FormResult, string> = { 
    V: t('stats.win') || 'Victoire', 
    N: t('stats.draw') || 'Nul', 
    D: t('stats.loss') || 'Défaite' 
  }
  return (
    <div className="flex gap-1 mt-1.5">
      {results.map((r, i) => (
        <div key={i} title={labels[r] || r}
          className="w-5 h-5 sm:w-[22px] sm:h-[22px] rounded-full flex items-center justify-center text-white font-black"
          style={{ background: colors[r], fontSize: 8 }}>
          {r}
        </div>
      ))}
    </div>
  )
}

// ── PlayerCard ────────────────────────────────────────────────────────────────
function PlayerCard({ player, side, winnerSlug, locale, t, tc }: { player: Player; side: 'left' | 'right'; winnerSlug: string; locale: string; t: any; tc: any }) {
  const isRight  = side === 'right'
  const isWinner = player.slug === winnerSlug
  const posStyle = {
    ATT: { background: '#fef2f2', color: '#dc2626' },
    MIL: { background: '#EFF6FF', color: '#004782' },
    DEF: { background: '#f0fdf4', color: '#15803d' },
    GK:  { background: '#f5f3ff', color: '#6d28d9' },
  }[player.position] || { background: '#f3f4f5', color: '#727782' }

  return (
    <div className={`flex items-center gap-2.5 sm:gap-3 min-w-0 ${isRight ? 'flex-row-reverse' : ''}`}>
      <a href={localizedHref(locale, `/player/${player.slug}`)} className="flex-shrink-0 hover:opacity-80 transition-opacity">
        <PlayerAvatar
          initials={player.initials}
          avatarBg={player.avatar_bg} avatarColor={player.avatar_color}
          size={56} showBadge rating={player.rating}
        />
      </a>
      <div className={`min-w-0 ${isRight ? 'text-right' : ''}`}>
        <a href={localizedHref(locale, `/player/${player.slug}`)} className="no-underline group">
          <div className="font-headline font-extrabold text-[14px] sm:text-[16px] leading-tight text-[#191c1d] truncate group-hover:text-primary transition-colors">
            {player.common_name}
          </div>
        </a>
        <div className={`flex items-center gap-1 mt-0.5 flex-wrap ${isRight ? 'justify-end' : ''}`}>
          <span className="text-[10px] text-[#727782]">{player.flag_emoji} {player.team}</span>
          <span className="text-[9px] font-bold uppercase tracking-[.05em] px-1.5 py-px rounded flex-shrink-0"
            style={posStyle}>
            {tc(`positions.${(player.position === 'MIL' ? 'mid' : player.position).toLowerCase()}`)}
          </span>
        </div>
        <div className={`flex ${isRight ? 'justify-end' : ''}`}>
          <FormDots form={player.recent_form} t={tc} />
        </div>
        {isWinner && (
          <div className={`mt-1 flex ${isRight ? 'justify-end' : ''}`}>
            <span className="inline-flex items-center gap-1 bg-[#004782] !text-white text-[8px] font-black uppercase tracking-[.1em] px-2 py-0.5 rounded-full">
              <span className="!text-white">⭐ {t('hero.winner')}</span>
            </span>
          </div>
        )}
      </div>
    </div>
  )
}

// ── ComparisonHero ────────────────────────────────────────────────────────────
interface ComparisonHeroProps {
  playerA:      Player
  playerB:      Player
  winnerSlug:   string
  activeTab?:   string
  onTabChange?: (tab: string) => void
}

export default function ComparisonHero({
  playerA, playerB, winnerSlug, activeTab: ctab, onTabChange,
}: ComparisonHeroProps) {
  const t = useTranslations('Comparison')
  const tc = useTranslations('Common')
  const params = useParams()
  const locale = (params?.locale as string) ?? 'fr'
  
  const seasonTabs = Object.values(t.raw('hero.tabs')) as string[]
  const [internalTab, setInternalTab] = useState(seasonTabs[0])
  const activeTab = ctab ?? internalTab

  function handleTab(tab: string) { setInternalTab(tab); onTabChange?.(tab) }
  
  return (
    <div className="bg-white rounded-xl overflow-hidden border border-[#eef0f2] shadow-sm">
      <div className="flex items-center gap-2 px-3 py-4 sm:px-5 sm:py-5 sm:gap-3">
        <div className="flex-1 min-w-0">
          <PlayerCard player={playerA} side="left" winnerSlug={winnerSlug} locale={locale} t={t} tc={tc} />
        </div>
        <div className="flex flex-col items-center gap-1 flex-shrink-0 px-1">
          <div className="font-headline font-black text-[14px] sm:text-[16px] italic text-[#727782]">VS</div>
          <div className="text-[8px] font-bold text-[#727782] uppercase tracking-[.08em] bg-[#f3f4f5] px-2 py-0.5 rounded-full whitespace-nowrap">
            {t('hero.career_badge')}
          </div>
        </div>
        <div className="flex-1 min-w-0">
          <PlayerCard player={playerB} side="right" winnerSlug={winnerSlug} locale={locale} t={t} tc={tc} />
        </div>
      </div>
      <SeasonFilterTabs tabs={seasonTabs} active={activeTab} onChange={handleTab} />
    </div>
  )
}
