import collections from '../data/cosmetics.json'
import { visibleCursorInk } from './cursors'
const collectionsById = new Map(collections.map(item => [item.id,item]))
const accents: Record<string,string> = {
 glow_soft:'#60a5fa',pulse_slow:'#fbbf24',shimmer_light:'#2dd4bf',fade_cycle:'#fb7185',sparkle_mini:'#a3e635',wave_gentle:'#2dd4bf',float_dots:'#fde68a',blink_soft:'#c084fc',rotate_slow:'#38bdf8',scale_breath:'#facc15',bounce_light:'#67e8f9',sway_gentle:'#bef264',sparkle_gold:'#fb923c',pulse_neon:'#22d3ee',glow_rainbow:'#fb7185',shimmer_ocean:'#fb7185',wave_electric:'#a78bfa',float_stars:'#f472b6',pulse_fire:'#facc15',sparkle_cosmic:'#38bdf8',glow_sunset:'#f472b6',shimmer_aurora:'#a78bfa',particle_storm:'#f9a8d4',ring_expand:'#a3e635',lightning_flash:'#a78bfa',fire_outline:'#fbbf24',ice_crystals:'#a78bfa',smoke_trail:'#93c5fd',glitch_effect:'#f472b6',matrix_rain:'#fde047',neon_outline:'#22d3ee',pixel_burst:'#38bdf8',plasma_field:'#e879f9',gravity_warp:'#38bdf8',energy_sphere:'#fbbf24',aurora_dance:'#fb7185',fire_storm:'#facc15',ice_shatter:'#c4b5fd',thunder_strike:'#38bdf8',shadow_shift:'#e879f9',supernova:'#fb923c',void_rift:'#c084fc',galaxy_swirl:'#38bdf8',phoenix_rise:'#facc15',divine_radiance:'#f9a8d4',cosmic_explosion:'#2dd4bf',reality_tear:'#38bdf8',time_warp:'#f9a8d4',singularity:'#22d3ee',transcendence:'#c4b5fd',
}
export function getScenePalette(id: string,color: string) {
 return {
  ink: visibleCursorInk(color === 'rainbow' ? '#c4b5fd' : color),
  accent: visibleCursorInk(collectionsById.get(id)?.accent ?? accents[id] ?? '#67e8f9'),
  highlight: '#fff1d6',
 }
}
