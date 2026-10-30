import { memo } from 'react'
import type { CursorInfo, EffectInfo, ProfileBackgroundInfo, ProfileEffectInfo, ProfileBorderInfo } from '../types'
import EffectPreview from './EffectPreview'
import ProfileEffectFrame from './ProfileEffectFrame'
import AvatarDecoration from './AvatarDecoration'
import CursorCosmeticPreview from './CursorCosmeticPreview'

export type CosmeticKind = 'cursor' | 'effect' | 'background' | 'profile_effect' | 'border'
export type CosmeticItem = CursorInfo | EffectInfo | ProfileBackgroundInfo | ProfileEffectInfo | ProfileBorderInfo
export default memo(function CosmeticPreview({ kind, item, active = false }: { kind: CosmeticKind; item: CosmeticItem | null; active?: boolean }) {
  if (!item) return <span className="text-3xl font-light text-white/20" aria-hidden="true">∅</span>
  if (kind === 'cursor') return <CursorCosmeticPreview id={item.id} active={active} />
  if (kind === 'effect') return <EffectPreview effectId={item.id} color={(item as EffectInfo).color} active={active} />
  if (kind === 'background') return <img src={(item as ProfileBackgroundInfo).path} alt="" loading="lazy" decoding="async" className="h-full w-full object-cover" />
  return <div className={`cosmetic-profile-sample ${kind === 'border' ? 'is-border' : ''}`}>
    <span className="cosmetic-sample-avatar">t<span>.</span></span>
    {kind === 'profile_effect' ? <ProfileEffectFrame effect={item as ProfileEffectInfo} active={active} /> : <AvatarDecoration decorationType={`border:${item.id}`} size={86} animate={active} />}
  </div>
})
