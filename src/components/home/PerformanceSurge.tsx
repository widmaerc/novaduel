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
    <div className="pcard-hover bg-white rounded-3xl p-6 border border-gray-100 flex flex-col items-center text-center relative overflow-hidden group cursor-pointer block shadow-sm hover:shadow-xl transition-all">
      <div className="absolute top-0 right-0 p-4">
        <div className="bg-green-50 text-green-600 font-hl font-black text-sm px-2 py-1 rounded shadow-sm border border-green-100">{player.delta}</div>
      </div>
      <div className="w-20 h-20 rounded-full bg-gray-100 mb-4 border-2 border-transparent group-hover:border-primary p-1 overflow-hidden transition-colors flex items-center justify-center">
        <span className="font-hl font-black text-primary/30 text-3xl">{player.init}</span>
      </div>
      <h3 className="font-hl font-bold text-lg text-dark mb-1">{player.name}</h3>
      <p className="text-[10px] text-gray-500 uppercase tracking-widest mb-4">{player.league} · {player.club}</p>
      
      <div className="w-full flex flex-col gap-2 mb-6">
        {player.stats.map(s => (
          <div key={s.l} className="w-full bg-gray-50 rounded-xl p-3 text-left border border-gray-100/50">
            <div className="text-[9px] text-gray-500 uppercase tracking-widest mb-1 truncate">{t(`stats_labels.${s.l}` as any)}</div>
            <div className="font-hl font-black text-primary text-lg leading-none">
              {s.v} <span className="text-xs text-gray-400 font-bold">/100</span>
            </div>
          </div>
        ))}
      </div>

      <div className="w-full mt-auto">
         <span className="inline-block w-full py-5 bg-primary !text-white font-hl font-black text-[10px] uppercase tracking-[0.2em] rounded-xl group-hover:bg-primary-c transition-all active:scale-95 shadow-lg shadow-primary/10"
               style={{ color: 'white' }}>
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
          <h2 className="font-hl font-bold text-3xl md:text-5xl text-dark uppercase tracking-tighter">
            {t('title')}
          </h2>
        </div>
        <div className="flex gap-2 hidden md:flex">
          <button className="w-10 h-10 rounded-full border border-gray-100 flex items-center justify-center hover:border-primary text-dark hover:text-primary transition-colors">←</button>
          <button className="w-10 h-10 rounded-full border border-gray-100 flex items-center justify-center hover:border-primary text-dark hover:text-primary transition-colors">→</button>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        {PLAYERS.map(p => <PlayerCard key={p.name} player={p} />)}
      </div>
    </section>
  );
}
