import { renderToStaticMarkup } from 'react-dom/server'
import { describe, expect, it } from 'vitest'
import ProfileEffectFrame from './ProfileEffectFrame'
import { PROFILE_EFFECTS } from '../types'
import { EFFECT_RECIPES } from '../effects/effectRecipes'

describe('profile effect rendering', () => {
  it('paints a complete authored scene for every catalog effect', () => {
    for (const [id, effect] of Object.entries(PROFILE_EFFECTS)) {
      const markup = renderToStaticMarkup(<ProfileEffectFrame effect={effect} active={false} />)
      expect(markup, `Profile effect ${id} did not render`).toContain('typelo-profile-effect-frame')
      expect(markup).toContain(`data-profile-effect="${id}"`)
      expect(markup).toContain('ps-scene')
      expect(markup).toContain('ps-hero')
      expect(markup).toContain('ps-ambient')
      expect(markup).toContain('ps-frame')
      expect(markup).toContain(`data-hero="${EFFECT_RECIPES[id][0]}"`)
      expect(markup).toContain(`data-field="${EFFECT_RECIPES[id][1]}"`)
      expect(markup).toContain(`data-motion="${EFFECT_RECIPES[id][5]}"`)

      const playing = renderToStaticMarkup(<ProfileEffectFrame effect={effect} active />)
      expect(playing, `Profile effect ${id} did not enable motion`).toContain('data-live="true"')
    }
  })

  it('keeps every effect visually distinct', () => {
    const scenes = Object.values(PROFILE_EFFECTS).map(effect => renderToStaticMarkup(<ProfileEffectFrame effect={effect} active={false} />))
    expect(new Set(scenes).size).toBe(scenes.length)

    const recipes = new Map<string, string[]>()
    Object.values(PROFILE_EFFECTS).forEach(effect => {
      const signature = EFFECT_RECIPES[effect.id].join('|')
      recipes.set(signature, [...(recipes.get(signature) ?? []), effect.id])
    })
    const clones = [...recipes.values()].filter(ids => ids.length > 1)
    expect(clones, `Effects share an identical recipe: ${clones.map(ids => ids.join(' / ')).join(', ')}`).toEqual([])
  })

  it('toggles animation state without replacing the scene', () => {
    const effect = PROFILE_EFFECTS[Object.keys(PROFILE_EFFECTS)[0]]
    const running = renderToStaticMarkup(<ProfileEffectFrame effect={effect} active />)
    const paused = renderToStaticMarkup(<ProfileEffectFrame effect={effect} active={false} />)
    expect(running).toContain('data-active="true"')
    expect(paused).toContain('data-active="false"')
    expect(paused).toContain('data-live="false"')
  })
})
