'use client';

import { useRouter, usePathname } from 'next/navigation';
import { useState, useRef, useEffect } from 'react';

const LOCALES = [
  { code: 'fr', label: 'Français', short: 'FR' },
  { code: 'en', label: 'English',  short: 'EN' },
  { code: 'es', label: 'Español',  short: 'ES' },
];

export function LangSwitcher({ locale }: { locale: string }) {
  const router = useRouter();
  const pathname = usePathname();
  const [isOpen, setIsOpen] = useState(false);
  const containerRef = useRef<HTMLDivElement>(null);

  const currentLocale = LOCALES.find(l => l.code === locale) || LOCALES[0];

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (containerRef.current && !containerRef.current.contains(event.target as Node)) {
        setIsOpen(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const switchTo = (targetLocale: string) => {
    const newPath = pathname.replace(`/${locale}`, `/${targetLocale}`);
    router.push(newPath);
    setIsOpen(false);
  };

  return (
    <div ref={containerRef} className="relative select-none">
      {/* Trigger Button */}
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="flex items-center gap-2 px-3 py-1.5 rounded-full bg-gray-100 hover:bg-gray-200 transition-all border-none cursor-pointer outline-none"
      >
        <span className="text-[12px] font-bold text-dark font-inter">{currentLocale.short}</span>
        <span className={`material-symbols-outlined text-[14px] transition-transform ${isOpen ? 'rotate-180' : ''}`} style={{ fontSize: '14px', color: '#727782' }}>
          expand_more
        </span>
      </button>

      {/* Dropdown Menu */}
      {isOpen && (
        <div className="absolute right-0 mt-2 w-32 py-1 rounded-xl border border-gray-100 shadow-xl overflow-hidden z-[100]"
          style={{
            background: 'rgba(255, 255, 255, 0.9)',
            backdropFilter: 'blur(10px)',
            WebkitBackdropFilter: 'blur(10px)',
          }}
        >
          {LOCALES.map((l) => (
            <button
              key={l.code}
              onClick={() => switchTo(l.code)}
              className={`w-full text-left px-3 py-1.5 text-[13px] font-medium border-none cursor-pointer flex items-center justify-between transition-colors ${
                l.code === locale ? 'text-primary bg-primary/5 font-bold' : 'text-dark hover:bg-gray-50'
              }`}
              style={{ background: 'transparent' }}
            >
              {l.label}
              {l.code === locale && <span className="w-1.5 h-1.5 rounded-full bg-primary" />}
            </button>
          ))}
        </div>
      )}
    </div>
  );
}
