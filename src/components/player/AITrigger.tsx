'use client'

import { useEffect, useRef, useState } from 'react'
import { useRouter } from 'next/navigation'
import { triggerAIAnalysis } from '@/app/actions/playerActions'
import { useTranslations } from 'next-intl'

interface Props {
  playerId: number
  locale: string
  slug: string
  hasInsight: boolean
}

export default function AITrigger({ playerId, locale, slug, hasInsight }: Props) {
  const [loading, setLoading] = useState(false)
  const attempted = useRef(false)
  const router = useRouter()
  const t = useTranslations('Player')

  useEffect(() => {
    if (hasInsight || attempted.current) return
    attempted.current = true
    setLoading(true)
    triggerAIAnalysis(playerId, locale, slug)
      .then((res) => { if (res.success) router.refresh() })
      .catch(() => {})
      .finally(() => setLoading(false))
  }, [playerId, locale, slug, hasInsight, router])

  if (!loading) return null

  return (
    <div className="flex items-center gap-2 mt-4 text-[10px] text-primary/60 font-bold animate-pulse uppercase tracking-widest">
      <span className="material-symbols-outlined text-[14px] animate-spin">refresh</span>
      {t('ai.generating')}
    </div>
  )
}
