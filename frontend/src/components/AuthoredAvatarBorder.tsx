import { memo, useId, type CSSProperties } from 'react'
import type { PROFILE_BORDERS } from '../types'
import { BORDER_RECIPES } from '../effects/borderRecipes'
import { cosmeticIdentity } from '../effects/cosmeticIdentity'
import { useLiveMotion } from './profile-art/useLiveMotion'
import BorderArtwork from './profile-art/BorderArtwork'

/**
 * Illustrated avatar surrounds. A crest, constructed ring and side ornaments
 * frame the avatar while a mask keeps the face itself untouched.
 */
export default memo(function AuthoredAvatarBorder({ border, size, active, className = '', style }: {
  border: (typeof PROFILE_BORDERS)[string]; size?: number | string; active: boolean; className?: string; style?: CSSProperties
}) {
  const uid = useId().replace(/[^a-zA-Z0-9_-]/g, '')
  const [ref, live] = useLiveMotion<HTMLSpanElement>(active)
  const identity = cosmeticIdentity(border.id, border.color ?? border.colors?.[0] ?? '#c4b5fd', border.colors?.[1])
  const recipe = BORDER_RECIPES[border.id]
  const numeric = typeof size === 'number'
  const palette = identity.palette

  return <span
    ref={ref}
    aria-hidden="true"
    data-border={border.id}
    data-active={active}
    data-live={live}
    data-motion={recipe?.[3] ?? 'breathe'}
    data-crest={recipe?.[0] ?? 'stars'}
    data-ring={recipe?.[1] ?? 'solid'}
    className={`cosmetic-decoration authored-avatar-border bf-frame ${className}`}
    style={{
      width: size ?? '100%',
      height: size ?? '100%',
      ...(numeric ? { left: '50%', top: '50%', transform: 'translate(-50%, -50%)' } : { inset: 0 }),
      '--bf-primary': palette.primary,
      '--bf-secondary': palette.secondary,
      '--bf-highlight': palette.highlight,
      '--bf-deep': palette.deep,
      '--bf-tint': palette.tint,
      '--bf-motion-duration': `${5.5 + (identity.seed % 9) * 0.45}s`,
      '--bf-side-duration': `${(5.5 + (identity.seed % 9) * 0.45) * 0.8}s`,
      '--bf-clasp-duration': `${(5.5 + (identity.seed % 9) * 0.45) * 0.62}s`,
      '--bf-motion-delay': `${(-(identity.seed % 61) / 10).toFixed(1)}s`,
      ...style,
    } as CSSProperties & Record<`--bf-${string}`, string>}
  >
    <BorderArtwork border={border} uid={uid} live={live} />
  </span>
})
