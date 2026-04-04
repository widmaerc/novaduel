import type { Metadata } from 'next'
import { buildAlternates } from '@/lib/hreflang'
import Breadcrumbs from '@/components/layout/Breadcrumbs'

type Props = { params: Promise<{ locale: string }> }

const CONTENT = {
  fr: { title: 'Contact', description: 'Contactez l\'équipe NovaDuel pour toute question.', intro: 'Une question, une suggestion ou un bug ? Écrivez-nous.', label: 'breadcrumb_home' },
  en: { title: 'Contact', description: 'Contact the NovaDuel team for any question.', intro: 'A question, a suggestion or a bug? Write to us.', label: 'breadcrumb_home' },
  es: { title: 'Contacto', description: 'Contacte al equipo NovaDuel para cualquier pregunta.', intro: '¿Una pregunta, sugerencia o error? Escríbenos.', label: 'breadcrumb_home' },
}

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { locale } = await params
  const c = CONTENT[locale as keyof typeof CONTENT] ?? CONTENT.en
  return {
    title: c.title,
    description: c.description,
    alternates: buildAlternates('/contact', locale),
  }
}

export default async function ContactPage({ params }: Props) {
  const { locale } = await params
  const c = CONTENT[locale as keyof typeof CONTENT] ?? CONTENT.en

  return (
    <div className="bg-white min-h-screen">
      <div className="max-w-2xl mx-auto px-6 py-12 md:py-20">
        <Breadcrumbs locale={locale} items={[{ label: 'NovaDuel', href: '/' }, { label: c.title }]} />
        <header className="mt-8 mb-12">
          <h1 className="font-hl font-black text-4xl md:text-5xl text-slate-900 tracking-tighter uppercase mb-4">{c.title}</h1>
          <p className="text-lg text-slate-500 font-medium">{c.intro}</p>
        </header>
        <div className="glass-card !p-8 space-y-5">
          <div>
            <label className="label-caps !text-slate-400 block mb-2">Email</label>
            <a href="mailto:contact@novaduel.com" className="text-primary font-bold hover:underline">contact@novaduel.com</a>
          </div>
          <div className="pt-4 border-t border-slate-100">
            <label className="label-caps !text-slate-400 block mb-2">Twitter / X</label>
            <a href="https://twitter.com/novaduel" target="_blank" rel="noopener noreferrer" className="text-primary font-bold hover:underline">@novaduel</a>
          </div>
        </div>
      </div>
    </div>
  )
}
