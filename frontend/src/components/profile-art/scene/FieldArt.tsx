import type { ReactNode } from 'react'
import type { FieldKey } from '../../../effects/effectRecipes'
import type { CosmeticPalette } from '../../../effects/artColor'
import { alphaColor } from '../../../effects/artColor'

interface FieldArtProps {
  field: FieldKey
  palette: CosmeticPalette
  seed: number
  uid: string
}

function random(seed: number) {
  let state = seed >>> 0
  return () => {
    state = (state * 1664525 + 1013904223) >>> 0
    return state / 4294967296
  }
}

function spark(x: number, y: number, size: number, fill: string, opacity = 0.8) {
  return <path key={`${x}-${y}`} d={`M${x} ${y - size}L${x + size * 0.26} ${y - size * 0.26}L${x + size} ${y}L${x + size * 0.26} ${y + size * 0.26}L${x} ${y + size}L${x - size * 0.26} ${y + size * 0.26}L${x - size} ${y}L${x - size * 0.26} ${y - size * 0.26}Z`} fill={fill} opacity={opacity} />
}

function stars(count: number, seed: number, palette: CosmeticPalette, spread = 1) {
  const rand = random(seed)
  return Array.from({ length: count }, (_, index) => spark(
    16 + rand() * 368 * spread,
    12 + rand() * 232,
    0.8 + rand() * 2.2,
    index % 3 === 0 ? palette.highlight : index % 2 ? palette.primary : palette.secondary,
    0.28 + rand() * 0.5,
  ))
}

function cloud(x: number, y: number, scale: number, fill: string, opacity: number) {
  return <g key={`${x}-${y}`} transform={`translate(${x} ${y}) scale(${scale})`} fill={fill} opacity={opacity}>
    <ellipse cx="0" cy="0" rx="38" ry="16" />
    <ellipse cx="24" cy="-8" rx="25" ry="17" />
    <ellipse cx="-25" cy="-4" rx="21" ry="13" />
    <ellipse cx="6" cy="-15" rx="17" ry="13" />
  </g>
}

function leaf(x: number, y: number, rotation: number, scale: number, fill: string) {
  return <path key={`${x}-${y}-${rotation}`} transform={`translate(${x} ${y}) rotate(${rotation}) scale(${scale})`} d="M0 0C13-9 27-7 34 0 25 7 11 9 0 0Z" fill={fill} />
}

function fieldContent(field: FieldKey, palette: CosmeticPalette, seed: number, uid: string): ReactNode {
  const halo = `url(#${uid}-halo)`
  const ember = `url(#${uid}-ember)`
  const band = `url(#${uid}-band)`
  const rand = random(seed + 17)
  const variant = seed % 7

  switch (field) {
    case 'night':
      return <>
        <circle cx={295 - variant * 12} cy={42 + variant * 5} r="150" fill={halo} opacity=".32" />
        <circle cx={295 - variant * 12} cy={42 + variant * 5} r="22" fill={palette.highlight} opacity=".18" />
        <path d="M-20 210C52 170 108 182 156 202c44 19 92 14 142-12 44-23 84-18 122 8v82H-20Z" fill={alphaColor(palette.deep, 0.5)} />
        <path d="M-20 232c64-34 118-26 168-2 42 20 88 16 132-8 38-21 78-18 120 4v54H-20Z" fill={alphaColor(palette.secondary, 0.22)} />
        {stars(16, seed + 3, palette)}
      </>
    case 'aurora':
      return <>
        <path d="M-30 98C62 22 122 130 214 52c68-57 142-28 216 22" fill="none" stroke={band} strokeWidth="26" strokeLinecap="round" opacity=".3" />
        <path d="M-30 130C58 54 128 158 214 78c64-59 140-26 216 24" fill="none" stroke={alphaColor(palette.highlight, 0.5)} strokeWidth="12" strokeLinecap="round" opacity=".35" />
        <path d="M-30 164C62 88 130 184 218 112c66-55 140-20 214 26" fill="none" stroke={band} strokeWidth="18" strokeLinecap="round" opacity=".22" />
        <ellipse cx="200" cy="210" rx="250" ry="80" fill={alphaColor(palette.deep, 0.44)} />
        {stars(14, seed + 11, palette)}
      </>
    case 'sunset':
      return <>
        <circle cx="200" cy="118" r="160" fill={halo} opacity=".46" />
        <circle cx="200" cy="120" r="52" fill={palette.highlight} opacity=".22" />
        <rect y="112" width="400" height="7" fill={palette.highlight} opacity=".16" />
        <rect y="132" width="400" height="3" fill={palette.primary} opacity=".2" />
        <rect y="148" width="400" height="2" fill={palette.secondary} opacity=".18" />
        <path d="M-10 214 86 158l66 30 54-24 64 38 64-20 76 38v44H-10Z" fill={alphaColor(palette.deep, 0.58)} />
        <path d="M-10 238c88-28 160-22 224 2 58 22 122 14 196-12v38H-10Z" fill={alphaColor(palette.primary, 0.26)} />
        {stars(7, seed + 5, palette)}
      </>
    case 'ocean':
      return <>
        <circle cx="200" cy="16" r="130" fill={halo} opacity=".3" />
        <path d="M172 0 214 0 300 122 258 136Z" fill={alphaColor(palette.highlight, 0.1)} />
        <path d="M224 0h24l64 116-22 8Z" fill={alphaColor(palette.secondary, 0.12)} />
        <path d="M-20 176c62-32 120-30 174 2 50 30 102 28 158-6 34-20 68-20 108-2v96H-20Z" fill={alphaColor(palette.deep, 0.5)} />
        <path d="M-20 154c58-26 118-22 174 8 52 28 106 24 160-10 36-22 68-20 106 0" fill="none" stroke={palette.highlight} strokeWidth="3" opacity=".4" strokeLinecap="round" />
        <path d="M-20 188c52-22 110-18 170 10 56 26 110 20 164-12 38-22 74-18 106 0" fill="none" stroke={palette.primary} strokeWidth="8" opacity=".24" strokeLinecap="round" />
        <path d="M-20 216c48-18 102-14 158 12 54 24 108 16 158-14 36-22 72-20 104-2" fill="none" stroke={palette.secondary} strokeWidth="5" opacity=".22" strokeLinecap="round" />
        {[0, 1, 2, 3, 4, 5].map(index => <circle key={index} cx={38 + index * 63} cy={196 + (index % 3) * 18} r={2 + (index % 2)} fill={palette.highlight} opacity=".4" />)}
      </>
    case 'petal':
      return <>
        <circle cx="70" cy="60" r="140" fill={`url(#${uid}-accent)`} opacity=".32" />
        <circle cx="340" cy="190" r="150" fill={halo} opacity=".24" />
        <path d="M-20 34C78 72 142 118 208 206c24 32 44 50 68 60" fill="none" stroke={alphaColor(palette.deep, 0.5)} strokeWidth="5" strokeLinecap="round" />
        <path d="M72 72c30-28 52-58 62-92M118 102c34-8 64-8 94 2M176 154c34 6 66 4 98-8" fill="none" stroke={alphaColor(palette.deep, 0.36)} strokeWidth="2.5" strokeLinecap="round" />
        {Array.from({ length: 9 }, (_, index) => {
          const x = 16 + rand() * 368
          const y = 20 + rand() * 220
          const rotation = rand() * 360
          return <path key={index} transform={`translate(${x} ${y}) rotate(${rotation})`} d="M0-9c7 2 9 8 0 18-9-10-7-16 0-18Z" fill={index % 3 === 0 ? palette.highlight : index % 2 ? palette.primary : palette.secondary} opacity={0.2 + rand() * 0.24} />
        })}
        {[80, 118, 162, 205].map((y, index) => <ellipse key={y} cx={48 + index * 78} cy={y} rx="5" ry="2.6" fill={palette.primary} opacity=".3" transform={`rotate(${index * 42} ${48 + index * 78} ${y})`} />)}
      </>
    case 'storm':
      return <>
        <circle cx="210" cy="40" r="150" fill={alphaColor(palette.deep, 0.54)} />
        {cloud(112, 52, 1.5, palette.deep, 0.55)}
        {cloud(292, 34, 1.2, palette.secondary, 0.22)}
        {Array.from({ length: 13 }, (_, index) => {
          const x = 6 + rand() * 390
          return <path key={index} d={`M${x} ${44 + rand() * 50}l-10 ${54 + rand() * 60}`} stroke={index % 3 === 0 ? palette.highlight : palette.primary} strokeWidth={1 + rand() * 1.3} opacity={0.12 + rand() * 0.2} strokeLinecap="round" />
        })}
        <path d="M262 52 236 104h24l-16 48 48-62h-26l18-38Z" fill={palette.highlight} opacity=".34" />
        <path d="M-10 226c52-26 98-24 142 4 38 24 82 24 128-2 34-19 70-20 150 2v30H-10Z" fill={alphaColor(palette.deep, 0.55)} />
      </>
    case 'frost':
      return <>
        <circle cx="86" cy="38" r="130" fill={`url(#${uid}-accent)`} opacity=".34" />
        <polygon points="298,-20 366,38 338,112 278,92 272,24" fill={alphaColor(palette.primary, 0.16)} />
        <polygon points="298,-20 330,30 302,84 278,24" fill={alphaColor(palette.highlight, 0.18)} />
        <polygon points="-16,198 44,158 88,202 54,254 -18,244" fill={alphaColor(palette.secondary, 0.16)} />
        <polygon points="-16,198 36,190 54,236 -18,244" fill={alphaColor(palette.highlight, 0.12)} />
        {Array.from({ length: 12 }, (_, index) => spark(14 + rand() * 372, 16 + rand() * 228, 0.8 + rand() * 1.8, index % 2 ? palette.highlight : palette.primary, 0.24 + rand() * 0.4))}
      </>
    case 'ember':
      return <>
        <circle cx="200" cy="250" r="170" fill={ember} opacity=".44" />
        <path d="M-10 232c38-26 66-20 86 4 20-32 52-42 84-18 24-30 52-30 76-6 26-22 58-18 84 4v44H-10Z" fill={alphaColor(palette.deep, 0.54)} />
        {[64, 146, 248, 338].map((x, index) => <path key={x} d={`M${x} 224c-16-22-4-42 8-54 2 14 10 18 8 30 8-6 12-14 12-24 10 20 8 40-4 52Z`} fill={index % 2 ? palette.primary : palette.secondary} opacity=".3" />)}
        <path d="M-10 174c54-22 98-14 132 16 26 22 62 24 106 4 38-18 70-14 104 8" fill="none" stroke={alphaColor(palette.primary, 0.28)} strokeWidth="2" strokeLinecap="round" />
        {Array.from({ length: 10 }, (_, index) => <circle key={index} cx={18 + rand() * 366} cy={118 + rand() * 118} r={1 + rand() * 2.2} fill={index % 3 === 0 ? palette.highlight : palette.primary} opacity={0.3 + rand() * 0.4} />)}
      </>
    case 'neon':
      return <>
        <rect width="400" height="260" fill={alphaColor(palette.deep, 0.35)} />
        <path d="M200 128 18 260M200 128 104 260M200 128 156 260M200 128 200 260M200 128 244 260M200 128 296 260M200 128 382 260" stroke={palette.primary} strokeWidth="1" opacity=".18" />
        {[0, 1, 2, 3, 4, 5].map(index => <path key={index} d={`M0 ${140 + index * 22}C100 ${132 + index * 22} 300 ${148 + index * 22} 400 ${138 + index * 22}`} stroke={index % 2 ? palette.secondary : palette.primary} strokeWidth="1" opacity=".14" />)}
        <path d="M-4 76h408" stroke={palette.highlight} strokeWidth="2" opacity=".4" />
        <path d="M-4 84h408" stroke={palette.primary} strokeWidth="8" opacity=".08" />
        <path d="M20 0v260M150 0v260M250 0v260M380 0v260" stroke={palette.secondary} strokeWidth="1" opacity=".08" />
        <rect x="22" y="112" width="82" height="3" fill={palette.secondary} opacity=".4" />
        <rect x="300" y="198" width="72" height="3" fill={palette.primary} opacity=".36" />
        {stars(9, seed + 21, palette)}
      </>
    case 'void':
      return <>
        <rect width="400" height="260" fill={`url(#${uid}-void)`} opacity=".8" />
        <ellipse cx="200" cy="126" rx="170" ry="72" fill="none" stroke={palette.primary} strokeWidth="1.4" opacity=".2" transform="rotate(-14 200 126)" />
        <ellipse cx="200" cy="126" rx="124" ry="104" fill="none" stroke={palette.secondary} strokeWidth="1" opacity=".16" transform="rotate(21 200 126)" />
        <ellipse cx="200" cy="126" rx="78" ry="40" fill="none" stroke={palette.highlight} strokeWidth="2" opacity=".14" transform="rotate(-33 200 126)" />
        {[0, 1, 2, 3, 4].map(index => <path key={index} d={`M${48 + index * 76} ${36 + (index % 2) * 18}l${10 + index * 2} ${3 + index}`} stroke={palette.spark} strokeWidth="1.2" opacity=".38" />)}
        {stars(15, seed + 9, palette)}
      </>
    case 'ink':
      return <>
        <circle cx="318" cy="62" r="140" fill={`url(#${uid}-accent)`} opacity=".16" />
        <path d="M-20 194c42-32 84-30 114-4 24-34 62-40 92-12 22-18 52-14 72 8 18-22 46-26 72-6 22 18 24 42 8 58H-20Z" fill={alphaColor(palette.deep, 0.62)} />
        <path d="M64 28c46-18 86-2 94 26 8 28-16 50-50 44-30-6-46-36-44-70Z" fill={alphaColor(palette.primary, 0.18)} />
        <path d="M170 26c30-14 58-8 70 12 12 20 0 42-24 46-26 4-44-14-46-58Z" fill={alphaColor(palette.secondary, 0.16)} />
        <path d="M-10 98c62-18 102-8 128 22 18 22 42 28 74 18 34-10 62-6 92 12" fill="none" stroke={alphaColor(palette.primary, 0.36)} strokeWidth="3" strokeLinecap="round" />
        <path d="M-10 122c56-12 96-2 122 26 20 22 46 28 78 18" fill="none" stroke={alphaColor(palette.highlight, 0.22)} strokeWidth="1.4" strokeLinecap="round" />
        {Array.from({ length: 12 }, (_, index) => <circle key={index} cx={18 + rand() * 360} cy={16 + rand() * 216} r={0.8 + rand() * 2.4} fill={index % 2 ? palette.primary : palette.secondary} opacity={0.2 + rand() * 0.4} />)}
      </>
    case 'bloom':
      return <>
        <circle cx="322" cy="44" r="166" fill={halo} opacity=".34" />
        <circle cx="78" cy="218" r="130" fill={`url(#${uid}-accent)`} opacity=".24" />
        <path d="M-14 210C52 170 88 118 104 48c10-44 30-60 62-72" fill="none" stroke={alphaColor(palette.deep, 0.44)} strokeWidth="5" strokeLinecap="round" />
        <path d="M34 214C94 176 126 130 142 64c8-34 24-52 52-64" fill="none" stroke={alphaColor(palette.deep, 0.3)} strokeWidth="2.4" strokeLinecap="round" />
        {leaf(58, 176, -46, 0.72, alphaColor(palette.primary, 0.3))}
        {leaf(82, 152, -56, 0.52, alphaColor(palette.secondary, 0.3))}
        {leaf(102, 96, -64, 0.42, alphaColor(palette.primary, 0.26))}
        {Array.from({ length: 8 }, (_, index) => {
          const x = 40 + rand() * 336
          const y = 24 + rand() * 208
          return <g key={index} transform={`translate(${x} ${y}) rotate(${rand() * 360})`}>{[0, 1, 2, 3, 4].map(petalIndex => <ellipse key={petalIndex} cx="0" cy="-5" rx="3.4" ry="7" fill={petalIndex % 2 ? palette.primary : palette.highlight} opacity=".24" transform={`rotate(${petalIndex * 72})`} />)}</g>
        })}
      </>
    case 'confetti':
      return <>
        <circle cx="200" cy="130" r="160" fill={halo} opacity=".18" />
        {Array.from({ length: 24 }, (_, index) => {
          const x = 10 + rand() * 380
          const y = 10 + rand() * 240
          const size = 3 + rand() * 6
          const colors = [palette.primary, palette.secondary, palette.highlight, palette.spark]
          return <rect key={index} x={x} y={y} width={size} height={size * 0.45} rx="1" fill={colors[index % 4]} opacity={0.24 + rand() * 0.38} transform={`rotate(${rand() * 360} ${x} ${y})`} />
        })}
        {[0, 1, 2, 3, 4].map(index => <path key={index} d={`M200 130 ${60 + index * 70} ${16 + (index % 2) * 30}`} stroke={index % 2 ? palette.primary : palette.highlight} strokeWidth="1.4" opacity=".2" />)}
      </>
    case 'prism':
      return <>
        <polygon points="0,0 196,0 122,260 0,260" fill={alphaColor(palette.primary, 0.16)} />
        {['#fb7185', '#fbbf24', '#34d399', '#38bdf8', '#a78bfa'].map((color, index) => <polygon key={color} points={`${120 + index * 14},0 ${152 + index * 14},0 ${250 + index * 26},260 ${218 + index * 26},260`} fill={color} opacity=".1" />)}
        <polygon points="300,-10 400,32 384,128 290,86" fill={alphaColor(palette.secondary, 0.2)} />
        <polygon points="300,-10 346,16 320,76 290,20" fill={alphaColor(palette.highlight, 0.22)} />
        <path d="M-10 226 400 64" stroke={palette.highlight} strokeWidth="1.2" opacity=".2" />
        {stars(8, seed + 31, palette)}
      </>
    case 'cosmic':
      return <>
        <circle cx="96" cy="60" r="160" fill={halo} opacity=".32" />
        <circle cx="304" cy="182" r="178" fill={`url(#${uid}-accent)`} opacity=".3" />
        <ellipse cx="202" cy="126" rx="184" ry="66" fill="none" stroke={palette.highlight} strokeWidth="1.2" opacity=".18" transform="rotate(-17 202 126)" />
        <ellipse cx="202" cy="126" rx="132" ry="96" fill="none" stroke={palette.primary} strokeWidth="1" opacity=".14" transform="rotate(23 202 126)" />
        <path d="M-20 40C70 10 142 22 202 62c60 40 116 38 218 4" fill="none" stroke={palette.secondary} strokeWidth="18" opacity=".1" strokeLinecap="round" />
        <path d="M322 22 356 36l-16 12 16 12-34 12" fill="none" stroke={palette.highlight} strokeWidth="2" opacity=".38" strokeLinecap="round" />
        {stars(28, seed + 13, palette)}
      </>
    case 'mist':
      return <>
        <circle cx="120" cy="90" r="160" fill={halo} opacity=".2" />
        <ellipse cx="100" cy="92" rx="180" ry="32" fill={palette.highlight} opacity=".08" />
        <ellipse cx="310" cy="126" rx="190" ry="38" fill={palette.primary} opacity=".08" />
        <ellipse cx="180" cy="170" rx="210" ry="30" fill={palette.secondary} opacity=".08" />
        <path d="M-20 220 58 150l50 34 44-62 58 70 52-32 78 72v48H-20Z" fill={alphaColor(palette.deep, 0.42)} />
        <path d="M-20 232c66-32 116-26 158 4 38 28 88 24 142-10 38-24 74-20 120 6v28H-20Z" fill={alphaColor(palette.secondary, 0.14)} />
      </>
    case 'sand':
      return <>
        <circle cx="128" cy="70" r="150" fill={halo} opacity=".4" />
        <circle cx="128" cy="72" r="34" fill={palette.highlight} opacity=".2" />
        <path d="M-20 172c70-42 138-40 204 4 64 44 128 38 236-12v96H-20Z" fill={alphaColor(palette.primary, 0.18)} />
        <path d="M-20 204c76-34 140-26 194 10 58 38 122 26 226-20v66H-20Z" fill={alphaColor(palette.deep, 0.5)} />
        <path d="M-20 160c62-28 120-24 174 10 56 36 118 30 246-16" fill="none" stroke={palette.highlight} strokeWidth="2" opacity=".26" strokeLinecap="round" />
        <path d="M-20 190c58-22 112-16 162 14 52 32 116 22 238-26" fill="none" stroke={palette.secondary} strokeWidth="1.2" opacity=".22" strokeLinecap="round" />
        {Array.from({ length: 16 }, (_, index) => <circle key={index} cx={12 + rand() * 378} cy={132 + rand() * 112} r={0.6 + rand() * 1.3} fill={palette.highlight} opacity=".26" />)}
      </>
    case 'sacred':
      return <>
        <circle cx="200" cy="126" r="170" fill={halo} opacity=".26" />
        <circle cx="200" cy="126" r="104" fill="none" stroke={palette.highlight} strokeWidth="1" opacity=".18" />
        <circle cx="200" cy="126" r="138" fill="none" stroke={palette.primary} strokeWidth="1.4" opacity=".14" strokeDasharray="2 8" />
        <path d="M200 126 154-14h92Z" fill={alphaColor(palette.highlight, 0.08)} />
        {Array.from({ length: 12 }, (_, index) => <path key={index} d="M200 -10v26" stroke={index % 2 ? palette.highlight : palette.primary} strokeWidth="1.6" opacity=".2" transform={`rotate(${index * 30} 200 126)`} />)}
        {Array.from({ length: 7 }, (_, index) => {
          const angle = (index / 7) * Math.PI * 2
          return <rect key={index} x={200 + Math.cos(angle) * 150 - 3} y={126 + Math.sin(angle) * 112 - 3} width="6" height="6" fill={palette.secondary} opacity=".3" transform={`rotate(45 ${200 + Math.cos(angle) * 150} ${126 + Math.sin(angle) * 112})`} />
        })}
        <path d="M-20 238c70-30 142-26 220 2 72 26 142 20 220-8v28H-20Z" fill={alphaColor(palette.deep, 0.42)} />
      </>
    case 'circuit':
      return <>
        <rect width="400" height="260" fill={alphaColor(palette.deep, 0.32)} />
        {Array.from({ length: 13 }, (_, index) => <path key={`v${index}`} d={`M${index * 33} 0v260`} stroke={palette.primary} strokeWidth="1" opacity=".08" />)}
        {Array.from({ length: 9 }, (_, index) => <path key={`h${index}`} d={`M0 ${index * 33}v0h400`} stroke={palette.secondary} strokeWidth="1" opacity=".08" />)}
        <path d="M-10 58h92v34h74V50h96v42h74v-30h84" fill="none" stroke={palette.primary} strokeWidth="2" opacity=".3" />
        <path d="M-10 210h62v-38h84v52h84v-36h92v44h88" fill="none" stroke={palette.secondary} strokeWidth="1.6" opacity=".26" />
        <path d="M326 0v42h-54v48" fill="none" stroke={palette.highlight} strokeWidth="1.4" opacity=".24" />
        {[[82, 58], [156, 92], [252, 50], [326, 92], [52, 172], [146, 224], [230, 224], [322, 218]].map(([x, y], index) => <g key={index}><circle cx={x} cy={y} r="4" fill={palette.deep} stroke={index % 2 ? palette.highlight : palette.primary} strokeWidth="1.6" /><circle cx={x} cy={y} r="1.5" fill={palette.highlight} /></g>)}
        <rect x="184" y="138" width="36" height="36" rx="5" fill={palette.deep} stroke={palette.primary} strokeWidth="1.6" opacity=".7" />
        <rect x="192" y="146" width="20" height="20" rx="2" fill={palette.highlight} opacity=".4" />
      </>
    case 'glass':
      return <>
        <circle cx="298" cy="52" r="150" fill={halo} opacity=".22" />
        <polygon points="0,0 132,0 36,260 0,260" fill={alphaColor(palette.primary, 0.14)} />
        <polygon points="132,0 202,0 92,260 36,260" fill={alphaColor(palette.highlight, 0.08)} />
        <polygon points="326,0 400,0 400,120 300,260 244,260" fill={alphaColor(palette.secondary, 0.12)} />
        <polygon points="400,120 400,260 300,260 366,138" fill={alphaColor(palette.highlight, 0.06)} />
        <path d="M-10 226 410 22" stroke={palette.highlight} strokeWidth="2" opacity=".2" />
        <path d="M-10 246 410 42" stroke={palette.primary} strokeWidth="7" opacity=".06" />
        <path d="M-10 166 410 -38" stroke={palette.secondary} strokeWidth="1.2" opacity=".14" />
        <polygon points="104,176 142,150 172,196 130,222" fill={alphaColor(palette.highlight, 0.1)} stroke={alphaColor(palette.primary, 0.24)} strokeWidth="1" />
      </>
    case 'paper':
      return <>
        <rect width="400" height="260" fill={alphaColor(palette.highlight, 0.045)} />
        {Array.from({ length: 12 }, (_, index) => <path key={index} d={`M-10 ${18 + index * 22}c90-6 160-6 240 0s120 6 180 0`} stroke={index % 4 === 0 ? palette.primary : alphaColor(palette.deep, 0.22)} strokeWidth={index % 4 === 0 ? 1.4 : 1} opacity=".22" />)}
        <path d="M0 0 60 0 0 60Z" fill={alphaColor(palette.secondary, 0.14)} />
        <path d="M400 260 340 260 400 200Z" fill={alphaColor(palette.primary, 0.12)} />
        <path d="M0 0 60 0 0 60" fill="none" stroke={alphaColor(palette.highlight, 0.2)} strokeWidth="1.4" />
        <path d="M400 260 340 260 400 200" fill="none" stroke={alphaColor(palette.highlight, 0.16)} strokeWidth="1.4" />
        {Array.from({ length: 10 }, (_, index) => <circle key={index} cx={16 + rand() * 368} cy={16 + rand() * 228} r={0.7 + rand() * 1.1} fill={palette.primary} opacity=".22" />)}
      </>
    default:
      return stars(14, seed, palette)
  }
}

export default function FieldArt({ field, palette, seed, uid }: FieldArtProps) {
  return <>
    <defs>
      <radialGradient id={`${uid}-halo`} cx=".5" cy=".5" r=".5">
        <stop stopColor={palette.highlight} stopOpacity=".9" />
        <stop offset=".32" stopColor={palette.primary} stopOpacity=".5" />
        <stop offset="1" stopColor={palette.primary} stopOpacity="0" />
      </radialGradient>
      <radialGradient id={`${uid}-accent`} cx=".5" cy=".5" r=".5">
        <stop stopColor={palette.secondary} stopOpacity=".8" />
        <stop offset="1" stopColor={palette.secondary} stopOpacity="0" />
      </radialGradient>
      <radialGradient id={`${uid}-ember`} cx=".5" cy=".5" r=".5">
        <stop stopColor={palette.highlight} stopOpacity=".9" />
        <stop offset=".4" stopColor={palette.primary} stopOpacity=".48" />
        <stop offset="1" stopColor={palette.primary} stopOpacity="0" />
      </radialGradient>
      <linearGradient id={`${uid}-band`} x1="0" y1="0" x2="1" y2=".4">
        <stop stopColor={palette.primary} stopOpacity="0" />
        <stop offset=".28" stopColor={palette.primary} stopOpacity=".9" />
        <stop offset=".6" stopColor={palette.highlight} stopOpacity=".85" />
        <stop offset="1" stopColor={palette.secondary} stopOpacity="0" />
      </linearGradient>
      <radialGradient id={`${uid}-void`} cx=".5" cy=".5" r=".72">
        <stop offset=".28" stopColor={palette.deep} stopOpacity=".06" />
        <stop offset=".74" stopColor={palette.deep} stopOpacity=".5" />
        <stop offset="1" stopColor={palette.deep} stopOpacity=".9" />
      </radialGradient>
    </defs>
    {fieldContent(field, palette, seed, uid)}
  </>
}
