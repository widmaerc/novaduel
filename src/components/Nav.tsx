'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { useTranslations } from 'next-intl';
import { useState } from 'react';
import { LangSwitcher } from './LangSwitcher';
import { localizedHref } from '@/lib/localizedPaths';

interface NavProps {
  locale: string;
}

export function Nav({ locale }: NavProps) {
  const t = useTranslations('Common.nav');
  const tb = useTranslations('Common.buttons');
  const pathname = usePathname();
  const [menuOpen, setMenuOpen] = useState(false);

  const links = [
    { href: `/${locale}`, label: t('home') },
    { href: localizedHref(locale, '/compare'), label: t('compare') },
    { href: localizedHref(locale, '/players'), label: t('players') },
  ];

  const isActive = (href: string) =>
    href === `/${locale}` ? pathname === href : pathname.startsWith(href);

  return (
    <section id="nav-wrapper" className="sticky top-0 z-50">
      <nav className="bg-white/80 backdrop-blur-xl border-b border-gray-100 py-3 px-4 sm:px-6 lg:px-8 flex items-center justify-between shadow-sm">
        <div style={{ width: '100%', maxWidth: 1280, margin: '0 auto', display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: '12px' }}>

          <div className="flex items-center gap-4 lg:gap-10">
            {/* Logo */}
            <Link href={`/${locale}`}
              className="group font-hl font-black text-xl sm:text-2xl tracking-tighter text-primary uppercase select-none flex-shrink-0 transition-transform active:scale-95"
              style={{ textDecoration: 'none' }}
            >
              Nova<span className="text-secondary group-hover:text-primary transition-colors">Duel</span>
            </Link>

            {/* Desktop: nav links (hidden on mobile) */}
            <div className="hidden md:flex items-center gap-1 lg:gap-2 font-hl font-semibold text-sm">
              {links.map((link) => (
                <Link key={link.href} href={link.href}
                  className={`relative px-4 py-2 rounded-xl transition-all duration-300 whitespace-nowrap group ${
                    isActive(link.href) 
                      ? 'text-primary bg-primary/5' 
                      : 'text-[#4b5563] hover:text-primary hover:bg-gray-50'
                  }`}
                  style={{ textDecoration: 'none' }}
                >
                  {link.label}
                  {/* Premium hover indicator */}
                  <span className={`absolute bottom-1.5 left-1/2 -translate-x-1/2 w-1 h-1 rounded-full bg-primary transition-all duration-300 ${
                    isActive(link.href) ? 'opacity-100 scale-100' : 'opacity-0 scale-0 group-hover:opacity-100 group-hover:scale-100'
                  }`} />
                </Link>
              ))}
              
              <a href="#" className="relative px-4 py-2 rounded-xl text-[#4b5563] flex items-center gap-1.5 hover:text-primary hover:bg-gray-50 transition-all duration-300 whitespace-nowrap group"
                style={{ textDecoration: 'none' }}
              >
                {t('ai')}
                <span className="bg-primary/10 text-primary text-[9px] px-1.5 py-0.5 rounded font-extrabold uppercase tracking-widest border border-primary/10 group-hover:bg-primary group-hover:text-white transition-colors duration-300">
                  {t('ai_badge')}
                </span>
              </a>
            </div>
          </div>

          {/* Desktop & Mobile Actions */}
          <div className="flex items-center gap-3 lg:gap-5">
            <div className="hidden md:block flex-shrink-0">
              <LangSwitcher locale={locale} />
            </div>

            <button className="hidden md:block bg-primary text-white font-hl font-bold px-4 lg:px-6 py-2.5 rounded-xl text-sm hover:bg-primary-c transition-all shadow-lg shadow-primary/20 flex-shrink-0">
              {tb('subscribe')}
            </button>

            {/* Mobile: lang + hamburger */}
            <div className="flex md:hidden items-center gap-4">
              <LangSwitcher locale={locale} />
              <button
                onClick={() => setMenuOpen(!menuOpen)}
                aria-label="Menu"
                className="flex flex-col gap-1 justify-center p-2"
              >
                <span className={`block w-5 h-0.5 bg-dark rounded transition-transform ${menuOpen ? 'translate-y-1.5 rotate-45' : ''}`} />
                <span className={`block w-5 h-0.5 bg-dark rounded transition-opacity ${menuOpen ? 'opacity-0' : 'opacity-100'}`} />
                <span className={`block w-5 h-0.5 bg-dark rounded transition-transform ${menuOpen ? '-translate-y-1.5 -rotate-45' : ''}`} />
              </button>
            </div>
          </div>

        </div>
      </nav>

      {/* Mobile dropdown menu */}
      {menuOpen && (
        <div className="animate-in fade-in slide-in-from-top-4 duration-300 md:hidden sticky top-[57px] z-40 bg-white/95 backdrop-blur-2xl border-b border-gray-100 shadow-xl overflow-hidden"
        >
          {/* Mobile nav links */}
          <div className="py-2">
            {links.map((link) => (
              <Link key={link.href} href={link.href}
                onClick={() => setMenuOpen(false)}
                className={`flex items-center justify-between px-5 py-3.5 font-hl text-[15px] transition-all ${
                  isActive(link.href) 
                    ? 'text-primary font-bold bg-primary/5 border-l-4 border-primary' 
                    : 'text-gray-600 font-semibold border-l-4 border-transparent'
                }`}
                style={{ textDecoration: 'none' }}
              >
                {link.label}
                {isActive(link.href) && <span className="text-[10px] text-blue-400">●</span>}
              </Link>
            ))}
            <a href="#"
              onClick={() => setMenuOpen(false)}
              className="flex items-center gap-2 px-5 py-3.5 font-hl font-semibold text-[15px] text-gray-600 border-l-4 border-transparent"
              style={{ textDecoration: 'none' }}
            >
              {t('ai')}
              <span className="bg-primary/10 text-primary text-[9px] font-black px-2 py-0.5 rounded-full uppercase tracking-widest border border-primary/10">
                {t('ai_badge')}
              </span>
            </a>
          </div>
        </div>
      )}
    </section>
  );
}
