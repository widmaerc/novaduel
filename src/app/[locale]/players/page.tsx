'use client'
import { useState, useEffect, useRef, useCallback } from 'react'
import { useParams, useRouter } from 'next/navigation'
import { useTranslations } from 'next-intl'

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

const POS_COLORS: Record<string, { bg: string; color: string }> = {
  ATT: { bg: '#fffbeb', color: '#d97706' },  // amber-50  / amber-600
  MIL: { bg: '#eff6ff', color: '#2563eb' },  // blue-50   / blue-600
  DEF: { bg: '#f0fdf4', color: '#16a34a' },  // green-50  / green-600
  GK:  { bg: '#faf5ff', color: '#9333ea' },  // purple-50 / purple-600
}
const fallbackPos = { bg: '#f3f4f5', color: '#727782' }

function Avatar({ initials, position, size = 40 }: { initials: string; position: string; size?: number }) {
  const { bg, color } = POS_COLORS[position] ?? { bg: '#eff6ff', color: '#004782' }
  const display = initials || '?'
  return (
    <div className="flex-shrink-0 rounded-full border border-black/[.06]"
      style={{ width: size, height: size, background: bg, color,
        display: 'flex', alignItems: 'center', justifyContent: 'center',
        fontFamily: "'Manrope',sans-serif", fontWeight: 800, fontSize: Math.round(size * 0.34) }}>
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
    <div className="max-w-[1280px] mx-auto px-3 sm:px-4 lg:px-6 pb-20">

      {/* Header */}
      <div className="pt-6 pb-5">
        <p className="text-[10px] font-black uppercase tracking-[.12em] text-[#004782] mb-1">{tc('labels.database')}</p>
        <h1 className="font-headline font-black text-[22px] sm:text-[28px] text-[#191c1d] leading-tight">
          {t('title')}
        </h1>
        <p className="text-[13px] text-[#727782] mt-1">{t('count', { total })}</p>
      </div>

      {/* ── Autocomplete search ── */}
      <div ref={wrapRef} className="relative mb-6">
        <div className="flex items-center gap-2 bg-white rounded-xl border border-[#c2c6d2] shadow-sm px-4 py-3 transition-all"
          style={{ borderColor: open ? '#004782' : undefined,
            boxShadow: open ? '0 0 0 3px rgba(0,71,130,.08)' : undefined }}>
          <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="#727782" strokeWidth="2" className="flex-shrink-0">
            <circle cx="11" cy="11" r="8"/><path d="m21 21-4.35-4.35"/>
          </svg>
          <input ref={inputRef} type="text" value={query} autoComplete="off"
            placeholder={t('search_placeholder')}
            onChange={e => { setQuery(e.target.value); setOpen(true); setFocusedI(-1) }}
            onFocus={() => setOpen(true)}
            onKeyDown={onKey}
            className="flex-1 bg-transparent border-none outline-none font-semibold text-[14px] text-[#191c1d] placeholder:text-[#c2c6d2] placeholder:font-normal" />
          {searchL && <div className="w-4 h-4 rounded-full border-2 border-[#c2c6d2] border-t-[#004782] animate-spin flex-shrink-0" />}
          {query && !searchL && (
            <button onClick={() => { setQuery(''); setSearchR([]); setOpen(false); inputRef.current?.focus() }}
              className="text-[#727782] hover:text-[#191c1d] flex-shrink-0">
              <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5">
                <path d="M18 6 6 18M6 6l12 12"/>
              </svg>
            </button>
          )}
        </div>

        {/* Dropdown */}
        {open && query.length >= 2 && (
          <div className="absolute top-[calc(100%+6px)] left-0 right-0 bg-white rounded-xl border border-[#c2c6d2] z-50 overflow-hidden"
            style={{ maxHeight: 320, overflowY: 'auto', boxShadow: '0 8px 32px rgba(0,0,0,.12)' }}>
            {searchR.length === 0 && !searchL && (
              <div className="py-6 text-center text-[13px] text-[#727782]">
                {t('no_results', { query })}
              </div>
            )}
            {searchR.map((r, i) => {
              const posS = getPosStyles(r.position)
              return (
                <div key={r.id}
                  className={`flex items-center gap-3 px-4 py-3 cursor-pointer border-b border-[#f3f4f5] last:border-0 transition-colors
                    ${focusedI === i ? 'bg-[#EFF6FF]' : 'hover:bg-[#f8f9fa]'}`}
                  onClick={() => goToPlayer(r.slug)}
                  onMouseEnter={() => setFocusedI(i)}>
                  <Avatar initials={r.initials} position={r.position} size={36} />
                  <div className="flex-1 min-w-0">
                    <div className="font-semibold text-[13px] text-[#191c1d] truncate">{r.common_name || r.name}</div>
                    <div className="text-[10px] text-[#727782] truncate">{r.team}</div>
                  </div>
                  <div className="flex items-center gap-2 flex-shrink-0">
                    <span className="text-[9px] font-bold uppercase px-1.5 py-px rounded"
                      style={{ background: posS.bg, color: posS.color }}>
                      {tc(`positions.${(r.position === 'MIL' ? 'mid' : r.position).toLowerCase()}`) || r.position}
                    </span>
                    {r.rating > 0 && (
                      <span className="font-headline font-black text-[12px] text-[#191c1d]">
                        {r.rating.toFixed(1)}
                      </span>
                    )}
                  </div>
                  <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="#c2c6d2" strokeWidth="2">
                    <path d="m9 18 6-6-6-6"/>
                  </svg>
                </div>
              )
            })}
          </div>
        )}
      </div>

      {/* ── Filtres ── */}
      <div className="flex items-center gap-2 flex-wrap mb-4">
        {/* Position */}
        <div className="flex bg-[#f3f4f5] rounded-lg p-0.5 gap-px">
          {[
            ['', tc('positions.all')],
            ['ATT', tc('positions.att')],
            ['MIL', tc('positions.mid')],
            ['DEF', tc('positions.def')],
            ['GK', tc('positions.gk')]
          ].map(([v, l]) => (
            <button key={v} onClick={() => setPosition(v)}
              className={`px-3 py-1.5 rounded-md text-[11px] font-semibold transition-all whitespace-nowrap
                ${position === v ? 'bg-white text-[#004782] font-bold shadow-sm' : 'text-[#727782]'}`}>
              {l}
            </button>
          ))}
        </div>

        {/* Sort */}
        <div className="relative ml-auto">
          <select value={sort} onChange={e => setSort(e.target.value)}
            className="appearance-none bg-white border border-[#c2c6d2] rounded-lg px-3 py-1.5 pr-7 text-[12px] font-semibold text-[#191c1d] outline-none cursor-pointer">
            <option value="rating">{t('filters.sort_rating')}</option>
            <option value="goals">{t('filters.sort_goals')}</option>
            <option value="assists">{t('filters.sort_assists')}</option>
            <option value="matches">{t('filters.sort_matches')}</option>
            <option value="name">{t('filters.sort_name')}</option>
          </select>
          <svg className="pointer-events-none absolute right-2.5 top-1/2 -translate-y-1/2"
            width="10" height="10" viewBox="0 0 24 24" fill="none" stroke="#727782" strokeWidth="2.5">
            <path d="m6 9 6 6 6-6"/>
          </svg>
        </div>
      </div>

      {/* ── Liste des joueurs ── */}
      <div className="bg-white rounded-xl border border-[#c2c6d2] shadow-sm overflow-hidden">

        {/* En-tête tableau */}
        <div className="hidden sm:grid px-4 py-2 text-[10px] font-black uppercase tracking-[.08em] text-[#727782] bg-[#f3f4f5] border-b border-[#c2c6d2]"
          style={{ gridTemplateColumns: '2fr 1fr 64px 56px 48px 48px 130px' }}>
          <span>{t('table.player')}</span>
          <span>{t('table.team')}</span>
          <span className="text-center">{t('table.position')}</span>
          <span className="text-center">{t('table.rating')}</span>
          <span className="text-center">{t('table.goals')}</span>
          <span className="text-center">{t('table.assists')}</span>
          <span />
        </div>

        {players.length === 0 && !loading && (
          <div className="py-16 text-center text-[13px] text-[#727782]">
            {t('table.no_players')}
          </div>
        )}

        {players.map((p, idx) => {
          const posS = getPosStyles(p.position)
          return (
            <div key={p.id}
              onClick={() => goToPlayer(p.slug)}
              className={`flex sm:grid items-center gap-3 px-4 py-3 border-b border-[#f3f4f5] last:border-0
                cursor-pointer hover:bg-[#f8f9fa] active:bg-[#f3f4f5] transition-colors`}
              style={{ gridTemplateColumns: '2fr 1fr 64px 56px 48px 48px 130px' }}>

              {/* Joueur */}
              <div className="flex items-center gap-3 min-w-0 flex-1 sm:flex-none">
                <div className="text-[11px] font-bold text-[#c2c6d2] w-5 text-right flex-shrink-0 hidden sm:block">
                  {idx + 1}
                </div>
                <Avatar initials={p.initials} position={p.position} size={36} />
                <div className="min-w-0">
                  <div className="font-semibold text-[13px] text-[#191c1d] truncate">{p.common_name || p.name}</div>
                  <div className="text-[10px] text-[#727782] truncate sm:hidden">{p.team} · {p.nationality}</div>
                </div>
              </div>

              {/* Équipe */}
              <div className="hidden sm:block text-[12px] text-[#727782] truncate pr-2">{p.team}</div>

              {/* Poste */}
              <div className="hidden sm:flex justify-center">
                <span className="text-[9px] font-black uppercase px-1.5 py-px rounded"
                  style={{ background: posS.bg, color: posS.color }}>
                  {tc(`positions.${(p.position === 'MIL' ? 'mid' : p.position).toLowerCase()}`)}
                </span>
              </div>

              {/* Note */}
              <div className="hidden sm:flex justify-center">
                <span className="font-headline font-black text-[13px]" style={{ color: p.rating >= 8 ? '#15803d' : p.rating >= 7 ? '#004782' : '#727782' }}>
                  {p.rating ? p.rating.toFixed(1) : '—'}
                </span>
              </div>

              {/* Buts */}
              <div className="hidden sm:flex justify-center font-bold text-[12px] text-[#191c1d]">{p.goals ?? 0}</div>

              {/* Assists */}
              <div className="hidden sm:flex justify-center font-bold text-[12px] text-[#191c1d]">{p.assists ?? 0}</div>

              {/* Action */}
              <div className="flex items-center gap-2 flex-shrink-0 ml-auto sm:ml-0">
                <button
                  onClick={e => { e.stopPropagation(); goToPlayer(p.slug) }}
                  className="hidden sm:flex items-center gap-1 px-3 py-1.5 rounded-lg text-[11px] font-bold text-[#004782] border border-[#004782]/20 bg-[#EFF6FF] hover:bg-[#004782] hover:text-white transition-all whitespace-nowrap">
                  <svg width="11" height="11" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                    <path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2"/>
                    <circle cx="12" cy="7" r="4"/>
                  </svg>
                  {tc('buttons.view_profile')}
                </button>
                <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="#c2c6d2" strokeWidth="2" className="flex-shrink-0">
                  <path d="m9 18 6-6-6-6"/>
                </svg>
              </div>
            </div>
          )
        })}

        {loading && (
          <div className="flex items-center justify-center gap-2 py-8 text-[12px] text-[#727782]">
            <div className="w-4 h-4 rounded-full border-2 border-[#c2c6d2] border-t-[#004782] animate-spin" />
            {tc('labels.loading')}
          </div>
        )}
      </div>

      {/* Pagination */}
      {hasMore && !loading && (
        <div className="flex justify-center mt-4">
          <button onClick={loadMore}
            className="px-6 py-2.5 rounded-lg bg-white border border-[#c2c6d2] text-[13px] font-semibold text-[#727782] hover:border-[#004782] hover:text-[#004782] transition-all shadow-sm">
            {tc('buttons.load_more')} <span className="text-[#c2c6d2]">({tc('units.remaining', { count: total - players.length })})</span>
          </button>
        </div>
      )}

    </div>
  )
}
