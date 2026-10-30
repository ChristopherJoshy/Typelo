import { memo, useId, type CSSProperties } from 'react'
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
// Identity mappings preserve each item's individual artwork across all consumers.
export const EFFECT_TO_DECORATION = Object.fromEntries(Object.keys(PROFILE_EFFECTS).map(id => [id, id]))
export const BORDER_TO_DECORATION = Object.fromEntries(Object.keys(PROFILE_BORDERS).map(id => [id, `border:${id}`]))
export const DECORATION_TYPES = [...Object.keys(PROFILE_EFFECTS), ...Object.keys(PROFILE_BORDERS)]

const botanical = /green|forest|pink|red|orange|sunset|royal/
export default memo(function AvatarDecoration({ decorationType, size, animate = true, className = '', style }: AvatarDecorationProps) {
  const uid = useId().replace(/:/g, '')
  const borderId = decorationType.startsWith('border:') ? decorationType.slice(7) : decorationType
  const border = decorationType.startsWith('border:') ? PROFILE_BORDERS[borderId] : undefined
  const effect = decorationType.startsWith('border:') ? undefined : PROFILE_EFFECTS[decorationType]
  const seed = cosmeticSeed(borderId)
  const color = visibleCosmeticColor(border?.color ?? '#e2e8f0')
  const numeric = typeof size === 'number'
  const kind = /fire|phoenix|dragon/.test(borderId) ? 'phoenix' : /ice|crystal/.test(borderId) ? 'ice'
    : /electric/.test(borderId) ? 'lightning' : /cosmic|galaxy|rift/.test(borderId) ? 'galaxy'
    : /void|shadow|quantum/.test(borderId) ? 'void' : /divine|gold/.test(borderId) ? 'halo'
    : /pixel|neon/.test(borderId) ? 'pixels' : botanical.test(borderId) ? 'float' : 'rotate'
  const count = 4 + seed % 5
  return <span aria-hidden="true" data-border={border?.id} data-active={animate} className={`cosmetic-decoration ${className}`}
    style={{ width: size ?? '100%', height: size ?? '100%', ...(numeric ? { left: '50%', top: '50%', transform: 'translate(-50%, -50%)' } : { inset: 0 }), ...style }}>
    {effect ? <ProfileEffectFrame effect={effect} active={animate} /> : <svg width="100%" height="100%" viewBox="0 0 100 100" fill="none" overflow="visible">
      <defs><linearGradient id={`border-${uid}`} x1="0" y1="0" x2="1" y2="1">
        <stop stopColor={color} /><stop offset=".45" stopColor={border?.color === 'rainbow' ? '#38bdf8' : '#ffffff'} /><stop offset="1" stopColor={border?.color === 'rainbow' ? '#fb7185' : color} />
      </linearGradient></defs>
      <circle cx="50" cy="50" r="40" stroke={color} strokeWidth="7" opacity=".1" />
      <circle cx="50" cy="50" r="40" stroke={`url(#border-${uid})`} strokeWidth={1.3 + (border?.width ?? 2) * .22}
        strokeDasharray={border?.style === 'dashed' ? '5 4' : border?.style === 'dotted' ? '1 5' : /pixel|quantum/.test(borderId) ? '12 3 2 3' : undefined} />
      {border?.style === 'double' && <circle cx="50" cy="50" r="36" stroke={color} strokeWidth=".8" />}
      <g className={animate && border?.animation ? 'cosmetic-orbit' : undefined} style={{ transformOrigin: '50px 50px', '--cosmetic-duration': `${18 + seed % 13}s` } as CSSProperties}>
        {Array.from({ length: count }, (_, i) => <g key={i} transform={`rotate(${i * 360 / count + seed % 25} 50 50)`}>
          <path d={botanical.test(borderId) ? 'M50 12Q36 2 44 18Q48 20 50 12M50 12Q64 2 56 18Q52 20 50 12' : 'M50 3 54 10 50 17 46 10Z'} fill={color} fillOpacity=".8" stroke={color} strokeWidth=".5" />
        </g>)}
      </g>
      <svg x="38" y="-2" width="24" height="24" viewBox="0 0 24 24" stroke={color} color={color} strokeWidth="1.2" strokeLinecap="round" strokeLinejoin="round"><CosmeticMotif kind={kind} /></svg>
      <path d={`M${19 + seed % 5} 78q24 17 51 0`} stroke={color} strokeWidth="1" opacity=".55" />
    </svg>}
  </span>
})
