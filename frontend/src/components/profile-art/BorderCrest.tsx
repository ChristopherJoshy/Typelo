import type { ReactNode } from 'react'
import type { BorderCrestKey } from '../../effects/borderRecipes'
import type { CosmeticPalette } from '../../effects/artColor'

interface BorderCrestProps {
  crest: BorderCrestKey
  palette: CosmeticPalette
  seed: number
}

function spark(x: number, y: number, size: number, fill: string, opacity = 0.9) {
  return <path key={`${x}-${y}-${size}`} d={`M${x} ${y - size}L${x + size * 0.26} ${y - size * 0.26}L${x + size} ${y}L${x + size * 0.26} ${y + size * 0.26}L${x} ${y + size}L${x - size * 0.26} ${y + size * 0.26}L${x - size} ${y}L${x - size * 0.26} ${y - size * 0.26}Z`} fill={fill} opacity={opacity} />
}

function Mirrored({ children }: { children: ReactNode }) {
  return <>
    {children}
    <g transform="translate(100 0) scale(-1 1)">{children}</g>
  </>
}

function gem(x: number, y: number, size: number, palette: CosmeticPalette, rotation = 0) {
  return <g key={`${x}-${y}-${size}`} transform={`translate(${x} ${y}) rotate(${rotation})`}>
    <path d={`M0 ${-size}L${size * 0.72} 0 0 ${size} ${-size * 0.72} 0Z`} fill={palette.primary} stroke={palette.highlight} strokeWidth="0.7" />
    <path d={`M0 ${-size} 0 ${size} ${-size * 0.72} 0Z`} fill={palette.highlight} opacity=".55" />
    <path d={`M0 ${-size * 0.5}L${size * 0.32} 0 0 ${size * 0.22} ${-size * 0.32} 0Z`} fill="#fff" opacity=".5" />
  </g>
}

function flower(x: number, y: number, size: number, palette: CosmeticPalette, rotation = 0) {
  return <g key={`${x}-${y}-${size}`} transform={`translate(${x} ${y}) rotate(${rotation})`}>
    {[0, 1, 2, 3, 4].map(index => <ellipse key={index} cx="0" cy={-size * 0.58} rx={size * 0.32} ry={size * 0.58} fill={index % 2 ? palette.secondary : palette.highlight} opacity=".95" transform={`rotate(${index * 72})`} />)}
    <circle r={size * 0.27} fill={palette.primary} />
    <circle r={size * 0.12} fill="#fff" opacity=".85" />
  </g>
}

function crestArt(crest: BorderCrestKey, palette: CosmeticPalette, seed: number): ReactNode {
  const variant = seed % 4
  const light = palette.highlight
  const main = palette.primary
  const accent = palette.secondary

  switch (crest) {
    case 'halo':
      return <>
        <ellipse cx="50" cy="12" rx="18" ry="5.2" fill="none" stroke={light} strokeWidth="3" />
        <ellipse cx="50" cy="12" rx="12" ry="2.6" fill="none" stroke="#fff" strokeWidth="1" opacity=".75" />
        <path d="M50 4v3M34 8l2 2M66 8l-2 2" stroke={light} strokeWidth="1.4" strokeLinecap="round" />
        {spark(50, 0, 3.2, '#fff')}
        {[0, 1, 2].map(index => spark(31 + index * 19, 4 + (index % 2) * 4, 1.4, accent, .8))}
      </>
    case 'horns':
      return <>
        <Mirrored>
          <path d="M38 24C30 16 26 8 26-2c8 3 14 9 17 18Z" fill={accent} stroke={light} strokeWidth="1" strokeLinejoin="round" />
          <path d="M34 8c2 4 4 7 7 10" fill="none" stroke="#fff" strokeWidth="1.2" opacity=".5" strokeLinecap="round" />
        </Mirrored>
        {gem(50, 17, 5.5, palette, 0)}
        <path d="M42 22c5 3 11 3 16 0" fill="none" stroke={light} strokeWidth="1.2" opacity=".7" strokeLinecap="round" />
      </>
    case 'ears':
      return <>
        <Mirrored>
          <path d="M31 24 24 1c10 3 18 10 22 20Z" fill={main} stroke={light} strokeWidth="1" strokeLinejoin="round" />
          <path d="M30 19 27 7c5 2 9 6 11 11Z" fill={light} opacity=".65" />
        </Mirrored>
        <path d="M38 23c7 2 17 2 24 0" fill="none" stroke={light} strokeWidth="1.3" opacity=".8" strokeLinecap="round" />
        {variant % 2 === 0 && spark(50, 8, 2.4, '#fff')}
      </>
    case 'wings':
      return <>
        <Mirrored>
          {[0, 1, 2, 3].map(index => <path key={index} d={`M46 22C${39 - index * 5} ${17 - index * 3} ${24 - index * 6} ${14 + index * 2} ${13 - index * 3} ${17 + index * 5}c${8 - index} -1 ${15 - index * 2} -5 ${21 - index * 2} -9Z`} fill={index % 2 ? accent : main} opacity={0.9 - index * 0.08} stroke={light} strokeWidth=".7" strokeLinejoin="round" />)}
          <path d="M45 22c-8-1-16 0-24 4 8 1 16 0 24-4Z" fill={light} opacity=".55" />
        </Mirrored>
        {gem(50, 19, 4.6, palette)}
      </>
    case 'crown':
      return <>
        <path d="M33 21 30 8l9 5 11-11 11 11 9-5-3 13Z" fill={main} stroke={light} strokeWidth="1.2" strokeLinejoin="round" />
        <path d="M34 19h32l-1 6c-10 3-20 3-30 0Z" fill={accent} stroke={light} strokeWidth=".8" />
        <circle cx="50" cy="17" r="3.4" fill={light} /><circle cx="50" cy="17" r="1.3" fill="#fff" />
        <circle cx="38" cy="16" r="2" fill={light} /><circle cx="62" cy="16" r="2" fill={light} />
        {spark(50, 2, 2.4, '#fff')}
      </>
    case 'flowers':
      return <>
        {flower(30, 16, 7.4, palette, -14)}
        {flower(50, 9, 9, palette, 8 + variant * 4)}
        {flower(70, 16, 7, palette, 18)}
        <path d="M29 22c7 2 13 1 18-4 5 5 13 6 21 3" fill="none" stroke={light} strokeWidth="1.2" opacity=".65" strokeLinecap="round" />
        <ellipse cx="38" cy="21" rx="3.6" ry="1.5" fill={light} opacity=".75" transform="rotate(-22 38 21)" />
        <ellipse cx="62" cy="21" rx="3.6" ry="1.5" fill={light} opacity=".75" transform="rotate(22 62 21)" />
      </>
    case 'crystals':
      return <>
        <path d="M50 0 57 12 52 23 43 23 42 10Z" fill={main} stroke={light} strokeWidth="1" strokeLinejoin="round" />
        <path d="M50 0 52 12 43 23 42 10Z" fill={light} opacity=".6" />
        <path d="M32 8 39 16 35 24 27 23Z" fill={accent} stroke={light} strokeWidth=".8" strokeLinejoin="round" />
        <path d="M68 6 73 15 68 24 60 22 63 13Z" fill={accent} stroke={light} strokeWidth=".8" strokeLinejoin="round" />
        {spark(28, 4, 2, '#fff')}{spark(73, 2, 2.4, '#fff')}
      </>
    case 'flames':
      return <>
        {[0, 1, 2].map(index => <path key={index} d={`M${39 + index * 11} 23c-8-7-5-15 0-21 1 6 4 8 3 12 4-2 5-6 5-9 6 7 6 14 1 19Z`} fill={index === 1 ? light : index ? accent : main} opacity={index === 1 ? .92 : .8} stroke={light} strokeWidth=".6" strokeLinejoin="round" />)}
        <path d="M46 23c-2-4 0-8 3-11 2 4 2 8 1 11Z" fill="#fff" opacity=".55" />
      </>
    case 'antlers':
      return <>
        <Mirrored>
          <path d="M40 24C38 15 33 10 26 6M35 15l-8-1M33 11l1-8M40 24c-1-8 1-15 6-20" fill="none" stroke={main} strokeWidth="2.6" strokeLinecap="round" />
          <path d="M40 24C38 15 33 10 26 6M35 15l-8-1M33 11l1-8" fill="none" stroke={light} strokeWidth=".9" strokeLinecap="round" opacity=".75" />
        </Mirrored>
        {spark(50, 4, 2.2, '#fff')}
      </>
    case 'fins':
      return <>
        <Mirrored>
          <path d="M44 23C35 22 25 18 17 10c11 0 21 2 29 7Z" fill={accent} stroke={light} strokeWidth=".8" strokeLinejoin="round" />
          <path d="M44 23c-6-2-12-6-16-11M37 21c-2-3-4-6-5-9" fill="none" stroke={light} strokeWidth=".8" opacity=".65" />
        </Mirrored>
        {gem(50, 18, 4.2, palette)}
      </>
    case 'stars':
      return <>
        {spark(50, 7, 8, light)}
        {spark(33, 13, 4.4, accent)}
        {spark(67, 12, 5, main)}
        {spark(42, 2, 2, '#fff')}
        {spark(59, 3, 2.4, '#fff')}
      </>
    case 'bubbles':
      return <>
        {[[38, 15, 5], [49, 7, 7], [61, 13, 4.4], [30, 8, 3], [70, 5, 2.6], [55, 19, 3.2]].map(([x, y, r], index) => <g key={index}>
          <circle cx={x} cy={y} r={r} fill={palette.tint} opacity=".25" stroke={index % 2 ? accent : light} strokeWidth="1.1" />
          <circle cx={x - r * 0.3} cy={y - r * 0.34} r={r * 0.26} fill="#fff" opacity=".7" />
        </g>)}
      </>
    case 'leaves':
      return <>
        <Mirrored>
          <path d="M27 24C22 16 22 8 28 2" fill="none" stroke={main} strokeWidth="1.6" strokeLinecap="round" />
          {[0, 1, 2, 3].map(index => <path key={index} d={`M${26 + index * 0.8} ${19 - index * 4}c-5-2-8-6-8-10 4 0 8 2 10 6Zm0 0c1-5 4-8 8-10 0 5-2 9-6 11Z`} fill={index % 2 ? accent : light} opacity=".85" />)}
        </Mirrored>
      </>
    case 'bows':
      return <>
        <path d="M50 12C40 2 28 4 28 12c0 7 11 8 22 3 11 5 22 4 22-3 0-8-12-10-22-3Z" fill={main} stroke={light} strokeWidth="1" strokeLinejoin="round" />
        <path d="M48 14 39 24l7-2 4-6Zm4 0 9 10-7-2-4-6Z" fill={accent} stroke={light} strokeWidth=".6" strokeLinejoin="round" />
        <circle cx="50" cy="13" r="3.6" fill={light} /><circle cx="50" cy="13" r="1.2" fill="#fff" />
      </>
    case 'bolts':
      return <>
        <Mirrored>
          <path d="M37 2 28 14h7l-4 10 13-14h-7Z" fill={light} stroke="#fff" strokeWidth=".4" strokeLinejoin="round" />
        </Mirrored>
        {spark(50, 15, 3, accent)}
        {spark(50, 5, 1.8, '#fff')}
      </>
    case 'shards':
      return <>
        <path d="M44 23 40 8l7-7 5 9Z" fill={main} stroke={light} strokeWidth=".8" />
        <path d="M56 23 60 5l8 6-4 11Z" fill={accent} stroke={light} strokeWidth=".8" />
        <path d="M31 23 24 13l8-5 3 11Z" fill={accent} stroke={light} strokeWidth=".7" />
        <path d="M69 23 77 15l-4-6-5 10Z" fill={main} stroke={light} strokeWidth=".7" />
        {spark(50, 2, 1.8, '#fff')}
      </>
    case 'orbits':
      return <>
        <ellipse cx="50" cy="12" rx="23" ry="7" fill="none" stroke={light} strokeWidth="1" opacity=".7" transform="rotate(-8 50 12)" />
        <ellipse cx="50" cy="12" rx="17" ry="12" fill="none" stroke={accent} strokeWidth=".8" opacity=".55" transform="rotate(28 50 12)" />
        <circle cx="29" cy="10" r="2.6" fill={light} /><circle cx="67" cy="16" r="2" fill={accent} />
        {spark(50, 6, 2.4, '#fff')}
      </>
    case 'sun':
      return <>
        <g transform="translate(50 18)">
          {Array.from({ length: 9 }, (_, index) => <path key={index} d="M-1.2-9h2.4L0-16Z" fill={index % 2 ? accent : light} opacity=".85" transform={`rotate(${index * 40 - 160})`} />)}
          <circle r="9" fill={main} />
          <circle r="6" fill={light} opacity=".75" />
          <circle cx="-2" cy="-2" r="2" fill="#fff" opacity=".6" />
        </g>
      </>
    case 'moon':
      return <>
        <path d="M56 1a12 12 0 1 0 8 18A10 10 0 0 1 56 1Z" fill={light} />
        <path d="M56 1a12 12 0 0 1 8 18A13 13 0 0 0 56 1Z" fill={main} opacity=".4" />
        {spark(33, 7, 2.4, accent)}
        {spark(70, 4, 2, '#fff')}
        {spark(67, 18, 1.4, accent)}
      </>
    case 'mask':
      return <>
        <path d="M36 3 31 0c0 4 2 6 5 7M64 3 69 0c0 4-2 6-5 7" fill={accent} />
        <path d="M50 2c9 0 14 5 14 12 0 8-7 13-14 13s-14-5-14-13c0-7 5-12 14-12Z" fill={light} stroke={main} strokeWidth="1" />
        <path d="M42 13c2-2 5-2 7 0-2 2-5 2-7 0Zm9 0c2-2 5-2 7 0-2 2-5 2-7 0Z" fill={palette.shadow} />
        <path d="m48 18 2 2 2-2-2 4Z" fill={accent} />
        <path d="M44 23c4 2 8 2 12 0" fill="none" stroke={palette.shadow} strokeWidth="1" strokeLinecap="round" />
      </>
    case 'sword':
      return <>
        <path d="M50 0 55 8 53 20 47 20 45 8Z" fill={light} stroke={main} strokeWidth=".7" strokeLinejoin="round" />
        <path d="M50 0v20" stroke="#fff" strokeWidth=".8" opacity=".7" />
        <path d="M40 20h20v3H40Z" fill={accent} />
        <path d="M47 23h6v6h-6Z" fill={main} />
        <circle cx="50" cy="31" r="2.2" fill={light} />
        <path d="M30 9C38 7 43 3 48 1M70 9C62 7 57 3 52 1" fill="none" stroke={accent} strokeWidth="1" opacity=".55" />
      </>
    case 'eye':
      return <>
        <path d="M31 12c5-7 12-10 19-10s14 3 19 10c-5 7-12 10-19 10s-14-3-19-10Z" fill={light} stroke={main} strokeWidth=".8" />
        <circle cx="50" cy="12" r="5.2" fill={accent} /><circle cx="50" cy="12" r="2.4" fill={palette.shadow} /><circle cx="48.6" cy="10.6" r=".9" fill="#fff" />
        <path d="M35 19c10 4 20 4 30 0" fill="none" stroke={accent} strokeWidth="1" opacity=".7" strokeLinecap="round" />
      </>
    case 'gears':
      return <>
        {[[36, 12, 7, 8], [64, 10, 5.4, 7]].map(([x, y, r, teeth], index) => <g key={index} transform={`translate(${x} ${y})`}>
          {Array.from({ length: teeth }, (_, tooth) => <rect key={tooth} x="-1.4" y={-r - 2.6} width="2.8" height="4" rx=".7" fill={index ? accent : light} transform={`rotate(${(360 / teeth) * tooth})`} />)}
          <circle r={r} fill={index ? accent : main} />
          <circle r={r * .52} fill={palette.shadow} />
          <circle r={r * .25} fill={light} />
        </g>)}
        {spark(50, 4, 2, '#fff')}
      </>
    case 'runes':
      return <>
        {[0, 1, 2, 3, 4].map(index => {
          const x = 28 + index * 11
          const y = index === 2 ? 3 : 8 + Math.abs(index - 2) * 3
          return <g key={index} transform={`translate(${x} ${y}) rotate(${(index - 2) * 8})`}>
            <rect x="-3.2" y="-3.2" width="6.4" height="6.4" rx="1" fill="none" stroke={index % 2 ? accent : light} strokeWidth="1" opacity=".9" transform="rotate(45)" />
            <path d="M-2 0h4M0-2v4" stroke={index % 2 ? light : accent} strokeWidth=".8" opacity=".8" />
          </g>
        })}
        <path d="M28 18c8 3 15 3 22 0 7 3 14 3 22 0" fill="none" stroke={light} strokeWidth="1" opacity=".6" strokeLinecap="round" />
      </>
    case 'gems':
      return <>
        {gem(50, 11, 9.4, palette, 0)}
        {gem(33, 17, 4.6, palette, -12)}
        {gem(67, 16, 5.2, palette, 12)}
        {spark(50, 1, 2.2, '#fff')}
      </>
    case 'feathers':
      return <>
        {[0, 1, 2].map(index => <g key={index} transform={`translate(${50 + (index - 1) * 12} 4) rotate(${(index - 1) * 24})`}>
          <path d="M0 0C-7 7-6 15 0 21 6 15 7 7 0 0Z" fill={index === 1 ? light : index ? accent : main} opacity=".92" />
          <path d="M0 2v17" stroke={index === 1 ? main : '#fff'} strokeWidth=".8" opacity=".6" />
          {[0, 1, 2].map(bar => <path key={bar} d={`M0 ${7 + bar * 4}c-2-1-3-2-4-4M0 ${7 + bar * 4}c2-1 3-2 4-4`} fill="none" stroke={index === 1 ? main : '#fff'} strokeWidth=".55" opacity=".55" />)}
        </g>)}
      </>
    case 'butterflies':
      return <>
        {[[36, 12, -12], [65, 8, 14]].map(([x, y, rotation], index) => <g key={index} transform={`translate(${x} ${y}) rotate(${rotation})`}>
          <path d="M0 0C-9-8-15-3-12 4-5 5-2 3 0 0Zm0 0C9-8 15-3 12 4 5 5 2 3 0 0Z" fill={index ? accent : light} opacity=".9" />
          <path d="M0 0C-6 4-7 9-3 11 1 8 1 4 0 0Zm0 0C6 4 7 9 3 11-1 8-1 4 0 0Z" fill={index ? light : accent} opacity=".75" />
          <path d="M0-1v8M0-1l-3-3M0-1l3-3" stroke="#fff" strokeWidth=".6" opacity=".7" />
        </g>)}
        {spark(50, 2, 1.8, '#fff')}
      </>
    case 'lantern':
      return <>
        <path d="M50 0v4M44 4h12" stroke={light} strokeWidth="1.1" strokeLinecap="round" />
        <path d="M39 6c7-2 15-2 22 0 4 6 5 14 0 19-7 3-15 3-22 0-5-5-4-13 0-19Z" fill={main} stroke={light} strokeWidth=".8" />
        <path d="M42 8c5-1 11-1 16 0 2 5 2 10 0 14-5 2-11 2-16 0-2-4-2-9 0-14Z" fill={light} opacity=".55" />
        <circle cx="50" cy="15" r="3.2" fill="#fff" opacity=".9" />
        <path d="M46 25h8l-1 3h-6Z" fill={accent} />
        {spark(30, 10, 1.6, accent)}{spark(70, 12, 1.4, light)}
      </>
    case 'compass':
      return <>
        <g transform="translate(50 12)">
          <circle r="10" fill="none" stroke={light} strokeWidth="1.1" />
          <path d="M0-13 3-3 13 0 3 3 0 13-3 3-13 0-3-3Z" fill={main} stroke={light} strokeWidth=".6" strokeLinejoin="round" />
          <path d="M0-13 0 13M-13 0h26" stroke={accent} strokeWidth=".6" opacity=".7" />
          <circle r="2.4" fill="#fff" />
        </g>
        <path d="M50 24v-1" stroke={light} strokeWidth="1" />
      </>
    case 'heart':
      return <>
        <path d="M50 22S37 14 37 8c0-5 6-8 10-4l3 3 3-3c4-4 10-1 10 4 0 6-13 14-13 14Z" fill={main} stroke={light} strokeWidth=".9" />
        <path d="M44 7c1-2 4-2 5 0" fill="none" stroke="#fff" strokeWidth="1" opacity=".7" strokeLinecap="round" />
        {spark(31, 9, 1.8, accent)}{spark(69, 6, 2.2, light)}
      </>
    case 'seal':
      return <>
        <circle cx="50" cy="12" r="10" fill="none" stroke={main} strokeWidth="1.4" />
        <circle cx="50" cy="12" r="7" fill={palette.tint} opacity=".5" stroke={light} strokeWidth=".7" strokeDasharray="1.5 1.8" />
        <path d="M50 5 53 11 50 19 47 11Z" fill={light} />
        <circle cx="50" cy="12" r="1.6" fill="#fff" />
        {Array.from({ length: 6 }, (_, index) => spark(50 + Math.cos((index / 6) * Math.PI * 2) * 13, 12 + Math.sin((index / 6) * Math.PI * 2) * 13, 1, accent, .8))}
      </>
    case 'clover':
      return <>
        {[0, 1, 2, 3].map(index => <path key={index} d="M50 12C48 5 41 3 38 7c-3 4 1 10 8 11-7 1-11 7-8 11 3 4 10 2 12-5 2 7 9 9 12 5 3-4-1-10-8-11 7-1 11-7 8-11-3-4-10-2-12 5Z" fill={index === 0 ? light : index % 2 ? accent : main} opacity=".86" transform={`rotate(${index * 90} 50 12)`} />)}
        <circle cx="50" cy="12" r="2" fill={palette.shadow} />
        <path d="M50 14c2 4 1 8-2 11" fill="none" stroke={main} strokeWidth="1.3" strokeLinecap="round" />
      </>
    case 'cross':
      return <>
        <path d="M46 2h8v7h7v8h-7v8h-8v-8h-7v-8h7Z" fill={main} stroke={light} strokeWidth=".8" strokeLinejoin="round" />
        <circle cx="50" cy="13" r="3.2" fill={accent} /><circle cx="50" cy="13" r="1.2" fill="#fff" />
        <path d="M38 25h24" stroke={light} strokeWidth="1.2" strokeLinecap="round" opacity=".7" />
      </>
    case 'fish':
      return <>
        <Mirrored>
          <path d="M33 20C23 18 18 12 16 4c8 1 14 5 18 11 2-7 7-11 13-12-2 7-6 12-12 15Z" fill={main} stroke={light} strokeWidth=".7" />
          <path d="M33 18c-5-2-9-6-11-11" fill="none" stroke={light} strokeWidth=".8" opacity=".7" />
          <circle cx="31" cy="12" r="1.2" fill="#fff" />
        </Mirrored>
        {spark(50, 5, 2, accent)}
      </>
    case 'paw':
      return <>
        <ellipse cx="50" cy="17" rx="7.4" ry="6.2" fill={main} stroke={light} strokeWidth=".7" />
        <ellipse cx="38" cy="9" rx="3.2" ry="4" fill={accent} opacity=".9" transform="rotate(-18 38 9)" />
        <ellipse cx="46" cy="5" rx="3" ry="4" fill={light} opacity=".85" transform="rotate(-8 46 5)" />
        <ellipse cx="54" cy="5" rx="3" ry="4" fill={light} opacity=".85" transform="rotate(8 54 5)" />
        <ellipse cx="62" cy="9" rx="3.2" ry="4" fill={accent} opacity=".9" transform="rotate(18 62 9)" />
        <path d="M43 20c4 2 10 2 14 0" fill="none" stroke={light} strokeWidth="1" opacity=".7" strokeLinecap="round" />
      </>
    case 'none':
      return <>
        {spark(50, 7, 4, light)}
        {spark(31, 14, 2.2, accent)}
        {spark(69, 12, 2.6, light)}
      </>
    default:
      return spark(50, 10, 4, light)
  }
}

export default function BorderCrest({ crest, palette, seed }: BorderCrestProps) {
  return <g className="bf-crest" data-crest={crest}>
    {crestArt(crest, palette, seed)}
  </g>
}
