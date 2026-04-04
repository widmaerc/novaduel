import type { Metadata } from 'next';
import { buildAlternates } from '@/lib/hreflang';
import Breadcrumbs from '@/components/layout/Breadcrumbs';

type Props = { params: Promise<{ locale: string }> };

const CONTENT = {
  fr: {
    title: 'Politique de Confidentialité',
    description: 'Politique de confidentialité de NovaDuel — collecte des données, cookies et droits RGPD.',
    sections: [
      {
        heading: 'Introduction',
        body: 'Nous attachons une importance capitale à la protection de vos données personnelles et à votre vie privée.',
        items: [] as string[],
      },
      {
        heading: 'Collecte des Données',
        body: 'NovaDuel ne collecte aucune information personnelle nominative (nom, adresse, email) sans votre consentement explicite (ex : inscription newsletter ou abonnement Pro).',
        items: [
          "Données analytiques anonymisées (Google Analytics) pour améliorer l'expérience utilisateur.",
          'Données techniques (adresse IP, type de navigateur) collectées par nos outils de sécurisation.',
        ],
      },
      {
        heading: 'Cookies',
        body: "Le site utilise des cookies essentiels au bon fonctionnement (préférences de langue) et des cookies de mesure d'audience anonymes.",
        items: [],
      },
      {
        heading: 'Vos Droits',
        body: "Conformément au RGPD, vous disposez d'un droit d'accès, de rectification et de suppression de vos données personnelles sur simple demande à l'équipe de NovaDuel.",
        items: [],
      },
    ],
  },
  en: {
    title: 'Privacy Policy',
    description: 'NovaDuel privacy policy — data collection, cookies and GDPR rights.',
    sections: [
      {
        heading: 'Introduction',
        body: 'We attach the utmost importance to the protection of your personal data and your privacy.',
        items: [] as string[],
      },
      {
        heading: 'Data Collection',
        body: 'NovaDuel does not collect any personally identifiable information (name, address, email) without your explicit consent (e.g. newsletter subscription or Pro subscription).',
        items: [
          'Anonymized analytical data (Google Analytics) to improve the user experience.',
          'Technical data (IP address, browser type) collected by our security tools.',
        ],
      },
      {
        heading: 'Cookies',
        body: 'The site uses essential cookies for proper operation (language preferences) and anonymous audience measurement cookies.',
        items: [],
      },
      {
        heading: 'Your Rights',
        body: 'In accordance with GDPR, you have the right to access, rectify and delete your personal data upon simple request to the NovaDuel team.',
        items: [],
      },
    ],
  },
  es: {
    title: 'Política de Privacidad',
    description: 'Política de privacidad de NovaDuel — recopilación de datos, cookies y derechos RGPD.',
    sections: [
      {
        heading: 'Introducción',
        body: 'Otorgamos la máxima importancia a la protección de sus datos personales y su privacidad.',
        items: [] as string[],
      },
      {
        heading: 'Recopilación de Datos',
        body: 'NovaDuel no recopila ninguna información personal identificable (nombre, dirección, email) sin su consentimiento explícito (ej: suscripción al boletín o suscripción Pro).',
        items: [
          'Datos analíticos anonimizados (Google Analytics) para mejorar la experiencia del usuario.',
          'Datos técnicos (dirección IP, tipo de navegador) recopilados por nuestras herramientas de seguridad.',
        ],
      },
      {
        heading: 'Cookies',
        body: 'El sitio utiliza cookies esenciales para el correcto funcionamiento (preferencias de idioma) y cookies anónimas de medición de audiencia.',
        items: [],
      },
      {
        heading: 'Sus Derechos',
        body: 'De conformidad con el RGPD, tiene derecho a acceder, rectificar y eliminar sus datos personales mediante simple solicitud al equipo de NovaDuel.',
        items: [],
      },
    ],
  },
};

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { locale } = await params;
  const c = CONTENT[locale as keyof typeof CONTENT] ?? CONTENT.en;
  return {
    title: `${c.title} | NovaDuel`,
    description: c.description,
    alternates: buildAlternates('/privacy', locale),
  };
}

export default async function PrivacyPage({ params }: Props) {
  const { locale } = await params;
  const c = CONTENT[locale as keyof typeof CONTENT] ?? CONTENT.en;

  return (
    <div className="bg-white min-h-screen">
      <div className="max-w-4xl mx-auto px-6 py-12 md:py-20">
        <Breadcrumbs
          items={[{ label: 'NovaDuel', href: '/' }, { label: c.title }]}
          locale={locale}
        />
        <header className="mt-8 mb-16">
          <h1 className="font-hl font-bold text-4xl md:text-5xl text-slate-900 tracking-tighter uppercase mb-6">
            {c.title}
          </h1>
          <p className="text-sm text-slate-400 font-medium">NovaDuel — {new Date().getFullYear()}</p>
        </header>
        <section className="space-y-8">
          {c.sections.map((s) => (
            <div key={s.heading}>
              <h2 className="text-sm font-black text-slate-900 uppercase tracking-widest mb-2 border-l-4 border-primary pl-4">
                {s.heading}
              </h2>
              <p className="text-slate-600 leading-relaxed">{s.body}</p>
              {s.items.length > 0 && (
                <ul className="list-disc pl-5 mt-3 text-slate-500 text-sm space-y-2">
                  {s.items.map((item) => <li key={item}>{item}</li>)}
                </ul>
              )}
            </div>
          ))}
        </section>
      </div>
    </div>
  );
}
