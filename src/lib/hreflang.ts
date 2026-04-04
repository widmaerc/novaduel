import { localizedHref } from './localizedPaths';

const BASE_URL = process.env.NEXT_PUBLIC_APP_URL ?? 'https://novaduel.com';
const LOCALES = ['fr', 'en', 'es'] as const;

/**
 * Returns the `alternates` metadata object for hreflang SEO.
 * Pass a path WITHOUT locale prefix, e.g. '' for homepage, '/compare/messi-vs-ronaldo' for a compare page.
 * Pass currentLocale to set the canonical to the current page's own URL (recommended).
 * Automatically localizes paths like /players → /joueurs (fr), /jugadores (es).
 */
export function buildAlternates(path: string = '', currentLocale?: string) {
  const languages: Record<string, string> = {};

  for (const loc of LOCALES) {
    const locPath = path ? localizedHref(loc, path) : `/${loc}`;
    languages[loc] = `${BASE_URL}${locPath}`;
  }
  // x-default points to the English version (international fallback)
  languages['x-default'] = languages['en'];

  // Canonical points to the current locale's URL (self-referencing)
  const selfLocale = currentLocale ?? 'en';
  const selfPath = path ? localizedHref(selfLocale, path) : `/${selfLocale}`;
  const canonical = `${BASE_URL}${selfPath}`;

  return { canonical, languages };
}
