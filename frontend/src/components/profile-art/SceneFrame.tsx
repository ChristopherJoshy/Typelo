import type { CSSProperties } from 'react'
import type { FrameKey } from '../../effects/effectRecipes'

interface SceneFrameProps {
  frame: FrameKey
  seed: number
  rainbow: boolean
}

export default function SceneFrame({ frame, seed, rainbow }: SceneFrameProps) {
  const ticks = frame === 'runes' ? 8 : frame === 'thread' ? 4 : 0
  return <span className={`ps-frame ps-frame-${frame}${rainbow ? ' is-rainbow' : ''}`} data-frame={frame} data-seed={seed % 4}>
    {Array.from({ length: ticks }, (_, index) => <i key={index} className="ps-frame-tick" style={{ '--ps-tick': index } as CSSProperties & Record<'--ps-tick', number>} />)}
    <i className="ps-frame-light" />
  </span>
}
