'use client'
import { useState, useEffect } from 'react'
import { useTranslations } from 'next-intl'
import type { League } from '@/app/api/leagues/route'
import TeamBadge from '@/components/ui/TeamBadge'

interface StandingRow {
  rank:          number
  team_id:       number
  team_name:     string
  team_logo:     string | null
  played:        number
  win:           number
  draw:          number
  lose:          number
  goals_for:     number
  goals_against: number
  points:        number
  form:          string
  description:   string | null
}

interface StandingsData {
  season:    number
  league_id: number
  rows:      StandingRow[]
}

const FORM_COLOR: Record<string, string> = {
  W: 'var(--color-primary)', 
  D: 'var(--color-primary-dim)', 
  L: 'var(--color-slate-500)',
}

function formLetter(c: string) {
  if (c === 'W') return 'V'
  if (c === 'L') return 'D'
  return c
}

interface Props {
  defaultLeagueId?: number
  className?: string
}

export default function LeagueTable({ defaultLeagueId = 39, className = '' }: Props) {
  const tc = useTranslations('Common')

  const [leagues,   setLeagues]   = useState<League[]>([])
  const [leagueId,  setLeagueId]  = useState(defaultLeagueId)
  const [data,      setData]      = useState<StandingsData | null>(null)
  const [loading,   setLoading]   = useState(true)

  // Load all active leagues from API
  useEffect(() => {
    fetch('/api/leagues')
      .then(r => r.ok ? r.json() : [])
      .then((data: League[]) => {
        const active = data.filter(l => l.active)
        setLeagues(active)
        // If defaultLeagueId not in active list, pick first
        if (active.length > 0 && !active.find(l => l.id === defaultLeagueId)) {
          setLeagueId(active[0].id)
        }
      })
      .catch(() => {})
  }, [defaultLeagueId])

  useEffect(() => {
    setLoading(true)
    fetch(`/api/standings?league_id=${leagueId}`)
      .then(r => r.json())
      .then(setData)
      .catch(() => {})
      .finally(() => setLoading(false))
  }, [leagueId])

  const rows = data?.rows ?? []

  return (
    <div className={`glass-card !bg-white rounded-2xl overflow-hidden border border-gray-100 shadow-sm ${className}`}>
      {/* Header */}
      <div className="px-4 py-3 md:px-5 md:py-4 border-b border-gray-50 flex items-center justify-between gap-2">
        <span className="text-[10px] md:text-xs font-bold uppercase tracking-wider text-dark truncate">{tc('labels.standings')}</span>

        {/* Pill select */}
        <div className="relative inline-flex items-center shrink-0 max-w-[140px]">
          <select
            value={leagueId}
            onChange={e => setLeagueId(Number(e.target.value))}
            className="appearance-none bg-gray-50 border border-gray-100 rounded-full pl-3 pr-8 py-1.5 text-[10px] md:text-xs font-bold text-primary cursor-pointer outline-none w-full truncate"
          >
            {leagues.map(l => (
              <option key={l.id} value={l.id}>{l.name}</option>
            ))}
          </select>
          <svg className="absolute right-2.5 pointer-events-none" width="10" height="10" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" color="#60a5fa">
            <path d="m6 9 6 6 6-6"/>
          </svg>
        </div>
      </div>

      {/* Table */}
      {loading ? (
        <div className="p-6 flex justify-center">
          <span className="text-xs text-gray-400 animate-pulse">{tc('labels.loading')}</span>
        </div>
      ) : (
        <div className="overflow-x-auto">
          <table className="w-full border-collapse">
            <thead>
              <tr className="bg-gray-50/50">
                <th className="py-2.5 px-3 text-[9px] font-bold text-slate-500 uppercase tracking-wider text-center w-6">#</th>
                <th className="py-2.5 px-3 text-[9px] font-bold text-slate-500 uppercase tracking-wider text-left">
                  {tc('labels.team')}
                </th>
                <th className="py-2.5 px-3 text-[9px] font-bold text-slate-500 uppercase tracking-wider text-center">{tc('stats.header.played')}</th>
                <th className="py-2.5 px-3 text-[9px] font-bold text-slate-500 uppercase tracking-wider text-center">{tc('stats.header.won')}</th>
                <th className="py-2.5 px-3 text-[9px] font-bold text-slate-500 uppercase tracking-wider text-center">{tc('stats.header.drawn')}</th>
                <th className="py-2.5 px-3 text-[9px] font-bold text-slate-500 uppercase tracking-wider text-center">{tc('stats.header.lost')}</th>
                <th className="py-2.5 px-3 text-[9px] font-bold text-slate-500 uppercase tracking-wider text-center">Pts</th>
                <th className="py-2.5 px-3 text-[9px] font-bold text-slate-500 uppercase tracking-wider text-center hidden sm:table-cell">
                  {tc('stats.form')}
                </th>
              </tr>
            </thead>
            <tbody>
              {rows.map((row) => (
                <tr key={row.team_id} className="border-b border-gray-50 last:border-0 hover:bg-gray-50 transition-colors group">
                  <td className="py-1.5 px-3 text-center">
                    <span className="text-xs font-bold text-slate-500">
                      {row.rank}
                    </span>
                  </td>
                  <td className="py-1.5 px-3">
                    <div className="flex items-center gap-3">
                      <div className="p-1 bg-white rounded-lg shadow-sm border border-gray-50 group-hover:scale-110 transition-transform">
                        <TeamBadge teamId={row.team_id} teamName={row.team_name} size={16} />
                      </div>
                      <span className="text-sm font-bold text-slate-700 truncate max-w-[120px]">{row.team_name}</span>
                    </div>
                  </td>
                  <td className="py-1.5 px-3 text-center text-[11px] font-semibold text-gray-500">{row.played}</td>
                  <td className="py-1.5 px-3 text-center text-[11px] font-semibold text-gray-500">{row.win}</td>
                  <td className="py-1.5 px-3 text-center text-[11px] font-semibold text-gray-500">{row.draw}</td>
                  <td className="py-1.5 px-3 text-center text-[11px] font-semibold text-gray-500">{row.lose}</td>
                  <td className="py-1.5 px-3 text-center">
                    <span className="font-hl font-bold text-sm text-slate-900">{row.points}</span>
                  </td>
                  <td className="py-2.5 px-3 hidden sm:table-cell">
                    <div className="flex gap-1 justify-center">
                      {row.form.slice(-5).split('').map((c, i) => (
                        <span
                          key={i}
                          className="w-3.5 h-3.5 rounded-full flex items-center justify-center text-[7px] font-black text-white"
                          style={{ backgroundColor: FORM_COLOR[c] ?? '#d1d5db' }}
                        >
                          {formLetter(c)}
                        </span>
                      ))}
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}

      {/* Footer */}
      {data && (
        <div className="px-5 py-2.5 border-t border-gray-50 flex justify-between items-center bg-gray-50/20">
          <span className="text-[9px] font-bold text-slate-500 uppercase tracking-tight">
            {tc('labels.season')} {data.season}/{data.season + 1}
          </span>
          <div className="flex items-center gap-3">
            <span className="flex items-center gap-1.5">
              <span className="w-1.5 h-1.5 rounded-full bg-primary" />
              <span className="text-[8px] font-bold text-slate-600 uppercase">UCL</span>
            </span>
            <span className="flex items-center gap-1.5">
              <span className="w-1.5 h-1.5 rounded-full bg-amber-500" />
              <span className="text-[8px] font-bold text-slate-600 uppercase">UEL</span>
            </span>
          </div>
        </div>
      )}
    </div>
  )
}
