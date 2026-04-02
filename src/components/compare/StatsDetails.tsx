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
  
  // Logic: Primary blue for A, Deep Red for B. If lower is better, invert prominence.
  const gradientA = lowerIsBetter && a > b ? 'bg-slate-200' : 'bg-gradient-to-r from-blue-600 to-blue-400'
  const gradientB = lowerIsBetter && b > a ? 'bg-slate-200' : 'bg-gradient-to-l from-red-600 to-red-400'

  return (
    <div className="w-full flex h-1.5 sm:h-2 rounded-full overflow-hidden bg-slate-100/50 shadow-inner border border-slate-200/20">
      <div className={`transition-all duration-1000 ease-out h-full ${gradientA} ${pA > 0 ? 'rounded-l-full' : ''}`} 
        style={{ width: `${pA}%` }} />
      <div className={`transition-all duration-1000 ease-out h-full ${gradientB} ${pB > 0 ? 'rounded-r-full' : ''}`} 
        style={{ width: `${pB}%` }} />
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
    <div className="glass-card shadow-xl border-slate-200/50 !p-0 overflow-hidden mb-8">
      {/* Header with Nav */}
      <div className="px-6 py-6 border-b border-slate-100 relative">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-6">
          <div className="flex flex-col gap-1">
            <h3 className="font-hl font-black text-lg text-slate-900 drop-shadow-sm">
              {labels?.title ?? 'Statistiques Comparatives'}
            </h3>
            <p className="label-caps !text-[9px] !text-slate-400 opacity-80">Données techniques avancées</p>
          </div>
          
          <div className="flex bg-slate-100/60 p-1.5 rounded-xl gap-1 overflow-x-auto no-scrollbar border border-slate-200/30">
            {(Object.keys(CAT_LABELS) as StatCategory[]).map(c => (
              <button key={c} onClick={() => setCat(c)}
                className={`px-4 py-2 rounded-lg text-[10px] label-caps transition-all whitespace-nowrap ${
                  cat === c ? 'bg-white text-primary font-black shadow-sm border border-slate-200/30' : 'text-slate-400 hover:text-slate-600'}`}>
                {CAT_LABELS[c]}
              </button>
            ))}
          </div>
        </div>
        
        {/* Dynamic Legend */}
        <div className="flex items-center gap-4 mt-6">
          <div className="flex items-center gap-2.5">
            <div className="w-8 h-8 rounded-lg bg-blue-50 border border-blue-100 flex items-center justify-center shrink-0">
              <span className="text-blue-600 font-black text-[10px]">{playerA.initials}</span>
            </div>
            <span className="label-caps !text-[9px] !text-blue-600 font-black">{playerA.common_name}</span>
          </div>
          <div className="w-px h-4 bg-slate-100" />
          <div className="flex items-center gap-2.5">
            <div className="w-8 h-8 rounded-lg bg-red-50 border border-red-100 flex items-center justify-center shrink-0">
              <span className="text-red-600 font-black text-[10px]">{playerB.initials}</span>
            </div>
            <span className="label-caps !text-[9px] !text-red-600 font-black">{playerB.common_name}</span>
          </div>
        </div>
      </div>

      {/* Stats List */}
      <div className="divide-y divide-slate-50">
        {STATS[cat].map((row, i) => {
          const vA = val(playerA, row)
          const vB = val(playerB, row)
          const wA = row.lowerIsBetter ? vA <= vB : vA >= vB
          const wB = row.lowerIsBetter ? vB <= vA : vB >= vA

          return (
            <div key={i} className="px-6 py-5 group hover:bg-slate-50/50 transition-all duration-300">
              {/* Mobile View */}
              <div className="flex items-center gap-6 sm:hidden">
                <span className="font-hl font-black text-2xl w-14 shrink-0 transition-colors"
                  style={{ color: wA ? '#1e40af' : '#cbd5e1' }}>
                  {display(playerA, row)}
                </span>
                <div className="flex-1 flex flex-col items-center gap-2 min-w-0">
                  <span className="label-caps !text-[9px] !text-slate-400 text-center w-full truncate">
                    <span className="mr-1.5">{row.emoji}</span> {row.label}
                  </span>
                  <DoubleBar a={vA} b={vB} lowerIsBetter={row.lowerIsBetter} />
                </div>
                <span className="font-hl font-black text-2xl w-14 shrink-0 text-right transition-colors"
                  style={{ color: wB ? '#dc2626' : '#cbd5e1' }}>
                  {display(playerB, row)}
                </span>
              </div>

              {/* Desktop View */}
              <div className="hidden sm:grid items-center gap-0"
                style={{ gridTemplateColumns: '120px 1fr 120px' }}>
                <div className="flex items-center gap-3">
                  <span className="font-hl font-black text-3xl transition-colors"
                    style={{ color: wA ? '#1e40af' : '#cbd5e1' }}>
                    {display(playerA, row)}
                  </span>
                  {wA && !wB && <div className="w-2 h-2 rounded-full bg-blue-500 animate-pulse shadow-lg shadow-blue-500/20" />}
                </div>
                
                <div className="flex flex-col items-center gap-3 px-10 min-w-0">
                  <span className="label-caps !text-[10px] !text-slate-400 text-center w-full truncate flex items-center justify-center gap-2">
                    <span className="opacity-100">{row.emoji}</span>
                    <span className="opacity-80 font-bold">{row.label}</span>
                  </span>
                  <DoubleBar a={vA} b={vB} lowerIsBetter={row.lowerIsBetter} />
                  {row.lowerIsBetter && (
                    <span className="label-caps !text-[8px] !text-slate-300 italic">
                      {labels?.lowerIsBetterHint ?? 'Valeur basse privilégiée'}
                    </span>
                  )}
                </div>

                <div className="flex items-center justify-end gap-3 text-right">
                  {wB && !wA && <div className="w-2 h-2 rounded-full bg-red-500 animate-pulse shadow-lg shadow-red-500/20" />}
                  <span className="font-hl font-black text-3xl transition-colors"
                    style={{ color: wB ? '#dc2626' : '#cbd5e1' }}>
                    {display(playerB, row)}
                  </span>
                </div>
              </div>
            </div>
          )
        })}
      </div>
    </div>
  )
}
