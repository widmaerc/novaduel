import React from 'react'
import { getTranslations } from 'next-intl/server'
import type { Player, Trophy, CompetitionStat } from './types'

// ── TrophyList ──────────────────────────────────────────────────────────────
function TrophyList({ trophees, accent }: { trophees: Trophy[]; accent: string }) {
  return (
    <div className="flex flex-col gap-3">
      {trophees.map((t, i) => (
        <div key={i} className="flex items-center gap-3 text-[12px] group/t">
          <div className="w-8 h-8 rounded-lg bg-slate-50 border border-slate-100 flex items-center justify-center text-lg shrink-0 group-hover/t:bg-white group-hover/t:shadow-sm transition-all group-hover/t:scale-110">
            {t.emoji}
          </div>
          <span className="flex-1 font-bold text-slate-700 leading-tight truncate">{t.name}</span>
          <span className="font-hl font-black text-sm px-2.5 py-1 rounded-lg bg-slate-50 border border-slate-100 shrink-0" style={{ color: accent }}>
            {t.count}
          </span>
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
    <div className="glass-card !p-0 overflow-hidden mb-8 border-slate-200/50 shadow-sm bg-white">
      <div className="px-6 py-4 border-b border-slate-100 flex items-center justify-between bg-slate-50/50">
        <div className="flex items-center gap-3">
          <div className="w-8 h-8 rounded-lg bg-amber-50 border border-amber-100 flex items-center justify-center text-sm shadow-sm group-hover:scale-110 transition-transform">
            🏆
          </div>
          <h3 className="font-hl font-black text-lg text-slate-900 uppercase tracking-tight">
            {labels?.title ?? 'Palmarès & Titres'}
          </h3>
        </div>
        <div className="px-3 py-1 bg-slate-100/50 rounded-full border border-slate-100">
          <span className="label-caps !text-[9px] !text-slate-400 !font-bold">
            {labels?.subtitle ?? 'Club + Sélection'}
          </span>
        </div>
      </div>
      <div className="grid grid-cols-1 md:grid-cols-2">
        <div className="p-6 md:border-r border-slate-100">
          <div className="label-caps !text-[10px] !text-blue-600 mb-6 flex items-center gap-2">
            <div className="w-1.5 h-4 bg-blue-600 rounded-full" />
            {playerA.common_name}
          </div>
          <TrophyList trophees={tropheesA} accent="#1e40af" />
        </div>
        <div className="p-6 bg-slate-50/20">
          <div className="label-caps !text-[10px] !text-red-600 mb-6 flex items-center gap-2">
            <div className="w-1.5 h-4 bg-red-600 rounded-full" />
            {playerB.common_name}
          </div>
          <TrophyList trophees={tropheesB} accent="#dc2626" />
        </div>
      </div>
      <div className="px-6 py-4 bg-slate-50/50 border-t border-slate-100 flex items-center gap-3">
        <div className="text-slate-300">
          <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3">
            <circle cx="12" cy="12" r="10"/><path d="M12 16v-4M12 8h.01"/>
          </svg>
        </div>
        <span className="label-caps !text-[9px] !text-slate-400 font-bold opacity-70">
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
    <div className="flex items-center justify-between py-2 border-b border-slate-50 last:border-0 hover:bg-slate-50/50 px-2 rounded-xl transition-all group">
      <span className="label-caps !text-[10px] !text-slate-500 font-black tracking-wide">{label}</span>
      <div className="flex items-center gap-2.5 max-w-[60%]">
        <span className="font-hl font-black truncate text-sm uppercase tracking-tight" style={{ color: isA ? '#1e40af' : '#dc2626' }}>
          {p?.common_name ?? '—'}
        </span>
        <div className={`w-1.5 h-4 rounded-full shrink-0 ${isA ? 'bg-blue-600 shadow-[0_0_8px_rgba(30,64,175,0.2)]' : 'bg-red-600 shadow-[0_0_8px_rgba(220,38,38,0.2)]'} transition-all`} />
      </div>
    </div>
  )
}

// ── GlobalVerdict ─────────────────────────────────────────────────────────────
interface GlobalVerdictProps {
  playerA: Player; playerB: Player; winnerSlug: string
  verdictScorer: string; verdictAssist: string; verdictPhysical: string; verdictTechnical: string
  labels?: { 
    title: string; winner: string; best_scorer: string; best_passer: string; 
    physics: string; technique: string; analysis_footer?: string 
  }
}

export function GlobalVerdict({
  playerA, playerB, winnerSlug,
  verdictScorer, verdictAssist, verdictPhysical, verdictTechnical,
  labels
}: GlobalVerdictProps) {
  const players = [playerA, playerB]
  const winner  = players.find(p => p.slug === winnerSlug)

  return (
    <div className="glass-card !p-0 overflow-hidden shadow-2xl border-slate-100 bg-white">
      <div className="px-6 py-4 border-b border-slate-100 flex items-center justify-between bg-slate-50/50">
        <div className="flex items-center gap-3">
          <div className="w-8 h-8 rounded-lg bg-primary/10 flex items-center justify-center border border-primary/5 shadow-sm">
            <span className="text-primary text-sm font-black">📊</span>
          </div>
          <h3 className="font-hl font-black text-lg text-slate-900 uppercase tracking-tight">
            {labels?.title ?? 'Verdict Technique'}
          </h3>
        </div>
      </div>

      <div className="flex flex-col items-center px-6 py-12 border-b border-slate-50 relative overflow-hidden bg-white">
        <div className="relative mb-6">
          <div className="relative w-20 h-20 rounded-[24px] flex items-center justify-center bg-white border border-slate-100 p-0.5 shadow-xl ring-8 ring-slate-50/50 group-hover:scale-105 transition-transform duration-500">
            <div className="w-full h-full rounded-[22px] bg-slate-50/50 flex items-center justify-center">
              <span className="text-4xl filter drop-shadow-sm">🏆</span>
            </div>
          </div>
        </div>
        
        <div className="label-caps !text-[9px] !text-slate-400 mb-1.5 tracking-[0.25em] font-black opacity-60">
          {labels?.winner ?? 'WINNER'}
        </div>
        <div className="font-hl font-black text-3xl md:text-4xl text-slate-950 text-center uppercase tracking-tighter drop-shadow-sm px-4 leading-none">
          {winner?.common_name || winner?.name || '—'}
        </div>
        
        {winner && (
          <div className="mt-6 flex gap-2">
            {[1, 2, 3, 4, 5].map(s => (
              <span key={s} className="text-amber-400 text-base drop-shadow-sm">★</span>
            ))}
          </div>
        )}
      </div>

      <div className="grid grid-cols-2 divide-x divide-slate-100 bg-slate-50/20 border-b border-slate-50">
        {[playerA, playerB].map((p, i) => (
          <div key={i} className="px-6 py-6 text-center hover:bg-white transition-colors group/score">
            <div className="label-caps !text-[8px] !text-slate-400 mb-2 truncate px-2 font-black tracking-widest opacity-70 group-hover/score:opacity-100">
              SCORE GLOBAL {p.initials}
            </div>
            <div className="font-hl font-black text-3xl md:text-4xl tracking-tighter transition-transform group-hover/score:scale-110"
              style={{ color: i === 0 ? '#1e40af' : '#dc2626' }}>
              {p.rating.toFixed(2)}
            </div>
          </div>
        ))}
      </div>

      <div className="p-5 gap-1.5 flex flex-col bg-white">
        <GlobalVerdictBadge label={labels?.best_scorer ?? "Capacité de Finition"}  slug={verdictScorer}    players={players} playerA={playerA} />
        <GlobalVerdictBadge label={labels?.best_passer ?? "Influence Créative"}  slug={verdictAssist}    players={players} playerA={playerA} />
        <GlobalVerdictBadge label={labels?.physics ?? "Impact Athlétique"}   slug={verdictPhysical}  players={players} playerA={playerA} />
        <GlobalVerdictBadge label={labels?.technique ?? "Maîtrise Technique"} slug={verdictTechnical} players={players} playerA={playerA} />
      </div>
      
      <div className="px-6 py-4 bg-slate-50/50 flex items-center justify-center border-t border-slate-100">
        <span className="label-caps !text-[9px] !text-slate-400 font-bold opacity-60 tracking-wider">
          {labels?.analysis_footer ?? "Analyse basée sur les indicateurs de performance consolidés"}
        </span>
      </div>
    </div>
  )
}

// ── RatingPill ─────────────────────────────────────────────────────────────
function RatingPill({ rating }: { rating: number | null }) {
  if (!rating) return <span className="text-slate-300 text-[11px]">—</span>
  const [bg, border, color] =
    rating >= 8.4 ? ['bg-emerald-500', 'border-emerald-600', 'text-white'] :
    rating >= 8.0 ? ['bg-blue-600', 'border-blue-700', 'text-white'] :
    rating >= 7.5 ? ['bg-indigo-500', 'border-indigo-600', 'text-white'] :
    ['bg-slate-400', 'border-slate-500', 'text-white']
  return (
    <span className={`inline-flex items-center justify-center min-w-[32px] px-1.5 py-0.5 rounded-lg font-hl font-black text-[10px] shadow-sm transform hover:scale-110 transition-transform ${bg} ${color}`}>
      {rating.toFixed(1)}
    </span>
  )
}

// ── CompSection ──────────────────────────────────────────────────────────
function CompSection({ 
  player, stats, accent, colsMobile, colsSm, 
  labels, tc 
}: { 
  player: Player; stats: CompetitionStat[]; accent: string; colsMobile: string; colsSm: string;
  labels?: string[];
  tc: any;
}) {
  const headers = labels ?? ['Compétition', 'Note', 'MJ', 'B', 'A', 'JA', 'JR']
  return (
    <div className="flex flex-col h-full">
      <div className="px-6 py-4 flex items-center justify-between border-b border-slate-100 bg-slate-50/20">
        <h4 className="label-caps !text-[11px] !font-black !opacity-100 flex items-center gap-2.5" style={{ color: accent }}>
          <div className="w-6 h-6 rounded-md bg-white border border-slate-100 flex items-center justify-center shadow-sm shrink-0 font-hl font-black text-[10px]">
            {player.initials}
          </div>
          <span className="truncate">{player.common_name}</span>
        </h4>
        <div className="flex items-center gap-1.5 opacity-60">
          <div className="w-1 h-3 rounded-full" style={{ backgroundColor: accent }} />
          <span className="label-caps !text-[8px] !text-slate-400">Section {player.initials}</span>
        </div>
      </div>
      
      <div className="overflow-x-auto no-scrollbar">
        {/* Table View (shared desktop/mobile simplified) */}
        <div className="min-w-full">
          <div className="border-b border-slate-100 bg-slate-50/50">
            <div className="grid px-6 py-3 items-center"
              style={{ gridTemplateColumns: colsSm }}>
              <span className="label-caps !text-[9px] !text-slate-400 font-black tracking-[0.15em]">{headers[0]}</span>
              <span className="label-caps !text-[9px] !text-slate-400 text-center font-black tracking-[0.15em]">{headers[2]}</span>
              <span className="label-caps !text-[9px] !text-slate-400 text-center font-black tracking-[0.15em]">{headers[3]}</span>
              <span className="label-caps !text-[9px] !text-slate-400 text-center font-black tracking-[0.15em]">
                {headers[4]}
                <a href="#foot-4" className="ml-0.5 text-blue-500 opacity-60 hover:opacity-100 transition-opacity">
                  <sup>[4]</sup>
                </a>
              </span>
              <span className="label-caps !text-[9px] !text-slate-400 text-right font-black tracking-[0.15em]">
                {headers[1]}
                <a href="#foot-1" className="ml-0.5 text-blue-500 opacity-60 hover:opacity-100 transition-opacity">
                  <sup>[1]</sup>
                </a>
              </span>
            </div>
          </div>
          <div className="flex flex-col">
            {stats.length > 0 ? (
              stats.map((s, i) => (
                <div key={i}
                  className="grid px-6 py-3 border-b border-slate-50 last:border-0 hover:bg-slate-50/80 transition-all items-center group/row"
                  style={{ gridTemplateColumns: colsSm }}>
                  <div className="flex items-center gap-3 font-hl font-bold text-[12px] text-slate-800 truncate pr-2">
                    <div className="w-6 h-6 bg-white rounded-lg border border-slate-100 flex items-center justify-center shadow-sm shrink-0 overflow-hidden group-hover/row:scale-110 transition-transform">
                      {s.competition_logo
                        ? <img 
                            src={s.competition_logo} 
                            alt={tc('Alt.competition_logo', { name: s.competition })} 
                            className="w-4 h-4 object-contain" 
                          />
                        : <div className="w-2.5 h-2.5 bg-slate-100 rounded-full" />}
                    </div>
                    <span className="truncate">{s.competition}</span>
                  </div>
                  <div className="text-center font-hl font-black text-[12px] text-slate-400">{s.matches}</div>
                  <div className="text-center font-hl font-black text-[14px] text-slate-900">{s.goals}</div>
                  <div className="text-center font-hl font-black text-[14px] text-slate-600">{s.assists}</div>
                  <div className="flex justify-end"><RatingPill rating={s.rating} /></div>
                </div>
              ))
            ) : (
              <div className="py-12 flex flex-col items-center justify-center opacity-30">
                <span className="material-symbols-outlined text-4xl mb-2">inbox</span>
                <span className="label-caps !text-[8px] tracking-widest">Aucune donnée</span>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  )
}

// ── CompetitionStatsTable ─────────────────────────────────────────────────────
interface CompetitionStatsTableProps {
  playerA: Player; playerB: Player
  statsA: CompetitionStat[]; statsB: CompetitionStat[]
  labels?: { title: string; headers: string[] }
}

export async function CompetitionStatsTable({ playerA, playerB, statsA, statsB, labels }: CompetitionStatsTableProps) {
  const tc = await getTranslations('Common');
  // Balanced columns: Competition gets more weight, others are proportional
  const colsSm = 'minmax(140px, 2.5fr) 1fr 1fr 1fr 1.2fr'

  return (
    <div className="glass-card shadow-2xl border-slate-200/50 !p-0 overflow-hidden bg-white">
      <div className="px-6 py-4 border-b border-slate-100 flex flex-col sm:flex-row sm:items-center justify-between gap-6 bg-slate-50/50">
        <div className="flex flex-col gap-0.5">
          <h3 className="font-hl font-black text-lg text-slate-900 uppercase tracking-tight">
            {labels?.title ?? 'Statistiques par Compétition'}
          </h3>
        </div>
        
        <div className="flex items-center gap-6 p-2 px-4 bg-white rounded-2xl border border-slate-100 shadow-sm">
          <div className="flex items-center gap-2">
            <div className="w-2 h-2 rounded-full bg-blue-600 shadow-lg shadow-blue-600/30" />
            <span className="label-caps !text-[9px] !text-slate-900 font-black truncate max-w-[90px]">{playerA.common_name}</span>
          </div>
          <div className="w-px h-3 bg-slate-200" />
          <div className="flex items-center gap-2">
            <div className="w-2 h-2 rounded-full bg-red-600 shadow-lg shadow-red-600/30" />
            <span className="label-caps !text-[9px] !text-slate-900 font-black truncate max-w-[90px]">{playerB.common_name}</span>
          </div>
        </div>
      </div>
      
      <div className="grid grid-cols-1 lg:grid-cols-2 divide-y lg:divide-y-0 lg:divide-x divide-slate-100/80">
        <div className="relative">
          <CompSection player={playerA} stats={statsA} accent="#1e40af" colsMobile={colsSm} colsSm={colsSm} labels={labels?.headers} tc={tc} />
          <div className="absolute top-0 right-0 h-full w-4 bg-gradient-to-l from-slate-50/10 to-transparent pointer-events-none hidden lg:block" />
        </div>
        <div className="relative bg-slate-50/[0.02]">
          <CompSection player={playerB} stats={statsB} accent="#dc2626" colsMobile={colsSm} colsSm={colsSm} labels={labels?.headers} tc={tc} />
        </div>
      </div>
    </div>
  )
}
