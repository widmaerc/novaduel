import { localizedHref } from '@/lib/localizedPaths'
import PlayerAvatar from './PlayerAvatar'
import type { Player, FormResult } from './types'

function FormDots({ form }: { form: string }) {
  const results = (form || '').split(',').slice(0, 5) as FormResult[]
  const colors: Record<FormResult, string> = { V: '#22c55e', N: '#f59e0b', D: '#ef4444' }
  return (
    <div className="flex gap-1">
      {results.map((r, i) => (
        <div key={i} className="w-5 h-5 rounded-full flex items-center justify-center text-white font-black"
          style={{ background: colors[r], fontSize: 8 }}>
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
  const accent    = side === 'A' ? '#004782' : '#92000f'
  const accentBg  = side === 'A' ? 'rgba(0,71,130,.04)' : 'rgba(146,0,15,.04)'
  const playerAge = age(player.date_of_birth)
  const isLegend  = playerAge > 60 || player.date_of_birth < '1960-01-01'

  const rows: { label: string; value: React.ReactNode }[] = [
    { label: labels?.born ?? 'Né le', value: `${formatDate(player.date_of_birth, locale)} ${player.flag_emoji}` },
    { 
      label: labels?.age ?? 'Âge', 
      value: isLegend 
        ? `${playerAge} ${labels?.years ?? 'ans'} ${labels?.legend ?? '(†)'}` 
        : `${playerAge} ${labels?.years ?? 'ans'}` 
    },
    { label: labels?.height ?? 'Taille', value: player.height ? `${player.height} ${labels?.heightUnit ?? 'cm'}` : '—' },
    { label: labels?.foot ?? 'Pied',      value: player.preferred_foot || '—' },
    { label: labels?.club ?? 'Club',      value: <span className="truncate max-w-[140px] block text-right">{player.team}</span> },
    { label: labels?.rating ?? 'Note moy.', value: <span className="font-headline font-black text-[14px]" style={{ color: accent }}>{player.rating.toFixed(2)}</span> },
    { label: labels?.form ?? 'Forme',     value: <FormDots form={player.recent_form} /> },
  ]

  return (
    <div className="bg-white rounded-xl overflow-hidden border border-[#eef0f2] shadow-sm text-primary">
      <div className="flex items-center gap-2.5 px-4 py-3 border-b border-[#eef0f2]" style={{ background: side === 'A' ? 'rgba(0,71,130,.05)' : 'rgba(146,0,15,.05)' }}>
        <a href={localizedHref(locale, `/player/${player.slug}`)} className="flex items-center gap-2.5 no-underline hover:opacity-80 transition-opacity">
          <PlayerAvatar initials={player.initials}
            avatarBg={player.avatar_bg} avatarColor={player.avatar_color} size={28} />
          <span className="font-headline font-bold text-[13px] truncate" style={{ color: side === 'A' ? '#004782' : '#92000f' }}>
            {player.name}
          </span>
        </a>
      </div>
      <div className="px-4 py-1">
        {rows.map((row, i) => (
          <div key={i}
            className="flex items-center justify-between gap-3 py-2 border-b border-[#f3f4f5] last:border-0 text-[12px]">
            <span className="text-[#727782] flex-shrink-0">{row.label}</span>
            <span className="font-semibold text-[#191c1d] text-right">{row.value}</span>
          </div>
        ))}
      </div>
      <div className="px-4 pb-3 pt-1">
        <a href={`/${locale}/player/${player.slug}`}
          className="flex items-center justify-center gap-1.5 w-full py-2.5 rounded-lg text-[12px] font-bold no-underline transition-all active:opacity-80"
          style={{ background: accentBg, color: accent, border: `1px solid ${accent}28` }}>
          <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
            <path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2"/>
            <circle cx="12" cy="7" r="4"/>
          </svg>
          {labels?.viewProfile ?? 'Voir la fiche complète'}
        </a>
      </div>
    </div>
  )
}
