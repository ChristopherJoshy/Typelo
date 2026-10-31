import type { BorderRingKey } from '../../effects/borderRecipes'
import type { CosmeticPalette } from '../../effects/artColor'

interface BorderRingProps {
  ring: BorderRingKey
  palette: CosmeticPalette
  seed: number
}

const RADIUS = 40

function point(radius: number, degrees: number) {
  const angle = (degrees * Math.PI) / 180
  return [50 + Math.cos(angle) * radius, 50 + Math.sin(angle) * radius] as const
}

function wavyRing(radius: number, waves: number, amplitude: number) {
  const steps = 72
  const points: string[] = []
  for (let index = 0; index <= steps; index += 1) {
    const angle = (index / steps) * Math.PI * 2 - Math.PI / 2
    const r = radius + Math.sin(angle * waves) * amplitude
    points.push(`${(50 + Math.cos(angle) * r).toFixed(2)} ${(50 + Math.sin(angle) * r).toFixed(2)}`)
  }
  return `M${points.join('L')}Z`
}

export default function BorderRing({ ring, palette, seed }: BorderRingProps) {
  const variant = seed % 4
  const base = <circle cx="50" cy="50" r={RADIUS} fill="none" stroke={palette.primary} strokeWidth="4" />
  const glow = <circle cx="50" cy="50" r="42.5" fill="none" stroke={palette.primary} strokeWidth="9" opacity=".1" />

  switch (ring) {
    case 'double':
      return <g className="bf-ring-art" data-ring={ring}>
        {glow}
        <circle cx="50" cy="50" r="38.4" fill="none" stroke={palette.primary} strokeWidth="2.4" />
        <circle cx="50" cy="50" r="43.2" fill="none" stroke={palette.highlight} strokeWidth="1.4" />
        {[0, 90, 180, 270].map(angle => {
          const [x, y] = point(40.8, angle)
          return <circle key={angle} cx={x} cy={y} r="1.9" fill={angle % 180 ? palette.secondary : palette.highlight} />
        })}
      </g>
    case 'dashed':
      return <g className="bf-ring-art" data-ring={ring}>
        {glow}
        <circle cx="50" cy="50" r={RADIUS} fill="none" stroke={palette.primary} strokeWidth="4.2" strokeDasharray="7 4.4" strokeLinecap="round" />
        <circle cx="50" cy="50" r="35.6" fill="none" stroke={palette.highlight} strokeWidth="1" opacity=".75" strokeDasharray="2 7" />
      </g>
    case 'beaded':
      return <g className="bf-ring-art" data-ring={ring}>
        {glow}
        <circle cx="50" cy="50" r={RADIUS} fill="none" stroke={palette.primary} strokeWidth="1.5" opacity=".8" />
        {Array.from({ length: 20 }, (_, index) => {
          const [x, y] = point(RADIUS, (index / 20) * 360)
          return <circle key={index} cx={x} cy={y} r={index % 5 === 0 ? 2.4 : 1.55} fill={index % 3 === 0 ? palette.highlight : index % 2 ? palette.secondary : palette.primary} stroke={palette.deep} strokeWidth=".4" />
        })}
        <circle cx="50" cy="50" r="35.8" fill="none" stroke={palette.highlight} strokeWidth=".7" opacity=".5" />
      </g>
    case 'segmented':
      return <g className="bf-ring-art" data-ring={ring}>
        {glow}
        <circle cx="50" cy="50" r={RADIUS} fill="none" stroke={palette.primary} strokeWidth="5.4" strokeDasharray={`${11 + variant} ${6.4 - variant * 0.6}`} />
        <circle cx="50" cy="50" r="35.4" fill="none" stroke={palette.highlight} strokeWidth="1.2" opacity=".7" strokeDasharray="1.4 5.8" />
      </g>
    case 'scalloped':
      return <g className="bf-ring-art" data-ring={ring}>
        {glow}
        <circle cx="50" cy="50" r="36.8" fill="none" stroke={palette.primary} strokeWidth="2.2" />
        {Array.from({ length: 18 }, (_, index) => <ellipse key={index} cx="50" cy={50 - 42.4} rx="2.6" ry="4.2" fill={index % 3 === 0 ? palette.highlight : index % 2 ? palette.secondary : palette.primary} opacity=".9" transform={`rotate(${(index / 18) * 360} 50 50)`} />)}
      </g>
    case 'thorn':
      return <g className="bf-ring-art" data-ring={ring}>
        {glow}
        <circle cx="50" cy="50" r="39.2" fill="none" stroke={palette.primary} strokeWidth="2.6" />
        {Array.from({ length: 12 }, (_, index) => {
          const angle = (index / 12) * 360
          const [x1, y1] = point(39.6, angle - 2.6)
          const [x2, y2] = point(39.6, angle + 2.6)
          const [x3, y3] = point(48.2, angle)
          return <path key={index} d={`M${x1} ${y1}L${x3} ${y3}L${x2} ${y2}Z`} fill={index % 2 ? palette.secondary : palette.primary} opacity=".92" />
        })}
        <circle cx="50" cy="50" r="35.5" fill="none" stroke={palette.highlight} strokeWidth="1" opacity=".7" />
      </g>
    case 'ribbon':
      return <g className="bf-ring-art" data-ring={ring}>
        {glow}
        <path d={wavyRing(40, 5 + variant * 0.4, 2.6)} fill="none" stroke={palette.primary} strokeWidth="4.4" strokeLinejoin="round" />
        <path d={wavyRing(40, 5 + variant * 0.4, 2.6)} fill="none" stroke={palette.highlight} strokeWidth="1.1" opacity=".7" strokeLinejoin="round" />
        <path d={wavyRing(35.4, 7, 1.3)} fill="none" stroke={palette.secondary} strokeWidth="1" opacity=".55" />
      </g>
    case 'orbit':
      return <g className="bf-ring-art" data-ring={ring}>
        {glow}
        <circle cx="50" cy="50" r="37.4" fill="none" stroke={palette.primary} strokeWidth="1" opacity=".35" />
        <ellipse cx="50" cy="50" rx="41" ry="17" fill="none" stroke={palette.primary} strokeWidth="2.4" opacity=".9" transform="rotate(-24 50 50)" />
        <ellipse cx="50" cy="50" rx="17" ry="42" fill="none" stroke={palette.secondary} strokeWidth="1.8" opacity=".8" transform="rotate(32 50 50)" />
        <circle cx="18.2" cy="30.4" r="2.6" fill={palette.highlight} />
        <circle cx="76" cy="66" r="2" fill={palette.secondary} />
        <circle cx="42" cy="9.4" r="1.6" fill={palette.primary} />
      </g>
    case 'gapped':
      return <g className="bf-ring-art" data-ring={ring}>
        {glow}
        <circle cx="50" cy="50" r={RADIUS} fill="none" stroke={palette.primary} strokeWidth="5" strokeDasharray="27 13" strokeLinecap="round" />
        <circle cx="50" cy="50" r="35.2" fill="none" stroke={palette.secondary} strokeWidth="1" strokeDasharray="9 31" strokeDashoffset="8" opacity=".8" />
      </g>
    case 'solid':
    default:
      return <g className="bf-ring-art" data-ring={ring}>
        {glow}
        {base}
        <circle cx="50" cy="50" r="40" fill="none" stroke={palette.highlight} strokeWidth="1.1" opacity=".75" />
        <circle cx="50" cy="50" r="37.2" fill="none" stroke={palette.secondary} strokeWidth="1" opacity=".45" strokeDasharray="1 6.5" />
      </g>
  }
}
