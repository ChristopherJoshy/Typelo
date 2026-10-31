import { renderToStaticMarkup } from 'react-dom/server'
import { expect, it } from 'vitest'
import AvatarDecoration from './AvatarDecoration'
import { PROFILE_BORDERS } from '../types'
import { BORDER_RECIPES } from '../effects/borderRecipes'

it('renders a distinct crest, ring and protected face for every border', () => {
  const signatures = Object.keys(PROFILE_BORDERS).map(id => {
    const html = renderToStaticMarkup(<AvatarDecoration decorationType={`border:${id}`} size={110} animate={false} />)
    expect(html, id).toContain('authored-avatar-border')
    expect(html).toContain('data-active="false"')
    expect(html).toContain('data-live="false"')
    expect(html).toContain(`data-motion="${BORDER_RECIPES[id][3]}"`)
    expect(html).toContain(`data-crest="${BORDER_RECIPES[id][0]}"`)
    expect(html).toContain(`data-ring="${BORDER_RECIPES[id][1]}"`)
    const playing = renderToStaticMarkup(<AvatarDecoration decorationType={`border:${id}`} size={60} animate />)
    expect(playing, `${id} did not enable motion`).toContain('data-live="true"')
    const container = document.createElement('div')
    container.innerHTML = html
    expect(container.querySelector('mask circle')?.getAttribute('r')).toBe('31')
    expect(container.querySelector('mask circle')?.getAttribute('fill')).toBe('black')
    const svg = container.querySelector('svg')
    expect(svg).not.toBeNull()
    return Array.from(svg!.querySelectorAll('path,circle,ellipse,rect')).map(node =>
      ['d', 'cx', 'cy', 'r', 'rx', 'ry', 'x', 'y', 'width', 'height', 'fill', 'stroke', 'stroke-dasharray'].map(key => node.getAttribute(key) ?? '').join('|'),
    ).join(';')
  })
  expect(signatures.length).toBe(Object.keys(PROFILE_BORDERS).length)
  const idsBySignature = new Map<string, string[]>()
  signatures.forEach((signature, index) => {
    const id = Object.keys(PROFILE_BORDERS)[index]
    idsBySignature.set(signature, [...(idsBySignature.get(signature) ?? []), id])
  })
  const duplicates = [...idsBySignature.values()].filter(ids => ids.length > 1)
  expect(duplicates, `Duplicate authored surrounds: ${duplicates.map(ids => ids.join(' / ')).join(', ')}`).toEqual([])

  const recipes = new Map<string, string[]>()
  Object.keys(PROFILE_BORDERS).forEach(id => {
    const signature = BORDER_RECIPES[id].join('|')
    recipes.set(signature, [...(recipes.get(signature) ?? []), id])
  })
  const clones = [...recipes.values()].filter(ids => ids.length > 1)
  expect(clones, `Borders share an identical recipe: ${clones.map(ids => ids.join(' / ')).join(', ')}`).toEqual([])
})
