'use server';

import { searchPlayers } from '@/lib/sportmonks';

export async function smSearchAction(query: string) {
  if (!query || query.length < 2) return [];

  const data = await searchPlayers(query);
  
  if (!data || !Array.isArray(data)) return [];

  // Map to the simple format the UI expects
  return data.map((p: any) => {
    const team = p.teams?.[0]?.name || 'Sans club';
    let pos = p.position?.name || 'Joueur';
    
    return {
      id: p.id.toString(),
      name: p.display_name || p.name,
      team,
      position: pos,
      initials: p.name.substring(0, 2).toUpperCase()
    };
  });
}
