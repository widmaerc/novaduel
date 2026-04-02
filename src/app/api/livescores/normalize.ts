export interface LiveMatch {
  id: number;
  home: string;
  away: string;
  sh: number;
  sa: number;
  min: number;
  league: string;
  live: boolean;
  time: string;
}

// Statuts à exclure — matchs non joués
const EXCLUDED_STATUSES = new Set(['PST', 'CANC', 'SUSP', 'ABD', 'AWD', 'WO']);

// API-Football fixture status shorts that mean the match is live
const LIVE_STATUSES = new Set(['1H', 'HT', '2H', 'ET', 'BT', 'P', 'INT', 'LIVE']);

// eslint-disable-next-line @typescript-eslint/no-explicit-any
export function normalize(raw: any[]): LiveMatch[] {
  return raw
    .filter((m: any) => !EXCLUDED_STATUSES.has(m.fixture?.status?.short ?? ''))
    .map((m: any) => {
    const home = m.teams?.home?.name ?? '—';
    const away = m.teams?.away?.name ?? '—';
    const sh   = m.goals?.home ?? 0;
    const sa   = m.goals?.away ?? 0;
    const min  = m.fixture?.status?.elapsed ?? 0;
    const statusShort = m.fixture?.status?.short ?? '';
    const live = LIVE_STATUSES.has(statusShort);

    return {
      id:     m.fixture?.id ?? m.id,
      home,
      away,
      sh,
      sa,
      min,
      league: m.league?.name ?? '',
      live,
      time: live ? '' : (m.fixture?.date
        ? new Date(m.fixture.date).toLocaleTimeString('fr-FR', { hour: '2-digit', minute: '2-digit' })
        : ''),
    };
  });
}
