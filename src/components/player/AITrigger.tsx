'use client'

import { useEffect, useState } from 'react'
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
  const t = useTranslations('Player')

  useEffect(() => {
    if (!hasInsight && !loading) {
      setLoading(true)
      triggerAIAnalysis(playerId, locale, slug)
        .finally(() => setLoading(false))
    }
  }, [playerId, locale, slug, hasInsight, loading])

  if (!hasInsight && loading) {
    return (
      <div className="flex items-center gap-2 mt-4 text-[10px] text-primary/60 font-bold animate-pulse uppercase tracking-widest">
        <span className="material-symbols-outlined text-[14px] animate-spin">refresh</span>
        {t('ai.generating')}
      </div>
    )
  }

  return null
}
