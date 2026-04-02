'use client'
import { useState, useEffect } from 'react'
import Link from 'next/link'
import { useParams } from 'next/navigation'
import { useTranslations } from 'next-intl'
import { localizedHref } from '@/lib/localizedPaths'
import TeamBadge from '@/components/ui/TeamBadge'

interface TopPlayer {
  id:        number
  slug:      string
  name:      string
  initials:  string
  photo:     string | null
  team:      string
  team_id:   number | null
  team_logo: string | null
  league:    string
  matches:   number
  goals:     number
  assists:   number
  rating:    number
}

const AV_COLORS = [
  { bg: 'bg-blue-50',   text: 'text-blue-600'   },
  { bg: 'bg-green-50',  text: 'text-green-600'  },
  { bg: 'bg-amber-50',  text: 'text-amber-600'  },
  { bg: 'bg-red-50',    text: 'text-red-600'    },
  { bg: 'bg-purple-50', text: 'text-purple-600' },
]

const LEAGUES = [
  { id: null, name: null },
  { id: 39,   name: 'Premier League' },
  { id: 140,  name: 'La Liga'        },
  { id: 135,  name: 'Serie A'        },
  { id: 78,   name: 'Bundesliga'     },
  { id: 61,   name: 'Ligue 1'        },
]

function ratingColor(r: number) {
  if (r >= 8)   return { bg: 'var(--color-primary-fixed)', text: 'var(--color-primary)' }
  if (r >= 7)   return { bg: 'var(--color-primary-light)', text: 'var(--color-primary-c)' }
  if (r >= 6.5) return { bg: '#f8fafc', text: '#64748b' }
  return { bg: '#f1f5f9', text: '#94a3b8' }
}

interface Props {
  limit?:           number
  defaultLeagueId?: number | null
  className?:       string
}

export default function TopRatedPlayers({ limit = 10, defaultLeagueId = null, className = '' }: Props) {
  const params = useParams()
  const locale = (params?.locale as string) ?? 'fr'
  const t  = useTranslations('HomePage.top_players')
  const tc = useTranslations('Common')

  const [leagueId, setLeagueId] = useState<number | null>(defaultLeagueId)
  const [players,  setPlayers]  = useState<TopPlayer[]>([])
  const [loading,  setLoading]  = useState(true)

  useEffect(() => {
    setLoading(true)
    const p = new URLSearchParams({ limit: String(limit) })
    if (leagueId) p.set('league_id', String(leagueId))
    fetch(`/api/top-rated-players?${p}`)
      .then(r => r.json())
      .then(d => setPlayers(Array.isArray(d) ? d : []))
      .catch(() => {})
      .finally(() => setLoading(false))
  }, [leagueId, limit])

  return (
    <div className={`glass-card !bg-white rounded-2xl overflow-hidden border border-gray-100 shadow-sm ${className}`}>
      {/* Header */}
      <div className="px-4 py-3 md:px-5 md:py-3.5 border-b border-gray-50 flex items-center justify-between gap-2 bg-slate-50/30">
        <span className="label-caps !text-slate-900 !text-[10px] font-black font-hl tracking-[0.15em]">{t('title')}</span>
        <div className="relative inline-flex items-center shrink-0 max-w-[150px]">
          <select
            value={leagueId ?? ''}
            onChange={e => setLeagueId(e.target.value ? Number(e.target.value) : null)}
            className="appearance-none bg-white border border-slate-200 hover:border-primary/50 transition-colors rounded-lg pl-3 pr-8 py-1.5 text-[10px] font-bold text-slate-700 cursor-pointer outline-none w-full shadow-sm"
          >
            {LEAGUES.map(l => (
              <option key={l.id ?? 'all'} value={l.id ?? ''}>
                {l.name ?? tc('labels.all_competitions')}
              </option>
            ))}
          </select>
          <svg className="absolute right-2.5 pointer-events-none text-slate-400" width="10" height="10" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3">
            <path d="m6 9 6 6 6-6"/>
          </svg>
        </div>
      </div>

      {/* List */}
      {loading ? (
        <div className="p-10 flex flex-col items-center justify-center gap-3">
          <div className="w-6 h-6 border-2 border-primary/20 border-t-primary rounded-full animate-spin" />
          <span className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">{tc('labels.loading')}</span>
        </div>
      ) : (
        <div className="flex flex-col divide-y divide-gray-50">
          {players.map((p, i) => {
            return (
              <Link
                  key={p.id}
                  href={localizedHref(locale, `/player/${p.slug}`)}
                  className="flex items-center gap-3 md:gap-4 px-4 py-2.5 hover:bg-slate-50/50 transition-all no-underline group"
                >
                {/* Rang */}
                <span className="font-hl font-black text-xs text-slate-400 w-5 text-center shrink-0 group-hover:text-primary transition-colors">
                  {i + 1}
                </span>

                {/* Avatar (carré premium) */}
                <div className={`w-9 h-9 rounded-xl flex items-center justify-center font-hl font-bold text-xs shrink-0 ${AV_COLORS[i % AV_COLORS.length].bg} ${AV_COLORS[i % AV_COLORS.length].text} group-hover:scale-110 transition-all shadow-sm border border-white`}>
                  {p.initials}
                </div>

                {/* Info */}
                <div className="flex-1 min-w-0">
                  <div className="text-[14px] text-slate-900 font-extrabold font-hl truncate group-hover:text-primary transition-colors leading-tight tracking-tight">
                    {p.name}
                  </div>
                  <div className="flex items-center gap-1.5 mt-0.5">
                    <span className="text-[9px] font-bold text-slate-500 tracking-wider truncate">{p.team}</span>
                  </div>
                </div>

                {/* Rating */}
                <div className="flex items-center gap-2.5 shrink-0 pl-1">
                  <div className={`w-1 h-5 rounded-full ${p.rating >= 8 ? 'bg-emerald-500 shadow-[0_0_8px_rgba(16,185,129,0.3)]' : p.rating >= 7 ? 'bg-emerald-400' : 'bg-slate-300'}`} />
                  <span className="font-hl font-black text-base text-slate-900">
                    {p.rating.toFixed(1)}
                  </span>
                </div>
              </Link>
            )
          })}
        </div>
      )}
    </div>
  )
}
