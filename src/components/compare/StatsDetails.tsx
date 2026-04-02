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

function MirrorStatRow({ 
  label, v1, v2, lowerIsBetter = false, emoji, unit = '', format, labels
}: { 
  label: string; v1: number; v2: number; lowerIsBetter?: boolean; 
  emoji?: string; unit?: string; format?: (v: number) => string;
  labels?: any
}) {
  const display1 = format ? format(v1) : String(v1);
  const display2 = format ? format(v2) : String(v2);
  const val1 = unit ? `${display1}${unit}` : display1;
  const val2 = unit ? `${display2}${unit}` : display2;

  const total = v1 + v2 || 1;
  const pct1 = Math.round((v1 / total) * 100);
  const pct2 = 100 - pct1;

  const w1 = lowerIsBetter ? v1 <= v2 : v1 >= v2;
  const w2 = lowerIsBetter ? v2 <= v1 : v2 >= v1;

  return (
    <div className="flex flex-col gap-2 py-3 px-2 group/stat hover:bg-slate-50/80 transition-all rounded-2xl border border-transparent hover:border-slate-100">
      <div className="flex items-center justify-between gap-2">
        {/* Value Left - Blue side */}
        <div className="flex items-center gap-1.5 w-16 shrink-0">
          <span className={`font-hl font-black text-xl transition-colors ${w1 ? 'text-blue-600' : 'text-blue-300'}`}>
            {val1}
          </span>
          {w1 && !w2 && <div className="w-1.5 h-1.5 rounded-full bg-blue-500 shadow-[0_0_8px_rgba(59,130,246,0.6)]" />}
        </div>

        {/* Label & Bar Center */}
        <div className="flex-1 flex flex-col items-center gap-1.5 px-2 min-w-0">
          <span className="label-caps !text-[9px] !text-slate-900 text-center w-full truncate flex items-center justify-center gap-1.5 font-bold">
            {emoji && <span className="opacity-100 grayscale-[0.5] group-hover/stat:grayscale-0 transition-all">{emoji}</span>}
            <span className="font-extrabold tracking-wider">{label}</span>
          </span>

          <div className="w-full flex h-2 rounded-full overflow-hidden bg-slate-100/50 border border-slate-200/20 shadow-inner">
            <div className={`h-full transition-all duration-1000 ease-out flex justify-end bg-gradient-to-r from-blue-600 to-blue-400 ${!w1 ? 'opacity-20' : ''}`} 
              style={{ width: `${pct1}%` }} />
            <div className={`h-full transition-all duration-1000 ease-out flex justify-start bg-gradient-to-l from-red-600 to-red-400 ${!w2 ? 'opacity-20' : ''}`} 
              style={{ width: `${pct2}%` }} />
          </div>
          
          {lowerIsBetter && (
            <span className="label-caps !text-[7px] !text-slate-400 italic opacity-60">
              {labels?.lowerIsBetterHint}
            </span>
          )}
        </div>

        {/* Value Right - Red side */}
        <div className="flex items-center gap-1.5 w-16 shrink-0 justify-end text-right">
          {w2 && !w1 && <div className="w-1.5 h-1.5 rounded-full bg-red-500 shadow-[0_0_8px_rgba(239,68,68,0.6)]" />}
          <span className={`font-hl font-black text-xl transition-colors ${w2 ? 'text-red-600' : 'text-red-300'}`}>
            {val2}
          </span>
        </div>
      </div>
    </div>
  )
}

function PlayerMiniAvatar({ player, isB = false }: { player: Player; isB?: boolean }) {
  return (
    <div className={`flex items-center gap-2.5 ${isB ? 'flex-row-reverse text-right' : ''}`}>
      <div className={`w-9 h-9 rounded-xl flex items-center justify-center font-hl font-black text-[11px] border-2 border-white shadow-sm shrink-0 ${
        isB ? 'bg-red-50 text-red-600' : 'bg-blue-50 text-blue-600'
      }`}>
        {player.initials}
      </div>
      <div className="min-w-0">
        <div className="label-caps !text-[10px] font-black text-slate-800 leading-none truncate">{player.common_name}</div>
        <div className="text-[8px] text-slate-400 label-caps mt-0.5 truncate uppercase tracking-widest leading-none font-bold">{player.team}</div>
      </div>
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

  return (
    <div className="bg-white rounded-[2rem] p-6 sm:p-8 shadow-2xl shadow-blue-900/5 border border-slate-100 flex flex-col relative overflow-hidden">
      {/* Decorative Blurs */}
      <div className="absolute top-0 right-0 w-48 h-48 bg-blue-50/30 rounded-full -mr-24 -mt-24 blur-3xl pointer-events-none" />
      <div className="absolute bottom-0 left-0 w-48 h-48 bg-red-50/30 rounded-full -ml-24 -mb-24 blur-3xl pointer-events-none" />

      {/* Header section (Title & Legend) */}
      <div className="flex flex-col gap-6 mb-8 relative z-10">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div className="flex items-center gap-3">
             <div className="w-1.5 h-8 bg-primary rounded-full shadow-lg shadow-primary/20" />
             <div>
               <h3 className="font-hl font-black text-xl text-slate-900 uppercase tracking-tight leading-none">
                 {labels?.title ?? 'Tablero comparativo'}
               </h3>
               <p className="label-caps !text-[9px] !text-slate-400 font-bold mt-1 tracking-widest opacity-80 uppercase">
                 Advanced Technical Data
               </p>
             </div>
          </div>

          <div className="flex items-center gap-6 self-end sm:self-auto">
            <PlayerMiniAvatar player={playerA} />
            <div className="w-px h-8 bg-slate-100" />
            <PlayerMiniAvatar player={playerB} isB />
          </div>
        </div>

        {/* Tabs System */}
        <div className="flex bg-slate-100/60 p-1.5 rounded-2xl gap-1 border border-slate-200/30 self-start">
          {(Object.keys(CAT_LABELS) as StatCategory[]).map(c => (
            <button key={c} onClick={() => setCat(c)}
              className={`px-5 py-2.5 rounded-xl text-[10px] label-caps transition-all whitespace-nowrap font-extrabold ${
                cat === c ? 'bg-white text-primary shadow-md border border-slate-200/30' : 'text-slate-400 hover:text-slate-600'}`}>
              {CAT_LABELS[c]}
            </button>
          ))}
        </div>
      </div>

      {/* Stats Mirror List */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-x-12 gap-y-1 relative z-10">
        {STATS[cat].map((row, i) => (
          <MirrorStatRow 
            key={i}
            label={row.label}
            v1={val(playerA, row)}
            v2={val(playerB, row)}
            lowerIsBetter={row.lowerIsBetter}
            emoji={row.emoji}
            unit={row.unit}
            format={row.format}
            labels={labels}
          />
        ))}
      </div>
    </div>
  )
}
