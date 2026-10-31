/** Small colour helpers for cosmetic artwork. Kept dependency-free and render-safe. */

export function parseHex(hex: string): [number, number, number] {
  const value = hex.replace('#', '')
  const full = value.length === 3 ? value.split('').map(char => char + char).join('') : value.slice(0, 6)
  const numeric = Number.parseInt(full, 16)
  return [(numeric >> 16) & 255, (numeric >> 8) & 255, numeric & 255]
}

export function toHex([r, g, b]: [number, number, number]) {
  return `#${[r, g, b].map(channel => Math.max(0, Math.min(255, Math.round(channel))).toString(16).padStart(2, '0')).join('')}`
}

export function mixColor(from: string, to: string, amount: number) {
  const a = parseHex(from)
  const b = parseHex(to)
  return toHex([a[0] + (b[0] - a[0]) * amount, a[1] + (b[1] - a[1]) * amount, a[2] + (b[2] - a[2]) * amount])
}

export function alphaColor(hex: string, alpha: number) {
  const [r, g, b] = parseHex(hex)
  return `rgba(${r}, ${g}, ${b}, ${Math.max(0, Math.min(1, alpha))})`
}

export function hueShift(hex: string, degrees: number) {
  const [r, g, b] = parseHex(hex).map(channel => channel / 255)
  const max = Math.max(r, g, b)
  const min = Math.min(r, g, b)
  const lightness = (max + min) / 2
  const delta = max - min
  let hue = 0
  if (delta !== 0) {
    if (max === r) hue = ((g - b) / delta) % 6
    else if (max === g) hue = (b - r) / delta + 2
    else hue = (r - g) / delta + 4
    hue = (hue * 60 + degrees + 360) % 360
  }
  const saturation = delta === 0 ? 0 : delta / (1 - Math.abs(2 * lightness - 1))
  const chroma = (1 - Math.abs(2 * lightness - 1)) * saturation
  const x = chroma * (1 - Math.abs((hue / 60) % 2 - 1))
  const m = lightness - chroma / 2
  const sector = Math.floor(hue / 60) % 6
  const rgb: [number, number, number][] = [
    [chroma, x, 0], [x, chroma, 0], [0, chroma, x],
    [0, x, chroma], [x, 0, chroma], [chroma, 0, x],
  ]
  const [rr, gg, bb] = rgb[sector]
  return toHex([(rr + m) * 255, (gg + m) * 255, (bb + m) * 255])
}

export function cosmeticPalette(primary: string, accent: string, seed: number) {
  const base = primary === 'rainbow'
    ? ['#fb7185', '#fbbf24', '#34d399', '#38bdf8', '#a78bfa', '#f472b6'][seed % 6]
    : primary
  const second = accent && accent !== 'rainbow' ? accent : hueShift(base, 48)
  return {
    primary: base,
    secondary: second,
    highlight: mixColor(base, '#ffffff', 0.55),
    spark: mixColor(second, '#ffffff', 0.42),
    deep: mixColor(base, '#07060d', 0.68),
    shadow: mixColor(second, '#07060d', 0.76),
    tint: mixColor(base, second, 0.4),
  }
}

export type CosmeticPalette = ReturnType<typeof cosmeticPalette>
