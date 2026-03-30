'use client';
import { useState, useEffect } from 'react';
import Link from 'next/link';
import { useTranslations } from 'next-intl';
import { useParams } from 'next/navigation';
import type { League } from '@/app/api/leagues/route';
import { localizedHref } from '@/lib/localizedPaths';

interface TopPlayer { rank: number; name: string; team: string; val: number; slug?: string | null }

const AV_COLORS = [
  { bg: 'bg-blue-50',  text: 'text-blue-600' },
  { bg: 'bg-green-50', text: 'text-green-600' },
  { bg: 'bg-amber-50', text: 'text-amber-600' },
  { bg: 'bg-red-50',   text: 'text-red-600' },
  { bg: 'bg-purple-50',text: 'text-purple-600' },
];

const FALLBACK_SCORERS: TopPlayer[] = [
  { rank: 1, name: 'Kylian Mbappé',  team: 'Real Madrid',     val: 12, slug: 'kylian-mbappe' },
  { rank: 2, name: 'Harry Kane',     team: 'Bayern München',  val: 11, slug: 'harry-kane' },
  { rank: 3, name: 'Erling Haaland', team: 'Manchester City', val: 10, slug: 'erling-haaland' },
  { rank: 4, name: 'Lamine Yamal',   team: 'Barcelona',       val: 8,  slug: 'lamine-yamal'  },
  { rank: 5, name: 'Vinicius Jr.',   team: 'Real Madrid',     val: 7,  slug: 'vinicius-junior'  },
];

const FALLBACK_ASSISTERS: TopPlayer[] = [
  { rank: 1, name: 'Lionel Messi',    team: 'Inter Miami',     val: 9, slug: 'lionel-messi' },
  { rank: 2, name: 'Jude Bellingham', team: 'Real Madrid',     val: 8, slug: 'jude-bellingham' },
  { rank: 3, name: 'Phil Foden',      team: 'Manchester City', val: 7, slug: 'phil-foden' },
  { rank: 4, name: 'Kevin De Bruyne', team: 'Manchester City', val: 7, slug: 'kevin-de-bruyne' },
  { rank: 5, name: 'Pedri',           team: 'Barcelona',       val: 6, slug: 'pedri' },
];

const initials = (n: string) => n.split(' ').map(w => w[0]).join('').slice(0, 2).toUpperCase();

function parseScorers(data: any[]): TopPlayer[] {
  return data.flatMap(entry =>
    entry.scorers.map((s: any) => ({ rank: s.rank, name: s.name, team: s.team, val: s.goals, slug: s.slug ?? null }))
  );
}

function Row({ rank, name, team, val, slug, isLast, unit, locale }: TopPlayer & { isLast: boolean; unit: string; locale: string }) {
  const c = AV_COLORS[(rank - 1) % AV_COLORS.length];
  const barColor = rank === 1 ? 'bg-green-500' : rank <= 3 ? 'bg-green-400' : 'bg-green-300';
  const href = slug ? localizedHref(locale, `/player/${slug}`) : '#';
  
  return (
    <Link href={href} className={`flex items-center gap-3 md:gap-4 px-4 py-3 hover:bg-gray-50 transition-colors ${!isLast ? 'border-b border-gray-50' : ''}`}>
      <span className="text-xs text-gray-400 w-4 text-center shrink-0">{rank}</span>
      <div className={`w-8 h-8 md:w-10 md:h-10 rounded-full flex items-center justify-center font-hl font-bold text-xs ${c.bg} ${c.text} shrink-0`}>
        {initials(name)}
      </div>
      <div className="flex-1 min-w-0">
        <div className="text-sm text-dark font-medium truncate">{name}</div>
        <div className="text-[10px] md:text-xs text-gray-500 mt-0.5 truncate">{team}</div>
      </div>
      <div className="flex items-center gap-2 shrink-0">
        <div className={`w-1 h-6 rounded-sm ${barColor}`} />
        <span className="font-hl font-bold text-base md:text-lg text-dark">
          {val}<span className="text-[10px] md:text-xs font-semibold text-gray-400 ml-1">{unit}</span>
        </span>
      </div>
    </Link>
  );
}

function LeagueSelect({ leagues, value, onChange }: { leagues: League[]; value: string; onChange: (v: string) => void }) {
  if (leagues.length === 0) return null;
  return (
    <div className="relative inline-flex items-center shrink-0 max-w-[140px] md:max-w-none">
      <select
        value={value}
        onChange={e => onChange(e.target.value)}
        className="appearance-none bg-gray-50 border border-gray-100 rounded-full pl-3 pr-8 py-1.5 text-[10px] md:text-xs font-bold text-primary cursor-pointer outline-none font-sans w-full truncate"
      >
        {leagues.map(l => (
          <option key={l.id} value={String(l.id)} className="bg-white text-dark">{l.name}</option>
        ))}
      </select>
      <svg className="absolute right-2.5 pointer-events-none" width="10" height="10" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" color="#60a5fa">
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
      <div className="px-4 py-3 md:px-5 md:py-4 border-b border-gray-50 flex items-center justify-between gap-2">
        <span className="text-[10px] md:text-xs font-bold uppercase tracking-wider text-dark truncate">
          {title}
        </span>
        <LeagueSelect leagues={leagues} value={selectedLeague} onChange={onLeagueChange} />
      </div>
      <div className="flex flex-col">
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
  const [scorers,               setScorers]               = useState<TopPlayer[]>(FALLBACK_SCORERS);
  const [assisters,             setAssisters]             = useState<TopPlayer[]>(FALLBACK_ASSISTERS);
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
        if (list.length > 0) setScorers(list);
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
        if (list.length > 0) setAssisters(list);
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
