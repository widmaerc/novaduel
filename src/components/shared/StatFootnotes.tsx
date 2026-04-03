import { getTranslations } from 'next-intl/server';

interface StatFootnotesProps {
  locale: string;
}

export default async function StatFootnotes({ locale }: StatFootnotesProps) {
  const tc = await getTranslations({ locale, namespace: 'Common.footnotes' });

  const items = [
    { id: 1, label: 'rating', def: tc('rating') },
    { id: 2, label: 'xg', def: tc('xg') },
    { id: 3, label: 'goals', def: tc('goals') },
    { id: 4, label: 'assists', def: tc('assists') },
    { id: 5, label: 'passes', def: tc('passes') },
    { id: 6, label: 'duels', def: tc('duels') },
    { id: 7, label: 'dribbles', def: tc('dribbles') },
    { id: 8, label: 'ai_insight', def: tc('ai_insight') },
  ];

  return (
    <section className="max-w-[1280px] mx-auto px-4 lg:px-6 py-12 md:py-16 border-t border-slate-100 mt-8 mb-12">
      <div className="flex flex-col gap-6">
        <div className="flex items-center gap-3 mb-2">
          <div className="w-8 h-8 rounded-lg bg-blue-50 flex items-center justify-center text-primary">
            <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
            </svg>
          </div>
          <h3 className="font-hl font-bold text-sm tracking-widest text-slate-400 uppercase">
             {tc('title')}
          </h3>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-x-12 gap-y-6">
          {items.map((item) => (
            <div key={item.id} id={`foot-${item.id}`} className="group scroll-mt-24">
              <div className="flex gap-4">
                <span className="shrink-0 font-hl font-black text-blue-600 text-sm opacity-40 group-hover:opacity-100 transition-opacity">
                   {item.id}.
                </span>
                <p className="text-[13px] leading-relaxed text-slate-500 font-medium">
                   <strong className="text-slate-900 uppercase tracking-wide mr-1.5">{item.def.split(':')[0]}:</strong>
                   {item.def.split(':').slice(1).join(':').trim()}
                </p>
              </div>
            </div>
          ))}
        </div>

        <div className="mt-8 p-6 bg-slate-50/50 rounded-2xl border border-slate-100">
           <p className="text-[11px] text-slate-400 leading-relaxed font-semibold uppercase tracking-wider text-center">
             {tc('disclaimer')}
           </p>
        </div>
      </div>
    </section>
  );
}
