'use client';
import { useState, useEffect } from 'react';
import { useTranslations } from 'next-intl';
import type { League } from '@/app/api/leagues/route';

function LeagueCard({ league }: { league: League }) {
  const [imgError, setImgError] = useState(false);

  return (
    <div className="group flex flex-col items-center gap-4 transition-transform hover:-translate-y-2 cursor-pointer pt-2 relative z-10">
      <div className="relative w-24 h-24 md:w-28 md:h-28 rounded-3xl border border-gray-100 bg-white/60 flex items-center justify-center p-5 overflow-hidden group-hover:border-primary group-hover:bg-white transition-all shadow-sm backdrop-blur-sm">
        
        {/* Foreground Logo */}
        <div className="relative z-10 w-full h-full flex items-center justify-center">
          {league.image_path && !imgError ? (
            <img
              src={league.image_path}
              alt={league.name}
              onError={() => setImgError(true)}
              className="w-full h-full object-contain filter drop-shadow-[0_4px_16px_rgba(0,0,0,0.8)] group-hover:drop-shadow-[0_12px_40px_rgba(0,0,0,0.9)] group-hover:scale-110 transition-all duration-500"
            />
          ) : (
            <span className="font-hl font-black text-2xl text-gray-400 group-hover:text-primary transition-colors">
              {league.name?.slice(0, 3) || '?'}
            </span>
          )}
        </div>
      </div>
      <span className="text-[10px] sm:text-xs font-bold uppercase tracking-widest text-gray-500 group-hover:text-dark transition-colors text-center px-1 w-full max-w-[150px] break-words">
        {league.name}
      </span>
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
      .then((data: League[]) => { setLeagues(data); setLoading(false); })
      .catch(() => setLoading(false));
  }, []);

  if (!loading && leagues.length === 0) return null;

  return (
    <section id="leagues" className="w-full bg-[#f8f9fa] py-16 md:py-20 relative overflow-hidden">
      {/* League Stadium BG pattern - using grid-bg for reliability */}
      <div className="absolute inset-0 z-0 opacity-10 grid-bg mix-blend-multiply" />

      <div className="max-w-7xl mx-auto px-6 md:px-12 relative z-10 text-center">
        <div className="text-[10px] font-black uppercase tracking-[0.3em] text-primary-c mb-4">
          {t('label')}
        </div>
        <h2 className="font-hl font-bold text-3xl md:text-5xl mt-6 text-dark uppercase tracking-tighter">
          {t('title').split(' ')[0]} <span className="text-[#004782]">{t('title').split(' ').slice(1).join(' ')}</span>
        </h2>
        
        {/* Explicit Spacer - Reduced by half as requested */}
        <div className="h-10 md:h-16" />

        {loading ? (
          <div className="text-center text-gray-500 text-sm py-10">{t('loading')}</div>
        ) : (
          <div className="flex flex-wrap justify-center gap-6 md:gap-8">
            {leagues.map(l => <LeagueCard key={l.id} league={l} />)}
          </div>
        )}
      </div>
    </section>
  );
}
