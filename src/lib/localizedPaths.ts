/**
 * Maps internal paths to their localized external URLs.
 * Keep in sync with src/routing.ts pathnames.
 */
const LOCALIZED_SEGMENTS: Record<string, Record<string, string>> = {
  players: { fr: 'joueurs',  en: 'players', es: 'jugadores' },
  player:  { fr: 'joueur',   en: 'player',  es: 'jugador'   },
  compare: { fr: 'comparer', en: 'compare', es: 'comparar'  },
};

/**
 * Returns the full localized href for a given locale and internal path.
 * e.g. localizedHref('fr', '/players') → '/fr/joueurs'
 *      localizedHref('es', '/player/messi') → '/es/jugador/messi'
 */
export function localizedHref(locale: string, path: string): string {
  const segments = path.replace(/^\//, '').split('/');
  const mapped = segments.map((seg, i) =>
    i === 0 ? (LOCALIZED_SEGMENTS[seg]?.[locale] ?? seg) : seg
  );
  return `/${locale}/${mapped.join('/')}`;
}
