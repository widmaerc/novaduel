'use client';
import { useState } from 'react'
import { useTranslations } from 'next-intl'
import { useParams } from 'next/navigation'
import { localizedHref } from '@/lib/localizedPaths'
import PlayerAvatar from './PlayerAvatar'
import type { Player, FormResult } from './types'
import { useBreakpoint } from '@/lib/useBreakpoint'

// ── SeasonFilterTabs ─────────────────────────────────────────────────────────
interface SeasonFilterTabsProps {
  tabs:     string[]
  active:   string
  onChange: (tab: string) => void
}

export function SeasonFilterTabs({ tabs, active, onChange }: SeasonFilterTabsProps) {
  return (
    <div className="flex bg-slate-50/50 border-t border-slate-100 overflow-x-auto scrollbar-hide p-1 gap-1">
      {tabs.map(tab => (
        <button 
          key={tab} 
          onClick={() => onChange(tab)}
          className={`flex-1 min-w-[80px] px-3 py-1.5 rounded-lg text-[10px] label-caps transition-all duration-200 ${
            active === tab
              ? 'bg-white text-primary font-black shadow-sm border border-slate-200/50'
              : 'text-slate-400 hover:text-slate-600 hover:bg-slate-100/50'
          }`}
        >
          {tab}
        </button>
      ))}
    </div>
  )
}

// ── FormDots ──────────────────────────────────────────────────────────────────
function FormDots({ form, t }: { form: string; t: any }) {
  const results = (form || '').split(',').slice(0, 5) as FormResult[]
  const colors: Record<FormResult, string> = { V: 'bg-green-500 shadow-green-500/20', N: 'bg-amber-500 shadow-amber-500/20', D: 'bg-red-500 shadow-red-500/20' }
  const labels: Record<FormResult, string> = { 
    V: t('stats.win') || 'Victoire', 
    N: t('stats.draw') || 'Nul', 
    D: t('stats.loss') || 'Défaite' 
  }
  return (
    <div className="flex gap-1 mt-1">
      {results.map((r, i) => (
        <div 
          key={i} 
          title={labels[r] || r}
          className={`w-5 h-5 rounded-md flex items-center justify-center text-white font-black text-[8px] shadow-sm transform hover:scale-110 transition-transform ${colors[r]}`}
        >
          {r}
        </div>
      ))}
    </div>
  )
}

function calculateAge(dob: string) {
  if (!dob) return 0
  const b = new Date(dob), now = new Date()
  let a = now.getFullYear() - b.getFullYear()
  if (now.getMonth() - b.getMonth() < 0 || (now.getMonth() === b.getMonth() && now.getDate() < b.getDate())) a--
  return a
}

// ── PlayerCard ────────────────────────────────────────────────────────────────
function PlayerCard({ player, side, winnerSlug, locale, t, tc, isMobile }: { player: Player; side: 'left' | 'right'; winnerSlug: string; locale: string; t: any; tc: any, isMobile?: boolean }) {
  const isWinner = player.slug === winnerSlug
  const posKey = (player.position === 'MIL' ? 'mid' : player.position).toLowerCase();
  const playerAge = calculateAge(player.date_of_birth)
  
  const posStyle = {
    ATT: { background: 'rgba(239, 68, 68, 0.08)', color: '#dc2626' },
    MIL: { background: 'rgba(30, 64, 175, 0.08)', color: '#1e40af' },
    DEF: { background: 'rgba(34, 197, 94, 0.08)', color: '#15803d' },
    GK:  { background: 'rgba(109, 40, 217, 0.08)', color: '#6d28d9' },
  }[player.position] || { background: '#f8fafc', color: '#64748b' }

  const avatarSize = isMobile ? 54 : 74;

  return (
    <div className="flex flex-col items-center text-center gap-1 sm:gap-2 group">
      <div className="relative shrink-0">
        <a href={localizedHref(locale, `/player/${player.slug}`)} className="block relative transition-transform hover:scale-105 duration-300">
          <PlayerAvatar
            initials={player.initials}
            avatarBg={player.avatar_bg} avatarColor={player.avatar_color}
            size={avatarSize} showBadge={false}
          />
          {player.rating > 0 && (
            <div 
              className="absolute -top-1 -right-1 px-1 sm:px-1.5 py-0.5 sm:py-1 rounded-lg text-[8px] sm:text-[10px] font-black leading-none bg-white border border-slate-100 shadow-md group-hover:shadow-primary/20 transition-all z-20"
              style={{ color: player.rating >= 8 ? '#15803d' : '#1e40af' }}
            >
              {player.rating.toFixed(1)}
            </div>
          )}
        </a>
      </div>
      
      <div className="flex-1 min-w-0 w-full px-1">
        <a href={localizedHref(locale, `/player/${player.slug}`)} className="no-underline">
          <h2 className="font-hl font-black text-[14px] sm:text-lg lg:text-xl text-slate-900 truncate leading-tight hover:text-primary transition-colors uppercase tracking-tight">
            {player.common_name || player.name}
          </h2>
        </a>

        {/* High-Density Player Info */}
        <div className="flex flex-col gap-1.5 sm:gap-2 items-center mt-2">
          <div className="flex items-center justify-center gap-1.5 sm:gap-2.5 flex-wrap">
            <span className="label-caps !text-[11px] sm:!text-[13px] px-2 py-1 bg-slate-100 text-slate-600 rounded-md font-bold transition-transform hover:scale-105">
              {playerAge} {tc('units.years') || 'ans'}
            </span>
            <span className="label-caps !text-[11px] sm:!text-[13px] px-2 py-1 bg-slate-100 text-slate-600 rounded-md font-bold transition-transform hover:scale-105">
              {player.height} {tc('units.cm') || 'cm'}
            </span>
            <span className="hidden sm:inline-block label-caps !text-[12px] px-2 py-1 bg-slate-100 text-slate-600 rounded-md font-bold transition-transform hover:scale-105">
              {player.preferred_foot}
            </span>
          </div>
          
          <div className="flex flex-col items-center gap-1 sm:gap-1.5 mt-1">
            <span className="label-caps !text-[11px] sm:!text-[13px] !text-slate-500 flex items-center gap-1 sm:gap-1.5 font-bold">
              <span className="text-[14px] sm:text-[16px] drop-shadow-sm">{player.flag_emoji}</span> 
              <span className="truncate max-w-[120px] sm:max-w-none">{player.team}</span>
            </span>
            <span className="label-caps !text-[10px] sm:!text-[11px] px-2 sm:px-3 py-0.5 rounded-lg whitespace-nowrap shadow-sm font-black border border-white/20" style={posStyle}>
              {tc(`positions.${posKey}`) || player.position}
            </span>
          </div>
        </div>

        <div className="flex justify-center mt-1.5 sm:mt-2 scale-75 sm:scale-100 origin-center">
          <FormDots form={player.recent_form} t={tc} />
        </div>
        {isWinner && (
          <div className="mt-1 sm:mt-1.5 flex justify-center">
            <span className="label-caps !text-[8px] sm:!text-[10px] bg-amber-50 text-amber-600 border border-amber-100 flex items-center gap-1 sm:gap-1.5 pl-1 sm:pl-1.5 pr-1.5 sm:pr-2 py-0.5 rounded-md sm:rounded-lg shadow-sm">
              <span className="text-[10px] leading-none">⭐</span> {t('hero.winner')}
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
  const { isMobile } = useBreakpoint()
  
  return (
    <div className="glass-card !p-0 overflow-hidden mb-3 border-slate-200/50 shadow-2xl shadow-slate-200/50 relative">
      <div className="absolute inset-0 hero-mesh opacity-30 pointer-events-none" />
      <div className="absolute -top-24 -left-24 w-64 h-64 bg-blue-500/5 rounded-full blur-[100px] pointer-events-none" />
      <div className="absolute -bottom-24 -right-24 w-64 h-64 bg-red-500/5 rounded-full blur-[100px] pointer-events-none" />

      <div className="relative z-10 flex flex-row items-center gap-1 sm:gap-4 px-2 sm:px-10 py-4 sm:py-6 overflow-hidden">
        <div className="flex-1 min-w-0 order-1">
          <PlayerCard player={playerA} side="left" winnerSlug={winnerSlug} locale={locale} t={t} tc={tc} isMobile={isMobile} />
        </div>

        <div className="flex flex-col items-center gap-2 sm:gap-3 shrink-0 order-2 px-1 sm:px-6 relative">
          <div className="relative group">
            <div className="absolute inset-0 bg-primary/20 blur-xl sm:blur-2xl rounded-full scale-125 sm:scale-150 animate-pulse group-hover:bg-primary/30 transition-all" />
            <div className="relative w-8 h-8 sm:w-16 sm:h-16 rounded-full bg-slate-900 flex items-center justify-center border-2 sm:border-4 border-white shadow-xl sm:shadow-2xl z-10 transform -rotate-12 group-hover:rotate-0 transition-all duration-500">
              <span className="font-hl font-black text-white text-xs sm:text-2xl italic tracking-tighter">VS</span>
            </div>
          </div>
          <div className="px-2 sm:px-3 py-0.5 sm:py-1 rounded-full bg-slate-50 border border-slate-100 shadow-sm hidden xs:flex">
            <span className="label-caps !text-[6px] sm:!text-[8px] !text-slate-400 whitespace-nowrap">
              {t('hero.career_badge')}
            </span>
          </div>
        </div>

        <div className="flex-1 min-w-0 order-3">
          <PlayerCard player={playerB} side="right" winnerSlug={winnerSlug} locale={locale} t={t} tc={tc} isMobile={isMobile} />
        </div>
      </div>
    </div>
  )
}
