import { getTranslations } from 'next-intl/server';
import Breadcrumbs from '@/components/layout/Breadcrumbs';

export default async function LegalPage({ params }: { params: Promise<{ locale: string }> }) {
  const { locale } = await params;
  const t = await getTranslations('Common.footer');
  const tc = await getTranslations('Common');

  return (
    <div className="bg-white min-h-screen">
      <div className="max-w-4xl mx-auto px-6 py-12 md:py-20">
        <Breadcrumbs 
          items={[
            { label: tc('nav.home'), href: '/' },
            { label: t('legal_mentions') }
          ]} 
          locale={locale} 
        />
        
        <header className="mt-8 mb-16">
          <h1 className="font-hl font-bold text-4xl md:text-5xl text-slate-900 tracking-tighter uppercase mb-6">
            {t('legal_mentions')}
          </h1>
        </header>

        <section className="prose prose-slate max-w-none space-y-8">
          <div>
            <h2 className="text-sm font-black text-slate-900 uppercase tracking-widest mb-2">Éditeur du site</h2>
            <p className="text-slate-600">NovaDuel Analytics Platform. Plateforme technologique dédiée à l'analyse de données sportives.</p>
          </div>
          <div>
            <h2 className="text-sm font-black text-slate-900 uppercase tracking-widest mb-2">Propriété Intellectuelle</h2>
            <p className="text-slate-600">La structure générale ainsi que les logiciels, textes, images animées ou non, son savoir-faire et tous les autres éléments composant le site sont la propriété exclusive de NovaDuel. Toute reproduction ou représentation totale ou partielle de ce site par quelque procédé que ce soit, sans l'autorisation expresse de l'éditeur, est interdite.</p>
          </div>
          <div>
            <h2 className="text-sm font-black text-slate-900 uppercase tracking-widest mb-2">Hébergement</h2>
            <p className="text-slate-600">Le site NovaDuel est hébergé par Vercel Inc. (San Francisco, USA).</p>
          </div>
          <div>
            <h2 className="text-sm font-black text-slate-900 uppercase tracking-widest mb-2">Données de Football</h2>
            <p className="text-slate-600">Les données statistiques sont fournies par API-Football. Tous les noms de joueurs, de clubs et de ligues sont la propriété de leurs détenteurs respectifs et sont utilisés ici à des fins purement analytiques et informatives.</p>
          </div>
        </section>
      </div>
    </div>
  );
}
