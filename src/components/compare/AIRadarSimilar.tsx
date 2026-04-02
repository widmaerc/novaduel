'use client'
import { useParams } from 'next/navigation'
import { FormattedInsight } from '../FormattedInsight'
import Link from 'next/link'
import { localizedHref } from '@/lib/localizedPaths'
import type { Player, RadarSkills, SimilarDuel, Locale } from './types'

// ── AIInsightBlock ────────────────────────────────────────────────────────────
interface AIInsightBlockProps {
  insight: string; playerA: Player; playerB: Player
  winnerSlug: string; locale?: Locale
  labels?: { title: string; badge: string; config: string[] }
}

export function AIInsightBlock({ insight, playerA, playerB, winnerSlug, labels }: Omit<AIInsightBlockProps, 'locale'>) {
  const params = useParams()
  const locale = (params?.locale as string) ?? 'fr'
  const defaultLabels: Record<string, string[]> = {
    fr: ['Régularité', 'Explosivité'],
    en: ['Consistency', 'Explosiveness'],
    es: ['Regularidad', 'Explosividad'],
  }
  const configLabels: string[] = labels?.config ?? defaultLabels[locale] ?? defaultLabels['fr']

  const winner = [playerA, playerB].find(p => p.slug === winnerSlug)
  const other  = [playerA, playerB].find(p => p.slug !== winnerSlug)

  return (
    <div className="glass-card !p-0 overflow-hidden ai-gradient border-none shadow-2xl relative group">
      <div className="absolute inset-0 hero-mesh opacity-20 pointer-events-none" />
      <div className="p-6 relative z-10">
        <div className="flex items-center gap-3 mb-5">
          <div className="w-8 h-8 rounded-lg bg-white/10 flex items-center justify-center backdrop-blur-md border border-white/20">
            <svg width="18" height="18" viewBox="0 0 24 24" fill="white" className="opacity-90">
              <path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm-2 15l-5-5 1.41-1.41L10 14.17l7.59-7.59L19 8l-9 9z"/>
            </svg>
          </div>
          <span className="label-caps !text-[11px] !text-white !font-black !opacity-100 tracking-[0.15em]">
            {labels?.title ?? 'AI Scouting Insight'}
          </span>
          <span className="ml-auto text-[8px] font-black uppercase tracking-[.15em] px-2.5 py-1 rounded-full bg-white/20 text-white border border-white/10 backdrop-blur-md">
            {labels?.badge ?? 'NovaDuel Engine'}
          </span>
        </div>
        
        <div className="mb-6 bg-white/5 rounded-xl p-4 border border-white/10 backdrop-blur-sm shadow-inner group-hover:bg-white/[0.08] transition-colors">
          <FormattedInsight text={insight} isDark={true} />
        </div>

        <div className="grid grid-cols-2 gap-3">
          {[{ label: configLabels[0], player: winner, color: 'text-emerald-300' }, { label: configLabels[1], player: other, color: 'text-blue-200' }].map(({ label, player, color }, i) => (
            <div key={i} className="p-3.5 rounded-xl bg-white/5 border border-white/10 backdrop-blur-md hover:bg-white/10 transition-all cursor-default">
              <div className="label-caps !text-[8.5px] !text-white/40 !font-bold mb-2 tracking-widest whitespace-nowrap overflow-hidden">
                {label}
              </div>
              <Link href={localizedHref(locale, `/player/${player?.slug}`)} className="no-underline group/p block">
                <div className={`font-hl font-black text-sm text-white truncate group-hover/p:${color} transition-colors uppercase tracking-tight`}>
                  {player?.common_name}
                </div>
              </Link>
            </div>
          ))}
        </div>
      </div>
    </div>
  )
}

// ── SkillRadar ────────────────────────────────────────────────────────────────
interface SkillRadarProps {
  playerA: Player; playerB: Player
  skillsA: RadarSkills; skillsB: RadarSkills
  compact?: boolean
  labels?: { title: string; skills: string[] }
}

export function SkillRadar({ playerA, playerB, skillsA, skillsB, compact = false, labels }: SkillRadarProps) {
  const params = useParams()
  const locale = (params?.locale as string) ?? 'fr'
  const SIZE   = 240
  const cx     = SIZE / 2
  const cy     = SIZE / 2
  const maxR   = SIZE * 0.35
  const SKILL_LABELS = labels?.skills ?? ['FINITION', 'DRIBBLE', 'PASSES', 'PHYSIQUE', 'VISION']
  const ANGLES = [-90, -90 + 72, -90 + 144, -90 + 216, -90 + 288]
  const RINGS  = [0.2, 0.4, 0.6, 0.8, 1.0]

  function polar(angle: number, r: number) {
    const rad = (angle * Math.PI) / 180
    return { x: cx + r * Math.cos(rad), y: cy + r * Math.sin(rad) }
  }

  function toPoints(skills: RadarSkills, r: number) {
    const vals = [skills.finishing, skills.dribble, skills.passing, skills.physical, skills.vision]
    return ANGLES.map((a, i) => {
      const { x, y } = polar(a, (vals[i] / 100) * r)
      return `${x},${y}`
    }).join(' ')
  }

  function ringPts(f: number) {
    return ANGLES.map(a => { const { x, y } = polar(a, maxR * f); return `${x},${y}` }).join(' ')
  }

  const LABEL_OFFSET = compact ? 22 : 28
  const TEXT_SIZE    = compact ? 7.5 : 9

  return (
    <div className="glass-card shadow-xl overflow-hidden bg-white/70 backdrop-blur-xl border-slate-200/50 group">
      <div className="px-5 py-4 border-b border-slate-100 flex items-center justify-between bg-slate-50/30">
        <div className="flex items-center gap-2.5">
          <div className="w-2 h-2 rounded-full bg-primary animate-pulse" />
          <h3 className="label-caps !text-[12px] !text-slate-900 !font-black">
            {labels?.title ?? 'Analyse Radar'}
          </h3>
        </div>
        <span className="label-caps !text-[8.5px] !text-slate-400 !font-bold opacity-60">Scouting V4</span>
      </div>
      
      <div className="relative p-6 flex flex-col items-center">
        <div className="absolute inset-0 hero-mesh opacity-5 pointer-events-none" />
        
        <svg width="100%" viewBox={`-40 -20 ${SIZE + 80} ${SIZE + 20}`} style={{ display: 'block', maxWidth: 350 }} className="relative z-10 drop-shadow-sm">
          {/* Grille Radiale */}
          {RINGS.map((r, i) => (
            <polygon key={i} points={ringPts(r)} fill="none" stroke="#e2e8f0" strokeWidth="1" strokeDasharray={i % 2 === 0 ? "" : "2,2"} />
          ))}
          {ANGLES.map((a, i) => {
            const endpoint = polar(a, maxR)
            return <line key={i} x1={cx} y1={cy} x2={endpoint.x} y2={endpoint.y} stroke="#e2e8f0" strokeWidth="1" />
          })}

          {/* Zones de Compétences */}
          {/* Joueur B (Rouge - Derrière) */}
          <polygon points={toPoints(skillsB, maxR)} className="radar-area-potential" fill="rgba(220, 38, 38, 0.15)" stroke="#dc2626" strokeWidth="1.5" strokeDasharray="3,2" />
          
          {/* Joueur A (Bleu - Devant) */}
          <polygon points={toPoints(skillsA, maxR)} className="radar-area-current shadow-lg" fill="url(#blue-radar-gradient)" stroke="#1e40af" strokeWidth="2.5" />
          
          <defs>
            <linearGradient id="blue-radar-gradient" x1="0%" y1="0%" x2="100%" y2="100%">
              <stop offset="0%" style={{ stopColor: '#1e40af', stopOpacity: 0.35 }} />
              <stop offset="100%" style={{ stopColor: '#3b82f6', stopOpacity: 0.15 }} />
            </linearGradient>
            <filter id="glow">
              <feGaussianBlur stdDeviation="3" result="coloredBlur"/>
              <feMerge>
                <feMergeNode in="coloredBlur"/><feMergeNode in="SourceGraphic"/>
              </feMerge>
            </filter>
          </defs>

          {/* Points Rayonnants Joueur A */}
          {ANGLES.map((a, i) => {
            const vals = [skillsA.finishing, skillsA.dribble, skillsA.passing, skillsA.physical, skillsA.vision]
            const { x, y } = polar(a, (vals[i] / 100) * maxR)
            return (
              <g key={i}>
                <circle cx={x} cy={y} r="4.5" fill="#1e40af" filter="url(#glow)" className="animate-pulse" />
                <circle cx={x} cy={y} r="2" fill="white" />
              </g>
            )
          })}

          {/* Points Joueur B (plus petits) */}
          {ANGLES.map((a, i) => {
            const vals = [skillsB.finishing, skillsB.dribble, skillsB.passing, skillsB.physical, skillsB.vision]
            const { x, y } = polar(a, (vals[i] / 100) * maxR)
            return <circle key={`b-${i}`} cx={x} cy={y} r="2" fill="#ef4444" opacity="0.6" />
          })}

          {/* Étiquettes */}
          {ANGLES.map((a, i) => {
            const { x, y } = polar(a, maxR + LABEL_OFFSET)
            const anchor = x < cx - 10 ? 'end' : x > cx + 10 ? 'start' : 'middle'
            return (
              <text key={i} x={x} y={y} textAnchor={anchor} dominantBaseline="central"
                fill="#475569" fontFamily="'Manrope', sans-serif" fontWeight="900" fontSize={TEXT_SIZE} className="uppercase tracking-[0.05em]">
                {SKILL_LABELS[i]}
              </text>
            )
          })}
        </svg>
      </div>

      <div className="flex items-center justify-center gap-8 py-5 border-t border-slate-50 bg-slate-50/20">
        <Link href={localizedHref((locale as any), `/player/${playerA.slug}`)} className="flex items-center gap-2.5 no-underline hover:scale-105 transition-transform group/l1">
          <div className="w-1.5 h-1.5 rounded-full bg-[#1e40af] shadow-[0_0_8px_rgba(30,64,175,0.6)]" />
          <span className="label-caps !text-[9px] !text-[#1e40af] !font-black !opacity-100 group-hover/l1:underline underline-offset-4">{playerA.common_name}</span>
        </Link>
        <div className="w-px h-3 bg-slate-200" />
        <Link href={localizedHref((locale as any), `/player/${playerB.slug}`)} className="flex items-center gap-2.5 no-underline hover:scale-105 transition-transform group/l2">
          <div className="w-1.5 h-1.5 rounded-full bg-[#ef4444] shadow-[0_0_8px_rgba(239,68,68,0.4)]" />
          <span className="label-caps !text-[9px] !text-[#ef4444] !font-black !opacity-100 group-hover/l2:underline underline-offset-4">{playerB.common_name}</span>
        </Link>
      </div>
    </div>
  )
}

// ── SimilarDuels ──────────────────────────────────────────────────────────────
interface SimilarDuelsProps { duels: SimilarDuel[]; locale?: string; labels?: { title: string; views: string } }

export function SimilarDuels({ duels, labels }: Omit<SimilarDuelsProps, 'locale'>) {
  const params = useParams()
  const locale = (params?.locale as string) ?? 'fr'
  
  function fmtViews(n: number) {
    const unit = labels?.views ?? 'vues'
    if (n >= 1_000_000) return `${(n / 1_000_000).toFixed(1)}M ${unit}`
    if (n >= 1_000)     return `${(n / 1_000).toFixed(0)}k ${unit}`
    return `${n} ${unit}`
  }

  return (
    <div className="glass-card !p-0 overflow-hidden shadow-xl border-slate-200/50">
      <div className="px-5 py-4 border-b border-slate-100 bg-slate-50/50">
        <h3 className="label-caps !text-[12px] !text-slate-900 !font-black">
          {labels?.title ?? 'Duels populaires similiaires'}
        </h3>
      </div>
      <div className="divide-y divide-slate-50">
        {duels.map((d, i) => (
          <Link key={i} href={localizedHref(locale, `/compare/${d.slug}`)}
            className="flex items-center gap-4 px-5 py-4 no-underline hover:bg-slate-50 active:bg-slate-100 transition-all group">
            <div className="flex flex-shrink-0 relative">
              <div className="w-9 h-9 rounded-2xl flex items-center justify-center font-hl font-black text-[10px] border-2 border-white shadow-md z-10 transition-transform group-hover:scale-110"
                style={{ background: d.bgA, color: d.colorA }}>
                {d.initialsA}
              </div>
              <div className="w-9 h-9 rounded-2xl flex items-center justify-center font-hl font-black text-[10px] border-2 border-white shadow-md -ml-3 z-0 transition-transform group-hover:translate-x-1"
                style={{ background: d.bgB, color: d.colorB }}>
                {d.initialsB}
              </div>
            </div>
            <div className="flex-1 min-w-0">
              <div className="font-hl font-black text-sm text-slate-800 truncate uppercase tracking-tight group-hover:text-primary transition-colors">
                {d.nameA} <span className="text-slate-300 font-bold mx-1 italic">vs</span> {d.nameB}
              </div>
              <div className="label-caps !text-[9px] !text-slate-400 font-bold mt-1 opacity-70 group-hover:opacity-100">{fmtViews(d.views)}</div>
            </div>
            <div className="w-7 h-7 rounded-full bg-slate-50 flex items-center justify-center text-slate-300 group-hover:bg-primary/10 group-hover:text-primary transition-all">
              <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3">
                <path d="m9 18 6-6-6-6"/>
              </svg>
            </div>
          </Link>
        ))}
      </div>
    </div>
  )
}
