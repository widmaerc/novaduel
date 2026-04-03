import { NextRequest, NextResponse } from 'next/server'
import { supabaseAdmin } from '@/lib/supabase'
import { buildSlug, makeInitials, mapPosition, displayName as mkDisplay } from '@/lib/data'

export async function GET(req: NextRequest) {
  const page     = parseInt(req.nextUrl.searchParams.get('page')     ?? '1')
  const perPage  = parseInt(req.nextUrl.searchParams.get('per_page') ?? '30')
  const position = req.nextUrl.searchParams.get('position') ?? ''
  const sort     = req.nextUrl.searchParams.get('sort')     ?? 'rating'
  const from     = (page - 1) * perPage

  // 1. Récupérer le nombre RÉEL total en base (sans limite de ligne)
  const { count: totalBase } = await supabaseAdmin
    .from('dn_players')
    .select('*', { count: 'exact', head: true })

  // 2. Fetch les données (avec limite pour le traitement mémoire)
  const { data, error } = await supabaseAdmin
    .from('dn_players')
    .select('id, name, firstname, lastname, nationality, photo, statistics')
    .order('name', { ascending: true })
    .limit(5000) // Augmenté pour couvrir la base actuelle

  if (error) return NextResponse.json({ players: [], total: 0 }, { status: 500 })

  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  let players = (data ?? []).map((p: any) => {
    const mainStat = (p.statistics as any)?.[0] ?? {}
    const dn = mkDisplay(p.name, p.firstname, p.lastname)
    return {
      id:           p.id,
      slug:         buildSlug(p.name, p.id, p.firstname, p.lastname),
      name:         p.name,
      display_name: dn,
      team:         mainStat.team?.name           ?? '',
      position:     mapPosition(mainStat.games?.position ?? ''),
      league:       mainStat.league?.name         ?? '',
      nationality:  p.nationality                 ?? '',
      flag_emoji:   null,
      image_url:    p.photo                       ?? null,
      initials:     makeInitials(p.name, p.firstname, p.lastname),
      avatar_bg:    'rgba(0,71,130,.12)',
      avatar_color: '#004782',
      rating:       parseFloat(mainStat.games?.rating ?? '0') || 0,
      goals:        mainStat.goals?.total         ?? 0,
      assists:      mainStat.goals?.assists       ?? 0,
      matches:      mainStat.games?.appearences   ?? 0,
    }
  })

  // ── Filtre position ──────────────────────────────────────────────────────────
  if (position) {
    players = players.filter(p => p.position === position)
  }

  // ── Tri ──────────────────────────────────────────────────────────────────────
  if (sort === 'rating')  players.sort((a, b) => b.rating  - a.rating)
  if (sort === 'goals')   players.sort((a, b) => b.goals   - a.goals)
  if (sort === 'assists') players.sort((a, b) => b.assists - a.assists)
  if (sort === 'matches') players.sort((a, b) => b.matches - a.matches)

  const totalFiltered = players.length
  const paged = players.slice(from, from + perPage)

  return NextResponse.json({ 
    players: paged, 
    total: position ? totalFiltered : (totalBase ?? totalFiltered), 
    page, 
    perPage 
  })
}
