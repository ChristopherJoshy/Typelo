import { renderToStaticMarkup } from 'react-dom/server'
import { expect, it } from 'vitest'
import AvatarDecoration from './AvatarDecoration'
import { AVATAR_BORDER_ART } from './AvatarBorderArt'
import { PROFILE_BORDERS } from '../types'

it('renders distinct authored surrounds with protected face openings and static thumbnail support', () => {
 const signatures = Object.keys(AVATAR_BORDER_ART).map(id => {
  const html = renderToStaticMarkup(<AvatarDecoration decorationType={`border:${id}`} size={110} animate={false}/>)
  expect(html, id).toContain('authored-avatar-border')
  expect(html).toContain('data-active="false"')
  const container = document.createElement('div')
  container.innerHTML = html
  expect(container.querySelector('mask circle')?.getAttribute('r')).toBe('31')
  expect(container.querySelector('mask circle')?.getAttribute('fill')).toBe('black')
  return Array.from(container.querySelector('svg > g')!.querySelectorAll('path,circle,ellipse')).map(node =>
   ['d','cx','cy','r','rx','ry'].map(key=>node.getAttribute(key)??'').join('|')).join(';')
 })
 expect(Object.keys(AVATAR_BORDER_ART).sort()).toEqual(Object.keys(PROFILE_BORDERS).sort())
 expect(new Set(signatures).size).toBe(signatures.length)
})
