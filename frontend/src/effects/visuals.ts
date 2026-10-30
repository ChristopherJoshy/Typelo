import collections from '../data/cosmetics.json'
import { EFFECTS } from '../types'

export type EffectFamily =
  | 'spark'
  | 'ripple'
  | 'petal'
  | 'frost'
  | 'heart'
  | 'glyph'
  | 'streak'
  | 'mist'
  | 'flame'
  | 'electric'
  | 'digital'
  | 'plasma'
  | 'crystal'
  | 'cosmic'
  | 'void'
  | 'confetti'
  | 'halo'

export interface EffectVisual {
  family: EffectFamily
  color: string
  palette: readonly string[]
  glyph?: string
}

const familyGroups: Record<EffectFamily, readonly string[]> = {
  spark: ['dots', 'dust', 'sparkle', 'sparkle_mini', 'star', 'gold_trail'],
  ripple: ['bubble', 'ripple'],
  petal: ['leaf', 'feather', 'cherry'],
  frost: ['snow', 'ice'],
  heart: ['hearts'],
  glyph: ['music', 'infinity', 'matrix'],
  streak: ['wind'],
  mist: ['smoke', 'poison', 'spirit'],
  flame: ['fire', 'lava', 'dragon', 'ember'],
  electric: ['electric', 'thunder', 'lightning'],
  digital: ['pixel', 'glitch', 'cyberpunk'],
  plasma: ['neon', 'plasma_trail'],
  crystal: ['crystal'],
  cosmic: ['aurora_trail', 'galaxy_trail', 'cosmic_dust', 'supernova', 'timeshift'],
  void: ['shadow', 'void_rift', 'singularity', 'reality_tear'],
  confetti: ['confetti'],
  halo: ['divine_light', 'godray'],
}

const familyPalette: Partial<Record<EffectFamily, readonly string[]>> = {
  spark: ['#fff7cc', '#fbbf24', '#f59e0b'],
  ripple: ['#e0f2fe', '#7dd3fc', '#38bdf8'],
  petal: ['#fff1f2', '#fda4af', '#fb7185'],
  frost: ['#ffffff', '#bae6fd', '#60a5fa'],
  heart: ['#fce7f3', '#f9a8d4', '#ec4899'],
  streak: ['#f8fafc', '#cbd5e1', '#94a3b8'],
  mist: ['#f1f5f9', '#cbd5e1', '#94a3b8'],
  flame: ['#fff7ed', '#fbbf24', '#fb923c', '#ef4444'],
  electric: ['#f8fafc', '#93c5fd', '#3b82f6'],
  digital: ['#ecfeff', '#22d3ee', '#22c55e'],
  plasma: ['#ecfeff', '#67e8f9', '#a78bfa'],
  crystal: ['#faf5ff', '#c4b5fd', '#818cf8'],
  cosmic: ['#f5f3ff', '#c4b5fd', '#818cf8', '#22d3ee'],
  void: ['#faf5ff', '#d8b4fe', '#8b5cf6'],
  confetti: ['#fce7f3', '#fb7185', '#fbbf24', '#60a5fa', '#34d399'],
  halo: ['#fffbeb', '#fde68a', '#c4b5fd'],
}

const glyphs: Record<string, string> = {
  music: '♪',
  infinity: '∞',
  matrix: '0',
}

const effectFamily = new Map<string, EffectFamily>()
for (const [family, ids] of Object.entries(familyGroups) as [EffectFamily, readonly string[]][]) {
  for (const id of ids) effectFamily.set(id, family)
}

for (const c of collections) effectFamily.set(c.id, c.family as EffectFamily)
const collectionVisuals = new Map(collections.map(c => [c.id, c]))

export function getEffectVisual(effectId: string, colorOverride?: string): EffectVisual {
  const collection = collectionVisuals.get(effectId)
  const family = effectFamily.get(effectId) ?? 'spark'
  const color = colorOverride && colorOverride !== 'rainbow'
    ? colorOverride
    : EFFECTS[effectId]?.color && EFFECTS[effectId].color !== 'rainbow'
      ? EFFECTS[effectId].color
      : familyPalette[family]?.[1] ?? '#fb7185'

  return {
    family,
    color,
    palette: collection ? [collection.color, collection.accent, '#ffffff'] : familyPalette[family]
      ? [...new Set([color, ...familyPalette[family]])]
      : [color],
    glyph: glyphs[effectId] ?? (family === 'glyph' ? (collection?.finish === 'circuit' ? '∞' : '✧') : undefined),
  }
}
