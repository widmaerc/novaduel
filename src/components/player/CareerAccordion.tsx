"use client";

import { useState } from 'react';
import TeamBadge from '@/components/ui/TeamBadge';

interface CareerRow {
  season: string;
  competition: string;
  team: string;
  team_id?: number;
  matches: number;
  goals: number;
  assists: number;
  rating: number;
}

interface Props {
  career: CareerRow[];
  translations: {
    seasons: string;
    season: string;
    team: string;
    matches: string;
    goals_assists: string;
    rating: string;
  };
}

export default function CareerAccordion({ career, translations }: Props) {
  // Grouper par compétition
  const byComp = new Map<string, CareerRow[]>();
  for (const row of career) {
    if (!byComp.has(row.competition)) byComp.set(row.competition, []);
    byComp.get(row.competition)!.push(row);
  }

  const comps = Array.from(byComp.entries());
  
  // État pour savoir quelle section est ouverte. Par défaut la première (la plus récente غالبا)
  const [expandedComp, setExpandedComp] = useState<string | null>(comps[0]?.[0] || null);

  const toggleComp = (comp: string) => {
    setExpandedComp(expandedComp === comp ? null : comp);
  };

  return (
    <div className="flex flex-col gap-3">
      {comps.map(([comp, rows]) => {
        const isExpanded = expandedComp === comp;
        
        return (
          <div 
            key={comp} 
            className={`glass-card !bg-white rounded-2xl overflow-hidden border transition-all duration-300 ${
              isExpanded ? "border-primary/20 shadow-md ring-1 ring-primary/5" : "border-gray-100 shadow-sm"
            }`}
          >
            {/* Header / Trigger */}
            <button 
              onClick={() => toggleComp(comp)}
              className={`w-full px-4 py-3 md:px-5 md:py-4 flex items-center justify-between gap-3 text-left transition-colors ${
                isExpanded ? "bg-slate-50/50" : "hover:bg-slate-50/30"
              }`}
            >
              <div className="flex items-center gap-3">
                <span className={`label-caps !text-[11px] font-black font-hl tracking-[0.15em] transition-colors ${
                  isExpanded ? "!text-primary" : "!text-slate-900"
                }`}>
                  {comp}
                </span>
                <span className="label-caps bg-slate-100 text-slate-500 px-2 py-0.5 rounded-md text-[8px] font-black">
                  {rows.length} {rows.length > 1 ? translations.seasons : translations.season}
                </span>
              </div>
              
              <span className={`material-symbols-outlined text-slate-400 text-[20px] transition-transform duration-300 ${
                isExpanded ? "rotate-180 text-primary" : ""
              }`}>
                expand_more
              </span>
            </button>

            {/* Content Table (Animated height/opacity) */}
            <div className={`overflow-hidden transition-all duration-300 ease-in-out ${
              isExpanded ? "max-h-[1000px] opacity-100" : "max-h-0 opacity-0"
            }`}>
              <div className="overflow-x-auto border-t border-gray-50">
                <table className="w-full border-collapse">
                  <thead>
                    <tr className="bg-slate-50/30 border-b border-gray-50">
                      <th className="py-2.5 px-4 text-[9px] font-black text-slate-500 uppercase tracking-widest text-left w-20">{translations.season}</th>
                      <th className="py-2.5 px-4 text-[9px] font-black text-slate-500 uppercase tracking-widest text-left">{translations.team}</th>
                      <th className="py-2.5 px-4 text-[9px] font-black font-hl text-slate-500 uppercase tracking-widest text-center w-12">{translations.matches}</th>
                      <th className="py-2.5 px-4 text-[9px] font-black font-hl text-slate-500 uppercase tracking-widest text-center w-16">{translations.goals_assists}</th>
                      <th className="py-2.5 px-4 text-[9px] font-black text-slate-900 uppercase tracking-widest text-center w-16">{translations.rating}</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-gray-50">
                    {rows.map((row, i) => (
                      <tr key={`${row.season}-${row.team}-${i}`} className="hover:bg-slate-50/50 transition-all group">
                        <td className="py-2.5 px-4">
                          <span className="label-caps !text-slate-400 !text-[9px] font-black group-hover:text-primary transition-colors">
                            {row.season}
                          </span>
                        </td>
                        <td className="py-2.5 px-4">
                          <div className="flex items-center gap-2.5">
                            <div className="p-1 px-1.5 bg-white rounded-md shadow-[0_1px_2px_rgba(0,0,0,0.05)] border border-slate-100 group-hover:scale-105 transition-transform">
                              <TeamBadge teamId={row.team_id ?? 0} teamName={row.team} size={14} />
                            </div>
                            <span className="text-[12px] font-bold text-slate-800 truncate max-w-[140px] tracking-tight group-hover:text-primary transition-colors">
                              {row.team}
                            </span>
                          </div>
                        </td>
                        <td className="py-2.5 px-4 text-center text-[10px] font-bold font-hl text-slate-500">
                          {row.matches || 0}
                        </td>
                        <td className="py-2.5 px-4">
                          <div className="flex items-center justify-center gap-1.5 font-hl text-[10px]">
                            <span className="text-slate-900 font-extrabold">{row.goals || 0}</span>
                            <span className="text-slate-300 font-medium">/</span>
                            <span className="text-primary font-extrabold">{row.assists || 0}</span>
                          </div>
                        </td>
                        <td className="py-2.5 px-4 text-center">
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
          </div>
        );
      })}
    </div>
  );
}
