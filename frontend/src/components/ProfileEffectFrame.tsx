import { memo } from 'react'
import type { ProfileEffectInfo } from '../types'
import ProfileScene from './profile-art/ProfileScene'

export { cosmeticSeed, visibleCosmeticColor } from '../effects/cosmeticIdentity'

/**
 * Profile effects are full-card painted scenes: atmosphere, one large focal
 * illustration, ambient particles and a gradient frame. The scene is purely
 * decorative and never intercepts pointer input.
 */
export default memo(function ProfileEffectFrame({ effect, active = true }: { effect: ProfileEffectInfo; active?: boolean }) {
  return <ProfileScene effect={effect} active={active} />
})
