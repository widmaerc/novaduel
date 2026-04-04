import type { Metadata } from 'next';
import { buildAlternates } from '@/lib/hreflang';
import Breadcrumbs from '@/components/layout/Breadcrumbs';

type Props = { params: Promise<{ locale: string }> };

const CONTENT = {
  fr: {
    title: 'Mentions Légales',
    description: 'Mentions légales de NovaDuel — éditeur, hébergement, propriété intellectuelle et données sportives.',
    sections: [
      {
        heading: 'Éditeur du site',
        body: "NovaDuel Analytics Platform. Plateforme technologique dédiée à l'analyse de données sportives.",
      },
      {
        heading: 'Propriété Intellectuelle',
        body: "La structure générale ainsi que les logiciels, textes, images animées ou non, son savoir-faire et tous les autres éléments composant le site sont la propriété exclusive de NovaDuel. Toute reproduction ou représentation totale ou partielle de ce site par quelque procédé que ce soit, sans l'autorisation expresse de l'éditeur, est interdite.",
      },
      {
        heading: 'Hébergement',
        body: 'Le site NovaDuel est hébergé par Vercel Inc. (San Francisco, USA).',
      },
      {
        heading: 'Données de Football',
        body: "Les données statistiques sont fournies par API-Football. Tous les noms de joueurs, de clubs et de ligues sont la propriété de leurs détenteurs respectifs et sont utilisés ici à des fins purement analytiques et informatives.",
      },
    ],
  },
  en: {
    title: 'Legal Notice',
    description: 'NovaDuel legal notice — publisher, hosting, intellectual property and sports data.',
    sections: [
      {
        heading: 'Website Publisher',
        body: 'NovaDuel Analytics Platform. A technology platform dedicated to sports data analysis.',
      },
      {
        heading: 'Intellectual Property',
        body: 'The general structure as well as the software, texts, animated or non-animated images, know-how and all other elements composing the site are the exclusive property of NovaDuel. Any total or partial reproduction of this site by any means whatsoever, without the express authorization of the publisher, is prohibited.',
      },
      {
        heading: 'Hosting',
        body: 'The NovaDuel website is hosted by Vercel Inc. (San Francisco, USA).',
      },
      {
        heading: 'Football Data',
        body: 'Statistical data is provided by API-Football. All player, club and league names are the property of their respective holders and are used here for purely analytical and informational purposes.',
      },
    ],
  },
  es: {
    title: 'Aviso Legal',
    description: 'Aviso legal de NovaDuel — editor, alojamiento, propiedad intelectual y datos deportivos.',
    sections: [
      {
        heading: 'Editor del sitio',
        body: 'NovaDuel Analytics Platform. Plataforma tecnológica dedicada al análisis de datos deportivos.',
      },
      {
        heading: 'Propiedad Intelectual',
        body: 'La estructura general así como el software, textos, imágenes animadas o no, su know-how y todos los demás elementos que componen el sitio son propiedad exclusiva de NovaDuel. Cualquier reproducción total o parcial de este sitio por cualquier medio, sin la autorización expresa del editor, está prohibida.',
      },
      {
        heading: 'Alojamiento',
        body: 'El sitio web NovaDuel está alojado por Vercel Inc. (San Francisco, EE.UU.).',
      },
      {
        heading: 'Datos de Fútbol',
        body: 'Los datos estadísticos son proporcionados por API-Football. Todos los nombres de jugadores, clubes y ligas son propiedad de sus respectivos titulares y se utilizan aquí con fines puramente analíticos e informativos.',
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
    alternates: buildAlternates('/legal', locale),
  };
}

export default async function LegalPage({ params }: Props) {
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
            </div>
          ))}
        </section>
      </div>
    </div>
  );
}
