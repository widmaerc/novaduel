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
  W: '#22c55e', // Green
  D: '#94a3b8', // Gray (slate-400)
  L: '#ef4444', // Red
}

function formLetter(c: string, tc: any) {
  if (c === 'W') return tc('stats.header.won')
  if (c === 'L') return tc('stats.header.lost')
  if (c === 'D') return tc('stats.header.drawn')
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
      <div className="px-4 py-3 md:px-5 md:py-3.5 border-b border-gray-50 flex items-center justify-between gap-2 bg-slate-50/30">
        <span className="label-caps !text-slate-900 !text-[10px] font-black font-hl tracking-[0.15em]">{tc('labels.standings')}</span>

        {/* Pill select - Minimalist */}
        <div className="relative inline-flex items-center shrink-0 max-w-[150px]">
          <select
            value={leagueId}
            onChange={e => setLeagueId(Number(e.target.value))}
            className="appearance-none bg-white border border-slate-200 hover:border-primary/50 transition-colors rounded-lg pl-3 pr-8 py-1.5 text-[10px] font-bold text-slate-700 cursor-pointer outline-none w-full shadow-sm"
          >
            {leagues.map(l => (
              <option key={l.id} value={l.id}>{l.name}</option>
            ))}
          </select>
          <svg className="absolute right-2.5 pointer-events-none text-slate-400" width="10" height="10" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3">
            <path d="m6 9 6 6 6-6"/>
          </svg>
        </div>
      </div>

      {/* Table */}
      {loading ? (
        <div className="p-10 flex flex-col items-center justify-center gap-3">
          <div className="w-6 h-6 border-2 border-primary/20 border-t-primary rounded-full animate-spin" />
          <span className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">{tc('labels.loading')}</span>
        </div>
      ) : (
        <div className="overflow-x-auto">
          <table className="w-full border-collapse">
            <thead>
              <tr className="bg-slate-50/50 border-b border-gray-50">
                <th className="py-2 px-3 text-[9px] font-black text-slate-500 uppercase tracking-widest text-center w-8">#</th>
                <th className="py-2 px-3 text-[9px] font-black text-slate-500 uppercase tracking-widest text-left">
                  {tc('labels.team')}
                </th>
                <th className="py-2 px-3 text-[9px] font-black font-hl text-slate-500 uppercase tracking-widest text-center w-8">{tc('stats.header.played')}</th>
                <th className="py-2 px-3 text-[9px] font-black font-hl text-slate-500 uppercase tracking-widest text-center w-8">{tc('stats.header.won')}</th>
                <th className="py-2 px-3 text-[9px] font-black font-hl text-slate-500 uppercase tracking-widest text-center w-8">{tc('stats.header.drawn')}</th>
                <th className="py-2 px-3 text-[9px] font-black font-hl text-slate-500 uppercase tracking-widest text-center w-8">{tc('stats.header.lost')}</th>
                <th className="py-2 px-3 text-[9px] font-black font-hl text-slate-900 uppercase tracking-widest text-center w-10">Pts</th>
                <th className="py-2 px-3 text-[9px] font-black text-slate-500 uppercase tracking-widest text-center hidden sm:table-cell">
                  {tc('stats.form')}
                </th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-50">
              {rows.map((row) => (
                <tr key={row.team_id} className="hover:bg-slate-50/50 transition-all group">
                  <td className="py-2 px-3 text-center">
                    <span className="font-hl font-black text-xs text-slate-400 group-hover:text-primary transition-colors">
                      {row.rank}
                    </span>
                  </td>
                  <td className="py-2 px-3">
                    <div className="flex items-center gap-2.5">
                      <div className="p-1 px-1.5 bg-white rounded-md shadow-[0_1px_3px_rgba(0,0,0,0.05)] border border-slate-100 group-hover:scale-110 transition-transform">
                        <TeamBadge teamId={row.team_id} teamName={row.team_name} size={14} />
                      </div>
                      <span className="text-[14px] font-extrabold font-hl text-slate-800 truncate max-w-[110px] md:max-w-[140px] tracking-tight">{row.team_name}</span>
                    </div>
                  </td>
                  <td className="py-2 px-3 text-center text-[10px] font-bold font-hl text-slate-500">{row.played}</td>
                  <td className="py-2 px-3 text-center text-[10px] font-bold font-hl text-slate-500">{row.win}</td>
                  <td className="py-2 px-3 text-center text-[10px] font-bold font-hl text-slate-500">{row.draw}</td>
                  <td className="py-2 px-3 text-center text-[10px] font-bold font-hl text-slate-500">{row.lose}</td>
                  <td className="py-2 px-3 text-center">
                    <span className="font-hl font-black text-sm text-slate-900">{row.points}</span>
                  </td>
                  <td className="py-2 px-3 hidden sm:table-cell">
                    <div className="flex gap-1 justify-center">
                      {row.form.slice(-5).split('').map((c, i) => (
                        <span
                          key={i}
                          className="w-3.5 h-3.5 rounded-md flex items-center justify-center text-[7px] font-black text-white shadow-sm"
                          style={{ backgroundColor: FORM_COLOR[c] ?? '#cbd5e1' }}
                        >
                          {formLetter(c, tc)}
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
        <div className="px-5 py-2.5 border-t border-slate-50 flex justify-between items-center bg-slate-50/30">
          <span className="text-[8px] font-black text-slate-400 uppercase tracking-[0.2em]">
            {tc('labels.season')} {data.season}/{data.season + 1}
          </span>
          <div className="flex items-center gap-4">
            <span className="flex items-center gap-1.5 opacity-80 hover:opacity-100 transition-opacity">
              <span className="w-1.5 h-1.5 rounded-full bg-primary ring-2 ring-primary/20" />
              <span className="text-[8px] font-black text-slate-600 uppercase tracking-widest">UCL</span>
            </span>
            <span className="flex items-center gap-1.5 opacity-80 hover:opacity-100 transition-opacity">
              <span className="w-1.5 h-1.5 rounded-full bg-amber-500 ring-2 ring-amber-500/20" />
              <span className="text-[8px] font-black text-slate-600 uppercase tracking-widest">UEL</span>
            </span>
          </div>
        </div>
      )}
    </div>
  )
}
