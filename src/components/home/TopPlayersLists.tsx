'use client';
import { useState, useEffect } from 'react';
import Link from 'next/link';
import { useTranslations } from 'next-intl';
import { useParams } from 'next/navigation';
import type { League } from '@/app/api/leagues/route';
import { localizedHref } from '@/lib/localizedPaths';

interface TopPlayer { rank: number; name: string; team: string; val: number; slug?: string | null; initials?: string }

const AV_COLORS = [
  { bg: 'bg-blue-50',  text: 'text-blue-600' },
  { bg: 'bg-green-50', text: 'text-green-600' },
  { bg: 'bg-amber-50', text: 'text-amber-600' },
  { bg: 'bg-red-50',   text: 'text-red-600' },
  { bg: 'bg-purple-50',text: 'text-purple-600' },
];



function parseScorers(data: any[]): TopPlayer[] {
  return data.flatMap(entry =>
    entry.scorers.map((s: any) => ({ rank: s.rank, name: s.name, team: s.team, val: s.goals, slug: s.slug ?? null }))
  );
}

function Row({ rank, name, team, val, slug, initials, isLast, unit, locale }: TopPlayer & { isLast: boolean; unit: string; locale: string }) {
  const c = AV_COLORS[(rank - 1) % AV_COLORS.length];
  const barColor = rank === 1 ? 'bg-green-500 shadow-[0_0_8px_rgba(34,197,94,0.3)]' : rank <= 3 ? 'bg-green-400' : 'bg-slate-300';
  const href = slug ? localizedHref(locale, `/player/${slug}`) : '#';
  
  return (
    <Link href={href} className="flex items-center gap-3 md:gap-4 px-4 py-2.5 hover:bg-slate-50/50 transition-all no-underline group">
      <span className="font-hl font-black text-xs text-slate-400 w-5 text-center shrink-0 group-hover:text-primary transition-colors">{rank}</span>
      <div className={`w-9 h-9 rounded-xl flex items-center justify-center font-hl font-bold text-xs ${c.bg} ${c.text} shrink-0 shadow-sm border border-white group-hover:scale-110 transition-all`}>
        {initials ?? name.split(' ').map(w => w[0]).join('').slice(0, 2).toUpperCase()}
      </div>
      <div className="flex-1 min-w-0">
        <div className="text-[14px] text-slate-900 font-extrabold font-hl truncate group-hover:text-primary transition-colors leading-tight tracking-tight">{name}</div>
        <div className="text-[9px] font-bold text-slate-500 mt-0.5 truncate tracking-wider">{team}</div>
      </div>
      <div className="flex items-center gap-2.5 shrink-0 pl-1">
        <div className={`w-1 h-5 rounded-full ${barColor}`} />
        <span className="font-hl font-black text-base text-slate-900 flex items-baseline gap-1">
          {val}<span className="text-[9px] font-black text-slate-400 uppercase tracking-widest leading-none">{unit}</span>
        </span>
      </div>
    </Link>
  );
}

function LeagueSelect({ leagues, value, onChange }: { leagues: League[]; value: string; onChange: (v: string) => void }) {
  if (leagues.length === 0) return null;
  return (
    <div className="relative inline-flex items-center shrink-0 max-w-[150px]">
      <select
        value={value}
        onChange={e => onChange(e.target.value)}
        className="appearance-none bg-white border border-slate-200 hover:border-primary/50 transition-colors rounded-lg pl-3 pr-8 py-1.5 text-[10px] font-bold text-slate-700 cursor-pointer outline-none w-full shadow-sm"
      >
        {leagues.map(l => (
          <option key={l.id} value={String(l.id)} className="bg-white text-slate-900">{l.name}</option>
        ))}
      </select>
      <svg className="absolute right-2.5 pointer-events-none text-slate-400" width="10" height="10" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3">
        <path d="m6 9 6 6 6-6"/>
      </svg>
    </div>
  );
}

function ListCard({ title, players, unit, locale, leagues, selectedLeague, onLeagueChange }: {
  title: string; players: TopPlayer[]; unit: string; locale: string;
  leagues: League[]; selectedLeague: string; onLeagueChange: (v: string) => void;
}) {
  return (
    <div className="glass-card !bg-white rounded-2xl overflow-hidden border border-gray-100 shadow-sm">
      <div className="px-4 py-3 md:px-5 md:py-3.5 border-b border-gray-50 flex items-center justify-between gap-2 bg-slate-50/30">
        <span className="label-caps !text-slate-900 !text-[10px] font-black font-hl tracking-[0.15em] truncate">
          {title}
        </span>
        <LeagueSelect leagues={leagues} value={selectedLeague} onChange={onLeagueChange} />
      </div>
      <div className="flex flex-col divide-y divide-gray-50">
        {players.map((p, i) => (
          <Row key={p.rank} {...p} isLast={i === players.length - 1} unit={unit} locale={locale} />
        ))}
      </div>
    </div>
  );
}

export default function TopPlayersLists() {
  const t = useTranslations('HomePage.top_players');
  const params = useParams();
  const locale = (params?.locale as string) ?? 'fr';

  const [leagues,               setLeagues]               = useState<League[]>([]);
  const [scorers,               setScorers]               = useState<TopPlayer[]>([]);
  const [assisters,             setAssisters]             = useState<TopPlayer[]>([]);
  const [selectedScorerLeague,  setSelectedScorerLeague]  = useState<string>('');
  const [selectedAssistLeague,  setSelectedAssistLeague]  = useState<string>('');

  useEffect(() => {
    fetch('/api/leagues')
      .then(r => r.ok ? r.json() : [])
      .then((data: League[]) => {
        const active = data.filter(l => l.active);
        setLeagues(active);
        if (active.length > 0) {
          const firstId = String(active[0].id);
          setSelectedScorerLeague(firstId);
          setSelectedAssistLeague(firstId);
        }
      })
      .catch(() => {});
  }, []);

  useEffect(() => {
    if (!selectedScorerLeague) return;
    fetch(`/api/topscorers?type=goals&league_id=${selectedScorerLeague}`)
      .then(r => r.ok ? r.json() : [])
      .then((data: any[]) => {
        if (!Array.isArray(data) || data.length === 0) return;
        const list = parseScorers(data);
        if (list.length > 0) setScorers(list.slice(0, 10));
      })
      .catch(() => {});
  }, [selectedScorerLeague]);

  useEffect(() => {
    if (!selectedAssistLeague) return;
    fetch(`/api/topscorers?type=assists&league_id=${selectedAssistLeague}`)
      .then(r => r.ok ? r.json() : [])
      .then((data: any[]) => {
        if (!Array.isArray(data) || data.length === 0) return;
        const list = parseScorers(data);
        if (list.length > 0) setAssisters(list.slice(0, 10));
      })
      .catch(() => {});
  }, [selectedAssistLeague]);

  return (
    <section className="bg-[#f8f9fa] grid-bg px-6 md:px-12 pt-8 pb-16 md:pt-12 md:pb-24">
      <div className="max-w-7xl mx-auto">
        <div className="flex justify-end mb-6">
          <a href={localizedHref(locale, '/players')}
             style={{ color: 'white' }}
             className="bg-primary !text-white font-hl font-black px-10 py-5 rounded-xl hover:bg-primary-c transition-all text-[10px] uppercase tracking-[0.2em] shadow-xl shadow-primary/20 active:scale-95 whitespace-nowrap">
            {t('see_all')}
          </a>
        </div>
        
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 md:gap-8">
          <ListCard
            title={t('scorers_title')}
            players={scorers}
            unit={t('goals_unit')}
            locale={locale}
            leagues={leagues}
            selectedLeague={selectedScorerLeague}
            onLeagueChange={setSelectedScorerLeague}
          />
          <ListCard
            title={t('assisters_title')}
            players={assisters}
            unit={t('assists_unit')}
            locale={locale}
            leagues={leagues}
            selectedLeague={selectedAssistLeague}
            onLeagueChange={setSelectedAssistLeague}
          />
        </div>
      </div>
    </section>
  );
}
