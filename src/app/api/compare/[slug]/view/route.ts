import { NextRequest, NextResponse } from 'next/server'
import { supabaseAdmin } from '@/lib/supabase'

export async function POST(
  _req: NextRequest,
  { params }: { params: Promise<{ slug: string }> },
) {
  const { slug } = await params

  // Fetch current count
  const { data, error } = await supabaseAdmin
    .from('comparisons')
    .select('views')
    .eq('slug', slug)
    .single()

  if (error || !data) {
    return NextResponse.json({ views: 0 }, { status: 404 })
  }

  const newViews = (data.views ?? 0) + 1

  await supabaseAdmin
    .from('comparisons')
    .update({ views: newViews })
    .eq('slug', slug)

  return NextResponse.json({ views: newViews })
}

export async function GET(
  _req: NextRequest,
  { params }: { params: Promise<{ slug: string }> },
) {
  const { slug } = await params

  const { data } = await supabaseAdmin
    .from('comparisons')
    .select('views')
    .eq('slug', slug)
    .single()

  return NextResponse.json({ views: data?.views ?? 0 })
}
