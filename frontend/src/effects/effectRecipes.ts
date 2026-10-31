/**
 * Art direction for every profile effect.
 *
 * One explicit recipe per ownership id: focal art, atmosphere, placement, frame,
 * ambient layer and motion language. Recipes are deliberately hand assigned –
 * nothing here is selected at runtime from a generic family template.
 */

export type HeroKey =
  | 'orb' | 'crescent' | 'comet' | 'wings' | 'lotus' | 'rose' | 'sakura' | 'serpent'
  | 'dragon' | 'fox' | 'mask' | 'crown' | 'crystal' | 'sword' | 'star' | 'rift'
  | 'flame' | 'wave' | 'feather' | 'moth' | 'koi' | 'lantern' | 'snow' | 'cloud'
  | 'eye' | 'halo' | 'gear' | 'book' | 'clover' | 'cross' | 'fist' | 'seal'
  | 'spiral' | 'bamboo' | 'mountain' | 'sun' | 'gem' | 'honeycomb' | 'circuit' | 'compass'
  | 'ink' | 'prism' | 'heart' | 'jellyfish' | 'coral' | 'dandelion' | 'willow'
  | 'ribbon' | 'pixel' | 'tiger' | 'qilin' | 'lion' | 'crane'

export type FieldKey =
  | 'night' | 'aurora' | 'sunset' | 'ocean' | 'petal' | 'storm' | 'frost' | 'ember'
  | 'neon' | 'void' | 'ink' | 'bloom' | 'confetti' | 'prism' | 'cosmic' | 'mist'
  | 'sand' | 'sacred' | 'circuit' | 'glass' | 'paper'

export type PlaceKey = 'tr' | 'tl' | 'br' | 'bl' | 'top' | 'center' | 'twin'
export type FrameKey = 'glow' | 'double' | 'dashed' | 'segmented' | 'runes' | 'thread' | 'aurora' | 'none'
export type AmbientKey = 'stars' | 'motes' | 'petals' | 'bubbles' | 'embers' | 'snow' | 'shards' | 'data' | 'pollen' | 'notes' | 'dust' | 'confetti'
export type MotionKey =
  | 'float' | 'orbit' | 'pulse' | 'sway' | 'shimmer' | 'flicker' | 'surge' | 'drift'
  | 'breathe' | 'spin' | 'rise' | 'flow' | 'twinkle' | 'glitch' | 'hover' | 'storm'
  | 'halo' | 'galaxy' | 'rift' | 'freeze' | 'bounce' | 'slash'

export type EffectRecipe = readonly [
  hero: HeroKey,
  field: FieldKey,
  place: PlaceKey,
  frame: FrameKey,
  ambient: AmbientKey,
  motion: MotionKey,
  scale?: number,
]

export const EFFECT_RECIPES: Record<string, EffectRecipe> = {
  // Original catalog — 50 distinct scenes.
  glow_soft: ['orb', 'night', 'tr', 'glow', 'stars', 'float'],
  pulse_slow: ['heart', 'sacred', 'center', 'glow', 'motes', 'pulse'],
  shimmer_light: ['gem', 'mist', 'tl', 'thread', 'dust', 'shimmer'],
  fade_cycle: ['crescent', 'sunset', 'tr', 'thread', 'stars', 'breathe'],
  sparkle_mini: ['star', 'night', 'br', 'glow', 'motes', 'twinkle'],
  wave_gentle: ['wave', 'ocean', 'br', 'glow', 'bubbles', 'flow'],
  float_dots: ['dandelion', 'bloom', 'tr', 'thread', 'motes', 'drift'],
  blink_soft: ['star', 'night', 'tl', 'thread', 'stars', 'twinkle'],
  rotate_slow: ['compass', 'cosmic', 'tr', 'runes', 'stars', 'spin'],
  scale_breath: ['lotus', 'bloom', 'center', 'glow', 'pollen', 'breathe'],
  bounce_light: ['gem', 'ocean', 'bl', 'thread', 'bubbles', 'bounce'],
  sway_gentle: ['willow', 'mist', 'tl', 'thread', 'motes', 'sway'],
  sparkle_gold: ['dandelion', 'sunset', 'tr', 'glow', 'pollen', 'drift'],
  pulse_neon: ['jellyfish', 'void', 'br', 'glow', 'bubbles', 'pulse'],
  glow_rainbow: ['prism', 'prism', 'tr', 'glow', 'stars', 'shimmer'],
  shimmer_ocean: ['coral', 'ocean', 'br', 'glow', 'bubbles', 'sway'],
  wave_electric: ['wave', 'storm', 'br', 'glow', 'shards', 'flow'],
  float_stars: ['comet', 'cosmic', 'tl', 'glow', 'stars', 'drift'],
  pulse_fire: ['heart', 'ember', 'center', 'glow', 'embers', 'pulse'],
  sparkle_cosmic: ['orb', 'cosmic', 'tr', 'glow', 'stars', 'orbit'],
  glow_sunset: ['sun', 'sunset', 'tr', 'glow', 'motes', 'breathe'],
  shimmer_aurora: ['ribbon', 'aurora', 'top', 'glow', 'stars', 'shimmer'],
  particle_storm: ['moth', 'bloom', 'br', 'glow', 'motes', 'drift'],
  ring_expand: ['orb', 'sacred', 'center', 'double', 'shards', 'pulse'],
  lightning_flash: ['cloud', 'storm', 'tr', 'glow', 'shards', 'flicker'],
  fire_outline: ['flame', 'ember', 'bl', 'glow', 'embers', 'flicker'],
  ice_crystals: ['snow', 'frost', 'top', 'runes', 'snow', 'breathe'],
  smoke_trail: ['cloud', 'mist', 'bl', 'thread', 'motes', 'drift'],
  glitch_effect: ['circuit', 'neon', 'tr', 'segmented', 'data', 'glitch'],
  matrix_rain: ['circuit', 'circuit', 'top', 'segmented', 'data', 'flow'],
  neon_outline: ['halo', 'neon', 'center', 'glow', 'data', 'pulse'],
  pixel_burst: ['pixel', 'neon', 'bl', 'segmented', 'shards', 'glitch'],
  plasma_field: ['orb', 'neon', 'tl', 'glow', 'shards', 'pulse'],
  gravity_warp: ['rift', 'void', 'center', 'runes', 'stars', 'orbit'],
  energy_sphere: ['orb', 'sacred', 'tr', 'glow', 'motes', 'hover'],
  aurora_dance: ['ribbon', 'aurora', 'top', 'runes', 'stars', 'flow'],
  fire_storm: ['flame', 'ember', 'center', 'glow', 'embers', 'surge'],
  ice_shatter: ['crystal', 'frost', 'br', 'segmented', 'shards', 'freeze'],
  thunder_strike: ['cloud', 'storm', 'top', 'glow', 'shards', 'storm'],
  shadow_shift: ['mask', 'void', 'tr', 'segmented', 'motes', 'drift'],
  supernova: ['star', 'cosmic', 'center', 'runes', 'shards', 'pulse'],
  void_rift: ['rift', 'void', 'tl', 'segmented', 'shards', 'rift'],
  galaxy_swirl: ['spiral', 'cosmic', 'br', 'glow', 'stars', 'spin'],
  phoenix_rise: ['wings', 'ember', 'br', 'glow', 'embers', 'rise'],
  divine_radiance: ['halo', 'sacred', 'top', 'glow', 'motes', 'halo'],
  cosmic_explosion: ['star', 'cosmic', 'tr', 'segmented', 'shards', 'storm'],
  reality_tear: ['rift', 'prism', 'tr', 'segmented', 'shards', 'glitch'],
  time_warp: ['compass', 'void', 'tr', 'runes', 'stars', 'spin'],
  singularity: ['orb', 'void', 'center', 'glow', 'stars', 'orbit'],
  transcendence: ['halo', 'sacred', 'center', 'glow', 'motes', 'halo'],

  // Collection catalog — 100 explicit pieces.
  sakura_nocturne: ['sakura', 'petal', 'tl', 'glow', 'petals', 'sway'],
  solar_flare: ['sun', 'ember', 'center', 'segmented', 'embers', 'surge'],
  lunar_tide: ['crescent', 'ocean', 'br', 'glow', 'bubbles', 'flow'],
  jade_serpent: ['serpent', 'mist', 'tr', 'runes', 'motes', 'sway'],
  opal_dream: ['gem', 'cosmic', 'tl', 'glow', 'stars', 'shimmer'],
  velvet_eclipse: ['crescent', 'void', 'tr', 'segmented', 'stars', 'breathe'],
  cobalt_storm: ['wave', 'storm', 'bl', 'segmented', 'shards', 'surge'],
  amber_relic: ['gem', 'sand', 'bl', 'runes', 'motes', 'hover'],
  arctic_bloom: ['crystal', 'frost', 'br', 'glow', 'snow', 'freeze'],
  rose_requiem: ['rose', 'petal', 'br', 'glow', 'petals', 'sway'],
  neon_ronin: ['sword', 'neon', 'tr', 'segmented', 'data', 'glitch'],
  astral_koi: ['koi', 'cosmic', 'bl', 'glow', 'stars', 'drift'],
  lotus_sanctuary: ['lotus', 'sacred', 'tl', 'double', 'motes', 'halo'],
  cinder_wings: ['feather', 'ember', 'br', 'segmented', 'embers', 'drift'],
  glacial_echo: ['crystal', 'frost', 'tr', 'segmented', 'shards', 'freeze'],
  verdant_pulse: ['heart', 'bloom', 'bl', 'glow', 'motes', 'pulse'],
  chrome_phantom: ['mask', 'neon', 'tr', 'segmented', 'data', 'glitch'],
  ultraviolet: ['prism', 'neon', 'tl', 'glow', 'data', 'shimmer'],
  starlit_waltz: ['star', 'cosmic', 'twin', 'thread', 'stars', 'orbit'],
  coral_current: ['coral', 'ocean', 'tl', 'thread', 'bubbles', 'flow'],
  midnight_orchid: ['lotus', 'void', 'bl', 'thread', 'motes', 'sway'],
  thunderbird: ['wings', 'storm', 'tr', 'glow', 'shards', 'flicker'],
  honeycomb: ['honeycomb', 'sand', 'tr', 'runes', 'pollen', 'hover'],
  prism_cascade: ['prism', 'prism', 'top', 'glow', 'shards', 'shimmer'],
  sea_glass: ['gem', 'ocean', 'bl', 'glow', 'bubbles', 'shimmer'],
  blood_ritual: ['seal', 'ember', 'center', 'runes', 'embers', 'pulse'],
  ghost_signal: ['circuit', 'neon', 'tl', 'segmented', 'data', 'glitch'],
  superbloom: ['sakura', 'bloom', 'center', 'glow', 'petals', 'drift'],
  desert_mirage: ['sun', 'sand', 'tr', 'thread', 'motes', 'shimmer'],
  blue_hour: ['cloud', 'mist', 'tr', 'glow', 'motes', 'drift'],
  ruby_comet: ['comet', 'cosmic', 'tr', 'glow', 'stars', 'drift'],
  moonstone: ['crescent', 'night', 'tl', 'runes', 'stars', 'halo'],
  toxic_lotus: ['lotus', 'mist', 'br', 'segmented', 'bubbles', 'pulse'],
  paper_lantern: ['lantern', 'paper', 'tr', 'glow', 'embers', 'hover'],
  frozen_time: ['snow', 'frost', 'center', 'runes', 'snow', 'freeze'],
  seraphim: ['wings', 'aurora', 'top', 'glow', 'stars', 'halo'],
  abyssal_crown: ['crown', 'void', 'tr', 'runes', 'stars', 'orbit'],
  copper_circuit: ['circuit', 'neon', 'br', 'segmented', 'data', 'flow'],
  wisteria_rain: ['sakura', 'bloom', 'tl', 'thread', 'petals', 'sway'],
  ion_drive: ['orb', 'void', 'tr', 'segmented', 'shards', 'spin'],
  celestial_ink: ['ink', 'ink', 'tl', 'thread', 'stars', 'drift'],
  phoenix_dawn: ['wings', 'sunset', 'br', 'glow', 'embers', 'rise'],
  quantum_entanglement: ['rift', 'prism', 'center', 'segmented', 'stars', 'orbit'],
  royal_moth: ['moth', 'bloom', 'tr', 'glow', 'motes', 'hover'],
  diamond_rain: ['crystal', 'frost', 'top', 'runes', 'shards', 'shimmer'],
  singularity_prime: ['spiral', 'cosmic', 'center', 'runes', 'shards', 'galaxy'],
  spectrum_drift: ['prism', 'aurora', 'tl', 'glow', 'stars', 'shimmer'],
  infinity_engine: ['seal', 'neon', 'center', 'runes', 'data', 'spin'],
  empyrean: ['halo', 'aurora', 'top', 'double', 'stars', 'halo'],
  world_serpent: ['serpent', 'cosmic', 'br', 'runes', 'stars', 'flow'],
  chakra_tempest: ['spiral', 'storm', 'tr', 'glow', 'shards', 'spin'],
  nine_tail_ember: ['fox', 'ember', 'br', 'glow', 'embers', 'sway'],
  scarlet_eye_rift: ['eye', 'void', 'tr', 'segmented', 'stars', 'pulse'],
  grand_line_compass: ['compass', 'ocean', 'tr', 'runes', 'stars', 'spin'],
  conqueror_haki: ['eye', 'storm', 'top', 'segmented', 'shards', 'storm'],
  gum_gum_impact: ['fist', 'confetti', 'bl', 'glow', 'confetti', 'bounce'],
  one_punch_impact: ['fist', 'sacred', 'br', 'segmented', 'shards', 'surge'],
  death_note_inkfall: ['book', 'ink', 'tl', 'thread', 'motes', 'drift'],
  shinigami_moon: ['mask', 'night', 'tr', 'runes', 'stars', 'breathe'],
  clover_grimoire: ['clover', 'bloom', 'br', 'runes', 'motes', 'hover'],
  anti_magic_cross: ['cross', 'void', 'center', 'segmented', 'shards', 'glitch'],
  sunsteel_breath: ['sword', 'ember', 'br', 'glow', 'embers', 'surge'],
  tidal_dragon_form: ['dragon', 'ocean', 'br', 'glow', 'bubbles', 'flow'],
  spirit_reaper_mask: ['mask', 'void', 'tr', 'runes', 'motes', 'drift'],
  cursed_void: ['seal', 'void', 'center', 'segmented', 'stars', 'pulse'],
  colossus_shards: ['crystal', 'glass', 'tr', 'segmented', 'shards', 'freeze'],
  alchemist_circle: ['compass', 'sacred', 'center', 'runes', 'motes', 'spin'],
  star_guardian: ['star', 'cosmic', 'top', 'glow', 'stars', 'halo'],
  yokai_foxfire: ['fox', 'ember', 'tl', 'glow', 'embers', 'sway'],
  dark_mortal_eclipse: ['crescent', 'mist', 'bl', 'double', 'motes', 'drift'],
  heavenly_demon_seal: ['seal', 'storm', 'center', 'runes', 'shards', 'storm'],
  jade_meridian_flow: ['serpent', 'mist', 'tl', 'thread', 'motes', 'flow'],
  sword_intent: ['sword', 'frost', 'tr', 'segmented', 'shards', 'slash'],
  plum_blossom_saber: ['sakura', 'frost', 'tl', 'glow', 'petals', 'sway'],
  nine_peaks_mountain: ['mountain', 'mist', 'br', 'thread', 'motes', 'breathe'],
  azure_dragon_gate: ['dragon', 'sacred', 'tr', 'runes', 'stars', 'orbit'],
  immortal_crane_step: ['crane', 'mist', 'tr', 'glow', 'motes', 'drift'],
  golden_core_sun: ['sun', 'sacred', 'top', 'runes', 'motes', 'pulse'],
  moon_gate_cultivation: ['crescent', 'sacred', 'tr', 'runes', 'stars', 'halo'],
  crimson_river_blade: ['sword', 'ember', 'br', 'segmented', 'embers', 'slash'],
  thunder_palm: ['fist', 'storm', 'tr', 'glow', 'shards', 'flicker'],
  lotus_sect_seal: ['lotus', 'sacred', 'center', 'runes', 'pollen', 'breathe'],
  iron_body_forge: ['gear', 'ember', 'bl', 'segmented', 'embers', 'pulse'],
  white_tiger_form: ['tiger', 'frost', 'tr', 'segmented', 'shards', 'surge'],
  qilin_auspice: ['qilin', 'sacred', 'top', 'runes', 'motes', 'hover'],
  ink_wash_pavilion: ['ink', 'ink', 'br', 'thread', 'motes', 'drift'],
  bamboo_shadow_step: ['bamboo', 'mist', 'br', 'thread', 'motes', 'sway'],
  celestial_talisman: ['seal', 'sacred', 'tr', 'runes', 'stars', 'spin'],
  snow_peak_sword: ['sword', 'frost', 'br', 'segmented', 'snow', 'freeze'],
  river_cloud_step: ['cloud', 'ocean', 'bl', 'thread', 'bubbles', 'drift'],
  phoenix_qi_rebirth: ['flame', 'sacred', 'center', 'runes', 'embers', 'surge'],
  dragon_vein_orbit: ['dragon', 'cosmic', 'tr', 'runes', 'stars', 'orbit'],
  jade_lion_guard: ['lion', 'sacred', 'tr', 'runes', 'motes', 'breathe'],
  mist_valley_wanderer: ['cloud', 'mist', 'tl', 'thread', 'motes', 'drift'],
  immortal_lotus_bloom: ['lotus', 'mist', 'br', 'runes', 'snow', 'rise'],
  star_sutra: ['seal', 'cosmic', 'center', 'runes', 'stars', 'spin'],
  mecha_nebula: ['circuit', 'cosmic', 'tr', 'segmented', 'data', 'glitch'],
  phantom_mask: ['mask', 'mist', 'center', 'thread', 'dust', 'hover'],
  infernal_crown: ['crown', 'ember', 'top', 'segmented', 'embers', 'surge'],
  champion_crown: ['crown', 'sacred', 'center', 'segmented', 'motes', 'breathe'],
}

export const EFFECT_RECIPE_IDS = Object.keys(EFFECT_RECIPES)
