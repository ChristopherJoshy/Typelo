import type { CSSProperties } from 'react'
import type { ProfileEffectInfo } from '../types'

interface ProfileEffectFrameProps {
  effect: ProfileEffectInfo
}

const RAINBOW = 'linear-gradient(110deg, #fb7185, #fbbf24, #34d399, #38bdf8, #a78bfa, #fb7185)'

export default function ProfileEffectFrame({ effect }: ProfileEffectFrameProps) {
  const color = effect.color === 'rainbow' ? '#fb7185' : effect.color
  const gradient = effect.color === 'rainbow'
    ? RAINBOW
    : `linear-gradient(110deg, transparent 18%, ${color}45 36%, ${color} 50%, #ffffff 52%, ${color} 56%, transparent 82%)`
  const duration = ['glitch', 'pixels', 'lightning', 'thunder'].includes(effect.animation)
    ? '2.2s'
    : ['rotate', 'galaxy', 'cosmic', 'aurora'].includes(effect.animation)
      ? '6.4s'
      : '4.2s'

  return (
    <span
      className="typelo-profile-effect-frame"
      aria-hidden="true"
      style={{
        '--typelo-profile-effect-gradient': gradient,
        '--typelo-profile-effect-duration': duration,
      } as CSSProperties}
    />
  )
}
