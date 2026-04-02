import Link from 'next/link'
import { localizedHref } from '@/lib/localizedPaths'
import PlayerAvatar from './PlayerAvatar'
import type { Player, FormResult } from './types'

function FormDots({ form }: { form: string }) {
  const results = (form || '').split(',').slice(0, 5) as FormResult[]
  const colors: Record<FormResult, string> = { V: '#22c55e', N: '#f59e0b', D: '#ef4444' }
  return (
    <div className="flex gap-1.5">
      {results.map((r, i) => (
        <div key={i} className="w-5 h-5 rounded-md flex items-center justify-center text-white font-hl font-black shadow-sm group-hover:scale-110 transition-transform"
          style={{ background: colors[r], fontSize: 9 }}>
          {r}
        </div>
      ))}
    </div>
  )
}

function formatDate(d: string, locale = 'fr') {
  try {
    return new Date(d + 'T00:00:00').toLocaleDateString(
      locale === 'fr' ? 'fr-FR' : locale === 'es' ? 'es-ES' : 'en-GB',
      { day: '2-digit', month: 'short', year: 'numeric' }
    )
  } catch { return d }
}

function age(dob: string) {
  const b = new Date(dob), now = new Date()
  let a = now.getFullYear() - b.getFullYear()
  if (now.getMonth() - b.getMonth() < 0 || (now.getMonth() === b.getMonth() && now.getDate() < b.getDate())) a--
  return a
}

interface Props { 
  player: Player; side: 'A' | 'B'; locale?: string
  labels?: {
    born: string; age: string; years: string; legend: string
    height: string; heightUnit: string; foot: string; club: string
    rating: string; form: string; viewProfile: string
  }
}

export default function PlayerProfileCard({ player, side, locale = 'fr', labels }: Props) {
  const accent    = side === 'A' ? '#1e40af' : '#dc2626'
  const playerAge = age(player.date_of_birth)
  const isLegend  = playerAge > 60 || (player.date_of_birth && player.date_of_birth < '1960-01-01')

  const rows: { label: string; value: React.ReactNode }[] = [
    { label: labels?.born ?? 'Né le', value: <span className="flex items-center gap-2">{formatDate(player.date_of_birth, locale)} <span className="text-lg">{player.flag_emoji}</span></span> },
    { 
      label: labels?.age ?? 'Âge', 
      value: isLegend 
        ? `${playerAge} ${labels?.years ?? 'ans'} ${labels?.legend ?? '(†)'}` 
        : `${playerAge} ${labels?.years ?? 'ans'}` 
    },
    { label: labels?.height ?? 'Taille', value: player.height ? `${player.height} ${labels?.heightUnit ?? 'cm'}` : '—' },
    { label: labels?.foot ?? 'Pied',      value: player.preferred_foot || '—' },
    { label: labels?.club ?? 'Club',      value: <span className="truncate max-w-[140px] block text-right font-hl font-black text-slate-900 group-hover:text-primary transition-colors">{player.team}</span> },
    { label: labels?.rating ?? 'Note Scout', value: <span className="font-hl font-black text-base" style={{ color: accent }}>{player.rating.toFixed(2)}</span> },
    { label: labels?.form ?? 'État de Forme',     value: <FormDots form={player.recent_form} /> },
  ]

  return (
    <div className="glass-card !p-0 overflow-hidden shadow-xl border-slate-200/50 group">
      <div className="px-5 py-4 border-b border-slate-100 bg-slate-50/50 flex items-center justify-between">
        <Link href={localizedHref(locale, `/player/${player.slug}`)} className="flex items-center gap-3 no-underline group/n min-w-0">
          <div className="relative">
            <div className="absolute inset-x-0 bottom-0 h-1/3 bg-black/10 blur-md rounded-full scale-x-75" />
            <PlayerAvatar initials={player.initials}
              avatarBg={player.avatar_bg} avatarColor={player.avatar_color} size={36} />
          </div>
          <div className="flex flex-col min-w-0">
            <span className="font-hl font-black text-sm truncate text-slate-900 group-hover/n:text-primary transition-colors uppercase tracking-tight">
              {player.name}
            </span>
            <span className="label-caps !text-[9px] !text-slate-400 !font-bold">Fiche détaillée</span>
          </div>
        </Link>
        <div className={`w-2 h-2 rounded-full ${side === 'A' ? 'bg-blue-600' : 'bg-red-600'} opacity-30`} />
      </div>
      
      <div className="p-5 space-y-1">
        {rows.map((row, i) => (
          <div key={i}
            className="flex items-center justify-between gap-3 py-3 border-b border-slate-50 last:border-0 hover:bg-slate-50/50 px-2 rounded-lg transition-all group-hover:first:translate-y-0">
            <span className="label-caps !text-[10px] !text-slate-400 !font-bold">{row.label}</span>
            <span className="font-bold text-slate-700 text-right text-[13px]">{row.value}</span>
          </div>
        ))}
      </div>
      
      <div className="px-5 pb-5 pt-2">
        <Link href={localizedHref(locale, `/player/${player.slug}`)}
          className={`group/btn relative flex items-center justify-center gap-2 w-full py-3.5 rounded-xl text-[12px] font-hl font-black no-underline transition-all overflow-hidden shadow-lg hover:shadow-xl hover:-translate-y-0.5 active:translate-y-0 text-white ${side === 'A' ? 'ai-gradient' : 'bg-gradient-to-br from-red-700 via-red-600 to-red-500'}`}>
          <div className="absolute inset-0 bg-white/20 translate-y-full group-hover/btn:translate-y-0 transition-transform" />
          <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3" className="relative z-10">
            <path d="M18 13v6a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V8a2 2 0 0 1 2-2h6M15 3h6v6M10 14 21 3"/>
          </svg>
          <span className="relative z-10 uppercase tracking-wider">{labels?.viewProfile ?? 'Consulter la Fiche'}</span>
        </Link>
      </div>
    </div>
  )
}
