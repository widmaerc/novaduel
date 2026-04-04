import { getTranslations } from 'next-intl/server';
import { getLocale } from 'next-intl/server';
import Link from 'next/link';

export async function Footer() {
  const t = await getTranslations('Common.footer');
  const locale = await getLocale();

  return (
    <footer className="w-full bg-[#0a0f16] pt-24 pb-12 border-t border-white/5 mt-24">
      <div className="max-w-7xl mx-auto px-6 md:px-12">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-10 gap-12 lg:gap-16 mb-20">
          {/* Brand Column */}
          <div className="lg:col-span-3 space-y-8">
            <div className="flex flex-col gap-4">
              <div className="font-hl font-black text-3xl text-white tracking-tighter uppercase leading-none">
                NOVADUEL
              </div>
              <div className="h-1 w-12 bg-primary/40 rounded-full" />
            </div>
            
            <div className="space-y-4">
              <p className="text-[11px] text-slate-400 font-bold uppercase tracking-[0.2em] leading-relaxed max-w-[240px]">
                {t('tagline')} <span className="text-slate-500">{t('tagline2')}</span>
              </p>
              <div className="pt-2">
                <p className="text-[10px] text-slate-500 font-medium leading-relaxed max-w-[260px] italic">
                  {t('api_disclosure')}
                </p>
              </div>
            </div>
          </div>

          {/* Links Grid */}
          <div className="lg:col-span-7 grid grid-cols-2 sm:grid-cols-4 gap-12">
            {/* Leagues */}
            <div className="flex flex-col gap-6">
              <h5 className="text-[11px] font-black text-white uppercase tracking-[0.25em] flex items-center gap-2">
                <span className="w-1.5 h-1.5 bg-primary rounded-full shadow-[0_0_8px_rgba(0,111,238,0.6)]" />
                {t('explore')}
              </h5>
              <ul className="flex flex-col gap-4">
                <FooterLink href={`/${locale}/leagues/39`}>{t('leagues.premier_league')}</FooterLink>
                <FooterLink href={`/${locale}/leagues/61`}>{t('leagues.ligue_1')}</FooterLink>
                <FooterLink href={`/${locale}/leagues/140`}>{t('leagues.la_liga')}</FooterLink>
                <FooterLink href={`/${locale}/leagues/135`}>{t('leagues.serie_a')}</FooterLink>
                <FooterLink href={`/${locale}/leagues/78`}>{t('leagues.bundesliga')}</FooterLink>
              </ul>
            </div>

            {/* Platform */}
            <div className="flex flex-col gap-6">
              <h5 className="text-[11px] font-black text-white uppercase tracking-[0.25em]">{t('platform')}</h5>
              <ul className="flex flex-col gap-4">
                <FooterLink href={`/${locale}/about`}>{t('about')}</FooterLink>
                <FooterLink href={`/${locale}/methodology`}>{t('methodology')}</FooterLink>
                <FooterLink href={`/${locale}/contact`}>{t('contact')}</FooterLink>
              </ul>
            </div>

            {/* Legal */}
            <div className="flex flex-col gap-6">
              <h5 className="text-[11px] font-black text-white uppercase tracking-[0.25em]">{t('legal')}</h5>
              <ul className="flex flex-col gap-4">
                <FooterLink href={`/${locale}/legal`}>{t('legal_mentions')}</FooterLink>
                <FooterLink href={`/${locale}/privacy`}>{t('privacy')}</FooterLink>
                <FooterLink href={`/${locale}/terms`}>{t('terms')}</FooterLink>
              </ul>
            </div>

            {/* Support */}
            <div className="flex flex-col gap-6">
              <h5 className="text-[11px] font-black text-white uppercase tracking-[0.25em]">{t('support')}</h5>
              <ul className="flex flex-col gap-4">
                <FooterLink href={`/${locale}/support`}>{t('support_center')}</FooterLink>
                <FooterLink href={`/${locale}/languages`}>{t('languages')}</FooterLink>
              </ul>
            </div>
          </div>
        </div>

        {/* Bottom Bar */}
        <div className="pt-10 border-t border-white/5 flex flex-col md:flex-row justify-between items-center gap-8">
          <div className="flex flex-col gap-2 items-center md:items-start">
            <p className="text-[10px] font-bold text-slate-500 uppercase tracking-[0.2em]">
              {t('copyright')}
            </p>
            <div className="text-[8px] text-slate-600 font-medium tracking-[0.1em]">
              NovaDuel Elite Player Analytics Dashboard v2.0.4
            </div>
          </div>
          
          <div className="flex gap-10 text-[10px] font-black text-white uppercase tracking-[0.3em]">
            <a href="https://twitter.com/novaduel" target="_blank" rel="noopener noreferrer" className="hover:text-white transition-all duration-300 hover:tracking-[0.4em]">TWITTER</a>
            <a href="https://linkedin.com/company/novaduel" target="_blank" rel="noopener noreferrer" className="hover:text-white transition-all duration-300 hover:tracking-[0.4em]">LINKEDIN</a>
          </div>
        </div>
      </div>
    </footer>
  );
}

function FooterLink({ href, children }: { href: string; children: React.ReactNode }) {
  return (
    <li>
      <Link 
        href={href} 
        className="text-[10px] font-bold text-slate-500 uppercase tracking-[0.2em] hover:text-white transition-all duration-300 flex items-center group"
      >
        <span className="w-0 overflow-hidden group-hover:w-3 border-l-2 border-primary opacity-0 group-hover:opacity-100 transition-all duration-300 mr-2" />
        <span className="translate-x-0 group-hover:translate-x-1 transition-all duration-300">
          {children}
        </span>
      </Link>
    </li>
  );
}


