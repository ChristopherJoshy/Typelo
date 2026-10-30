import { renderToStaticMarkup } from 'react-dom/server'
import { describe, expect, it } from 'vitest'
import ProfileEffectFrame from './ProfileEffectFrame'
import { PROFILE_EFFECTS } from '../types'

describe('profile effect rendering', () => {
  it('keeps the previous profile frame visible for every catalog effect', () => {
    for (const [id, effect] of Object.entries(PROFILE_EFFECTS)) {
      const markup = renderToStaticMarkup(<ProfileEffectFrame effect={effect} active={false} />)
      expect(markup, `Profile effect ${id} did not render`).toContain('typelo-profile-effect-frame')
      expect(markup).toContain(`data-profile-effect="${id}"`)
      expect(markup).toContain('cosmetic-sigil')
    }
  })

  it('toggles animation state without replacing the previous frame', () => {
    const effect = PROFILE_EFFECTS[Object.keys(PROFILE_EFFECTS)[0]]
    expect(renderToStaticMarkup(<ProfileEffectFrame effect={effect} active />)).toContain('data-active="true"')
    expect(renderToStaticMarkup(<ProfileEffectFrame effect={effect} active={false} />)).toContain('data-active="false"')
  })
})
