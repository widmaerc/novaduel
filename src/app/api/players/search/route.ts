import { NextRequest, NextResponse } from 'next/server'
import { supabaseAdmin } from '@/lib/supabase'

export async function GET(req: NextRequest) {
  const q = req.nextUrl.searchParams.get('q')?.trim() ?? ''

  if (q.length < 2) return NextResponse.json({ results: [] })

  const { data, error } = await supabaseAdmin
    .from('players')
    .select('id, slug, name, common_name, team, position, initials, avatar_bg, avatar_color, image_url, rating')
    .or(`name.ilike.%${q}%,common_name.ilike.%${q}%`)
    .order('is_featured', { ascending: false })
    .limit(8)

  if (error) return NextResponse.json({ results: [] }, { status: 500 })

  // Map to the shape CompareSearchBar expects
  const results = (data ?? []).map((p) => ({
    id:         p.id,
    slug:       p.slug,
    name:       p.name,
    teams:      [{ name: p.team ?? '—' }],
    position:   { code: p.position ?? '?' },
    image_path: p.image_url ?? null,
    initials:   p.initials,
    avatar_bg:  p.avatar_bg  ?? 'rgba(0,71,130,.1)',
    avatar_color: p.avatar_color ?? '#004782',
    statistics: p.rating ? [{ rating: p.rating }] : [],
  }))

  return NextResponse.json({ results })
}
