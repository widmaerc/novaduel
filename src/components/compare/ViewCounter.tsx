'use client';
import { useState, useEffect } from 'react'
import { useTranslations } from 'next-intl'

interface Props {
  slug: string
  initialViews?: number
}

export default function ViewCounter({ slug, initialViews = 0 }: Props) {
  const t = useTranslations('Common.units')
  const [views, setViews] = useState<number | null>(null)

  useEffect(() => {
    // Increment on each real visit and get fresh count
    fetch(`/api/compare/${slug}/view`, { method: 'POST' })
      .then(r => r.json())
      .then(d => setViews(d.views))
      .catch(() => setViews(initialViews))
  }, [slug, initialViews])

  const count = views ?? initialViews

  function fmt(n: number) {
    if (n >= 1_000_000) return `${(n / 1_000_000).toFixed(1)}M`
    if (n >= 1_000)     return `${(n / 1_000).toFixed(0)}k`
    return String(n)
  }

  return (
    <div className="flex items-center gap-1.5 text-[11px] text-[#727782]">
      <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" className="flex-shrink-0">
        <path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z"/>
        <circle cx="12" cy="12" r="3"/>
      </svg>
      <span>
        {views === null
          ? <span className="inline-block w-8 h-3 bg-[#edeeef] rounded animate-pulse" />
          : <><strong className="text-[#191c1d] font-bold">{fmt(count)}</strong> {t('views')}</>
        }
      </span>
    </div>
  )
}
