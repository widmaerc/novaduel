'use client'
import { useState, useEffect, useRef, useCallback } from 'react'
import { useParams, useRouter } from 'next/navigation'
import { useTranslations } from 'next-intl'
import { Link } from '@/navigation'
import Breadcrumbs from '@/components/layout/Breadcrumbs'

// ── Types ──────────────────────────────────────────────────────────────────────
interface Player {
  id: number; slug: string; name: string; common_name: string
  team: string; position: string; initials: string
  avatar_bg: string; avatar_color: string; image_url: string | null
  rating: number; goals: number; assists: number; matches: number
  league: string; nationality: string; flag_emoji: string
}

interface SearchResult {
  id: number; slug: string; name: string; common_name: string
  team: string; position: string
  initials: string; avatar_bg: string; avatar_color: string; rating: number
}

// ── Helpers ───────────────────────────────────────────────────────────────────

const POS_COLORS: Record<string, { bg: string; color: string; border: string }> = {
  ATT: { bg: '#fffbeb', color: '#d97706', border: '#fef1c7' },
  MIL: { bg: '#eff6ff', color: '#1e40af', border: '#dbeafe' },
  DEF: { bg: '#f0fdf4', color: '#15803d', border: '#dcfce7' },
  GK:  { bg: '#faf5ff', color: '#7e22ce', border: '#f3e8ff' },
}
const fallbackPos = { bg: '#f8fafc', color: '#64748b', border: '#f1f5f9' }

function Avatar({ initials, position, size = 40 }: { initials: string; position: string; size?: number }) {
  const { bg, color, border } = POS_COLORS[position] ?? fallbackPos
  const display = initials || '?'
  return (
    <div className="flex-shrink-0 rounded-xl border shadow-sm transition-transform group-hover:scale-105"
      style={{ 
        width: size, height: size, background: bg, color, borderColor: border,
        display: 'flex', alignItems: 'center', justifyContent: 'center',
        fontFamily: "'Manrope',sans-serif", fontWeight: 800, fontSize: Math.round(size * 0.36) 
      }}>
      {display}
    </div>
  )
}

function useDebounce(v: string, ms: number) {
  const [d, setD] = useState(v)
  useEffect(() => { const t = setTimeout(() => setD(v), ms); return () => clearTimeout(t) }, [v, ms])
  return d
}

// ── Page ──────────────────────────────────────────────────────────────────────
export default function PlayersPage() {
  const t = useTranslations('PlayersPage')
  const tc = useTranslations('Common')
  const { locale } = useParams<{ locale: string }>()
  const router     = useRouter()

  const getPosStyles = (code: string) => POS_COLORS[code] ?? fallbackPos

  // Search state
  const [query,    setQuery]    = useState('')
  const [searchR,  setSearchR]  = useState<SearchResult[]>([])
  const [searchL,  setSearchL]  = useState(false)
  const [open,     setOpen]     = useState(false)
  const [focusedI, setFocusedI] = useState(-1)
  const inputRef   = useRef<HTMLInputElement>(null)
  const wrapRef    = useRef<HTMLDivElement>(null)
  const dQuery     = useDebounce(query, 220)

  // List state
  const [players,  setPlayers]  = useState<Player[]>([])
  const [total,    setTotal]    = useState(0)
  const [page,     setPage]     = useState(1)
  const [loading,  setLoading]  = useState(false)
  const [position, setPosition] = useState('')
  const [sort,     setSort]     = useState('rating')

  // Close dropdown on outside click
  useEffect(() => {
    const fn = (e: MouseEvent) => {
      if (wrapRef.current && !wrapRef.current.contains(e.target as Node)) setOpen(false)
    }
    document.addEventListener('mousedown', fn)
    return () => document.removeEventListener('mousedown', fn)
  }, [])

  // Autocomplete search
  useEffect(() => {
    if (dQuery.length < 2) { setSearchR([]); return }
    setSearchL(true)
    fetch(`/api/players/search?q=${encodeURIComponent(dQuery)}`)
      .then(r => r.json())
      .then(d => { setSearchR(d.results ?? []); setSearchL(false) })
      .catch(() => setSearchL(false))
  }, [dQuery])

  // Load players list
  const loadPlayers = useCallback(async (p: number, pos: string, s: string, replace = false) => {
    setLoading(true)
    const params = new URLSearchParams({ page: String(p), per_page: '30', sort: s })
    if (pos) params.set('position', pos)
    const res  = await fetch(`/api/players?${params}`).then(r => r.json()).catch(() => ({ players: [], total: 0 }))
    setPlayers(prev => replace ? res.players : [...prev, ...res.players])
    setTotal(res.total ?? 0)
    setLoading(false)
  }, [])

  useEffect(() => { loadPlayers(1, position, sort, true); setPage(1) }, [position, sort, loadPlayers])

  function loadMore() {
    const next = page + 1
    setPage(next)
    loadPlayers(next, position, sort, false)
  }

  function goToPlayer(slug: string) {
    router.push(`/${locale}/player/${slug}`)
  }

  function onKey(e: React.KeyboardEvent) {
    if (e.key === 'ArrowDown') { e.preventDefault(); setFocusedI(i => Math.min(i + 1, searchR.length - 1)) }
    if (e.key === 'ArrowUp')   { e.preventDefault(); setFocusedI(i => Math.max(i - 1, 0)) }
    if (e.key === 'Enter' && focusedI >= 0) { e.preventDefault(); goToPlayer(searchR[focusedI].slug) }
    if (e.key === 'Escape') setOpen(false)
  }

  const hasMore = players.length < total

  return (
    <div className="pb-20">
      
      {/* ── Hero Mesh Section ── */}
      <div className="hero-mesh border-b border-slate-200">
        <div className="max-w-[1280px] mx-auto px-4 sm:px-6 py-2">
          <Breadcrumbs 
            locale={locale}
            items={[
              { label: tc('nav.home'), href: '/' },
              { label: t('title') }
            ]}
          />
        </div>
        <div className="max-w-[1280px] mx-auto px-4 sm:px-6 py-8 md:py-10">
          <div className="flex flex-col md:flex-row md:items-end justify-between gap-6">
            <div>
              <span className="label-caps !text-primary !font-extrabold !mb-2 block">{tc('labels.scouting_base')}</span>
              <h1 className="font-hl font-extrabold text-3xl sm:text-4xl lg:text-5xl text-slate-900 leading-none tracking-tight">
                {t('title').split(' ').map((word, i) => (
                  <span key={i} className={i === 1 ? 'text-primary' : ''}>{word} </span>
                ))}
              </h1>
              <div className="flex items-center gap-3 mt-4">
                <div className="flex -space-x-2">
                  {[1, 2, 3].map(i => (
                    <div key={i} className="w-8 h-8 rounded-full border-2 border-white bg-slate-200 flex items-center justify-center text-[10px] font-bold text-slate-500 shadow-sm">
                      P{i}
                    </div>
                  ))}
                </div>
                <p className="text-sm font-semibold text-slate-500">
                  <span className="text-slate-900 font-hl font-black">{total.toLocaleString()}</span> {t('count', { total: '' }).trim()} accessibles
                </p>
              </div>
            </div>

            {/* Total Badge */}
            <div className="glass-card shadow-xl !bg-white/40 !py-3 !px-6 flex items-center gap-4">
              <div className="w-10 h-10 rounded-xl ai-gradient flex items-center justify-center text-white shadow-lg shadow-blue-500/20">
                <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5">
                  <path d="M16 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2"/><circle cx="8.5" cy="7" r="4"/><path d="M20 8l2 2-2 2M15 10h6"/>
                </svg>
              </div>
              <div>
                <div className="label-caps !text-[9px] !text-slate-400">{tc('labels.total_players')}</div>
                <div className="font-hl font-black text-xl text-slate-900">{total.toLocaleString()}</div>
              </div>
            </div>
          </div>
        </div>
      </div>

      <div className="max-w-[1280px] mx-auto px-4 sm:px-6 -translate-y-8">
        
        {/* ── Search & Filter Bar ── */}
        <div className="glass-card shadow-2xl space-y-4 !p-4 border-slate-200/60">
          <div className="flex flex-col lg:flex-row items-center gap-6">
            
            {/* Autocomplete Search */}
            <div ref={wrapRef} className="relative flex-1 w-full">
              <div className={`flex items-center gap-3 bg-slate-50 rounded-2xl border-2 px-4 py-2.5 transition-all duration-300 ${open ? 'border-primary shadow-lg shadow-primary/5 bg-white' : 'border-slate-100 hover:border-slate-200'}`}>
                <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke={open ? '#1e40af' : '#64748b'} strokeWidth="2.5" className="flex-shrink-0">
                  <circle cx="11" cy="11" r="8"/><path d="m21 21-4.35-4.35"/>
                </svg>
                <input ref={inputRef} type="text" value={query} autoComplete="off"
                  placeholder={t('search_placeholder')}
                  onChange={e => { setQuery(e.target.value); setOpen(true); setFocusedI(-1) }}
                  onFocus={() => setOpen(true)}
                  onKeyDown={onKey}
                  className="flex-1 bg-transparent border-none outline-none font-hl font-semibold text-base text-slate-900 placeholder:text-slate-400 placeholder:font-medium" />
                
                {searchL && <div className="w-5 h-5 rounded-full border-3 border-slate-200 border-t-primary animate-spin flex-shrink-0" />}
                
                {query && !searchL && (
                  <button onClick={() => { setQuery(''); setSearchR([]); setOpen(false); inputRef.current?.focus() }}
                    className="w-6 h-6 rounded-full bg-slate-200/50 hover:bg-slate-200 flex items-center justify-center transition-colors">
                    <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="#64748b" strokeWidth="3">
                      <path d="M18 6 6 18M6 6l12 12"/>
                    </svg>
                  </button>
                )}
              </div>

              {/* Dropdown */}
              {open && query.length >= 2 && (
                <div className="absolute top-[calc(100%+12px)] left-0 right-0 glass-card !p-0 z-50 overflow-hidden shadow-2xl border-slate-200 animate-in fade-in slide-in-from-top-2 duration-200">
                  <div className="max-h-[360px] overflow-y-auto">
                    {searchR.length === 0 && !searchL && (
                      <div className="py-12 text-center">
                        <div className="w-12 h-12 rounded-full bg-slate-50 flex items-center justify-center mx-auto mb-3">
                          <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="#94a3b8" strokeWidth="2">
                            <path d="M12 8v4M12 16h.01M21 12a9 9 0 1 1-18 0 9 9 0 0 1 18 0Z"/>
                          </svg>
                        </div>
                        <p className="text-sm font-semibold text-slate-500">{t('no_results', { query })}</p>
                      </div>
                    )}
                    {searchR.map((r, i) => {
                      const posS = getPosStyles(r.position)
                      return (
                        <div key={r.id}
                          className={`flex items-center gap-4 px-5 py-2.5 cursor-pointer border-b border-slate-50 last:border-0 transition-all group
                            ${focusedI === i ? 'bg-primary/5 translate-x-1' : 'hover:bg-slate-50'}`}
                          onClick={() => goToPlayer(r.slug)}
                          onMouseEnter={() => setFocusedI(i)}>
                          <Avatar initials={r.initials} position={r.position} size={40} />
                          <div className="flex-1 min-w-0">
                            <div className={`font-hl font-extrabold text-sm transition-colors ${focusedI === i ? 'text-primary' : 'text-slate-900'}`}>
                              {r.common_name || r.name}
                            </div>
                            <div className="text-[11px] font-semibold text-slate-400 uppercase tracking-wider">{r.team}</div>
                          </div>
                          <div className="flex items-center gap-3 flex-shrink-0">
                            <span className="text-[10px] font-bold uppercase px-2 py-1 rounded-lg border shadow-sm transition-colors"
                              style={{ background: posS.bg, color: posS.color, borderColor: posS.border }}>
                              {tc(`positions.${(r.position === 'MIL' ? 'mid' : r.position).toLowerCase()}`) || r.position}
                            </span>
                            {r.rating > 0 && (
                              <span className="font-hl font-extrabold text-base text-slate-900 min-w-[32px] text-right">
                                {r.rating.toFixed(1)}
                              </span>
                            )}
                          </div>
                          <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="#cbd5e1" strokeWidth="2.5" className="transition-transform group-hover:translate-x-1">
                            <path d="m9 18 6-6-6-6"/>
                          </svg>
                        </div>
                      )
                    })}
                  </div>
                </div>
              )}
            </div>

            {/* Quick Filters */}
            <div className="flex items-center gap-1.5 bg-slate-100 p-1.5 rounded-2xl">
              {[
                ['', tc('positions.all')],
                ['ATT', tc('positions.att')],
                ['MIL', tc('positions.mid')],
                ['DEF', tc('positions.def')],
                ['GK', tc('positions.gk')]
              ].map(([v, l]) => (
                <button key={v} onClick={() => setPosition(v)}
                  className={`px-5 py-2.5 rounded-xl text-xs font-hl font-black transition-all whitespace-nowrap
                    ${position === v ? 'bg-white text-primary shadow-md scale-105' : 'text-slate-500 hover:text-slate-800'}`}>
                  {l}
                </button>
              ))}
            </div>

            {/* Sort Toggle */}
            <div className="relative flex-shrink-0 w-full lg:w-48">
              <select value={sort} onChange={e => setSort(e.target.value)}
                className="w-full appearance-none bg-slate-100/50 border-2 border-transparent hover:border-slate-200 focus:border-primary/20 rounded-2xl px-5 py-3.5 pr-10 text-[13px] font-hl font-black text-slate-700 outline-none cursor-pointer transition-all">
                <option value="rating">{t('filters.sort_rating')}</option>
                <option value="goals">{t('filters.sort_goals')}</option>
                <option value="assists">{t('filters.sort_assists')}</option>
                <option value="matches">{t('filters.sort_matches')}</option>
                <option value="name">{t('filters.sort_name')}</option>
              </select>
              <div className="absolute right-4 top-1/2 -translate-y-1/2 pointer-events-none text-slate-400">
                <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3">
                  <path d="m6 9 6 6 6-6"/>
                </svg>
              </div>
            </div>
          </div>
        </div>

        {/* ── Table Container ── */}
        <div className="mt-6 glass-card !p-0 overflow-hidden shadow-2xl border-slate-200/60">
          
          <div className="overflow-x-auto">
            <table className="w-full border-collapse">
              <thead>
                <tr className="bg-slate-50/50 border-b border-slate-100">
                  <th className="px-6 py-3 text-left"><span className="label-caps !text-slate-400">#</span></th>
                  <th className="px-6 py-3 text-left min-w-[240px]"><span className="label-caps !text-slate-400">{t('table.player')}</span></th>
                  <th className="px-6 py-3 text-left hidden md:table-cell"><span className="label-caps !text-slate-400">{t('table.team')}</span></th>
                  <th className="px-6 py-3 text-center"><span className="label-caps !text-slate-400">{t('table.position')}</span></th>
                  <th className="px-6 py-3 text-center"><span className="label-caps !text-slate-400">{t('table.rating')}</span></th>
                  <th className="px-6 py-3 text-center hidden sm:table-cell"><span className="label-caps !text-slate-400">{t('table.goals')}</span></th>
                  <th className="px-6 py-3 text-center hidden sm:table-cell"><span className="label-caps !text-slate-400">{t('table.assists')}</span></th>
                  <th className="px-6 py-5 text-right"></th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-50">
                {players.length === 0 && !loading && (
                  <tr>
                    <td colSpan={8} className="py-24 text-center">
                      <div className="flex flex-col items-center gap-3">
                        <div className="w-16 h-16 rounded-full bg-slate-50 flex items-center justify-center">
                          <svg width="32" height="32" viewBox="0 0 24 24" fill="none" stroke="#cbd5e1" strokeWidth="2">
                            <path d="m21 21-6-6m2-5a7 7 0 1 1-14 0 7 7 0 0 1 14 0z"/>
                          </svg>
                        </div>
                        <p className="font-hl font-black text-slate-800 text-lg">{t('table.no_players')}</p>
                        <p className="text-sm text-slate-500 font-medium">Réinitialisez les filtres pour voir plus de joueurs.</p>
                      </div>
                    </td>
                  </tr>
                )}

                {players.map((p, idx) => {
                  const posS = getPosStyles(p.position)
                  const ratingColor = p.rating >= 8 ? '#16a34a' : p.rating >= 7 ? '#1e40af' : '#64748b'
                  return (
                    <tr key={p.id} onClick={() => goToPlayer(p.slug)} 
                      className="group hover:bg-slate-50 transition-colors cursor-pointer">
                      <td className="px-6 py-3">
                        <span className="font-hl font-bold text-xs text-slate-400 group-hover:text-primary transition-colors">
                          {(idx + 1).toString().padStart(2, '0')}
                        </span>
                      </td>
                      <td className="px-6 py-3">
                        <div className="flex items-center gap-4">
                          <Avatar initials={p.initials} position={p.position} size={42} />
                          <div className="min-w-0">
                            <div className="font-hl font-extrabold text-[15px] text-slate-900 group-hover:text-primary transition-colors truncate">
                              {p.common_name || p.name}
                            </div>
                            <div className="flex items-center gap-2 mt-0.5">
                              <span className="text-lg leading-none">{p.flag_emoji}</span>
                              <span className="text-[11px] font-semibold text-slate-400 uppercase tracking-wider truncate">
                                {p.nationality}
                              </span>
                            </div>
                          </div>
                        </div>
                      </td>
                      <td className="px-6 py-3 hidden md:table-cell">
                        <div className="text-[13px] font-semibold text-slate-600 truncate max-w-[160px]">
                          {p.team}
                        </div>
                      </td>
                      <td className="px-6 py-3 text-center">
                        <span className="inline-block text-[10px] font-bold uppercase px-2.5 py-1 rounded-lg border shadow-sm transition-transform group-hover:scale-110"
                          style={{ background: posS.bg, color: posS.color, borderColor: posS.border }}>
                          {tc(`positions.${(p.position === 'MIL' ? 'mid' : p.position).toLowerCase()}`)}
                        </span>
                      </td>
                      <td className="px-6 py-3 text-center">
                        <div className="flex flex-col items-center gap-1">
                          <span className="font-hl font-extrabold text-lg" style={{ color: ratingColor }}>
                            {p.rating ? p.rating.toFixed(2) : '—'}
                          </span>
                          <div className="w-10 h-1 bg-slate-100 rounded-full overflow-hidden">
                            <div className="h-full ai-gradient" style={{ width: `${(p.rating / 10) * 100}%` }} />
                          </div>
                        </div>
                      </td>
                      <td className="px-6 py-3 text-center hidden sm:table-cell">
                        <span className="font-hl font-bold text-[15px] text-slate-800">{p.goals ?? 0}</span>
                      </td>
                      <td className="px-6 py-3 text-center hidden sm:table-cell">
                        <span className="font-hl font-bold text-[15px] text-slate-800">{p.assists ?? 0}</span>
                      </td>
                      <td className="px-6 py-3 text-right">
                        <div className="flex items-center justify-end gap-3">
                          <button onClick={e => { e.stopPropagation(); goToPlayer(p.slug) }}
                            className="hidden lg:flex items-center gap-2 px-4 py-2 rounded-xl text-[11px] font-hl font-black text-white ai-gradient shadow-lg shadow-blue-500/20 translate-x-2 opacity-0 group-hover:translate-x-0 group-hover:opacity-100 transition-all">
                            <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3">
                              <path d="M2.062 12.348a1 1 0 0 1 0-0.696 10.75 10.75 0 0 1 19.876 0 1 1 0 0 1 0 0.696 10.75 10.75 0 0 1-19.876 0z"/><circle cx="12" cy="12" r="3"/>
                            </svg>
                            {tc('buttons.view_profile').split(' ')[0]}
                          </button>
                          <div className="w-8 h-8 rounded-full bg-slate-50 flex items-center justify-center text-slate-300 group-hover:text-primary transition-colors">
                            <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5">
                              <path d="m9 18 6-6-6-6"/>
                            </svg>
                          </div>
                        </div>
                      </td>
                    </tr>
                  )
                })}
              </tbody>
            </table>
          </div>

          {(loading || players.length > 0) && (
            <div className="p-8 bg-slate-50/30">
              {loading ? (
                <div className="flex flex-col items-center gap-3 py-4">
                  <div className="w-8 h-8 rounded-full border-4 border-slate-200 border-t-primary animate-spin" />
                  <span className="label-caps !text-slate-400">{tc('labels.loading')}</span>
                </div>
              ) : hasMore && (
                <button onClick={loadMore}
                  className="group relative flex items-center justify-center gap-3 w-full max-w-md mx-auto py-4 rounded-2xl bg-white border-2 border-slate-100 text-sm font-hl font-black text-slate-800 hover:border-primary/20 hover:text-primary transition-all shadow-sm hover:shadow-xl active:scale-[0.98]">
                  <span>{tc('buttons.load_more')}</span>
                  <span className="text-slate-400 group-hover:text-primary/50 font-medium">({tc('units.remaining', { count: (total - players.length).toLocaleString() })})</span>
                  <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3" className="group-hover:translate-y-0.5 transition-transform">
                    <path d="m6 9 6 6 6-6"/>
                  </svg>
                </button>
              )}
            </div>
          )}
        </div>
      </div>
    </div>
  )
}
