import { defineRouting } from 'next-intl/routing';

export const routing = defineRouting({
  locales: ['fr', 'en', 'es'],
  defaultLocale: 'en',
  localePrefix: 'always',
  localeDetection: false,
  pathnames: {
    '/': '/',
    '/players': {
      fr: '/joueurs',
      en: '/players',
      es: '/jugadores',
    },
    '/player/[slug]': {
      fr: '/joueur/[slug]',
      en: '/player/[slug]',
      es: '/jugador/[slug]',
    },
    '/compare': {
      fr: '/comparer',
      en: '/compare',
      es: '/comparar',
    },
    '/compare/[slug]': {
      fr: '/comparer/[slug]',
      en: '/compare/[slug]',
      es: '/comparar/[slug]',
    },
    '/leagues/[id]': '/leagues/[id]',
    '/about': '/about',
    '/methodology': '/methodology',
    '/legal': '/legal',
    '/privacy': '/privacy',
    '/contact': '/contact',
    '/terms': '/terms',
    '/support': '/support',
    '/languages': '/languages',
  },
});
