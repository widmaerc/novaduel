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
  W: '#22c55e', D: '#f59e0b', L: '#ef4444',
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
    <div className={`glass-card p-0 overflow-hidden ${className}`}>
      {/* Header */}
      <div className="px-5 py-4 border-b border-slate-100 flex items-center justify-between gap-2 bg-slate-50/50">
        <h2 className="label-caps tracking-wider text-slate-500 truncate">{tc('labels.standings')}</h2>

        {/* Pill select */}
        <div className="relative inline-flex items-center shrink-0 max-w-[160px]">
          <select
            value={leagueId}
            onChange={e => setLeagueId(Number(e.target.value))}
            className="appearance-none bg-white border border-slate-200 rounded-full pl-3 pr-8 py-1.5 text-[11px] font-bold text-primary cursor-pointer outline-none w-full truncate shadow-sm transition-all focus:border-primary/50"
          >
            {leagues.map(l => (
              <option key={l.id} value={l.id}>{l.name}</option>
            ))}
          </select>
          <svg className="absolute right-3 pointer-events-none" width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3" color="#3b82f6">
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
              <tr className="bg-slate-50/30">
                <th className="py-3 px-3 label-caps !text-[9px] !text-slate-400 text-center w-6">#</th>
                <th className="py-3 px-3 label-caps !text-[9px] !text-slate-400 text-left">
                  {tc('labels.team')}
                </th>
                <th className="py-3 px-3 label-caps !text-[9px] !text-slate-400 text-center">{tc('stats.header.played')}</th>
                <th className="py-3 px-3 label-caps !text-[9px] !text-slate-400 text-center">{tc('stats.header.won')}</th>
                <th className="py-3 px-3 label-caps !text-[9px] !text-slate-400 text-center">{tc('stats.header.drawn')}</th>
                <th className="py-3 px-3 label-caps !text-[9px] !text-slate-400 text-center">{tc('stats.header.lost')}</th>
                <th className="py-3 px-3 label-caps !text-[9px] !text-slate-400 text-center">Pts</th>
                <th className="py-3 px-3 label-caps !text-[9px] !text-slate-400 text-center hidden sm:table-cell">
                  {tc('stats.form')}
                </th>
              </tr>
            </thead>
            <tbody>
              {rows.map((row) => (
                <tr key={row.team_id} className="border-b border-slate-50 last:border-0 hover:bg-slate-50 transition-colors">
                  <td className="py-3 px-3 text-center">
                    <span className={`text-xs font-black ${row.rank <= 4 ? 'text-primary' : row.rank <= 6 ? 'text-amber-600' : 'text-slate-400'}`}>
                      {row.rank}
                    </span>
                  </td>
                  <td className="py-3 px-3">
                    <div className="flex items-center gap-2">
                      <TeamBadge teamId={row.team_id} teamName={row.team_name} size={18} />
                      <span className="text-xs font-bold text-slate-800 truncate max-w-[100px]">{row.team_name}</span>
                    </div>
                  </td>
                  <td className="py-3 px-3 text-center text-[11px] font-medium text-slate-500">{row.played}</td>
                  <td className="py-3 px-3 text-center text-[11px] font-medium text-slate-500">{row.win}</td>
                  <td className="py-3 px-3 text-center text-[11px] font-medium text-slate-500">{row.draw}</td>
                  <td className="py-3 px-3 text-center text-[11px] font-medium text-slate-500">{row.lose}</td>
                  <td className="py-3 px-3 text-center">
                    <span className="font-hl font-black text-sm text-slate-900">{row.points}</span>
                  </td>
                  <td className="py-3 px-3 hidden sm:table-cell">
                    <div className="flex gap-1 justify-center">
                      {row.form.slice(-5).split('').map((c, i) => (
                        <span
                          key={i}
                          className="w-4 h-4 rounded-full flex items-center justify-center text-[7px] font-black text-white"
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
        <div className="px-5 py-3 border-t border-slate-100 flex justify-between items-center bg-slate-50/30">
          <span className="label-caps !text-[9px] !text-slate-400">
            {tc('labels.season')} {data.season}/{data.season + 1}
          </span>
          <div className="flex items-center gap-3">
            <span className="flex items-center gap-1.5">
              <span className="w-1.5 h-1.5 rounded-full bg-primary" />
              <span className="label-caps !text-[8px] !text-slate-400">UCL</span>
            </span>
            <span className="flex items-center gap-1.5">
              <span className="w-1.5 h-1.5 rounded-full bg-amber-500" />
              <span className="label-caps !text-[8px] !text-slate-400">UEL</span>
            </span>
          </div>
        </div>
      )}
    </div>
  )
}
