// ── Locale ──────────────────────────────────────────────────────────
export type Locale = 'fr' | 'en' | 'es';
export type Position = 'ATT' | 'MIL' | 'DEF' | 'GK';
export type FormResult = 'V' | 'D' | 'N';

// ── Player ──────────────────────────────────────────────────────────
export interface Player {
  id: number;
  slug: string;
  name: string;
  common_name: string | null;
  team: string | null;
  team_logo_url: string | null;
  league: string | null;
  league_slug: string | null;
  nationality: string | null;
  flag_url: string | null;
  flag_emoji: string | null;
  position: Position;
  position_name: string | null;
  age: number;
  date_of_birth: string | null;
  height: number;
  weight: number;
  preferred_foot: string | null;
  shirt_number: number;
  market_value: string | null;
  image_url: string | null;
  season: string;
  // Stats
  goals: number;
  assists: number;
  matches: number;
  minutes: number;
  pass_accuracy: number;
  dribbles: number;
  duels_won: number;
  shots_on_target: number;
  yellow_cards: number;
  red_cards: number;
  rating: number;
  xg: number;
  recent_form: string | null; // "V,V,N,D,V"
  // Avatar design system
  initials: string; // "LM"
  avatar_bg: string; // "rgba(0,71,130,.12)"
  avatar_color: string; // "#004782"
  detailed_position: string | null;
  is_featured: boolean;
  ai_insight: string | null;
  insight_fr: string | null;
  insight_en: string | null;
  insight_es: string | null;
  // Radar Metrics (0-100)
  radar_finish: number;
  radar_dribble: number;
  radar_passes: number;
  radar_vision: number;
  radar_creativity: number;
  ai_analysis: any; // Using any for JSONB to avoid deep nesting issues in page
  trophies_json: unknown;
  transfers_json: unknown; // also used to store sidelined data
  created_at: string;
  updated_at: string;
}

// ── Comparison ──────────────────────────────────────────────────────
export interface Comparison {
  id: number;
  slug: string;
  player_a_id: number;
  player_b_id: number;
  player_a?: Player;
  player_b?: Player;
  // Insights IA
  insight_fr: string;
  insight_en: string;
  insight_es: string;
  // Verdicts
  winner_slug: string;
  verdict_scorer: string;
  verdict_assist: string;
  verdict_physical: string;
  verdict_technical: string;
  // Forme
  form_a: string;
  form_b: string;
  // SEO
  meta_title_fr: string;
  meta_title_en: string;
  meta_title_es: string;
  meta_desc_fr: string;
  meta_desc_en: string;
  meta_desc_es: string;
  views: number;
  is_featured: boolean;
  is_generated: boolean;
  created_at: string;
  updated_at: string;
}

// ── Utilitaires ─────────────────────────────────────────────────────
export interface StatBar {
  label: string;
  valueA: number;
  valueB: number;
  format?: 'number' | 'percent' | 'decimal';
  unit?: string;
}

export interface VerdictCard {
  label: string;
  winner: string; // nom du gagnant
  winnerSlug: string;
  icon: string; // Material Symbols name
  detail: string; // "22 buts · 0.73/match"
}

export interface PlayerListItem {
  key: string;
  rank: number;
  initials: string;
  bg: string;
  color: string;
  name: string;
  club: string; // "Inter Miami · MLS"
  pos: Position;
  posColor: string;
  posBg: string;
  goals: number;
  assists: number;
  matches: number;
  rating: number;
}

export interface CareerSeason {
  season: string;
  team: string;
  competition: string;
  matches: number;
  goals: number;
  assists: number;
  rating: number;
  isCurrent?: boolean;
}
