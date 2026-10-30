import { CURSORS, EFFECTS, PROFILE_BORDERS, PROFILE_EFFECTS } from '../types'
import { usePreferencesStore } from '../stores/preferencesStore'
import { getCosmeticTimbre } from './cosmeticTimbres'

export type CosmeticAudioSection = 'typing' | 'profile'
const premium = new Set(['ultra', 'divine', 'mythical'])
const scale = [0, 2, 4, 7, 9]
let context: AudioContext | null = null
let output: DynamicsCompressorNode | null = null
let voices = 0
const cooldowns = new Map<string, number>()

function hash(id: string) {
  return Array.from(id).reduce((value, char) => (value * 31 + char.charCodeAt(0)) >>> 0, 7)
}

/** Paired layers share a key and occupy separate octaves and frequency bands. */
export function getCosmeticSoundRecipe(section: CosmeticAudioSection, first: string | null, second: string | null) {
  const catalogs = section === 'typing' ? [CURSORS, EFFECTS] : [PROFILE_EFFECTS, PROFILE_BORDERS]
  const root = 130.8128 * 2 ** ((hash(`${section}:${first ?? ''}:${second ?? ''}`) % 12) / 12)
  return [first, second].flatMap((id, layer) => {
    const item = id ? catalogs[layer][id] : undefined
    if (!item || !premium.has(item.rarity)) return []
    const seed = hash(item.id)
    const timbre = getCosmeticTimbre(section,layer,item.id)
    return [{
      id: item.id,
      frequency: root * 2 ** ((scale[seed % scale.length] + layer * 12) / 12),
      wave: timbre.wave,
      overtone: timbre.overtone, overtoneGain: timbre.overtoneGain, attack: timbre.attack,
      motif: timbre.motif,
      duration: section === 'profile' ? .48 + (seed % 4) * .09 : .065 + (seed % 4) * .012,
      delay: section === 'profile' ? layer * .09 : layer * .014,
      bend: timbre.bend,
      layer,
    }]
  })
}

/** Call only from pointer/keyboard gestures; never attempt to bypass autoplay. */
export function unlockCosmeticAudio() {
  if (!usePreferencesStore.getState().cosmeticSoundsEnabled) return
  try {
    if (!context || context.state === 'closed') {
      context = new AudioContext()
      output = context.createDynamicsCompressor()
      output.threshold.value = -20
      output.ratio.value = 6
      output.connect(context.destination)
    }
    if (context.state === 'suspended') void context.resume().catch(() => undefined)
  } catch { /* Audio is optional on unsupported devices. */ }
}

export function playCosmeticPair(section: CosmeticAudioSection, first: string | null, second: string | null, source: string, opponent = false) {
  if (!context || context.state !== 'running' || !output || document.hidden) return
  if (!usePreferencesStore.getState().cosmeticSoundsEnabled || localStorage.getItem('sound-enabled') === 'false') return
  const now = performance.now()
  const key = `${section}:${source}`
  if (now - (cooldowns.get(key) ?? -Infinity) < (section === 'typing' ? 85 : 900)) return
  const recipe = getCosmeticSoundRecipe(section, first, second)
  const needed = recipe.length * 2
  if (!recipe.length || voices + needed > 12) return
  cooldowns.set(key, now)
  // Keep lifetime state bounded, including repeated visits to different profiles.
  if (cooldowns.size > 64) cooldowns.delete(cooldowns.keys().next().value!)
  const savedVolume = Number(localStorage.getItem('sound-volume') ?? .5)
  const volume = Number.isFinite(savedVolume) ? Math.max(0, Math.min(1, savedVolume)) : .5
  if (volume === 0) return
  for (const layer of recipe) {
    const notes = section === 'profile' ? layer.motif : [0]
    // Two bounded partials per layer. Profile cues unfold as short motifs;
    // typing cues stay compact so fast typing cannot build a wall of sound.
    for (const [partial,ratio] of [1,layer.overtone].entries()) {
      const oscillator = context.createOscillator()
      const gain = context.createGain()
      const pan = context.createStereoPanner()
      const start = context.currentTime + layer.delay
      const end = start + layer.duration
      const level = volume * (section === 'profile' ? .055 : .027) * (opponent ? .65 : 1) * (partial ? layer.overtoneGain : 1)
      oscillator.type = partial ? 'sine' : layer.wave
      const attack = Math.min(layer.duration*.25,layer.attack)
      notes.forEach((note,index) => {
        const at = start + index * layer.duration / notes.length
        const finish = start + (index+1) * layer.duration / notes.length
        const frequency = layer.frequency * ratio * 2 ** (note/12)
        oscillator.frequency.setValueAtTime(Math.max(20,frequency * layer.bend),at)
        oscillator.frequency.exponentialRampToValueAtTime(Math.max(20,frequency),finish)
        gain.gain.setValueAtTime(.0001,at)
        gain.gain.linearRampToValueAtTime(level,at+attack)
        gain.gain.exponentialRampToValueAtTime(.0001,finish)
      })
      pan.pan.value = opponent ? .3 : -.15
      oscillator.connect(gain);gain.connect(pan);pan.connect(output)
      voices++
      oscillator.onended = () => { voices--;oscillator.disconnect();gain.disconnect();pan.disconnect() }
      oscillator.start(start);oscillator.stop(end+.015)
    }
  }
}
