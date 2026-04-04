import type { Metadata } from 'next'
import { buildAlternates } from '@/lib/hreflang'
import Breadcrumbs from '@/components/layout/Breadcrumbs'

type Props = { params: Promise<{ locale: string }> }

const CONTENT = {
  fr: {
    title: "Conditions d'utilisation",
    description: "Conditions générales d'utilisation de NovaDuel.",
    sections: [
      { heading: 'Acceptation des conditions', body: 'En utilisant NovaDuel, vous acceptez les présentes conditions d\'utilisation. Si vous n\'acceptez pas ces conditions, veuillez ne pas utiliser le service.' },
      { heading: 'Description du service', body: 'NovaDuel est une plateforme de comparaison de joueurs de football proposant des statistiques avancées et des analyses générées par intelligence artificielle.' },
      { heading: 'Propriété intellectuelle', body: 'Les contenus générés par l\'IA (analyses, insights) sont la propriété de NovaDuel. Les données statistiques sont fournies par API-Football.' },
      { heading: 'Limitation de responsabilité', body: 'NovaDuel ne garantit pas l\'exactitude des données. Les statistiques sont fournies à titre indicatif uniquement.' },
    ],
  },
  en: {
    title: 'Terms of Service',
    description: 'NovaDuel Terms of Service.',
    sections: [
      { heading: 'Acceptance of Terms', body: 'By using NovaDuel, you agree to these Terms of Service. If you do not agree to these terms, please do not use the service.' },
      { heading: 'Service Description', body: 'NovaDuel is a football player comparison platform offering advanced statistics and AI-generated analyses.' },
      { heading: 'Intellectual Property', body: 'AI-generated content (analyses, insights) is the property of NovaDuel. Statistical data is provided by API-Football.' },
      { heading: 'Limitation of Liability', body: 'NovaDuel does not guarantee data accuracy. Statistics are provided for informational purposes only.' },
    ],
  },
  es: {
    title: 'Términos de Servicio',
    description: 'Términos de servicio de NovaDuel.',
    sections: [
      { heading: 'Aceptación de los términos', body: 'Al usar NovaDuel, acepta estos Términos de Servicio. Si no acepta estos términos, por favor no use el servicio.' },
      { heading: 'Descripción del servicio', body: 'NovaDuel es una plataforma de comparación de jugadores de fútbol que ofrece estadísticas avanzadas y análisis generados por IA.' },
      { heading: 'Propiedad intelectual', body: 'El contenido generado por IA (análisis, insights) es propiedad de NovaDuel. Los datos estadísticos son proporcionados por API-Football.' },
      { heading: 'Limitación de responsabilidad', body: 'NovaDuel no garantiza la exactitud de los datos. Las estadísticas se proporcionan solo con fines informativos.' },
    ],
  },
}

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { locale } = await params
  const c = CONTENT[locale as keyof typeof CONTENT] ?? CONTENT.en
  return {
    title: c.title,
    description: c.description,
    alternates: buildAlternates('/terms', locale),
  }
}

export default async function TermsPage({ params }: Props) {
  const { locale } = await params
  const c = CONTENT[locale as keyof typeof CONTENT] ?? CONTENT.en

  return (
    <div className="bg-white min-h-screen">
      <div className="max-w-3xl mx-auto px-6 py-12 md:py-20">
        <Breadcrumbs locale={locale} items={[{ label: 'NovaDuel', href: '/' }, { label: c.title }]} />
        <header className="mt-8 mb-12">
          <h1 className="font-hl font-black text-4xl md:text-5xl text-slate-900 tracking-tighter uppercase mb-4">{c.title}</h1>
          <p className="text-sm text-slate-400 font-medium">NovaDuel — {new Date().getFullYear()}</p>
        </header>
        <div className="space-y-10">
          {c.sections.map((s) => (
            <section key={s.heading}>
              <h2 className="font-hl font-bold text-lg text-slate-900 uppercase tracking-wider mb-3 border-l-4 border-primary pl-4">{s.heading}</h2>
              <p className="text-slate-600 leading-relaxed">{s.body}</p>
            </section>
          ))}
        </div>
      </div>
    </div>
  )
}
