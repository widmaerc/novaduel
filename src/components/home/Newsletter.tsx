'use client';
import { useState } from 'react';
import { useTranslations } from 'next-intl';

export default function Newsletter() {
  const t = useTranslations('HomePage.newsletter');
  const [email, setEmail] = useState('');
  const [sent, setSent] = useState(false);

  return (
    <section className="bg-[#004782] py-24 md:py-32 px-6 relative overflow-hidden">
      {/* Background Watermark */}
      <div className="absolute top-1/2 right-[-10%] -translate-y-1/2 font-hl font-black text-[15rem] md:text-[25rem] text-white/[0.03] select-none pointer-events-none hidden lg:block leading-none">
        DUEL
      </div>

      <div className="max-w-4xl mx-auto relative z-10 flex flex-col items-center text-center">
        <h2 className="font-hl font-black text-4xl md:text-5xl lg:text-6xl text-white mb-6 leading-tight tracking-tight w-full text-center uppercase">
          {t('title')}
        </h2>
        <p className="text-white/70 text-sm md:text-lg max-w-3xl mb-12 font-medium leading-relaxed text-center w-full block">
          {t('subtitle')}
        </p>

        {sent ? (
          <div className="bg-white/10 backdrop-blur-md rounded-2xl p-8 border border-white/10 text-center text-white font-hl font-bold text-lg shadow-sm w-full">
            {t('success')}
          </div>
        ) : (
          <form onSubmit={(e) => { e.preventDefault(); setSent(true); }} className="flex flex-col md:flex-row items-center justify-center gap-4 w-full max-w-2xl">
            <div className="w-full relative group">
              <input
                type="email"
                required
                value={email}
                onChange={e => setEmail(e.target.value)}
                placeholder={t('placeholder')}
                className="w-full bg-blue-900/30 border border-white/10 rounded-xl px-6 py-5 text-white placeholder-white/40 focus:outline-none focus:border-white/30 transition-all font-sans font-medium text-lg"
              />
            </div>
            <button
              type="submit"
              className="w-full md:w-auto bg-white text-[#004782] font-hl font-black px-10 py-5 rounded-xl hover:bg-blue-50 transition-all text-xs uppercase tracking-[0.2em] whitespace-nowrap shadow-xl shadow-black/10 active:scale-95"
            >
              {t('cta')}
            </button>
          </form>
        )}
      </div>
    </section>
  );
}

