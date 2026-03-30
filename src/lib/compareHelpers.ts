/**
 * Helpers pour la page Compare
 * Calcule des données dérivées à partir des stats Player existantes
 */
import type { Trophy, CompetitionStat, RadarSkills, SimilarDuel } from '@/components/compare/types'
import type { Player } from '@/types'
import { supabaseAdmin } from './supabase'

// Génère des trophées fictifs basés sur le joueur (placeholder jusqu'à une vraie source)
export function getTrophies(_player: Player): Trophy[] {
  return []
}

// Génère des stats par compétition à partir des stats globales du joueur
export function getCompetStats(player: Player): CompetitionStat[] {
  if (!player.matches) return []
  return [
    {
      competition:       player.league || 'Ligue nationale',
      competition_logo:  null,
      matches:           player.matches,
      goals:             player.goals,
      assists:           player.assists,
      rating:            player.rating ? Number(player.rating) : null,
      yellow_cards:      player.yellow_cards,
      red_cards:         player.red_cards,
    },
  ]
}

// Calcule un radar de compétences à partir des stats disponibles
export function getRadarSkills(player: Player): RadarSkills {
  const norm = (v: number, max: number) => Math.min(100, Math.round((v / max) * 100))
  return {
    finishing: norm(Number(player.goals)          || 0, 50),
    dribble:   norm(Number(player.dribbles)       || 0, 10),
    passing:   norm(Number(player.pass_accuracy)  || 0, 100),
    physical:  norm(Number(player.duels_won)      || 0, 100),
    vision:    norm(Number(player.assists)         || 0, 30),
  }
}

// Récupère des duels similaires depuis Supabase
export async function getSimilarDuels(playerAId: number, playerBId: number, limit = 4): Promise<SimilarDuel[]> {
  try {
    const { data } = await supabaseAdmin
      .from('comparisons')
      .select('slug, player_a:players!player_a_id(name,initials,avatar_bg,avatar_color), player_b:players!player_b_id(name,initials,avatar_bg,avatar_color), views')
      .neq('player_a_id', playerAId)
      .neq('player_b_id', playerBId)
      .order('views', { ascending: false })
      .limit(limit)

    if (!data) return []

    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    return data.map((d: any) => ({
      slug:      d.slug,
      nameA:     d.player_a?.name     ?? '—',
      nameB:     d.player_b?.name     ?? '—',
      initialsA: d.player_a?.initials ?? '??',
      initialsB: d.player_b?.initials ?? '??',
      bgA:       d.player_a?.avatar_bg    ?? 'rgba(0,71,130,.1)',
      bgB:       d.player_b?.avatar_bg    ?? 'rgba(146,0,15,.1)',
      colorA:    d.player_a?.avatar_color ?? '#004782',
      colorB:    d.player_b?.avatar_color ?? '#92000f',
      views:     d.views ?? 0,
    }))
  } catch {
    return []
  }
}
