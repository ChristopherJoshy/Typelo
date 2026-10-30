import { renderToStaticMarkup } from 'react-dom/server'
import { describe, expect, it } from 'vitest'
import CursorArtwork, { AUTHORED_CURSORS } from './CursorArtwork'
import CursorCosmeticPreview from './CursorCosmeticPreview'
import { CURSORS } from '../types'

function geometry(markup: string) {
  const container = document.createElement('div')
  container.innerHTML = markup
  const svg = container.querySelector('svg')
  expect(svg).not.toBeNull()
  return Array.from(svg!.querySelectorAll('path,circle,ellipse,rect,line,polygon')).map(node => {
    const attributes = ['d', 'cx', 'cy', 'r', 'rx', 'ry', 'x', 'y', 'width', 'height', 'points', 'x1', 'x2', 'y1', 'y2']
    return [node.tagName, ...attributes.map(key => node.getAttribute(key) ?? '')].join('|')
  }).join(';')
}

describe('authored cursor coverage', () => {
  it('covers every cursor ownership ID and does not duplicate geometry across the authored batch', () => {
    for (const id of Object.keys(CURSORS)) {
      expect(AUTHORED_CURSORS.has(id), `Cursor ${id} has no authored body`).toBe(true)
    }
    const signatures = [...AUTHORED_CURSORS].map(id => {
      const body = geometry(renderToStaticMarkup(<CursorArtwork id={id} active={false} />))
      expect(body.length).toBeGreaterThan(0)
      expect(renderToStaticMarkup(<CursorCosmeticPreview id={id} />)).toContain(`data-art="${id}"`)
      return body
    })
    // Detects literal art duplication; visual quality still requires browser review.
    expect(new Set(signatures).size).toBe(AUTHORED_CURSORS.size)
  })
})
