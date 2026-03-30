import { localizedHref } from './localizedPaths';

const BASE_URL = process.env.NEXT_PUBLIC_APP_URL ?? 'https://novaduel.com';
const LOCALES = ['fr', 'en', 'es'] as const;

/**
 * Returns the `alternates` metadata object for hreflang SEO.
 * Pass a path WITHOUT locale prefix, e.g. '' for homepage, '/compare/messi-vs-ronaldo' for a compare page.
 * Automatically localizes paths like /players → /joueurs (fr), /jugadores (es).
 */
export function buildAlternates(path: string = '') {
  const languages: Record<string, string> = {};

  for (const loc of LOCALES) {
    const locPath = path ? localizedHref(loc, path) : `/${loc}`;
    languages[loc] = `${BASE_URL}${locPath}`;
  }
  // x-default points to the English version (international fallback)
  languages['x-default'] = languages['en'];

  return { canonical: languages['en'], languages };
}
