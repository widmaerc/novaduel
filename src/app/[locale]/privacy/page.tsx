import type { Metadata } from 'next';
import { getTranslations } from 'next-intl/server';
import { buildAlternates } from '@/lib/hreflang';
import Breadcrumbs from '@/components/layout/Breadcrumbs';

type Props = { params: Promise<{ locale: string }> };

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { locale } = await params;
  const descriptions: Record<string, string> = {
    fr: 'Politique de confidentialité de NovaDuel — protection de vos données personnelles et cookies.',
    en: 'NovaDuel Privacy Policy — how we protect your personal data and use cookies.',
    es: 'Política de privacidad de NovaDuel — protección de datos personales y cookies.',
  };
  const titles: Record<string, string> = {
    fr: 'Politique de Confidentialité',
    en: 'Privacy Policy',
    es: 'Política de Privacidad',
  };
  return {
    title: titles[locale] ?? titles.en,
    description: descriptions[locale] ?? descriptions.en,
    alternates: buildAlternates('/privacy', locale),
  };
}

export default async function PrivacyPage({ params }: { params: Promise<{ locale: string }> }) {
  const { locale } = await params;
  const t = await getTranslations('Common.footer');
  const tc = await getTranslations('Common');

  return (
    <div className="bg-white min-h-screen">
      <div className="max-w-4xl mx-auto px-6 py-12 md:py-20">
        <Breadcrumbs 
          items={[
            { label: tc('nav.home'), href: '/' },
            { label: t('privacy') }
          ]} 
          locale={locale} 
        />
        
        <header className="mt-8 mb-16">
          <h1 className="font-hl font-bold text-4xl md:text-5xl text-slate-900 tracking-tighter uppercase mb-6">
            {t('privacy')}
          </h1>
        </header>

        <section className="prose prose-slate max-w-none space-y-8">
          <div>
            <h2 className="text-sm font-black text-slate-900 uppercase tracking-widest mb-2 font-hl">Introduction</h2>
            <p className="text-slate-600">Nous attachons une importance capitale à la protection de vos données personnelles et à votre vie privée.</p>
          </div>
          <div>
            <h2 className="text-sm font-black text-slate-900 uppercase tracking-widest mb-2 font-hl">Collecte des Données</h2>
            <p className="text-slate-600 font-medium">NovaDuel ne collecte aucune information personnelle nominative (nom, adresse, email) sans votre consentement explicite (ex: inscription newsletter ou abonnement Pro).</p>
            <ul className="list-disc pl-5 mt-4 text-slate-500 text-sm space-y-2">
              <li>Données analytiques anonymisées (Google Analytics) pour améliorer l'expérience utilisateur.</li>
              <li>Données techniques (adresse IP, type de navigateur) collectées par nos outils de sécurisation.</li>
            </ul>
          </div>
          <div>
            <h2 className="text-sm font-black text-slate-900 uppercase tracking-widest mb-2 font-hl">Cookies</h2>
            <p className="text-slate-600">Le site utilise des cookies essentiels au bon fonctionnement (préférences de langue) et des cookies de mesure d'audience anonymes.</p>
          </div>
          <div>
            <h2 className="text-sm font-black text-slate-900 uppercase tracking-widest mb-2 font-hl">Vos Droits</h2>
            <p className="text-slate-600 font-medium italic">Conformément au RGPD, vous disposez d'un droit d'accès, de rectification et de suppression de vos données personnelles sur simple demande à l'équipe de NovaDuel.</p>
          </div>
        </section>
      </div>
    </div>
  );
}
