'use client';

import { useTranslations, useLocale } from 'next-intl';
import { Link } from '@/navigation';
import CompareSearchBar from '@/components/compare/CompareSearchBar';
import { motion } from 'framer-motion';

export default function NotFound() {
  const t = useTranslations('NotFound');
  const locale = useLocale();

  return (
    <div className="min-h-[70vh] flex flex-col items-center justify-center px-6 py-20 text-center relative">
      {/* Background Decor */}
      <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-full max-w-4xl h-full bg-[radial-gradient(circle_at_center,rgba(0,71,130,0.05),transparent_70%)] pointer-events-none -z-10" />
      
      <motion.div 
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
        className="space-y-8 max-w-2xl w-full"
      >
        {/* Big 404 with Ref-Style aesthetic */}
        <div className="relative inline-block">
          <h1 className="text-[120px] md:text-[180px] font-black leading-none tracking-tighter text-[#004782]/10 select-none">
            404
          </h1>
          <div className="absolute inset-0 flex items-center justify-center">
             <div className="w-16 h-24 bg-red-500 rounded-lg shadow-xl shadow-red-500/20 rotate-12 flex items-center justify-center border-4 border-white/20">
                <span className="material-symbols-outlined text-white text-4xl">error</span>
             </div>
          </div>
        </div>

        <div className="space-y-4">
          <h2 className="text-3xl md:text-4xl font-black text-[#004782] tracking-tight">
            {t('title')}
          </h2>
          <p className="text-[#727782] text-lg leading-relaxed">
            {t('description')}
          </p>
        </div>

        {/* Search Integration */}
        <div className="relative z-30 bg-white/50 backdrop-blur-md border border-white/20 p-6 md:p-8 rounded-[2rem] shadow-2xl shadow-[#004782]/5 max-w-3xl mx-auto">
          <p className="text-[10px] font-black uppercase tracking-widest text-[#a0a6b2] mb-6">
             {t('search_placeholder')}
          </p>
          <CompareSearchBar
            locale={locale}
            ctaLabel={t('search_button')}
            hideMode
            isHero={true}
            isNotFound={true}
          />
        </div>

        <div className="pt-4">
          <Link 
            href="/"
            className="inline-flex items-center gap-2 text-[#004782] font-black text-sm uppercase tracking-widest hover:gap-4 transition-all"
          >
            <span>{t('go_home')}</span>
            <span className="material-symbols-outlined text-sm">arrow_forward</span>
          </Link>
        </div>
      </motion.div>

      {/* Subtle floating elements to match the site design */}
      <motion.div 
        animate={{ 
          y: [0, -20, 0],
          rotate: [0, 5, 0]
        }}
        transition={{ 
          duration: 4,
          repeat: Infinity,
          ease: "easeInOut"
        }}
        className="absolute top-20 right-[10%] w-12 h-12 rounded-full bg-[#004782]/5 blur-xl hidden md:block"
      />
      <motion.div 
        animate={{ 
          y: [0, 20, 0],
          rotate: [0, -5, 0]
        }}
        transition={{ 
          duration: 5,
          repeat: Infinity,
          ease: "easeInOut",
          delay: 1
        }}
        className="absolute bottom-20 left-[10%] w-20 h-20 rounded-full bg-red-400/5 blur-2xl hidden md:block"
      />
    </div>
  );
}
