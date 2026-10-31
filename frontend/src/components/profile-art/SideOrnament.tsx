import type { BorderSideKey } from '../../effects/borderRecipes'
import type { CosmeticPalette } from '../../effects/artColor'

interface SideOrnamentProps {
  side: BorderSideKey
  palette: CosmeticPalette
  seed: number
}

function spark(x: number, y: number, size: number, fill: string, opacity = 0.9) {
  return <path key={`${x}-${y}-${size}`} d={`M${x} ${y - size}L${x + size * 0.26} ${y - size * 0.26}L${x + size} ${y}L${x + size * 0.26} ${y + size * 0.26}L${x} ${y + size}L${x - size * 0.26} ${y + size * 0.26}L${x - size} ${y}L${x - size * 0.26} ${y - size * 0.26}Z`} fill={fill} opacity={opacity} />
}

function snowflake(x: number, y: number, size: number, fill: string) {
  return <g key={`${x}-${y}`} transform={`translate(${x} ${y})`} stroke={fill} strokeWidth=".8" strokeLinecap="round" opacity=".88">
    {[0, 60, 120].map(angle => <path key={angle} d={`M${-size} 0h${size * 2}`} transform={`rotate(${angle})`} />)}
    {[0, 60, 120].map(angle => <path key={`b${angle}`} d={`M${-size * 0.6} ${-size * 0.32}l${size * 0.3} ${size * 0.32} ${-size * 0.3} ${size * 0.32}`} transform={`rotate(${angle})`} />)}
  </g>
}

export default function SideOrnament({ side, palette, seed }: SideOrnamentProps) {
  const shift = seed % 7
  switch (side) {
    case 'sparks':
      return <g className="bf-side-art" data-side={side}>
        {spark(10, 34 + shift, 3.6, palette.highlight)}
        {spark(16, 48, 2.2, palette.primary)}
        {spark(9, 62 - shift, 2.8, palette.secondary)}
        {spark(15, 73, 1.4, '#fff', .8)}
      </g>
    case 'bubbles':
      return <g className="bf-side-art" data-side={side}>
        {[[11, 33, 4.2], [17, 47, 2.8], [9, 61, 3.4], [15, 72, 2]].map(([x, y, r], index) => <g key={index}>
          <circle cx={x} cy={y} r={r} fill={palette.tint} opacity=".28" stroke={index % 2 ? palette.secondary : palette.highlight} strokeWidth=".9" />
          <circle cx={x - r * .3} cy={y - r * .3} r={r * .25} fill="#fff" opacity=".65" />
        </g>)}
      </g>
    case 'petals':
      return <g className="bf-side-art" data-side={side}>
        {[0, 1, 2].map(index => <path key={index} d="M0-6c5 1 6 5 0 12-6-7-5-11 0-12Z" fill={index === 1 ? palette.secondary : palette.highlight} opacity=".88" transform={`translate(${10 + index * 3} ${32 + index * 14}) rotate(${index * 58 + shift * 5})`} />)}
        <ellipse cx="10" cy="70" rx="2" ry="1" fill={palette.primary} opacity=".7" transform="rotate(38 10 70)" />
      </g>
    case 'leaves':
      return <g className="bf-side-art" data-side={side}>
        <path d="M12 28C8 42 8 58 13 76" fill="none" stroke={palette.primary} strokeWidth="1.4" strokeLinecap="round" />
        {[0, 1, 2].map(index => <path key={index} d={`M${12 - index * .8} ${40 + index * 12}c-6-3-9-7-9-12 5 0 9 3 11 8Zm0 0c1-6 4-10 9-12 0 6-3 10-7 13Z`} fill={index % 2 ? palette.secondary : palette.highlight} opacity=".82" />)}
      </g>
    case 'snow':
      return <g className="bf-side-art" data-side={side}>
        {snowflake(11, 36, 4.2, palette.highlight)}
        {snowflake(16, 57, 2.8, palette.secondary)}
        {snowflake(9, 72, 2, '#fff')}
      </g>
    case 'embers':
      return <g className="bf-side-art" data-side={side}>
        {[[12, 35, 3.2], [17, 51, 2.2], [10, 65, 2.8], [16, 75, 1.6]].map(([x, y, r], index) => <g key={index}>
          <circle cx={x} cy={y} r={r * 1.9} fill={palette.primary} opacity=".12" />
          <circle cx={x} cy={y} r={r} fill={index % 2 ? palette.highlight : palette.secondary} opacity=".95" />
          <circle cx={x - r * .25} cy={y - r * .3} r={r * .36} fill="#fff" opacity=".8" />
        </g>)}
      </g>
    case 'stars':
      return <g className="bf-side-art" data-side={side}>
        {spark(11, 35, 5, palette.highlight)}
        {spark(17, 55, 2.8, palette.secondary)}
        {spark(9, 70, 2, '#fff', .8)}
      </g>
    case 'shards':
      return <g className="bf-side-art" data-side={side}>
        <path d="M7 30 19 40 12 45Z" fill={palette.primary} stroke={palette.highlight} strokeWidth=".6" opacity=".9" />
        <path d="M14 52 8 64l10-3Z" fill={palette.secondary} stroke={palette.highlight} strokeWidth=".5" opacity=".82" />
        <path d="M16 44 20 52l-6 1Z" fill={palette.highlight} opacity=".6" />
      </g>
    case 'coins':
      return <g className="bf-side-art" data-side={side}>
        {[[11, 38, 3.6], [16, 58, 2.8]].map(([x, y, r], index) => <g key={index}>
          <circle cx={x} cy={y} r={r} fill={palette.secondary} stroke={palette.highlight} strokeWidth=".8" />
          <circle cx={x} cy={y} r={r * .56} fill="none" stroke={palette.deep} strokeWidth=".7" opacity=".55" />
          <path d={`M${x - r * .3} ${y - r * .2}  ${x + r * .2} ${y - r * .45}`} stroke="#fff" strokeWidth=".7" opacity=".55" strokeLinecap="round" />
        </g>)}
      </g>
    case 'notes':
      return <g className="bf-side-art" data-side={side}>
        <path d="M12 35v27m0-24 9-2v22" fill="none" stroke={palette.highlight} strokeWidth="1.6" strokeLinecap="round" />
        <ellipse cx="9.4" cy="63" rx="3.2" ry="2.3" fill={palette.primary} transform="rotate(-18 9.4 63)" />
        <ellipse cx="18.2" cy="61" rx="3" ry="2.2" fill={palette.secondary} transform="rotate(-18 18.2 61)" />
      </g>
    case 'feathers':
      return <g className="bf-side-art" data-side={side}>
        <path d="M17 29C7 41 6 55 11 72c10-9 14-24 12-40Z" fill={palette.highlight} opacity=".76" />
        <path d="M17 29C9 41 8 54 11 70c6-10 8-23 6-41Z" fill={palette.primary} opacity=".55" />
        <path d="M11 72C13 55 16 43 22 31" fill="none" stroke={palette.deep} strokeWidth="1" opacity=".5" strokeLinecap="round" />
      </g>
    case 'orbs':
      return <g className="bf-side-art" data-side={side}>
        {[[11, 37, 4.6], [16, 56, 3]].map(([x, y, r], index) => <g key={index}>
          <circle cx={x} cy={y} r={r * 2.2} fill={palette.primary} opacity=".1" />
          <circle cx={x} cy={y} r={r} fill={index ? palette.secondary : palette.highlight} opacity=".28" stroke={index ? palette.highlight : palette.primary} strokeWidth="1" />
          <circle cx={x - r * .25} cy={y - r * .3} r={r * .32} fill="#fff" opacity=".8" />
        </g>)}
      </g>
    case 'none':
    default:
      return null
  }
}
