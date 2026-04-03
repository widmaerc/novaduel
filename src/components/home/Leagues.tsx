'use client';
import { useState, useEffect } from 'react';
import { useTranslations } from 'next-intl';
import type { League } from '@/app/api/leagues/route';

const LEAGUE_STYLE_MAP: Record<number, { class: string; bg: string; text: string; label: string }> = {
  61:  { class: 'l-l1',  bg: 'bg-green-50',  text: 'text-green-600',  label: 'L1' },
  39:  { class: 'l-pl',  bg: 'bg-purple-50', text: 'text-purple-700', label: 'PL' },
  140: { class: 'l-ll',  bg: 'bg-red-50',    text: 'text-red-600',    label: 'LL' },
  135: { class: 'l-sa',  bg: 'bg-blue-50',   text: 'text-blue-800',   label: 'SA' },
  78:  { class: 'l-b',   bg: 'bg-rose-50',   text: 'text-rose-700',   label: 'B' },
  253: { class: 'l-mls', bg: 'bg-slate-100', text: 'text-slate-900',  label: 'MLS' },
  2:   { class: 'l-ucl', bg: 'bg-indigo-900',text: 'text-white',      label: 'UCL' },
  3:   { class: 'l-uel', bg: 'bg-orange-50', text: 'text-orange-600', label: 'UEL' },
};

function LeagueCard({ league }: { league: League }) {
  const style = LEAGUE_STYLE_MAP[league.id] || { 
    class: '', 
    bg: 'bg-slate-50', 
    text: 'text-slate-600', 
    label: league.name?.split(' ').map(w => w[0]).join('').slice(0, 3).toUpperCase() 
  };

  return (
    <div className={`league-card ${style.class} glass-effect rounded-2xl p-6 text-center flex flex-col items-center justify-center group cursor-pointer w-full transition-all duration-300`}>
      <div className={`w-16 h-16 ${style.bg} rounded-xl flex items-center justify-center mb-4 transition-colors group-hover:opacity-80`}>
        <span className={`text-2xl font-black ${style.text}`}>{style.label}</span>
      </div>
      <h3 className="text-[11px] font-bold text-slate-700 uppercase tracking-wider line-clamp-1">
        {league.name}
      </h3>
      <p className="text-[10px] text-slate-400 mt-1 uppercase tracking-tighter">
        {league.country}
      </p>
    </div>
  );
}

export default function Leagues() {
  const t = useTranslations('HomePage.leagues');
  const [leagues, setLeagues] = useState<League[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetch('/api/leagues')
      .then(r => r.ok ? r.json() : [])
      .then((data: League[]) => { 
        // Filter to prioritize the ones we have styles for, or just show all
        const sorted = data.sort((a, b) => {
          const hasA = LEAGUE_STYLE_MAP[a.id] ? 0 : 1;
          const hasB = LEAGUE_STYLE_MAP[b.id] ? 0 : 1;
          return hasA - hasB;
        });
        setLeagues(sorted); 
        setLoading(false); 
      })
      .catch(() => setLoading(false));
  }, []);

  if (!loading && leagues.length === 0) return null;

  return (
    <section id="leagues" className="w-full py-20 px-4 bg-[#f8fafc]/50">
      <div className="max-w-6xl mx-auto">
        {/* Section Header */}
        <div className="text-center mb-16">
          <span className="text-primary font-bold tracking-[0.3em] text-[10px] uppercase mb-3 block">
            {t('label') || 'Compétitions Disponibles'}
          </span>
          <h2 className="text-4xl md:text-5xl font-extrabold text-slate-900 tracking-tight uppercase">
            LEAGUES <span className="text-primary">COVERED</span>
          </h2>
          <div className="h-1.5 w-20 bg-primary mx-auto mt-6 rounded-full"></div>
        </div>

        {loading ? (
          <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-6">
            {[...Array(8)].map((_, i) => (
              <div key={i} className="league-card glass-effect rounded-2xl p-6 h-40 animate-pulse bg-slate-50/50" />
            ))}
          </div>
        ) : (
          <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-6">
            {leagues.map(l => <LeagueCard key={l.id} league={l} />)}
          </div>
        )}

        {/* SEO Tagline */}
        <div className="mt-12 text-center text-slate-400 text-[11px] font-medium italic tracking-wide">
          Accédez aux statistiques détaillées et analyses IA pour plus de 15 compétitions internationales.
        </div>
      </div>
    </section>
  );
}
