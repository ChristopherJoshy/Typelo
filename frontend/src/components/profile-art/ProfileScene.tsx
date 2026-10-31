import { memo, useId, type CSSProperties } from 'react'
import type { ProfileEffectInfo } from '../../types'
import { EFFECT_RECIPES, type EffectRecipe, type MotionKey } from '../../effects/effectRecipes'
import { cosmeticIdentity } from '../../effects/cosmeticIdentity'
import HeroGlyph from './HeroGlyph'
import FieldArt from './scene/FieldArt'
import AmbientField from './scene/AmbientField'
import SceneFrame from './SceneFrame'
import { useLiveMotion } from './useLiveMotion'

const MOTION_SECONDS: Record<MotionKey, number> = {
  float: 5.4, orbit: 9, pulse: 4.2, sway: 5.6, shimmer: 4.8, flicker: 1.8,
  surge: 4.6, drift: 7.2, breathe: 6, spin: 26, rise: 5.2, flow: 6.6,
  twinkle: 3.6, glitch: 2.4, hover: 5, storm: 1.5, halo: 6.8, galaxy: 24,
  rift: 3.8, freeze: 7, bounce: 3.2, slash: 3.4,
}

const PLACE_GLOW: Record<string, readonly [number, number]> = {
  tr: [82, 14], tl: [18, 14], br: [82, 84], bl: [18, 84],
  top: [50, 8], center: [50, 46], twin: [50, 50],
}

const FALLBACK: EffectRecipe = ['orb', 'night', 'tr', 'glow', 'stars', 'float']

export default memo(function ProfileScene({ effect, active }: { effect: ProfileEffectInfo; active: boolean }) {
  const uid = useId().replace(/[^a-zA-Z0-9_-]/g, '')
  const identity = cosmeticIdentity(effect.id, effect.color)
  const recipe = EFFECT_RECIPES[effect.id] ?? FALLBACK
  const [hero, field, place, frame, ambient, motion] = recipe
  const [ref, live] = useLiveMotion<HTMLSpanElement>(active)
  const { palette, seed } = identity
  const variant = identity.collection?.variant ?? seed % 8
  const motionSeconds = MOTION_SECONDS[motion] + (seed % 5) * 0.22
  const [glowX, glowY] = PLACE_GLOW[place] ?? PLACE_GLOW.tr
  const echoSide = seed % 2 ? 'r' : 'l'
  const family = identity.collection?.family ?? effect.family ?? effect.animation
  const motif = identity.collection?.motif ?? effect.motif ?? hero
  const shape = identity.collection?.avatarShape ?? effect.shape ?? ''
  const scale = 0.96 + (seed % 7) * 0.022

  const style = {
    '--ps-primary': palette.primary,
    '--ps-secondary': palette.secondary,
    '--ps-highlight': palette.highlight,
    '--ps-spark': palette.spark,
    '--ps-deep': palette.deep,
    '--ps-shadow': palette.shadow,
    '--ps-tint': palette.tint,
    '--ps-motion-duration': `${motionSeconds.toFixed(2)}s`,
    '--ps-motion-fast': `${(motionSeconds * 0.74).toFixed(2)}s`,
    '--ps-hero-scale': scale.toFixed(3),
    '--ps-tilt': `${(seed % 15) - 7}deg`,
    '--ps-hero-delay': `${(-(seed % 53) / 10).toFixed(1)}s`,
    '--ps-glow-x': `${glowX}%`,
    '--ps-glow-y': `${glowY}%`,
    '--ps-frame-angle': `${seed % 360}deg`,
    '--ps-sheen-delay': `${(seed % 41) / 10}s`,
  } as CSSProperties & Record<`--ps-${string}`, string>

  const renderHeroArt = (instance: string) => {
    const artUid = `${uid}-${instance}`
    return <svg className="ps-hero-art" viewBox="0 0 100 100" aria-hidden="true">
    <defs>
      <linearGradient id={`${artUid}-hero-main`} x1=".12" y1="0" x2=".88" y2="1">
        <stop offset="0" stopColor={palette.highlight} />
        <stop offset=".34" stopColor={palette.primary} />
        <stop offset=".78" stopColor={palette.primary} />
        <stop offset="1" stopColor={palette.deep} />
      </linearGradient>
      <linearGradient id={`${artUid}-hero-light`} x1=".15" y1="0" x2=".8" y2="1">
        <stop offset="0" stopColor="#ffffff" stopOpacity=".96" />
        <stop offset=".42" stopColor={palette.highlight} />
        <stop offset="1" stopColor={palette.primary} />
      </linearGradient>
      <linearGradient id={`${artUid}-hero-accent`} x1="0" y1="0" x2="1" y2="1">
        <stop offset="0" stopColor={palette.spark} />
        <stop offset=".55" stopColor={palette.secondary} />
        <stop offset="1" stopColor={palette.primary} />
      </linearGradient>
      <linearGradient id={`${artUid}-hero-deep`} x1=".2" y1="0" x2=".8" y2="1">
        <stop offset="0" stopColor={palette.deep} />
        <stop offset="1" stopColor={palette.shadow} />
      </linearGradient>
      <linearGradient id={`${artUid}-hero-white`} x1="0" y1="0" x2=".8" y2="1">
        <stop offset="0" stopColor="#ffffff" />
        <stop offset="1" stopColor={palette.highlight} />
      </linearGradient>
      <linearGradient id={`${artUid}-hero-sheen`} x1="0" y1="0" x2="1" y2="0">
        <stop offset="0" stopColor="#ffffff" stopOpacity="0" />
        <stop offset=".38" stopColor="#ffffff" stopOpacity=".62" />
        <stop offset=".52" stopColor="#ffffff" stopOpacity=".9" />
        <stop offset=".64" stopColor="#ffffff" stopOpacity=".5" />
        <stop offset="1" stopColor="#ffffff" stopOpacity="0" />
      </linearGradient>
      <mask id={`${artUid}-hero-silhouette`} maskUnits="userSpaceOnUse" x="-10" y="-10" width="120" height="120">
        <g className="ps-static-mask"><HeroGlyph hero={hero} variant={variant} paint={{
          main: '#ffffff',
          light: '#ffffff',
          accent: '#ffffff',
          deep: '#ffffff',
          white: '#ffffff',
        }} /></g>
      </mask>
    </defs>
    <HeroGlyph hero={hero} variant={variant} paint={{
      main: `url(#${artUid}-hero-main)`,
      light: `url(#${artUid}-hero-light)`,
      accent: `url(#${artUid}-hero-accent)`,
      deep: `url(#${artUid}-hero-deep)`,
      white: `url(#${artUid}-hero-white)`,
    }} />
    <g className="ps-hero-sheen" mask={`url(#${artUid}-hero-silhouette)`}>
      <rect className="ps-sheen-bar" x="-58" y="-14" width="30" height="132" fill={`url(#${artUid}-hero-sheen)`} />
    </g>
  </svg>
  }

  return <span
    ref={ref}
    aria-hidden="true"
    data-profile-effect={effect.id}
    data-active={active}
    data-live={live}
    data-family={family}
    data-motion={motion}
    data-motif={motif}
    data-shape={shape}
    data-hero={hero}
    data-field={field}
    data-place={place}
    data-frame={frame}
    data-ambient={ambient}
    data-seed={seed % 4}
    className={`typelo-profile-effect-frame ps-scene profile-motion-${motion}`}
    style={style}
  >
    <span className="ps-wash" />
    <svg className="ps-field-art" viewBox="0 0 400 260" preserveAspectRatio="none" aria-hidden="true">
      <FieldArt field={field} palette={palette} seed={seed} uid={uid} />
    </svg>
    {place === 'twin'
      ? <>
        <span className="ps-hero ps-hero-twin ps-hero-twin-a"><span className="ps-hero-aura" />{renderHeroArt('twin-a')}</span>
        <span className="ps-hero ps-hero-twin ps-hero-twin-b"><span className="ps-hero-aura" />{renderHeroArt('twin-b')}</span>
      </>
      : place === 'center'
        ? <>
          <span className={`ps-hero ps-hero-center-echo ps-hero-center-echo-${echoSide}`}><span className="ps-hero-aura" />{renderHeroArt('center-echo')}</span>
          <span className="ps-hero ps-hero-center"><span className="ps-hero-aura" />{renderHeroArt('center')}</span>
        </>
        : <span className={`ps-hero ps-hero-${place}`}><span className="ps-hero-aura" />{renderHeroArt('main')}</span>}
    <span className="ps-light" />
    <span className="ps-scrim" />
    <AmbientField ambient={ambient} palette={palette} seed={seed} />
    <span className="ps-grain" />
    <span className="ps-vignette" />
    <SceneFrame frame={frame} seed={seed} rainbow={identity.rainbow} />
  </span>
})
