'use client';
import { useTranslations } from 'next-intl';
import { useBreakpoint } from '@/lib/useBreakpoint';

interface StatsBarProps {
  playersCount?: number;
  leaguesCount?: number;
}

export default function StatsBar({ playersCount = 0, leaguesCount = 0 }: StatsBarProps) {
  const { isMobile } = useBreakpoint();
  const t = useTranslations('HomePage.stats');

  const fmt = (n: number) => n > 0 ? `${n.toLocaleString('fr-FR')}+` : '2 500+';
  const fmtLeagues = (n: number) => n > 0 ? `${n}+` : '48 000+';

  const stats = [
    { value: fmt(playersCount),      label: t('players') },
    { value: fmtLeagues(leaguesCount), label: t('leagues') },
    { value: '3',                    label: t('updates') },
    { value: '100%',                 label: t('accuracy') },
  ];

  return (
    <div className="bg-white border-y border-slate-100 py-10 md:py-14 relative overflow-hidden">
      <div className="max-w-[1280px] mx-auto px-6 md:px-12 relative">
        <div className="glass-card grid grid-cols-2 lg:grid-cols-4 gap-6 lg:gap-0 py-8 lg:py-12 bg-white/40 backdrop-blur-md border-white/60 shadow-2xl shadow-primary/5">
          {stats.map((s, i) => (
            <div 
              key={s.label} 
              className={`px-4 text-center group ${i < stats.length - 1 ? 'lg:border-r border-slate-100/60' : ''}`}
            >
              <div className="relative inline-block">
                <div className="font-hl font-black text-3xl md:text-5xl text-slate-900 tracking-tighter mb-2 transition-all group-hover:text-primary group-hover:scale-105">
                  {s.value}
                </div>
              </div>
              <div className="label-caps !text-slate-600 !text-[10px] tracking-[0.2em] font-bold">
                {s.label}
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
