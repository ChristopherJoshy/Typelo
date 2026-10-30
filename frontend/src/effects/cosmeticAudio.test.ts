import { afterEach, describe, expect, it, vi } from 'vitest'
import { CURSORS, EFFECTS, PROFILE_BORDERS, PROFILE_EFFECTS } from '../types'
import { getCosmeticSoundRecipe } from './cosmeticAudio'

afterEach(() => { vi.unstubAllGlobals(); vi.restoreAllMocks(); localStorage.clear() })

describe('cosmetic sound pairing', () => {
  it('covers every highest-rarity item in all four sections and pairs separate registers', () => {
    for (const [section, catalogs] of [['typing', [CURSORS, EFFECTS]], ['profile', [PROFILE_EFFECTS, PROFILE_BORDERS]]] as const) {
      for (let layer = 0; layer < 2; layer++) {
        for (const item of Object.values(catalogs[layer])) {
          const recipe = getCosmeticSoundRecipe(section, layer === 0 ? item.id : null, layer === 1 ? item.id : null)
          expect(recipe.length).toBe(['ultra', 'divine', 'mythical'].includes(item.rarity) ? 1 : 0)
        }
      }
      const first = Object.values(catalogs[0]).find(item => item.rarity === 'divine')!
      const second = Object.values(catalogs[1]).find(item => item.rarity === 'divine')!
      const pair = getCosmeticSoundRecipe(section, first.id, second.id)
      expect(pair).toHaveLength(2)
      expect(pair[1].frequency).toBeGreaterThan(pair[0].frequency)
      expect(pair[1].delay).toBeGreaterThan(pair[0].delay)
    }
  })

  it('limits polyphony, deduplicates rapid updates, and honors cosmetic mute', async () => {
    vi.resetModules()
    const start = vi.fn()
    const parameter = () => ({ value: 0, setValueAtTime: vi.fn(), linearRampToValueAtTime: vi.fn(), exponentialRampToValueAtTime: vi.fn() })
    const node = () => ({ connect: vi.fn(), disconnect: vi.fn() })
    class FakeAudioContext {
      state = 'running'; currentTime = 0; destination = {}
      createDynamicsCompressor() { return { ...node(), threshold: parameter(), ratio: parameter() } }
      createOscillator() { return { ...node(), frequency: parameter(), start, stop: vi.fn(), onended: null } }
      createGain() { return { ...node(), gain: parameter() } }
      createStereoPanner() { return { ...node(), pan: parameter() } }
    }
    vi.stubGlobal('AudioContext', FakeAudioContext)
    const audio = await import('./cosmeticAudio')
    const { usePreferencesStore } = await import('../stores/preferencesStore')
    usePreferencesStore.getState().setCosmeticSoundsEnabled(true)
    audio.unlockCosmeticAudio()
    const cursor = Object.values(CURSORS).find(item => item.rarity === 'divine')!.id
    const trail = Object.values(EFFECTS).find(item => item.rarity === 'divine')!.id
    audio.playCosmeticPair('typing', cursor, trail, 'same-source')
    audio.playCosmeticPair('typing', cursor, trail, 'same-source')
    expect(start).toHaveBeenCalledTimes(4)
    for (let i = 0; i < 20; i++) audio.playCosmeticPair('typing', cursor, trail, `source-${i}`)
    expect(start).toHaveBeenCalledTimes(12)
    usePreferencesStore.getState().setCosmeticSoundsEnabled(false)
    audio.playCosmeticPair('profile', cursor, trail, 'muted')
    expect(start).toHaveBeenCalledTimes(12)
  })
})
