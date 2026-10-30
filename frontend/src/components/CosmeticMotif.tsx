/** Small vector signatures shared by previews and equipped cosmetics. */
export default function CosmeticMotif({ kind }: { kind: string }) {
  switch (kind) {
    case 'pulse': return <path d="M2 12h5l3-8 4 16 3-8h5" />
    case 'wave': case 'aurora': case 'sway': return <><path d="M1 9q5-9 11 0t11 0M1 15q5-9 11 0t11 0" /><path d="M3 21q4-7 9-2t9-2" opacity=".4" /></>
    case 'fire': case 'firestorm': case 'phoenix': return <><path d="M12 2c2 7 9 8 8 14a8 8 0 0 1-16 0c0-4 3-7 5-9-1 5 1 6 3 7 3-4 1-7 0-12Z" /><path d="M12 13c-5 5-3 9 0 9s5-4 0-9Z" fill="currentColor" stroke="none" /></>
    case 'ice': case 'shatter': return <><path d="M12 1v22M2 6l20 12M2 18 22 6M8 3l4 4 4-4M8 21l4-4 4 4M2 10l6-1-1-6M22 14l-6 1 1 6" /></>
    case 'lightning': case 'thunder': return <path d="m14 1-11 13h8l-1 9 11-14h-8Z" fill="currentColor" stroke="none" />
    case 'glitch': case 'pixels': case 'matrix': return <><path d="M2 3h8v5H2zM14 10h8v4h-8zM5 18h13v3H5z" /><path d="M16 2v5M3 12v3M21 18v4" /></>
    case 'void': case 'warp': case 'quantum': case 'sphere': return <><ellipse cx="12" cy="12" rx="11" ry="4" transform="rotate(-25 12 12)" /><circle cx="12" cy="12" r="7" fill="#100d18" /><path d="M6 6a8 8 0 0 1 13 8" stroke="#e9d5ff" /></>
    case 'galaxy': case 'cosmic': case 'rift': return <><path d="M12 12c-7-4 1-13 7-6 8 11-11 20-16 7-4-12 15-17 20-7" /><path d="m12 7 1 4 4 1-4 1-1 4-1-4-4-1 4-1Z" fill="currentColor" /></>
    case 'rings': case 'bounce': return <><ellipse cx="12" cy="16" rx="11" ry="5" /><ellipse cx="12" cy="12" rx="7" ry="3" /><circle cx="12" cy="5" r="2" fill="currentColor" /></>
    case 'rotate': return <><path d="m12 1 3 8 8 3-8 3-3 8-3-8-8-3 8-3Z" /><path d="m12 5 1 6 6 1-6 1-1 6-1-6-6-1 6-1Z" fill="currentColor" /></>
    case 'smoke': case 'shadow': case 'fade': return <><path d="M3 19c-8-9 12-4 7-14M8 23C0 9 26 17 16 1M18 22c10-6-5-8 4-16" /></>
    case 'halo': case 'divine': case 'neon': return <><ellipse cx="12" cy="8" rx="10" ry="4" /><path d="M12 1v3M3 2l3 3M21 2l-3 3M6 15v5M12 14v9M18 15v5" /></>
    case 'float': return <><path d="M12 23V8M4 11l8-3 8 3M6 4l6 4 6-4M12 1v7" /><circle cx="4" cy="11" r="1.5" /><circle cx="20" cy="11" r="1.5" /><circle cx="6" cy="4" r="1.5" /><circle cx="18" cy="4" r="1.5" /></>
    case 'scale': case 'plasma': return <><ellipse cx="12" cy="12" rx="11" ry="5" /><ellipse cx="12" cy="12" rx="5" ry="11" /><circle cx="12" cy="12" r="2" fill="currentColor" /></>
    case 'glow': return <><path d="M17 2a10 10 0 1 0 5 15A10 10 0 0 1 17 2Z" /><path d="m18 6 1 3 3 1-3 1-1 3-1-3-3-1 3-1Z" fill="currentColor" /></>
    case 'shimmer': return <><path d="M12 2C9 8 4 12 4 16a8 8 0 0 0 16 0c0-4-5-8-8-14Z" /><path d="M8 14q-2 5 3 6" stroke="#fff" /></>
    default: return <><path d="m12 1 2.5 8.5L23 12l-8.5 2.5L12 23l-2.5-8.5L1 12l8.5-2.5Z" /><circle cx="20" cy="3" r="1" fill="currentColor" /></>
  }
}
