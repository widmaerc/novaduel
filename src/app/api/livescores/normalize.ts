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

// state_id values that mean the match is currently being played
// Ref: Sportmonks v3 states — 2=1st Half, 3=HT, 4=2nd Half, 5=ET, 6=ET HT, 7=Penalties, 10=Break
const LIVE_STATE_IDS = new Set([2, 3, 4, 5, 6, 7, 10]);

// eslint-disable-next-line @typescript-eslint/no-explicit-any
export function normalize(raw: any[]): LiveMatch[] {
  return raw.map((m: any) => {
    // "name" field = "Team A vs Team B" — confirmed from API docs, no include needed
    const [home = '—', away = '—'] = (m.name ?? '').split(' vs ');

    const scores: any[] = m.scores ?? [];
    const homeScore = scores.find((s: any) => s.description === 'CURRENT' && s.score?.participant === 'home')?.score?.goals ?? 0;
    const awayScore = scores.find((s: any) => s.description === 'CURRENT' && s.score?.participant === 'away')?.score?.goals ?? 0;

    const periods: any[] = m.periods ?? [];
    const livePeriod = periods.find((p: any) => p.ticking);
    const min: number = livePeriod?.minutes ?? 0;

    // Double check: state_id is reliable even if periods include is absent
    const live: boolean = LIVE_STATE_IDS.has(m.state_id);

    return {
      id: m.id,
      home: home.trim(),
      away: away.trim(),
      sh: homeScore,
      sa: awayScore,
      min,
      league: m.league?.name ?? '',
      live,
      time: live ? '' : (m.starting_at_timestamp
        ? new Date(m.starting_at_timestamp * 1000).toLocaleTimeString('fr-FR', { hour: '2-digit', minute: '2-digit' })
        : ''),
    };
  });
}
