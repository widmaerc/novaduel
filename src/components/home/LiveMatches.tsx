'use client';
import { useState, useEffect, useRef, useCallback } from 'react';
import { useTranslations } from 'next-intl';
import { useBreakpoint } from '@/lib/useBreakpoint';
import { useParams } from 'next/navigation';

interface LiveMatch {
  id: number;
  home: string;
  away: string;
  sh: number;
  sa: number;
  min: number;
  league: string;
  live: boolean;
  time: string;
}

const POLL_INTERVAL = 6_000;   // 6s — within the 10s Sportmonks window
const MAX_EMPTY    = 5;        // backoff after 5 consecutive empty responses

function short(name: string) { return name.split(' ').slice(-1)[0]; }

export default function LiveMatches() {
  const { isMobile } = useBreakpoint();
  const t = useTranslations('HomePage.live_matches');
  const params = useParams();
  const locale = (params?.locale as string) ?? 'fr';
  const [matches, setMatches]       = useState<LiveMatch[]>([]);
  const [lastUpdate, setLastUpdate] = useState(new Date());
  const emptyCount = useRef(0);
  const polling    = useRef<ReturnType<typeof setInterval> | null>(null);

  // Phase 1 — full inplay snapshot on mount
  const fetchInplay = useCallback(async () => {
    try {
      const res = await fetch('/api/livescores');
      if (!res.ok) return;
      const data: LiveMatch[] = await res.json();
      if (data.length > 0) {
        setMatches(data);
        setLastUpdate(new Date());
      }
    } catch { /* keep DEMO */ }
  }, []);

  // Phase 2 — merge only changed fixtures, backoff on consecutive empty
  const fetchLatest = useCallback(async function fetchUpdate() {
    try {
      const res = await fetch('/api/livescores/latest');
      if (!res.ok) return;
      const updates: LiveMatch[] = await res.json();

      if (updates.length === 0) {
        emptyCount.current += 1;
        // Backoff: slow down polling after MAX_EMPTY consecutive empty responses
        if (emptyCount.current >= MAX_EMPTY && polling.current) {
          clearInterval(polling.current);
          polling.current = setInterval(fetchUpdate, POLL_INTERVAL * 3);
        }
        return;
      }

      // Got real data — reset backoff
      emptyCount.current = 0;
      if (polling.current) {
        clearInterval(polling.current);
        polling.current = setInterval(fetchUpdate, POLL_INTERVAL);
      }

      setMatches(prev => {
        const map = new Map(prev.map(m => [m.id, m]));
        updates.forEach(u => map.set(u.id, u));
        return Array.from(map.values());
      });
      setLastUpdate(new Date());
    } catch { /* keep existing data */ }
  }, []);

  useEffect(() => {
    fetchInplay().then(() => {
      polling.current = setInterval(fetchLatest, POLL_INTERVAL);
    });
    return () => { if (polling.current) clearInterval(polling.current); };
  }, [fetchInplay, fetchLatest]);

  const px = isMobile ? '20px' : '48px';

  if (matches.length === 0) return null;

  return (
    <section id="live-matches" className="max-w-7xl mx-auto w-full px-6 md:px-12 pt-12 pb-8">
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-8">
        <div className="flex items-center gap-3">
          <span className="w-2.5 h-2.5 rounded-full bg-green-500 animate-pulse shadow-[0_0_10px_rgba(34,197,94,0.3)]"></span>
          <h2 className="font-hl font-bold text-2xl text-dark">{t('title')}</h2>
        </div>
        <div className="text-[10px] font-bold text-gray-400 tracking-[0.2em] uppercase bg-gray-100/50 px-3 py-1.5 rounded-full border border-gray-100">
          {lastUpdate.toLocaleTimeString(locale === 'fr' ? 'fr-FR' : locale === 'es' ? 'es-ES' : 'en-GB', { hour: '2-digit', minute: '2-digit' })} GMT+1
        </div>
      </div>

      {/* Table Container */}
      <div className="glass-card rounded-[32px] overflow-hidden border border-gray-100 shadow-sm bg-white">
        
        {/* Table Header */}
        <div className="hidden md:flex bg-gray-50/50 px-6 py-3 border-b border-gray-100 text-[10px] font-bold text-gray-400 uppercase tracking-[0.2em]">
          <div className="flex-1 basis-1/4 pl-2">{t('table.league')}</div>
          <div className="flex-1 basis-1/2 text-center">{t('table.match')}</div>
          <div className="flex-1 basis-1/4 text-right pr-2">{t('table.status')}</div>
        </div>
        
        {/* Table Body */}
        <div className="flex flex-col">
          {matches.map((m, index) => (
            <div 
              key={m.id} 
              className={`flex flex-col md:flex-row md:items-center gap-4 md:gap-0 px-6 py-2.5 hover:bg-gray-50/30 transition-colors ${
                index !== matches.length - 1 ? 'border-b border-gray-100' : ''
              }`}
            >
              
              {/* League */}
              <div className="flex-1 basis-1/4 flex items-center justify-between md:justify-start gap-3">
                 <div className="flex items-center gap-3">
                   <div className="w-8 h-8 rounded-lg bg-gray-100 border border-gray-200 flex items-center justify-center text-[10px] font-black text-primary text-center">
                     {m.league.substring(0, 2).toUpperCase()}
                   </div>
                   <span className="font-bold text-[11px] text-gray-500 uppercase tracking-widest truncate max-w-[120px]">{m.league}</span>
                 </div>
                 
                 {/* Mobile Status - shown only on small screens */}
                 <div className="md:hidden flex justify-end">
                   {m.live ? (
                     <span className="px-3 py-1 rounded-full bg-green-50 text-green-600 border border-green-100 text-[10px] font-black animate-pulse">
                       {m.min}&apos;
                     </span>
                   ) : (
                     <span className="px-3 py-1 rounded-full bg-gray-50 text-gray-500 border border-gray-100 text-[10px] font-black">
                       {m.time}
                     </span>
                   )}
                 </div>
              </div>

              {/* Home - Score - Away */}
              <div className="flex-1 basis-1/2 flex items-center justify-between md:justify-center gap-2 sm:gap-4 md:gap-6 lg:gap-8">
                 {/* Home Team */}
                 <div className="flex items-center justify-end w-[35%] md:w-1/3 gap-3">
                   <span className="font-hl font-bold text-dark text-sm md:text-base truncate text-right">{short(m.home)}</span>
                   <div className="w-5 h-5 sm:w-6 sm:h-6 rounded bg-gray-50 shrink-0 border border-gray-100"></div>
                 </div>
                 
                 {/* Score Box */}
                 <div className="px-4 sm:px-5 py-2 sm:py-2.5 rounded-2xl border border-gray-100 bg-gray-50/50 shadow-sm flex items-center justify-center min-w-[70px] sm:min-w-[90px] shrink-0">
                   {m.live ? (
                      <div className="font-hl font-black text-xl text-primary flex items-center gap-3">
                        <span>{m.sh}</span>
                        <span className="text-gray-300 text-sm font-medium animate-pulse">:</span>
                        <span>{m.sa}</span>
                      </div>
                   ) : (
                      <div className="font-hl font-black text-sm text-gray-500 tracking-tighter">VS</div>
                   )}
                 </div>

                 {/* Away Team */}
                 <div className="flex items-center justify-start w-[35%] md:w-1/3 gap-3">
                   <div className="w-5 h-5 sm:w-6 sm:h-6 rounded bg-gray-50 shrink-0 border border-gray-100"></div>
                   <span className="font-hl font-bold text-dark text-sm md:text-base truncate text-left">{short(m.away)}</span>
                 </div>
              </div>

              {/* Status Desktop */}
               <div className="hidden md:flex flex-1 basis-1/4 justify-end">
                 {m.live ? (
                   <span className="px-3 py-1 rounded-full bg-green-50 text-green-600 border border-green-100 text-[10px] font-black animate-pulse uppercase tracking-wider">
                     {m.min}&apos;
                   </span>
                 ) : (
                   <span className="px-3 py-1 rounded-full bg-gray-50 text-gray-500 border border-gray-100 text-[10px] font-black uppercase tracking-wider">
                     {m.time}
                   </span>
                 )}
               </div>

            </div>
          ))}
        </div>
      </div>
      {/* Footer CTA */}
      <div className="mt-12 flex justify-center">
        <a href={`/${locale}/match`} 
           style={{ color: 'white' }}
           className="bg-primary !text-white font-hl font-black px-10 py-5 rounded-xl hover:bg-primary-c transition-all text-xs uppercase tracking-[0.2em] shadow-xl shadow-primary/20 active:scale-95">
          {t('see_all')}
        </a>
      </div>
    </section>
  );
}
