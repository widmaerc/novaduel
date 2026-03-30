'use client'
import { useState } from 'react'
import type { Player, StatCategory } from './types'

interface StatRow {
  emoji: string; label: string
  keyA: keyof Player; keyB: keyof Player
  unit?: string; lowerIsBetter?: boolean
  format?: (v: number) => string
  compute?: (p: Player) => number
}

interface StatsDetailsProps { 
  playerA: Player; playerB: Player; locale?: string
  labels?: {
    title: string
    categories: Record<StatCategory, string>
    rows: Record<string, string>
    lowerIsBetterHint: string
  }
}

function DoubleBar({ a, b, lowerIsBetter }: { a: number; b: number; lowerIsBetter?: boolean }) {
  const total = a + b || 1
  const pA    = Math.round((a / total) * 100)
  const pB    = 100 - pA
  return (
    <div className="w-full flex h-1.5 rounded overflow-hidden bg-[#edeeef]">
      <div className="transition-all duration-700" style={{ width: `${pA}%`, background: lowerIsBetter && a > b ? '#c2c6d2' : '#004782', borderRadius: '3px 0 0 3px' }} />
      <div className="transition-all duration-700" style={{ width: `${pB}%`, background: lowerIsBetter && b > a ? '#c2c6d2' : '#92000f', borderRadius: '0 3px 3px 0' }} />
    </div>
  )
}

export default function StatsDetails({ playerA, playerB, labels }: StatsDetailsProps) {
  const [cat, setCat] = useState<StatCategory>('attack')

  const CAT_LABELS: Record<StatCategory, string> = labels?.categories ?? {
    attack: 'Attaque', passing: 'Passe', defense: 'Défense', physical: 'Physique',
  }

  const ROW_LABELS: Record<string, string> = labels?.rows ?? {
    goals: 'Buts', assists: 'Passes déc.', matches: 'Matchs', xg: 'xG',
    dribbles: 'Dribbles/match', minutes_per_goal: 'Min./but',
    pass_accuracy: 'Précision passes', duels_won: 'Duels gagnés',
    yellow_cards: 'Cartons jaunes', red_cards: 'Cartons rouges',
    shots_on_target: 'Tirs cadrés/m.', minutes: 'Minutes jouées'
  }

  const STATS: Record<StatCategory, StatRow[]> = {
    attack: [
      { emoji: '⚽', label: ROW_LABELS.goals,           keyA: 'goals',    keyB: 'goals'    },
      { emoji: '🎯', label: ROW_LABELS.assists,         keyA: 'assists',  keyB: 'assists'  },
      { emoji: '📋', label: ROW_LABELS.matches,         keyA: 'matches',  keyB: 'matches'  },
      { emoji: '📈', label: ROW_LABELS.xg,              keyA: 'xg',       keyB: 'xg',      format: v => v.toFixed(1) },
      { emoji: '🔄', label: ROW_LABELS.dribbles,        keyA: 'dribbles', keyB: 'dribbles', format: v => v.toFixed(1) },
      { emoji: '⏱',  label: ROW_LABELS.minutes_per_goal, keyA: 'minutes',  keyB: 'minutes',
        compute: p => p.goals > 0 ? Math.round(p.minutes / p.goals) : 0 },
    ],
    passing: [
      { emoji: '📊', label: ROW_LABELS.pass_accuracy,   keyA: 'pass_accuracy', keyB: 'pass_accuracy', unit: '%', format: v => v.toFixed(1) },
      { emoji: '🎯', label: ROW_LABELS.assists,         keyA: 'assists',       keyB: 'assists'       },
      { emoji: '🔄', label: ROW_LABELS.dribbles,        keyA: 'dribbles',      keyB: 'dribbles',     format: v => v.toFixed(1) },
    ],
    defense: [
      { emoji: '🤺', label: ROW_LABELS.duels_won,       keyA: 'duels_won',    keyB: 'duels_won',    unit: '%' },
      { emoji: '🟨', label: ROW_LABELS.yellow_cards,    keyA: 'yellow_cards', keyB: 'yellow_cards', lowerIsBetter: true },
      { emoji: '🟥', label: ROW_LABELS.red_cards,       keyA: 'red_cards',    keyB: 'red_cards',    lowerIsBetter: true },
    ],
    physical: [
      { emoji: '⚡', label: ROW_LABELS.shots_on_target, keyA: 'shots_on_target', keyB: 'shots_on_target', format: v => v.toFixed(1) },
      { emoji: '🤺', label: ROW_LABELS.duels_won,       keyA: 'duels_won',       keyB: 'duels_won',       unit: '%' },
      { emoji: '⏱',  label: ROW_LABELS.minutes,        keyA: 'minutes',         keyB: 'minutes'          },
    ],
  }

  function val(p: Player, row: StatRow): number {
    if (row.compute) return row.compute(p)
    return Number(p[row.keyA]) || 0
  }

  function display(p: Player, row: StatRow): string {
    const v = val(p, row)
    const s = row.format ? row.format(v) : String(v)
    return row.unit ? `${s}${row.unit}` : s
  }

  return (
    <div className="bg-white rounded-xl overflow-hidden border border-[#eef0f2] shadow-sm text-primary">
      <div className="px-4 py-3 border-b border-[#eef0f2]">
        <div className="flex items-center justify-between gap-3 flex-wrap">
          <span className="font-headline font-bold text-[13px] text-[#191c1d]">{labels?.title ?? 'Statistiques'}</span>
          <div className="flex bg-[#f3f4f5] rounded-lg p-0.5 gap-px overflow-x-auto max-w-full">
            {(Object.keys(CAT_LABELS) as StatCategory[]).map(c => (
              <button key={c} onClick={() => setCat(c)}
                className={`px-2.5 py-1.5 rounded-md text-[10px] sm:text-[11px] font-semibold transition-all whitespace-nowrap flex-shrink-0 ${
                  cat === c ? 'bg-white text-[#004782] font-bold shadow-sm' : 'text-[#727782] hover:text-[#191c1d]'}`}>
                {CAT_LABELS[c]}
              </button>
            ))}
          </div>
        </div>
        <div className="flex items-center gap-2 mt-3">
          <div className="flex items-center gap-1.5 bg-[#EFF6FF] border border-[#004782]/20 px-2.5 py-1 rounded-full">
            <div className="w-1.5 h-1.5 rounded-full bg-[#004782] flex-shrink-0" />
            <span className="text-[10px] font-bold text-[#004782] uppercase tracking-[.06em] truncate max-w-[80px] sm:max-w-none">
              {playerA.common_name}
            </span>
          </div>
          <div className="flex items-center gap-1.5 bg-[#fef2f2] border border-[#92000f]/20 px-2.5 py-1 rounded-full">
            <div className="w-1.5 h-1.5 rounded-full bg-[#92000f] flex-shrink-0" />
            <span className="text-[10px] font-bold text-[#92000f] uppercase tracking-[.06em] truncate max-w-[80px] sm:max-w-none">
              {playerB.common_name}
            </span>
          </div>
        </div>
      </div>

      {STATS[cat].map((row, i) => {
        const vA = val(playerA, row)
        const vB = val(playerB, row)
        const wA = row.lowerIsBetter ? vA <= vB : vA >= vB
        const wB = row.lowerIsBetter ? vB <= vA : vB >= vA

        return (
          <div key={i} className="px-4 py-3 border-b border-[#f3f4f5] last:border-0 hover:bg-[#f8f9fa] transition-colors">
            {/* Mobile */}
            <div className="flex items-center gap-3 sm:hidden">
              <span className="font-headline font-extrabold text-[17px] w-12 flex-shrink-0"
                style={{ color: wA ? '#191c1d' : '#c2c6d2' }}>
                {display(playerA, row)}
              </span>
              <div className="flex-1 flex flex-col items-center gap-1 min-w-0">
                <span className="text-[9px] font-bold uppercase tracking-[.06em] text-[#727782] text-center">
                  {row.emoji} {row.label}
                </span>
                <DoubleBar a={vA} b={vB} lowerIsBetter={row.lowerIsBetter} />
              </div>
              <span className="font-headline font-extrabold text-[17px] w-12 flex-shrink-0 text-right"
                style={{ color: wB ? '#191c1d' : '#c2c6d2' }}>
                {display(playerB, row)}
              </span>
            </div>
            {/* Desktop */}
            <div className="hidden sm:grid items-center gap-0"
              style={{ gridTemplateColumns: '72px 1fr 72px' }}>
              <div className="flex items-center gap-1">
                <span className="font-headline font-extrabold text-[18px]"
                  style={{ color: wA ? '#191c1d' : '#c2c6d2' }}>
                  {display(playerA, row)}
                </span>
                {wA && !wB && <span className="text-[9px] font-black text-[#004782]">▲</span>}
              </div>
              <div className="flex flex-col items-center gap-1.5 px-3 min-w-0">
                <span className="text-[10px] font-bold uppercase tracking-[.06em] text-[#727782] text-center w-full truncate">
                  {row.emoji} {row.label}
                </span>
                <DoubleBar a={vA} b={vB} lowerIsBetter={row.lowerIsBetter} />
                {row.lowerIsBetter && (
                  <span className="text-[9px] text-[#727782] opacity-60">
                    {labels?.lowerIsBetterHint ?? 'Moins = mieux'}
                  </span>
                )}
              </div>
              <div className="flex items-center justify-end gap-1">
                {wB && !wA && <span className="text-[9px] font-black text-[#92000f]">▲</span>}
                <span className="font-headline font-extrabold text-[18px]"
                  style={{ color: wB ? '#191c1d' : '#c2c6d2' }}>
                  {display(playerB, row)}
                </span>
              </div>
            </div>
          </div>
        )
      })}
    </div>
  )
}
