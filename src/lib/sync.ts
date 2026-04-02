// REMPLACÉ par sync-players.ts → table dn_players
// Ce fichier synchronisait vers la table 'players' (ancien schéma)
/*
import { supabaseAdmin } from './supabase';
import { mapApiFootballToPlayer } from './data';
import { getCurrentSeason } from './season';

const BASE  = 'https://v3.football.api-sports.io';
const TOKEN = process.env.API_FOOTBALL_KEY!;

async function afFetch(path: string, params: Record<string, string | number> = {}): Promise<any> {
  const url = new URL(`${BASE}${path}`);
  Object.entries(params).forEach(([k, v]) => url.searchParams.set(k, String(v)));
  const res = await fetch(url.toString(), {
    headers: { 'x-apisports-key': TOKEN },
    cache: 'no-store',
  });
  if (!res.ok) return null;
  const json = await res.json();
  if (json.errors && Object.keys(json.errors).length > 0) {
    console.error(`[sync] API error on ${path}:`, json.errors);
    return null;
  }
  return json;
}

const sleep = (ms: number) => new Promise(r => setTimeout(r, ms));

const MAJOR_LEAGUES = [
  { id: 61,  name: 'Ligue 1'          },
  { id: 39,  name: 'Premier League'   },
  { id: 140, name: 'La Liga'          },
  { id: 135, name: 'Serie A'          },
  { id: 78,  name: 'Bundesliga'       },
  { id: 253, name: 'MLS'              },
  { id: 307, name: 'Saudi Pro League' },
  { id: 2,   name: 'Champions League' },
  { id: 3,   name: 'Europa League'    },
];

export interface SyncResult {
  synced: number; updated: number; errors: number;
  skipped: number; leagues: number; players: number; requests: number;
}

export async function syncPlayers(): Promise<SyncResult> {
  // ... (voir git history)
}
*/
