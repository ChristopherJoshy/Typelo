/** Small vector signatures shared by previews and equipped cosmetics. */
export default function CosmeticMotif({ kind }: { kind: string }) {
  switch (kind) {
    case 'pulse': return <path d="M2 12h5l3-8 4 16 3-8h5" />
    case 'spark': return <><path d="m12 1 2.5 8.5L23 12l-8.5 2.5L12 23l-2.5-8.5L1 12l8.5-2.5Z" /><circle cx="20" cy="3" r="1" fill="currentColor" /></>
    case 'wave': case 'aurora': case 'sway': return <><path d="M1 9q5-9 11 0t11 0M1 15q5-9 11 0t11 0" /><path d="M3 21q4-7 9-2t9-2" opacity=".4" /></>
    case 'fire': case 'firestorm': case 'phoenix': case 'flame': return <><path d="M12 2c2 7 9 8 8 14a8 8 0 0 1-16 0c0-4 3-7 5-9-1 5 1 6 3 7 3-4 1-7 0-12Z" /><path d="M12 13c-5 5-3 9 0 9s5-4 0-9Z" fill="currentColor" stroke="none" /></>
    case 'ice': case 'shatter': case 'frost': return <><path d="M12 1v22M2 6l20 12M2 18 22 6M8 3l4 4 4-4M8 21l4-4 4 4M2 10l6-1-1-6M22 14l-6 1 1 6" /></>
    case 'crystal': return <><path d="M12 2 21 9 17 22H7L3 9Z" /><path d="m3 9 9 4 9-4M12 13v9M8 3l4 10 4-10" /></>
    case 'lightning': case 'thunder': case 'electric': return <path d="m14 1-11 13h8l-1 9 11-14h-8Z" fill="currentColor" stroke="none" />
    case 'glitch': case 'pixels': case 'pixel': case 'matrix': case 'digital': return <><path d="M2 3h8v5H2zM14 10h8v4h-8zM5 18h13v3H5z" /><path d="M16 2v5M3 12v3M21 18v4" /></>
    case 'void': case 'warp': case 'quantum': case 'sphere': return <><ellipse cx="12" cy="12" rx="11" ry="4" transform="rotate(-25 12 12)" /><circle cx="12" cy="12" r="7" fill="#100d18" /><path d="M6 6a8 8 0 0 1 13 8" stroke="#e9d5ff" /></>
    case 'galaxy': case 'cosmic': case 'rift': return <><path d="M12 12c-7-4 1-13 7-6 8 11-11 20-16 7-4-12 15-17 20-7" /><path d="m12 7 1 4 4 1-4 1-1 4-1-4-4-1 4-1Z" fill="currentColor" /></>
    case 'rings': case 'bounce': case 'ripple': return <><ellipse cx="12" cy="16" rx="11" ry="5" /><ellipse cx="12" cy="12" rx="7" ry="3" /><circle cx="12" cy="5" r="2" fill="currentColor" /></>
    case 'round': case 'ring': return <><circle cx="12" cy="12" r="9" /><circle cx="12" cy="12" r="4" /><circle cx="21" cy="8" r="1.5" fill="currentColor" /></>
    case 'bead': case 'pearl': return <><path d="M3 18q9-15 18 0" />{[4, 8, 12, 16, 20].map((x, i) => <circle key={x} cx={x} cy={i === 2 ? 11 : 15} r={i === 2 ? 1.8 : 1.25} fill="currentColor" />)}</>
    case 'blade': case 'streak': return <><path d="M3 21C9 15 14 8 21 3c-2 8-8 14-18 18Z" /><path d="M5 19 18 6M8 17l-1-5M11 14l5 1" /></>
    case 'gem': return <><path d="M4 8 8 3h8l4 5-8 13Z" /><path d="M4 8h16M8 3l2 5 2 13 2-13 2-5" /></>
    case 'circuit': return <><path d="M3 5h6v5h6v5h6M5 19h5v-4M15 5h4v4" /><circle cx="3" cy="5" r="1.5" fill="currentColor" /><circle cx="21" cy="15" r="1.5" fill="currentColor" /><circle cx="19" cy="5" r="1.5" fill="currentColor" /></>
    case 'scan': return <><path d="M3 5h18M6 10h12M3 15h18M7 20h10" /><path d="M5 3v18M19 3v18" opacity=".45" /></>
    case 'split': return <><path d="m4 6 8 6-8 6M20 6l-8 6 8 6" /><path d="M12 3v18" /></>
    case 'taper': return <><path d="M12 2c2 6 7 9 7 13a7 7 0 0 1-14 0c0-4 5-7 7-13Z" /><path d="M9 16q1 3 4 2" /></>
    case 'leaf': case 'petal': case 'flower': case 'wisteria': return <><path d="M12 22V9M12 14C3 15 3 6 4 4c7 0 10 4 8 10ZM12 17c8 0 9-7 8-9-6 0-9 4-8 9Z" /><circle cx="12" cy="8" r="1.4" fill="currentColor" /></>
    case 'thorn': return <><path d="M12 22V3M12 8 6 5M12 13l7-4M12 18 5 15" /><path d="m6 5 3 1M19 9l-2 3M5 15l3 1" /></>
    case 'fern': case 'wheat': return <><path d="M12 22V3M12 7c-5 1-6-3-6-4 4 0 6 1 6 4ZM12 11c5 1 6-3 6-4-4 0-6 1-6 4ZM12 15c-5 1-6-3-6-4 4 0 6 1 6 4ZM12 19c5 1 6-3 6-4-4 0-6 1-6 4Z" /></>
    case 'sun': return <><circle cx="12" cy="12" r="5" /><path d="M12 1v4M12 19v4M1 12h4M19 12h4M4.2 4.2 7 7M17 17l2.8 2.8M19.8 4.2 17 7M7 17l-2.8 2.8" /></>
    case 'honeycomb': return <><path d="m12 2 8 5v10l-8 5-8-5V7Z" /><path d="m12 2 8 15M20 7 4 17M4 7l16 10M4 17 12 2" /></>
    case 'stitch': return <><path d="M4 5h4v4H4zM16 5h4v4h-4zM4 15h4v4H4zM16 15h4v4h-4z" /><path d="M8 7h8M8 17h8M6 9v6M18 9v6" /></>
    case 'glyph': return <><path d="M4 5h7v5H4zM13 14h7v5h-7z" /><path d="M8 10v4h8M16 7h2M6 18h2" /><circle cx="16.5" cy="7" r="1" fill="currentColor" /></>
    case 'confetti': return <><path d="m5 4 3 1-1 3-3-1ZM16 3h3v4h-3ZM4 15h4v4H4ZM15 14l4 1-1 4-4-1Z" /><path d="m11 2 1 2M12 20l1 2M21 10l2 1M2 10l2 1" /></>
    case 'heart': return <path d="M12 21S3 15 3 9a5 5 0 0 1 9-3 5 5 0 0 1 9 3c0 6-9 12-9 12Z" />
    case 'rotate': return <><path d="m12 1 3 8 8 3-8 3-3 8-3-8-8-3 8-3Z" /><path d="m12 5 1 6 6 1-6 1-1 6-1-6-6-1 6-1Z" fill="currentColor" /></>
    case 'smoke': case 'shadow': case 'fade': case 'mist': return <><path d="M3 19c-8-9 12-4 7-14M8 23C0 9 26 17 16 1M18 22c10-6-5-8 4-16" /></>
    case 'halo': case 'divine': case 'neon': return <><ellipse cx="12" cy="8" rx="10" ry="4" /><path d="M12 1v3M3 2l3 3M21 2l-3 3M6 15v5M12 14v9M18 15v5" /></>
    case 'float': return <><path d="M12 23V8M4 11l8-3 8 3M6 4l6 4 6-4M12 1v7" /><circle cx="4" cy="11" r="1.5" /><circle cx="20" cy="11" r="1.5" /><circle cx="6" cy="4" r="1.5" /><circle cx="18" cy="4" r="1.5" /></>
    case 'scale': case 'plasma': return <><ellipse cx="12" cy="12" rx="11" ry="5" /><ellipse cx="12" cy="12" rx="5" ry="11" /><circle cx="12" cy="12" r="2" fill="currentColor" /></>
    case 'glow': return <><path d="M17 2a10 10 0 1 0 5 15A10 10 0 0 1 17 2Z" /><path d="m18 6 1 3 3 1-3 1-1 3-1-3-3-1 3-1Z" fill="currentColor" /></>
    case 'shimmer': return <><path d="M12 2C9 8 4 12 4 16a8 8 0 0 0 16 0c0-4-5-8-8-14Z" /><path d="M8 14q-2 5 3 6" stroke="#fff" /></>
    default: return <><path d="m12 1 2.5 8.5L23 12l-8.5 2.5L12 23l-2.5-8.5L1 12l8.5-2.5Z" /><circle cx="20" cy="3" r="1" fill="currentColor" /></>
  }
}
