import { NextRequest, NextResponse } from 'next/server'
import { supabaseAdmin } from '@/lib/supabase'
import { buildSlug, makeInitials, mapPosition, displayName as mkDisplay } from '@/lib/data'

export async function GET(req: NextRequest) {
  const q = req.nextUrl.searchParams.get('q')?.trim() ?? ''

  if (q.length < 2) return NextResponse.json({ results: [] })

  const [byName, byLastname, byFirstname] = await Promise.all([
    supabaseAdmin
      .from('dn_players')
      .select('id, name, firstname, lastname, slug, photo, statistics')
      .ilike('name', `%${q}%`)
      .limit(10),
    supabaseAdmin
      .from('dn_players')
      .select('id, name, firstname, lastname, slug, photo, statistics')
      .ilike('lastname', `%${q}%`)
      .limit(10),
    supabaseAdmin
      .from('dn_players')
      .select('id, name, firstname, lastname, slug, photo, statistics')
      .ilike('firstname', `%${q}%`)
      .limit(10),
  ])

  // Fusionner et dédoublonner par id
  const seen = new Set<number>()
  const merged = [...(byName.data ?? []), ...(byLastname.data ?? []), ...(byFirstname.data ?? [])].filter((p: any) => {
    if (seen.has(p.id)) return false
    seen.add(p.id)
    return true
  }).slice(0, 10)

  const data = merged

  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const results = (data ?? []).map((p: any) => {
    const stats: any[] = (p.statistics as any) ?? []
    const best = stats.reduce((acc: any, s: any) =>
      (s.games?.appearences ?? 0) > (acc?.games?.appearences ?? 0) ? s : acc, stats[0] ?? null)
    const position = mapPosition(best?.games?.position ?? '')
    const pos = { ATT: { bg: '#fffbeb', color: '#d97706' }, MIL: { bg: '#eff6ff', color: '#2563eb' }, DEF: { bg: '#f0fdf4', color: '#16a34a' }, GK: { bg: '#faf5ff', color: '#9333ea' } }[position] ?? { bg: '#f3f4f5', color: '#727782' }
    return {
      id:           p.id,
      slug:         p.slug || buildSlug(p.name, p.id, p.firstname, p.lastname),
      name:         p.name, // Nom brut de la DB (ex: L. Messi)
      display_name: mkDisplay(p.name, p.firstname, p.lastname), // Nom formaté (ex: Lionel Messi)
      team:         best?.team?.name ?? '—',
      position,
      image_url:    null,
      initials:     makeInitials(p.name, p.firstname, p.lastname),
      avatar_bg:    pos.bg,
      avatar_color: pos.color,
      rating:       best?.games?.rating ? parseFloat(best.games.rating) : 0,
    }
  })

  return NextResponse.json({ results })
}
