import { useId, type CSSProperties } from 'react'
import { AVATAR_BORDER_ART } from './AvatarBorderArt'
import { getScenePalette } from '../effects/scenePalette'
import type { PROFILE_BORDERS } from '../types'

const accents: Record<string,string> = {
 solid_white:'#a78bfa',solid_gray:'#fbbf24',solid_blue:'#34d399',solid_green:'#facc15',solid_red:'#fb7185',solid_purple:'#f472b6',solid_pink:'#fbbf24',solid_orange:'#ef4444',solid_cyan:'#a78bfa',solid_yellow:'#fb923c',dashed_white:'#f472b6',dotted_white:'#f9a8d4',double_gold:'#f97316',double_silver:'#a3e635',gradient_sunset:'#f472b6',gradient_ocean:'#34d399',gradient_forest:'#facc15',gradient_royal:'#f472b6',thick_neon:'#fbbf24',thick_violet:'#f9a8d4',ridge_gold:'#fb923c',groove_blue:'#2dd4bf',glow_cyan:'#c084fc',glow_pink:'#facc15',glow_green:'#fef08a',glow_gold:'#f97316',gradient_fire:'#ef4444',gradient_ice:'#a78bfa',gradient_cosmic:'#f472b6',animated_pulse:'#fbbf24',animated_glow:'#f9a8d4',pixelated:'#f472b6',rainbow_solid:'#f472b6',rainbow_animated:'#34d399',plasma_border:'#fb7185',fire_border:'#facc15',ice_border:'#a78bfa',electric_border:'#facc15',neon_animated:'#f472b6',shadow_border:'#c084fc',galaxy_border:'#f472b6',aurora_border:'#34d399',supernova_border:'#fb923c',phoenix_border:'#facc15',dragon_border:'#fb923c',crystal_border:'#f9a8d4',void_border:'#e879f9',cosmic_rift:'#2dd4bf',quantum_border:'#f472b6',divine_halo:'#fbbf24',
}

export default function AuthoredAvatarBorder({ border, size, active, className = '', style }: {
 border: (typeof PROFILE_BORDERS)[string]; size?: number | string; active: boolean; className?: string; style?: CSSProperties
}) {
 const uid = useId().replace(/:/g, '')
 const primary = border.colors?.[0] ?? border.color ?? '#c4b5fd'
 const palette = getScenePalette(border.id, primary)
 if (accents[border.id]) palette.accent = accents[border.id]
 const numeric = typeof size === 'number'
 return <span aria-hidden="true" data-border={border.id} data-active={active} className={`cosmetic-decoration authored-avatar-border ${className}`}
  style={{ width:size ?? '100%', height:size ?? '100%', ...(numeric ? {left:'50%',top:'50%',transform:'translate(-50%, -50%)'} : {inset:0}), '--border-ink':palette.ink, '--border-accent':palette.accent, '--border-fill':`url(#border-fill-${uid})`, ...style } as CSSProperties & Record<`--${string}`, string>}>
  <svg width="100%" height="100%" viewBox="0 0 100 100" fill="none" stroke={`url(#border-paint-${uid})`} strokeWidth="1.75" strokeLinecap="round" strokeLinejoin="round">
   <defs>
    <linearGradient id={`border-paint-${uid}`} gradientUnits="userSpaceOnUse" x1="0" y1="0" x2="100" y2="100"><stop stopColor={palette.ink}/><stop offset=".35" stopColor={palette.accent}/><stop offset=".7" stopColor={palette.accent}/><stop offset=".74" stopColor={palette.highlight}/><stop offset=".79" stopColor={palette.accent}/><stop offset="1" stopColor={palette.ink}/></linearGradient>
    <radialGradient id={`border-fill-${uid}`} cx=".3" cy=".2" r=".9"><stop stopColor={palette.accent}/><stop offset=".15" stopColor={palette.highlight}/><stop offset=".3" stopColor={palette.accent}/><stop offset="1" stopColor={palette.ink}/></radialGradient>
    <mask id={`border-face-${uid}`} maskUnits="userSpaceOnUse" x="-10" y="-10" width="120" height="120"><rect x="-10" y="-10" width="120" height="120" fill="white" stroke="none"/><circle cx="50" cy="50" r="31" fill="black" stroke="none"/></mask>
   </defs>
   <g mask={`url(#border-face-${uid})`}>{AVATAR_BORDER_ART[border.id]}</g>
  </svg>
 </span>
}
