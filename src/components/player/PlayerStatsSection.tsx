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
        className="appearance-none bg-gray-50 border border-gray-100 rounded-full pl-3 pr-7 py-1.5 text-[11px] font-bold text-primary cursor-pointer outline-none w-full truncate disabled:opacity-40 disabled:cursor-not-allowed"
      >
        {children}
      </select>
      <svg className="absolute right-2.5 top-1/2 -translate-y-1/2 pointer-events-none" width="10" height="10" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" color="#60a5fa">
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
    { label: tc('stats.goals_match'),     value: isMissingData ? 'N/D' : goalsPerMatch,            pct: Math.min(100, (s.goals   / Math.max(s.matches, 1)) * 100) },
    { label: tc('stats.assists'),         value: isMissingData ? 'N/D' : assistsPerMatch,           pct: Math.min(100, (s.assists / Math.max(s.matches, 1)) * 100) },
    { label: tc('stats.pass_acc'),        value: isMissingData ? 'N/D' : `${s.pass_accuracy}%`,     pct: s.pass_accuracy },
    { label: tc('stats.dribbles_match'),  value: isMissingData ? 'N/D' : String(s.dribbles),        pct: Math.min(100, s.dribbles * 20) },
    { label: tc('stats.duels_won'),       value: isMissingData ? 'N/D' : `${s.duels_won}%`,         pct: s.duels_won },
    { label: tc('stats.shots_on_target'), value: isMissingData ? 'N/D' : String(s.shots_on_target), pct: Math.min(100, s.shots_on_target * 25) },
    { label: tc('stats.minutes'),         value: isMissingData ? 'N/D' : String(s.minutes),         pct: Math.min(100, (s.minutes / 3420) * 100) },
  ]

  // ── Render ───────────────────────────────────────────────────────────────────

  return (
    <>
      {/* ── Filter bar ──────────────────────────────────────────────── */}
      <div className="bg-white rounded-2xl border border-[#c2c6d2]/20 p-4 overflow-hidden shadow-sm mb-0">
        <div className="-mx-4 -mt-4 px-4 py-2.5 mb-3 bg-[#f8f9fa] border-b border-[#eef0f2] flex items-center gap-2">
          <span className="material-symbols-outlined text-[16px] text-primary">tune</span>
          <span className="font-hl font-extrabold text-[12px] text-primary uppercase tracking-[0.08em]">
            {tp('filters.title')}
          </span>
          {hasFilter && (
            <button
              onClick={resetFilters}
              className="ml-auto text-[10px] font-bold text-[#727782] hover:text-primary transition-colors flex items-center gap-1"
            >
              <span className="material-symbols-outlined text-[13px]">close</span>
              {tp('filters.reset')}
            </button>
          )}
        </div>

        <div className="grid grid-cols-3 gap-3">

          {/* ── Saison ── */}
          <div>
            <label className="text-[9px] font-extrabold uppercase tracking-[0.1em] text-[#727782] block mb-1.5">
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
            <label className="text-[9px] font-extrabold uppercase tracking-[0.1em] text-[#727782] block mb-1.5">
              {tp('filters.league')}
              {filtersLoading && <span className="ml-1 text-[#727782] normal-case font-normal">…</span>}
              {!filtersLoading && filters?.unavailable && (
                <span className="ml-1 text-[#ef4444] normal-case font-normal">{tp('filters.unavailable')}</span>
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
            <label className="text-[9px] font-extrabold uppercase tracking-[0.1em] text-[#727782] block mb-1.5">
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
          <div className="mt-3 flex items-center gap-1.5">
            {loading ? (
              <span className="text-[10px] text-[#727782] animate-pulse">{tp('filters.loading')}</span>
            ) : stats ? (
              <>
                <span className="text-[10px] font-bold text-primary bg-primary/8 rounded-full px-2 py-0.5">
                  {stats.league_name ?? tp('filters.all_leagues_context')}
                </span>
                {stats.team_name && (
                  <span className="text-[10px] font-bold text-[#424751] bg-[#f3f4f5] rounded-full px-2 py-0.5">
                    {stats.team_name}
                  </span>
                )}
                <span className="text-[10px] text-[#727782]">· {seasonDisplay}</span>
              </>
            ) : null}
          </div>
        )}
      </div>

      {/* ── KPI Cards ───────────────────────────────────────────────── */}
      <div className="a2 grid grid-cols-4 gap-3">
        {[
          { label: tp('stats.kpi_goals'),   value: isMissingData ? 'N/D' : s.goals,   sub: `${goalsPerMatch} / match` },
          { label: tp('stats.kpi_assists'),  value: isMissingData ? 'N/D' : s.assists, sub: `${assistsPerMatch} / match` },
          { label: tp('stats.kpi_matches'),  value: isMissingData ? 'N/D' : s.matches, sub: seasonDisplay },
          { label: tc('stats.rating'),       value: isMissingData ? 'N/D' : (s.rating ? Number(s.rating).toFixed(1) : '—'), sub: '/ 10' },
        ].map((kpi) => (
          <div key={kpi.label} className="bg-white rounded-xl p-4 text-center border border-[#c2c6d2]/20 shadow-sm relative overflow-hidden">
            {loading && <div className="absolute inset-0 bg-white/60" />}
            <div className="text-[9px] font-black uppercase tracking-[0.1em] text-[#727782] mb-1.5">{kpi.label}</div>
            <div className={`count font-hl font-black text-[28px] leading-none text-primary transition-opacity ${loading ? 'opacity-30' : ''}`}>{kpi.value}</div>
            <div className="text-[9px] font-bold mt-1 text-[#727782]">{kpi.sub}</div>
          </div>
        ))}
      </div>

      {/* ── Stats bars ──────────────────────────────────────────────── */}
      <div className="a3 bg-white rounded-2xl border border-[#c2c6d2]/20 p-5 overflow-hidden shadow-sm">
        <div className="-mx-5 -mt-5 px-5 py-2.5 mb-5 bg-[#f8f9fa] border-b border-[#eef0f2]">
          <h3 className="font-hl font-extrabold text-[14px] text-primary">{tp('stats.section_title')}</h3>
        </div>
        <div className="flex flex-col gap-3 relative">
          {loading && <div className="absolute inset-0 bg-white/60 rounded-xl z-10" />}
          {statsBars.map((bar) => (
            <div key={bar.label} className="flex items-center gap-3">
              <span className="text-[11px] text-[#424751] w-[130px] shrink-0">{bar.label}</span>
              <div className="flex-1 h-1 bg-[#e1e3e4] rounded-full overflow-hidden">
                <div className="bar-grow h-full bg-primary rounded-full transition-all duration-500" style={{ width: `${bar.pct}%` }} />
              </div>
              <span className="font-hl font-bold text-[12px] text-[#191c1d] w-9 text-right">{bar.value}</span>
            </div>
          ))}
        </div>
      </div>
    </>
  )
}
