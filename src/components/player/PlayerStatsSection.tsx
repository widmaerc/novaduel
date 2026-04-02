'use client'
import { useState, useEffect, useCallback } from 'react'
import { useTranslations } from 'next-intl'

// ── Types ─────────────────────────────────────────────────────────────────────

interface FilterOption { id: number | null; key: string; name: string; logo: string | null }
interface SeasonOption  { year: number; label: string; isStored: boolean }

interface FiltersData {
  leagues:     FilterOption[]
  teams:       FilterOption[]
  leagueTeams: Record<string, FilterOption[]>  // clés string après JSON.parse
  seasons:     SeasonOption[]
  unavailable?: boolean  // true si l'API ne couvre pas cette saison
}

interface StatsData {
  goals: number; assists: number; matches: number; minutes: number
  rating: number; pass_accuracy: number; dribbles: number
  duels_won: number; shots_on_target: number; yellow_cards: number; red_cards: number
  team_name: string | null; league_name: string | null; season: number
}

interface InitialStats {
  goals: number; assists: number; matches: number; minutes: number
  rating: number; pass_accuracy: number; dribbles: number
  duels_won: number; shots_on_target: number; yellow_cards: number; red_cards: number
}

interface Props {
  slug:           string
  initialStats:   InitialStats
  currentSeason:  number
  isMissingData?: boolean
}

// ── Shared pill select wrapper ────────────────────────────────────────────────

function PillSelect({ value, onChange, disabled, children }: {
  value: string | number
  onChange: (v: string) => void
  disabled?: boolean
  children: React.ReactNode
}) {
  return (
    <div className="relative">
      <select
        value={value}
        onChange={e => onChange(e.target.value)}
        disabled={disabled}
        className="appearance-none bg-white/40 border border-white/60 rounded-xl pl-3 pr-8 py-2.5 text-[11px] font-bold text-slate-900 cursor-pointer outline-none w-full truncate backdrop-blur-md transition-all focus:border-primary/30 focus:ring-4 focus:ring-primary/5 disabled:opacity-40 disabled:cursor-not-allowed shadow-sm"
      >
        {children}
      </select>
      <svg className="absolute right-3 top-1/2 -translate-y-1/2 pointer-events-none opacity-60" width="10" height="10" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3" color="#1e40af">
        <path d="m6 9 6 6 6-6"/>
      </svg>
    </div>
  )
}

// ── Component ─────────────────────────────────────────────────────────────────

export default function PlayerStatsSection({ slug, initialStats, currentSeason, isMissingData = false }: Props) {
  const tc = useTranslations('Common')
  const tp = useTranslations('PlayerPage')

  const [filters,        setFilters]        = useState<FiltersData | null>(null)
  const [filtersLoading, setFiltersLoading] = useState(false)
  const [selectedSeason, setSelectedSeason] = useState<number>(currentSeason)
  const [selectedLeague, setSelectedLeague] = useState<string | null>(null)
  const [selectedTeam,   setSelectedTeam]   = useState<string | null>(null)
  const [stats,          setStats]          = useState<StatsData | null>(null)
  const [statsLoading,   setStatsLoading]   = useState(false)

  const s: InitialStats & Partial<StatsData> = stats ?? initialStats
  const goalsPerMatch   = s.matches > 0 ? (s.goals   / s.matches).toFixed(2) : '0.00'
  const assistsPerMatch = s.matches > 0 ? (s.assists / s.matches).toFixed(2) : '0.00'
  const seasonDisplay   = `${selectedSeason}/${selectedSeason + 1}`

  // Teams available given the selected league
  const availableTeams: FilterOption[] = selectedLeague && filters?.leagueTeams[String(selectedLeague)]
    ? filters.leagueTeams[String(selectedLeague)]
    : (filters?.teams ?? [])

  // Fetch filters for a given season
  const fetchFilters = useCallback((season: number, autoSelect = false) => {
    setFiltersLoading(true)
    fetch(`/api/players/${slug}/filters?season=${season}`)
      .then(r => r.json())
      .then((data: FiltersData) => {
        setFilters(data)
        if (autoSelect && !data.unavailable) {
          const firstLeague = data.leagues[0] ?? null
          const firstTeam   = firstLeague ? (data.leagueTeams[firstLeague.key]?.[0] ?? null) : null
          setSelectedLeague(firstLeague?.key ?? null)
          setSelectedTeam(firstTeam?.key ?? null)
        }
      })
      .catch(() => {})
      .finally(() => setFiltersLoading(false))
  }, [slug])

  // Load on mount + auto-select default league/team
  useEffect(() => { fetchFilters(currentSeason, true) }, [fetchFilters, currentSeason])

  // Fetch stats whenever selection changes
  useEffect(() => {
    const isDefault = selectedSeason === currentSeason && !selectedLeague && !selectedTeam
    if (isDefault) { setStats(null); return }

    setStatsLoading(true)
    const p = new URLSearchParams({ season: String(selectedSeason) })
    if (selectedLeague) p.set('league_key', selectedLeague)
    if (selectedTeam)   p.set('team_key',   selectedTeam)

    fetch(`/api/players/${slug}/stats?${p}`)
      .then(r => r.ok ? r.json() : null)
      .then(d => setStats(d ?? null))
      .catch(() => setStats(null))
      .finally(() => setStatsLoading(false))
  }, [slug, selectedSeason, selectedLeague, selectedTeam, currentSeason])

  // ── Handlers ────────────────────────────────────────────────────────────────

  function handleSeasonChange(year: number) {
    setSelectedSeason(year)
    setSelectedLeague(null)
    setSelectedTeam(null)
    setStats(null)
    fetchFilters(year, true)
  }

  function handleLeagueChange(key: string | null) {
    setSelectedLeague(key)
    setSelectedTeam(null)
  }

  function resetFilters() {
    setSelectedSeason(currentSeason)
    setSelectedLeague(null)
    setSelectedTeam(null)
    setStats(null)
    fetchFilters(currentSeason, true)
  }

  const hasFilter = selectedSeason !== currentSeason || !!selectedLeague || !!selectedTeam
  const loading   = statsLoading

  // ── Stats bars ──────────────────────────────────────────────────────────────

  const statsBars = [
    { 
      label: tc('stats.goals_match'),     
      value: isMissingData ? 'N/D' : goalsPerMatch,            
      pct: Math.min(100, (s.goals / Math.max(s.matches, 1)) * 100),
      color: 'bg-emerald-500 shadow-[0_0_12px_rgba(16,185,129,0.3)]' 
    },
    { 
      label: tc('stats.assists'),         
      value: isMissingData ? 'N/D' : assistsPerMatch,           
      pct: Math.min(100, (s.assists / Math.max(s.matches, 1)) * 100),
      color: 'bg-blue-500 shadow-[0_0_12px_rgba(59,130,246,0.3)]'
    },
    { 
      label: tc('stats.pass_acc'),        
      value: isMissingData ? 'N/D' : `${s.pass_accuracy}%`,     
      pct: s.pass_accuracy,
      color: 'bg-blue-400 shadow-[0_0_12px_rgba(96,165,250,0.2)]'
    },
    { 
      label: tc('stats.dribbles_match'),  
      value: isMissingData ? 'N/D' : String(s.dribbles),        
      pct: Math.min(100, s.dribbles * 20),
      color: 'bg-orange-400 shadow-[0_0_12px_rgba(251,146,60,0.3)]'
    },
    { 
      label: tc('stats.duels_won'),       
      value: isMissingData ? 'N/D' : `${s.duels_won}%`,         
      pct: s.duels_won,
      color: 'bg-orange-500 shadow-[0_0_12px_rgba(249,115,22,0.3)]'
    },
    { 
      label: tc('stats.shots_on_target'), value: isMissingData ? 'N/D' : String(s.shots_on_target), 
      pct: Math.min(100, s.shots_on_target * 25),
      color: 'bg-emerald-400 shadow-[0_0_12px_rgba(52,211,153,0.3)]'
    },
    { 
      label: tc('stats.minutes'),         
      value: isMissingData ? 'N/D' : String(s.minutes),         
      pct: Math.min(100, (s.minutes / 3420) * 100),
      color: 'bg-slate-400 shadow-[0_0_12px_rgba(148,163,184,0.2)]'
    },
  ]

  // ── Render ───────────────────────────────────────────────────────────────────

  return (
    <>
      {/* ── Filter bar ──────────────────────────────────────────────── */}
      <div className="glass-card bg-white/20 p-5 mb-0 overflow-hidden border-white/40">
        <div className="-mx-5 -mt-5 px-5 py-3 mb-5 bg-slate-50/40 border-b border-slate-100/50 flex items-center gap-2">
          <span className="material-symbols-outlined text-[18px] text-primary">filter_list</span>
          <span className="label-caps !text-slate-900 font-bold">
            {tp('filters.title')}
          </span>
          {hasFilter && (
            <button
              onClick={resetFilters}
              className="ml-auto text-[10px] font-black text-slate-400 hover:text-primary transition-colors flex items-center gap-1 uppercase tracking-widest"
            >
              <span className="material-symbols-outlined text-[14px]">refresh</span>
              {tp('filters.reset')}
            </button>
          )}
        </div>

        <div className="grid grid-cols-3 gap-3">

          {/* ── Saison ── */}
          <div>
            <label className="label-caps block mb-1.5">
              {tp('filters.season')}
            </label>
            <PillSelect
              value={selectedSeason}
              onChange={v => handleSeasonChange(Number(v))}
              disabled={filtersLoading}
            >
              {filters?.seasons.map(s => (
                <option key={s.year} value={s.year}>{s.label}</option>
              )) ?? (
                <option value={currentSeason}>{currentSeason}/{currentSeason + 1}</option>
              )}
            </PillSelect>
          </div>

          {/* ── Ligue — dépend de la saison ── */}
          <div>
            <label className="label-caps block mb-1.5">
              {tp('filters.league')}
              {filtersLoading && <span className="ml-1 text-slate-400 normal-case font-normal">…</span>}
              {!filtersLoading && filters?.unavailable && (
                <span className="ml-1 text-red-500 normal-case font-normal">{tp('filters.unavailable')}</span>
              )}
            </label>
            <PillSelect
              value={selectedLeague ?? ''}
              onChange={v => handleLeagueChange(v || null)}
              disabled={filtersLoading || !filters?.leagues.length}
            >
              <option value="">{tp('filters.all_leagues')}</option>
              {filters?.leagues.map(l => (
                <option key={l.key} value={l.key}>{l.name}</option>
              ))}
            </PillSelect>
          </div>

          {/* ── Équipe — dépend de la ligue sélectionnée ── */}
          <div>
            <label className="label-caps block mb-1.5">
              {tp('filters.team')}
            </label>
            <PillSelect
              value={selectedTeam ?? ''}
              onChange={v => setSelectedTeam(v || null)}
              disabled={filtersLoading || !availableTeams.length}
            >
              <option value="">{tp('filters.all_teams')}</option>
              {availableTeams.map(t => (
                <option key={t.key} value={t.key}>{t.name}</option>
              ))}
            </PillSelect>
          </div>

        </div>

        {/* Context badge */}
        {(stats || loading) && (
          <div className="mt-5 flex items-center gap-2">
            {loading ? (
              <span className="text-[10px] font-bold text-slate-400 animate-pulse uppercase tracking-wider">{tp('filters.loading')}...</span>
            ) : stats ? (
              <>
                <span className="text-[10px] font-black text-primary bg-primary/10 rounded-full px-3 py-1 uppercase tracking-wider border border-primary/10">
                  {stats.league_name ?? tp('filters.all_leagues_context')}
                </span>
                {stats.team_name && (
                  <span className="text-[10px] font-black text-slate-600 bg-slate-100 rounded-full px-3 py-1 uppercase tracking-wider border border-slate-200/50">
                    {stats.team_name}
                  </span>
                )}
                <span className="label-caps text-slate-400 ml-1">· {seasonDisplay}</span>
              </>
            ) : null}
          </div>
        )}
      </div>

      {/* ── KPI Cards ───────────────────────────────────────────────── */}
      <div className="grid grid-cols-4 gap-4">
        {[
          { label: tp('stats.kpi_goals'),   value: isMissingData ? 'N/D' : s.goals,   sub: `${goalsPerMatch} / ${tc('labels.match')}`, color: 'group-hover:text-emerald-500', bar: 'bg-emerald-500/30' },
          { label: tp('stats.kpi_assists'),  value: isMissingData ? 'N/D' : s.assists, sub: `${assistsPerMatch} / ${tc('labels.match')}`, color: 'group-hover:text-blue-500', bar: 'bg-blue-500/30' },
          { label: tp('stats.kpi_matches'),  value: isMissingData ? 'N/D' : s.matches, sub: seasonDisplay, color: 'group-hover:text-slate-900', bar: 'bg-slate-400/30' },
          { label: tc('stats.rating'),       value: isMissingData ? 'N/D' : (s.rating ? Number(s.rating).toFixed(1) : '—'), sub: '/ 10', color: 'group-hover:text-primary', bar: 'bg-primary/30' },
        ].map((kpi) => (
          <div key={kpi.label} className="glass-card p-6 text-center relative overflow-hidden group hover:scale-[1.02] transition-all border-white/60 bg-white/40 backdrop-blur-sm">
            {loading && <div className="absolute inset-0 bg-white/40 backdrop-blur-sm z-10 flex items-center justify-center" />}
            <div className="label-caps mb-3 opacity-60 text-[9px] tracking-[0.15em]">{kpi.label}</div>
            <div className={`count font-hl font-black text-[38px] leading-none text-slate-900 transition-all ${kpi.color} drop-shadow-sm ${loading ? 'opacity-10' : ''}`}>{kpi.value}</div>
            <div className="label-caps text-[10px] mt-3 opacity-40 lowercase font-medium">{kpi.sub}</div>
            <div className={`absolute bottom-0 left-0 h-1 ${kpi.bar} w-0 group-hover:w-full transition-all duration-500`} />
          </div>
        ))}
      </div>

      {/* ── Stats bars ──────────────────────────────────────────────── */}
      <div className="glass-card p-8 overflow-hidden border-white/60 bg-white/30 backdrop-blur-md">
        <div className="-mx-8 -mt-8 px-8 py-4 mb-8 bg-slate-50/50 border-b border-slate-100/50 flex items-center justify-between">
          <h3 className="label-caps !text-slate-900 !text-[12px] !font-black tracking-tight">{tp('stats.section_title')}</h3>
          <span className="label-caps !text-primary !text-[10px] opacity-60 font-bold">{tc('labels.performance_index')}</span>
        </div>
        <div className="flex flex-col gap-6 relative">
          {loading && <div className="absolute inset-0 bg-white/40 backdrop-blur-sm rounded-xl z-10" />}
          {statsBars.map((bar) => (
            <div key={bar.label} className="flex items-center gap-6 group/bar">
              <span className="label-caps !text-slate-500 w-[160px] shrink-0 !text-[10px] group-hover/bar:!text-slate-900 transition-colors tracking-widest">{bar.label}</span>
              <div className="flex-1 h-3 bg-slate-100/50 rounded-full overflow-hidden shadow-inner p-[2px] border border-slate-200/20">
                <div className={`bar-grow h-full ${bar.color} rounded-full transition-all duration-1000 ease-out`} style={{ width: `${bar.pct}%` }} />
              </div>
              <span className="font-hl font-black text-[15px] text-slate-900 w-12 text-right group-hover/bar:text-primary transition-colors tracking-tight">{bar.value}</span>
            </div>
          ))}
        </div>
      </div>
    </>
  )
}
