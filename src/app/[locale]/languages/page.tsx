import type { Metadata } from 'next'
import { buildAlternates } from '@/lib/hreflang'
import { localizedHref } from '@/lib/localizedPaths'
import Link from 'next/link'
import Breadcrumbs from '@/components/layout/Breadcrumbs'

type Props = { params: Promise<{ locale: string }> }

const CONTENT = {
  fr: { title: 'Langues disponibles', description: 'NovaDuel est disponible en français, anglais et espagnol.', subtitle: 'Choisissez votre langue' },
  en: { title: 'Available Languages', description: 'NovaDuel is available in French, English and Spanish.', subtitle: 'Choose your language' },
  es: { title: 'Idiomas disponibles', description: 'NovaDuel está disponible en francés, inglés y español.', subtitle: 'Elige tu idioma' },
}

const LANGS = [
  { code: 'fr', label: 'Français', flag: '🇫🇷', native: 'Bienvenue sur NovaDuel' },
  { code: 'en', label: 'English',  flag: '🇬🇧', native: 'Welcome to NovaDuel' },
  { code: 'es', label: 'Español',  flag: '🇪🇸', native: 'Bienvenido a NovaDuel' },
]

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { locale } = await params
  const c = CONTENT[locale as keyof typeof CONTENT] ?? CONTENT.en
  return {
    title: c.title,
    description: c.description,
    alternates: buildAlternates('/languages', locale),
  }
}

export default async function LanguagesPage({ params }: Props) {
  const { locale } = await params
  const c = CONTENT[locale as keyof typeof CONTENT] ?? CONTENT.en

  return (
    <div className="bg-white min-h-screen">
      <div className="max-w-2xl mx-auto px-6 py-12 md:py-20">
        <Breadcrumbs locale={locale} items={[{ label: 'NovaDuel', href: '/' }, { label: c.title }]} />
        <header className="mt-8 mb-12">
          <h1 className="font-hl font-black text-4xl md:text-5xl text-slate-900 tracking-tighter uppercase mb-4">{c.title}</h1>
          <p className="text-lg text-slate-500 font-medium">{c.subtitle}</p>
        </header>
        <div className="space-y-3">
          {LANGS.map((lang) => (
            <Link
              key={lang.code}
              href={`/${lang.code}`}
              className={`flex items-center justify-between p-5 rounded-2xl border-2 transition-all no-underline group ${
                locale === lang.code
                  ? 'border-primary bg-primary/5'
                  : 'border-slate-100 hover:border-primary/30 hover:bg-slate-50'
              }`}
            >
              <div className="flex items-center gap-4">
                <span className="text-3xl">{lang.flag}</span>
                <div>
                  <div className="font-hl font-black text-slate-900 group-hover:text-primary transition-colors">{lang.label}</div>
                  <div className="text-xs text-slate-400 font-medium">{lang.native}</div>
                </div>
              </div>
              {locale === lang.code && (
                <span className="text-[10px] font-black text-primary uppercase tracking-widest bg-primary/10 px-3 py-1 rounded-full">✓ Actif</span>
              )}
            </Link>
          ))}
        </div>
      </div>
    </div>
  )
}
