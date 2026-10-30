import type { CSSProperties } from 'react'
import CosmeticMotif from './CosmeticMotif'
import { getCursorPresentation, getCursorStyle } from '../effects/cursors'

interface CursorCosmeticPreviewProps {
  id: string
  active?: boolean
  typedText?: string
  caretName?: string
  live?: boolean
}

/** A shared cursor sample: the inventory tile and the typing test use the same caret skin. */
export default function CursorCosmeticPreview({
  id,
  active = false,
  typedText = 'Aa',
  caretName,
  live = false,
}: CursorCosmeticPreviewProps) {
  const presentation = getCursorPresentation(id)
  const cursorStyle = getCursorStyle(id)
  const caretWidth = typeof cursorStyle.width === 'number' ? cursorStyle.width : 3
  const cssVars = {
    '--cursor-accent': presentation.accent,
    '--cursor-motion': presentation.motion,
    '--cursor-duration': `${3.2 + (id.length % 5) * 0.35}s`,
    '--cursor-width': `${caretWidth}px`,
  } as CSSProperties

  return <span
    className={`cosmetic-cursor-sample ${live ? 'is-live' : ''}`}
    data-cursor-id={id}
    data-family={presentation.family}
    data-motion={presentation.motion}
    data-active={active}
    style={cssVars}
    aria-hidden="true"
  >
    {!live && <span className="cosmetic-cursor-word">{typedText || '\u00a0'}</span>}
    <span className="cosmetic-cursor-caret-wrap">
      <span
        className="cosmetic-cursor-caret"
        data-caret={caretName}
        style={{ ...cursorStyle, height: live ? 22 : 34 }}
      />
      {!live && <svg className="cosmetic-cursor-sigil" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.25" strokeLinecap="round" strokeLinejoin="round">
        <CosmeticMotif kind={presentation.family} />
      </svg>}
    </span>
    {!live && <span className="cosmetic-cursor-caption">CURSOR SKIN</span>}
  </span>
}
