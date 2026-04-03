import { getTranslations } from 'next-intl/server';
import Breadcrumbs from '@/components/layout/Breadcrumbs';

export default async function MethodologyPage({ params }: { params: Promise<{ locale: string }> }) {
  const { locale } = await params;
  const t = await getTranslations('Methodology');
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
            {t('source_text')}
          </p>
        </header>

        <section className="space-y-12">
          <div className="prose prose-slate max-w-none">
            <h2 className="text-xl font-bold text-slate-900 uppercase tracking-wider mb-4 border-l-4 border-primary pl-4">
              {t('source')}
            </h2>
            <p className="text-slate-600 mb-8">
              Toutes les données affichées sur NovaDuel sont alimentées par **API-Football (RapidAPI)**, un fournisseur certifié de données sportives mondiales. Nous couvrons plus de 900 championnats et coupes internationaux, avec une mise à jour quotidienne des statistiques individuelles et collectives.
            </p>
          </div>

          <div className="bg-slate-50 p-10 rounded-3xl border border-slate-100">
            <h2 className="text-xl font-bold text-slate-900 uppercase tracking-wider mb-6">
              {t('metrics')}
            </h2>
            <p className="text-slate-600 mb-8 leading-relaxed">
              {t('metrics_text')}
            </p>
            
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div className="bg-white p-4 rounded-xl border border-slate-200">
                <span className="text-[10px] font-black text-primary uppercase tracking-[0.2em]">Impact</span>
                <p className="text-sm font-bold text-slate-800">Offensif & Créatif</p>
              </div>
              <div className="bg-white p-4 rounded-xl border border-slate-200">
                <span className="text-[10px] font-black text-primary uppercase tracking-[0.2em]">Fiabilité</span>
                <p className="text-sm font-bold text-slate-800">Défense & Duels</p>
              </div>
              <div className="bg-white p-4 rounded-xl border border-slate-200">
                <span className="text-[10px] font-black text-primary uppercase tracking-[0.2em]">Influence</span>
                <p className="text-sm font-bold text-slate-800">Passes & Progression</p>
              </div>
              <div className="bg-white p-4 rounded-xl border border-slate-200">
                <span className="text-[10px] font-black text-primary uppercase tracking-[0.2em]">Régularité</span>
                <p className="text-sm font-bold text-slate-800">Stabilité sur 5 ans</p>
              </div>
            </div>
          </div>
        </section>
      </div>
    </div>
  );
}
