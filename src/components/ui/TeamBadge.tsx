/**
 * TeamBadge — SVG minimaliste pour chaque club
 * Bouclier rempli de la couleur principale + abréviation.
 * Fallback : couleur générée depuis le nom, initiales.
 */

interface TeamInfo { abbr: string; color: string; text?: string }

// ── Map team_id (API-Football) → couleur + abréviation ────────────────────────
const TEAMS: Record<number, TeamInfo> = {
  // Premier League
  33:  { abbr: 'MNU', color: '#DA291C' },          // Man United
  34:  { abbr: 'NEW', color: '#241F20', text: '#fff' }, // Newcastle
  40:  { abbr: 'LIV', color: '#C8102E' },          // Liverpool
  42:  { abbr: 'ARS', color: '#EF0107' },          // Arsenal
  45:  { abbr: 'EVE', color: '#003399' },          // Everton
  46:  { abbr: 'LEI', color: '#003090' },          // Leicester
  47:  { abbr: 'TOT', color: '#132257' },          // Tottenham
  48:  { abbr: 'WHU', color: '#7A263A' },          // West Ham
  49:  { abbr: 'CHE', color: '#034694' },          // Chelsea
  50:  { abbr: 'MCI', color: '#6CABDD', text: '#1c2c5b' }, // Man City
  51:  { abbr: 'BRI', color: '#0057B8' },          // Brighton
  52:  { abbr: 'CRY', color: '#1B458F' },          // Crystal Palace
  55:  { abbr: 'BRE', color: '#E30613' },          // Brentford
  57:  { abbr: 'IPS', color: '#0044A0' },          // Ipswich
  62:  { abbr: 'SHU', color: '#EE2737' },          // Sheffield Utd
  63:  { abbr: 'FUL', color: '#CC0000' },          // Fulham
  65:  { abbr: 'MCI', color: '#6CABDD', text: '#1c2c5b' }, // Man City (alt id)
  66:  { abbr: 'AVL', color: '#670E36' },          // Aston Villa
  67:  { abbr: 'NEW', color: '#241F20', text: '#fff' },
  71:  { abbr: 'NOR', color: '#00A650' },          // Norwich
  73:  { abbr: 'BUR', color: '#6C1D45' },          // Burnley
  76:  { abbr: 'WOL', color: '#FDB913', text: '#231f20' }, // Wolves
  // Ligue 1
  77:  { abbr: 'STR', color: '#1A4189' },          // Strasbourg
  79:  { abbr: 'LIL', color: '#C8102E' },          // Lille
  80:  { abbr: 'OL',  color: '#1E3888' },          // Lyon
  81:  { abbr: 'OM',  color: '#009ADE' },          // Marseille
  82:  { abbr: 'MON', color: '#ED1C24' },          // Monaco
  83:  { abbr: 'NAN', color: '#D4AF37', text: '#000' }, // Nantes
  84:  { abbr: 'NIC', color: '#C8102E' },          // Nice
  85:  { abbr: 'PSG', color: '#004170' },          // Paris SG
  91:  { abbr: 'REN', color: '#C8102E' },          // Rennes
  93:  { abbr: 'LEN', color: '#C8102E' },          // Lens
  94:  { abbr: 'CLM', color: '#C8102E' },          // Clermont
  97:  { abbr: 'BRE', color: '#C8102E' },          // Brest
  // Bundesliga
  155: { abbr: 'FRK', color: '#E1000F' },          // Eintracht Frankfurt
  157: { abbr: 'FCB', color: '#DC052D' },          // Bayern Munich
  158: { abbr: 'HSV', color: '#0B4F9E' },          // Hamburg
  159: { abbr: 'HER', color: '#005CA9' },          // Hertha
  161: { abbr: 'VFB', color: '#E32221' },          // Stuttgart
  162: { abbr: 'WER', color: '#009A44' },          // Werder Bremen
  163: { abbr: 'BMG', color: '#000000', text: '#fff' }, // Borussia MG
  165: { abbr: 'BVB', color: '#FDE100', text: '#231f20' }, // Dortmund
  167: { abbr: 'HOF', color: '#1665A6' },          // Hoffenheim
  168: { abbr: 'B04', color: '#E32221' },          // Leverkusen
  169: { abbr: 'S04', color: '#004FA3' },          // Schalke
  171: { abbr: 'WOB', color: '#009036' },          // Wolfsburg
  172: { abbr: 'RBL', color: '#CC0B2F' },          // Leipzig
  173: { abbr: 'AUG', color: '#BA3733' },          // Augsburg
  // La Liga
  529: { abbr: 'FCB', color: '#A50044' },          // Barcelona
  530: { abbr: 'ATM', color: '#CB3524' },          // Atletico Madrid
  531: { abbr: 'ATH', color: '#EE2523' },          // Athletic Bilbao
  532: { abbr: 'VAL', color: '#EE7C00', text: '#000' }, // Valencia
  533: { abbr: 'VIL', color: '#FFD700', text: '#000' }, // Villarreal
  534: { abbr: 'LAS', color: '#00529F' },          // Las Palmas
  536: { abbr: 'SEV', color: '#D4AF37', text: '#c41230' }, // Sevilla
  538: { abbr: 'CEL', color: '#8BC4E0', text: '#003479' }, // Celta Vigo
  539: { abbr: 'LEV', color: '#C8102E' },          // Levante
  541: { abbr: 'RMA', color: '#FEBE10', text: '#000060' }, // Real Madrid
  543: { abbr: 'RBE', color: '#0B5EAE' },          // Real Betis
  546: { abbr: 'GET', color: '#0B5EAE' },          // Getafe
  548: { abbr: 'ESP', color: '#0B5EAE' },          // Espanyol
  727: { abbr: 'GIR', color: '#CC0000' },          // Girona
  798: { abbr: 'ALA', color: '#C8102E' },          // Alaves
  // Serie A
  487: { abbr: 'LAZ', color: '#87D8F7', text: '#003366' }, // Lazio
  489: { abbr: 'ACM', color: '#FB090B' },          // AC Milan
  492: { abbr: 'NAP', color: '#12A0C3' },          // Napoli
  494: { abbr: 'UDI', color: '#000000', text: '#fff' }, // Udinese
  495: { abbr: 'GEN', color: '#C8102E' },          // Genoa
  496: { abbr: 'JUV', color: '#000000', text: '#fff' }, // Juventus
  497: { abbr: 'ROM', color: '#8E1F2F' },          // Roma
  499: { abbr: 'ATA', color: '#1C6BB0' },          // Atalanta
  500: { abbr: 'BOL', color: '#1A4189' },          // Bologna
  501: { abbr: 'FIO', color: '#4B2E83' },          // Fiorentina
  502: { abbr: 'EMP', color: '#005CA9' },          // Empoli
  503: { abbr: 'TOR', color: '#8B0000' },          // Torino
  504: { abbr: 'VER', color: '#FFD700', text: '#003399' }, // Verona
  505: { abbr: 'INT', color: '#010E80' },          // Inter Milan
  506: { abbr: 'SAL', color: '#C8102E' },          // Salernitana
  511: { abbr: 'SAS', color: '#009A44' },          // Sassuolo
  // MLS (quelques clubs)
  1599: { abbr: 'LAG', color: '#00245D' },         // LA Galaxy
  1601: { abbr: 'SKC', color: '#002F65' },         // Sporting KC
  // Saudi Pro League (quelques clubs)
  2932: { abbr: 'ALN', color: '#007338' },         // Al-Nassr
  2928: { abbr: 'ALH', color: '#007338' },         // Al-Hilal
}

// ── Générer une couleur stable depuis un texte ────────────────────────────────
function hashColor(str: string): string {
  let hash = 0
  for (let i = 0; i < str.length; i++) hash = str.charCodeAt(i) + ((hash << 5) - hash)
  const h = Math.abs(hash) % 360
  return `hsl(${h}, 55%, 38%)`
}

function makeAbbr(name: string): string {
  const words = name.trim().split(/\s+/)
  if (words.length === 1) return words[0].slice(0, 3).toUpperCase()
  if (words.length === 2) return (words[0][0] + words[1].slice(0, 2)).toUpperCase()
  return words.slice(0, 3).map(w => w[0]).join('').toUpperCase()
}

// ── Bouclier SVG ─────────────────────────────────────────────────────────────
// viewBox 0 0 32 36 — forme bouclier symétrique
const SHIELD = "M16 2L30 7V18C30 26 23.5 32.5 16 35C8.5 32.5 2 26 2 18V7L16 2Z"

interface Props {
  teamId:   number
  teamName: string
  size?:    number   // px, default 20
}

export default function TeamBadge({ teamId, teamName, size = 20 }: Props) {
  const info     = TEAMS[teamId]
  const color    = info?.color ?? hashColor(teamName)
  const abbr     = info?.abbr  ?? makeAbbr(teamName)
  const textColor = info?.text ?? '#ffffff'
  const fontSize  = size * 0.28

  return (
    <svg
      width={size}
      height={size * 36 / 32}
      viewBox="0 0 32 36"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
      aria-label={teamName}
    >
      {/* Bouclier rempli */}
      <path d={SHIELD} fill={color} />
      {/* Liseré légèrement plus sombre */}
      <path d={SHIELD} fill="none" stroke="rgba(0,0,0,0.15)" strokeWidth="1" />
      {/* Abréviation */}
      <text
        x="16"
        y="21"
        textAnchor="middle"
        dominantBaseline="middle"
        fill={textColor}
        fontSize={fontSize}
        fontWeight="800"
        fontFamily="system-ui, sans-serif"
        letterSpacing="-0.5"
      >
        {abbr}
      </text>
    </svg>
  )
}
