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
    <div className="rounded-xl overflow-hidden bg-gradient-to-br from-[#004782] to-[#002e54] shadow-lg shadow-primary/10">
      <div className="p-4">
        <div className="flex items-center gap-2 mb-3">
          <svg width="17" height="17" viewBox="0 0 24 24" fill="#93bdfd" className="flex-shrink-0">
            <path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm-2 15l-5-5 1.41-1.41L10 14.17l7.59-7.59L19 8l-9 9z"/>
          </svg>
          <span className="font-headline font-black text-[12px] uppercase tracking-[.08em]" style={{ color: '#93bdfd' }}>
            {labels?.title ?? 'AI Insight'}
          </span>
          <span className="ml-auto text-[8px] font-black uppercase tracking-[.1em] px-2 py-0.5 rounded-full"
            style={{ background: 'rgba(255,255,255,.15)', color: 'rgba(255,255,255,.8)' }}>
            {labels?.badge ?? 'NovaDuel AI'}
          </span>
        </div>
        
        <div className="mb-4">
          <FormattedInsight text={insight} isDark={true} />
        </div>

        <div className="grid grid-cols-2 gap-2">
          {[{ label: configLabels[0], player: winner }, { label: configLabels[1], player: other }].map(({ label, player }, i) => (
            <div key={i} className="p-2.5 rounded-lg"
              style={{ background: 'rgba(255,255,255,.1)', border: '1px solid rgba(255,255,255,.15)' }}>
              <div className="text-[9px] font-black uppercase tracking-[.08em] mb-1" style={{ color: 'rgba(255,255,255,.6)' }}>
                {label}
              </div>
              <Link href={localizedHref(locale, `/player/${player?.slug}`)} className="no-underline group/p">
                <div className="font-headline font-black text-[13px] text-white truncate group-hover/p:text-blue-200 transition-colors">
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
  const SIZE   = 200
  const cx     = SIZE / 2
  const cy     = SIZE / 2
  const maxR   = SIZE * 0.36
  const SKILL_LABELS = labels?.skills ?? ['FINITION', 'DRIBBLE', 'PASSES', 'PHYSIQUE', 'VISION']
  const ANGLES = [-90, -90 + 72, -90 + 144, -90 + 216, -90 + 288]
  const RINGS  = [0.33, 0.66, 1.0]

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

  const LABEL_OFFSET = compact ? 17 : 20
  const TEXT_SIZE    = compact ? 6.5 : 7.5

  return (
    <div className="bg-white rounded-xl border border-[#c2c6d2] shadow-sm overflow-hidden text-primary">
      <div className="px-4 py-3 border-b border-[#eef0f2]">
        <span className="font-headline font-bold text-[13px] text-[#191c1d]">{labels?.title ?? 'Radar de compétences'}</span>
      </div>
      <div className="px-4 py-3">
        <svg width="100%" viewBox={`-30 -15 ${SIZE + 60} ${SIZE + 30}`} style={{ display: 'block' }}>
          {RINGS.map((r, i) => <polygon key={i} points={ringPts(r)} fill="none" stroke="#e1e3e4" strokeWidth="0.6" />)}
          {ANGLES.map((a, i) => {
            const o = polar(a, maxR); const inn = polar(a, maxR * 0.33)
            return <line key={i} x1={inn.x} y1={inn.y} x2={o.x} y2={o.y} stroke="#e1e3e4" strokeWidth="0.4" />
          })}
          <polygon points={toPoints(skillsB, maxR)}
            fill="rgba(146,0,15,.08)" stroke="#92000f" strokeWidth="1.2" strokeDasharray="3,1.5" />
          <polygon points={toPoints(skillsA, maxR)}
            fill="rgba(0,71,130,.1)" stroke="#004782" strokeWidth="1.3" />
          {ANGLES.map((a, i) => {
            const vals = [skillsA.finishing, skillsA.dribble, skillsA.passing, skillsA.physical, skillsA.vision]
            const { x, y } = polar(a, (vals[i] / 100) * maxR)
            return <circle key={i} cx={x} cy={y} r="2.5" fill="#004782" />
          })}
          {ANGLES.map((a, i) => {
            const { x, y } = polar(a, maxR + LABEL_OFFSET)
            const anchor = x < cx - 4 ? 'end' : x > cx + 4 ? 'start' : 'middle'
            return (
              <text key={i} x={x} y={y} textAnchor={anchor} dominantBaseline="central"
                fill="#004782" fontFamily="'Manrope',sans-serif" fontWeight="700" fontSize={TEXT_SIZE} className="uppercase">
                {SKILL_LABELS[i]}
              </text>
            )
          })}
        </svg>
      </div>
      <div className="flex items-center justify-center gap-4 pb-3 px-4">
        <Link href={localizedHref((locale as any), `/player/${playerA.slug}`)} className="flex items-center gap-1.5 no-underline hover:opacity-80 transition-opacity">
          <div className="w-4 h-0.5 bg-[#004782] rounded" />
          <span className="text-[10px] font-bold text-[#004782] truncate max-w-[80px]">{playerA.common_name}</span>
        </Link>
        <Link href={localizedHref((locale as any), `/player/${playerB.slug}`)} className="flex items-center gap-1.5 no-underline hover:opacity-80 transition-opacity">
          <div className="w-4 border-t-2 border-dashed border-[#92000f]" />
          <span className="text-[10px] font-bold text-[#92000f] truncate max-w-[80px]">{playerB.common_name}</span>
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
    <div className="bg-white rounded-xl border border-[#c2c6d2] shadow-sm overflow-hidden text-primary">
      <div className="px-4 py-3 border-b border-[#f3f4f5]">
        <span className="font-headline font-bold text-[13px] text-[#191c1d]">{labels?.title ?? 'Duels similaires'}</span>
      </div>
      {duels.map((d, i) => (
        <Link key={i} href={localizedHref(locale, `/compare/${d.slug}`)}
          className="flex items-center gap-3 px-4 py-3 border-b border-[#f3f4f5] last:border-0 no-underline hover:bg-[#f8f9fa] active:bg-[#f3f4f5] transition-colors">
          <div className="flex flex-shrink-0">
            <div className="w-7 h-7 rounded-full flex items-center justify-center font-headline font-black text-[9px] border-2 border-white z-10"
              style={{ background: d.bgA, color: d.colorA }}>
              {d.initialsA}
            </div>
            <div className="w-7 h-7 rounded-full flex items-center justify-center font-headline font-black text-[9px] border-2 border-white -ml-2"
              style={{ background: d.bgB, color: d.colorB }}>
              {d.initialsB}
            </div>
          </div>
          <div className="flex-1 min-w-0 text-left">
            <div className="text-[12px] font-semibold text-[#191c1d] truncate">
              {d.nameA} vs {d.nameB}
            </div>
            <div className="text-[10px] text-[#727782] mt-px">{fmtViews(d.views)}</div>
          </div>
          <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="#c2c6d2" strokeWidth="2" className="flex-shrink-0">
            <path d="m9 18 6-6-6-6"/>
          </svg>
        </Link>
      ))}
    </div>
  )
}
