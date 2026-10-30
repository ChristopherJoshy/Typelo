import { renderToStaticMarkup } from 'react-dom/server'
import { expect, it } from 'vitest'
import ProfileEffectFrame from './ProfileEffectFrame'
import { PROFILE_SCENE_ART } from './ProfileSceneArt'
import { PROFILE_EFFECTS } from '../types'

it('renders authored scenes for every profile-effect ID without literal geometry duplicates', () => {
  for (const id of Object.keys(PROFILE_EFFECTS)) {
    expect(PROFILE_SCENE_ART[id], `Missing original scene: ${id}`).toBeDefined()
  }
  const signatures = Object.keys(PROFILE_SCENE_ART).map(id => {
    const html = renderToStaticMarkup(<ProfileEffectFrame effect={PROFILE_EFFECTS[id]} active={false} />)
    expect(html).toContain('authored-profile-scene')
    expect(html).not.toContain('cosmetic-sigil')
    const container = document.createElement('div')
    container.innerHTML = html
    return Array.from(container.querySelectorAll('path,circle,ellipse')).map(node =>
      ['d','cx','cy','r','rx','ry'].map(key => node.getAttribute(key) ?? '').join('|')
    ).join(';')
  })
  expect(new Set(signatures).size).toBe(signatures.length)
})

import { act, render } from '@testing-library/react'
import { vi } from 'vitest'

it('splits tall illustrations into clipped proportional layers and releases resize observation', () => {
  let notify: ResizeObserverCallback = () => undefined
  const disconnect = vi.fn()
  const unobserve = vi.fn()
  class Observer {
    constructor(callback: ResizeObserverCallback) { notify = callback }
    observe = vi.fn()
    unobserve = unobserve
    disconnect = disconnect
  }
  vi.stubGlobal('ResizeObserver', Observer)
  try {
    const { container, unmount } = render(<ProfileEffectFrame effect={PROFILE_EFFECTS.moonstone} active />)
    const scene = container.querySelector('.authored-profile-scene')!
    act(() => notify([{ target: scene, contentRect: { width: 320, height: 680 } } as ResizeObserverEntry], {} as ResizeObserver))
    expect(scene.getAttribute('data-layout')).toBe('split')
    expect(scene.querySelectorAll('svg:not(.scene-paint-defs)')).toHaveLength(2)
    expect(scene.querySelector('.scene-top clipPath rect')?.getAttribute('height')).toBe('130')
    expect(scene.querySelector('.scene-bottom clipPath rect')?.getAttribute('y')).toBe('130')
    const clips = [...scene.querySelectorAll('clipPath')].map(node => node.id)
    expect(new Set(clips).size).toBe(2)
    expect(scene.querySelectorAll('g[clip-path]')).toHaveLength(2)
    unmount()
    expect(unobserve).toHaveBeenCalledWith(scene)
    expect(disconnect).toHaveBeenCalled()
  } finally { vi.unstubAllGlobals() }
})
