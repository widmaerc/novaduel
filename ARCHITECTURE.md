# NovaDuel — Architecture & Bonnes Pratiques

## Stack

| Couche | Outil |
|---|---|
| Framework | Next.js 16 (App Router) |
| Base de données | Supabase (PostgreSQL) |
| Cache | Upstash Redis |
| API données | API-Football v3 (Pro, 7500 req/jour) |
| AI | Anthropic Claude (insights joueurs/comparaisons) |
| Déploiement | Vercel (crons inclus) |

---

## Priorité de lecture des données

```
Redis (cache chaud) → Supabase (persistant) → API-Football (source)
```

Toute lecture passe par `cached(key, fetcher, ttl)` dans `src/lib/redis.ts`.
- **Hit Redis** → retour immédiat, 0 requête API
- **Miss Redis** → appel fetcher → résultat mis en cache
- **Redis down** → fallback silencieux sur fetcher, jamais de crash

---

## Saison courante

La saison est **dynamique**, stockée dans Redis (`config:current_season`, TTL 8 jours).

```ts
// TOUJOURS utiliser ceci — jamais de valeur en dur
import { getCurrentSeason } from '@/lib/season';
const season = await getCurrentSeason();
```

- Fallback si Redis down : `2025`
- Mise à jour automatique : cron `/api/cron/update-season` chaque lundi 1h
- Détection : interroge API-Football `/leagues?id=39&current=true` (Premier League)

---

## Tables Supabase

### `players`
Joueurs enrichis. Conflit sur `sportmonks_id` (= id API-Football).
Champs notables : `slug`, `sportmonks_id`, `insight_fr/en/es`, `trophies_json`, `transfers_json`.

### `comparisons`
Slug canonique = slugs des deux joueurs triés alphabétiquement + `-vs-`.
Insights IA générés à la demande (lazy) et mis en cache.

### `dn_teams`
Équipes API-Football. `venue` stocké en **JSONB** (pas de table séparée).
Conflit sur `id`.

### `dn_team_leagues`
Table de jointure `(team_id, league_id, season)` — PK composite.
Permet de filtrer les équipes par ligue.

---

## Crons Vercel

| Cron | Schedule | Durée max | Rôle |
|---|---|---|---|
| `/api/cron/update-season` | Lundi 1h | 10s | Met à jour la saison dans Redis |
| `/api/cron/sync-teams` | Lundi 2h | 60s | Upsert dn_teams + dn_team_leagues |
| `/api/cron/sync-players` | Tous les jours 3h | 300s | Upsert players (9 ligues, ~615 req) |

Tous protégés par `Authorization: Bearer {CRON_SECRET}`.

---

## Limites API-Football (Plan Pro)

- **300 req/min** → sleep de 220ms entre chaque requête dans les syncs
- **7500 req/jour** → le trafic utilisateur n'en consomme presque pas grâce à Redis

---

## Ligues synchronisées

```ts
61  Ligue 1          | 39  Premier League  | 140 La Liga
135 Serie A          | 78  Bundesliga      | 253 MLS
307 Saudi Pro League | 2   Champions League| 3   Europa League
```

---

## Pattern upsert (chunking)

Toujours upsert par lots de 100 pour isoler les erreurs :

```ts
for (let i = 0; i < rows.length; i += 100) {
  const chunk = rows.slice(i, i + 100);
  const { error } = await supabaseAdmin
    .from('table')
    .upsert(chunk, { onConflict: 'id', ignoreDuplicates: false });
}
```

---

## Règles de développement

1. **Jamais de saison en dur** — utiliser `getCurrentSeason()` de `@/lib/season`
2. **Jamais d'appel API-Football direct dans les composants** — passer par `@/lib/apifootball.ts`
3. **Tout appel API doit passer par `cached()`** — clé préfixée `af:` pour API-Football
4. **supabaseAdmin côté serveur uniquement** — jamais dans les composants client
5. **`src/lib/data.ts` est la couche de données principale** — `getPlayerBySlug`, `getComparisonBySlug`, etc.

---

## Variables d'environnement

| Variable | Usage |
|---|---|
| `NEXT_PUBLIC_SUPABASE_URL` | Client browser |
| `NEXT_PUBLIC_SUPABASE_ANON_KEY` | Client browser |
| `SUPABASE_SERVICE_ROLE_KEY` | Serveur uniquement (admin) |
| `UPSTASH_REDIS_REST_URL` | Redis |
| `UPSTASH_REDIS_REST_TOKEN` | Redis |
| `API_FOOTBALL_KEY` | Header `x-apisports-key` |
| `ANTHROPIC_API_KEY` | Claude AI |
| `CRON_SECRET` | Protection des routes cron |

---

## Scripts utiles

```bash
# Lancer le sync teams manuellement
npx tsx --env-file=.env.local scripts/run-sync-teams.ts

# Vider le cache Redis
npx tsx --env-file=.env.local scripts/clear-redis.ts

# Inspecter un joueur brut depuis l'API
npx tsx --env-file=.env.local scripts/inspect-player.ts

# Vérifier le plan / quota API
npx tsx --env-file=.env.local scripts/inspect-account.ts

# Vérifier les saisons accessibles
npx tsx --env-file=.env.local scripts/inspect-season.ts
```
