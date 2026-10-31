import type { CSSProperties } from 'react'
import type { AmbientKey } from '../../../effects/effectRecipes'
import type { CosmeticPalette } from '../../../effects/artColor'

interface AmbientFieldProps {
  ambient: AmbientKey
  palette: CosmeticPalette
  seed: number
}

function random(seed: number) {
  let state = seed >>> 0
  return () => {
    state = (state * 22695477 + 1) >>> 0
    return state / 4294967296
  }
}

type ParticleStyle = CSSProperties & Record<`--ps-${string}`, string>

export default function AmbientField({ ambient, palette, seed }: AmbientFieldProps) {
  const rand = random(seed + 91)
  const colors = [palette.primary, palette.secondary, palette.highlight, palette.spark]
  const count = ambient === 'stars' || ambient === 'dust' ? 16 : 13
  return <span className="ps-ambient" aria-hidden="true">
    {Array.from({ length: count }, (_, index) => {
      const edgeZone = index % 4
      const edge = index < count - 4
      let x = rand() * 100
      let y = rand() * 100
      if (edge) {
        if (edgeZone === 0) { x = 3 + rand() * 94; y = 2 + rand() * 18 }
        else if (edgeZone === 1) { x = 82 + rand() * 16; y = 3 + rand() * 94 }
        else if (edgeZone === 2) { x = 3 + rand() * 94; y = 82 + rand() * 16 }
        else { x = 2 + rand() * 16; y = 3 + rand() * 94 }
      }
      const size = ambient === 'bubbles' ? 3 + rand() * 7 : 1.6 + rand() * 4.2
      const drift = 6 + rand() * 18
      const opacity = 0.32 + rand() * 0.5
      const width = ambient === 'confetti' ? size * 1.7 : size
      const height = ambient === 'confetti' ? size * 0.62 : ambient === 'data' ? size * 2.6 : size
      const style: ParticleStyle = {
        left: `${x.toFixed(2)}%`,
        top: `${y.toFixed(2)}%`,
        '--ps-size': `${size.toFixed(2)}px`,
        '--ps-width': `${width.toFixed(2)}px`,
        '--ps-height': `${height.toFixed(2)}px`,
        '--ps-delay': `${(-rand() * 11).toFixed(2)}s`,
        '--ps-duration': `${(4.2 + rand() * 6).toFixed(2)}s`,
        '--ps-drift': `${drift.toFixed(1)}px`,
        '--ps-drift-y': `${(-drift * 0.7).toFixed(1)}px`,
        '--ps-color': colors[index % colors.length],
        '--ps-opacity': `${opacity.toFixed(2)}`,
        '--ps-fade-opacity': `${(opacity * 0.35).toFixed(2)}`,
        '--ps-dim-opacity': `${(opacity * 0.5).toFixed(2)}`,
        '--ps-data-opacity': `${(opacity * 0.9).toFixed(2)}`,
        rotate: `${Math.round(rand() * 360)}deg`,
      }
      return <i key={index} className={`ps-particle ps-particle-${ambient}`} style={style}>{ambient === 'notes' ? '♪' : null}</i>
    })}
  </span>
}
