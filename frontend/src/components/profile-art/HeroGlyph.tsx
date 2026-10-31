import type { CSSProperties, ReactNode } from 'react'
import type { HeroKey } from '../../effects/effectRecipes'

export interface HeroPaint {
  main: string
  light: string
  accent: string
  deep: string
  white: string
}

interface HeroProps {
  hero: HeroKey
  paint: HeroPaint
  variant: number
}

const spark = (x: number, y: number, size: number, fill: string, key?: string) => (
  <path key={key} d={`M${x} ${y - size}L${x + size * 0.28} ${y - size * 0.28}L${x + size} ${y}L${x + size * 0.28} ${y + size * 0.28}L${x} ${y + size}L${x - size * 0.28} ${y + size * 0.28}L${x - size} ${y}L${x - size * 0.28} ${y - size * 0.28}Z`} fill={fill} />
)

const petal = (cx: number, cy: number, length: number, width: number, rotation: number, fill: string, key?: string, opacity = 1) => (
  <path
    key={key}
    transform={`rotate(${rotation} ${cx} ${cy})`}
    d={`M${cx} ${cy - length}C${cx + width} ${cy - length * 0.6} ${cx + width} ${cy - length * 0.12} ${cx} ${cy}C${cx - width} ${cy - length * 0.12} ${cx - width} ${cy - length * 0.6} ${cx} ${cy - length}Z`}
    fill={fill}
    opacity={opacity}
  />
)

const hexPoints = (cx: number, cy: number, radius: number, rotation = 0) => {
  const points: string[] = []
  for (let index = 0; index < 6; index += 1) {
    const angle = (Math.PI / 3) * index - Math.PI / 2 + rotation
    points.push(`${cx + Math.cos(angle) * radius},${cy + Math.sin(angle) * radius}`)
  }
  return points.join(' ')
}

const starPoints = (cx: number, cy: number, outer: number, inner: number, points: number) => {
  const result: string[] = []
  for (let index = 0; index < points * 2; index += 1) {
    const radius = index % 2 === 0 ? outer : inner
    const angle = (Math.PI / points) * index - Math.PI / 2
    result.push(`${cx + Math.cos(angle) * radius},${cy + Math.sin(angle) * radius}`)
  }
  return result.join(' ')
}

const P = (props: { d: string; fill?: string; stroke?: string; width?: number; opacity?: number; className?: string; key?: string }) => (
  <path key={props.key} d={props.d} fill={props.fill ?? 'none'} stroke={props.stroke} strokeWidth={props.width} strokeLinecap="round" strokeLinejoin="round" opacity={props.opacity} className={props.className} />
)

function Orb({ paint, variant }: HeroProps) {
  return <>
    <circle cx="50" cy="50" r="44" fill={paint.accent} opacity=".06" className="art-pulse-soft" />
    <ellipse cx="50" cy="50" rx="46" ry="13" transform="rotate(-18 50 50)" fill="none" stroke={paint.light} strokeWidth="2.4" opacity=".72" className="art-spin-slow" />
    <circle cx="50" cy="50" r={30 + (variant % 3)} fill={paint.main} />
    <path d={`M${20 + variant % 4} 55A32 32 0 0 0 76 68 34 34 0 0 1 ${20 + variant % 4} 55Z`} fill={paint.deep} opacity=".55" />
    <path d="M36 30c8-8 22-10 30-4-10-1-20 4-24 12-2-4-4-6-6-8Z" fill={paint.white} opacity=".6" />
    <circle cx={17 + variant % 5} cy="42" r="3.4" fill={paint.light} className="art-twinkle" />
    <circle cx={78 - variant % 4} cy="64" r="2.4" fill={paint.white} className="art-twinkle-delay" />
    {spark(74, 22, 5, paint.light, 'orb-spark')}
  </>
}

function Crescent({ paint, variant }: HeroProps) {
  return <>
    <circle cx="50" cy="48" r="40" fill={paint.accent} opacity=".06" />
    <path d="M66 11a37 37 0 1 0 18 53A30 30 0 0 1 66 11Z" fill={paint.main} />
    <path d="M66 11a37 37 0 0 1 18 53A27 27 0 0 1 66 11Z" fill={paint.deep} opacity=".45" />
    <path d="M51 20a27 27 0 0 1 12 40 23 23 0 0 0-12-40Z" fill={paint.white} opacity=".28" />
    <g fill={paint.light} opacity=".8" className="art-drift-slow">
      <path d="M8 72c8-10 20-9 23 1 4-8 16-7 18 4 8-5 17 0 17 7H7c-2-5-1-9 1-12Z" opacity=".65" />
      <path d="M54 85c5-6 12-5 14 1 3-5 10-4 12 2 4-3 10 0 10 5H53c-2-3-1-6 1-8Z" opacity=".45" />
    </g>
    {[0, 1, 2].map(index => <circle key={index} cx={18 + index * 11 + variant % 5} cy={22 + index * 9} r={1.6 + (index % 2)} fill={paint.white} className={index % 2 ? 'art-twinkle-delay' : 'art-twinkle'} />)}
  </>
}

function Comet({ paint, variant }: HeroProps) {
  return <>
    <g className="art-drift-slow">
      <path d={`M72 20C58 8 36 14 31 30c13-8 25-6 33 1Z`} fill={paint.light} opacity=".9" />
      <path d="M35 30C52 38 61 52 59 75 71 61 76 43 63 27 55 20 44 22 35 30Z" fill={paint.main} />
      <path d="M34 34C46 47 45 65 35 84 50 73 57 55 50 36 45 33 39 32 34 34Z" fill={paint.accent} opacity=".85" />
      <path d="M19 44C29 55 28 69 17 86 34 80 43 65 39 48 32 44 25 43 19 44Z" fill={paint.deep} opacity=".5" />
      <circle cx="75" cy="82" r="15" fill={paint.white} className="art-pulse-soft" />
      <circle cx="75" cy="82" r="9" fill={paint.light} />
      <circle cx="72" cy="79" r="3" fill={paint.white} />
    </g>
    {spark(18, 24, 4, paint.light, 'comet-spark')}
  </>
}

function Wings({ paint, variant }: HeroProps) {
  const feathers = 5
  return <>
    <circle cx="50" cy="51" r="42" fill={paint.accent} opacity=".06" />
    <g className="art-flap-left">{[0, 1, 2, 3, 4, 5].slice(0, feathers + 1).map(index => <path key={index} d={`M48 45C${38 - index * 3} ${26 - index * 2} ${17 - index * 2} ${36 + index * 4} ${9 + index} ${49 + index * 5}c${9 - index} -7 ${22 - index * 2} -9 ${31 - index * 2} -4Z`} fill={index % 2 ? paint.accent : paint.main} opacity={0.82 - index * 0.05} transform={`rotate(${variant % 4 - 2} 48 45)`} />)}</g>
    <g className="art-flap-right">{[0, 1, 2, 3, 4, 5].slice(0, feathers + 1).map(index => <path key={index} d={`M52 45C${62 + index * 3} ${26 - index * 2} ${83 + index * 2} ${36 + index * 4} ${91 - index} ${49 + index * 5}c${index - 9} -7 ${index * 2 - 22} -9 ${index * 2 - 31} -4Z`} fill={index % 2 ? paint.accent : paint.main} opacity={0.82 - index * 0.05} transform={`rotate(${2 - variant % 4} 52 45)`} />)}</g>
    <path d="M50 34 58 48l-8 18-8-18Z" fill={paint.light} />
    <circle cx="50" cy="50" r="5" fill={paint.white} />
    {spark(50, 18, 5, paint.light, 'wing-spark')}
  </>
}

function Lotus({ paint, variant }: HeroProps) {
  const petals = 6 + (variant % 3) * 2
  return <>
    <circle cx="50" cy="54" r="41" fill={paint.accent} opacity=".06" />
    <g className="art-breathe-soft">
      {Array.from({ length: petals }, (_, index) => petal(50, 57, 30, 10, (360 / petals) * index, index % 2 ? paint.accent : paint.main, `p${index}`, 0.9))}
      {Array.from({ length: petals }, (_, index) => petal(50, 57, 19, 7, (360 / petals) * index + 180 / petals, paint.light, `q${index}`, 0.85))}
      <circle cx="50" cy="57" r="6" fill={paint.white} />
      <circle cx="50" cy="57" r="3" fill={paint.accent} />
    </g>
    <path d="M50 76c-4 13-15 16-25 16 9-6 15-11 17-19Zm0 0c4 13 15 16 25 16-9-6-15-11-17-19Z" fill={paint.deep} opacity=".6" />
  </>
}

function Rose({ paint, variant }: HeroProps) {
  return <>
    <circle cx="50" cy="48" r="38" fill={paint.accent} opacity=".13" />
    <g className="art-breathe-soft">
      {Array.from({ length: 5 }, (_, index) => petal(50, 50, 27, 12, index * 72 + variant * 4, index % 2 ? paint.accent : paint.main, `o${index}`, 0.92))}
      <circle cx="50" cy="50" r="18" fill={paint.main} />
      <path d="M50 33c9 0 17 7 17 16 0 10-8 17-17 17-7 0-13-5-13-12 0-6 5-11 11-11 5 0 9 4 9 8 0 4-3 7-7 7" fill="none" stroke={paint.light} strokeWidth="3" strokeLinecap="round" />
      <circle cx="47" cy="47" r="3" fill={paint.white} />
    </g>
    <path d="M50 70c-3 9-10 14-18 16 7-2 12-6 14-13Zm0 0c3 9 10 14 18 16-7-2-12-6-14-13Z" fill={paint.deep} opacity=".6" />
  </>
}

function Sakura({ paint, variant }: HeroProps) {
  const blossoms = [[27, 62], [50, 40], [69, 24], [80, 60], [38, 22]]
  return <>
    <circle cx="50" cy="48" r="40" fill={paint.accent} opacity=".06" />
    <path d="M6 94C27 76 35 50 49 31c7-9 17-16 32-21" fill="none" stroke={paint.deep} strokeWidth="5" strokeLinecap="round" />
    <path d="M20 74c10-12 16-26 20-39M46 42c-5-6-9-14-10-22M62 30c8-3 16-4 23-3" fill="none" stroke={paint.deep} strokeWidth="3" strokeLinecap="round" opacity=".8" />
    {blossoms.map(([cx, cy], index) => (
      <g key={index} className={index % 2 ? 'art-sway-soft' : 'art-sway-soft-delay'} transform={`translate(${cx} ${cy}) scale(${0.5 + (index % 3) * 0.12})`}>
        {Array.from({ length: 5 }, (_, petalIndex) => petal(0, 0, 12, 5, petalIndex * 72 + variant * 6, petalIndex % 2 ? paint.light : paint.main, `b${index}${petalIndex}`, 0.95))}
        <circle r="3" fill={paint.white} />
      </g>
    ))}
    {[0, 1, 2, 3].map(index => <ellipse key={index} cx={22 + index * 18} cy={30 + ((index * 23) % 52)} rx="3" ry="1.6" fill={paint.accent} transform={`rotate(${index * 47} ${22 + index * 18} ${30 + ((index * 23) % 52)})`} className="art-drift-slow" />)}
  </>
}

function Serpent({ paint, variant }: HeroProps) {
  return <>
    <circle cx="50" cy="52" r="40" fill={paint.accent} opacity=".06" />
    <g className="art-sway-soft">
      <path d="M21 82C4 58 38 49 57 67c20 19 33-3 19-17-11-11-28-4-23 7 4 8 16 4 16-5" fill="none" stroke={paint.deep} strokeWidth="17" strokeLinecap="round" />
      <path d="M21 82C4 58 38 49 57 67c20 19 33-3 19-17-11-11-28-4-23 7 4 8 16 4 16-5" fill="none" stroke={paint.main} strokeWidth="12" strokeLinecap="round" />
      <path d="M21 82C4 58 38 49 57 67" fill="none" stroke={paint.light} strokeWidth="2.5" strokeLinecap="round" opacity=".7" className="art-dash-flow" />
      <g transform={`translate(${64 + variant % 3} 46)`}>
        <path d="M0 0c9-8 24-6 25 5 1 9-11 15-21 10-6-3-8-9-4-15Z" fill={paint.main} />
        <path d="M2 4c7-4 14-2 16 3" fill="none" stroke={paint.light} strokeWidth="2" />
        <circle cx="15" cy="6" r="2.2" fill={paint.white} />
        <circle cx="15.6" cy="6.2" r="1" fill={paint.deep} />
        <path d="m24 10 8 4m-8-7 9 0" stroke={paint.accent} strokeWidth="1.6" strokeLinecap="round" />
      </g>
    </g>
    {[0, 1, 2].map(index => <circle key={index} cx={15 + index * 12} cy={20 + index * 7} r={1.4} fill={paint.light} className="art-twinkle" />)}
  </>
}

function Dragon({ paint, variant }: HeroProps) {
  return <>
    <circle cx="52" cy="50" r="41" fill={paint.accent} opacity=".06" />
    <g className="art-hover-soft">
      <path d="M10 82C30 62 15 42 37 29c14-8 38-4 45 13 5 13-5 22-16 21-9-1-13-9-8-15-8 1-10 9-5 15 5 7 18 8 26 1" fill="none" stroke={paint.deep} strokeWidth="9" strokeLinecap="round" opacity=".55" />
      <path d="M30 48c-4-14 4-27 18-31 13-4 29 2 34 14 4 10-2 19-12 20-7 1-12-4-9-10-6 1-8 7-4 12" fill="none" stroke={paint.main} strokeWidth="7" strokeLinecap="round" />
      <g transform={`translate(${58 + variant % 4} 24) rotate(${variant % 7 - 3})`}>
        <path d="M0 20C4 7 16-1 29 2c10 2 17 11 15 21-1 8-8 14-17 14-10 0-20-6-27-17Z" fill={paint.main} />
        <path d="M29 2c6-8 16-10 22-7-4 5-7 10-7 16-4-5-9-8-15-9Z" fill={paint.accent} />
        <path d="M7 7c-8-5-13-4-17 0 6 2 9 6 11 11" fill={paint.light} opacity=".8" />
        <path d="M36 15c5-2 10 0 12 4" fill="none" stroke={paint.white} strokeWidth="2" strokeLinecap="round" />
        <circle cx="37" cy="16" r="2.5" fill={paint.white} /><circle cx="37.6" cy="16.2" r="1.1" fill={paint.deep} />
        <path d="M19 33c5 2 10 1 13-2m-15 2c-4 2-8 1-11-1" stroke={paint.deep} strokeWidth="2" strokeLinecap="round" />
        <path d="M5 31c-7 4-12 10-13 17 6-2 11-1 15 3 1-6 2-12 5-17" fill={paint.accent} opacity=".85" />
      </g>
    </g>
    {spark(16, 22, 4, paint.light, 'dragon-spark')}
  </>
}

function Fox({ paint, variant }: HeroProps) {
  return <>
    <circle cx="50" cy="50" r="40" fill={paint.accent} opacity=".06" />
    <g className="art-sway-soft">
      {[0, 1, 2].map(index => <path key={index} d={`M${20 + index * 19} 78C${4 + index * 20} 64 ${8 + index * 20} 40 ${25 + index * 17} 33c-5 13 5 20 12 28 4 6 2 12-2 17Z`} fill={index % 2 ? paint.accent : paint.main} opacity={0.55 + index * 0.12} />)}
      <path d="M50 20 75 37l-4 30-21 17-21-17-4-30Z" fill={paint.light} />
      <path d="M29 32 19 10l22 7m30 15 10-22-22 7" fill={paint.main} stroke={paint.light} strokeWidth="2" strokeLinejoin="round" />
      <path d="M38 42c3-3 8-3 11 0 3-3 8-3 11 0-1 4-4 6-7 5-2 3-6 3-8 0-3 1-6-1-7-5Z" fill={paint.deep} />
      <path d="M46 60 50 66l4-6Z" fill={paint.accent} />
      <path d="M30 52c5 1 8 0 11-3m29 3c-5 1-8 0-11-3M34 68c5 2 9 1 12-1m20 1c-5 2-9 1-12-1" stroke={paint.deep} strokeWidth="1.8" strokeLinecap="round" opacity=".75" />
      <path d="M42 33c2-2 5-2 7 0m2 0c2-2 5-2 7 0" stroke={paint.white} strokeWidth="1.4" strokeLinecap="round" opacity=".7" />
    </g>
    {spark(78, 20, 4, paint.light, 'fox-spark')}
  </>
}

function Mask({ paint, variant }: HeroProps) {
  return <>
    <circle cx="50" cy="50" r="40" fill={paint.accent} opacity=".06" />
    <g className="art-hover-soft">
      <path d="M28 19 15 3c9 0 15 5 19 12M72 19 85 3c-9 0-15 5-19 12" fill={paint.accent} />
      <path d="M50 16c19 0 31 11 31 28 0 22-15 39-31 39S19 66 19 44c0-17 12-28 31-28Z" fill={paint.light} />
      <path d="M50 16c19 0 31 11 31 28 0 22-15 39-31 39V16Z" fill={paint.main} opacity=".36" />
      <path d="M29 42c6-5 13-4 17 1-3 5-10 7-17 3Zm42 0c-6-5-13-4-17 1 3 5 10 7 17 3Z" fill={paint.deep} />
      <path d="m44 59 6 5 6-5-6 12Z" fill={paint.accent} />
      <path d="M35 73c10 6 20 6 30 0-8 9-22 9-30 0Z" fill={paint.deep} opacity=".8" />
      <path d="M22 35c-4 7-4 15 0 22m56-22c4 7 4 15 0 22M36 84l-5 9m33-9 5 9" stroke={paint.accent} strokeWidth={variant % 2 ? 2.4 : 1.8} strokeLinecap="round" />
      <path d="M30 26c2-3 5-5 9-6m31 6c-2-3-5-5-9-6" stroke={paint.white} strokeWidth="2" strokeLinecap="round" opacity=".55" />
    </g>
  </>
}

function Crown({ paint, variant }: HeroProps) {
  return <>
    <circle cx="50" cy="55" r="40" fill={paint.accent} opacity=".06" />
    <g className="art-hover-soft">
      <path d="M18 56 14 25l19 13L50 12l17 26 19-13-4 31Z" fill={paint.main} />
      <path d="M18 56h64l-4 18c-17 8-39 8-56 0Z" fill={paint.deep} opacity=".9" />
      <path d="M22 55h56" stroke={paint.light} strokeWidth="3" strokeLinecap="round" />
      <circle cx="50" cy="65" r="5.5" fill={paint.light} /><circle cx="50" cy="65" r="2.5" fill={paint.white} />
      <circle cx={30 + variant % 3} cy="37" r="3.2" fill={paint.accent} /><circle cx={70 - variant % 3} cy="37" r="3.2" fill={paint.accent} />
      <circle cx="50" cy="20" r="3.4" fill={paint.white} className="art-twinkle" />
      <path d="M26 47h48" stroke={paint.accent} strokeWidth="2" opacity=".65" />
    </g>
    {spark(18, 20, 4, paint.light, 'crown-spark')}
  </>
}

function Crystal({ paint, variant }: HeroProps) {
  const shards = [
    { x: 50, y: 10, w: 10, h: 52, r: 0 },
    { x: 30, y: 27, w: 9, h: 44, r: -13 },
    { x: 70, y: 24, w: 9, h: 48, r: 13 },
    { x: 17, y: 45, w: 7, h: 34, r: -24 },
    { x: 83, y: 42, w: 7, h: 37, r: 24 },
  ].slice(0, 3 + (variant % 3))
  return <>
    <circle cx="50" cy="55" r="40" fill={paint.accent} opacity=".06" />
    <g className="art-breathe-soft">
      <ellipse cx="50" cy="84" rx="32" ry="7" fill={paint.deep} opacity=".4" />
      {shards.map((shard, index) => <g key={index} transform={`rotate(${shard.r} ${shard.x} ${shard.y})`}>
        <path d={`M${shard.x} ${shard.y} ${shard.x + shard.w} ${shard.y + 12} ${shard.x + shard.w - 2} ${shard.y + shard.h} ${shard.x} ${shard.y + shard.h + 7} ${shard.x - shard.w + 2} ${shard.y + shard.h} ${shard.x - shard.w} ${shard.y + 12}Z`} fill={index % 2 ? paint.accent : paint.main} />
        <path d={`M${shard.x} ${shard.y} ${shard.x + shard.w} ${shard.y + 12} ${shard.x} ${shard.y + 23} ${shard.x - shard.w} ${shard.y + 12}Z`} fill={paint.light} opacity=".72" />
        <path d={`M${shard.x} ${shard.y + 23} ${shard.x} ${shard.y + shard.h + 7}`} stroke={paint.white} strokeWidth="1.4" opacity=".6" />
      </g>)}
      <path d="M28 81c15 5 30 5 44 0" stroke={paint.light} strokeWidth="2" opacity=".5" />
    </g>
    {spark(82, 17, 4, paint.white, 'crystal-spark')}
  </>
}

function Sword({ paint, variant }: HeroProps) {
  const flip = variant % 2
  return <>
    <circle cx="50" cy="50" r="40" fill={paint.accent} opacity=".06" />
    <g transform={`rotate(${flip ? -45 : 45} 50 50)`} className="art-hover-soft">
      <path d="M50 4 58 16 56 68H44l-2-52Z" fill={paint.light} />
      <path d="M50 4 56 16 54 68H44l-2-52Z" fill={paint.main} opacity=".45" />
      <path d="M50 10v54" stroke={paint.white} strokeWidth="1.6" opacity=".75" />
      <path d="M31 68h38v5H31Z" fill={paint.accent} />
      <path d="M44 73h12v18H44Z" fill={paint.deep} />
      {[0, 1, 2].map(index => <path key={index} d={`M44 ${77 + index * 4}l12 4`} stroke={paint.light} strokeWidth="1.5" opacity=".7" />)}
      <circle cx="50" cy="94" r="3" fill={paint.accent} />
      <path d="M16 84C32 60 54 40 84 22" fill="none" stroke={paint.accent} strokeWidth="2.4" opacity=".6" className="art-dash-flow" />
    </g>
    {spark(82, 82, 5, paint.light, 'sword-spark')}
  </>
}

function Star({ paint, variant }: HeroProps) {
  const points = 6 + (variant % 3) * 2
  return <>
    <circle cx="50" cy="50" r="42" fill={paint.accent} opacity=".06" />
    <g className="art-pulse-soft">
      <polygon points={starPoints(50, 50, 45, 12, points)} fill={paint.main} />
      <polygon points={starPoints(50, 50, 30, 8, points)} fill={paint.light} opacity=".9" />
      <circle cx="50" cy="50" r="11" fill={paint.white} />
      <circle cx="50" cy="50" r="6" fill={paint.accent} />
    </g>
    <ellipse cx="50" cy="50" rx="48" ry="13" transform="rotate(28 50 50)" fill="none" stroke={paint.light} strokeWidth="1.6" opacity=".5" className="art-spin-slow" />
    {[0, 1, 2, 3].map(index => spark(50 + Math.cos(index * 1.7) * 37, 50 + Math.sin(index * 1.7) * 37, 2 + (index % 2), paint.white, `s${index}`))}
  </>
}

function Rift({ paint, variant }: HeroProps) {
  return <>
    <circle cx="50" cy="50" r="43" fill={paint.deep} opacity=".55" />
    <ellipse cx="50" cy="50" rx="43" ry="16" transform="rotate(-24 50 50)" fill="none" stroke={paint.accent} strokeWidth="2.4" opacity=".7" className="art-spin-slow" />
    <ellipse cx="50" cy="50" rx="35" ry="47" transform="rotate(31 50 50)" fill="none" stroke={paint.light} strokeWidth="1.4" opacity=".45" className="art-spin-reverse" />
    <path d={`M50 2 61 ${18 + variant % 5} 43 35 63 52 41 70 55 ${88 + variant % 4} 50 99 45 ${88 + variant % 4} 59 70 37 52 57 35 39 ${18 + variant % 5}Z`} fill={paint.deep} stroke={paint.main} strokeWidth="2.5" strokeLinejoin="round" />
    <path d="M50 15 54 33 46 48 56 63 47 79" fill="none" stroke={paint.light} strokeWidth="2.6" strokeLinecap="round" className="art-dash-flow" />
    <path d="M50 15 54 33 46 48 56 63 47 79" fill="none" stroke={paint.white} strokeWidth="1" strokeLinecap="round" opacity=".8" />
    {[0, 1, 2, 3, 4].map(index => <path key={index} d={`M${10 + index * 18} ${18 + (index % 3) * 5}l${5 + index} ${4 + index}`} stroke={paint.accent} strokeWidth="1.5" opacity=".65" />)}
  </>
}

function Flame({ paint, variant }: HeroProps) {
  return <>
    <circle cx="50" cy="67" r="36" fill={paint.accent} opacity=".16" className="art-pulse-soft" />
    <g className="art-flicker-soft">
      <path d={`M50 8c${7 + variant % 6} 17 22 21 18 40-3 15-13 24-18 31-5-7-15-16-18-31-4-19 11-23 ${18 - variant % 6}-40Z`} fill={paint.main} />
      <path d="M50 24c4 12 13 16 10 29-2 9-7 15-10 20-3-5-8-11-10-20-3-13 6-17 10-29Z" fill={paint.accent} />
      <path d="M50 43c3 8 7 11 5 19-1 5-3 8-5 11-2-3-4-6-5-11-2-8 2-11 5-19Z" fill={paint.light} />
      <path d="M50 60c1 4 2 6 0 10-2-4-1-6 0-10Z" fill={paint.white} />
    </g>
    <path d="M23 88c14 6 40 6 54 0" stroke={paint.accent} strokeWidth="2.4" strokeLinecap="round" opacity=".55" />
    {[0, 1, 2, 3].map(index => <circle key={index} cx={30 + index * 13} cy={70 - (index % 3) * 14} r={1.4 + (index % 2)} fill={paint.light} className="art-rise-soft" style={{ animationDelay: `${index * -0.7}s` }} />)}
  </>
}

function Wave({ paint, variant }: HeroProps) {
  return <>
    <circle cx="50" cy="48" r="41" fill={paint.accent} opacity=".06" />
    <g className="art-flow-soft">
      <path d={`M-5 84c8-28 25-43 50-43 18 0 31 7 39 19-12-5-22-2-26 7 12-2 22 2 27 12-14-4-26 0-31 9 13 0 23 5 30 13H-5Z`} fill={paint.main} />
      <path d="M2 83c12-13 27-16 39-6-8 1-14 5-17 12 12-6 25-4 34 5 8-9 19-12 31-8-6-13-18-21-34-24-20-4-38 4-53 21Z" fill={paint.light} opacity=".7" />
      <path d="M45 44c0-10 8-18 19-20-5 6-6 12-3 18 6-6 14-8 22-5-8 3-13 9-14 17" fill="none" stroke={paint.light} strokeWidth="3" strokeLinecap="round" />
      <path d="M0 92c25-9 48-7 68 3 12 5 22 4 32-2v14H0Z" fill={paint.deep} opacity=".55" />
    </g>
    {[0, 1, 2, 3, 4].map(index => <circle key={index} cx={15 + index * 17} cy={30 + (index % 3) * 12} r={1.5 + (index % 2)} fill={paint.white} className="art-rise-soft" style={{ animationDelay: `${index * -0.6}s` }} />)}
  </>
}

function Feather({ paint }: HeroProps) {
  return <>
    <circle cx="50" cy="50" r="40" fill={paint.accent} opacity=".06" />
    <g className="art-sway-soft">
      <path d="M70 8C46 24 30 48 22 88c22-17 42-37 54-63 3-8 2-14 0-17-2-1-4-1-6 0Z" fill={paint.main} />
      <path d="M70 8c-18 9-34 28-46 66 18-19 33-39 42-59 2-4 3-7 4-7Z" fill={paint.light} opacity=".7" />
      <path d="M22 88C34 62 52 40 72 18" fill="none" stroke={paint.deep} strokeWidth="2.4" strokeLinecap="round" />
      {[0, 1, 2, 3, 4, 5].map(index => <path key={index} d={`M${38 + index * 5} ${40 + index * 7}c-6 1-10 4-13 8m13-8c-2 5-2 9 0 13`} fill="none" stroke={paint.white} strokeWidth="1.4" strokeLinecap="round" opacity=".6" />)}
      <path d="M22 88c4 7 2 12-3 15 8 0 12-5 12-10" fill={paint.accent} />
    </g>
    {spark(78, 76, 4, paint.light, 'feather-spark')}
  </>
}

function Moth({ paint, variant }: HeroProps) {
  return <>
    <circle cx="50" cy="48" r="40" fill={paint.accent} opacity=".06" />
    <g className="art-flutter-soft">
      <path d="M49 47C35 17 8 12 6 33c-2 18 20 26 39 25Z" fill={paint.main} />
      <path d="M51 47C65 17 92 12 94 33c2 18-20 26-39 25Z" fill={paint.main} />
      <path d="M49 58C33 60 14 70 21 84c7 13 24 2 29-14Z" fill={paint.accent} opacity=".9" />
      <path d="M51 58c16 2 35 12 28 26-7 13-24 2-29-14Z" fill={paint.accent} opacity=".9" />
      <circle cx="33" cy="33" r={5 + variant % 3} fill={paint.light} opacity=".7" />
      <circle cx="67" cy="33" r={5 + variant % 3} fill={paint.light} opacity=".7" />
      <circle cx="32" cy="77" r="3" fill={paint.white} opacity=".7" />
      <circle cx="68" cy="77" r="3" fill={paint.white} opacity=".7" />
      <ellipse cx="50" cy="55" rx="4" ry="22" fill={paint.deep} />
      <circle cx="50" cy="31" r="4.5" fill={paint.light} />
      <path d="M48 28c-5-8-12-10-17-8m21 8c5-8 12-10 17-8" fill="none" stroke={paint.accent} strokeWidth="1.8" strokeLinecap="round" />
      {[0, 1, 2].map(index => spark(22 + index * 28, 55 + (index % 2) * 16, 2, paint.white, `m${index}`))}
    </g>
  </>
}

function Koi({ paint, variant }: HeroProps) {
  return <>
    <circle cx="50" cy="50" r="40" fill={paint.accent} opacity=".06" />
    <g className="art-swim-soft">
      <path d="M18 58C25 33 43 20 60 25c15 4 22 18 17 31-5 14-21 22-37 20-10-1-17-8-22-18Z" fill={paint.main} />
      <path d="M63 28c10-9 19-11 25-7-6 7-8 14-7 22-6-5-12-6-18-5Z" fill={paint.accent} />
      <path d="M27 42c8-10 20-13 28-10-9 2-16 8-19 17-4-1-7-4-9-7Z" fill={paint.light} opacity=".65" />
      <circle cx="65" cy="43" r="3" fill={paint.white} /><circle cx="66" cy="43" r="1.2" fill={paint.deep} />
      <path d="M74 51c5 1 8 4 9 8" fill="none" stroke={paint.deep} strokeWidth="1.6" strokeLinecap="round" />
      {[0, 1, 2, 3].map(index => <circle key={index} cx={38 + index * 8} cy={38 + index * 7} r={1.8 + (variant % 2)} fill={paint.light} opacity=".55" />)}
      <path d="M18 58c-7-2-12 0-16 4 6 1 10 4 13 9 1-4 2-9 3-13Z" fill={paint.accent} opacity=".85" />
      <path d="M47 72c5 3 10 4 15 3" fill="none" stroke={paint.accent} strokeWidth="2" strokeLinecap="round" />
    </g>
    <ellipse cx="50" cy="50" rx="46" ry="14" transform="rotate(-30 50 50)" fill="none" stroke={paint.light} strokeWidth="1.4" opacity=".35" />
  </>
}

function Lantern({ paint }: HeroProps) {
  return <>
    <circle cx="50" cy="48" r="40" fill={paint.accent} opacity=".06" className="art-pulse-soft" />
    <g className="art-sway-soft">
      <path d="M50 0v12" stroke={paint.light} strokeWidth="2" />
      <path d="M34 12h32l-4 8H38Z" fill={paint.deep} />
      <path d="M28 20h44c8 12 10 36 0 50H28c-10-14-8-38 0-50Z" fill={paint.main} />
      <path d="M34 24h32c6 10 7 30 0 42H34c-7-12-6-32 0-42Z" fill={paint.light} opacity=".55" className="art-pulse-soft" />
      {[0, 1, 2, 3].map(index => <path key={index} d={`M${30 + index * 10} 22c-3 16-3 32 0 46`} fill="none" stroke={paint.deep} strokeWidth="1.4" opacity=".4" />)}
      <path d="M38 70h24l-3 8H41Z" fill={paint.deep} />
      <path d="M50 78v12m-6 0h12" stroke={paint.accent} strokeWidth="2" strokeLinecap="round" />
      <circle cx="50" cy="45" r="7" fill={paint.white} />
      <path d="M50 33v-5M50 62v5M39 45h-5m32 0h-5" stroke={paint.accent} strokeWidth="1.6" strokeLinecap="round" />
    </g>
    {spark(22, 20, 3, paint.white, 'lantern-spark')}
  </>
}

function Snow({ paint, variant }: HeroProps) {
  const arms = 6
  return <>
    <circle cx="50" cy="50" r="42" fill={paint.accent} opacity=".06" />
    <g className="art-spin-slow">
      {Array.from({ length: arms }, (_, index) => {
        const angle = index * (360 / arms) + variant * 3
        return <g key={index} transform={`rotate(${angle} 50 50)`}>
          <path d="M50 50V6" stroke={paint.main} strokeWidth="3.4" strokeLinecap="round" />
          <path d="M50 18 38 10m12 8 12-8M50 31 36 22m14 9 14-9M50 44 38 36m12 8 12-8" stroke={paint.light} strokeWidth="2.4" strokeLinecap="round" />
          <circle cx="50" cy="6" r="2.6" fill={paint.white} />
        </g>
      })}
      <circle cx="50" cy="50" r="7" fill={paint.light} />
      <circle cx="50" cy="50" r="3" fill={paint.white} />
    </g>
    {[0, 1, 2, 3].map(index => <circle key={index} cx={16 + index * 22} cy={14 + (index % 2) * 72} r="1.8" fill={paint.white} className="art-twinkle" style={{ animationDelay: `${index * -0.4}s` }} />)}
  </>
}

function Cloud({ paint, variant }: HeroProps) {
  return <>
    <circle cx="50" cy="50" r="41" fill={paint.accent} opacity=".06" />
    <g className="art-float-soft">
      <path d="M13 45c-2-9 6-16 15-14 3-11 19-14 25-4 9-4 20 3 20 13 8 0 13 6 12 13H13c-1-3-1-6 0-8Z" fill={paint.light} />
      <path d="M9 66c0-8 7-13 15-11 4-9 16-11 22-3 7-5 17-1 18 7 8-2 15 3 15 10 0 6-5 10-12 10H21c-7 0-12-5-12-13Z" fill={paint.main} />
      <path d="M28 74 18 94l13-5 5 10 8-18m22-7 8 20-12-5-5 9-7-18" fill={paint.accent} stroke={paint.light} strokeWidth="1" strokeLinejoin="round" />
      <path d="M38 82c3 4 7 6 11 6" fill="none" stroke={paint.deep} strokeWidth="1.6" opacity=".4" />
      <path d="M31 48c7-4 14-4 20-1" fill="none" stroke={paint.white} strokeWidth="2" strokeLinecap="round" opacity=".65" />
      <path d={`M${18 + variant % 6} 58h8m32 0h9`} stroke={paint.accent} strokeWidth="2" strokeLinecap="round" opacity=".6" />
    </g>
    {[0, 1, 2].map(index => <path key={index} d={`M${36 + index * 13} ${82 + (index % 2) * 4}v${5 + (index % 3) * 3}`} stroke={paint.light} strokeWidth="1.8" strokeLinecap="round" className="art-rain-soft" style={{ animationDelay: `${index * -0.5}s` }} />)}
  </>
}

function Eye({ paint, variant }: HeroProps) {
  return <>
    <circle cx="50" cy="50" r="42" fill={paint.accent} opacity=".06" />
    <g className="art-blink-soft">
      <path d="M8 50c12-18 27-27 42-27s30 9 42 27c-12 18-27 27-42 27S20 68 8 50Z" fill={paint.light} />
      <path d="M8 50c12-18 27-27 42-27v54C35 77 20 68 8 50Z" fill={paint.main} opacity=".18" />
      <circle cx="50" cy="50" r={17 + variant % 4} fill={paint.accent} />
      <circle cx="50" cy="50" r={13 + variant % 3} fill={paint.deep} />
      <circle cx="50" cy="50" r={6 + variant % 2} fill={paint.white} />
      <circle cx="46" cy="46" r="2" fill={paint.white} />
      <path d="M17 38c4-5 9-8 15-10m37 10c-4-5-9-8-15-10" fill="none" stroke={paint.white} strokeWidth="2.4" strokeLinecap="round" opacity=".6" />
      <path d="M24 74c8 6 17 9 26 9s18-3 26-9" fill="none" stroke={paint.deep} strokeWidth="2" opacity=".45" />
    </g>
    {[0, 1, 2, 3].map(index => <path key={index} d={`M${12 + index * 24} ${16 + (index % 2) * 66}l${4} ${4}`} stroke={paint.light} strokeWidth="2" strokeLinecap="round" opacity=".7" />)}
  </>
}

function Halo({ paint }: HeroProps) {
  return <>
    <circle cx="50" cy="50" r="42" fill={paint.accent} opacity=".06" />
    <g className="art-halo-soft">
      <ellipse cx="50" cy="28" rx="34" ry="9" fill="none" stroke={paint.light} strokeWidth="4" />
      <ellipse cx="50" cy="28" rx="26" ry="6" fill="none" stroke={paint.white} strokeWidth="1.4" opacity=".7" />
      <ellipse cx="50" cy="57" rx="42" ry="12" transform="rotate(-14 50 57)" fill="none" stroke={paint.accent} strokeWidth="2.2" opacity=".65" />
      <path d="M50 38 59 57 50 76 41 57Z" fill={paint.main} />
      <path d="M50 44 55 57 50 70 45 57Z" fill={paint.light} />
      <circle cx="50" cy="57" r="4" fill={paint.white} />
      {[0, 1, 2, 3, 4, 5].map(index => <path key={index} d={`M50 8v${6 + (index % 2) * 3}`} transform={`rotate(${index * 60} 50 50)`} stroke={paint.light} strokeWidth="2" strokeLinecap="round" opacity=".6" />)}
    </g>
    {spark(50, 12, 5, paint.white, 'halo-spark')}
  </>
}

function Gear({ paint, variant }: HeroProps) {
  const teeth = 8 + (variant % 3) * 2
  return <>
    <circle cx="50" cy="50" r="40" fill={paint.accent} opacity=".06" />
    <g className="art-spin-slow">
      {Array.from({ length: teeth }, (_, index) => <rect key={index} x="46" y="4" width="8" height="14" rx="2" fill={paint.main} transform={`rotate(${(360 / teeth) * index} 50 50)`} />)}
      <circle cx="50" cy="50" r="30" fill={paint.main} />
      <circle cx="50" cy="50" r="21" fill={paint.light} opacity=".28" />
      <circle cx="50" cy="50" r="15" fill={paint.deep} />
      <circle cx="50" cy="50" r="8" fill={paint.accent} />
      <circle cx="50" cy="50" r="3.5" fill={paint.white} className="art-twinkle" />
      <path d="M36 36c8-6 18-8 27-4" fill="none" stroke={paint.white} strokeWidth="2.4" strokeLinecap="round" opacity=".55" />
    </g>
  </>
}

function Book({ paint, variant }: HeroProps) {
  return <>
    <circle cx="50" cy="50" r="40" fill={paint.accent} opacity=".06" />
    <g className="art-hover-soft">
      <path d="M8 26c14-6 28-4 42 5v52c-14-9-28-11-42-5Z" fill={paint.light} />
      <path d="M92 26c-14-6-28-4-42 5v52c14-9 28-11 42-5Z" fill={paint.main} />
      <path d="M50 31v52" stroke={paint.deep} strokeWidth="3" />
      {[0, 1, 2, 3].map(index => <path key={index} d={`M18 ${38 + index * 8}c8-3 16-2 24 3M58 ${40 + index * 8}c8-5 16-6 24-3`} fill="none" stroke={paint.deep} strokeWidth="1.4" opacity=".4" />)}
      <path d="M50 31c-6-8-15-11-23-9 2 7 9 12 18 13m5-4c6-8 15-11 23-9-2 7-9 12-18 13" fill={paint.accent} opacity=".8" />
      <circle cx="50" cy="63" r={7 + variant % 3} fill={paint.accent} />
      <circle cx="50" cy="63" r="3" fill={paint.white} />
      {spark(50, 63, 10, paint.white, 'book-spark')}
    </g>
  </>
}

function Clover({ paint, variant }: HeroProps) {
  return <>
    <circle cx="50" cy="50" r="40" fill={paint.accent} opacity=".06" />
    <g className="art-breathe-soft">
      <path d="M50 52c-2-18-18-24-28-16-9 8-4 23 14 25-14 7-17 23-7 30 10 6 21-4 21-22 2 18 18 24 28 16 9-8 4-23-14-25 14-7 17-23 7-30-10-6-21 4-21 22Z" fill={paint.main} />
      <path d="M50 52c-8 3-13 11-14 20 8 1 14-5 16-13 2 8 8 14 16 13-1-9-6-17-14-20 8-3 13-11 14-20-8-1-14 5-16 13-2-8-8-14-16-13 1 9 6 17 14 20Z" fill={paint.light} opacity=".55" />
      <path d="M50 58c3 10 3 24 0 34" fill="none" stroke={paint.deep} strokeWidth="3" strokeLinecap="round" />
      <path d="M50 77c-6-6-13-7-18-4 4 7 11 9 18 4Z" fill={paint.accent} />
      {[0, 1, 2].map(index => spark(18 + index * 30, 20 + (index % 2) * 58, 2 + (variant % 2), paint.white, `c${index}`))}
    </g>
  </>
}

function Cross({ paint, variant }: HeroProps) {
  return <>
    <circle cx="50" cy="50" r="41" fill={paint.accent} opacity=".06" />
    <g className="art-pulse-soft">
      <path d="M40 6h20v22h22v20H60v46H40V48H18V28h22Z" fill={paint.main} />
      <path d="M44 10h12v20h20v12H56v46H44V42H24V30h20Z" fill={paint.light} opacity=".55" />
      <circle cx="50" cy="38" r={7 + variant % 3} fill={paint.accent} />
      <circle cx="50" cy="38" r="3" fill={paint.white} />
      <path d="M50 6v18M18 38h18M64 38h18M50 52v38" stroke={paint.accent} strokeWidth="1.4" opacity=".55" />
      {[0, 1, 2, 3].map(index => <path key={index} d={`M${26 + index * 16} ${74 + (index % 2) * 8}l4 4`} stroke={paint.light} strokeWidth="1.8" strokeLinecap="round" opacity=".7" />)}
    </g>
  </>
}

function Fist({ paint, variant }: HeroProps) {
  return <>
    <circle cx="54" cy="54" r="38" fill={paint.accent} opacity=".14" className="art-pulse-soft" />
    <g className="art-punch-soft">
      <path d="M28 39V24c0-4 4-7 8-7s8 3 8 7v10-16c0-4 4-7 8-7s8 3 8 7v16-12c0-4 4-6 8-6s7 3 7 7v13-7c0-4 3-6 7-6 4 0 7 3 7 7v20c0 14-11 26-27 27H45c-12-1-20-7-25-17Z" fill={paint.main} transform={`rotate(${variant % 5 - 2} 55 55)`} />
      <path d="M36 38v12m16-16v14m16-10v12m16-6v10M33 61c8 8 18 11 29 9" fill="none" stroke={paint.light} strokeWidth="2.4" strokeLinecap="round" opacity=".7" />
      <path d="M5 26 20 38M2 52h17M6 78l15-10M84 16l-10 12" stroke={paint.accent} strokeWidth="3" strokeLinecap="round" />
      <path d="m78 72 6 8 8-2-4 9 6 6-10 1-2 9-6-8-9 4 2-10-7-5 9-4Z" fill={paint.light} opacity=".85" />
    </g>
  </>
}

function Seal({ paint, variant }: HeroProps) {
  return <>
    <circle cx="50" cy="50" r="43" fill={paint.accent} opacity=".06" />
    <g className="art-spin-slow">
      <circle cx="50" cy="50" r="38" fill="none" stroke={paint.main} strokeWidth="2.4" />
      <circle cx="50" cy="50" r="31" fill="none" stroke={paint.light} strokeWidth="1.2" strokeDasharray="3 5" />
      <circle cx="50" cy="50" r="23" fill={paint.deep} opacity=".65" />
      <polygon points={starPoints(50, 50, 22, 8, 6 + (variant % 3) * 2)} fill="none" stroke={paint.accent} strokeWidth="1.8" />
      <circle cx="50" cy="50" r="7" fill={paint.light} className="art-pulse-soft" />
      <circle cx="50" cy="50" r="3" fill={paint.white} />
      {Array.from({ length: 8 }, (_, index) => <path key={index} d={`M50 7v7`} transform={`rotate(${index * 45 + variant * 2} 50 50)`} stroke={paint.light} strokeWidth="2" strokeLinecap="round" />)}
      {Array.from({ length: 12 }, (_, index) => <circle key={index} cx={50 + Math.cos((index / 12) * Math.PI * 2) * 34} cy={50 + Math.sin((index / 12) * Math.PI * 2) * 34} r={index % 3 === 0 ? 1.8 : 1} fill={paint.white} opacity=".7" />)}
    </g>
  </>
}

function Spiral({ paint, variant }: HeroProps) {
  return <>
    <circle cx="50" cy="50" r="42" fill={paint.accent} opacity=".06" />
    <g className="art-spin-slow">
      <path d="M50 50c0-6 8-9 13-4 7 7 2 20-8 21-13 2-22-10-18-23 4-14 22-18 33-9 14 11 9 32-5 40-17 10-38-1-40-20-2-20 20-34 39-28" fill="none" stroke={paint.main} strokeWidth="10" strokeLinecap="round" />
      <path d="M50 50c0-6 8-9 13-4 7 7 2 20-8 21-13 2-22-10-18-23 4-14 22-18 33-9" fill="none" stroke={paint.light} strokeWidth="3" strokeLinecap="round" opacity=".75" className="art-dash-flow" />
      <circle cx="50" cy="50" r="9" fill={paint.white} />
      <circle cx="50" cy="50" r="4" fill={paint.accent} />
      {[0, 1, 2, 3, 4].map(index => spark(50 + Math.cos(index * 1.3 + variant) * 38, 50 + Math.sin(index * 1.3 + variant) * 38, 1.8 + (index % 2), paint.light, `sp${index}`))}
    </g>
  </>
}

function Bamboo({ paint, variant }: HeroProps) {
  return <>
    <circle cx="72" cy="28" r="23" fill={paint.light} opacity=".22" />
    <g className="art-sway-soft">
      {[0, 1, 2].map(index => <g key={index}>
        <path d={`M${31 + index * 19} 96V${22 + index * 6}c0-4 6-4 6 0v${74 - index * 6}`} fill="none" stroke={index % 2 ? paint.accent : paint.main} strokeWidth={7 - index} strokeLinecap="round" />
        {[0, 1, 2, 3].map(node => <path key={node} d={`M${28 + index * 19} ${36 + node * 16}v4h10v-4`} fill="none" stroke={paint.deep} strokeWidth="1.4" opacity=".5" />)}
      </g>)}
      {[0, 1, 2, 3, 4].map(index => <path key={index} d={`M${17 + index * 16} ${34 + index * 7}c-10-3-16-10-17-17 9 0 16 5 17 17Zm0 0c-3-10 1-18 7-22 3 8 0 16-7 22Z`} fill={index % 2 ? paint.accent : paint.light} opacity=".8" transform={`rotate(${variant % 10 - 5} ${17 + index * 16} ${34 + index * 7})`} />)}
    </g>
    {[0, 1, 2].map(index => <circle key={index} cx={22 + index * 28} cy={18 + (index % 2) * 62} r="1.5" fill={paint.white} className="art-twinkle" />)}
  </>
}

function Mountain({ paint, variant }: HeroProps) {
  return <>
    <circle cx="70" cy="24" r="15" fill={paint.light} opacity=".55" />
    <g className="art-drift-slow">
      <path d={`M-6 92 26 ${44 + variant % 6}l17 22 20-37 45 63Z`} fill={paint.main} />
      <path d="M26 44 43 66 36 76 21 65Z" fill={paint.white} opacity=".7" />
      <path d="M63 29 82 55 73 61 55 50Z" fill={paint.white} opacity=".55" />
      <path d="M-10 92 20 61l12 14 15-13 16 19 18-12 29 23Z" fill={paint.deep} opacity=".55" />
      <path d="M0 82c18-12 37-11 55 3M40 74c15-8 29-7 43 2" fill="none" stroke={paint.light} strokeWidth="2.4" strokeLinecap="round" opacity=".5" />
      <path d="M0 100h100" stroke={paint.accent} strokeWidth="1" opacity=".35" />
    </g>
    {[0, 1, 2].map(index => <path key={index} d={`M${20 + index * 28} ${34 + (index % 2) * 12}l6 3`} stroke={paint.light} strokeWidth="1.6" strokeLinecap="round" opacity=".6" />)}
  </>
}

function Sun({ paint, variant }: HeroProps) {
  const rays = 12 + (variant % 4) * 2
  return <>
    <circle cx="50" cy="50" r="43" fill={paint.accent} opacity=".06" className="art-pulse-soft" />
    <g className="art-spin-slow">
      {Array.from({ length: rays }, (_, index) => <path key={index} d="M50 2 53 18 50 24 47 18Z" fill={index % 2 ? paint.accent : paint.light} opacity=".75" transform={`rotate(${(360 / rays) * index} 50 50)`} />)}
    </g>
    <circle cx="50" cy="50" r="29" fill={paint.main} />
    <circle cx="50" cy="50" r="24" fill={paint.light} opacity=".55" />
    <circle cx="44" cy="44" r="8" fill={paint.white} opacity=".7" />
    <circle cx="50" cy="50" r="15" fill={paint.white} opacity=".18" />
    <path d="M30 50a20 20 0 0 1 40 0" fill="none" stroke={paint.white} strokeWidth="1.6" opacity=".55" />
  </>
}

function Gem({ paint, variant }: HeroProps) {
  const facets = [
    { d: 'M50 8 78 32 50 48 22 32Z', fill: paint.light, opacity: 0.8 },
    { d: 'M22 32 50 48 44 86 16 48Z', fill: paint.main, opacity: 0.95 },
    { d: 'M78 32 50 48 56 86 84 48Z', fill: paint.accent, opacity: 0.9 },
    { d: 'M50 48 44 86 56 86Z', fill: paint.deep, opacity: 0.75 },
  ]
  return <>
    <circle cx="50" cy="50" r="40" fill={paint.accent} opacity=".06" />
    <g className="art-hover-soft">
      <ellipse cx="50" cy="89" rx="28" ry="6" fill={paint.deep} opacity=".35" />
      {facets.map((facet, index) => <path key={index} d={facet.d} fill={facet.fill} opacity={facet.opacity} stroke={paint.white} strokeWidth=".8" />)}
      <path d="M50 8 78 32 84 48 56 86 44 86 16 48 22 32Z" fill="none" stroke={paint.light} strokeWidth="1.4" opacity=".55" />
      <path d="M34 27l6 5m22-3 5-4" stroke={paint.white} strokeWidth="2" strokeLinecap="round" opacity=".65" />
      {spark(74, 18, 5 + (variant % 3), paint.white, 'gem-spark')}
      {spark(23, 68, 3, paint.light, 'gem-spark2')}
    </g>
  </>
}

function Honeycomb({ paint, variant }: HeroProps) {
  const cells = [[50, 24], [33, 34], [67, 34], [22, 51], [44, 44], [56, 44], [78, 51], [33, 62], [67, 62], [50, 74]]
  return <>
    <circle cx="50" cy="50" r="42" fill={paint.accent} opacity=".06" />
    <g className="art-hover-soft">
      {cells.slice(0, 7 + (variant % 4)).map(([cx, cy], index) => <g key={index}>
        <polygon points={hexPoints(cx, cy, 12, 0)} fill={index % 3 === 0 ? paint.light : index % 2 ? paint.main : paint.accent} opacity=".9" stroke={paint.deep} strokeWidth="1.2" />
        <polygon points={hexPoints(cx, cy, 7, 0)} fill={paint.deep} opacity=".28" />
      </g>)}
      <path d="M29 24c4-6 10-10 16-12m27 62c-6 5-13 8-21 9" fill="none" stroke={paint.white} strokeWidth="2" strokeLinecap="round" opacity=".55" />
    </g>
    {spark(82, 18, 3, paint.white, 'honey-spark')}
  </>
}

function Circuit({ paint, variant }: HeroProps) {
  return <>
    <circle cx="50" cy="50" r="41" fill={paint.accent} opacity=".06" />
    <g className="art-glitch-soft">
      <rect x="25" y="25" width="50" height="50" rx="5" fill={paint.deep} stroke={paint.main} strokeWidth="2.4" />
      <rect x="32" y="32" width="36" height="36" rx="3" fill="none" stroke={paint.accent} strokeWidth="1.2" opacity=".7" />
      <rect x="41" y="41" width="18" height="18" rx="2" fill={paint.main} />
      <rect x="45" y="45" width="10" height="10" rx="1.5" fill={paint.white} className="art-pulse-soft" />
      {[0, 1, 2, 3].map(index => <g key={index}>
        <path d={`M${38 + index * 8} 25V12`} stroke={paint.light} strokeWidth="1.6" />
        <path d={`M${38 + index * 8} 75v13`} stroke={paint.light} strokeWidth="1.6" />
        <path d={`M25 ${38 + index * 8}H12`} stroke={paint.light} strokeWidth="1.6" />
        <path d={`M75 ${38 + index * 8}h13`} stroke={paint.light} strokeWidth="1.6" />
        <circle cx={38 + index * 8} cy="12" r="1.4" fill={paint.accent} />
        <circle cx="12" cy={38 + index * 8} r="1.4" fill={paint.accent} />
      </g>)}
      <path d="M31 20h10v5h5v5h8v5h7" fill="none" stroke={paint.accent} strokeWidth="1.4" opacity=".75" />
      <path d="M69 80h-8v-5h-6v-5" fill="none" stroke={paint.accent} strokeWidth="1.4" opacity=".55" />
      <rect x="29" y={variant % 2 ? 56 : 36} width="22" height="3" fill={paint.light} opacity=".6" className="art-scan-soft" />
    </g>
  </>
}

function Ink({ paint, variant }: HeroProps) {
  return <>
    <circle cx="50" cy="50" r="40" fill={paint.accent} opacity=".06" />
    <g className="art-drift-slow">
      <path d="M12 70c10-17 24-20 35-8 8-18 24-23 36-10 9 10 3 24-12 26-16 2-31-3-44 10-6 6-15 6-18-2-3-6 0-12 3-16Z" fill={paint.deep} opacity=".85" />
      <path d="M25 48c14-16 30-20 44-10 11 8 8 20-4 22-13 2-20-8-28-6-5 2-9 1-12-6Z" fill={paint.main} />
      <path d="M42 30c8-6 17-8 24-5" fill="none" stroke={paint.light} strokeWidth="3" strokeLinecap="round" opacity=".65" />
      <path d="M62 22c7 1 12 5 14 10" fill="none" stroke={paint.light} strokeWidth="1.4" strokeLinecap="round" opacity=".5" />
      {[0, 1, 2, 3, 4].map(index => <circle key={index} cx={22 + index * 15} cy={28 + (index % 3) * 8} r={1 + (variant + index) % 3} fill={paint.light} opacity=".8" />)}
      <path d="M16 84c20-6 38-5 55 2" fill="none" stroke={paint.accent} strokeWidth="2" strokeLinecap="round" opacity=".7" />
    </g>
  </>
}

function Prism({ paint, variant }: HeroProps) {
  return <>
    <circle cx="50" cy="50" r="41" fill={paint.accent} opacity=".06" />
    <g className="art-hover-soft">
      <path d="M50 10 82 72H18Z" fill={paint.main} />
      <path d="M50 10 82 72H50Z" fill={paint.light} opacity=".35" />
      <path d="M50 32 68 72H32Z" fill={paint.white} opacity=".22" />
      <path d="M82 55 100 45v8L82 65m-64-10L-0 45v8l18 12" fill={paint.accent} opacity=".7" />
      {['#fb7185', '#fbbf24', '#34d399', '#38bdf8', '#a78bfa'].map((color, index) => <path key={color} d={`M${72 + index} ${60 + index * 2} 100 ${52 + index * 4}`} stroke={color} strokeWidth={2 - index * 0.2} opacity=".8" transform={`rotate(${variant % 3 - 1} 50 50)`} />)}
      <path d="M38 22 46 38" stroke={paint.white} strokeWidth="2" strokeLinecap="round" opacity=".75" />
    </g>
    {spark(18, 78, 3, paint.light, 'prism-spark')}
  </>
}

function Heart({ paint }: HeroProps) {
  return <>
    <circle cx="50" cy="50" r="41" fill={paint.accent} opacity=".06" className="art-pulse-soft" />
    <g className="art-heartbeat">
      <path d="M50 84S16 62 16 38c0-14 17-22 28-10l6 7 6-7c11-12 28-4 28 10 0 24-34 46-34 46Z" fill={paint.main} />
      <path d="M50 74S24 57 24 40c0-9 11-14 18-6l8 9 8-9c7-8 18-3 18 6 0 17-26 34-26 34Z" fill={paint.light} opacity=".55" />
      <path d="M33 34c3-4 8-4 11-1" fill="none" stroke={paint.white} strokeWidth="2.4" strokeLinecap="round" opacity=".8" />
      <path d="M50 18v-8M28 25l-6-6M72 25l6-6" stroke={paint.accent} strokeWidth="1.8" strokeLinecap="round" opacity=".65" />
    </g>
    {[0, 1, 2].map(index => spark(22 + index * 28, 18 + (index % 2) * 62, 2, paint.white, `h${index}`))}
  </>
}

function Jellyfish({ paint, variant }: HeroProps) {
  return <>
    <circle cx="50" cy="45" r="40" fill={paint.accent} opacity=".06" className="art-pulse-soft" />
    <g className="art-float-soft">
      <path d="M15 48c0-21 15-34 35-34s35 13 35 34c-10 10-22 14-35 14S25 58 15 48Z" fill={paint.main} />
      <path d="M24 46c1-14 11-23 26-23 8 0 15 3 19 8-8-4-16-4-23 0-9 5-14 13-15 23-3-2-5-5-7-8Z" fill={paint.light} opacity=".7" />
      <path d="M23 56c4 12 3 24-4 36M36 61c3 14 1 25-3 33M50 62c0 14 2 24 0 34M64 61c-3 14-1 25 3 33M77 56c-4 12-3 24 4 36" fill="none" stroke={paint.accent} strokeWidth={2 + (variant % 2)} strokeLinecap="round" className="art-tentacle-soft" />
      <circle cx="38" cy="34" r="3" fill={paint.white} />
      <circle cx="61" cy="42" r="2" fill={paint.white} opacity=".8" />
      <path d="M39 56c7 5 15 5 22 0" fill="none" stroke={paint.white} strokeWidth="2" strokeLinecap="round" opacity=".55" />
    </g>
    {[0, 1, 2, 3].map(index => <circle key={index} cx={18 + index * 21} cy={20 + (index % 2) * 70} r="1.6" fill={paint.light} className="art-rise-soft" style={{ animationDelay: `${index * -0.6}s` }} />)}
  </>
}

function Coral({ paint, variant }: HeroProps) {
  return <>
    <circle cx="50" cy="50" r="40" fill={paint.accent} opacity=".06" />
    <g className="art-sway-soft">
      <path d="M50 96V63m0 8c-10-2-17-9-18-20m18 20c10-2 17-9 18-20M32 51c-8-5-10-14-7-23 5 7 10 9 16 8M68 51c8-5 10-14 7-23-5 7-10 9-16 8M18 66c-7 0-12-4-14-10 6 0 10 2 14 6m64 4c7 0 12-4 14-10-6 0-10 2-14 6" fill="none" stroke={indexColor(paint, variant)} strokeWidth="4.4" strokeLinecap="round" />
      <path d="M39 66c-9-6-13-16-12-28m34 28c9-6 13-16 12-28" fill="none" stroke={paint.accent} strokeWidth="2.4" strokeLinecap="round" opacity=".7" />
      <circle cx="30" cy="30" r="4" fill={paint.light} opacity=".65" />
      <circle cx="72" cy="36" r="3" fill={paint.light} opacity=".5" />
      <circle cx="83" cy="20" r="2" fill={paint.white} opacity=".7" />
    </g>
  </>
}

function indexColor(paint: HeroPaint, variant: number) {
  return variant % 2 ? paint.main : paint.light
}

function Dandelion({ paint, variant }: HeroProps) {
  const seeds = 16 + (variant % 5) * 2
  return <>
    <circle cx="50" cy="44" r="38" fill={paint.accent} opacity=".1" />
    <g className="art-drift-slow">
      <path d="M50 78c-3 10-2 17 2 22" fill="none" stroke={paint.deep} strokeWidth="2.4" strokeLinecap="round" />
      {Array.from({ length: seeds }, (_, index) => {
        const angle = (360 / seeds) * index
        const radius = 31 + (index % 3) * 3
        const x = 50 + Math.cos((angle * Math.PI) / 180) * radius
        const y = 42 + Math.sin((angle * Math.PI) / 180) * radius
        return <g key={index} transform={`rotate(${angle} 50 42)`}>
          <path d="M50 42 66 18" stroke={paint.light} strokeWidth="1" opacity=".7" />
          <path d={`M${x} ${y}l4-6m-4 6 7 1m-7-1 1 7`} stroke={paint.accent} strokeWidth=".9" strokeLinecap="round" opacity=".8" />
        </g>
      })}
      <circle cx="50" cy="42" r="8" fill={paint.main} />
      <circle cx="50" cy="42" r="4" fill={paint.light} />
      {[0, 1, 2, 3].map(index => <g key={`f${index}`} transform={`translate(${10 + index * 22} ${12 + (index % 2) * 56}) rotate(${index * 17})`} className="art-float-soft" style={{ animationDelay: `${index * -0.9}s` }}>
        <path d="M0 0 3-8M0 0 6-4M0 0 0 3" stroke={paint.white} strokeWidth="1.2" strokeLinecap="round" />
        <circle r="1.4" fill={paint.light} />
      </g>)}
    </g>
  </>
}

function Willow({ paint }: HeroProps) {
  return <>
    <circle cx="50" cy="48" r="41" fill={paint.accent} opacity=".06" />
    <g className="art-sway-soft">
      <path d="M8 0c22 15 33 37 35 68 1 11-2 21-7 28" fill="none" stroke={paint.deep} strokeWidth="7" strokeLinecap="round" />
      <path d="M11 4c17 18 25 37 27 59" fill="none" stroke={paint.main} strokeWidth="3" strokeLinecap="round" opacity=".7" />
      {[0, 1, 2, 3, 4, 5].map(index => <path key={index} d={`M${16 + index * 6} ${10 + index * 9}c${8 + index * 3} ${14 + index * 4} ${5 + index * 2} ${34 + index * 3} ${-4 - index} ${59 + index * 2}`} fill="none" stroke={index % 2 ? paint.accent : paint.main} strokeWidth={2 - index * 0.12} strokeLinecap="round" opacity=".85" />)}
      {[0, 1, 2, 3, 4, 5, 6, 7].map(index => <ellipse key={`l${index}`} cx={19 + index * 8} cy={31 + index * 7} rx="3.4" ry="1.5" fill={paint.light} opacity=".8" transform={`rotate(${35 + index * 4} ${19 + index * 8} ${31 + index * 7})`} />)}
      <path d="M18 96c18-4 35-4 51 0" fill="none" stroke={paint.accent} strokeWidth="2" opacity=".5" />
    </g>
  </>
}

function Ribbon({ paint, variant }: HeroProps) {
  return <>
    <circle cx="50" cy="50" r="41" fill={paint.accent} opacity=".06" />
    <g className="art-flow-soft">
      <path d="M-8 70C8 20 25 12 43 35c13 17 20 19 31 7 12-13 22-7 34 21" fill="none" stroke={paint.deep} strokeWidth="16" strokeLinecap="round" opacity=".35" />
      <path d="M-8 64C8 14 25 6 43 29c13 17 20 19 31 7 12-13 22-7 34 21" fill="none" stroke={paint.main} strokeWidth="11" strokeLinecap="round" />
      <path d="M-8 60C8 10 25 2 43 25c13 17 20 19 31 7 12-13 22-7 34 21" fill="none" stroke={paint.light} strokeWidth="3" strokeLinecap="round" opacity=".75" />
      <path d="M-2 82C14 42 28 34 44 52c12 13 20 14 31 5 10-8 19-2 29 18" fill="none" stroke={paint.accent} strokeWidth="2.2" strokeLinecap="round" opacity=".65" />
      {[0, 1, 2, 3, 4].map(index => spark(12 + index * 20, 26 + ((index * 17) % 50), 1.6 + (variant + index) % 2, paint.white, `r${index}`))}
    </g>
  </>
}

function Pixel({ paint }: HeroProps) {
  const pixels = [
    [22, 30, 12, paint.main], [34, 30, 12, paint.main], [22, 42, 12, paint.main], [34, 42, 12, paint.main], [46, 42, 12, paint.light],
    [58, 42, 12, paint.main], [70, 42, 12, paint.main], [64, 30, 12, paint.main], [52, 30, 12, paint.accent],
    [34, 54, 12, paint.main], [46, 54, 12, paint.light], [58, 54, 12, paint.accent], [42, 66, 12, paint.main], [54, 66, 12, paint.accent],
    [48, 78, 12, paint.deep],
  ]
  return <>
    <circle cx="50" cy="50" r="40" fill={paint.accent} opacity=".06" />
    <g className="art-glitch-soft">
      {pixels.map(([x, y, size, fill], index) => <rect key={index} x={x} y={y} width={size} height={size} rx="1.5" fill={fill as string} opacity={0.82 + (index % 3) * 0.06} />)}
      <path d="M14 20h8v8h-8zm64 54h8v8h-8z" fill={paint.white} opacity=".6" />
      <path d="M8 50h6m72 0h6M50 8v6m0 72v6" stroke={paint.light} strokeWidth="1.4" opacity=".45" />
    </g>
  </>
}

function Tiger({ paint, variant }: HeroProps) {
  return <>
    <circle cx="50" cy="50" r="40" fill={paint.accent} opacity=".06" />
    <g className="art-breathe-soft">
      <path d="M26 24 17 6c10 0 17 4 22 12M74 24 83 6c-10 0-17 4-22 12" fill={paint.accent} />
      <path d="M50 17c19 0 31 12 31 30 0 21-14 37-31 40-17-3-31-19-31-40 0-18 12-30 31-30Z" fill={paint.light} />
      <path d="M50 17c19 0 31 12 31 30 0 21-14 37-31 40V17Z" fill={paint.main} opacity=".22" />
      <path d="M31 34h8l-4 12m34-12h-8l4 12M34 57l10-2m22 2-10-2M50 38v10l-5 4m5-4 5 4" stroke={paint.deep} strokeWidth={4 + (variant % 2)} strokeLinecap="round" />
      <path d="M34 50c4-4 9-4 13 0-4 4-9 4-13 0Zm19 0c4-4 9-4 13 0-4 4-9 4-13 0Z" fill={paint.accent} />
      <circle cx="40.5" cy="50" r="2" fill={paint.white} /><circle cx="59.5" cy="50" r="2" fill={paint.white} />
      <path d="M46 65 50 71l4-6-4-3Z" fill={paint.accent} />
      <path d="M50 71v5m-8-2c5 3 11 3 16 0" fill="none" stroke={paint.deep} strokeWidth="1.6" strokeLinecap="round" />
    </g>
  </>
}

function Qilin({ paint, variant }: HeroProps) {
  return <>
    <circle cx="50" cy="50" r="41" fill={paint.accent} opacity=".06" />
    <g className="art-hover-soft">
      <path d="M40 26c-8-10-10-20-7-26 8 5 13 12 14 22m13 4c8-10 10-20 7-26-8 5-13 12-14 22" fill="none" stroke={paint.accent} strokeWidth="3" strokeLinecap="round" />
      <path d="M28 43c0-13 10-21 23-21s22 9 22 21c0 12-6 19-13 25-5 4-6 10-5 16H44c1-8-2-14-8-20-5-5-8-12-8-21Z" fill={paint.main} />
      <path d="M38 26c10-7 22-6 30 2" fill="none" stroke={paint.light} strokeWidth="3" strokeLinecap="round" opacity=".7" />
      <path d="M31 43c-6-4-11-4-16-1 5 3 8 7 9 12m45-11c6-4 11-4 16-1-5 3-8 7-9 12" fill={paint.accent} opacity=".8" />
      <path d="M36 40c4-3 8-2 10 2-4 2-8 1-10-2Zm18 0c4-3 8-2 10 2-4 2-8 1-10-2Z" fill={paint.white} />
      <circle cx="41" cy="41" r="1.5" fill={paint.deep} /><circle cx="59" cy="41" r="1.5" fill={paint.deep} />
      <path d="M46 66h8l-4 6Z" fill={paint.accent} />
      <path d="M19 60c8 4 12 10 13 18m49-18c-8 4-12 10-13 18" fill="none" stroke={paint.accent} strokeWidth={2 + (variant % 2)} strokeLinecap="round" opacity=".6" />
      <circle cx="50" cy="86" r="4" fill={paint.light} opacity=".5" />
    </g>
  </>
}

function Lion({ paint }: HeroProps) {
  return <>
    <circle cx="50" cy="50" r="42" fill={paint.accent} opacity=".06" />
    <g className="art-breathe-soft">
      {Array.from({ length: 14 }, (_, index) => <path key={index} d="M50 12 57 27 50 34 43 27Z" fill={index % 2 ? paint.accent : paint.main} transform={`rotate(${(360 / 14) * index} 50 50)`} opacity=".9" />)}
      <circle cx="50" cy="50" r="29" fill={paint.light} />
      <path d="M50 23c14 0 23 9 23 22 0 17-11 29-23 32-12-3-23-15-23-32 0-13 9-22 23-22Z" fill={paint.main} opacity=".65" />
      <path d="M34 46c4-4 9-4 13 0-4 4-9 4-13 0Zm19 0c4-4 9-4 13 0-4 4-9 4-13 0Z" fill={paint.deep} />
      <circle cx="40.5" cy="46" r="2" fill={paint.white} /><circle cx="59.5" cy="46" r="2" fill={paint.white} />
      <path d="M50 52v9l-6 4m6-4 6 4M46 72c3 2 6 2 8 0" fill="none" stroke={paint.deep} strokeWidth="2" strokeLinecap="round" />
      <path d="M28 30c5-5 12-8 19-9m29 57c-6 5-13 8-21 9" fill="none" stroke={paint.white} strokeWidth="2" strokeLinecap="round" opacity=".55" />
    </g>
  </>
}

function Crane({ paint, variant }: HeroProps) {
  return <>
    <circle cx="50" cy="50" r="40" fill={paint.accent} opacity=".06" />
    <g className="art-hover-soft">
      <path d="M34 90c4-15 8-27 17-36 8-8 19-11 29-9-8 3-14 8-18 15 9-2 17 0 23 6-10 0-18 4-23 11-6 8-9 15-10 24-5-2-11-6-18-11Z" fill={paint.main} />
      <path d="M65 43c6-10 14-15 23-15-6 6-9 12-9 19-5-2-10-3-14-4Z" fill={paint.light} />
      <circle cx="78" cy="36" r="2.4" fill={paint.white} /><circle cx="78.6" cy="36" r="1" fill={paint.deep} />
      <path d="M83 39c4-1 7 0 9 3-4 0-6 1-8 3Z" fill={paint.accent} />
      <path d="M40 78C27 62 18 46 16 26c12 8 22 20 28 36 8-13 18-22 31-27-8 14-19 27-33 38Z" fill={paint.light} opacity=".65" />
      <path d="M32 46c8 8 14 17 18 28M58 45c-8 8-14 17-18 28" fill="none" stroke={paint.accent} strokeWidth="2" strokeLinecap="round" />
      <circle cx="58" cy="35" r={2 + (variant % 2)} fill={paint.white} />
      <path d="M34 90c8-4 16-5 24-2" fill="none" stroke={paint.accent} strokeWidth="2" strokeLinecap="round" />
    </g>
  </>
}

function Compass({ paint, variant }: HeroProps) {
  const points = 4 + (variant % 3) * 2
  return <>
    <circle cx="50" cy="50" r="43" fill={paint.accent} opacity=".06" />
    <g className="art-spin-slow">
      <circle cx="50" cy="50" r="38" fill="none" stroke={paint.main} strokeWidth="2.4" />
      <circle cx="50" cy="50" r="31" fill="none" stroke={paint.light} strokeWidth="1.2" strokeDasharray="2 6" />
      <polygon points={starPoints(50, 50, 34, 6, points)} fill={paint.main} />
      <polygon points={starPoints(50, 50, 24, 4, points)} fill={paint.light} opacity=".75" />
      <circle cx="50" cy="50" r="8" fill={paint.deep} />
      <circle cx="50" cy="50" r="4" fill={paint.white} className="art-twinkle" />
      {Array.from({ length: 8 }, (_, index) => <path key={index} d="M50 4v5" transform={`rotate(${index * 45} 50 50)`} stroke={paint.accent} strokeWidth="1.6" strokeLinecap="round" />)}
    </g>
    {spark(50, 50, 16, paint.accent, 'compass-spark')}
  </>
}

const renderers: Record<HeroKey, (props: HeroProps) => ReactNode> = {
  orb: Orb, crescent: Crescent, comet: Comet, wings: Wings, lotus: Lotus, rose: Rose,
  sakura: Sakura, serpent: Serpent, dragon: Dragon, fox: Fox, mask: Mask, crown: Crown,
  crystal: Crystal, sword: Sword, star: Star, rift: Rift, flame: Flame, wave: Wave,
  feather: Feather, moth: Moth, koi: Koi, lantern: Lantern, snow: Snow, cloud: Cloud,
  eye: Eye, halo: Halo, gear: Gear, book: Book, clover: Clover, cross: Cross, fist: Fist,
  seal: Seal, spiral: Spiral, bamboo: Bamboo, mountain: Mountain, sun: Sun, gem: Gem,
  honeycomb: Honeycomb, circuit: Circuit, ink: Ink, prism: Prism, heart: Heart,
  jellyfish: Jellyfish, coral: Coral, dandelion: Dandelion, willow: Willow, ribbon: Ribbon,
  pixel: Pixel, tiger: Tiger, qilin: Qilin, lion: Lion, crane: Crane, compass: Compass,
}

export default function HeroGlyph({ hero, paint, variant }: HeroProps) {
  const Renderer = renderers[hero] ?? Orb
  return <g style={{ '--hero-variant': variant } as CSSProperties}>{Renderer({ hero, paint, variant })}</g>
}
