import { memo, useId, type CSSProperties } from 'react'
import cosmeticCollections from '../data/cosmetics.json'
import { PROFILE_BORDERS, PROFILE_EFFECTS } from '../types'
import ProfileEffectFrame, { cosmeticSeed, visibleCosmeticColor } from './ProfileEffectFrame'
import CosmeticMotif from './CosmeticMotif'

interface AvatarDecorationProps {
  decorationType: string
  size?: number | string
  animate?: boolean
  className?: string
  style?: CSSProperties
}

const collectionsById = new Map(cosmeticCollections.map(collection => [collection.id, collection]))

const legacyMotifs: Record<string, string> = {
  solid_white: 'gem', solid_gray: 'round', solid_blue: 'wave', solid_green: 'leaf',
  solid_red: 'thorn', solid_purple: 'flower', solid_pink: 'petal', solid_orange: 'wheat',
  solid_cyan: 'crystal', solid_yellow: 'sun', dashed_white: 'stitch', dotted_white: 'pearl',
  double_gold: 'wheat', double_silver: 'fern', gradient_sunset: 'flower', gradient_ocean: 'wave',
  gradient_forest: 'leaf', gradient_royal: 'flower', thick_neon: 'circuit', thick_violet: 'wisteria',
  ridge_gold: 'honeycomb', groove_blue: 'wave',
}

const animationMotifs: Record<string, string> = {
  aurora: 'aurora', sparkle: 'spark', pulse: 'pulse', glow: 'halo', fire: 'fire', ice: 'crystal',
  galaxy: 'galaxy', plasma: 'plasma', electric: 'lightning', neon: 'neon', void: 'void',
  matrix: 'matrix', rainbow: 'rainbow', rift: 'cosmic', quantum: 'quantum', halo: 'halo',
  supernova: 'cosmic', phoenix: 'fire', dragon: 'flame',
}

const rainbowColors = ['#fb7185', '#fbbf24', '#34d399', '#38bdf8', '#a78bfa']

function getBorderPalette(border: (typeof PROFILE_BORDERS)[string] | undefined) {
  if (border?.color === 'rainbow' || border?.style.includes('rainbow')) return rainbowColors
  const colors = border?.colors?.length ? border.colors : border?.color ? [border.color] : ['#e2e8f0']
  return colors.map(visibleCosmeticColor)
}

function getBorderMotif(id: string, border: (typeof PROFILE_BORDERS)[string] | undefined) {
  const collection = collectionsById.get(id)
  if (collection) return collection.family
  return legacyMotifs[id] ?? animationMotifs[border?.animation ?? ''] ?? 'gem'
}

export const EFFECT_TO_DECORATION = Object.fromEntries(Object.keys(PROFILE_EFFECTS).map(id => [id, id]))
export const BORDER_TO_DECORATION = Object.fromEntries(Object.keys(PROFILE_BORDERS).map(id => [id, `border:${id}`]))
export const DECORATION_TYPES = [...Object.keys(PROFILE_EFFECTS), ...Object.keys(PROFILE_BORDERS)]

export default memo(function AvatarDecoration({ decorationType, size, animate = true, className = '', style }: AvatarDecorationProps) {
  const uid = useId().replace(/:/g, '')
  const isBorder = decorationType.startsWith('border:')
  const id = isBorder ? decorationType.slice(7) : decorationType
  const border = isBorder ? PROFILE_BORDERS[id] : undefined
  const effect = isBorder ? undefined : PROFILE_EFFECTS[id]
  const seed = cosmeticSeed(id)
  const numeric = typeof size === 'number'

  if (effect) {
    return <span aria-hidden="true" className={`cosmetic-decoration ${className}`}
      style={{ width: size ?? '100%', height: size ?? '100%', ...(numeric ? { left: '50%', top: '50%', transform: 'translate(-50%, -50%)' } : { inset: 0 }), ...style }}>
      <ProfileEffectFrame effect={effect} active={animate} />
    </span>
  }
  if (!border) return null

  const palette = getBorderPalette(border)
  const color = palette[Math.floor(palette.length / 2)] ?? '#e2e8f0'
  const collection = collectionsById.get(id)
  const motif = getBorderMotif(id, border)
  const count = 5 + seed % 4
  const duration = `${18 + seed % 13}s`
  const gradientId = `border-gradient-${uid}`
  const glowId = `border-glow-${uid}`
  const finishDash: Record<string, string> = {
    leaf: '2 3', flame: '6 2 1 2', wave: '8 2', blade: '12 2', crystal: '2 2',
    scan: '4 2', circuit: '3 2', pixel: '2 1', split: '4 2', round: '1 3',
    taper: '5 2', bead: '1 3',
  }
  const dash = border.style === 'dashed' ? '5 4'
    : border.style === 'dotted' ? '1 4'
      : border.style === 'pixelated' || /pixel|circuit/.test(motif) ? '3 2'
        : border.style === 'ridge' ? '2 1 1 2' : border.style === 'groove' ? '10 2 2 2'
          : finishDash[collection?.finish ?? '']
  const glow = border.style === 'glow' || ['glow', 'neon', 'plasma', 'halo'].includes(border.animation ?? '')
  const sweep = animate && (border.style === 'animated' || border.style === 'rainbow_animated')
  const orbit = animate && Boolean(border.animation)

  return <span aria-hidden="true" data-border={border.id} data-active={animate} className={`cosmetic-decoration ${className}`}
    style={{ width: size ?? '100%', height: size ?? '100%', ...(numeric ? { left: '50%', top: '50%', transform: 'translate(-50%, -50%)' } : { inset: 0 }), ...style }}>
    <svg width="100%" height="100%" viewBox="0 0 100 100" fill="none" overflow="visible"
      style={{ color, '--cosmetic-duration': duration } as CSSProperties}>
      <defs>
        <linearGradient id={gradientId} x1="0" y1="0" x2="1" y2="1">
          {palette.map((stop, index) => <stop key={`${stop}-${index}`} offset={`${palette.length === 1 ? 50 : index / (palette.length - 1) * 100}%`} stopColor={stop} />)}
        </linearGradient>
        <filter id={glowId} x="-40%" y="-40%" width="180%" height="180%">
          <feGaussianBlur stdDeviation="2.4" result="blur" />
          <feMerge><feMergeNode in="blur" /><feMergeNode in="SourceGraphic" /></feMerge>
        </filter>
      </defs>
      <circle cx="50" cy="50" r="40" stroke={color} strokeWidth="7" opacity=".09" />
      <circle cx="50" cy="50" r="40" stroke={`url(#${gradientId})`} strokeWidth={Math.max(1.8, (border.width ?? 3) * .42)}
        strokeDasharray={sweep ? '46 8' : dash} filter={glow ? `url(#${glowId})` : undefined}
        className={sweep ? 'cosmetic-border-trace' : undefined} />
      {border.style === 'double' && <circle cx="50" cy="50" r="35.5" stroke={`url(#${gradientId})`} strokeWidth="1.1" opacity=".8" />}
      {(border.style === 'ridge' || border.style === 'groove' || border.style === 'pixelated') && (
        <circle cx="50" cy="50" r={border.style === 'groove' ? 35.5 : 44} stroke={`url(#${gradientId})`} strokeWidth="1.1" strokeDasharray={dash} opacity=".82" />
      )}
      <g className={orbit ? 'cosmetic-orbit' : undefined} style={{ transformOrigin: '50px 50px', '--cosmetic-duration': duration } as CSSProperties}>
        {Array.from({ length: count }, (_, index) => <g key={index} transform={`rotate(${index * 360 / count + seed % 29} 50 50)`}>
          <circle cx="50" cy="8" r="1.15" fill={palette[index % palette.length]} opacity=".82" />
          <svg x="42" y=".5" width="16" height="16" viewBox="0 0 24 24" stroke="currentColor" color="currentColor" strokeWidth="1.35" strokeLinecap="round" strokeLinejoin="round">
            <CosmeticMotif kind={collection?.finish && index % 2 === 1 ? collection.finish : motif} />
          </svg>
        </g>)}
      </g>
    </svg>
  </span>
})
