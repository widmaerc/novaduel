'use client'
import { useState, useRef, useEffect, useMemo, RefObject } from 'react'
import { useParams, useRouter } from 'next/navigation'
import { useTranslations } from 'next-intl'
import { localizedHref } from '@/lib/localizedPaths'
import PlayerAvatar from './PlayerAvatar'

// ── Types ─────────────────────────────────────────────────────────────────────
interface DBPlayer {
  id: number; slug: string; name: string; common_name: string
  team: string; position: string; image_url: string | null
  initials: string; avatar_bg: string; avatar_color: string; rating: number
}
interface SelectedPlayer {
  slug: string; name: string; club: string; position: string
  initials: string; avatar_bg: string; avatar_color: string; image_url: string | null
}
interface Props {
  locale?: string
  initialPlayerA?: SelectedPlayer
  initialPlayerB?: SelectedPlayer
  ctaLabel?: string
  hideMode?: boolean
  inlineButton?: boolean
  isHero?: boolean
}

const POS_STYLE: Record<string, { bg: string; color: string }> = {
  ATT: { bg: '#fffbeb', color: '#d97706' },  // amber-50 / amber-600
  MIL: { bg: '#eff6ff', color: '#2563eb' },  // blue-50  / blue-600
  DEF: { bg: '#f0fdf4', color: '#16a34a' },  // green-50 / green-600
  GK:  { bg: '#faf5ff', color: '#9333ea' },  // purple-50/ purple-600
}


// ── Slot — défini HORS du composant parent pour éviter les remounts ───────────
interface SlotProps {
  isA:        boolean
  player:     SelectedPlayer | null
  query:      string
  filtered:   DBPlayer[]
  open:       boolean
  focused:    number
  loading:    boolean
  totalCount: number
  wRef:       RefObject<HTMLDivElement | null>
  iRef:       RefObject<HTMLInputElement | null>
  onQuery:    (v: string) => void
  onOpen:     (v: boolean) => void
  onFocus:    (i: number) => void
  onSelect:   (p: DBPlayer) => void
  onClear:    () => void
  onKey:      (e: React.KeyboardEvent) => void
  isHero?:    boolean
  t:          any
  tc:         any
}

function Slot({
  isA, player, query, filtered, open, focused, loading, totalCount,
  wRef, iRef, onQuery, onOpen, onFocus, onSelect, onClear, onKey,
  isHero, t, tc
}: SlotProps) {
  const accent   = isA ? '#004782' : '#92000f'
  const accentBg = isA ? 'rgba(0,71,130,.08)' : 'rgba(146,0,15,.06)'

  return (
    <div ref={wRef} className={`relative ${isHero ? 'flex-[1.5]' : 'flex-1'} min-w-0`}>
      {player ? (
        <div 
          className="flex items-center gap-2.5 px-4 py-1.5 transition-all glass-card !rounded-full group"
          style={{ 
            borderColor: isA ? 'rgba(30,64,175,0.2)' : 'rgba(146,0,15,0.2)',
            background: isA ? 'rgba(30,64,175,0.03)' : 'rgba(146,0,15,0.03)'
          }}
        >
          <div className="flex flex-1 items-center gap-2.5 min-w-0">
            {(() => { 
              const p = player!;
              const c = POS_STYLE[p.position] ?? { bg: '#f1f5f9', color: '#64748b' }; 
              return (
                <div className="relative">
                  <PlayerAvatar initials={p.initials} avatarBg={c.bg} avatarColor={c.color} size={30} />
                  <div 
                    className="absolute -bottom-1 -right-0.5 w-3 h-3 rounded-full border border-white"
                    style={{ background: isA ? '#1e40af' : '#92000f' }}
                  />
                </div>
              )
            })()}
            <div className="flex-1 min-w-0">
              <div className="font-semibold text-sm truncate" style={{ color: isA ? '#1e40af' : '#92000f' }}>{player.name}</div>
              <div className="label-caps !text-[8.5px] !text-slate-400 truncate mt-0">{player.club}</div>
            </div>
          </div>
          <button 
            onClick={onClear} 
            className="flex-shrink-0 w-6 h-6 rounded-full flex items-center justify-center text-slate-400 hover:bg-white hover:text-slate-600 hover:shadow-sm transition-all"
          >
            <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3">
              <path d="M18 6 6 18M6 6l12 12"/>
            </svg>
          </button>
        </div>
      ) : (
        <div className={`flex items-center gap-3 px-4 h-10 md:h-12 transition-all bg-white border rounded-xl overflow-hidden
          ${open ? 'ring-2 ring-primary/10 border-primary/50 shadow-lg shadow-primary/5' : 'border-slate-200 shadow-sm hover:border-slate-300'}`}>
          <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3" className="text-slate-300 flex-shrink-0">
            <circle cx="11" cy="11" r="8"/><path d="m21 21-4.35-4.35"/>
          </svg>
          <input
            ref={iRef}
            type="text"
            value={query}
            autoComplete="off"
            placeholder={isA ? t('placeholder_a') : t('placeholder_b')}
            onChange={e => { onQuery(e.target.value); onOpen(true) }}
            onFocus={() => onOpen(true)}
            onKeyDown={onKey}
            className="flex-1 w-full bg-transparent border-none outline-none font-hl font-bold text-sm text-slate-900 placeholder-slate-300 min-w-0"
          />
          {query && (
            <button
              onMouseDown={e => e.preventDefault()}
              onClick={() => { onQuery(''); onOpen(true); iRef.current?.focus() }}
              className="flex-shrink-0 text-slate-300 hover:text-slate-500 transition-colors">
              <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3">
                <path d="M18 6 6 18M6 6l12 12"/>
              </svg>
            </button>
          )}
        </div>
      )}

      {!player && open && (
        <div className={`absolute top-[calc(100%+8px)] ${isHero ? 'left-0 md:-left-4 md:min-w-[440px]' : 'left-0 right-0'} glass-card !p-0 z-50 flex flex-col overflow-hidden shadow-2xl shadow-primary/20`}
          style={{ maxHeight: 350, overflowY: 'auto' }}>
          {loading ? (
            <div className="flex items-center justify-center gap-3 py-8 text-[12px] text-slate-400">
              <div className="w-5 h-5 rounded-full border-2 border-slate-100 border-t-primary animate-spin" />
              <span className="font-bold tracking-widest uppercase">{t('loading')}</span>
            </div>
          ) : filtered.length === 0 ? (
            <div className="py-8 text-center px-6">
              <div className="text-sm font-bold text-slate-600 mb-1">{t('no_results', { query })}</div>
              <div className="label-caps !text-[9px] !text-slate-300">{t('database_info')}</div>
            </div>
          ) : (
            <>
              <div className="px-4 py-2 text-[10px] bg-slate-50/80 border-b border-slate-100 sticky top-0 flex items-center justify-between z-10 backdrop-blur-sm">
                <span className="label-caps !text-slate-400">{totalCount} {t('players_in_db')}</span>
                {query && <span className="label-caps !text-primary">{filtered.length} {t('results')}</span>}
              </div>
              {filtered.map((p, i) => {
                const pos = POS_STYLE[p.position] ?? { bg: '#f1f5f9', color: '#64748b' }
                return (
                  <div key={p.id}
                    onMouseDown={e => e.preventDefault()}
                    className={`flex items-center gap-3 px-4 py-2 cursor-pointer border-b border-slate-50 last:border-0 transition-all
                      ${focused === i ? (isA ? 'bg-blue-50/50' : 'bg-red-50/50') : 'hover:bg-slate-50'}`}
                    onClick={() => onSelect(p)}
                    onMouseEnter={() => onFocus(i)}>
                    <div className="relative shrink-0">
                      <PlayerAvatar initials={p.initials} avatarBg={pos.bg} avatarColor={pos.color} size={32} />
                      {p.rating > 0 && (
                        <div 
                          className="absolute -top-1 -right-1 px-1 py-0.5 rounded-md text-[8px] font-bold leading-none bg-white border border-slate-100 shadow-sm"
                          style={{ color: p.rating >= 8 ? '#15803d' : '#1e40af' }}
                        >
                          {p.rating.toFixed(1)}
                        </div>
                      )}
                    </div>
                    <div className="flex-1 min-w-0">
                      <div className="text-sm font-semibold text-slate-900 truncate">
                        {p.common_name || p.name}
                      </div>
                      <div className="label-caps !text-[8.5px] !text-slate-400 mt-0 truncate">{p.team}</div>
                    </div>
                    <div className="shrink-0 flex items-center">
                      <span className="label-caps !text-[8.5px] px-2 py-1 rounded-lg border border-transparent"
                        style={{ background: pos.bg, color: pos.color }}>
                        {tc(`positions.${((p.position === 'MIL' ? 'mid' : p.position) ?? '').toLowerCase()}`) || p.position}
                      </span>
                    </div>
                  </div>
                )
              })}
            </>
          )}
        </div>
      )}
    </div>
  )
}

// ── Main ──────────────────────────────────────────────────────────────────────
export default function CompareSearchBar({ locale: propLocale, initialPlayerA, initialPlayerB, ctaLabel, hideMode = false, inlineButton = false, isHero = false }: Props) {
  const router = useRouter()
  const params = useParams()
  const locale = (params?.locale as string) ?? propLocale ?? 'fr'
  const t = useTranslations('Comparison.search')
  const tc = useTranslations('Common')
  const defaultCta = ctaLabel || useTranslations('Comparison')('cta')

  const [defaultPlayers, setDefaultPlayers] = useState<DBPlayer[]>([])
  const [searchA,        setSearchA]         = useState<DBPlayer[]>([])
  const [searchB,        setSearchB]         = useState<DBPlayer[]>([])
  const [loadingA,       setLoadingA]        = useState(false)
  const [loadingB,       setLoadingB]        = useState(false)
  const [loadingInit,    setLoadingInit]     = useState(true)
  const [totalCount,     setTotalCount]      = useState(0)

  const [pA, setPA] = useState<SelectedPlayer | null>(initialPlayerA ?? null)
  const [pB, setPB] = useState<SelectedPlayer | null>(initialPlayerB ?? null)
  const [qA, setQA] = useState(''); const [qB, setQB] = useState('')
  const [oA, setOA] = useState(false); const [oB, setOB] = useState(false)
  const [fA, setFA] = useState(-1);    const [fB, setFB] = useState(-1)
  const [mode, setMode] = useState<'joueurs' | 'equipes'>('joueurs')

  const wA = useRef<HTMLDivElement>(null); const wB = useRef<HTMLDivElement>(null)
  const iA = useRef<HTMLInputElement>(null); const iB = useRef<HTMLInputElement>(null)

  // Chargement initial : top 50 par note pour le dropdown vide
  useEffect(() => {
    fetch('/api/players?per_page=50&sort=rating')
      .then(r => r.json())
      .then(d => { setDefaultPlayers(d.players ?? []); setTotalCount(d.total ?? 0); setLoadingInit(false) })
      .catch(() => setLoadingInit(false))
  }, [])

  // Recherche serveur debounced pour slot A
  useEffect(() => {
    const q = qA.trim()
    if (q.length < 2) { setSearchA([]); return }
    setLoadingA(true)
    const id = setTimeout(() => {
      fetch(`/api/players/search?q=${encodeURIComponent(q)}`)
        .then(r => r.json())
        .then(d => setSearchA(d.results ?? []))
        .catch(() => setSearchA([]))
        .finally(() => setLoadingA(false))
    }, 300)
    return () => clearTimeout(id)
  }, [qA])

  // Recherche serveur debounced pour slot B
  useEffect(() => {
    const q = qB.trim()
    if (q.length < 2) { setSearchB([]); return }
    setLoadingB(true)
    const id = setTimeout(() => {
      fetch(`/api/players/search?q=${encodeURIComponent(q)}`)
        .then(r => r.json())
        .then(d => setSearchB(d.results ?? []))
        .catch(() => setSearchB([]))
        .finally(() => setLoadingB(false))
    }, 300)
    return () => clearTimeout(id)
  }, [qB])

  useEffect(() => {
    const fn = (e: MouseEvent) => {
      if (wA.current && !wA.current.contains(e.target as Node)) setOA(false)
      if (wB.current && !wB.current.contains(e.target as Node)) setOB(false)
    }
    document.addEventListener('mousedown', fn)
    return () => document.removeEventListener('mousedown', fn)
  }, [])

  const filteredA = useMemo(() => {
    if (qA.trim().length >= 2) return searchA.filter(p => p.slug !== pB?.slug)
    return defaultPlayers.filter(p => p.slug !== pB?.slug).slice(0, 50)
  }, [qA, searchA, defaultPlayers, pB])

  const filteredB = useMemo(() => {
    if (qB.trim().length >= 2) return searchB.filter(p => p.slug !== pA?.slug)
    return defaultPlayers.filter(p => p.slug !== pA?.slug).slice(0, 50)
  }, [qB, searchB, defaultPlayers, pA])

  function select(side: 'A' | 'B', p: DBPlayer) {
    const sp: SelectedPlayer = {
      slug: p.slug, name: p.name, club: p.team, position: p.position,
      initials: p.initials, avatar_bg: p.avatar_bg, avatar_color: p.avatar_color, image_url: p.image_url,
    }
    if (side === 'A') { setPA(sp); setOA(false); setQA(''); setFA(-1) }
    else              { setPB(sp); setOB(false); setQB(''); setFB(-1) }
  }

  function clear(side: 'A' | 'B') {
    if (side === 'A') { setPA(null); setQA(''); setTimeout(() => iA.current?.focus(), 50) }
    else              { setPB(null); setQB(''); setTimeout(() => iB.current?.focus(), 50) }
  }

  function launch() {
    if (pA && pB) {
      const [s1, s2] = [pA.slug, pB.slug].sort()
      router.push(localizedHref(locale, `/compare/${s1}-vs-${s2}`))
    } else if (pA) {
      router.push(localizedHref(locale, `/player/${pA.slug}`))
    } else if (pB) {
      router.push(localizedHref(locale, `/player/${pB.slug}`))
    }
  }

  function makeKeyHandler(side: 'A' | 'B') {
    return (e: React.KeyboardEvent) => {
      const filtered = side === 'A' ? filteredA : filteredB
      const focus    = side === 'A' ? fA : fB
      const setF     = side === 'A' ? setFA : setFB
      const setO     = side === 'A' ? setOA : setOB
      if (e.key === 'ArrowDown') { e.preventDefault(); setF(Math.min(focus + 1, filtered.length - 1)) }
      if (e.key === 'ArrowUp')   { e.preventDefault(); setF(Math.max(focus - 1, 0)) }
      if (e.key === 'Enter' && focus >= 0) { e.preventDefault(); select(side, filtered[focus]) }
      if (e.key === 'Escape') setO(false)
    }
  }

  const duelButton = (
    <button 
      onClick={launch} 
      disabled={!pA && !pB}
      className={`relative overflow-hidden w-full md:w-auto bg-primary text-white px-10 py-5 rounded-2xl font-hl font-black text-xs uppercase tracking-[0.2em] shadow-xl shadow-primary/20 disabled:opacity-40 disabled:cursor-not-allowed transition-all active:scale-95 hover:bg-blue-700 hover:-translate-y-0.5 group`}
    >
      <span className="relative z-10">{defaultCta}</span>
      <div className="absolute inset-0 bg-white/10 opacity-0 group-hover:opacity-100 transition-opacity pointer-events-none" />
    </button>
  )

  return (
    <div className={`bg-white ${isHero ? 'p-3 md:p-4' : 'p-2 md:p-3'} rounded-[1.25rem] md:rounded-[2rem] 
      ${isHero ? 'shadow-[0_20px_60px_rgba(0,40,100,0.06)] border-[#eef0f2]' : 'shadow-xl border-gray-100'} 
      border flex flex-col ${inlineButton ? 'md:flex-row md:items-center' : 'items-stretch'} gap-2 md:gap-4 w-full transition-all`}>
      <div className="flex flex-col md:flex-row items-stretch md:items-center gap-2 md:gap-3 w-full flex-1 min-w-0">
        <Slot
          isA={true} player={pA} query={qA} filtered={filteredA}
          open={oA} focused={fA} loading={loadingInit || loadingA} totalCount={totalCount}
          wRef={wA} iRef={iA}
          onQuery={setQA} onOpen={setOA} onFocus={setFA}
          onSelect={p => select('A', p)} onClear={() => clear('A')}
          onKey={makeKeyHandler('A')}
          isHero={isHero}
          t={t}
          tc={tc}

        />
        <div className={isHero ? "text-[11px] font-black bg-blue-50 text-primary px-4 py-2 rounded-xl tracking-widest flex-shrink-0 shadow-sm border border-blue-100/50 mx-1 label-caps" : "text-[10px] font-black text-slate-300 px-1 py-1 md:bg-white md:border-2 md:border-slate-100 md:text-primary md:w-8 md:h-8 md:rounded-full flex items-center justify-start md:justify-center tracking-widest flex-shrink-0 z-10 font-hl"}>VS</div>
        <Slot
          isA={false} player={pB} query={qB} filtered={filteredB}
          open={oB} focused={fB} loading={loadingInit || loadingB} totalCount={totalCount}
          wRef={wB} iRef={iB}
          onQuery={setQB} onOpen={setOB} onFocus={setFB}
          onSelect={p => select('B', p)} onClear={() => clear('B')}
          onKey={makeKeyHandler('B')}
          isHero={isHero}
          t={t}
          tc={tc}

        />
        {inlineButton && duelButton}
      </div>

      {!inlineButton && (
        <div className={`flex flex-col md:flex-row items-center ${isHero ? 'justify-center w-full' : 'justify-start'} gap-2 mt-2`}>
          {duelButton}
          {!hideMode && (
            <>
              <div className="hidden sm:block w-px h-8 bg-slate-100 flex-shrink-0 mx-2" />
              <div className="flex bg-slate-100 rounded-xl p-1.5 gap-1 flex-shrink-0 border border-slate-200/50">
                {(['joueurs', 'equipes'] as const).map(m => (
                  <button 
                    key={m} 
                    onClick={() => setMode(m)}
                    className={`px-4 py-2 rounded-lg text-[10px] label-caps transition-all ${mode === m ? 'bg-white text-primary font-black shadow-sm' : 'text-slate-400 hover:text-slate-600'}`}
                  >
                    {m === 'joueurs' ? t('mode_players') : t('mode_teams')}
                  </button>
                ))}
              </div>
            </>
          )}
        </div>
      )}
    </div>
  )
}
