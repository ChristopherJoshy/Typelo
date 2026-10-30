/** Small vector signatures shared by previews and equipped cosmetics. */
export default function CosmeticMotif({ kind }: { kind: string }) {
  switch (kind) {
    case 'pulse': return <path d="M2 12h5l3-8 4 16 3-8h5" />
    case 'spark': return <><path d="m12 1 2.5 8.5L23 12l-8.5 2.5L12 23l-2.5-8.5L1 12l8.5-2.5Z" /><circle cx="20" cy="3" r="1" fill="currentColor" /></>
    case 'wave': case 'aurora': case 'sway': return <><path d="M1 9q5-9 11 0t11 0M1 15q5-9 11 0t11 0" /><path d="M3 21q4-7 9-2t9-2" opacity=".4" /></>
    case 'fire': case 'firestorm': case 'flame': return <><path d="M12 2c2 7 9 8 8 14a8 8 0 0 1-16 0c0-4 3-7 5-9-1 5 1 6 3 7 3-4 1-7 0-12Z" /><path d="M12 13c-5 5-3 9 0 9s5-4 0-9Z" fill="currentColor" stroke="none" /></>
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
    case 'shuriken': return <><path d="m12 1 2.2 7.2L22 4l-4.2 7.8L23 14l-7.4.1L18 22l-6-5.1L6 22l2.3-7.9L1 14l5.2-2.2L2 4l7.8 4.2Z" /><circle cx="12" cy="12" r="2.2" fill="currentColor" /></>
    case 'fox_mask': case 'fox': return <><path d="M4 9 3 2l7 4h4l7-4-1 7 1 7-9 6-9-6Z" /><path d="m6 11 4 1-2 3M18 11l-4 1 2 3M9 17l3 1 3-1M10 12l2 2 2-2" /></>
    case 'eye_sigil': case 'eye': return <><path d="M1.5 12s3.7-6 10.5-6 10.5 6 10.5 6-3.7 6-10.5 6S1.5 12 1.5 12Z" /><circle cx="12" cy="12" r="3.6" /><circle cx="12" cy="12" r="1.2" fill="currentColor" /><path d="m12 2 1.3 2.1M3 4l2 2M21 4l-2 2" opacity=".7" /></>
    case 'compass': return <><circle cx="12" cy="12" r="10" /><path d="m15.8 8.2-2.3 5.3-5.3 2.3 2.3-5.3Z" fill="currentColor" /><path d="M12 2v2M22 12h-2M12 22v-2M2 12h2" /></>
    case 'shockwave': return <><path d="M12 2v4M12 18v4M2 12h4M18 12h4M4.9 4.9l2.9 2.9m8.4 8.4 2.9 2.9M19.1 4.9l-2.9 2.9m-8.4 8.4-2.9 2.9" /><path d="m12 6 1.7 4.3L18 12l-4.3 1.7L12 18l-1.7-4.3L6 12l4.3-1.7Z" fill="currentColor" /></>
    case 'impact_fist': case 'one_punch_fist': return <><path d="M5 11V7a2 2 0 0 1 4 0v3-5a2 2 0 0 1 4 0v5-4a2 2 0 0 1 4 0v5-2a2 2 0 0 1 4 0v6l-3 6H9l-5-7v-2a2 2 0 0 1 1-1Z" /><path d="M9 11h9M2 5l2 2M20 2l-1 3M2 17l3-1" /></>
    case 'quill': return <><path d="M20 3C11 3 5 7 4 15c-.3 2.4 1.2 4 3.6 3.5C15 17 19 11 20 3Z" /><path d="M3 22c3-6 7-10 14-15M8 14l-1-4M12 10l-1-4" /><path d="m3 22 4-2" /></>
    case 'crescent_blade': return <><path d="M19 3A10 10 0 1 0 21 18 8 8 0 0 1 19 3Z" /><path d="m5 19 10-10M7 17l1 3M9 15l3 1" /></>
    case 'four_clover': case 'clover': return <><path d="M12 12C5 12 5 5 9 4c2-.5 3 1 3 4 0-3 1-4.5 3-4 4 1 4 8-3 8Zm0 0c0 7-7 7-8 3-.5-2 1-3 4-3-3 0-4.5-1-4-3 1-4 8-4 8 3Zm0 0c7 0 7 7 3 8-2 .5-3-1-3-4 0 3-1 4.5-3 4-4-1-4-8 3-8Z" /><path d="M12 12v10" /></>
    case 'anti_magic': return <><path d="M12 2v20M3 7l18 10M3 17 21 7" /><path d="m8 4 4 3 4-3M8 20l4-3 4 3M3 11l4 1-2 4M21 13l-4-1 2-4" /><circle cx="12" cy="12" r="2" fill="currentColor" /></>
    case 'sun_katana': return <><circle cx="7" cy="17" r="4" /><path d="M10 14 21 3l-1 6-8 8M4 18l-2 3 3-1M14 2v3M19 5l3 1" /></>
    case 'water_dragon': case 'azure_dragon': case 'dragon_vein': case 'dragon': return <><path d="M3 18c5-10 11-14 18-12-1 3-3 5-6 6 2 0 4-.5 6-2-1 7-8 12-16 10l4-3Z" /><path d="m14 8 2 2-2 2M17 6l3-3M8 7 6 4" /></>
    case 'spirit_mask': case 'phantom_mask': case 'mask_face': return <><path d="M4 5 12 2l8 3v9l-8 8-8-8Z" /><path d="m7 10 3 2-3 1M17 10l-3 2 3 1M9 16l3-2 3 2" /><path d="M12 3v3" /></>
    case 'cursed_seal': case 'demon_seal': return <><path d="M12 2 20 6v7c0 5-4 7-8 9-4-2-8-4-8-9V6Z" /><path d="m8 9 8 6M16 9l-8 6M12 5v14" /><circle cx="12" cy="12" r="2" fill="currentColor" /></>
    case 'shards': return <><path d="m12 2 4 8-2 12-6-4-1-9ZM3 5l4 4-1 8-4-4ZM20 3l2 8-4 5-1-7Z" /><path d="m8 11 6 1M9 18l5-8" /></>
    case 'alchemy_circle': return <><circle cx="12" cy="12" r="10" /><circle cx="12" cy="12" r="5" /><path d="M12 2 9 8l3 4 3-4ZM2 12l6 3 4-3 3 4M22 12l-6 3-4-3-3 4M12 22l3-6-3-4-3 4" /></>
    case 'star_crown': case 'champion_crown': return <><path d="m3 7 5 4 4-8 4 8 5-4-2 13H5Z" /><path d="M7 16h10M9 19h6" /><circle cx="12" cy="3" r="1.3" fill="currentColor" /></>
    case 'foxfire': return <><path d="M12 22c-5-4-2-8 1-11 0 3 2 3 2 5 3-3 2-8-1-13 8 6 10 14 4 18-2 1-4 1-6 1Z" /><path d="M4 8c-2 2-2 4 0 6M20 5l2 3" /></>
    case 'meridian': return <><circle cx="12" cy="12" r="9" /><path d="M12 3v18M3 12h18M6 6l12 12M18 6 6 18" /><circle cx="12" cy="12" r="2.5" fill="currentColor" /></>
    case 'sword_intent': case 'river_blade': case 'snow_sword': return <><path d="m4 20 15-16 2 2L5 21Z" /><path d="m5 15 4 4M11 12l4 1M14 9l4 1M17 6l4 1" /><path d="M2 22h5" /></>
    case 'plum_blossom': case 'immortal_lotus': return <><path d="M12 12C6 7 9 2 12 2s6 5 0 10Zm0 0c2-8 8-7 9-4s-1 7-9 4Zm0 0c8-1 9 5 6 8s-8 0-6-8Zm0 0c6 6 2 11-2 10s-5-5 2-10Zm0 0c-8 3-11-2-9-5s7-3 9 5Z" /><circle cx="12" cy="12" r="2" fill="currentColor" /></>
    case 'mountain_peak': case 'mountain_mist': return <><path d="m2 20 6-9 3 4 4-9 7 14Z" /><path d="m10 14 2-2 2 3M5 20q7-4 14 0" /></>
    case 'crane': return <><path d="M5 21c2-6 5-8 9-9-2-3-1-6 2-8 1 4 3 6 6 6-2 2-4 3-7 3l-3 8Z" /><path d="m17 5 4-2-2 4M6 14l-4-2" /></>
    case 'golden_core': return <><circle cx="12" cy="12" r="5" /><circle cx="12" cy="12" r="9" strokeDasharray="2 2" /><path d="M12 1v3M12 20v3M1 12h3M20 12h3M4 4l2 2M18 18l2 2M20 4l-2 2M6 18l-2 2" /><circle cx="12" cy="12" r="2" fill="currentColor" /></>
    case 'moon_gate': return <><path d="M5 21V9a7 7 0 0 1 14 0v12M3 21h18M8 21v-7h8v7" /><path d="M12 3a5 5 0 0 0 0 10 5 5 0 0 1 0-10Z" /></>
    case 'thunder_palm': return <><path d="M8 21v-7l-2-3-2-5a1.5 1.5 0 0 1 3-1l2 4V4a1.5 1.5 0 0 1 3 0v5-6a1.5 1.5 0 0 1 3 0v7l2-3a1.5 1.5 0 0 1 3 1l-2 7-3 6Z" /><path d="m3 2 2 2M20 2l-2 2M2 12h3M22 12h-3" /></>
    case 'lotus_seal': return <><path d="M12 21c-2-5-8-5-8-10 0-3 3-4 8 2 5-6 8-5 8-2 0 5-6 5-8 10ZM12 13V4M8 7l4 3 4-3" /><circle cx="12" cy="12" r="2" fill="currentColor" /></>
    case 'iron_guard': return <><path d="M12 2 21 6v7c0 5-4 8-9 9-5-1-9-4-9-9V6Z" /><path d="m7 12 3 3 7-7M12 3v5" /></>
    case 'tiger_face': case 'tiger': return <><path d="M4 8 3 3l6 3h6l6-3-1 5 1 8-9 6-9-6Z" /><path d="m7 11 3 1-2 2M17 11l-3 1 2 2M8 6l2 2M16 6l-2 2M9 18l3-2 3 2" /></>
    case 'qilin': return <><path d="M4 14c0-6 4-10 10-10 3 0 5 1 6 3l-4 1 4 2-4 2c-1 5-5 8-11 7l3-3Z" /><path d="M8 6 6 2M15 5l2-4M14 12h.1" /><circle cx="14" cy="12" r="1" fill="currentColor" /></>
    case 'ink_brush': return <><path d="m5 18 11-13 4 4L7 21l-5 1Z" /><path d="m14 7 4 4M4 18l3 3M3 10q4-2 6 1" /><path d="M18 16q3 1 4 4" /></>
    case 'bamboo': return <><path d="M8 2v20M16 2v20M6 7h4M14 13h4M6 18h4M13 5h5" /><path d="M8 9c-4-2-5-5-5-6 4 0 6 2 5 6ZM16 15c4-2 5-5 5-6-4 0-6 2-5 6Z" /></>
    case 'talisman': return <><path d="M6 2h12v20H6z" /><path d="M9 6h6M12 6v12M9 11l3 2 3-2M9 17h6" /><circle cx="12" cy="4" r="1" fill="currentColor" /></>
    case 'cloudstep': return <><path d="M4 17a4 4 0 0 1 1-8 7 7 0 0 1 13 2 3 3 0 1 1 1 6Z" /><path d="M4 21q4-3 8 0t8 0M7 5q2-3 5-2" /></>
    case 'phoenix': return <><path d="M12 22c-6-2-8-7-6-12l4 4c-1-6 1-10 2-12 1 5 5 8 7 11 2 4-1 8-7 9Z" /><path d="M12 17c-2-3 0-5 1-7 2 3 4 5 2 7-1 1-2 1-3 0Z" fill="currentColor" /></>
    case 'oni_mask': case 'oni': return <><path d="M5 7 2 2l7 3h6l7-3-3 5 1 8-8 7-8-7Z" /><path d="m7 10 3 2-3 2M17 10l-3 2 3 2M9 17l3-2 3 2M4 8 2 6M20 8l2-2" /></>
    case 'skull_face': case 'skull': return <><path d="M5 14a7 7 0 1 1 14 0c0 3-2 4-3 5v3h-3v-3h-2v3H8v-3c-1-1-3-2-3-5Z" /><circle cx="9" cy="12" r="2" /><circle cx="15" cy="12" r="2" /><path d="m12 14-1 2h2ZM10 19v2M14 19v2" /></>
    case 'ghost': return <><path d="M5 20v-9a7 7 0 0 1 14 0v9l-4-2-3 3-3-3Z" /><circle cx="9" cy="11" r="1.2" fill="currentColor" /><circle cx="15" cy="11" r="1.2" fill="currentColor" /><path d="M10 15q2 2 4 0" /></>
    case 'lion_face': case 'lion': return <><path d="m12 2 3 3 5-1 1 5 2 4-3 4-1 5-6-1-6 1-1-5-3-4 2-4 1-5 5 1Z" /><path d="m7 10 3 1-2 2M17 10l-3 1 2 2M9 17l3-2 3 2M12 13v2" /></>
    case 'sutra': return <><path d="M4 4h16v16H4zM8 8h8M8 12h8M8 16h5" /><path d="M2 7V2h5M22 17v5h-5M2 17v5h5M22 7V2h-5" /></>
    case 'mecha_helm': case 'android': return <><path d="M5 5 12 2l7 3v12l-7 5-7-5Z" /><path d="M7 9h10l-1 5-4 2-4-2ZM9 11h2M14 11h2M12 16v3M3 10l2 2M21 10l-2 2" /></>
    case 'infernal_crown': case 'demon': return <><path d="M4 9 2 3l7 4 3-6 3 6 7-4-2 6 1 11H5Z" /><path d="m8 13 2 2M16 13l-2 2M9 18h6" /></>
    default: return <><path d="m12 1 2.5 8.5L23 12l-8.5 2.5L12 23l-2.5-8.5L1 12l8.5-2.5Z" /><circle cx="20" cy="3" r="1" fill="currentColor" /></>
  }
}
