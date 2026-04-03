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
  const fmtLeagues = (n: number) => n > 0 ? `${n}` : '9';

  const tc = useTranslations('Common.labels');
  const stats = [
    { value: fmt(playersCount),      label: tc('total_players') },
    { value: fmtLeagues(leaguesCount), label: tc('scouting_base') },
    { value: '3',                    label: t('updates') },
    { value: '100%',                 label: t('accuracy') },
  ];

  return (
    <div className="bg-[#004782] py-20 px-6 relative overflow-hidden group">
      {/* Background Watermark like Newsletter/Promo */}
      <div className="absolute top-1/2 left-[-5%] -translate-y-1/2 font-hl font-black text-[12rem] md:text-[20rem] text-white/[0.04] select-none pointer-events-none hidden lg:block leading-none transition-transform duration-700 group-hover:scale-110">
        DATA
      </div>

      <div className="max-w-[1280px] mx-auto relative z-10">
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-12 lg:gap-0">
          {stats.map((s, i) => (
            <div 
              key={s.label} 
              className={`px-4 text-center group/stat ${i < stats.length - 1 ? 'lg:border-r border-white/10' : ''}`}
            >
              <div className="relative inline-block mb-3">
                <div className="font-hl font-black text-4xl md:text-6xl text-white tracking-tighter transition-all group-hover/stat:scale-110">
                  {s.value}
                </div>
              </div>
              <div className="label-caps !text-white/60 !text-[10px] md:!text-[11px] tracking-[0.25em] font-bold uppercase">
                {s.label}
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
