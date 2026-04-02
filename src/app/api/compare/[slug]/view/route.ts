import { NextRequest, NextResponse } from 'next/server'
import { supabaseAdmin } from '@/lib/supabase'

export async function POST(
  _req: NextRequest,
  { params }: { params: Promise<{ slug: string }> },
) {
  const { slug } = await params

  const { data, error } = await supabaseAdmin.rpc('increment_comparison_views', { p_slug: slug })

  if (error) {
    // RPC might not exist yet — fall back to read-modify-write
    const { data: row } = await supabaseAdmin
      .from('comparisons').select('views').eq('slug', slug).single()
    if (!row) return NextResponse.json({ views: 0 }, { status: 404 })
    const newViews = (row.views ?? 0) + 1
    await supabaseAdmin.from('comparisons').update({ views: newViews }).eq('slug', slug)
    return NextResponse.json({ views: newViews })
  }

  return NextResponse.json({ views: data ?? 0 })
}

export async function GET(
  _req: NextRequest,
  { params }: { params: Promise<{ slug: string }> },
) {
  const { slug } = await params
  const { data } = await supabaseAdmin
    .from('comparisons').select('views').eq('slug', slug).single()
  return NextResponse.json({ views: data?.views ?? 0 })
}
