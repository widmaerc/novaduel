import { getTranslations } from 'next-intl/server';
import { getPlayerCareer } from '@/lib/data';
import TeamBadge from '@/components/ui/TeamBadge';

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

  const byComp = new Map<string, typeof career>();
  for (const row of career) {
    if (!byComp.has(row.competition)) byComp.set(row.competition, []);
    byComp.get(row.competition)!.push(row);
  }

  return (
    <div className="flex flex-col gap-6 mt-4">
      <div className="flex items-center gap-2 px-1">
        <span className="material-symbols-outlined text-primary text-[20px]">history_edu</span>
        <h3 className="label-caps text-primary text-[12px]">{t('career.title')}</h3>
      </div>

      {Array.from(byComp.entries()).map(([comp, rows]) => (
        <div key={comp} className="glass-card !bg-white rounded-2xl overflow-hidden border border-gray-100 shadow-sm">
          <div className="px-4 py-3 md:px-5 md:py-3.5 border-b border-gray-50 flex items-center justify-between gap-2 bg-slate-50/30">
            <span className="label-caps !text-slate-900 !text-[10px] font-black font-hl tracking-[0.15em]">{comp}</span>
            <div className="flex items-center gap-2">
              <span className="label-caps text-primary bg-primary/5 px-2 py-0.5 rounded-md text-[8px] font-black">
                {rows.length} {rows.length > 1 ? tc('labels.seasons') : tc('labels.season')}
              </span>
            </div>
          </div>

          <div className="overflow-x-auto">
            <table className="w-full border-collapse">
              <thead>
                <tr className="bg-slate-50/50 border-b border-gray-50">
                  <th className="py-2 px-3 text-[9px] font-black text-slate-500 uppercase tracking-widest text-left w-20">{tc('labels.season')}</th>
                  <th className="py-2 px-3 text-[9px] font-black text-slate-500 uppercase tracking-widest text-left">{tc('labels.team')}</th>
                  <th className="py-2 px-3 text-[9px] font-black font-hl text-slate-500 uppercase tracking-widest text-center w-12">{tc('stats.matches_played_abbr')}</th>
                  <th className="py-2 px-3 text-[9px] font-black font-hl text-slate-500 uppercase tracking-widest text-center w-16">{tc('stats.goals_assists_abbr')}</th>
                  <th className="py-2 px-3 text-[9px] font-black text-slate-900 uppercase tracking-widest text-center w-16">{tc('stats.rating')}</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-50">
                {rows.map((row, i) => (
                  <tr key={`${row.season}-${row.team}-${i}`} className="hover:bg-slate-50/50 transition-all group">
                    <td className="py-2 px-3">
                      <span className="label-caps !text-slate-400 !text-[9px] font-black group-hover:text-primary transition-colors">
                        {row.season}
                      </span>
                    </td>
                    <td className="py-2 px-3">
                      <div className="flex items-center gap-2.5">
                        <div className="p-1 px-1.5 bg-white rounded-md shadow-[0_1px_3px_rgba(0,0,0,0.05)] border border-slate-100 group-hover:scale-110 transition-transform">
                          <TeamBadge teamId={row.team_id ?? 0} teamName={row.team} size={14} />
                        </div>
                        <span className="text-[12px] font-bold text-slate-800 truncate max-w-[150px] tracking-tight group-hover:text-primary transition-colors">
                          {row.team}
                        </span>
                      </div>
                    </td>
                    <td className="py-2 px-3 text-center text-[10px] font-bold font-hl text-slate-500">
                      {row.matches || 0}
                    </td>
                    <td className="py-2 px-3">
                      <div className="flex items-center justify-center gap-1.5 font-hl text-[10px]">
                        <span className="text-slate-900 font-extrabold">{row.goals || 0}</span>
                        <span className="text-slate-300 font-medium">/</span>
                        <span className="text-primary font-extrabold">{row.assists || 0}</span>
                      </div>
                    </td>
                    <td className="py-2 px-3 text-center">
                      {row.rating > 0 ? (
                        <span className="inline-block min-w-[32px] font-hl font-black text-[10px] py-0.5 px-1.5 rounded-lg shadow-sm border border-blue-100 bg-blue-50/50 text-blue-600">
                          {row.rating.toFixed(1)}
                        </span>
                      ) : (
                        <span className="label-caps text-slate-300 !text-[8px] font-semibold">—</span>
                      )}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      ))}
    </div>
  );
}
