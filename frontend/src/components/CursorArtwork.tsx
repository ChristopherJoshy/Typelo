import { useId, type CSSProperties } from 'react'
import { getCursorPresentation, visibleCursorInk } from '../effects/cursors'
import { ORIGINAL_CURSOR_ART } from './OriginalCursorArt'
import { COLLECTION_CURSOR_ART } from './CollectionCursorArt'
import { THEMED_CURSOR_ART } from './ThemedCursorArt'

// Authored silhouettes. Every entry has its own composition, not a colored bar.
export const AUTHORED_CURSORS = new Set(['default', 'ocean', 'forest', 'crimson', 'mint', 'sky', 'steel', 'coral', 'sunset', 'lavender', 'peach', 'sapphire', 'chakra_tempest', 'nine_tail_ember', 'grand_line_compass', 'death_note_inkfall', 'anti_magic_cross', 'conqueror_haki'])

for (const id of [...Object.keys(ORIGINAL_CURSOR_ART), ...Object.keys(COLLECTION_CURSOR_ART), ...Object.keys(THEMED_CURSOR_ART)]) AUTHORED_CURSORS.add(id)

export function getCursorBodyStyle(id: string): CSSProperties {
  return AUTHORED_CURSORS.has(id) ? { background: 'transparent', clipPath: 'none', border: 0, boxShadow: 'none', borderRadius: 0 } : {}
}

export default function CursorArtwork({ id, active = true }: { id: string; active?: boolean }) {
  const uid = useId().replace(/:/g, '')
  if (!AUTHORED_CURSORS.has(id)) return null
  const p = getCursorPresentation(id)
  let art = ORIGINAL_CURSOR_ART[id] ?? COLLECTION_CURSOR_ART[id] ?? THEMED_CURSOR_ART[id]
  switch (id) {
    case 'default': art = <><path d="M18 5h-5v38h5" strokeWidth="2.3" /><path d="M13 24h5" stroke="#fff" /></>; break
    case 'ocean': art = <><path d="M15 3c-13 10 13 18 0 29-5 5-5 9 0 13" className="cursor-draw" strokeWidth="2.5" /><path d="M20 7c-8 6 8 14 0 23" opacity=".5" /><g className="cursor-swim"><path d="M10 23q-8-8-6-12 9 0 10 9l5-2-2 7Z" fill="var(--skin-accent)" stroke="none" /><circle cx="9" cy="17" r=".8" fill="#08151d" /></g></>; break
    case 'forest': art = <><path d="M16 46V12" strokeWidth="2" /><g className="cursor-grow"><path d="M16 25C1 27 2 12 3 9c11 0 16 7 13 16Z" fill="var(--skin-fill)" fillOpacity=".5" /><path d="M16 33c14 0 15-12 14-16-10 0-15 7-14 16Z" fill="var(--skin-accent)" fillOpacity=".5" /><path d="m5 13 11 12 11-5" /></g><path d="M11 46h10" opacity=".6" /></>; break
    case 'crimson': art = <><path d="m16 1 4 7-2 26h-4L12 8Z" fill="var(--skin-fill)" /><path d="M16 5v27" stroke="#fff" /><path d="m8 34 8-3 8 3-2 3-6-2-6 2ZM14 36h4v9h-4Z" fill="var(--skin-accent)" /><path d="m7 17 18-7M8 27l16-9" className="cursor-slash" opacity=".65" /></>; break
    case 'mint': art = <><path d="M10 3h12v31l-6 9-6-9Z" fill="var(--skin-fill)" fillOpacity=".12" /><path d="M13 8h6v5h-6Zm0 10h6v5h-6Zm0 10h6v5h-6Z" fill="var(--skin-accent)" className="cursor-signal" /><path d="M5 11H2v11h5M27 26h3v10h-5M16 43v4" /></>; break
    case 'sky': art = <><path d="M15 45C9 27 12 8 26 2c4 19-2 30-12 31" fill="var(--skin-fill)" fillOpacity=".18" /><g className="cursor-feather"><path d="M15 42 25 5M13 18l8 4M13 26l6 3M19 12l4 2M23 15l5-5M21 23l8-7" /></g><path d="M3 39q4-4 8-1M1 43h9" opacity=".5" /></>; break
    case 'steel': art = <><path d="M9 3h5v42H9ZM18 3h5v42h-5Z" fill="#536270" /><path d="M12 7v34M21 7v34" stroke="#e2e8f0" /><path d="M5 13h22v7H5Z" fill="var(--skin-accent)" className="cursor-caliper" /><path d="M7 45h18M7 3h18" /></>; break
    case 'coral': art = <><path d="M16 45V17M16 31 7 24V9M16 27l9-8V4M16 39 4 32v-9M16 34l12-6v-6" strokeWidth="2.8" /><g className="cursor-anemone" fill="var(--skin-accent)" stroke="none"><circle cx="7" cy="9" r="3"/><circle cx="25" cy="4" r="3"/><circle cx="4" cy="23" r="2.5"/><circle cx="28" cy="22" r="2.5"/><circle cx="16" cy="17" r="3"/></g></>; break
    case 'sunset': art = <><path d="M8 3h16v8L17 24l7 13v8H8v-8l7-13-7-13Z" fill="var(--skin-fill)" fillOpacity=".15" /><path d="M10 39h12l-6-12Z" fill="var(--skin-accent)" /><path d="m10 8 6 12 6-12Z" fill="var(--skin-fill)" className="cursor-sand" /><path d="M16 23v10" strokeDasharray="1 2" className="cursor-signal" /><path d="M5 3h22M5 45h22" strokeWidth="2.5" /></>; break
    case 'lavender': art = <><path d="M16 46V7" /><g className="cursor-bells" fill="var(--skin-fill)" fillOpacity=".5"><path d="M16 10C4 2 0 14 4 18l8-2ZM16 23c13-7 17 5 11 9l-7-3ZM16 35C4 27 1 39 5 42l8-2Z" /></g><path d="m9 5 7-4 6 4" stroke="var(--skin-accent)" /></>; break
    case 'peach': art = <><path d="M16 12v32M13 8l3 4 3-4" /><g className="cursor-wings" fill="var(--skin-fill)" fillOpacity=".6"><path d="M15 23C-3 1-3 30 11 28-1 38 11 44 15 30ZM17 23C35 1 35 30 21 28c12 10 0 16-4 2Z" /></g><circle cx="16" cy="25" r="2" fill="#fff" /></>; break
    case 'sapphire': art = <><path d="m16 2 10 13-10 30L6 15Z" fill="var(--skin-fill)" fillOpacity=".35" /><path d="M6 15h20L16 2l-4 13 4 30 4-30Z" /><path d="m9 13 7-7 7 7" stroke="#fff" className="cursor-glint" /><path d="m2 29 3-2M27 33l3 2" stroke="var(--skin-accent)" /></>; break
    case 'chakra_tempest': art = <><path d="M16 28v17" strokeWidth="2" /><g className="cursor-vortex"><path d="M16 25C-4 21 7-3 25 8c18 18-15 33-20 12C2 6 25 4 25 18c-1 13-19 10-17 0 1-9 14-8 14 0-1 7-10 6-10 0" strokeWidth="1.8" /><path d="M2 13 7 3M27 23l3-11M10 32l10-2" stroke="var(--skin-accent)" /></g><circle cx="16" cy="17" r="3" fill="#fff" /></>; break
    case 'nine_tail_ember': art = <><g className="cursor-tails" fill="var(--skin-fill)" fillOpacity=".45"><path d="M12 27C-5 24 2 7 1 2c14 9 4 17 15 20C8 8 15 3 16 0c9 12-2 14 4 24C33 20 22 8 31 2c2 15 5 25-11 29Z" /></g><path d="m8 17 1-8 7 5 7-5 1 8-2 14-6 5-6-5Z" fill="#1d1117" /><path d="m10 21 4 2-2 3M22 21l-4 2 2 3M14 29h4M16 36v9" stroke="var(--skin-accent)" strokeWidth="1.8" /></>; break
    case 'grand_line_compass': art = <><path d="M16 31v14M9 44h14" /><circle cx="16" cy="17" r="12" /><circle cx="16" cy="17" r="9" strokeDasharray="1 3" /><g className="cursor-needle"><path d="m16 4 3 13-3 13-3-13Z" fill="var(--skin-fill)"/><path d="m4 17 12-3 12 3-12 3Z" fill="var(--skin-accent)" /></g><path d="M16 1v4M0 17h4M28 17h4" /></>; break
    case 'death_note_inkfall': art = <><path d="M5 5h19v29H5Z" fill="#19171f" /><path d="M8 5v29M11 11h9M11 15h7M11 19h8" stroke="var(--skin-accent)" /><path d="M24 2C12 4 8 15 13 23 24 19 27 9 24 2ZM11 29 22 7" fill="var(--skin-fill)" fillOpacity=".25" /><path d="M16 35v5" /><path d="M16 41c-6 6 6 6 0 0" fill="var(--skin-fill)" className="cursor-ink" /></>; break
    case 'anti_magic_cross': art = <><path d="m13 2 10 7-4 25-8-2L8 11Z" fill="#211e29" strokeWidth="2" /><path d="m14 5 3 6-4 5 6 4-7 7" stroke="var(--skin-color)" className="cursor-crack" /><path d="m5 34 20 3M13 36l-1 10" stroke="var(--skin-accent)" strokeWidth="3" /><path d="m2 13 4 9-3 7M27 14l3 11-4 6" className="cursor-crack" /></>; break
    case 'conqueror_haki': art = <><path d="M16 1 9 15l7-3-5 15 8-5-5 25 11-27-7 3 5-17-7 7Z" fill="var(--skin-fill)" stroke="#fff" strokeWidth=".6" /><g className="cursor-crack"><path d="m8 12-7-6 3 12M25 29l6 9-5-1M7 34l-5 5M25 4l5-3" stroke="var(--skin-accent)" strokeWidth="1.7" /></g></>; break
  }
  return <svg className="cursor-authored-art" data-art={id} data-animated={active} viewBox="0 0 32 48" fill="none" stroke={`url(#cursor-paint-${uid})`} strokeWidth="1.2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true" style={{ '--skin-color': p.color === 'rainbow' ? '#fb7185' : visibleCursorInk(p.color), '--skin-accent': visibleCursorInk(p.accent), '--skin-fill': `url(#cursor-fill-${uid})` } as CSSProperties}><defs><linearGradient id={`cursor-paint-${uid}`} gradientUnits="userSpaceOnUse" x1="0" y1="0" x2="32" y2="48"><stop stopColor="var(--skin-color)"/><stop offset=".5" stopColor="var(--skin-accent)"/><stop offset=".72" stopColor="#fff4df"/><stop offset="1" stopColor="var(--skin-color)"/></linearGradient><radialGradient id={`cursor-fill-${uid}`} cx=".3" cy=".2" r=".9"><stop stopColor="#fff4df"/><stop offset=".35" stopColor="var(--skin-accent)"/><stop offset="1" stopColor="var(--skin-color)"/></radialGradient></defs>{art}</svg>
}
