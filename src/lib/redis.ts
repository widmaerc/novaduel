import { Redis } from '@upstash/redis';

export const redis = new Redis({
  url: process.env.UPSTASH_REDIS_REST_URL!,
  token: process.env.UPSTASH_REDIS_REST_TOKEN!,
});

// TTLs in seconds
export const TTL = {
  player: 3600,        // 1h  — player profile
  stats: 1800,         // 30m — season stats
  comparison: 86400,   // 24h — comparison result
  livescores: 60,      // 1m  — live data
};

/**
 * Cache-first fetch utility.
 * Always checks Redis before calling the data fetcher.
 * Null/undefined results are NOT cached to avoid UpstashError.
 */
export async function cached<T>(
  key: string,
  fetcher: () => Promise<T>,
  ttl: number = TTL.player,
): Promise<T> {
  try {
    const hit = await redis.get<T>(key);
    if (hit !== null && hit !== undefined) return hit;
  } catch {
    // Redis unavailable → fallback to fetcher
  }

  const fresh = await fetcher();

  // Never store null/undefined — Upstash rejects them
  if (fresh !== null && fresh !== undefined) {
    try {
      await redis.set(key, fresh, { ex: ttl });
    } catch {
      // Cache write failed silently — data still returned
    }
  }

  return fresh;
}
