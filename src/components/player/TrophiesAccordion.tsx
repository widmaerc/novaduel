"use client";

import { useState } from 'react';

interface Trophy {
  league: string;
  country: string;
  season: string;
  place: string;
}

interface Props {
  wins: Trophy[];
  runners: Trophy[];
  translations: {
    winner: string;
    runner_up: string;
    no_trophies: string;
  };
}

export default function TrophiesAccordion({ wins, runners, translations }: Props) {
  const [expandedSection, setExpandedSection] = useState<'wins' | 'runners' | null>('wins');

  if (wins.length === 0 && runners.length === 0) {
    return <p className="text-[12px] text-slate-400 italic px-1">{translations.no_trophies}</p>;
  }

  const toggleSection = (section: 'wins' | 'runners') => {
    setExpandedSection(expandedSection === section ? null : section);
  };

  return (
    <div className="flex flex-col gap-3">
      {/* SECTION: WINS */}
      {wins.length > 0 && (
        <div className={`glass-card !bg-white rounded-2xl overflow-hidden border transition-all duration-300 ${
          expandedSection === 'wins' ? "border-primary/20 shadow-md ring-1 ring-primary/5" : "border-gray-100"
        }`}>
          <button 
            onClick={() => toggleSection('wins')}
            className={`w-full px-4 py-3 flex items-center justify-between gap-3 text-left transition-colors ${
              expandedSection === 'wins' ? "bg-slate-50/50" : "hover:bg-slate-50/30"
            }`}
          >
            <div className="flex items-center gap-2">
              <span className="text-sm">🏆</span>
              <span className={`label-caps !text-[10px] font-black tracking-widest ${
                expandedSection === 'wins' ? "text-primary" : "text-slate-700"
              }`}>
                {translations.winner.toUpperCase()}
              </span>
              <span className="bg-primary/10 text-primary text-[8px] font-black px-2 py-0.5 rounded-full">
                {wins.length}
              </span>
            </div>
            <span className={`material-symbols-outlined text-slate-400 text-[18px] transition-transform ${
              expandedSection === 'wins' ? "rotate-180 text-primary" : ""
            }`}>
              expand_more
            </span>
          </button>

          <div className={`overflow-hidden transition-all duration-300 ${
            expandedSection === 'wins' ? "max-h-[800px] opacity-100" : "max-h-0 opacity-0"
          }`}>
            <div className="p-3 pt-0 flex flex-col gap-2 border-t border-gray-50">
              {wins.map((trophy, i) => (
                <div key={`w-${i}`} className="flex items-center gap-3 p-2.5 bg-slate-50/50 rounded-xl border border-slate-100 group hover:border-blue-200 transition-all">
                  <div className="min-w-0 flex-1">
                    <div className="text-[12px] font-semibold text-slate-900 truncate">{trophy.league}</div>
                    <div className="label-caps text-primary text-[8px] mt-0.5">{trophy.season}</div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      )}

      {/* SECTION: RUNNERS */}
      {runners.length > 0 && (
        <div className={`glass-card !bg-white rounded-2xl overflow-hidden border transition-all duration-300 ${
          expandedSection === 'runners' ? "border-slate-200 shadow-md" : "border-gray-100"
        }`}>
          <button 
            onClick={() => toggleSection('runners')}
            className={`w-full px-4 py-3 flex items-center justify-between gap-3 text-left transition-colors ${
              expandedSection === 'runners' ? "bg-slate-50/50" : "hover:bg-slate-50/30"
            }`}
          >
            <div className="flex items-center gap-2">
              <span className="text-sm">🥈</span>
              <span className={`label-caps !text-[10px] font-black tracking-widest ${
                expandedSection === 'runners' ? "text-slate-900" : "text-slate-500"
              }`}>
                {translations.runner_up.toUpperCase()}
              </span>
              <span className="bg-slate-100 text-slate-500 text-[8px] font-black px-2 py-0.5 rounded-full">
                {runners.length}
              </span>
            </div>
            <span className={`material-symbols-outlined text-slate-400 text-[18px] transition-transform ${
              expandedSection === 'runners' ? "rotate-180" : ""
            }`}>
              expand_more
            </span>
          </button>

          <div className={`overflow-hidden transition-all duration-300 ${
            expandedSection === 'runners' ? "max-h-[800px] opacity-100" : "max-h-0 opacity-0"
          }`}>
            <div className="p-3 pt-0 flex flex-col gap-2 border-t border-gray-50">
              {runners.map((trophy, i) => (
                <div key={`r-${i}`} className="flex items-center gap-3 p-2.5 bg-slate-50/50 rounded-xl border border-slate-100 group hover:border-slate-200 transition-all opacity-80">
                  <div className="min-w-0 flex-1">
                    <div className="text-[12px] font-semibold text-slate-700 truncate">{trophy.league}</div>
                    <div className="label-caps text-slate-400 text-[8px] mt-0.5">{trophy.season}</div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
