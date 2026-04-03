This is a [Next.js](https://nextjs.org) project bootstrapped with [`create-next-app`](https://nextjs.org/docs/app/api-reference/cli/create-next-app).

## Tables Supabase — Scripts SQL

### `dn_teams`

```sql
create table if not exists public.dn_teams (
  id          integer primary key,
  name        text    not null,
  code        text,
  country     text,
  founded     integer,
  national    boolean default false,
  logo        text,
  venue       jsonb,
  created_at  timestamptz default now(),
  updated_at  timestamptz default now()
);

create index if not exists dn_teams_country_idx on public.dn_teams (country);
create index if not exists dn_teams_venue_gin   on public.dn_teams using gin (venue);
```

### `dn_team_leagues`

```sql
create table if not exists public.dn_team_leagues (
  team_id    integer not null references public.dn_teams(id) on delete cascade,
  league_id  integer not null,
  season     integer not null,
  primary key (team_id, league_id, season)
);

create index if not exists dn_team_leagues_league_season_idx
  on public.dn_team_leagues (league_id, season);
```

### `dn_players`

```sql
create table if not exists public.dn_players (
  id              integer primary key,
  name            text not null,
  firstname       text,
  lastname        text,
  age             integer,
  birth_date      date,
  birth_place     text,
  birth_country   text,
  nationality     text,
  height          integer,
  weight          integer,
  injured         boolean default false,
  photo           text,
  statistics      jsonb,
  season          integer not null,
  created_at      timestamptz default now(),
  updated_at      timestamptz default now()
);

create index if not exists dn_players_statistics_gin on public.dn_players using gin (statistics);
create index if not exists dn_players_season_idx     on public.dn_players (season);

### SQL Functions & RPC

#### `get_similar_players(target_slug TEXT, limit_count INT DEFAULT 4)`
Calculates player similarity using a weighted Euclidean distance based on properties in the `players` table. Matches Target by `slug` (bridge between `dn_players` and `players`).
- **Rating** (Weight: 5.0)
- **xG** (Weight: 3.0)
- **Dribbles** (Weight: 2.0)
- **Pass Accuracy** (Weight: 1.5)
- **Goals Per 90** (Weight: 2.0)

Filters by same position and ensures minimum play time (minutes > 200).

```

---

## Scripts manuels (Shortcuts)

Tous les scripts utilisent automatiquement `.env.local`. Plus besoin de spécifier `--env-file`.

### Synchronisation & Migration

```bash
# Synchroniser les joueurs (SEO friendly & unique slugs)
npm run sync-players

# Synchroniser les équipes
npm run sync-teams

# Migration massive des slugs vers le format SEO
npm run migrate-slugs

# Seeder la base avec des joueurs de test
npm run seed
```

### Inspection & Debug

```bash
# Inspecter un joueur spécifique par ID
npm run inspect-player

# Inspecter les équipes d'une ligue
npm run inspect-teams

# Vider le cache Redis
npm run clear-cache
```

---

## Getting Started

First, run the development server:

```bash
npm run dev
# or
yarn dev
# or
pnpm dev
# or
bun dev
```

Open [http://localhost:3000](http://localhost:3000) with your browser to see the result.

You can start editing the page by modifying `app/page.tsx`. The page auto-updates as you edit the file.

This project uses [`next/font`](https://nextjs.org/docs/app/building-your-application/optimizing/fonts) to automatically optimize and load [Geist](https://vercel.com/font), a new font family for Vercel.

## Learn More

To learn more about Next.js, take a look at the following resources:

- [Next.js Documentation](https://nextjs.org/docs) - learn about Next.js features and API.
- [Learn Next.js](https://nextjs.org/learn) - an interactive Next.js tutorial.

You can check out [the Next.js GitHub repository](https://github.com/vercel/next.js) - your feedback and contributions are welcome!

## Deploy on Vercel

The easiest way to deploy your Next.js app is to use the [Vercel Platform](https://vercel.com/new?utm_medium=default-template&filter=next.js&utm_source=create-next-app&utm_campaign=create-next-app-readme) from the creators of Next.js.

Check out our [Next.js deployment documentation](https://nextjs.org/docs/app/building-your-application/deploying) for more details.
