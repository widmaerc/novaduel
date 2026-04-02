'use client';
import Link from 'next/link';
import { useParams } from 'next/navigation';
import { useTranslations } from 'next-intl';
import { useBreakpoint } from '@/lib/useBreakpoint';
import { useRef } from 'react';
import CompareSearchBar from '@/components/compare/CompareSearchBar';
import { localizedHref } from '@/lib/localizedPaths';

interface Trend { slug: string; labelA: string; labelB: string }

const CARDS = [
  { init: 'KM', avatar: 'RM', valKey: 'card1_label' as const, val: 'A+', vc: '#004782', bg: '#f0f4f8', mt: 52, hot: true, liveData: false },
  { init: 'EH', avatar: 'MC', valKey: 'card2_label' as const, val: '98.4', vc: '#374151', bg: '#f7f8fa', mt: 0, hot: false, liveData: true },
] as const;

export default function HeroSearch({ trends = [] }: { trends?: Trend[] }) {
  const t = useTranslations('HomePage.hero');
  const ts = useTranslations('HomePage.search');
  const params = useParams();
  const locale = (params?.locale as string) ?? 'fr';

  const titleLines = (ts('title') || '').split('\n');

  // ── 3D tilt refs ─────────────────────────────────────────────────────────────
  const cardRefs = useRef<(HTMLDivElement | null)[]>([]);

  function handleMouseMove(e: React.MouseEvent<HTMLElement>) {
    const rect = e.currentTarget.getBoundingClientRect();
    const relativeX = (e.clientX - rect.left) / rect.width - 0.5;
    const relativeY = (e.clientY - rect.top) / rect.height - 0.5;

    cardRefs.current.forEach((card, i) => {
      if (!card) return;
      const factor = (i + 1) * 25;
      const rotateX = relativeY * factor;
      const rotateY = -relativeX * factor;
      card.style.transition = 'transform 0.08s ease';
      card.style.transform = `perspective(1000px) rotateX(${rotateX}deg) rotateY(${rotateY}deg) scale3d(1.03,1.03,1.03)`;
    });
  }

  function handleMouseLeave() {
    cardRefs.current.forEach(card => {
      if (!card) return;
      card.style.transition = 'transform 0.55s cubic-bezier(.22,.61,.36,1)';
      card.style.transform = 'perspective(1000px) rotateX(0deg) rotateY(0deg) scale3d(1,1,1)';
    });
  }

  return (
    <section
      id="hero-section"
      className="hero-mesh relative z-20 pt-10 md:pt-16 2xl:pt-40 pb-24 px-6 md:px-12 border-b border-slate-100"
      onMouseMove={handleMouseMove}
      onMouseLeave={handleMouseLeave}
    >
      <div className="max-w-7xl mx-auto w-full grid grid-cols-1 lg:grid-cols-[1.3fr_0.7fr] gap-8 lg:gap-12 items-center">
        {/* Left column - Content */}
        <div className="z-10 space-y-4 md:space-y-6 lg:space-y-4 xl:space-y-6">
          <div className="inline-flex items-center gap-2 bg-primary/5 border border-primary/20 rounded-full px-4 py-2 shadow-sm w-fit">
            <span className="label-caps text-primary tracking-[0.2em] text-[9px]">{ts('badge')}</span>
          </div>

          <h1 className="font-hl font-black text-4xl md:text-6xl lg:text-[2.8rem] xl:text-[3.5rem] 2xl:text-[4.5rem] leading-[1.05] tracking-tighter text-slate-900 drop-shadow-sm">
            {titleLines.map((line, i) => (
              <span key={i} className={`block ${i === titleLines.length - 1 ? 'text-gradient' : ''}`}>{line}</span>
            ))}
          </h1>

          <div className="space-y-3 md:space-y-4 lg:space-y-3">
            <h2 className="label-caps tracking-[0.25em] opacity-60 uppercase whitespace-pre-line text-[10px] sm:text-[11px]">
              {ts('seo_h2')}
            </h2>
            <p className="text-slate-500 text-sm md:text-lg lg:text-base xl:text-lg leading-relaxed max-w-lg font-medium">
              {ts('subtitle')}
            </p>
          </div>

          <div className="pt-6 md:pt-8 lg:pt-6 max-w-3xl">
            <CompareSearchBar locale={locale} ctaLabel={ts('cta')} hideMode inlineButton isHero />
          </div>

          {trends.length > 0 && (
            <div className="pt-8 mt-2 lg:mt-0 lg:pt-6 space-y-4">
              <div className="label-caps !text-slate-400 !text-[9px] tracking-[0.2em]">
                {ts('trends')}
              </div>
              <div className="flex flex-wrap items-center gap-2 md:gap-x-4 gap-y-3">
                {trends.slice(0, 3).map(({ slug, labelA, labelB }) => (
                  <Link
                    key={slug}
                    href={localizedHref(locale, `/compare/${slug}`)}
                    className="group bg-white/80 backdrop-blur-md border border-slate-200 text-slate-600 px-6 py-2.5 rounded-full hover:border-primary hover:text-primary transition-all text-[11px] md:text-[13px] font-bold shadow-sm whitespace-nowrap flex items-center gap-2.5 hover:shadow-xl hover:-translate-y-1"
                  >
                    <span>{labelA}</span>
                    <span className="text-[9px] text-slate-300 group-hover:text-primary/40 font-black">VS</span>
                    <span>{labelB}</span>
                  </Link>
                ))}
              </div>
            </div>
          )}
        </div>

        {/* Right column */}
        <div className="relative hidden lg:block perspective-1000">
          <div className="relative grid grid-cols-2 gap-6">
            {/* Card 1 - HOT RM */}
            <div
              className="animate-float"
              style={{ marginTop: 52, animationDuration: '6s' }}
            >
              <div
                ref={el => { cardRefs.current[0] = el; }}
                className="glass-card p-5 flex flex-col justify-between transition-transform duration-300 max-w-[224px] mx-auto overflow-hidden bg-white/60 border-white/60"
                style={{ height: 390, willChange: 'transform', transformStyle: 'preserve-3d' }}
              >
                <div className="flex justify-between items-start z-10">
                  <div className="flex items-center gap-1.5 px-3 py-1.5 bg-red-600 text-white rounded-full text-[9px] font-black uppercase tracking-widest shadow-lg shadow-red-500/20">
                    <span className="w-1.5 h-1.5 rounded-full bg-white animate-pulse"></span>
                    {t('hot_badge')}
                  </div>
                  <div className="w-9 h-9 rounded-full bg-white shadow-md flex items-center justify-center font-black text-[11px] text-primary border border-slate-100">
                    RM
                  </div>
                </div>

                <div className="flex-1 flex items-center justify-center relative w-full h-full">
                  <div className="absolute inset-0 bg-[radial-gradient(circle_at_50%_70%,rgba(30,64,175,0.08),transparent_70%)]" />
                  <img
                    src="/images/fp1.png"
                    alt="Player KM"
                    className="absolute inset-x-0 bottom-0 w-full h-[88%] object-contain drop-shadow-2xl brightness-110"
                  />
                </div>

                <div className="bg-white/80 backdrop-blur-md p-4 rounded-2xl border border-white/60 shadow-sm z-10 translate-z-10 mt-2">
                  <div className="label-caps mb-1.5 opacity-60 text-[9px]">{t('card1_label')}</div>
                  <div className="font-hl font-black text-4xl text-primary tracking-tight">A+</div>
                </div>
              </div>
            </div>

            {/* Card 2 - LIVE DATA MC */}
            <div
              className="animate-float"
              style={{ animationDuration: '8s', animationDelay: '-3s' }}
            >
              <div
                ref={el => { cardRefs.current[1] = el; }}
                className="glass-card p-5 flex flex-col justify-between transition-transform duration-300 max-w-[224px] mx-auto overflow-hidden bg-white/60 border-white/60"
                style={{ height: 390, willChange: 'transform', transformStyle: 'preserve-3d' }}
              >
                <div className="flex justify-between items-start z-10">
                  <div className="flex items-center gap-1.5 px-4 py-1.5 ai-gradient rounded-full text-[9px] font-black uppercase tracking-widest shadow-lg shadow-primary/25">
                    <span className="w-1.5 h-1.5 rounded-full bg-white animate-pulse"></span>
                    {t('live_badge')}
                  </div>
                  <div className="w-9 h-9 rounded-full bg-white shadow-md flex items-center justify-center font-black text-[11px] text-primary border border-slate-100">
                    MC
                  </div>
                </div>

                <div className="flex-1 flex items-center justify-center relative w-full h-full">
                  <div className="absolute inset-0 bg-[radial-gradient(circle_at_50%_70%,rgba(59,130,246,0.08),transparent_70%)]" />
                  <img
                    src="/images/fp4.png"
                    alt="Player EH"
                    className="absolute inset-x-0 bottom-0 w-full h-[88%] object-contain drop-shadow-2xl brightness-110"
                  />
                </div>

                <div className="bg-white/80 backdrop-blur-md p-4 rounded-2xl border border-white/60 shadow-sm z-10 translate-z-10 mt-2">
                  <div className="label-caps mb-1.5 opacity-60 text-[9px]">{t('card2_label')}</div>
                  <div className="font-hl font-black text-4xl text-slate-900 tracking-tight">98.4</div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
