import collections from '../data/cosmetics.json'
import { cosmeticPalette, hueShift, parseHex, type CosmeticPalette } from './artColor'

export interface CosmeticCollection {
  id: string
  name: string
  color: string
  accent: string
  family: string
  motion: string
  finish: string
  rarity: string
  variant: number
  avatarShape?: string
  motif?: string
}

const collectionById = new Map<string, CosmeticCollection>(
  (collections as CosmeticCollection[]).map(collection => [collection.id, collection]),
)

export const RAINBOW_SPECTRUM = ['#fb7185', '#fbbf24', '#34d399', '#38bdf8', '#a78bfa', '#f472b6'] as const

export function cosmeticSeed(id: string) {
  return Array.from(id).reduce((seed, char) => (seed * 31 + char.charCodeAt(0)) >>> 0, 7)
}

/** Dark catalogue swatches are lifted so every cosmetic stays legible on the app's surfaces. */
export function visibleCosmeticColor(color: string) {
  if (color === 'rainbow') return '#c4b5fd'
  return ['#18181b', '#27272a', '#3f3f46', '#374151'].includes(color) ? '#a78bfa' : color
}

export function getCosmeticCollection(id: string) {
  return collectionById.get(id)
}

function accentShift(color: string, seed: number) {
  const [r, g, b] = parseHex(color).map(channel => channel / 255)
  const max = Math.max(r, g, b)
  const min = Math.min(r, g, b)
  const delta = max - min
  let hue = 0
  if (delta > 0) {
    if (max === r) hue = ((g - b) / delta) % 6
    else if (max === g) hue = (b - r) / delta + 2
    else hue = (r - g) / delta + 4
    hue = (hue * 60 + 360) % 360
  }
  const degrees = 10 + (seed % 11)
  // Keep golds and oranges warm instead of pushing their accents toward lime.
  if (hue >= 35 && hue <= 75) return -degrees
  if (hue < 35 || hue >= 345) return degrees
  return seed % 2 ? degrees : -degrees
}

export interface CosmeticIdentity {
  id: string
  seed: number
  collection?: CosmeticCollection
  rainbow: boolean
  palette: CosmeticPalette
}

/**
 * All cosmetic art resolves through here: one id, one deterministic palette.
 * Collection items keep their shop colours; legacy items get an id-derived accent
 * so two effects that shared a swatch still read as separate pieces.
 */
export function cosmeticIdentity(id: string, color: string, accent?: string): CosmeticIdentity {
  const collection = collectionById.get(id)
  const rawPrimary = collection?.color ?? color
  const rawAccent = collection?.accent ?? accent
  const rainbow = rawPrimary === 'rainbow' || rawAccent === 'rainbow'
  const seed = cosmeticSeed(id)
  const primary = rawPrimary === 'rainbow' ? 'rainbow' : visibleCosmeticColor(rawPrimary)
  const accentBase = primary === 'rainbow' ? (RAINBOW_SPECTRUM[seed % RAINBOW_SPECTRUM.length] ?? '#fb7185') : primary
  const secondary = rawAccent && rawAccent !== 'rainbow'
    ? rawAccent
    : hueShift(accentBase, accentShift(accentBase, seed))
  return {
    id,
    seed,
    collection,
    rainbow,
    palette: cosmeticPalette(primary, rawAccent === 'rainbow' ? '' : secondary, seed),
  }
}
