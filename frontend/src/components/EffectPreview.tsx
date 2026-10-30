import { useId } from 'react'
import { motion, useReducedMotion } from 'framer-motion'
import { getEffectVisual } from '../effects/visuals'
import type { EffectFamily } from '../effects/visuals'

interface EffectPreviewProps {
  effectId: string
  color: string
  active?: boolean
}

const points: Record<string, readonly [number, number][]> = {
  spark: [[42, 40], [66, 28], [85, 48], [57, 60]],
  ripple: [[45, 38], [68, 54]],
  petal: [[44, 39], [67, 51], [84, 36]],
  frost: [[43, 40], [69, 55]],
  heart: [[45, 39], [70, 50]],
  glyph: [[48, 37], [74, 51]],
  streak: [[45, 39], [70, 50], [87, 35]],
  mist: [[46, 40], [68, 51], [84, 35]],
  flame: [[44, 41], [66, 50], [84, 35]],
  electric: [[43, 39], [66, 50], [84, 34]],
  digital: [[44, 40], [68, 52], [84, 35]],
  plasma: [[45, 40], [69, 50]],
  crystal: [[45, 39], [69, 51]],
  cosmic: [[43, 40], [67, 51], [84, 34]],
  void: [[45, 41], [68, 51]],
  confetti: [[42, 39], [64, 53], [83, 35]],
  halo: [[48, 39], [72, 51]],
}

const trailPaths: Record<EffectFamily, string> = {
  spark: 'M 16 64 L 34 59 L 43 45 L 54 53 L 64 34 L 76 42 L 91 22 L 112 17',
  ripple: 'M 16 63 C 38 60 33 39 49 34 C 67 28 71 50 85 49 C 105 48 96 25 112 18',
  petal: 'M 16 65 C 31 61 32 42 45 39 C 56 37 56 53 67 50 C 83 45 82 28 112 18',
  frost: 'M 16 62 L 30 55 L 39 59 L 49 43 L 61 49 L 70 32 L 82 39 L 95 20 L 112 16',
  heart: 'M 16 63 C 31 58 31 39 45 39 C 57 39 54 55 67 53 C 82 52 86 31 112 18',
  glyph: 'M 16 63 L 32 63 L 32 53 L 49 53 L 49 43 L 67 43 L 67 33 L 84 33 L 84 23 L 112 18',
  streak: 'M 16 62 C 48 58 70 37 112 18',
  mist: 'M 16 62 C 29 48 37 70 50 53 C 64 35 73 62 84 42 C 93 27 101 34 112 18',
  flame: 'M 16 65 C 33 58 29 42 44 48 C 54 52 51 29 65 37 C 76 43 72 25 86 29 C 98 32 100 22 112 17',
  electric: 'M 16 63 L 32 58 L 38 47 L 49 51 L 55 34 L 68 40 L 77 25 L 91 30 L 101 19 L 112 16',
  digital: 'M 16 62 H 35 V 54 H 50 V 45 H 66 V 36 H 82 V 27 H 98 V 19 H 112',
  plasma: 'M 16 62 C 36 57 37 42 49 43 C 63 44 62 60 78 48 C 95 35 85 24 112 18',
  crystal: 'M 16 63 L 32 55 L 40 58 L 53 38 L 63 45 L 77 25 L 87 33 L 99 19 L 112 16',
  cosmic: 'M 16 63 C 33 58 37 44 49 46 C 64 49 58 31 76 33 C 92 35 90 20 112 17',
  void: 'M 16 63 C 38 64 31 43 48 41 C 68 38 64 59 81 50 C 96 42 87 25 112 18',
  confetti: 'M 16 63 C 34 60 39 45 52 48 C 65 51 63 32 79 37 C 95 42 96 21 112 17',
  halo: 'M 16 64 C 34 62 35 47 51 45 C 70 42 70 56 87 43 C 100 33 99 24 112 18',
}

function Star({ x, y, size }: { x: number; y: number; size: number }) {
  return (
    <path
      d={`M ${x} ${y - size} L ${x + size * 0.22} ${y - size * 0.22} L ${x + size} ${y} L ${x + size * 0.22} ${y + size * 0.22} L ${x} ${y + size} L ${x - size * 0.22} ${y + size * 0.22} L ${x - size} ${y} L ${x - size * 0.22} ${y - size * 0.22} Z`}
      fill="currentColor"
    />
  )
}

function Snowflake({ x, y, size }: { x: number; y: number; size: number }) {
  return (
    <g transform={`translate(${x} ${y})`} fill="none" stroke="currentColor" strokeWidth="1.35" strokeLinecap="round">
      {[0, 60, 120].map(angle => (
        <path key={angle} transform={`rotate(${angle})`} d={`M 0 ${-size} V ${size} M 0 ${-size * 0.55} l ${-size * 0.24} ${size * 0.24} M 0 ${-size * 0.55} l ${size * 0.24} ${size * 0.24}`} />
      ))}
    </g>
  )
}

function EffectMarks({ family, effectId, color, blurId }: { family: string; effectId: string; color: string; blurId: string }) {
  const coords = points[family] ?? points.spark
  const secondary = color === '#18181b' || color === '#27272a' ? '#a78bfa' : '#ffffff'

  switch (family) {
    case 'spark':
      return <g fill={color}>{coords.map(([x, y], i) => <Star key={i} x={x} y={y} size={i === 1 ? 5 : 3.3} />)}</g>
    case 'ripple':
      return <g fill="none" stroke={color} strokeWidth="1.4">{coords.map(([x, y], i) => <g key={i}><circle cx={x} cy={y} r="5" opacity=".8" /><circle cx={x} cy={y} r="9" opacity=".42" /><circle cx={x} cy={y} r="13" opacity=".18" /></g>)}</g>
    case 'petal':
      return <g fill={color} opacity=".92">{coords.map(([x, y], i) => <ellipse key={i} cx={x} cy={y} rx="2.7" ry="6" transform={`rotate(${i * 45 - 25} ${x} ${y})`} />)}</g>
    case 'frost':
      return <g stroke={color}>{coords.map(([x, y], i) => <Snowflake key={i} x={x} y={y} size={i ? 5 : 7} />)}</g>
    case 'heart':
      return <g fill={color}>{coords.map(([x, y], i) => <path key={i} transform={`translate(${x - 5} ${y - 5}) scale(.45)`} d="M 12 21 C 9 18 2 13 2 8 C 2 2 10 1 12 6 C 15 1 22 2 22 8 C 22 13 15 19 12 21 Z" />)}</g>
    case 'glyph':
      return <g fill={color} fontFamily="ui-monospace, monospace" fontSize="12" textAnchor="middle">{coords.map(([x, y], i) => <text key={i} x={x} y={y + 4}>{effectId === 'music' ? (i ? '♫' : '♪') : effectId === 'infinity' ? '∞' : '0'}</text>)}</g>
    case 'streak':
      return <g fill="none" stroke={color} strokeLinecap="round">{coords.map(([x, y], i) => <path key={i} d={`M ${x - 11 - i * 2} ${y + 3} Q ${x - 3} ${y - 2} ${x + 7} ${y}`} strokeWidth={i ? 1 : 1.7} opacity={.8 - i * .14} />)}</g>
    case 'mist':
      return <g fill={color} opacity=".25" filter={`url(#${blurId})`}>{coords.map(([x, y], i) => <circle key={i} cx={x} cy={y} r={8 + (i % 2) * 3} />)}</g>
    case 'flame':
      return <g fill={color}>{coords.map(([x, y], i) => <path key={i} d={`M ${x} ${y + 7} C ${x - 6} ${y + 2} ${x + 2} ${y - 2} ${x + 1} ${y - 9} C ${x + 10} ${y - 2} ${x + 6} ${y + 5} ${x} ${y + 7} Z`} opacity={.7 + i * .08} />)}</g>
    case 'electric':
      return <g fill="none" stroke={color} strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">{coords.map(([x, y], i) => <path key={i} d={`M ${x + 1} ${y - 8} L ${x - 4} ${y - 1} L ${x} ${y} L ${x - 2} ${y + 8} L ${x + 5} ${y - 2} L ${x + 1} ${y - 2} Z`} />)}</g>
    case 'digital':
      return <g fill={color}>{coords.map(([x, y], i) => <g key={i}><rect x={x - 4} y={y - 4} width="4" height="4" /><rect x={x + 1} y={y - 1} width="3" height="3" opacity=".55" /><rect x={x - 2} y={y + 2} width="2" height="2" opacity=".75" /></g>)}</g>
    case 'plasma':
      return <g fill="none" stroke={color}>{coords.map(([x, y], i) => <g key={i}><ellipse cx={x} cy={y} rx="10" ry="4" strokeWidth="1.3" transform={`rotate(${i ? -25 : 25} ${x} ${y})`} /><circle cx={x} cy={y} r="2.2" fill={secondary} stroke="none" /></g>)}</g>
    case 'crystal':
      return <g fill={color} stroke={secondary} strokeWidth=".7">{coords.map(([x, y], i) => <g key={i}><path d={`M ${x} ${y - 8} L ${x + 5} ${y - 1} L ${x + 3} ${y + 7} L ${x - 3} ${y + 7} L ${x - 5} ${y - 1} Z`} opacity=".8" /><path d={`M ${x} ${y - 7} V ${y + 6} L ${x + 3} ${y + 2}`} fill="none" /></g>)}</g>
    case 'cosmic':
      return <g fill={color} stroke={color}>{coords.map(([x, y], i) => <g key={i}><Star x={x} y={y} size={i === 1 ? 4.2 : 2.7} /><ellipse cx={x} cy={y} rx="10" ry="3" fill="none" strokeWidth=".8" opacity=".5" transform={`rotate(${i * 38} ${x} ${y})`} /></g>)}</g>
    case 'void':
      return <g fill="none" stroke={color}>{coords.map(([x, y], i) => <g key={i}><circle cx={x} cy={y} r="6" fill="#08050d" strokeWidth="1.3" /><ellipse cx={x} cy={y} rx="11" ry="3" strokeWidth="1" opacity=".62" transform={`rotate(${i ? 28 : -28} ${x} ${y})`} /></g>)}</g>
    case 'confetti':
      return <g fill={color}>{coords.map(([x, y], i) => <rect key={i} x={x - 2} y={y - 5} width="4" height="9" rx="1" transform={`rotate(${i * 35 - 25} ${x} ${y})`} opacity=".85" />)}</g>
    case 'halo':
      return <g fill="none" stroke={color}>{coords.map(([x, y], i) => <g key={i}><ellipse cx={x} cy={y} rx="10" ry="4" strokeWidth="1.2" transform={`rotate(${i ? 35 : -35} ${x} ${y})`} /><path d={`M ${x} ${y - 13} v 4 M ${x - 10} ${y - 9} l 3 3 M ${x + 10} ${y - 9} l -3 3`} strokeWidth="1.1" /></g>)}</g>
    default:
      return <g fill={color}>{coords.map(([x, y], i) => <Star key={i} x={x} y={y} size={4} />)}</g>
  }
}

export default function EffectPreview({ effectId, color, active = false }: EffectPreviewProps) {
  const reducedMotion = useReducedMotion()
  const visual = getEffectVisual(effectId, color)
  const id = useId().replace(/:/g, '')
  const trailId = `effect-trail-${id}`
  const blurId = `effect-preview-blur-${id}`
  const animate = active && !reducedMotion
  const pathMotion = !animate ? { pathLength: 1, opacity: 0.72 }
    : visual.family === 'electric' || visual.family === 'digital'
      ? { pathLength: [0.58, 1, 0.72], opacity: [0.45, 1, 0.62] }
      : visual.family === 'flame' || visual.family === 'plasma'
        ? { pathLength: [0.74, 1, 0.84], opacity: [0.58, 1, 0.66] }
        : { pathLength: [0.62, 1, 0.68], opacity: [0.48, 0.96, 0.55] }
  const markMotion = !animate ? { y: 0, opacity: 0.9 }
    : visual.family === 'petal' || visual.family === 'confetti'
      ? { y: [0, -5, 2, 0], x: [0, 3, -2, 0], rotate: [0, 18, -8, 0], opacity: [0.55, 1, 0.72, 0.55] }
      : visual.family === 'flame'
        ? { y: [2, -5, 1], scale: [0.9, 1.16, 0.94], opacity: [0.72, 1, 0.7] }
        : visual.family === 'ripple' || visual.family === 'halo' || visual.family === 'cosmic' || visual.family === 'plasma'
          ? { y: [0, -2, 0], rotate: [0, 24, 0], scale: [0.88, 1.12, 0.88], opacity: [0.6, 1, 0.6] }
          : visual.family === 'digital' || visual.family === 'electric'
            ? { x: [0, 3, -2, 0], y: [0, -2, 1, 0], opacity: [0.3, 1, 0.48, 0.92] }
            : { y: [0, -2, 0], opacity: [0.72, 1, 0.72] }

  return (
    <div className="relative flex h-24 w-full items-center justify-center overflow-hidden" aria-hidden="true">
      <div
        className="absolute h-16 w-24 rounded-full blur-2xl"
        style={{ backgroundColor: visual.color, opacity: visual.family === 'void' ? 0.13 : 0.2 }}
      />
      <svg className="relative h-full w-full max-w-44 overflow-visible" viewBox="0 0 128 80" fill="none">
        <defs>
          <linearGradient id={trailId} x1="20" y1="66" x2="100" y2="18" gradientUnits="userSpaceOnUse">
            <stop stopColor={visual.color} stopOpacity="0.02" />
            <stop offset="0.55" stopColor={visual.color} stopOpacity="0.46" />
            <stop offset="1" stopColor="#fff" stopOpacity="0.88" />
          </linearGradient>
          <filter id={blurId} x="-60%" y="-60%" width="220%" height="220%">
            <feGaussianBlur stdDeviation="3" />
          </filter>
        </defs>
        <motion.path
          d={trailPaths[visual.family]}
          stroke={`url(#${trailId})`}
          strokeWidth={['streak', 'electric'].includes(visual.family) ? 2.5 : 3.5}
          strokeLinecap="round"
          strokeLinejoin="round"
          strokeDasharray={visual.family === 'digital' ? '4 2' : visual.family === 'frost' || visual.family === 'crystal' ? '8 2 1 2' : undefined}
          initial={false}
          animate={pathMotion}
          transition={{ duration: 2.2, repeat: animate ? Infinity : 0, ease: 'easeInOut' }}
        />
        <motion.g
          color={visual.color}
          animate={markMotion}
          transition={{ duration: 2.1, repeat: animate ? Infinity : 0, ease: 'easeInOut' }}
        >
          <EffectMarks family={visual.family} effectId={effectId} color={visual.color} blurId={blurId} />
        </motion.g>
        <path d="M 99 15 L 106 19 L 99 21 L 101 27 L 96 23 L 91 27 L 93 21 L 87 19 L 94 17 L 96 11 Z" fill="#fff" fillOpacity=".9" />
      </svg>
    </div>
  )
}
