import { memo, type CSSProperties } from 'react'
import type { ProfileEffectInfo } from '../types'
import CosmeticMotif from './CosmeticMotif'

export function cosmeticSeed(id: string) {
  return Array.from(id).reduce((seed, char) => (seed * 31 + char.charCodeAt(0)) >>> 0, 7)
}
export function visibleCosmeticColor(color: string) {
  return color === 'rainbow' ? '#c4b5fd' : ['#18181b', '#27272a', '#3f3f46', '#374151'].includes(color) ? '#a78bfa' : color
}

/** Sits above panel backgrounds. The transparent center keeps text and controls clear. */
export default memo(function ProfileEffectFrame({ effect, active = true }: { effect: ProfileEffectInfo; active?: boolean }) {
  const color = visibleCosmeticColor(effect.color)
  const seed = cosmeticSeed(effect.id)
  const variant = seed % 4
  return <span aria-hidden="true" data-profile-effect={effect.id} data-active={active} className={`typelo-profile-effect-frame profile-motion-${effect.animation}`}
    style={{ '--cosmetic-color': color, '--cosmetic-duration': `${4 + seed % 5}s`, '--cosmetic-rotation': `${seed % 40 - 20}deg` } as CSSProperties}>
    <span className="cosmetic-edge" style={{ borderStyle: variant === 1 ? 'dashed' : 'solid', borderWidth: variant === 2 ? 2 : 1,
      background: effect.color === 'rainbow' ? 'linear-gradient(115deg,#fb718518,transparent,#38bdf818)' : undefined }} />
    <span className="cosmetic-atmosphere" />
    {[0, 1, 2, 3, 4, 5].map(i => <svg key={i} className="cosmetic-sigil" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.1" strokeLinecap="round" strokeLinejoin="round"
      style={{ width: 15 + (seed + i * 3) % 12, height: 15 + (seed + i * 3) % 12,
        left: i < 3 ? `${5 + i * 43}%` : undefined, right: i >= 3 ? `${5 + (i - 3) * 43}%` : undefined,
        top: i < 3 ? 5 : undefined, bottom: i >= 3 ? 5 : undefined,
        animationDelay: `${-i * .7}s`, opacity: .55 + (i % 3) * .15 }}>
      <CosmeticMotif kind={effect.animation} />
    </svg>)}
    <span className="cosmetic-corner cosmetic-corner-tl" /><span className="cosmetic-corner cosmetic-corner-br" />
  </span>
})
