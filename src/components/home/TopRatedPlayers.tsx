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
      <div className="px-4 py-2.5 border-b border-gray-50 flex items-center justify-between gap-2">
        <span className="text-[10px] md:text-xs font-bold uppercase tracking-wider text-slate-600 truncate">{t('in_form_title')}</span>
        <div className="relative inline-flex items-center shrink-0 max-w-[140px]">
          <select
            value={leagueId ?? ''}
            onChange={e => setLeagueId(e.target.value ? Number(e.target.value) : null)}
            className="appearance-none bg-gray-50 border border-gray-100 rounded-full pl-3 pr-8 py-1.5 text-[10px] md:text-xs font-bold text-primary cursor-pointer outline-none w-full truncate"
          >
            {LEAGUES.map(l => (
              <option key={l.id ?? 'all'} value={l.id ?? ''}>
                {l.name ?? tc('labels.all_competitions')}
              </option>
            ))}
          </select>
          <svg className="absolute right-2.5 pointer-events-none" width="10" height="10" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" color="#60a5fa">
            <path d="m6 9 6 6 6-6"/>
          </svg>
        </div>
      </div>

      {/* List */}
      {loading ? (
        <div className="p-8 flex justify-center">
          <span className="text-xs text-slate-500 animate-pulse font-bold tracking-widest uppercase">{tc('labels.loading')}</span>
        </div>
      ) : (
        <div className="flex flex-col">
          {players.map((p, i) => {
            const rc = ratingColor(p.rating)
            return (
              <Link
                  key={p.id}
                  href={localizedHref(locale, `/player/${p.slug}`)}
                  className={`flex items-center gap-3 md:gap-4 px-4 py-2 hover:bg-gray-50 transition-colors no-underline group${i < players.length - 1 ? ' border-b border-gray-50' : ''}`}
                >
                {/* Rang */}
                <span className="font-hl font-black text-xs text-slate-400 w-4 text-center shrink-0 group-hover:text-primary/40 transition-colors">{i + 1}</span>

                {/* Avatar coloré (carré) */}
                <div className={`w-8 h-8 rounded-lg flex items-center justify-center font-hl font-bold text-[10px] shrink-0 ${AV_COLORS[i % AV_COLORS.length].bg} ${AV_COLORS[i % AV_COLORS.length].text} group-hover:scale-105 transition-all shadow-sm`}>
                  {p.initials}
                </div>

                  {/* Info */}
                  <div className="flex-1 min-w-0">
                    <div className="text-sm text-slate-700 font-bold truncate group-hover:text-primary transition-colors leading-tight">{p.name}</div>
                    <div className="flex items-center gap-1.5 mt-0.5">
                      <span className="text-[10px] md:text-xs text-gray-500 truncate">{p.team}</span>
                    </div>
                  </div>

                  {/* Rating */}
                  <div className="flex items-center gap-2 shrink-0">
                    <div className={`w-1 h-6 rounded-sm ${p.rating >= 8 ? 'bg-emerald-500' : p.rating >= 7 ? 'bg-emerald-400' : 'bg-slate-300'}`} />
                    <span className="font-hl font-bold text-base md:text-lg text-slate-900">
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
