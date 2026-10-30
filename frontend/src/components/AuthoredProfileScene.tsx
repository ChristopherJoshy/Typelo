import { useId, type CSSProperties } from 'react'
import type { ProfileEffectInfo } from '../types'
import { getScenePalette } from '../effects/scenePalette'
import { useSceneLayout } from '../hooks/useSceneLayout'
import { PROFILE_SCENE_ART } from './ProfileSceneArt'

// Abstract fields can stretch. Illustrated objects use proportional top/bottom scenes.
const stretchScenes = new Set(['glitch_effect','matrix_rain','neon_outline','plasma_field','gravity_warp','smoke_trail','shadow_shift','void_rift','reality_tear','spectrum_drift','ultraviolet','copper_circuit','infinity_engine','world_serpent','jade_serpent','solar_flare','ion_drive'])

export default function AuthoredProfileScene({ effect, active }: { effect: ProfileEffectInfo; active: boolean }) {
  const palette = getScenePalette(effect.id, effect.color)
  const { ref, tall } = useSceneLayout(active)
  const split = tall && !stretchScenes.has(effect.id)
  const art = PROFILE_SCENE_ART[effect.id]
  const uid = useId().replace(/:/g, '')
  const common = { fill: 'none', stroke: `url(#scene-paint-${uid})`, strokeWidth: 1.25, strokeLinecap: 'round' as const, strokeLinejoin: 'round' as const }
  return <span ref={ref} aria-hidden="true" className="authored-profile-scene" data-profile-effect={effect.id} data-active={active} data-layout={split ? 'split' : 'field'}
    style={{ '--scene-ink': palette.ink, '--scene-accent': palette.accent, '--scene-highlight': palette.highlight, '--scene-fill': `url(#scene-fill-${uid})` } as CSSProperties}>
    <svg className="scene-paint-defs" style={{ width: 0, height: 0, position: 'absolute' }}><defs>
      <linearGradient id={`scene-paint-${uid}`} gradientUnits="userSpaceOnUse" x1="0" y1="0" x2="400" y2="260"><stop stopColor={palette.ink}/><stop offset=".45" stopColor={palette.accent}/><stop offset=".7" stopColor={palette.highlight}/><stop offset="1" stopColor={palette.ink}/></linearGradient>
      <radialGradient id={`scene-fill-${uid}`} cx=".3" cy=".2" r=".9"><stop stopColor={palette.highlight} stopOpacity=".8"/><stop offset=".4" stopColor={palette.accent} stopOpacity=".9"/><stop offset="1" stopColor={palette.ink} stopOpacity=".5"/></radialGradient>
    </defs></svg>
    {split ? <>
      <svg {...common} className="scene-top" viewBox="0 0 400 130" preserveAspectRatio="xMidYMin meet"><defs><clipPath id={`scene-top-${uid}`}><rect width="400" height="130" /></clipPath></defs><g clipPath={`url(#scene-top-${uid})`}>{art}</g></svg>
      <svg {...common} className="scene-bottom" viewBox="0 130 400 130" preserveAspectRatio="xMidYMax meet"><defs><clipPath id={`scene-bottom-${uid}`}><rect y="130" width="400" height="130" /></clipPath></defs><g clipPath={`url(#scene-bottom-${uid})`}>{art}</g></svg>
    </> : <svg {...common} viewBox="0 0 400 260" preserveAspectRatio="none">{art}</svg>}
  </span>
}
