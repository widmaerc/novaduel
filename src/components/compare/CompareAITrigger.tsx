'use client'

import { useEffect, useRef, useState } from 'react';
import { useRouter } from 'next/navigation';
import { triggerComparisonInsight } from '@/app/actions/comparisonActions';

interface Props {
  slug: string;
  locale: string;
  hasInsight: boolean;
}

export default function CompareAITrigger({ slug, locale, hasInsight }: Props) {
  const [loading, setLoading] = useState(false);
  const attempted = useRef(false);
  const router = useRouter();

  useEffect(() => {
    if (hasInsight || attempted.current) return;
    attempted.current = true;
    setLoading(true);
    triggerComparisonInsight(slug, locale)
      .then((res) => { if (res.success) router.refresh(); })
      .catch(() => {})
      .finally(() => setLoading(false));
  }, [slug, locale, hasInsight, router]);

  if (!loading) return null;

  return (
    <div className="flex items-center gap-2 mt-4 text-[10px] text-primary/60 font-bold animate-pulse uppercase tracking-widest">
      <span className="material-symbols-outlined text-[14px] animate-spin">refresh</span>
      Generating analysis...
    </div>
  );
}
