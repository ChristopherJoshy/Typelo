import CosmeticMotif from './CosmeticMotif'
import { CURSORS } from '../types'
import { AUTHORED_CURSORS } from './CursorArtwork'

/** Face crest for expressive high-rarity caret skins, outside the caret clip path. */
export default function CursorAdornment({ cursorId }: { cursorId: string }) {
  const cursor = CURSORS[cursorId]
  if (AUTHORED_CURSORS.has(cursorId) || !cursor?.face) return null

  const symbol = cursor.face
  return <span className="typing-cursor-adornment" data-cursor-adornment={cursorId} data-motion={cursor.motion ?? ''} aria-hidden="true"
    style={{ color: cursor.color === 'rainbow' ? '#f472b6' : cursor.glow, filter: `drop-shadow(0 0 5px ${cursor.glow})` }}>
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.35" strokeLinecap="round" strokeLinejoin="round">
      <CosmeticMotif kind={symbol} />
    </svg>
  </span>
}
