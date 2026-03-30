import { NextRequest, NextResponse } from 'next/server'
import { supabaseAdmin } from '@/lib/supabase'

export async function GET(req: NextRequest) {
  const page     = parseInt(req.nextUrl.searchParams.get('page') ?? '1')
  const perPage  = parseInt(req.nextUrl.searchParams.get('per_page') ?? '30')
  const position = req.nextUrl.searchParams.get('position') ?? ''
  const sort     = req.nextUrl.searchParams.get('sort') ?? 'rating'
  const from     = (page - 1) * perPage
  const to       = from + perPage - 1

  let query = supabaseAdmin
    .from('players')
    .select('id, slug, name, common_name, team, position, initials, avatar_bg, avatar_color, image_url, rating, goals, assists, matches, league, nationality, flag_emoji', { count: 'exact' })

  if (position) query = query.eq('position', position)

  const sortMap: Record<string, string> = {
    rating: 'rating', goals: 'goals', assists: 'assists', matches: 'matches', name: 'name',
  }
  query = query.order(sortMap[sort] ?? 'rating', { ascending: sort === 'name', nullsFirst: false })

  query = query.range(from, to)

  const { data, count, error } = await query

  if (error) return NextResponse.json({ players: [], total: 0 }, { status: 500 })

  return NextResponse.json({ players: data ?? [], total: count ?? 0, page, perPage })
}
