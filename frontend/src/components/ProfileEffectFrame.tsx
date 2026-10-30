import { memo } from 'react'
import type { ProfileEffectInfo } from '../types'
import AuthoredProfileScene from './AuthoredProfileScene'
import { PROFILE_SCENE_ART } from './ProfileSceneArt'

// Retained for avatar decorations and other cosmetic consumers during their rework.
export function cosmeticSeed(id: string) {
  return Array.from(id).reduce((seed, char) => (seed * 31 + char.charCodeAt(0)) >>> 0, 7)
}
export function visibleCosmeticColor(color: string) {
  return color === 'rainbow' ? '#c4b5fd' : ['#18181b', '#27272a', '#3f3f46', '#374151'].includes(color) ? '#a78bfa' : color
}

/** Every catalog profile effect has an authored scene; no shared frame fallback. */
export default memo(function ProfileEffectFrame({ effect, active = true }: { effect: ProfileEffectInfo; active?: boolean }) {
  return PROFILE_SCENE_ART[effect.id] ? <AuthoredProfileScene effect={effect} active={active} /> : null
})
