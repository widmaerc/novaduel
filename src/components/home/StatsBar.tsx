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
    <div className="bg-white border-y border-slate-100 py-8 md:py-12 relative overflow-hidden">
      <div className="absolute inset-0 bg-[radial-gradient(circle_at_50%_100%,rgba(30,64,175,0.03),transparent_70%)] pointer-events-none" />
      <div className="max-w-[1280px] mx-auto px-6 md:px-12 relative">
        <div className="glass-card grid grid-cols-2 md:grid-cols-4 gap-6 md:gap-0 py-8 md:py-10">
          {stats.map((s, i) => (
            <div 
              key={s.label} 
              className={`px-4 text-center ${i < stats.length - 1 ? 'md:border-r border-slate-100' : ''}`}
            >
              <div className="font-hl font-black text-2xl md:text-4xl text-slate-900 tracking-tight mb-1">
                {s.value}
              </div>
              <div className="label-caps !text-slate-400">
                {s.label}
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
