'use client'
import Image from 'next/image'

interface PlayerAvatarProps {
  initials:    string
  avatarBg:    string
  avatarColor: string
  size?:       number
  showBadge?:  boolean
  rating?:     number
  className?:  string
}

export default function PlayerAvatar({
  initials, avatarBg, avatarColor,
  size = 40, showBadge = false, rating, className = '',
}: PlayerAvatarProps) {
  return (
    <div
      className={`relative flex-shrink-0 ${className}`}
      style={{ width: size, height: size }}
    >
      <div style={{ width: '100%', height: '100%', borderRadius: '50%',
        background: avatarBg, color: avatarColor, display: 'flex',
        alignItems: 'center', justifyContent: 'center',
        fontFamily: "'Manrope',sans-serif", fontWeight: 800,
        fontSize: Math.round(size * 0.3), border: '1px solid rgba(0,0,0,.06)' }}>
        {initials}
      </div>
      {showBadge && rating != null && (
        <div className="absolute -bottom-0.5 -right-0.5 rounded-full border-2 border-white"
          style={{ background: '#004782', color: '#fff', fontFamily: "'Manrope',sans-serif",
            fontWeight: 800, fontSize: 9, minWidth: 24, height: 16,
            display: 'flex', alignItems: 'center', justifyContent: 'center', paddingInline: 3 }}>
          {rating.toFixed(1)}
        </div>
      )}
    </div>
  )
}
