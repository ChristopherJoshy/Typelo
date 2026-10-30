import { memo, type CSSProperties } from 'react'
import type { ProfileEffectInfo } from '../types'
import CosmeticMotif from './CosmeticMotif'
import collections from '../data/cosmetics.json'

const collectionsById = new Map(collections.map(collection => [collection.id, collection]))
const effectLayouts: Record<string, readonly [number, number][]> = {
  spark: [[12, 12], [50, 4], [88, 12], [8, 50], [92, 50], [16, 88], [50, 96], [84, 88]],
  petal: [[18, 5], [39, 7], [61, 7], [82, 5], [30, 94], [70, 94]],
  flame: [[10, 8], [34, 5], [50, 3], [66, 5], [90, 8], [50, 96]],
  crystal: [[9, 10], [50, 4], [91, 10], [9, 90], [50, 96], [91, 90]],
  frost: [[18, 8], [50, 5], [82, 8], [18, 92], [50, 95], [82, 92]],
  digital: [[7, 8], [28, 8], [72, 8], [93, 8], [7, 92], [93, 92]],
  cosmic: [[12, 12], [50, 5], [88, 12], [12, 88], [50, 95], [88, 88]],
  plasma: [[10, 30], [28, 8], [72, 8], [90, 30], [24, 92], [76, 92]],
  void: [[14, 14], [50, 8], [86, 14], [14, 86], [50, 92], [86, 86]],
  electric: [[8, 18], [32, 7], [68, 7], [92, 18], [22, 92], [78, 92]],
  ripple: [[50, 4], [7, 30], [93, 30], [7, 70], [93, 70], [50, 96]],
  halo: [[18, 8], [50, 4], [82, 8], [18, 92], [50, 96], [82, 92]],
  confetti: [[12, 10], [34, 6], [66, 6], [88, 10], [27, 94], [73, 94]],
  mist: [[10, 18], [32, 6], [70, 9], [91, 23], [12, 78], [35, 94], [76, 90], [91, 72]],
  streak: [[8, 15], [28, 6], [51, 9], [74, 5], [93, 18], [7, 83], [34, 94], [68, 90], [92, 80]],
  glyph: [[11, 14], [35, 5], [65, 7], [89, 16], [9, 82], [35, 95], [66, 92], [91, 78]],
}

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
  const collection = collectionsById.get(effect.id)
  const family = collection?.family ?? effect.animation
  const motion = collection?.motion ?? effect.animation
  const variant = collection?.variant ?? seed % 8
  const colors = collection ? [collection.color, collection.accent, '#fff'] : [color, '#fff']
  const layout = effectLayouts[family] ?? [[5, 8], [50, 5], [95, 8], [5, 92], [50, 95], [95, 92]]
  const duration = `${2.8 + (variant % 7) * .42}s`
  return <span aria-hidden="true" data-profile-effect={effect.id} data-active={active} data-family={family} data-motion={motion} className={`typelo-profile-effect-frame profile-motion-${motion}`}
    style={{ '--cosmetic-color': color, '--cosmetic-accent': colors[1], '--cosmetic-highlight': colors[2], '--cosmetic-duration': duration, '--cosmetic-rotation': `${seed % 40 - 20}deg`, '--cosmetic-variant': variant } as CSSProperties}>
    <span className="cosmetic-edge" style={{ borderStyle: variant === 1 ? 'dashed' : 'solid', borderWidth: variant === 2 ? 2 : 1,
      background: effect.color === 'rainbow' ? 'linear-gradient(115deg,#fb718518,transparent,#38bdf818)' : undefined }} />
    <span className="cosmetic-atmosphere" />
    {layout.map(([x, y], i) => <svg key={i} className="cosmetic-sigil" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.1" strokeLinecap="round" strokeLinejoin="round"
      data-index={i}
      style={{ width: 15 + (seed + i * 3) % 12, height: 15 + (seed + i * 3) % 12,
        left: `${Math.max(2, Math.min(96, x + (variant % 3) - 1))}%`, top: `${Math.max(2, Math.min(94, y + (variant % 3) - 1))}%`,
        color: colors[i % colors.length], animationDelay: `${-i * .31}s`, opacity: .62 + (i % 3) * .12, transform: `rotate(${(seed + i * 53) % 90 - 45}deg)` }}>
      <CosmeticMotif kind={family} />
    </svg>)}
    <span className="cosmetic-corner cosmetic-corner-tl" /><span className="cosmetic-corner cosmetic-corner-br" />
  </span>
})
