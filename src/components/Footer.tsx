import { getTranslations } from 'next-intl/server';
import Link from 'next/link';

export async function Footer() {
  const t = await getTranslations('Common.footer');

  return (
    <footer className="w-full bg-white pt-24 pb-12 border-t border-gray-100 mt-20">
      <div className="max-w-7xl mx-auto px-6 md:px-12">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-12 lg:gap-8 mb-20">
          {/* Logo & Info */}
          <div className="lg:col-span-5 space-y-6">
            <div className="font-hl font-black text-2xl text-[#004782] tracking-tighter uppercase">NOVADUEL</div>
            <p className="text-[10px] text-gray-400 font-bold uppercase tracking-[0.2em] leading-relaxed max-w-xs transition-opacity hover:opacity-100 opacity-80">
              {t('tagline')} {t('tagline2')}
            </p>
          </div>

          {/* Links Grid */}
          <div className="lg:col-span-7 grid grid-cols-1 sm:grid-cols-3 gap-12 lg:gap-8">
            <div className="flex flex-col gap-6">
              <h5 className="text-[11px] font-black text-dark uppercase tracking-[0.3em]">{t('explore')}</h5>
              <ul className="flex flex-col gap-4">
                <FooterLink href="#">{t('api')}</FooterLink>
                <FooterLink href="#">{t('partners')}</FooterLink>
              </ul>
            </div>

            <div className="flex flex-col gap-6">
              <h5 className="text-[11px] font-black text-dark uppercase tracking-[0.3em]">{t('legal')}</h5>
              <ul className="flex flex-col gap-4">
                <FooterLink href="#">{t('privacy')}</FooterLink>
                <FooterLink href="#">{t('terms')}</FooterLink>
              </ul>
            </div>

            <div className="flex flex-col gap-6">
              <h5 className="text-[11px] font-black text-dark uppercase tracking-[0.3em]">{t('support')}</h5>
              <ul className="flex flex-col gap-4">
                <FooterLink href="#">{t('languages')}</FooterLink>
                <FooterLink href="#">{t('support_center')}</FooterLink>
              </ul>
            </div>
          </div>
        </div>

        {/* Bottom Bar */}
        <div className="pt-8 border-t border-gray-50 flex flex-col md:flex-row justify-between items-center gap-6">
          <p className="text-[9px] font-bold text-gray-400 uppercase tracking-[0.2em]">
            {t('copyright')}
          </p>
          <div className="flex gap-8 text-[9px] font-black text-gray-300 uppercase tracking-[0.3em]">
            <a href="#" className="hover:text-primary transition-colors">TWITTER</a>
            <a href="#" className="hover:text-primary transition-colors">LINKEDIN</a>
            <a href="#" className="hover:text-primary transition-colors">YOUTUBE</a>
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
        className="text-[10px] font-bold text-gray-400 uppercase tracking-[0.15em] hover:text-[#004782] transition-colors"
      >
        {children}
      </Link>
    </li>
  );
}

