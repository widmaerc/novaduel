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
      className="relative z-20 pt-4 md:pt-6 2xl:pt-40 pb-20 px-6 md:px-12 bg-[#f8f9fa]"
      onMouseMove={handleMouseMove}
      onMouseLeave={handleMouseLeave}
    >
      {/* Background Decor - Subtle Premium Touch */}
      <div className="absolute inset-0 bg-[radial-gradient(circle_at_70%_30%,rgba(0,71,130,0.08),transparent)] pointer-events-none"></div>

      <div className="max-w-7xl mx-auto w-full grid grid-cols-1 lg:grid-cols-[1.3fr_0.7fr] gap-8 lg:gap-12 items-center">
        {/* Left column - Content */}
        <div className="z-10 space-y-4 md:space-y-6 lg:space-y-4 xl:space-y-6">
          <div className="inline-flex items-center gap-2 bg-[#eef6ff] border border-[#d6e9ff] rounded-full px-4 py-2 shadow-sm w-fit">
            <span className="text-[10px] font-black uppercase tracking-[0.2em] text-[#004782]">{ts('badge')}</span>
          </div>

          <h1 className="font-hl font-black text-4xl md:text-6xl lg:text-[2.6rem] xl:text-[3.2rem] 2xl:text-[4.2rem] leading-[1.05] tracking-tighter text-[#004782]">
            {titleLines.map((line, i) => (
              <span key={i} className="block">{line}</span>
            ))}
          </h1>

          <div className="space-y-3 md:space-y-4 lg:space-y-3">
            <h2 className="font-hl font-bold text-xs md:text-sm xl:text-base text-[#004782] tracking-[0.2em] opacity-80 uppercase whitespace-pre-line">
              {ts('seo_h2')}
            </h2>
            <p className="text-[#727782] text-sm md:text-lg lg:text-base xl:text-lg leading-relaxed max-w-lg">
              {ts('subtitle')}
            </p>
          </div>

          <div className="pt-6 md:pt-8 lg:pt-6 max-w-3xl">
            <CompareSearchBar locale={locale} ctaLabel={ts('cta')} placeholder={ts('placeholder')} hideMode inlineButton isHero />
          </div>

          {trends.length > 0 && (
            <div className="pt-8 mt-2 lg:mt-0 lg:pt-6 space-y-3">
              <div className="text-[10px] font-black uppercase tracking-widest text-[#a0a6b2]">
                {ts('trends')}
              </div>
              <div className="flex flex-wrap items-center gap-2 md:gap-x-4 gap-y-3">
                {trends.slice(0, 3).map(({ slug, labelA, labelB }) => (
                  <Link
                    key={slug}
                    href={localizedHref(locale, `/compare/${slug}`)}
                    className="group bg-white border border-[#eef0f2] text-[#727782] px-5 py-2 rounded-full hover:border-primary hover:text-primary transition-all text-[11px] md:text-[13px] font-bold shadow-sm whitespace-nowrap flex items-center gap-2 hover:shadow-md hover:-translate-y-0.5"
                  >
                    <span>{labelA}</span>
                    <span className="text-[9px] text-gray-300 group-hover:text-primary/30">vs</span>
                    <span>{labelB}</span>
                  </Link>
                ))}
              </div>
            </div>
          )}
        </div>

        {/* Right column */}
        <div className="relative hidden lg:block perspective-1000">
          {/* Decor blob */}
          <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-full h-full bg-primary-glow rounded-full blur-[100px] pointer-events-none opacity-20"></div>

          <div className="relative grid grid-cols-2 gap-6">
            {/* Card 1 - HOT RM */}
            <div
              className="animate-float"
              style={{ marginTop: 52, animationDuration: '6s' }}
            >
              <div
                ref={el => { cardRefs.current[0] = el; }}
                className="bg-white p-5 rounded-[2.5rem] shadow-[0_20px_50px_rgba(0,40,100,0.08)] border border-[#eef0f2] flex flex-col justify-between transition-transform duration-300 max-w-[220px] mx-auto"
                style={{ height: 380, willChange: 'transform', transformStyle: 'preserve-3d' }}
              >
                <div className="flex justify-between items-start">
                  <div className="flex items-center gap-1.5 px-3 py-1.5 bg-red-50 border border-red-100 rounded-full text-[10px] font-black text-red-600 shadow-sm">
                    <span className="w-1.5 h-1.5 rounded-full bg-red-600"></span>
                    {t('hot_badge')}
                  </div>
                  <div className="w-9 h-9 rounded-full bg-white shadow-sm flex items-center justify-center font-black text-[11px] text-[#004782] border border-[#eef0f2]">
                    RM
                  </div>
                </div>

                <div className="flex-1 flex items-center justify-center relative overflow-hidden w-full h-full">
                  <img
                    src="/images/fp1.png"
                    alt="Player KM"
                    className="absolute inset-0 w-full h-full object-contain scale-110 translate-y-4"
                  />
                </div>

                <div className="bg-[#f8f9fa] p-4 rounded-3xl border border-[#eef0f2]">
                  <div className="text-[9px] font-black uppercase tracking-[0.2em] text-[#727782] mb-1">{t('card1_label')}</div>
                  <div className="font-hl font-black text-4xl text-[#004782]">A+</div>
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
                className="bg-white p-5 rounded-[2.5rem] shadow-[0_20px_50px_rgba(0,40,100,0.08)] border border-[#eef0f2] flex flex-col justify-between transition-transform duration-300 max-w-[220px] mx-auto"
                style={{ height: 380, willChange: 'transform', transformStyle: 'preserve-3d' }}
              >
                <div className="flex justify-between items-start">
                  <div className="flex items-center gap-1.5 px-3 py-1.5 bg-blue-50 border border-blue-100 rounded-full text-[10px] font-black text-[#004782] shadow-sm">
                    <span className="w-1.5 h-1.5 rounded-full bg-[#004782]"></span>
                    {t('live_badge')}
                  </div>
                  <div className="w-9 h-9 rounded-full bg-white shadow-sm flex items-center justify-center font-black text-[11px] text-[#004782] border border-[#eef0f2]">
                    MC
                  </div>
                </div>

                <div className="flex-1 flex items-center justify-center relative overflow-hidden w-full h-full">
                  <img
                    src="/images/fp4.png"
                    alt="Player EH"
                    className="absolute inset-0 w-full h-full object-contain scale-110 translate-y-4"
                  />
                </div>

                <div className="bg-[#f8f9fa] p-4 rounded-3xl border border-[#eef0f2]">
                  <div className="text-[9px] font-black uppercase tracking-[0.2em] text-[#727782] mb-1">{t('card2_label')}</div>
                  <div className="font-hl font-black text-4xl text-[#191c1d]">98.4</div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
