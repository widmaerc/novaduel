import React from 'react'
import type { Player, Trophy, CompetitionStat } from './types'

// ── TrophyList ──────────────────────────────────────────────────────────────
function TrophyList({ trophees, accent }: { trophees: Trophy[]; accent: string }) {
  return (
    <div className="flex flex-col gap-2">
      {trophees.map((t, i) => (
        <div key={i} className="flex items-center gap-2 text-[12px]">
          <span className="flex-shrink-0" style={{ fontSize: 14 }}>{t.emoji}</span>
          <span className="flex-1 font-semibold text-[#191c1d] leading-tight">{t.name}</span>
          <span className="font-headline font-black text-[14px] flex-shrink-0" style={{ color: accent }}>{t.count}</span>
        </div>
      ))}
    </div>
  )
}

// ── PalmaresCard ──────────────────────────────────────────────────────────────
interface PalmaresCardProps {
  playerA: Player; playerB: Player
  tropheesA: Trophy[]; tropheesB: Trophy[]
  labels?: { title: string; subtitle: string; footer: string }
}

export function PalmaresCard({ playerA, playerB, tropheesA, tropheesB, labels }: PalmaresCardProps) {
  return (
    <div className="bg-white rounded-xl overflow-hidden border border-[#eef0f2] shadow-sm text-primary">
      <div className="px-4 py-3 border-b border-[#eef0f2] flex items-center gap-2">
        <span style={{ fontSize: 15 }}>🏆</span>
        <span className="font-headline font-bold text-[13px] text-[#191c1d]">{labels?.title ?? 'Palmarès & Titres'}</span>
        <span className="ml-auto text-[10px] text-[#727782] font-semibold hidden sm:block">{labels?.subtitle ?? 'Club + sélection'}</span>
      </div>
      <div className="grid grid-cols-2">
        <div className="p-3 sm:p-4 border-r border-[#f3f4f5]">
          <div className="text-[10px] font-black uppercase tracking-[.08em] text-[#004782] mb-2.5">{playerA.common_name}</div>
          <TrophyList trophees={tropheesA} accent="#004782" />
        </div>
        <div className="p-3 sm:p-4">
          <div className="text-[10px] font-black uppercase tracking-[.08em] text-[#92000f] mb-2.5">{playerB.common_name}</div>
          <TrophyList trophees={tropheesB} accent="#92000f" />
        </div>
      </div>
      <div className="px-4 py-2.5 bg-amber-50/60 border-t border-amber-100 flex items-start gap-2">
        <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="#f59e0b" strokeWidth="2" className="flex-shrink-0 mt-0.5">
          <circle cx="12" cy="12" r="10"/><path d="M12 16v-4M12 8h.01"/>
        </svg>
        <span className="text-[10px] sm:text-[11px] text-[#727782] leading-relaxed">
          {labels?.footer ?? '* Statistiques antérieures à 1960 : estimations historiques reconstituées.'}
        </span>
      </div>
    </div>
  )
}

// ── GlobalVerdictBadge ────────────────────────────────────────────────────────
function GlobalVerdictBadge({ label, slug, players, playerA }: { label: string; slug: string; players: Player[]; playerA: Player }) {
  const p = players.find(x => x.slug === slug)
  const isA = p?.slug === playerA.slug
  return (
    <div className="flex items-center justify-between py-2 border-b border-[#f3f4f5] last:border-0 text-[12px]">
      <span className="text-[#727782]">{label}</span>
      <span className="font-bold truncate ml-2" style={{ color: isA ? '#004782' : '#92000f' }}>
        {p?.common_name ?? '—'}
      </span>
    </div>
  )
}

// ── GlobalVerdict ─────────────────────────────────────────────────────────────
interface GlobalVerdictProps {
  playerA: Player; playerB: Player; winnerSlug: string
  verdictScorer: string; verdictAssist: string
  verdictPhysical: string; verdictTechnical: string
  labels?: { title: string; winner: string; best_scorer: string; best_passer: string; physics: string; technique: string }
}

export function GlobalVerdict({
  playerA, playerB, winnerSlug,
  verdictScorer, verdictAssist, verdictPhysical, verdictTechnical,
  labels
}: GlobalVerdictProps) {
  const players = [playerA, playerB]
  const winner  = players.find(p => p.slug === winnerSlug)

  return (
    <div className="bg-white rounded-xl overflow-hidden border border-[#eef0f2] shadow-sm text-primary">
      <div className="px-4 py-3 border-b border-[#eef0f2]">
        <span className="font-headline font-bold text-[13px] text-[#191c1d]">{labels?.title ?? 'Verdict global'}</span>
      </div>
      <div className="flex flex-col items-center px-4 py-4 border-b border-[#f3f4f5]">
        <div className="w-12 h-12 rounded-full flex items-center justify-center mb-2.5"
          style={{ background: 'rgba(245,158,11,.12)', border: '2px solid rgba(245,158,11,.3)' }}>
          <span style={{ fontSize: 22 }}>🏆</span>
        </div>
        <div className="text-[9px] font-black uppercase tracking-[.12em] text-[#727782] mb-1">{labels?.winner ?? 'Vainqueur'}</div>
        <div className="font-headline font-black text-[18px] sm:text-[20px] text-[#191c1d] text-center">
          {winner?.name ?? '—'}
        </div>
      </div>
      <div className="grid grid-cols-2 border-b border-[#f3f4f5]">
        {[playerA, playerB].map((p, i) => (
          <div key={i} className={`px-4 py-3 text-center ${i === 0 ? 'border-r border-[#f3f4f5]' : ''}`}>
            <div className="text-[9px] font-bold uppercase tracking-[.08em] text-[#727782] mb-1 truncate">
              {p.common_name}
            </div>
            <div className="font-headline font-black text-[20px]"
              style={{ color: i === 0 ? '#004782' : '#92000f' }}>
              {p.rating.toFixed(2)}
            </div>
          </div>
        ))}
      </div>
      <div className="px-4 py-2 opacity-90">
        <GlobalVerdictBadge label={labels?.best_scorer ?? "Meilleur buteur"}  slug={verdictScorer}    players={players} playerA={playerA} />
        <GlobalVerdictBadge label={labels?.best_passer ?? "Meilleur passeur"} slug={verdictAssist}    players={players} playerA={playerA} />
        <GlobalVerdictBadge label={labels?.physics ?? "Physique"}         slug={verdictPhysical}  players={players} playerA={playerA} />
        <GlobalVerdictBadge label={labels?.technique ?? "Technique"}        slug={verdictTechnical} players={players} playerA={playerA} />
      </div>
    </div>
  )
}

// ── RatingPill ─────────────────────────────────────────────────────────────
function RatingPill({ rating }: { rating: number | null }) {
  if (!rating) return <span className="text-[#c2c6d2] text-[11px]">—</span>
  const [bg, color] =
    rating >= 8.4 ? ['#dcfce7', '#15803d'] :
    rating >= 8.0 ? ['#dbeafe', '#1d4ed8'] :
    rating >= 7.5 ? ['#fef9c3', '#a16207'] :
    ['#f3f4f5', '#727782']
  return (
    <span className="inline-flex items-center justify-center min-w-[32px] px-1 py-px rounded font-headline font-black text-[11px]"
      style={{ background: bg, color }}>
      {rating.toFixed(1)}
    </span>
  )
}

// ── CompSection ──────────────────────────────────────────────────────────
function CompSection({ 
  player, stats, accent, colsMobile, colsSm, 
  labels 
}: { 
  player: Player; stats: CompetitionStat[]; accent: string; colsMobile: string; colsSm: string;
  labels?: string[]
}) {
  const headers = labels ?? ['Compétition', 'Note', 'MJ', 'B', 'A', 'JA', 'JR']
  return (
    <>
      <div className="px-3 py-2 text-[10px] font-black uppercase tracking-[.1em]"
        style={{ color: accent, background: `${accent}08` }}>
        {player.common_name}
      </div>
      <div className="overflow-x-auto text-primary">
        <div className="sm:hidden grid px-3 py-1.5 text-[9px] font-black uppercase tracking-[.05em] text-[#727782] bg-[#f3f4f5] border-b border-[#c2c6d2]"
          style={{ gridTemplateColumns: colsMobile, minWidth: 320 }}>
          <span>{headers[0]}</span>
          <span className="text-center">{headers[1]}</span>
          <span className="text-center">{headers[2]}</span>
          <span className="text-center">{headers[3]}</span>
          <span className="text-center">{headers[4]}</span>
        </div>
        {stats.map((s, i) => (
          <div key={i}
            className="grid px-3 py-2 border-b border-[#f3f4f5] last:border-0 hover:bg-[#f8f9fa] transition-colors items-center sm:hidden"
            style={{ gridTemplateColumns: colsMobile, minWidth: 320 }}>
            <div className="flex items-center gap-1.5 font-semibold text-[12px] text-[#191c1d] truncate">
              {s.competition_logo
                ? <img src={s.competition_logo} alt="" className="w-3.5 h-3.5 object-contain rounded-sm flex-shrink-0" />
                : <div className="w-3.5 h-3.5 bg-[#f3f4f5] rounded-sm flex-shrink-0" />}
              <span className="truncate">{s.competition}</span>
            </div>
            <div className="text-center"><RatingPill rating={s.rating} /></div>
            <div className="text-center font-semibold text-[12px] text-[#727782]">{s.matches}</div>
            <div className="text-center font-bold text-[12px] text-[#191c1d]">{s.goals}</div>
            <div className="text-center font-bold text-[12px] text-[#191c1d]">{s.assists}</div>
          </div>
        ))}
        <div className="hidden sm:block">
          <div className="grid px-3 py-1.5 text-[10px] font-black uppercase tracking-[.05em] text-[#727782] bg-[#f3f4f5] border-b border-[#c2c6d2]"
            style={{ gridTemplateColumns: colsSm }}>
            <span>{headers[0]}</span>
            <span className="text-center">{headers[1]}</span>
            <span className="text-center">{headers[2]}</span>
            <span className="text-center">{headers[3]}</span>
            <span className="text-center">{headers[4]}</span>
            <span className="text-center">{headers[5]}</span>
            <span className="text-center">{headers[6]}</span>
          </div>
          {stats.map((s, i) => (
            <div key={i}
              className="grid px-3 py-2 border-b border-[#f3f4f5] last:border-0 hover:bg-[#f8f9fa] transition-colors items-center"
              style={{ gridTemplateColumns: colsSm }}>
              <div className="flex items-center gap-2 font-semibold text-[12px] text-[#191c1d] truncate text-left">
                {s.competition_logo
                  ? <img src={s.competition_logo} alt="" className="w-4 h-4 object-contain rounded-sm flex-shrink-0" />
                  : <div className="w-4 h-4 bg-[#f3f4f5] rounded-sm flex-shrink-0" />}
                <span className="truncate">{s.competition}</span>
              </div>
              <div className="text-center"><RatingPill rating={s.rating} /></div>
              <div className="text-center font-semibold text-[12px] text-[#727782]">{s.matches}</div>
              <div className="text-center font-bold text-[12px] text-[#191c1d]">{s.goals}</div>
              <div className="text-center font-bold text-[12px] text-[#191c1d]">{s.assists}</div>
              <div className="text-center text-[12px] text-[#727782]">{s.yellow_cards}</div>
              <div className="text-center text-[12px] text-[#727782]">{s.red_cards}</div>
            </div>
          ))}
        </div>
      </div>
    </>
  )
}

// ── CompetitionStatsTable ─────────────────────────────────────────────────────
interface CompetitionStatsTableProps {
  playerA: Player; playerB: Player
  statsA: CompetitionStat[]; statsB: CompetitionStat[]
  labels?: { title: string; headers: string[] }
}

export function CompetitionStatsTable({ playerA, playerB, statsA, statsB, labels }: CompetitionStatsTableProps) {
  const colsMobile = '1fr 44px 36px 30px 30px'
  const colsSm     = '1fr 52px 40px 36px 36px 36px 36px'

  return (
    <div className="bg-white rounded-xl overflow-hidden border border-[#eef0f2] shadow-sm text-primary">
      <div className="px-4 py-3 border-b border-[#eef0f2] flex items-center justify-between flex-wrap gap-2">
        <span className="font-headline font-bold text-[13px] text-[#191c1d]">{labels?.title ?? 'Stats par compétition'}</span>
        <div className="flex items-center gap-3">
          <div className="flex items-center gap-1.5">
            <div className="w-2.5 h-2.5 rounded-full bg-[#004782]" />
            <span className="text-[10px] font-bold text-[#727782] truncate max-w-[70px]">{playerA.common_name}</span>
          </div>
          <div className="flex items-center gap-1.5">
            <div className="w-2.5 h-2.5 rounded-full bg-[#92000f]" />
            <span className="text-[10px] font-bold text-[#727782] truncate max-w-[70px]">{playerB.common_name}</span>
          </div>
        </div>
      </div>
      <CompSection player={playerA} stats={statsA} accent="#004782" colsMobile={colsMobile} colsSm={colsSm} labels={labels?.headers} />
      <div className="border-t-2 border-[#c2c6d2]" />
      <CompSection player={playerB} stats={statsB} accent="#92000f" colsMobile={colsMobile} colsSm={colsSm} labels={labels?.headers} />
    </div>
  )
}
