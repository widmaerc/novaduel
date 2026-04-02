'use client';
import { useTranslations } from 'next-intl';

const PLAYERS = [
  { init: 'EH', name: 'Erling Haaland', league: 'Premier League', club: 'Man City',    delta: '+15%', stats: [{ l: 'off_eff', v: 97, d: '97/100' }, { l: 'goals_match', v: 88, d: '1.12'   }] },
  { init: 'MS', name: 'Mohamed Salah',  league: 'Premier League', club: 'Liverpool',   delta: '+11%', stats: [{ l: 'dribbles', v: 91, d: '91/100' }, { l: 'chances', v: 94, d: '94/100' }] },
  { init: 'LY', name: 'Lamine Yamal',   league: 'LaLiga',         club: 'Barcelona',   delta: '+9%',  stats: [{ l: 'dribbles', v: 89, d: '89/100' }, { l: 'chances', v: 92, d: '92/100' }] },
  { init: 'VJ', name: 'Vinicius Jr.',   league: 'LaLiga',         club: 'Real Madrid', delta: '+13%', stats: [{ l: 'speed', v: 96, d: '96/100' }, { l: 'impact', v: 90, d: '90/100' }] },
];

type PlayerData = typeof PLAYERS[number];

function PlayerCard({ player }: { player: PlayerData }) {
  const t = useTranslations('HomePage.performance');
  return (
    <div className="glass-card bg-white/40 border border-white/60 rounded-3xl p-6 flex flex-col items-center text-center relative overflow-hidden group cursor-pointer hover:border-primary/20 hover:shadow-2xl hover:shadow-primary/5 transition-all duration-300">
      <div className="absolute top-0 right-0 p-4">
        <div className="ai-gradient text-white font-mono font-bold text-[10px] px-3 py-1 rounded-full shadow-sm">
          {player.delta}
        </div>
      </div>
      <div className="w-20 h-20 rounded-full bg-slate-50 mb-4 border-2 border-white shadow-inner p-1 overflow-hidden flex items-center justify-center">
        <span className="font-mono font-bold text-primary/40 text-2xl">{player.init}</span>
      </div>
      <h3 className="font-sans font-bold text-lg text-slate-900 mb-1 tracking-tight">{player.name}</h3>
      <p className="text-[10px] text-slate-400 uppercase tracking-[0.2em] mb-6">{player.league} · {player.club}</p>
      
      <div className="w-full flex flex-col gap-2 mb-6">
        {player.stats.map(s => (
          <div key={s.l} className="w-full bg-slate-50/50 rounded-xl p-3 text-left border border-slate-100">
            <div className="text-[9px] text-slate-400 uppercase tracking-widest mb-1 truncate">{t(`stats_labels.${s.l}` as any)}</div>
            <div className="font-mono font-black text-primary text-lg leading-none">
              {s.v} <span className="text-[10px] text-slate-300 font-bold">/100</span>
            </div>
          </div>
        ))}
      </div>

      <div className="w-full mt-auto">
         <span className="inline-block w-full py-4 bg-slate-900 text-white font-bold text-[10px] uppercase tracking-[0.2em] rounded-xl group-hover:bg-primary transition-all active:scale-95">
           {t('analyse_cta')}
         </span>
      </div>
    </div>
  );
}

export default function PerformanceSurge() {
  const t = useTranslations('HomePage.performance');

  return (
    <section id="performance-surge" className="max-w-7xl mx-auto w-full px-6 md:px-12 pt-8 pb-8 md:pt-12 md:pb-12">
      <div className="flex flex-col md:flex-row md:items-end justify-between gap-6 mb-12">
        <div>
          <div className="text-[10px] font-black uppercase tracking-[0.3em] text-primary mb-2">{t('subtitle')}</div>
          <h2 className="font-sans font-extrabold text-3xl md:text-5xl text-slate-900 uppercase tracking-tighter">
            {t('title')}
          </h2>
        </div>
        <div className="flex gap-2 hidden md:flex">
          <button className="w-10 h-10 rounded-full border border-slate-200 flex items-center justify-center hover:border-primary text-slate-400 hover:text-primary transition-colors">←</button>
          <button className="w-10 h-10 rounded-full border border-slate-200 flex items-center justify-center hover:border-primary text-slate-400 hover:text-primary transition-colors">→</button>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        {PLAYERS.map(p => <PlayerCard key={p.name} player={p} />)}
      </div>
    </section>
  );
}
