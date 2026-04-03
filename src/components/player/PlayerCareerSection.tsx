import { getTranslations } from 'next-intl/server';
import { getPlayerCareer } from '@/lib/data';
import TeamBadge from '@/components/ui/TeamBadge';
import CareerAccordion from './CareerAccordion';

interface Props {
  playerId: number
  locale: string
}

export default async function PlayerCareerSection({ playerId, locale }: Props) {
  const [t, tc] = await Promise.all([
    getTranslations('PlayerPage'),
    getTranslations('Common'),
  ]);

  const career = await getPlayerCareer(playerId);
  if (!career.length) return null;

  return (
    <div className="flex flex-col gap-6 mt-4">
      <div className="flex items-center gap-2 px-1">
        <span className="material-symbols-outlined text-primary text-[20px]">history_edu</span>
        <h3 className="label-caps text-primary text-[12px]">{t('career.title')}</h3>
      </div>

      <CareerAccordion 
        career={career as any} 
        translations={{
          seasons: tc('labels.seasons'),
          season: tc('labels.season'),
          team: tc('labels.team'),
          matches: tc('stats.matches_played_abbr'),
          goals_assists: tc('stats.goals_assists_abbr'),
          rating: tc('stats.rating'),
        }}
      />
    </div>
  );
}
