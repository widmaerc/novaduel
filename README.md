# NovaDuel

Plateforme de comparaison de joueurs de football. L'utilisateur choisit deux joueurs, voit leurs statistiques côte à côte, et reçoit une analyse IA générée par Claude (Anthropic) en français, anglais ou espagnol.

---

## Table des matières

1. [Ce que fait le projet](#1-ce-que-fait-le-projet)
2. [Stack technique](#2-stack-technique)
3. [Architecture & flux de données](#3-architecture--flux-de-données)
4. [Déploiement complet](#4-déploiement-complet)
   - 4.1 [Prérequis — comptes à créer](#41-prérequis--comptes-à-créer)
   - 4.2 [Variables d'environnement](#42-variables-denvironnement)
   - 4.3 [Supabase — tables SQL](#43-supabase--tables-sql)
   - 4.4 [Supabase — fonctions RPC](#44-supabase--fonctions-rpc)
   - 4.5 [Vercel — déploiement](#45-vercel--déploiement)
   - 4.6 [GitHub Actions — comparaisons populaires](#46-github-actions--comparaisons-populaires)
5. [Calendrier des tâches automatiques](#5-calendrier-des-tâches-automatiques)
6. [Scripts manuels](#6-scripts-manuels)
7. [Points critiques à ne pas négliger](#7-points-critiques-à-ne-pas-négliger)
8. [Ce qui reste à faire (TODO)](#8-ce-qui-reste-à-faire-todo)

---

## 1. Ce que fait le projet

| Page | Description |
|---|---|
| `/` | Accueil : top comparaisons populaires, barre de recherche, stats globales |
| `/players` | Liste des joueurs avec filtres (ligue, poste, saison) |
| `/player/[slug]` | Profil complet d'un joueur : stats, trophées, transferts, joueurs similaires |
| `/compare` | Sélection libre de deux joueurs à comparer |
| `/compare/[slug]` | Comparaison côte à côte + analyse IA (fr/en/es) |

**Logique centrale :**
- Les données joueurs viennent d'**API-Football** et sont synchronisées quotidiennement dans **Supabase**.
- Chaque comparaison génère un insight IA via **Claude** (lazy : à la première visite), mis en cache dans Redis et en base.
- Les comparaisons populaires (`data/top-comparisons.json`) sont mises à jour chaque semaine via **SerpAPI Google Trends** + **GitHub Actions**.
- L'interface est multilingue (fr / en / es) via `next-intl`.

---

## 2. Stack technique

| Couche | Outil | Rôle |
|---|---|---|
| Framework | Next.js 16 App Router | SSR, routing, API routes, crons |
| Base de données | Supabase (PostgreSQL) | Joueurs, comparaisons, insights IA |
| Cache | Upstash Redis | Cache chaud, saison courante |
| Données football | API-Football v3 (Pro) | Source des stats joueurs/équipes |
| IA | Anthropic Claude | Insights comparaisons (fr/en/es) |
| Tendances | SerpAPI Google Trends | Classement popularité joueurs |
| Déploiement | Vercel | Hébergement + crons automatiques |
| CI/CD | GitHub Actions | Mise à jour hebdomadaire comparaisons populaires |
| Internationalisation | next-intl | fr / en / es |

---

## 3. Architecture & flux de données

### Priorité de lecture

```
Redis (cache chaud) → Supabase (persistant) → API-Football (source)
```

Toute lecture passe par `cached(key, fetcher, ttl)` dans `src/lib/redis.ts`.

### Pipeline comparaisons populaires

```
[SerpAPI Google Trends]
         ↓
update-top-comparisons.ts  →  data/top-comparisons.json
         ↓
seed-comparisons.ts        →  Supabase (comparisons + insights IA fr/en/es)
         ↓
GitHub Actions (chaque lundi 06:00 UTC, commit auto du JSON)
```

### Tables Supabase

| Table | Contenu |
|---|---|
| `dn_players` | Joueurs API-Football (stats JSONB, slug SEO) |
| `dn_teams` | Équipes (venue en JSONB) |
| `dn_team_leagues` | Jointure équipe × ligue × saison |
| `players` | Joueurs enrichis (common_name, insight_fr/en/es, trophies, transfers) |
| `comparisons` | Paires de joueurs comparés (slug canonique = `slugA-vs-slugB` trié) |

### Saison courante

Stockée dans Redis (`config:current_season`, TTL 8 jours). **Ne jamais hardcoder la saison.**

```ts
import { getCurrentSeason } from '@/lib/season';
const season = await getCurrentSeason();
```

---

## 4. Déploiement complet

### 4.1 Prérequis — comptes à créer

| Service | URL | Usage | Coût |
|---|---|---|---|
| Supabase | supabase.com | Base de données PostgreSQL | Gratuit (free tier) |
| Upstash | upstash.com | Redis serverless | Gratuit (free tier) |
| API-Football | api-football.com | Données football | ~15 €/mois (Plan Pro) |
| Anthropic | console.anthropic.com | Claude AI (insights) | Pay-per-use |
| SerpAPI | serpapi.com | Google Trends | Gratuit (250 req/mois) |
| Vercel | vercel.com | Hébergement Next.js | Gratuit (Hobby) |

---

### 4.2 Variables d'environnement

Créer `.env.local` à la racine du projet :

```env
# Supabase
NEXT_PUBLIC_SUPABASE_URL=https://xxxx.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=eyJ...
SUPABASE_SERVICE_ROLE_KEY=eyJ...

# Upstash Redis
UPSTASH_REDIS_REST_URL=https://xxxx.upstash.io
UPSTASH_REDIS_REST_TOKEN=xxxx

# API-Football
API_FOOTBALL_KEY=xxxx

# Anthropic Claude
ANTHROPIC_API_KEY=sk-ant-...

# SerpAPI (Google Trends)
SERPAPI_KEY=xxxx

# Crons Vercel (valeur arbitraire, même valeur dans Vercel env)
CRON_SECRET=un-secret-long-et-aleatoire
```

---

### 4.3 Supabase — tables SQL

Exécuter dans **Supabase → SQL Editor** dans cet ordre :

#### `dn_teams`

```sql
CREATE TABLE IF NOT EXISTS public.dn_teams (
  id          integer PRIMARY KEY,
  name        text NOT NULL,
  code        text,
  country     text,
  founded     integer,
  national    boolean DEFAULT false,
  logo        text,
  venue       jsonb,
  created_at  timestamptz DEFAULT now(),
  updated_at  timestamptz DEFAULT now()
);
CREATE INDEX IF NOT EXISTS dn_teams_country_idx ON public.dn_teams (country);
CREATE INDEX IF NOT EXISTS dn_teams_venue_gin   ON public.dn_teams USING gin (venue);
```

#### `dn_team_leagues`

```sql
CREATE TABLE IF NOT EXISTS public.dn_team_leagues (
  team_id    integer NOT NULL REFERENCES public.dn_teams(id) ON DELETE CASCADE,
  league_id  integer NOT NULL,
  season     integer NOT NULL,
  PRIMARY KEY (team_id, league_id, season)
);
CREATE INDEX IF NOT EXISTS dn_team_leagues_league_season_idx
  ON public.dn_team_leagues (league_id, season);
```

#### `dn_players`

```sql
CREATE TABLE IF NOT EXISTS public.dn_players (
  id              integer PRIMARY KEY,
  name            text NOT NULL,
  firstname       text,
  lastname        text,
  age             integer,
  birth_date      date,
  birth_place     text,
  birth_country   text,
  nationality     text,
  height          integer,
  weight          integer,
  injured         boolean DEFAULT false,
  photo           text,
  statistics      jsonb,
  season          integer NOT NULL,
  slug            text UNIQUE,
  created_at      timestamptz DEFAULT now(),
  updated_at      timestamptz DEFAULT now()
);
CREATE INDEX IF NOT EXISTS dn_players_statistics_gin ON public.dn_players USING gin (statistics);
CREATE INDEX IF NOT EXISTS dn_players_season_idx     ON public.dn_players (season);
CREATE INDEX IF NOT EXISTS dn_players_slug_idx       ON public.dn_players (slug);
```

#### `players` (joueurs enrichis)

```sql
CREATE TABLE IF NOT EXISTS public.players (
  id              serial PRIMARY KEY,
  sportmonks_id   integer UNIQUE,
  slug            text UNIQUE,
  name            text,
  common_name     text,
  firstname       text,
  lastname        text,
  photo           text,
  position        text,
  nationality     text,
  age             integer,
  insight_fr      text,
  insight_en      text,
  insight_es      text,
  trophies_json   jsonb,
  transfers_json  jsonb,
  created_at      timestamptz DEFAULT now(),
  updated_at      timestamptz DEFAULT now()
);
```

#### `comparisons`

```sql
CREATE TABLE IF NOT EXISTS public.comparisons (
  id          serial PRIMARY KEY,
  slug        text UNIQUE NOT NULL,
  slug_a      text NOT NULL,
  slug_b      text NOT NULL,
  insight_fr  text,
  insight_en  text,
  insight_es  text,
  created_at  timestamptz DEFAULT now(),
  updated_at  timestamptz DEFAULT now()
);
CREATE INDEX IF NOT EXISTS comparisons_slug_idx ON public.comparisons (slug);
```

---

### 4.4 Supabase — fonctions RPC

Exécuter dans **Supabase → SQL Editor** :

#### `search_players(q text)`

Recherche accent-insensitive et case-insensitive sur `name`, `firstname`, `lastname`.
Appelée par `/api/players/search`.

```sql
CREATE OR REPLACE FUNCTION search_players(q text)
RETURNS TABLE (
  id integer, name text, firstname text, lastname text,
  slug text, photo text, statistics jsonb
)
LANGUAGE sql STABLE AS $$
  SELECT id, name, firstname, lastname, slug, photo, statistics
  FROM dn_players
  WHERE
    translate(lower(name),      'àáâãäåçèéêëìíîïðñòóôõöùúûüý', 'aaaaaaceeeeiiiidnooooosuuuuy') LIKE '%' || translate(lower(q), 'àáâãäåçèéêëìíîïðñòóôõöùúûüý', 'aaaaaaceeeeiiiidnooooosuuuuy') || '%'
    OR translate(lower(firstname), 'àáâãäåçèéêëìíîïðñòóôõöùúûüý', 'aaaaaaceeeeiiiidnooooosuuuuy') LIKE '%' || translate(lower(q), 'àáâãäåçèéêëìíîïðñòóôõöùúûüý', 'aaaaaaceeeeiiiidnooooosuuuuy') || '%'
    OR translate(lower(lastname),  'àáâãäåçèéêëìíîïðñòóôõöùúûüý', 'aaaaaaceeeeiiiidnooooosuuuuy') LIKE '%' || translate(lower(q), 'àáâãäåçèéêëìíîïðñòóôõöùúûüý', 'aaaaaaceeeeiiiidnooooosuuuuy') || '%'
  ORDER BY (statistics->0->'games'->>'rating')::float DESC NULLS LAST
  LIMIT 10;
$$;
```

#### `get_trend_players()`

Retourne les 60 joueurs les plus actifs des 5 grandes ligues + UCL/UEL.
Utilisée par `scripts/update-top-comparisons.ts`.

```sql
CREATE OR REPLACE FUNCTION get_trend_players()
RETURNS TABLE (slug text, name text, firstname text, lastname text)
LANGUAGE sql STABLE AS $$
  SELECT slug, name, firstname, lastname
  FROM dn_players
  WHERE
    slug IS NOT NULL
    AND (statistics->0->'games'->>'appearences')::int >= 20
    AND (statistics->0->'games'->>'minutes')::int     >= 1500
    AND (statistics->0->'league'->>'id')::int IN (39, 140, 135, 78, 61, 2, 3)
    AND (
      (statistics->0->'goals'->>'total')::int
      + COALESCE((statistics->0->'goals'->>'assists')::int, 0) >= 5
      OR (statistics->0->'games'->>'rating')::float >= 7.5
    )
  ORDER BY (statistics->0->'games'->>'rating')::float DESC NULLS LAST
  LIMIT 60;
$$;
```

#### `get_similar_players(target_slug TEXT, limit_count INT DEFAULT 4)`

Calcule la similarité entre joueurs (distance euclidienne pondérée sur rating, xG, dribbles, passes, buts/90). Filtré par poste et minutes > 200.

> Le SQL complet est dans la doc interne Supabase ou peut être retrouvé via `\df get_similar_players` dans psql.

---

### 4.5 Vercel — déploiement

1. Connecter le repo GitHub sur [vercel.com/new](https://vercel.com/new)
2. Framework : **Next.js** (détecté automatiquement)
3. Dans **Settings → Environment Variables**, ajouter toutes les variables de [§4.2](#42-variables-denvironnement)
4. Le fichier `vercel.json` configure les crons automatiquement — aucune action supplémentaire

> Les crons Vercel nécessitent un plan **Pro** ou **Hobby** avec accès aux Cron Jobs activé.

---

### 4.6 GitHub Actions — comparaisons populaires

Le workflow `.github/workflows/update-top-comparisons.yml` tourne chaque lundi à 06:00 UTC.

**Ajouter les secrets sur GitHub :**

1. Repo → **Settings → Secrets and variables → Actions**
2. Cliquer **New repository secret** pour chacun :

| Secret | Source |
|---|---|
| `SERPAPI_KEY` | serpapi.com/manage-api-key |
| `NEXT_PUBLIC_SUPABASE_URL` | `.env.local` |
| `SUPABASE_SERVICE_ROLE_KEY` | `.env.local` |
| `UPSTASH_REDIS_REST_URL` | `.env.local` |
| `UPSTASH_REDIS_REST_TOKEN` | `.env.local` |
| `ANTHROPIC_API_KEY` | `.env.local` |

**Activer le workflow :**

1. Onglet **Actions** → si message "Workflows disabled", cliquer **"I understand my workflows, go ahead and enable them"**
2. Le workflow apparaît sous **"Update Top Comparisons"**

**Lancer manuellement (optionnel) :**

Actions → Update Top Comparisons → **Run workflow**

---

## 5. Calendrier des tâches automatiques

### Crons Vercel (via `vercel.json`)

| Cron | Horaire | Durée max | Rôle |
|---|---|---|---|
| `/api/cron/update-season` | **Lundi 01:00 UTC** | 10s | Détecte la saison courante via API-Football et la stocke dans Redis |
| `/api/cron/sync-teams` | **Lundi 02:00 UTC** | 60s | Upsert dn_teams + dn_team_leagues depuis API-Football |
| `/api/cron/sync-players` | **Tous les jours 03:00 UTC** | 300s | Upsert dn_players (9 ligues, ~615 requêtes API-Football) |

### GitHub Actions

| Workflow | Horaire | Durée estimée | Rôle |
|---|---|---|---|
| Update Top Comparisons | **Lundi 06:00 UTC** | ~15 min | SerpAPI → JSON → Supabase comparisons + insights IA |

> L'ordre lundi est intentionnel : sync-players (03h) se termine avant que GitHub Actions (06h) génère les comparaisons populaires.

---

## 6. Scripts manuels

Tous les scripts chargent automatiquement `.env.local` via `scripts/env.ts`.

### Synchronisation

```bash
# Synchroniser les joueurs depuis API-Football
npx tsx scripts/run-sync-players.ts

# Synchroniser les équipes
npx tsx scripts/run-sync-teams.ts

# Migration des slugs vers le format SEO (à lancer après changement de buildSlug)
npx tsx scripts/migrate-slugs-seo.ts
```

### Comparaisons populaires

```bash
# Étape 1 : Mettre à jour le JSON via SerpAPI Google Trends (sans toucher à Supabase)
npx tsx scripts/update-top-comparisons.ts

# Étape 2 : Vérifier les paires générées sans écrire en base
npx tsx scripts/seed-comparisons.ts --dry-run

# Étape 3 : Peupler Supabase + générer les insights IA (~5-10 min)
npx tsx scripts/seed-comparisons.ts
```

> `seed-comparisons.ts` est idempotent : skip les comparaisons qui ont déjà leurs 3 insights.

### Inspection & Debug

```bash
# Inspecter un joueur par ID
npx tsx scripts/inspect-player.ts

# Inspecter les équipes d'une ligue
npx tsx scripts/inspect-teams.ts

# Vérifier le plan / quota API-Football
npx tsx scripts/inspect-account.ts

# Vérifier les saisons disponibles
npx tsx scripts/inspect-season.ts

# Vider le cache Redis
npx tsx scripts/clear-redis.ts
```

---

## 7. Points critiques à ne pas négliger

### ⚠️ Renouvellement API-Football — MANUEL

**API-Football ne renouvelle PAS automatiquement.** Si le plan expire, `sync-players` échoue silencieusement et les données ne se mettent plus à jour.

- Plan actuel : **Pro** (~7 500 req/jour, 300 req/min)
- Vérifier le quota : `npx tsx scripts/inspect-account.ts`
- **Programmer un rappel agenda mensuel pour vérifier l'expiration**

### ⚠️ SerpAPI — quota mensuel

Free tier : **250 requêtes/mois**. Chaque run du script consomme ~20 requêtes (15 batches + calibrage).
→ Maximum **12 runs/mois** (largement suffisant pour 1×/semaine).

Si le quota est dépassé, le script loggue une erreur SerpAPI et skip les batches concernés — le JSON n'est pas mis à jour ce jour-là.

### ⚠️ Clés API à ne jamais committer

`.env.local` est dans `.gitignore`. Les secrets ne passent que par :
- Variables d'environnement Vercel (interface web)
- Secrets GitHub Actions (interface web)

### ⚠️ Slugs SEO — migration nécessaire après changement de `buildSlug`

Si la logique de `buildSlug` dans `src/lib/data.ts` est modifiée, relancer :
```bash
npx tsx scripts/migrate-slugs-seo.ts
```
Sinon les liens existants (Google, liens partagés) deviennent des 404.

### ⚠️ `supabaseAdmin` — serveur uniquement

Ne jamais importer `supabaseAdmin` dans un composant client (`'use client'`). Il utilise la `SERVICE_ROLE_KEY` qui donne accès total à la base.

### ⚠️ Saison en dur interdite

Toujours utiliser `getCurrentSeason()` — jamais `2025` ou autre valeur hardcodée.

---

## 8. Ce qui reste à faire (TODO)

### Fonctionnalités manquantes

- [ ] **Page profil joueur** — afficher `common_name` (nom formaté) plutôt que le nom brut de la DB
- [ ] **Insights joueur** — la colonne `insight_fr/en/es` de la table `players` est prévue mais pas encore générée automatiquement (uniquement les comparaisons le sont)
- [ ] **Trophées & transferts** — colonnes `trophies_json` et `transfers_json` présentes en base mais pas encore peuplées ni affichées
- [ ] **Joueurs similaires** — `get_similar_players` est définie en base mais son intégration côté UI reste à vérifier
- [ ] **Page `/match/[id]`** — page de match présente dans le routing mais contenu à compléter

### Technique

- [ ] **`migrate-slugs-seo.ts`** — à relancer sur la prod pour appliquer la nouvelle logique `buildSlug` (noms abrégés → noms complets)
- [ ] **`sync-players` → mettre à jour `common_name`** — le champ `common_name` de la table `players` devrait être synchronisé avec la logique `displayName` de `src/lib/data.ts`
- [ ] **Tests** — aucun test automatisé en place

### SEO & contenu

- [ ] **Sitemap dynamique** — lister toutes les pages `/player/[slug]` et `/compare/[slug]`
- [ ] **Balises OG** — images de partage pour les comparaisons populaires
- [ ] **Schema.org** — données structurées pour les profils joueurs

---

## Développement local

```bash
npm install
npm run dev
# http://localhost:3000
```

> Les crons Vercel ne tournent pas en local. Pour les tester, utiliser les scripts manuels de [§6](#6-scripts-manuels).
