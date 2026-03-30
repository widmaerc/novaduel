/**
 * NovaDuel — Types centralisés
 * Miroir exact du schéma Supabase
 */

export type PlayerPosition = 'ATT' | 'MIL' | 'DEF' | 'GK';

export interface Player {
  id: number;
  slug: string;
  name: string;
  common_name: string | null;
  team: string;
  team_logo_url: string | null;
  league: string;
  league_slug: string | null;
  nationality: string | null;
  flag_url: string | null;
  flag_emoji: string | null;
  position: PlayerPosition;
  position_name: string | null;
  age: number | null;
  date_of_birth: string | null;
  height: number | null;          // cm
  weight: number | null;          // kg
  preferred_foot: string | null;
  shirt_number: number | null;
  market_value: string | null;
  image_url: string | null;
  sportmonks_id: number;
  season: string;
  goals: number;
  assists: number;
  matches: number;
  minutes: number;
  pass_accuracy: number | string;
  dribbles: number | string;
  duels_won: number | string;
  shots_on_target: number | string;
  yellow_cards: number;
  red_cards: number;
  rating: number | string;
  xg: number | string;
  recent_form: string;
  initials: string | null;
  avatar_bg: string | null;
  avatar_color: string | null;
  is_featured: boolean;
  ai_insight: string | null;
  detailed_position: string | null;
  trophies_json: { name: string; season: string; times: number }[] | null;
  transfers_json: { from: string; to: string; date: string; fee: number | null; type: string }[] | null;
  created_at: string;
  updated_at: string;
}

export interface Comparison {
  id: number;
  slug: string;
  player_a_id: number | null;
  player_b_id: number | null;
  insight_fr: string | null;
  insight_en: string | null;
  insight_es: string | null;
  winner_slug: string | null;
  verdict_scorer: string | null;
  verdict_assist: string | null;
  verdict_physical: string | null;
  verdict_technical: string | null;
  form_a: string;
  form_b: string;
  meta_title_fr: string | null;
  meta_title_en: string | null;
  meta_title_es: string | null;
  meta_desc_fr: string | null;
  meta_desc_en: string | null;
  meta_desc_es: string | null;
  views: number;
  is_featured: boolean;
  is_generated: boolean;
  created_at: string;
  updated_at: string;
  // Joined
  player_a?: Player;
  player_b?: Player;
}
