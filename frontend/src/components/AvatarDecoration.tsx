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

function polygonPath(points: number, radius: number, rotation = 0) {
  return Array.from({ length: points }, (_, index) => {
    const angle = (index / points) * Math.PI * 2 - Math.PI / 2 + rotation * Math.PI / 180
    const x = 50 + Math.cos(angle) * radius
    const y = 50 + Math.sin(angle) * radius
    return `${index === 0 ? 'M' : 'L'}${x.toFixed(2)} ${y.toFixed(2)}`
  }).join(' ') + ' Z'
}

function radialPath(variant: number, radius: number, seed: number) {
  const samples = 64
  return Array.from({ length: samples }, (_, index) => {
    const angle = (index / samples) * Math.PI * 2 - Math.PI / 2
    const lobes = 6 + variant % 7
    const r = radius + Math.sin(angle * lobes + seed) * (1.1 + variant % 3)
    const x = 50 + Math.cos(angle) * r
    const y = 50 + Math.sin(angle) * r
    return `${index === 0 ? 'M' : 'L'}${x.toFixed(2)} ${y.toFixed(2)}`
  }).join(' ') + ' Z'
}

function ellipsePath(radius: number, ratio: number, rotation: number) {
  const samples = 48
  return Array.from({ length: samples }, (_, index) => {
    const angle = (index / samples) * Math.PI * 2
    const x = Math.cos(angle) * radius
    const y = Math.sin(angle) * radius * ratio
    const rotatedX = x * Math.cos(rotation) - y * Math.sin(rotation)
    const rotatedY = x * Math.sin(rotation) + y * Math.cos(rotation)
    return `${index === 0 ? 'M' : 'L'}${(50 + rotatedX).toFixed(2)} ${(50 + rotatedY).toFixed(2)}`
  }).join(' ') + ' Z'
}

function borderPath(geometry: number, variant: number, seed: number, radius: number) {
  if (geometry === 1) return polygonPath(7 + variant % 6, radius, seed % 26)
  if (geometry === 2) return radialPath(variant, radius, seed % 17)
  if (geometry === 3) {
    const inset = 50 - radius
    return `M50 ${inset} L${50 + radius * .48} ${inset} Q${50 + radius} ${inset} ${50 + radius} ${50 - radius * .48} L${50 + radius} ${50 + radius * .48} Q${50 + radius} ${50 + radius} ${50 + radius * .48} ${50 + radius} L${50 - radius * .48} ${50 + radius} Q${inset} ${50 + radius} ${inset} ${50 + radius * .48} L${inset} ${50 - radius * .48} Q${inset} ${inset} ${50 + radius * .48} ${inset} Z`
  }
  if (geometry === 4) return polygonPath(4, radius, 45 + seed % 20)
  if (geometry === 5) return ellipsePath(radius, .78 + (variant % 4) * .035, (seed % 28) * Math.PI / 180)
  return ''
}

function BorderAccent({ family, palette, index, count, variant }: { family: string; palette: string[]; index: number; count: number; variant: number }) {
  const color = palette[(index + variant) % palette.length] ?? '#e2e8f0'
  const glint = palette[(index + variant + 1) % palette.length] ?? '#fff'
  const angle = index * 360 / count + (variant * 11) % 29
  const angleJitter = (index * 17 + variant * 7) % 11

  return <g className="cosmetic-border-ornament" transform={`rotate(${angle} 50 50)`}>
    <circle cx="50" cy="7" r={1 + (index % 3) * .35} fill={color} opacity=".9" />
    {family === 'petal' && <>
      <ellipse cx="50" cy="3.5" rx={2.1 + (variant % 3) * .45} ry="6.5" fill={color} opacity=".92" />
      <path d="M50 1v9" stroke={glint} strokeWidth=".8" opacity=".82" />
    </>}
    {family === 'flame' && <>
      <path d={`M50 0 C${45 - angleJitter * .15} 6 ${46 + angleJitter * .12} 11 50 16 C${55 - angleJitter * .1} 10 56 5 50 0Z`} fill={color} />
      <path d="M50 6c-2 3-1 5 0 7 2-2 2-4 0-7Z" fill={glint} opacity=".86" />
    </>}
    {(family === 'crystal' || family === 'frost') && <>
      <path d={`M50 0 L${55 + variant % 2} 6.5 50 16 ${45 - variant % 2} 6.5Z`} fill={color} opacity=".9" />
      <path d="M50 1v13M46 6.5h8" stroke={glint} strokeWidth=".8" opacity=".9" />
    </>}
    {(family === 'digital' || family === 'glyph') && <>
      <path d="M43 3h5v4m4-4h5v4M43 13h5V9m4 4h5V9" stroke={color} strokeWidth="1.35" fill="none" />
      <circle cx="50" cy="8" r="1" fill={glint} />
    </>}
    {(family === 'cosmic' || family === 'plasma' || family === 'void') && <>
      <ellipse cx="50" cy="7" rx="8" ry="2.6" stroke={glint} strokeWidth=".8" opacity=".75" />
      <path d="m50 1 1.7 5.2L57 8l-5.3 1.7L50 15l-1.7-5.3L43 8l5.3-1.8Z" fill={color} />
    </>}
    {family === 'electric' && <path d="m52 0-5 7h4l-2 8 6-9h-4Z" fill={color} stroke={glint} strokeWidth=".7" />}
    {(family === 'ripple' || family === 'mist' || family === 'streak') && <>
      <path d="M39 5q5-6 11 0t11 0M42 10q4-4 8 0t8 0" fill="none" stroke={color} strokeWidth="1.2" />
      <circle cx="50" cy="5" r="1.1" fill={glint} />
    </>}
    {family === 'confetti' && <>
      <rect x="44" y="2" width="4" height="5" rx=".8" fill={color} transform="rotate(-18 46 4)" />
      <path d="m54 2 3 4-4 2Z" fill={glint} />
      <circle cx="49" cy="12" r="1.5" fill={color} />
    </>}
    {(family === 'halo' || family === 'spark') && <>
      <path d="M50 0v4M43 2l2 3M57 2l-2 3M42 8h3M58 8h-3" stroke={color} strokeWidth="1.35" />
      <circle cx="50" cy="8" r="2.1" fill={glint} />
    </>}
    {!['petal', 'flame', 'crystal', 'frost', 'digital', 'glyph', 'cosmic', 'plasma', 'void', 'electric', 'ripple', 'mist', 'streak', 'confetti', 'halo', 'spark'].includes(family) && (
      <g transform="translate(38 -4) scale(.9)" stroke={color} fill="none" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"><CosmeticMotif kind={family} /></g>
    )}
  </g>
}

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
  const family = collection?.family ?? motif
  const motion = collection?.motion ?? border.animation ?? 'sway'
  const variant = collection?.variant ?? seed % 50
  const count = 7 + (variant % 4) * 2
  const duration = `${3.4 + (variant % 6) * .55}s`
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
  const glow = border.style === 'glow' || ['spark', 'electric', 'flame', 'crystal', 'cosmic', 'plasma', 'halo'].includes(family)
  const sweep = animate
  const motionClass = !animate ? ''
    : ['glitch', 'matrix', 'pixels', 'lightning', 'thunder'].includes(motion) ? 'cosmetic-border-flicker'
      : ['firestorm', 'phoenix'].includes(motion) ? 'cosmetic-border-surge'
        : ['wave', 'sway', 'aurora', 'shimmer', 'ice', 'shatter', 'float', 'fade'].includes(motion) ? 'cosmetic-border-sway'
          : ['galaxy', 'cosmic', 'plasma', 'quantum', 'rift', 'rings', 'rotate', 'sphere', 'warp', 'void'].includes(motion) ? 'cosmetic-orbit-reverse'
            : family === 'petal' || family === 'halo' ? 'cosmetic-border-bloom' : 'cosmetic-orbit'
  const geometry = variant % 6
  const shapedPath = borderPath(geometry, variant, seed, 42)
  const innerShapePath = borderPath(geometry, variant, seed, 37)

  return <span aria-hidden="true" data-border={border.id} data-active={animate} className={`cosmetic-decoration ${className}`}
    style={{ width: size ?? '100%', height: size ?? '100%', ...(numeric ? { left: '50%', top: '50%', transform: 'translate(-50%, -50%)' } : { inset: 0 }), ...style }}>
    <svg width="100%" height="100%" viewBox="0 0 100 100" fill="none" overflow="visible" data-family={family} data-motion={motion} data-active={animate}
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
      {shapedPath && <path d={shapedPath} stroke={`url(#${gradientId})`} strokeWidth="1.25" strokeDasharray={geometry === 2 ? '1 1.5' : undefined} opacity=".86" />}
      {geometry === 2 && <path d={innerShapePath} stroke={palette[1] ?? color} strokeWidth=".8" opacity=".62" />}
      {geometry === 3 && <path d={borderPath(3, variant, seed, 34)} stroke={palette[1] ?? color} strokeWidth="1" opacity=".65" />}
      {geometry === 4 && <path d={borderPath(1, variant, seed, 46)} stroke={palette[1] ?? color} strokeWidth=".9" strokeDasharray="2 3" opacity=".6" />}
      {geometry === 5 && <path d={ellipsePath(46, .8 + (variant % 4) * .03, -(seed % 28) * Math.PI / 180)} stroke={color} strokeWidth=".8" strokeDasharray="1 4" opacity=".72" />}
      {geometry === 0 && <circle cx="50" cy="50" r="35.5" stroke={`url(#${gradientId})`} strokeWidth="1.1" opacity=".8" />}
      {geometry === 0
        ? <circle cx="50" cy="50" r="40" stroke={`url(#${gradientId})`} strokeWidth={Math.max(1.8, (border.width ?? 3) * .42)}
          strokeDasharray={sweep ? '32 7 3 6' : dash} filter={glow ? `url(#${glowId})` : undefined}
          className={sweep ? 'cosmetic-border-trace' : undefined} />
        : <path d={shapedPath} stroke={`url(#${gradientId})`} strokeWidth={Math.max(1.8, (border.width ?? 3) * .42)}
        strokeDasharray={sweep ? '32 7 3 6' : dash} filter={glow ? `url(#${glowId})` : undefined}
        className={sweep ? 'cosmetic-border-trace' : undefined} />}
      {border.style === 'double' && geometry !== 0 && <path d={innerShapePath} stroke={`url(#${gradientId})`} strokeWidth="1.1" opacity=".8" />}
      {(border.style === 'ridge' || border.style === 'groove' || border.style === 'pixelated') && (
        geometry === 0
          ? <circle cx="50" cy="50" r={border.style === 'groove' ? 35.5 : 44} stroke={`url(#${gradientId})`} strokeWidth="1.1" strokeDasharray={dash} opacity=".82" />
          : <path d={borderPath(geometry, variant, seed, border.style === 'groove' ? 35 : 46)} stroke={`url(#${gradientId})`} strokeWidth="1.1" strokeDasharray={dash} opacity=".82" />
      )}
      <g className={`cosmetic-border-ornaments ${motionClass}`} style={{ transformOrigin: '50px 50px', '--cosmetic-duration': duration } as CSSProperties}>
        {Array.from({ length: count }, (_, index) => <BorderAccent key={index} family={family} palette={palette} index={index} count={count} variant={variant} />)}
      </g>
    </svg>
  </span>
})
