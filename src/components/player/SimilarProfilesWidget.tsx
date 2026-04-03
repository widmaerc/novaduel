import { getTranslations, getLocale } from 'next-intl/server';
import Link from 'next/link';
import { getSimilarPlayers } from '@/lib/data';
import { localizedHref } from '@/lib/localizedPaths';

interface Props {
  playerId: number;
}

export default async function SimilarProfilesWidget({ playerId }: Props) {
  const pid = Number(playerId);

  const [t, locale, similar] = await Promise.all([
    getTranslations('PlayerPage'),
    getLocale(),
    getSimilarPlayers(pid, 4)
  ]);

  if (!similar || similar.length === 0) return null;

  return (
    <div className="glass-card !bg-white border-blue-100/50 relative overflow-hidden shadow-sm h-full flex flex-col">
      {/* Subtle background glow */}
      <div className="absolute -top-12 -right-12 w-32 h-32 bg-blue-500/5 rounded-full blur-3xl pointer-events-none" />
      
      {/* Header - Professional & Clean */}
      <div className="p-5 border-b border-slate-50 bg-slate-50/30">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <span className="material-symbols-outlined text-primary text-[18px]">query_stats</span>
            <h3 className="label-caps !text-slate-900 text-[11px] font-black tracking-[0.15em]">
              {t('sections.similar_profiles')}
            </h3>
          </div>
          <span className="bg-primary/10 text-primary text-[8px] font-black uppercase px-2 py-0.5 rounded-md">
            AI Score
          </span>
        </div>
      </div>

      {/* List content */}
      <div className="p-3 flex flex-col gap-1.5 flex-grow">
        {similar.map((s) => (
          <Link 
            key={s.id} 
            href={localizedHref(locale, `/player/${s.slug}`)} 
            className="group/player flex items-center justify-between p-3 rounded-2xl no-underline hover:bg-slate-50 transition-all border border-transparent hover:border-slate-100"
          >
            <div className="flex items-center gap-3">
              {/* Avatar Container with Club Logo Overlay */}
              <div className="relative shrink-0">
                <div 
                  className="w-10 h-10 rounded-full flex items-center justify-center font-hl font-extrabold text-[11px] uppercase shadow-sm border border-white/50"
                  style={{ 
                    backgroundColor: s.avatar_bg || '#f1f5f9', 
                    color: s.avatar_color || '#1e40af' 
                  }}
                >
                  {s.initials || s.name.substring(0, 2)}
                </div>
                {s.team_logo_url && (
                  <img 
                    src={s.team_logo_url} 
                    alt="team" 
                    className="absolute -bottom-1 -right-1 w-4 h-4 rounded-full bg-white border border-slate-100 shadow-sm p-0.5"
                  />
                )}
              </div>

              {/* Name & Position */}
              <div className="flex flex-col">
                <span className="text-[14px] font-bold text-slate-900 group-hover/player:text-primary transition-colors truncate max-w-[120px] tracking-tight">
                  {s.name}
                </span>
                <span className="text-[10px] font-bold text-slate-400 label-caps tracking-widest mt-0.5">
                  {s.position}
                </span>
              </div>
            </div>

            {/* Rating Badge */}
            <div className="flex items-center">
               <span className="text-[11px] font-black font-hl px-2 py-1 rounded-lg bg-slate-50 border border-slate-100 text-slate-900 group-hover/player:bg-primary group-hover/player:text-white group-hover/player:border-primary transition-all">
                {(() => {
                  const r = typeof s.rating === 'string' ? parseFloat(s.rating) : s.rating;
                  return r > 0 ? r.toFixed(1) : '—';
                })()}
              </span>
            </div>
          </Link>
        ))}
      </div>

      {/* Analytical Footer */}
      <div className="p-4 pt-1 bg-slate-50/30 border-t border-slate-50">
        <p className="text-[9px] text-slate-400 font-medium italic opacity-70 leading-relaxed">
          * {t('sections.similar_profiles_footer')}
        </p>
      </div>
    </div>
  );
}
