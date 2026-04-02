'use client';
import Link from 'next/link';
import { useState } from 'react';
import { useTranslations } from 'next-intl';
import { useBreakpoint } from '@/lib/useBreakpoint';
import { useParams } from 'next/navigation';
import { localizedHref } from '@/lib/localizedPaths';

const DEMO_DUEL = { 
  p1: { name: '—', club: '—', pos: 'ATT', init: '??', goals: 0, assists: 0, matches: 0, minutes: 0, dribbles: 0, shots_on_target: 0, pass_accuracy: 0, yellow_cards: 0, red_cards: 0, duels_won: 0, slug: '' }, 
  p2: { name: '—', club: '—', pos: 'ATT', init: '??', goals: 0, assists: 0, matches: 0, minutes: 0, dribbles: 0, shots_on_target: 0, pass_accuracy: 0, yellow_cards: 0, red_cards: 0, duels_won: 0, slug: '' }, 
  views: 0 
};

type Player = { 
  name: string; club: string; pos: string; init: string; 
  goals: number; assists: number; matches: number; minutes: number;
  dribbles: number; shots_on_target: number; pass_accuracy: number;
  yellow_cards: number; red_cards: number; duels_won: number; slug: string;
};

type StatCategory = 'attack' | 'passing' | 'defense' | 'physical';

function MirrorStat({ label, v1, v2, lowerIsBetter = false, emoji, unit = '' }: { label: string; v1: number | string; v2: number | string; lowerIsBetter?: boolean; emoji?: string; unit?: string }) {
  const n1 = typeof v1 === 'number' ? v1 : parseFloat(String(v1)) || 0;
  const n2 = typeof v2 === 'number' ? v2 : parseFloat(String(v2)) || 0;
  
  const total = n1 + n2 || 1;
  const pct1 = Math.round((n1 / total) * 100);
  const pct2 = 100 - pct1;

  const w1 = lowerIsBetter ? n1 <= n2 : n1 >= n2;
  const w2 = lowerIsBetter ? n2 <= n1 : n2 >= n1;

  const display1 = unit ? `${v1}${unit}` : v1;
  const display2 = unit ? `${v2}${unit}` : v2;

  return (
    <div className="flex flex-col gap-2 py-3 px-1 group/stat hover:bg-slate-50/50 transition-all rounded-xl">
      <div className="flex items-center justify-between gap-1">
        {/* Value Left - Always Blue */}
        <div className="flex items-center gap-1.5 w-16 shrink-0">
          <span className={`font-hl font-black text-xl transition-colors ${w1 ? 'text-blue-600' : 'text-blue-400 opacity-60'}`}>
            {display1}
          </span>
          {w1 && !w2 && <div className="w-1.5 h-1.5 rounded-full bg-blue-500 shadow-[0_0_8px_rgba(59,130,246,0.5)]" />}
        </div>

        {/* Label center - Dark & Clear */}
        <div className="flex-1 flex flex-col items-center gap-1.5 px-2 min-w-0">
          <span className="label-caps !text-[9px] !text-slate-900 text-center w-full truncate flex items-center justify-center gap-2 font-bold">
            {emoji && <span className="opacity-100">{emoji}</span>}
            <span className="font-extrabold">{label}</span>
          </span>

          {/* Mirror Bars - Signature Colors */}
          <div className="w-full flex h-1.5 rounded-full overflow-hidden bg-slate-100/50 border border-slate-200/20 shadow-inner">
            <div className={`h-full transition-all duration-1000 ease-out flex justify-end bg-gradient-to-r from-blue-600 to-blue-400 ${!w1 ? 'opacity-30' : ''}`} 
              style={{ width: `${pct1}%` }} />
            <div className={`h-full transition-all duration-1000 ease-out flex justify-start bg-gradient-to-l from-red-600 to-red-400 ${!w2 ? 'opacity-30' : ''}`} 
              style={{ width: `${pct2}%` }} />
          </div>
        </div>

        {/* Value Right - Always Red */}
        <div className="flex items-center justify-end gap-1.5 w-16 shrink-0">
          {w2 && !w1 && <div className="w-1.5 h-1.5 rounded-full bg-red-500 shadow-[0_0_8px_rgba(239,68,68,0.5)]" />}
          <span className={`font-hl font-black text-xl text-right transition-colors ${w2 ? 'text-red-600' : 'text-red-400 opacity-60'}`}>
            {display2}
          </span>
        </div>
      </div>
    </div>
  );
}

function PlayerHead({ p, locale, isB = false }: { p: Player; locale: string; isB?: boolean }) {
  const profileUrl = localizedHref(locale, `/player/${p.slug}`);
  
  return (
    <div className={`flex items-center gap-3 group/n ${isB ? 'flex-row-reverse text-right' : ''}`}>
      <Link href={profileUrl} className="shrink-0 no-underline">
        <div className={`w-11 h-11 rounded-xl flex items-center justify-center font-hl font-black text-sm border-2 border-white shadow-md transition-all ${
          isB ? 'bg-red-50 text-red-600 border-red-50 group-hover/n:border-red-200' : 'bg-blue-50 text-blue-600 border-blue-50 group-hover/n:border-blue-200'
        }`}>
          {p.init}
        </div>
      </Link>
      <div className="min-w-0">
        <Link href={profileUrl} className="no-underline">
          <h3 className="font-hl font-bold text-[15px] text-dark group-hover/n:text-primary transition-colors leading-tight truncate">{p.name}</h3>
        </Link>
        <p className="text-[9px] text-slate-500 label-caps mt-0.5 truncate">
          {p.club}
        </p>
      </div>
    </div>
  );
}

export default function FeaturedDuel({ featuredDuel, trends }: { featuredDuel: any; trends: any }) {
  const t = useTranslations('HomePage.Duel');
  const tc = useTranslations('Common');
  const params = useParams();
  const locale = (params?.locale as string) ?? 'fr';
  const { isDesktop } = useBreakpoint();
  const [activeTab, setActiveTab] = useState<StatCategory>('attack');

  const p1: Player = featuredDuel?.playerA ? {
    name:     featuredDuel.playerA.common_name || featuredDuel.playerA.name,
    club:     featuredDuel.playerA.team ?? '',
    pos:      featuredDuel.playerA.position ?? '',
    init:     featuredDuel.playerA.initials ?? '??',
    goals:    Number(featuredDuel.playerA.goals) || 0,
    assists:  Number(featuredDuel.playerA.assists) || 0,
    matches:  Number(featuredDuel.playerA.matches) || 0,
    minutes:  Number(featuredDuel.playerA.minutes) || 0,
    dribbles: Number(featuredDuel.playerA.dribbles) || 0,
    shots_on_target: Number(featuredDuel.playerA.shots_on_target) || 0,
    pass_accuracy: Number(featuredDuel.playerA.pass_accuracy) || 0,
    yellow_cards: Number(featuredDuel.playerA.yellow_cards) || 0,
    red_cards: Number(featuredDuel.playerA.red_cards) || 0,
    duels_won: Number(featuredDuel.playerA.duels_won) || 0,
    slug:     featuredDuel.playerA.slug || '',
  } : DEMO_DUEL.p1;

  const p2: Player = featuredDuel?.playerB ? {
    name:     featuredDuel.playerB.common_name || featuredDuel.playerB.name,
    club:     featuredDuel.playerB.team ?? '',
    pos:      featuredDuel.playerB.position ?? '',
    init:     featuredDuel.playerB.initials ?? '??',
    goals:    Number(featuredDuel.playerB.goals) || 0,
    assists:  Number(featuredDuel.playerB.assists) || 0,
    matches:  Number(featuredDuel.playerB.matches) || 0,
    minutes:  Number(featuredDuel.playerB.minutes) || 0,
    dribbles: Number(featuredDuel.playerB.dribbles) || 0,
    shots_on_target: Number(featuredDuel.playerB.shots_on_target) || 0,
    pass_accuracy: Number(featuredDuel.playerB.pass_accuracy) || 0,
    yellow_cards: Number(featuredDuel.playerB.yellow_cards) || 0,
    red_cards: Number(featuredDuel.playerB.red_cards) || 0,
    duels_won: Number(featuredDuel.playerB.duels_won) || 0,
    slug:     featuredDuel.playerB.slug || '',
  } : DEMO_DUEL.p2;

  const compareUrl = localizedHref(locale, `/compare/${p1.slug}-vs-${p2.slug}`);

  const STATS: Record<StatCategory, any[]> = {
    attack: [
      { label: 'Buts', v1: p1.goals, v2: p2.goals, emoji: '⚽' },
      { label: 'Assists', v1: p1.assists, v2: p2.assists, emoji: '🎯' },
      { label: 'Matchs', v1: p1.matches, v2: p2.matches, emoji: '📋' },
      { label: 'xG', v1: '0.0', v2: '0.0', emoji: '📈' },
      { label: 'Dribbles', v1: p1.dribbles, v2: p2.dribbles, emoji: '🔄' },
      { label: 'Min./But', v1: p1.goals > 0 ? Math.round(p1.minutes / p1.goals) : 0, v2: p2.goals > 0 ? Math.round(p2.minutes / p2.goals) : 0, lowerIsBetter: true, emoji: '⏱' },
    ],
    passing: [
      { label: 'Précision passes', v1: p1.pass_accuracy, v2: p2.pass_accuracy, unit: '%', emoji: '📊' },
      { label: 'Assists', v1: p1.assists, v2: p2.assists, emoji: '🎯' },
      { label: 'Dribbles', v1: p1.dribbles, v2: p2.dribbles, emoji: '🔄' },
    ],
    defense: [
      { label: 'Duels Gagnés', v1: p1.duels_won, v2: p2.duels_won, unit: '%', emoji: '🤺' },
      { label: 'Cartons J.', v1: p1.yellow_cards, v2: p2.yellow_cards, lowerIsBetter: true, emoji: '🟨' },
      { label: 'Cartons R.', v1: p1.red_cards, v2: p2.red_cards, lowerIsBetter: true, emoji: '🟥' },
    ],
    physical: [
      { label: 'Tirs cadrés/m.', v1: p1.shots_on_target, v2: p2.shots_on_target, emoji: '⚡' },
      { label: 'Minutes', v1: p1.minutes, v2: p2.minutes, emoji: '⏱' },
    ]
  };

  return (
    <section className="max-w-[1280px] mx-auto px-4 lg:px-6 mb-12">
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
        
        {/* Main Duel Content */}
        <div className="lg:col-span-8 flex flex-col gap-6">
          <div className="flex items-center justify-between mb-2">
            <h2 className="font-hl font-black text-2xl text-dark tracking-tight uppercase"> {t('title')} </h2>
            <div className="px-3 py-1 bg-amber-50 rounded-full border border-amber-100">
               <span className="text-[10px] label-caps text-amber-600 font-bold tracking-widest flex items-center gap-1.5">
                 <span className="w-1.5 h-1.5 rounded-full bg-amber-500 animate-pulse" />
                 LIVE DUEL
               </span>
            </div>
          </div>

          <div className="bg-white rounded-[2.5rem] p-6 sm:p-10 shadow-2xl shadow-blue-900/5 border border-slate-100 flex flex-col relative overflow-hidden">
            <div className="absolute top-0 right-0 w-64 h-64 bg-slate-50/50 rounded-full -mr-32 -mt-32 blur-3xl pointer-events-none" />
            <div className="absolute bottom-0 left-0 w-64 h-64 bg-slate-50/50 rounded-full -ml-32 -mb-32 blur-3xl pointer-events-none" />

            <div className="grid grid-cols-2 gap-4 items-center mb-8 relative z-10">
              <PlayerHead p={p1} locale={locale} />
              <PlayerHead p={p2} locale={locale} isB />
              
              <div className="absolute left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2 w-10 h-10 rounded-full bg-slate-900 text-white flex items-center justify-center font-hl font-black text-xs shadow-xl shadow-slate-900/20 border-2 border-white ring-4 ring-slate-50 sm:scale-125 select-none">
                VS
              </div>
            </div>

            {/* Tabs System */}
            <div className="flex justify-center mb-10 relative z-10">
              <div className="flex bg-slate-100/60 p-1.5 rounded-2xl gap-1 border border-slate-200/30 overflow-x-auto no-scrollbar">
                {(Object.keys(STATS) as StatCategory[]).map(c => (
                  <button key={c} onClick={() => setActiveTab(c)}
                    className={`px-5 py-2.5 rounded-xl text-[10px] label-caps transition-all whitespace-nowrap font-black ${
                      activeTab === c ? 'bg-white text-primary shadow-md border border-slate-200/30' : 'text-slate-500 hover:text-slate-700'}`}>
                    {c === 'attack' ? 'Attaque' : c === 'passing' ? 'Passes' : c === 'defense' ? 'Défense' : 'Physique'}
                  </button>
                ))}
              </div>
            </div>

            {/* Stats Mirror List */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-x-12 gap-y-1 mt-2 relative z-10">
              {STATS[activeTab].map((s, i) => (
                <MirrorStat key={i} {...s} />
              ))}
            </div>

            <div className="mt-12 flex justify-center relative z-10">
              <Link href={compareUrl} className="group/btn relative transition-all duration-300 transform active:scale-95 no-underline">
                <div className="absolute -inset-0.5 bg-gradient-to-r from-blue-600 to-blue-400 rounded-full blur opacity-30 group-hover/btn:opacity-50 transition duration-300" />
                <button className="relative px-10 py-4 bg-slate-900 text-white rounded-full font-hl font-black text-sm label-caps flex items-center gap-3 border border-slate-800 shadow-xl group-hover/btn:bg-slate-800 group-hover/btn:shadow-blue-900/10 transition-all">
                  {t('cta') || 'Analyser le duel'}
                  <svg className="w-4 h-4 transform group-hover/btn:translate-x-1 transition-transform" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M14 5l7 7m0 0l-7 7m7-7H3" />
                  </svg>
                </button>
              </Link>
            </div>
          </div>
        </div>

        {/* Sidebar Trends */}
        <div className="lg:col-span-4 flex flex-col gap-6">
          <div className="flex items-center justify-between mb-2">
            <h2 className="font-hl font-black text-xl text-dark tracking-tight">TRENDING DUELS</h2>
          </div>
          
          <div className="flex flex-col gap-3">
             {trends.map((t: any, idx: number) => (
               <Link key={t.slug} href={localizedHref(locale, `/compare/${t.slug}`)} className="no-underline">
                 <div className="bg-white/60 hover:bg-white p-4 rounded-[1.5rem] border border-slate-100 hover:border-slate-200 hover:shadow-xl hover:shadow-slate-200/50 transition-all group flex items-center justify-between gap-4">
                    <div className="flex items-center gap-4 min-w-0">
                      <span className="text-[10px] font-hl font-black text-slate-300 group-hover:text-primary/40 transition-colors">#{idx + 1}</span>
                      <div className="flex flex-col min-w-0">
                        <span className="font-hl font-bold text-[14px] text-slate-700 truncate">{t.labelA} vs {t.labelB}</span>
                        <div className="flex items-center gap-2 mt-1">
                          <div className="flex -space-x-1.5">
                             <div className="w-5 h-5 rounded-md bg-blue-50 border border-white text-[8px] flex items-center justify-center font-bold text-blue-600 shrink-0 shadow-sm">{t.playerA?.initials}</div>
                             <div className="w-5 h-5 rounded-md bg-red-50 border border-white text-[8px] flex items-center justify-center font-bold text-red-600 shrink-0 shadow-sm">{t.playerB?.initials}</div>
                          </div>
                           <span className="text-[9px] label-caps !text-slate-500 font-bold">{(t.views || 0).toLocaleString()} views</span>
                        </div>
                      </div>
                    </div>
                    <div className="w-8 h-8 rounded-full bg-slate-50 flex items-center justify-center text-slate-300 group-hover:bg-primary group-hover:text-white transition-all">
                      <svg className="w-4 h-4 translate-x-[1px]" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M9 5l7 7-7 7" />
                      </svg>
                    </div>
                 </div>
               </Link>
             ))}
          </div>
          
          {/* Promo Card */}
          <div className="mt-4 bg-gradient-to-br from-blue-600 to-indigo-700 rounded-[2rem] p-8 text-white relative overflow-hidden shadow-2xl shadow-blue-500/20">
             <div className="absolute top-0 right-0 w-32 h-32 bg-white/10 rounded-full -mr-16 -mt-16 blur-2xl" />
             <div className="relative z-10">
               <h4 className="font-hl font-black text-xl mb-2 leading-tight">Crée ton propre duel</h4>
               <p className="text-white/70 text-xs mb-6 leading-relaxed opacity-80 uppercase tracking-widest text-[9px] font-bold">Compare n'importe quels joueurs parmi plus de 150 000 profils mis à jour quotidiennement.</p>
               <Link href={localizedHref(locale, '/compare')} className="no-underline">
                 <button className="w-full py-3 bg-white text-blue-600 rounded-xl font-hl font-black text-xs label-caps hover:bg-blue-50 transition-colors shadow-lg">
                   Lancer le moteur
                 </button>
               </Link>
             </div>
          </div>

        </div>
      </div>
    </section>
  );
}
