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
  if (r >= 8)   return { bg: '#dcfce7', text: '#15803d' }
  if (r >= 7)   return { bg: '#fef9c3', text: '#854d0e' }
  if (r >= 6.5) return { bg: '#fff7ed', text: '#c2410c' }
  return { bg: '#f3f4f5', text: '#727782' }
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
    <div className={`glass-card p-0 overflow-hidden ${className}`}>
      {/* Header */}
      <div className="px-5 py-4 border-b border-slate-100 flex items-center justify-between gap-2 bg-slate-50/50">
        <h2 className="label-caps tracking-wider text-slate-500 truncate">{t('in_form_title')}</h2>
        <div className="relative inline-flex items-center shrink-0 max-w-[140px]">
          <select
            value={leagueId ?? ''}
            onChange={e => setLeagueId(e.target.value ? Number(e.target.value) : null)}
            className="appearance-none bg-white border border-slate-200 rounded-full pl-3 pr-8 py-1.5 text-[11px] font-bold text-primary cursor-pointer outline-none w-full truncate shadow-sm transition-all focus:border-primary/50"
          >
            {LEAGUES.map(l => (
              <option key={l.id ?? 'all'} value={l.id ?? ''}>
                {l.name ?? tc('labels.all_competitions')}
              </option>
            ))}
          </select>
          <svg className="absolute right-3 pointer-events-none" width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3" color="#3b82f6">
            <path d="m6 9 6 6 6-6"/>
          </svg>
        </div>
      </div>

      {/* List */}
      {loading ? (
        <div className="p-8 flex justify-center">
          <span className="text-xs text-slate-400 animate-pulse font-bold tracking-widest uppercase">{tc('labels.loading')}</span>
        </div>
      ) : (
        <div className="flex flex-col">
          {players.map((p, i) => {
            const rc = ratingColor(p.rating)
            return (
              <Link
                key={p.id}
                href={localizedHref(locale, `/player/${p.slug}`)}
                className={`flex items-center gap-4 px-5 py-4 hover:bg-slate-50 transition-all no-underline group${i < players.length - 1 ? ' border-b border-slate-50' : ''}`}
              >
                {/* Rang */}
                <span className="font-hl font-black text-xs text-slate-300 w-4 text-center shrink-0 group-hover:text-primary/40 transition-colors">{i + 1}</span>

                {/* Initiales colorées */}
                <div className="w-10 h-10 rounded-xl flex items-center justify-center font-hl font-bold text-xs shrink-0 bg-slate-100 text-slate-600 group-hover:bg-primary group-hover:text-white transition-all shadow-sm">
                  {p.initials}
                </div>

                {/* Info */}
                <div className="flex-1 min-w-0">
                  <div className="text-sm text-slate-900 font-bold truncate group-hover:text-primary transition-colors">{p.name}</div>
                  <div className="flex items-center gap-2 mt-1">
                    <TeamBadge teamId={p.team_id ?? 0} teamName={p.team} size={14} />
                    <span className="label-caps !text-[9px] !text-slate-400 truncate">{p.team}</span>
                    <span className="text-[10px] text-slate-200">|</span>
                    <span className="label-caps !text-[9px] !text-slate-400">{p.matches} GP</span>
                  </div>
                </div>

                {/* Stats */}
                <div className="flex items-center gap-3 shrink-0">
                  <div className="text-right hidden sm:block">
                    <div className="label-caps !text-[10px] !text-slate-500 font-black">
                      {p.goals}<small className="ml-0.5 opacity-50 font-medium">G</small> 
                      <span className="mx-1 opacity-20">/</span>
                      {p.assists}<small className="ml-0.5 opacity-50 font-medium">A</small>
                    </div>
                  </div>
                  <div 
                    className="font-hl font-black text-lg min-w-[44px] text-center px-1 py-1 rounded-lg border shadow-sm transition-transform group-hover:scale-105"
                    style={{ 
                      backgroundColor: rc.bg, 
                      color: rc.text,
                      borderColor: 'rgba(0,0,0,0.03)'
                    }}
                  >
                    {p.rating.toFixed(1)}
                  </div>
                </div>
              </Link>
            )
          })}
        </div>
      )}
    </div>
  )
}
