'use server';

import { searchPlayerProfiles } from '@/lib/apifootball';
import { makeInitials } from '@/lib/data';

export async function smSearchAction(query: string) {
  if (!query || query.length < 2) return [];

  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const data = await searchPlayerProfiles(query) as any[] | null;
  if (!data || !Array.isArray(data)) return [];

  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  return data.map((e: any) => {
    const p = e.player ?? e;
    return {
      id:       String(p.id),
      name:     p.name ?? `${p.firstname ?? ''} ${p.lastname ?? ''}`.trim(),
      team:     '—',
      position: 'Joueur',
      initials: makeInitials(p.name, p.firstname, p.lastname),
    };
  });
}
