import { renderToStaticMarkup } from 'react-dom/server'
import { expect, it } from 'vitest'
import { TRAIL_ART } from './trailArt'
import { EFFECTS } from '../types'
import EffectPreview from '../components/EffectPreview'

it('covers every trail with original two-layer geometry and static preview support',()=>{
 expect(Object.keys(TRAIL_ART).sort()).toEqual(Object.keys(EFFECTS).sort())
 const signatures=Object.entries(TRAIL_ART).map(([id,art])=>{
  expect(art.shape,id).toMatch(/^[Mm]/)
  expect(art.detail,id).toMatch(/^[Mm]/)
  const html=renderToStaticMarkup(<EffectPreview effectId={id} color={EFFECTS[id].color} active={false}/>)
  expect(html).toContain('data-active="false"')
  expect(html).toContain(`data-trail-art="${id}"`)
  return art.shape+'|'+art.detail
 })
 expect(new Set(signatures).size).toBe(signatures.length)
})
