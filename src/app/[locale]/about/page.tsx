import { getTranslations } from 'next-intl/server';
import Breadcrumbs from '@/components/layout/Breadcrumbs';

export default async function AboutPage({ params }: { params: Promise<{ locale: string }> }) {
  const { locale } = await params;
  const t = await getTranslations('About');
  const tc = await getTranslations('Common');

  return (
    <div className="bg-white min-h-screen">
      <div className="max-w-4xl mx-auto px-6 py-12 md:py-20">
        <Breadcrumbs 
          items={[
            { label: tc('nav.home'), href: '/' },
            { label: t('title') }
          ]} 
          locale={locale} 
        />
        
        <header className="mt-8 mb-16">
          <h1 className="font-hl font-bold text-4xl md:text-5xl text-slate-900 tracking-tighter uppercase mb-6">
            {t('title')}
          </h1>
          <p className="text-lg text-slate-600 leading-relaxed font-medium">
            {t('description')}
          </p>
        </header>

        <section className="space-y-12">
          <div className="prose prose-slate max-w-none">
            <h2 className="text-xl font-bold text-slate-900 uppercase tracking-wider mb-4 border-l-4 border-primary pl-4">
              {t('mission')}
            </h2>
            <p className="text-slate-600 mb-8">
              {t('mission_text')}
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-8 pt-8 border-t border-slate-100">
            <div className="bg-slate-50 p-8 rounded-2xl">
              <h3 className="font-bold text-slate-900 mb-2 uppercase tracking-tight">{t('values.data')}</h3>
              <p className="text-sm text-slate-500 leading-relaxed">{t('values.data_text')}</p>
            </div>
            <div className="bg-slate-50 p-8 rounded-2xl">
              <h3 className="font-bold text-slate-900 mb-2 uppercase tracking-tight">{t('values.ai')}</h3>
              <p className="text-sm text-slate-500 leading-relaxed">{t('values.ai_text')}</p>
            </div>
          </div>
        </section>
      </div>
    </div>
  );
}
