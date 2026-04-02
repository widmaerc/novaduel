export type Locale = 'fr' | 'en' | 'es';
export type Position = 'ATT' | 'MIL' | 'DEF' | 'GK';
export type FormResult = 'V' | 'D' | 'N';
export type StatCategory = 'attack' | 'passing' | 'defense' | 'physical';

export interface Player {
  id: number;
  slug: string;
  name: string;
  common_name: string;
  team: string;
  team_logo_url: string;
  league: string;
  league_slug: string;
  nationality: string;
  flag_url: string;
  flag_emoji: string;
  position: Position;
  position_name: string;
  age: number;
  date_of_birth: string;
  height: number;
  weight: number;
  preferred_foot: string;
  shirt_number: number;
  market_value: string;
  image_url: string;
  season: string;
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
  recent_form: string;
  initials: string;
  avatar_bg: string;
  avatar_color: string;
  is_featured: boolean;
  created_at: string;
  updated_at: string;
}

export interface RadarSkills {
  finishing: number;
  dribble: number;
  passing: number;
  physical: number;
  vision: number;
}

export interface Trophy {
  emoji: string;
  name: string;
  count: number;
}

export interface CompetitionStat {
  competition: string;
  competition_logo: string | null;
  matches: number;
  goals: number;
  assists: number;
  rating: number | null;
  yellow_cards: number;
  red_cards: number;
}

export interface SimilarDuel {
  slug: string;
  nameA: string;
  nameB: string;
  initialsA: string;
  initialsB: string;
  bgA: string;
  bgB: string;
  colorA: string;
  colorB: string;
  views: number;
}
