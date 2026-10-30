import collections from '../data/cosmetics.json'
import type { CSSProperties } from 'react'
import { CURSORS } from '../types'

// Every caret has its own silhouette, finish or cut. IDs stay stable for owned items.
const finishes: Record<string, [string, string, number]> = {
  default: ['#fda4af', 'round', 3], ocean: ['#164e63', 'wave', 4], forest: ['#14532d', 'leaf', 5],
  crimson: ['#fda4af', 'blade', 3], mint: ['#d1fae5', 'split', 4], sky: ['#e0f2fe', 'round', 2],
  steel: ['#e2e8f0', 'square', 3], coral: ['#fed7aa', 'taper', 5], sunset: ['#be123c', 'taper', 4],
  lavender: ['#ede9fe', 'bead', 4], peach: ['#fce7f3', 'leaf', 4], sapphire: ['#93c5fd', 'blade', 5],
  rose: ['#fff1f2', 'gem', 5], lime: ['#ecfccb', 'split', 3], violet: ['#ddd6fe', 'wave', 5],
  galaxy: ['#38bdf8', 'bead', 5], aurora: ['#a78bfa', 'wave', 4], amber: ['#b45309', 'gem', 5],
  emerald: ['#6ee7b7', 'gem', 4], ruby: ['#fda4af', 'gem', 6], cyber: ['#d9f99d', 'circuit', 4],
  retro: ['#67e8f9', 'pixel', 5], amethyst: ['#e9d5ff', 'crystal', 6], diamond: ['#67e8f9', 'crystal', 4],
  obsidian: ['#c4b5fd', 'blade', 5], blood_moon: ['#fb7185', 'bead', 6], toxic: ['#bef264', 'circuit', 5],
  golden: ['#fff7cc', 'split', 6], plasma: ['#f0abfc', 'wave', 6], inferno: ['#fde047', 'flame', 6],
  glacier: ['#ffffff', 'crystal', 5], hologram: ['#f0abfc', 'scan', 5], nebula: ['#fb7185', 'wave', 7],
  cosmos: ['#e0e7ff', 'bead', 4], phoenix: ['#fef08a', 'flame', 7], quantum: ['#c4b5fd', 'split', 5],
  void: ['#a78bfa', 'scan', 6], celestial: ['#ffffff', 'gem', 7], rainbow: ['#ffffff', 'wave', 6],
}
for (const c of collections) finishes[c.id] = [c.accent, c.finish, 3 + c.variant % 5]

const cuts: Record<string, string> = {
  blade: 'polygon(100% 0,100% 88%,0 100%,0 12%)',
  taper: 'polygon(40% 0,100% 12%,70% 100%,0 88%)',
  gem: 'polygon(50% 0,100% 16%,100% 84%,50% 100%,0 84%,0 16%)',
  crystal: 'polygon(50% 0,100% 22%,72% 50%,100% 78%,50% 100%,0 78%,28% 50%,0 22%)',
  leaf: 'polygon(0 0,75% 8%,100% 28%,100% 70%,25% 92%,0 100%)',
  flame: 'polygon(50% 0,100% 30%,60% 55%,100% 75%,40% 100%,0 72%,25% 40%,0 18%)',
  pixel: 'polygon(0 0,100% 0,100% 30%,60% 30%,60% 45%,100% 45%,100% 100%,0 100%,0 65%,40% 65%,40% 50%,0 50%)',
}

const shapeCuts: Record<string, string> = {
  shuriken: 'polygon(50% 0,61% 34%,100% 9%,68% 49%,100% 72%,61% 65%,50% 100%,39% 66%,0 91%,32% 51%,0 28%,39% 35%)',
  star: 'polygon(50% 0,62% 34%,100% 50%,62% 64%,50% 100%,38% 64%,0 50%,38% 36%)',
  orb: 'circle(50% at 50% 50%)',
  crescent: 'polygon(72% 0,58% 18%,53% 37%,59% 56%,76% 73%,100% 82%,78% 100%,47% 94%,23% 78%,7% 53%,8% 27%,30% 8%,52% 0)',
  clover: 'polygon(50% 0,65% 16%,85% 8%,91% 28%,100% 45%,82% 58%,92% 82%,67% 84%,50% 100%,33% 84%,8% 82%,18% 58%,0 45%,9% 28%,15% 8%,35% 16%)',
  katana: 'polygon(70% 0,100% 6%,33% 93%,8% 100%,18% 77%)',
  spear: 'polygon(50% 0,100% 36%,64% 42%,59% 100%,41% 100%,36% 42%,0 36%)',
  mask: 'polygon(50% 0,91% 18%,86% 65%,70% 86%,50% 100%,30% 86%,14% 65%,9% 18%)',
  talisman: 'polygon(20% 0,80% 0,100% 12%,100% 88%,80% 100%,20% 100%,0 88%,0 12%)',
  fan: 'polygon(50% 0,100% 27%,84% 100%,50% 77%,16% 100%,0 27%)',
  dragon: 'polygon(72% 0,59% 21%,91% 34%,61% 43%,100% 64%,57% 61%,69% 100%,42% 70%,15% 91%,29% 56%,0 40%,40% 37%)',
  crown: 'polygon(0 15%,25% 40%,38% 0,51% 38%,70% 2%,77% 42%,100% 18%,85% 100%,15% 100%)',
  compass: 'polygon(50% 0,61% 38%,100% 50%,61% 62%,50% 100%,39% 62%,0 50%,39% 38%)',
  brush: 'polygon(30% 0,77% 0,100% 74%,75% 100%,0 28%)',
  leaf: 'polygon(0 15%,35% 8%,100% 0,88% 62%,53% 100%,14% 78%)',
  wave: 'polygon(0 18%,20% 0,38% 16%,55% 0,73% 16%,100% 4%,100% 85%,78% 100%,58% 84%,39% 100%,19% 83%,0 95%)',
  diamond: 'polygon(50% 0,100% 50%,50% 100%,0 50%)',
  cross: 'polygon(35% 0,65% 0,65% 35%,100% 35%,100% 65%,65% 65%,65% 100%,35% 100%,35% 65%,0 65%,0 35%,35% 35%)',
}

const legacyFamilies: Record<string, string> = {
  default: 'spark', ocean: 'ripple', forest: 'leaf', crimson: 'streak', mint: 'halo', sky: 'frost',
  steel: 'digital', coral: 'petal', sunset: 'flame', lavender: 'petal', peach: 'petal', sapphire: 'crystal',
  rose: 'petal', lime: 'electric', violet: 'cosmic', galaxy: 'cosmic', aurora: 'aurora', amber: 'spark',
  emerald: 'leaf', ruby: 'flame', cyber: 'digital', retro: 'digital', amethyst: 'crystal', diamond: 'crystal',
  obsidian: 'void', blood_moon: 'void', toxic: 'mist', golden: 'halo', plasma: 'plasma', inferno: 'flame',
  glacier: 'frost', hologram: 'digital', nebula: 'cosmic', cosmos: 'cosmic', phoenix: 'flame', quantum: 'plasma',
  void: 'void', celestial: 'halo', rainbow: 'spark',
}

const secondaryInk: Record<string,string> = {
 default:'#fbbf24',ocean:'#67e8f9',forest:'#bef264',crimson:'#fda4af',mint:'#38bdf8',sky:'#c4b5fd',steel:'#67e8f9',coral:'#fbbf24',sunset:'#f472b6',lavender:'#f9a8d4',peach:'#a78bfa',sapphire:'#67e8f9',rose:'#c4b5fd',lime:'#22d3ee',violet:'#f9a8d4',galaxy:'#38bdf8',aurora:'#a78bfa',amber:'#fb923c',emerald:'#a3e635',ruby:'#fbbf24',cyber:'#22d3ee',retro:'#67e8f9',amethyst:'#f9a8d4',diamond:'#67e8f9',obsidian:'#c084fc',blood_moon:'#fb7185',toxic:'#fde047',golden:'#fff2b2',plasma:'#e879f9',inferno:'#fde047',glacier:'#a78bfa',hologram:'#e879f9',nebula:'#38bdf8',cosmos:'#f9a8d4',phoenix:'#fef08a',quantum:'#a78bfa',void:'#e879f9',celestial:'#f9a8d4',rainbow:'#38bdf8',
}

const collectionsById = new Map(collections.map(collection => [collection.id, collection]))

/** Keep dark cosmetic inks visible against the match and inventory surfaces. */
export function visibleCursorInk(color: string) {
  if (!/^#[0-9a-f]{6}$/i.test(color)) return color
  const rgb = [1, 3, 5].map(offset => parseInt(color.slice(offset, offset + 2), 16) / 255)
  const brightness = rgb[0] * .2126 + rgb[1] * .7152 + rgb[2] * .0722
  if (brightness >= .42) return color
  const lift = (.42 - brightness) / (1 - brightness)
  return '#' + rgb.map(channel => Math.round((channel + (1 - channel) * lift) * 255).toString(16).padStart(2, '0')).join('')
}

export function getCursorPresentation(id: string) {
  const cursor = CURSORS[id] ?? CURSORS.default
  const collection = collectionsById.get(id)
  return {
    family: collection?.family ?? legacyFamilies[id] ?? 'spark',
    accent: collection?.accent ?? secondaryInk[id] ?? cursor.glow,
    color: cursor.color,
    motion: collection?.motion ?? 'pulse',
    motif: collection?.motif ?? cursor.motif ?? collection?.family ?? 'spark',
    shape: collection?.cursorShape ?? cursor.cursorShape ?? 'line',
    face: collection?.face ?? cursor.face,
  }
}

export function getCursorStyle(id: string): CSSProperties {
  const cursor = CURSORS[id] ?? CURSORS.default
  const [rawHighlight, finish, width] = finishes[id] ?? finishes.default
  const highlight = visibleCursorInk(secondaryInk[id] ?? rawHighlight)
  const collection = collectionsById.get(id)
  const shape = collection?.cursorShape ?? cursor.cursorShape
  const base = visibleCursorInk(cursor.color)
  const gradient = id === 'rainbow'
    ? 'linear-gradient(180deg,#fb7185,#fbbf24,#34d399,#38bdf8,#a78bfa)'
    : ['split', 'circuit', 'scan'].includes(finish)
      ? `repeating-linear-gradient(180deg,${highlight} 0 2px,${base} 2px 7px,transparent 7px 9px)`
      : `linear-gradient(${finish === 'wave' ? '155deg' : '90deg'},${base},${highlight},${base})`
  return {
    width: Math.max(width, cursor.face ? 6 : 3),
    background: gradient,
    clipPath: shapeCuts[shape ?? ''] ?? cuts[finish],
    borderRadius: ['square', 'pixel', 'shuriken', 'star', 'katana', 'spear', 'cross'].includes(shape ?? '') ? 0 : 8,
    boxShadow: `0 0 9px ${cursor.glow}65, 0 0 18px ${cursor.glow}38`,
    border: finish === 'bead' ? `1px solid ${highlight}` : undefined,
  }
}
