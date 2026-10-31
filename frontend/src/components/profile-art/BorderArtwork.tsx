import type { BorderRecipe } from '../../effects/borderRecipes'
import { BORDER_RECIPES } from '../../effects/borderRecipes'
import type { CosmeticPalette } from '../../effects/artColor'
import type { ProfileBorderInfo } from '../../types'
import BorderRing from './BorderRing'
import BorderCrest from './BorderCrest'
import SideOrnament from './SideOrnament'
import { cosmeticIdentity } from '../../effects/cosmeticIdentity'

const FALLBACK: BorderRecipe = ['stars', 'solid', 'stars', 'breathe']

interface BorderArtworkProps {
  border: ProfileBorderInfo
  uid: string
  live: boolean
}

function orbitSpark(x: number, y: number, size: number, fill: string) {
  return <path key={`${x}-${y}`} d={`M${x} ${y - size}L${x + size * 0.28} ${y - size * 0.28}L${x + size} ${y}L${x + size * 0.28} ${y + size * 0.28}L${x} ${y + size}L${x - size * 0.28} ${y + size * 0.28}L${x - size} ${y}L${x - size * 0.28} ${y - size * 0.28}Z`} fill={fill} />
}

export default function BorderArtwork({ border, uid, live }: BorderArtworkProps) {
  const identity = cosmeticIdentity(border.id, border.color ?? border.colors?.[0] ?? '#c4b5fd', border.colors?.[1])
  const recipe = BORDER_RECIPES[border.id] ?? FALLBACK
  const [crest, ring, side, motion] = recipe
  const palette: CosmeticPalette = identity.palette
  const maskId = `bf-face-${uid}`
  const auraId = `bf-aura-${uid}`
  const seed = identity.seed

  return <svg width="100%" height="100%" viewBox="0 0 100 100" fill="none" className="bf-svg" aria-hidden="true" data-live={live} data-motion={motion}>
    <defs>
      <mask id={maskId} maskUnits="userSpaceOnUse" x="-20" y="-20" width="140" height="140">
        <rect x="-20" y="-20" width="140" height="140" fill="white" />
        <circle cx="50" cy="50" r="31" fill="black" />
      </mask>
      <radialGradient id={auraId} cx=".5" cy=".5" r=".5">
        <stop stopColor={palette.secondary} stopOpacity=".75" />
        <stop offset=".72" stopColor={palette.primary} stopOpacity=".32" />
        <stop offset="1" stopColor={palette.primary} stopOpacity="0" />
      </radialGradient>
      <linearGradient id={`${uid}-shine`} x1="0" y1="0" x2="1" y2="1">
        <stop offset="0" stopColor="#ffffff" stopOpacity="0" />
        <stop offset=".45" stopColor="#ffffff" stopOpacity=".9" />
        <stop offset=".55" stopColor="#ffffff" stopOpacity=".9" />
        <stop offset="1" stopColor="#ffffff" stopOpacity="0" />
      </linearGradient>
    </defs>
    <g mask={`url(#${maskId})`}>
      <circle className="bf-aura" cx="50" cy="50" r="49" fill={`url(#${auraId})`} opacity=".3" />
      <g className="bf-orbit-sparks">
        {orbitSpark(50, 5.5, 2.2, palette.highlight)}
        {orbitSpark(16, 46, 1.5, palette.secondary)}
        {orbitSpark(84, 58, 1.8, palette.highlight)}
        {orbitSpark(38, 92, 1.2, palette.secondary)}
      </g>
      <g className="bf-side bf-side-left"><SideOrnament side={side} palette={palette} seed={seed} /></g>
      <g className="bf-side bf-side-right" transform="translate(100 0) scale(-1 1)"><SideOrnament side={side} palette={palette} seed={seed} /></g>
      <BorderRing ring={ring} palette={palette} seed={seed} />
      <circle className="bf-shine" cx="50" cy="50" r="45.2" fill="none" stroke={`url(#${uid}-shine)`} strokeWidth="2.1" strokeLinecap="round" strokeDasharray="20 122" />
      <g className="bf-clasp">
        <path d="M50 86.5 54 90.5 50 95 46 90.5Z" fill={palette.highlight} stroke={palette.primary} strokeWidth=".8" />
        <circle cx="50" cy="89.6" r="1.4" fill="#fff" opacity=".8" />
        <path d="M42 88.5c4 1.6 12 1.6 16 0" fill="none" stroke={palette.secondary} strokeWidth=".8" opacity=".55" strokeLinecap="round" />
      </g>
      <BorderCrest crest={crest} palette={palette} seed={seed} />
    </g>
  </svg>
}
