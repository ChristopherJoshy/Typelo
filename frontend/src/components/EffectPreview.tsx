import { useId } from 'react'
import { motion, useReducedMotion } from 'framer-motion'
import { getEffectVisual } from '../effects/visuals'

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
          d="M 25 63 C 48 58 58 47 72 37 C 83 29 94 25 104 20"
          stroke={`url(#${trailId})`}
          strokeWidth="3"
          strokeLinecap="round"
          initial={false}
          animate={animate ? { pathLength: [0.64, 1, 0.64], opacity: [0.48, 0.92, 0.48] } : { pathLength: 1, opacity: 0.72 }}
          transition={{ duration: 2.2, repeat: animate ? Infinity : 0, ease: 'easeInOut' }}
        />
        <motion.g
          color={visual.color}
          animate={animate ? { y: [0, -1.5, 0], opacity: [0.72, 1, 0.72] } : { y: 0, opacity: 0.9 }}
          transition={{ duration: 2.1, repeat: animate ? Infinity : 0, ease: 'easeInOut' }}
        >
          <EffectMarks family={visual.family} effectId={effectId} color={visual.color} blurId={blurId} />
        </motion.g>
        <path d="M 99 15 L 106 19 L 99 21 L 101 27 L 96 23 L 91 27 L 93 21 L 87 19 L 94 17 L 96 11 Z" fill="#fff" fillOpacity=".9" />
      </svg>
    </div>
  )
}
