/**
 * season.ts — Saison courante dynamique
 *
 * La saison est stockée dans Redis (clé "config:current_season").
 * Le cron /api/cron/update-season la met à jour chaque semaine.
 * Fallback sur FALLBACK_SEASON si Redis est indisponible.
 */
import { redis } from './redis';

const REDIS_KEY       = 'config:current_season';
const FALLBACK_SEASON = 2025;

const BASE  = 'https://v3.football.api-sports.io';
const TOKEN = process.env.API_FOOTBALL_KEY!;

// ── Lire la saison courante (Redis → fallback) ────────────────────────────────

export async function getCurrentSeason(): Promise<number> {
  try {
    const cached = await redis.get<number>(REDIS_KEY);
    if (cached) return cached;
  } catch { /* Redis indisponible */ }
  return FALLBACK_SEASON;
}

// ── Détecter la saison active via API-Football ────────────────────────────────

export async function detectCurrentSeason(): Promise<number> {
  const url = new URL(`${BASE}/leagues`);
  url.searchParams.set('id',      '39');   // Premier League — toujours à jour
  url.searchParams.set('current', 'true');

  const res = await fetch(url.toString(), {
    headers: { 'x-apisports-key': TOKEN },
    cache: 'no-store',
  });

  if (!res.ok) return FALLBACK_SEASON;

  const json = await res.json();
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const season = json.response?.[0]?.seasons?.find((s: any) => s.current === true)?.year;

  return typeof season === 'number' ? season : FALLBACK_SEASON;
}

// ── Mettre à jour Redis ───────────────────────────────────────────────────────

export async function updateCurrentSeason(): Promise<{ previous: number; current: number; changed: boolean }> {
  const [previous, detected] = await Promise.all([
    getCurrentSeason(),
    detectCurrentSeason(),
  ]);

  if (detected !== previous) {
    // TTL 8 jours — le cron tourne chaque semaine, la clé ne périme jamais
    await redis.set(REDIS_KEY, detected, { ex: 60 * 60 * 24 * 8 });
    console.log(`[season] updated ${previous} → ${detected}`);
  } else {
    // Rafraîchir le TTL même si la valeur n'a pas changé
    await redis.set(REDIS_KEY, detected, { ex: 60 * 60 * 24 * 8 });
    console.log(`[season] unchanged: ${detected}`);
  }

  return { previous, current: detected, changed: detected !== previous };
}
