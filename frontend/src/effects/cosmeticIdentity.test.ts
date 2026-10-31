import { describe, expect, it } from 'vitest'
import { cosmeticIdentity, RAINBOW_SPECTRUM } from './cosmeticIdentity'
import { parseHex } from './artColor'

describe('cosmetic identity palettes', () => {
  it('keeps derived warm accents harmonious instead of shifting gold into lime', () => {
    const { palette } = cosmeticIdentity('double_gold', '#fbbf24')
    const [red, green, blue] = parseHex(palette.secondary)
    expect(red).toBeGreaterThan(green)
    expect(green).toBeGreaterThan(blue)
  })

  it('uses a vivid deterministic spectrum for rainbow cosmetics', () => {
    const first = cosmeticIdentity('rainbow_solid', 'rainbow')
    const second = cosmeticIdentity('rainbow_solid', 'rainbow')
    expect(first.rainbow).toBe(true)
    expect(RAINBOW_SPECTRUM).toContain(first.palette.primary)
    expect(first.palette).toEqual(second.palette)
  })

  it('resolves matching effect and border ids through the same collection palette', () => {
    const effect = cosmeticIdentity('astral_koi', '#ffffff')
    const border = cosmeticIdentity('astral_koi', '#000000')
    expect(effect.collection?.id).toBe('astral_koi')
    expect(effect.palette).toEqual(border.palette)
  })
})
