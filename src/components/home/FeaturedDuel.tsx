'use client';
import Link from 'next/link';
import { useTranslations } from 'next-intl';
import { useBreakpoint } from '@/lib/useBreakpoint';
import { useParams } from 'next/navigation';
import { localizedHref } from '@/lib/localizedPaths';
import PlayerAvatar from '@/components/compare/PlayerAvatar';
import data from '@/data/fake_featured_duel_data.json';

const { duel: DEMO_DUEL } = data;

type Player = { name: string; club: string; pos: string; init: string; g90: number; duels: number; passes: number; slug: string };

function StatBox({ label, v1, v2, pct1, pct2 }: { label: string; v1: string | number; v2: string | number; pct1: number; pct2: number }) {
  return (
    <div className="bg-[#f8f9fa] rounded-2xl p-4 border border-gray-100/50">
      <div className="text-[9px] font-black uppercase tracking-[0.2em] text-gray-400 mb-3">{label}</div>
      <div className="flex items-center gap-4">
        <span className="font-hl font-black text-xl text-primary min-w-[30px]">{v1}</span>
        <div className="flex-1 flex items-center gap-2">
           <div className="flex-1 h-1.5 bg-gray-200 rounded-full overflow-hidden flex justify-end">
              <div className="h-full bg-primary rounded-full" style={{ width: `${pct1}%` }} />
           </div>
           <div className="flex-1 h-1.5 bg-gray-200 rounded-full overflow-hidden">
              <div className="h-full bg-dark rounded-full" style={{ width: `${pct2}%` }} />
           </div>
        </div>
        <span className="font-hl font-black text-xl text-dark min-w-[30px] text-right">{v2}</span>
      </div>
    </div>
  );
}

function PlayerHead({ p, locale, tc }: { p: Player; locale: string; tc: any }) {
  const profileUrl = localizedHref(locale, `/player/${p.slug}`);
  
  return (
    <div className="flex items-center gap-4 group/n">
      <Link href={profileUrl} className="no-underline">
        <div className="w-14 h-14 rounded-full bg-gray-100 flex items-center justify-center font-hl font-black text-primary/20 text-lg border-2 border-white shadow-sm group-hover/n:border-primary/20 group-hover/n:bg-primary/5 transition-all">
          {p.init}
        </div>
      </Link>
      <div>
        <Link href={profileUrl} className="no-underline">
          <h3 className="font-hl font-bold text-lg text-dark group-hover/n:text-primary transition-colors leading-tight">{p.name}</h3>
        </Link>
        <p className="text-[10px] text-gray-400 uppercase tracking-widest mt-0.5">
          {tc(`positions.${(p.pos === 'MIL' ? 'mid' : p.pos).toLowerCase()}`)} · {p.club}
        </p>
      </div>
    </div>
  );
}

interface Trend { rank: number; slug: string; labelA: string; labelB: string; views: number }
interface FeaturedDuelData { slug: string; views: number; labelA: string; labelB: string; playerA: any; playerB: any }

export default function FeaturedDuel({ featuredDuel = null, trends = [] }: { featuredDuel?: FeaturedDuelData | null; trends?: Trend[] }) {
  const { isMobile } = useBreakpoint();
  const t = useTranslations('HomePage.featured_duel');
  const tc = useTranslations('Common');
  const params = useParams();
  const locale = (params?.locale as string) ?? 'fr';

  const duelSlug = featuredDuel?.slug ?? '#'
  const p1 = featuredDuel?.playerA ? {
    name:   featuredDuel.playerA.common_name || featuredDuel.playerA.name,
    club:   featuredDuel.playerA.team ?? '',
    pos:    featuredDuel.playerA.position ?? '',
    init:   featuredDuel.playerA.initials ?? '??',
    g90:    featuredDuel.playerA.matches > 0 ? parseFloat((featuredDuel.playerA.goals / featuredDuel.playerA.matches).toFixed(2)) : 0,
    duels:  Number(featuredDuel.playerA.duels_won) || 0,
    passes: Number(featuredDuel.playerA.pass_accuracy) || 0,
    slug:   featuredDuel.playerA.slug || '',
  } : DEMO_DUEL.p1
  const p2 = featuredDuel?.playerB ? {
    name:   featuredDuel.playerB.common_name || featuredDuel.playerB.name,
    club:   featuredDuel.playerB.team ?? '',
    pos:    featuredDuel.playerB.position ?? '',
    init:   featuredDuel.playerB.initials ?? '??',
    g90:    featuredDuel.playerB.matches > 0 ? parseFloat((featuredDuel.playerB.goals / featuredDuel.playerB.matches).toFixed(2)) : 0,
    duels:  Number(featuredDuel.playerB.duels_won) || 0,
    passes: Number(featuredDuel.playerB.pass_accuracy) || 0,
    slug:   featuredDuel.playerB.slug || '',
  } : DEMO_DUEL.p2
  const duelViews = featuredDuel?.views ?? DEMO_DUEL.views

  return (
    <section id="featured-duel" className="bg-[#f8f9fa] grid-bg text-dark pt-12 pb-8 md:pt-16 md:pb-12 relative overflow-hidden">
      <div className="max-w-7xl mx-auto w-full px-6 md:px-12 relative z-10">
        <div className="flex items-center justify-between mb-12">
          <h2 className="font-hl font-black text-3xl md:text-5xl text-[#004782] tracking-tighter uppercase">{t('title')}</h2>
          <a href={localizedHref(locale, '/compare')} className="text-[11px] font-black text-[#004782] uppercase tracking-[0.2em] hover:opacity-70 transition-opacity">
            {t('see_all')} →
          </a>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-[1fr_320px] gap-8">
          {/* Main duel card */}
          <div className="bg-white rounded-[2rem] p-6 lg:p-10 shadow-[0_20px_50px_rgba(0,0,0,0.03)] border border-gray-100 relative">
            <div className="absolute top-6 right-6 z-20">
               <span className="bg-[#b91c1c] text-white text-[8px] font-black px-3 py-1.5 rounded-full uppercase tracking-[0.15em] flex items-center gap-1.5 shadow-lg shadow-red-500/20">
                 {t('hot_badge')}
               </span>
            </div>
            
            <div className="flex flex-col md:flex-row items-center justify-between gap-8 mb-12 pt-4">
              <PlayerHead p={p1} locale={locale} tc={tc} />
              <div className="font-hl font-black text-5xl text-gray-100 tracking-tighter shrink-0 select-none">VS</div>
              <PlayerHead p={p2} locale={locale} tc={tc} />
            </div>

            <div className="flex flex-col gap-4 mb-10">
              <StatBox label={t('stat1')} v1={p1.g90}           v2={p2.g90}           pct1={40} pct2={60} />
              <StatBox label={t('stat2')} v1={`${p1.duels}%`}  v2={`${p2.duels}%`}  pct1={p1.duels} pct2={p2.duels} />
              <StatBox label={t('stat3')} v1={`${p1.passes}%`} v2={`${p2.passes}%`} pct1={p1.passes} pct2={p1.passes} />
            </div>

            <div className="flex items-center justify-between pt-6">
               <span className="text-[10px] text-gray-400 font-bold uppercase tracking-widest">{duelViews.toLocaleString(locale === 'en' ? 'en-US' : locale === 'es' ? 'es-ES' : 'fr-FR')} {t('views')}</span>
                <a href={localizedHref(locale, `/compare/${duelSlug}`)} 
                   style={{ color: 'white' }}
                   className="bg-primary !text-white font-hl font-black px-10 py-5 rounded-xl hover:bg-primary-c transition-all text-xs uppercase tracking-[0.2em] whitespace-nowrap shadow-xl shadow-primary/20 active:scale-95">
                  {t('analyse_cta')}
                </a>
            </div>
          </div>

          {/* Trends sidebar */}
          <div className="bg-[#004782] rounded-[2rem] p-8 flex flex-col shadow-2xl">
            <h3 className="font-hl font-black text-xs text-white/50 uppercase tracking-[0.3em] mb-10 flex items-center gap-2">
               <span className="text-sm">↑</span> {t('trends_title')}
            </h3>
            <div className="flex flex-col gap-8 flex-1">
              {trends.slice(0, 5).map((tr, i) => (
                <a key={tr.slug} href={localizedHref(locale, `/compare/${tr.slug}`)} className="flex items-start gap-4 group transition-transform hover:translate-x-1">
                  <span className="font-hl font-black text-3xl text-white/10 italic group-hover:text-white/20 transition-colors pt-1 leading-none">{i + 1}</span>
                  <div className="flex-1 min-w-0">
                    <div className="font-black text-sm text-white truncate group-hover:text-blue-200 transition-colors uppercase tracking-tight">{tr.labelA} vs {tr.labelB}</div>
                    <div className="text-[9px] font-black text-white/40 uppercase mt-1 tracking-widest">{tr.views.toLocaleString(locale === 'en' ? 'en-US' : locale === 'es' ? 'es-ES' : 'fr-FR')} {t('views')}</div>
                  </div>
                </a>
              ))}
            </div>
            <a href={localizedHref(locale, '/compare')}
               style={{ color: 'white' }}
               className="mt-12 w-full py-5 bg-primary !text-white font-hl font-black px-10 rounded-xl hover:bg-primary-c transition-all text-xs uppercase tracking-[0.2em] text-center shadow-xl shadow-primary/20 active:scale-95">
              {t('explore_cta')}
            </a>
          </div>
        </div>
      </div>
    </section>
  );
}

