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
export function getCursorStyle(id: string): CSSProperties {
  const cursor = CURSORS[id] ?? CURSORS.default
  const [highlight, finish, width] = finishes[id] ?? finishes.default
  const base = ['void', 'obsidian'].includes(id) ? '#7c6a99' : cursor.color
  const gradient = id === 'rainbow'
    ? 'linear-gradient(180deg,#fb7185,#fbbf24,#34d399,#38bdf8,#a78bfa)'
    : ['split', 'circuit', 'scan'].includes(finish)
      ? `repeating-linear-gradient(180deg,${highlight} 0 2px,${base} 2px 7px,transparent 7px 9px)`
      : `linear-gradient(${finish === 'wave' ? '155deg' : '90deg'},${base},${highlight},${base})`
  return { width, background: gradient, clipPath: cuts[finish], borderRadius: finish === 'square' || finish === 'pixel' ? 0 : 8,
    boxShadow: `0 0 9px ${cursor.glow}65`, border: finish === 'bead' ? `1px solid ${highlight}` : undefined }
}
