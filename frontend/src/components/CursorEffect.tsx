import { useEffect, useRef } from 'react'
import { getEffectVisual, type EffectFamily } from '../effects/visuals'

interface Particle {
  effectId: string
  family: EffectFamily
  x: number
  y: number
  originX: number
  originY: number
  vx: number
  vy: number
  gravity: number
  drag: number
  size: number
  growth: number
  age: number
  lifetime: number
  rotation: number
  spin: number
  orbitRadius: number
  orbitSpeed: number
  orbitAngle: number
  seed: number
  color: string
  glyph?: string
}

interface CursorEffectProps {
  effectId: string | null
}

const MAX_PARTICLES = 64
const PIXEL_RATIO_LIMIT = 1.5
const FRAME_BUDGET_MS = 34

export default function CursorEffect({ effectId }: CursorEffectProps) {
  const canvasRef = useRef<HTMLCanvasElement>(null)
  const pointerRef = useRef({ x: 0, y: 0, active: false })

  useEffect(() => {
    if (!effectId || effectId === 'none' || window.matchMedia('(prefers-reduced-motion: reduce)').matches) return

    const canvas = canvasRef.current
    const context = canvas?.getContext('2d', { alpha: true })
    if (!canvas || !context) return

    const visual = getEffectVisual(effectId)
    let frameId: number | null = null
    let particles: Particle[] = []
    let width = 0
    let height = 0
    let lastFrameAt = 0
    let lastSpawnAt = 0
    let lastX = pointerRef.current.x
    let lastY = pointerRef.current.y

    const tick = (time: number) => {
      frameId = null
      const elapsed = lastFrameAt ? Math.min(FRAME_BUDGET_MS, time - lastFrameAt) : 16.67
      lastFrameAt = time
      const pointer = pointerRef.current
      const dx = pointer.x - lastX
      const dy = pointer.y - lastY
      const distance = Math.hypot(dx, dy)

      if (pointer.active && distance > 2 && time - lastSpawnAt >= 14) {
        lastSpawnAt = time
        const count = Math.min(4, Math.max(1, Math.round(distance / 13)))
        for (let index = 1; index <= count; index++) {
          const progress = index / count
          const x = lastX + dx * progress
          const y = lastY + dy * progress
          particles.push(createParticle(effectId, visual, x, y, dx, dy))
        }
      }

      context.clearRect(0, 0, width, height)
      const alive: Particle[] = []
      for (const particle of particles) {
        updateParticle(particle, elapsed)
        if (particle.age < particle.lifetime) {
          drawParticle(context, particle)
          alive.push(particle)
        }
      }
      particles = alive.slice(-MAX_PARTICLES)
      lastX = pointer.x
      lastY = pointer.y

      if (particles.length > 0) frameId = requestAnimationFrame(tick)
    }

    const scheduleFrame = () => {
      if (frameId === null) frameId = requestAnimationFrame(tick)
    }

    const resize = () => {
      const ratio = Math.min(window.devicePixelRatio || 1, PIXEL_RATIO_LIMIT)
      width = window.innerWidth
      height = window.innerHeight
      canvas.width = Math.round(width * ratio)
      canvas.height = Math.round(height * ratio)
      canvas.style.width = `${width}px`
      canvas.style.height = `${height}px`
      context.setTransform(ratio, 0, 0, ratio, 0, 0)
      scheduleFrame()
    }

    const handlePointerMove = (event: PointerEvent) => {
      if (!pointerRef.current.active) {
        lastX = event.clientX
        lastY = event.clientY
      }
      pointerRef.current = { x: event.clientX, y: event.clientY, active: true }
      scheduleFrame()
    }

    const clearTrail = () => {
      pointerRef.current.active = false
      particles = []
      if (frameId !== null) cancelAnimationFrame(frameId)
      frameId = null
      context.clearRect(0, 0, width, height)
    }

    resize()
    window.addEventListener('pointermove', handlePointerMove, { passive: true })
    document.documentElement.addEventListener('pointerleave', clearTrail, { passive: true })
    document.addEventListener('visibilitychange', clearTrail)
    window.addEventListener('blur', clearTrail)
    window.addEventListener('resize', resize, { passive: true })

    return () => {
      if (frameId !== null) cancelAnimationFrame(frameId)
      window.removeEventListener('pointermove', handlePointerMove)
      document.documentElement.removeEventListener('pointerleave', clearTrail)
      document.removeEventListener('visibilitychange', clearTrail)
      window.removeEventListener('blur', clearTrail)
      window.removeEventListener('resize', resize)
      particles = []
      context.clearRect(0, 0, width, height)
    }
  }, [effectId])

  return (
    <canvas
      ref={canvasRef}
      aria-hidden="true"
      className="pointer-events-none fixed inset-0 z-[9999]"
      style={{ width: '100vw', height: '100dvh' }}
    />
  )
}

function createParticle(
  effectId: string,
  visual: ReturnType<typeof getEffectVisual>,
  x: number,
  y: number,
  dx: number,
  dy: number,
): Particle {
  const length = Math.max(1, Math.hypot(dx, dy))
  const backX = -dx / length
  const backY = -dy / length
  const palette = visual.palette
  const particle: Particle = {
    effectId,
    family: visual.family,
    x,
    y,
    originX: x,
    originY: y,
    vx: backX * 0.22 + (Math.random() - 0.5) * 0.45,
    vy: backY * 0.22 + (Math.random() - 0.5) * 0.45,
    gravity: 0,
    drag: 0.985,
    size: 3 + Math.random() * 2.2,
    growth: 0,
    age: 0,
    lifetime: 580,
    rotation: Math.atan2(dy, dx),
    spin: (Math.random() - 0.5) * 0.07,
    orbitRadius: 0,
    orbitSpeed: 0,
    orbitAngle: Math.random() * Math.PI * 2,
    seed: Math.random() * Math.PI * 2,
    color: palette[Math.floor(Math.random() * palette.length)] ?? visual.color,
    glyph: visual.glyph,
  }

  switch (visual.family) {
    case 'spark':
      particle.size = 2 + Math.random() * 2.5
      particle.lifetime = 500 + Math.random() * 260
      particle.vx += (Math.random() - 0.5) * 0.65
      particle.vy += (Math.random() - 0.5) * 0.65
      break
    case 'ripple':
      particle.size = 3 + Math.random() * 2
      particle.growth = 0.11
      particle.lifetime = 620 + Math.random() * 120
      particle.vx *= 0.15
      particle.vy *= 0.15
      break
    case 'petal':
      particle.size = 5 + Math.random() * 3
      particle.gravity = 0.009
      particle.spin = (Math.random() - 0.5) * 0.1
      particle.lifetime = 850 + Math.random() * 250
      particle.vy += 0.24
      break
    case 'frost':
      particle.size = 2.4 + Math.random() * 2
      particle.gravity = 0.004
      particle.spin = (Math.random() - 0.5) * 0.05
      particle.lifetime = 700 + Math.random() * 180
      break
    case 'heart':
      particle.size = 4 + Math.random() * 3
      particle.vy = -0.65 - Math.random() * 0.3
      particle.gravity = -0.002
      particle.lifetime = 600 + Math.random() * 140
      break
    case 'glyph':
      particle.size = 8 + Math.random() * 3
      particle.vy = -0.5 - Math.random() * 0.25
      particle.lifetime = 620 + Math.random() * 180
      if (effectId === 'matrix') particle.glyph = String.fromCharCode(0x30a0 + Math.floor(Math.random() * 96))
      break
    case 'streak':
      particle.size = 4 + Math.random() * 3
      particle.vx = backX * 1.5
      particle.vy = backY * 1.5
      particle.lifetime = 320 + Math.random() * 100
      break
    case 'mist':
      particle.size = 6 + Math.random() * 5
      particle.vy = -0.35 - Math.random() * 0.25
      particle.growth = 0.035
      particle.lifetime = effectId === 'spirit' ? 720 : 850 + Math.random() * 180
      break
    case 'flame':
      particle.size = 3 + Math.random() * 4
      particle.vy = -0.9 - Math.random() * 0.6
      particle.gravity = -0.005
      particle.spin = (Math.random() - 0.5) * 0.05
      particle.lifetime = effectId === 'dragon' ? 520 : 560 + Math.random() * 100
      break
    case 'electric':
      particle.size = 2.5 + Math.random() * 2
      particle.vx *= 0.25
      particle.vy *= 0.25
      particle.lifetime = 220 + Math.random() * 100
      break
    case 'digital':
      particle.size = 2.5 + Math.random() * 3
      particle.vx += (Math.random() - 0.5) * 1.4
      particle.vy += (Math.random() - 0.5) * 0.7
      particle.lifetime = 260 + Math.random() * 160
      particle.spin = 0
      break
    case 'plasma':
      particle.size = 4 + Math.random() * 4
      particle.growth = 0.018
      particle.lifetime = 520 + Math.random() * 180
      break
    case 'crystal':
      particle.size = 3 + Math.random() * 3
      particle.spin = (Math.random() - 0.5) * 0.13
      particle.lifetime = 760 + Math.random() * 180
      break
    case 'cosmic':
      particle.size = 2 + Math.random() * 2.4
      particle.orbitRadius = 3 + Math.random() * 5
      particle.orbitSpeed = 0.003 + Math.random() * 0.002
      particle.lifetime = 760 + Math.random() * 260
      break
    case 'void':
      particle.size = 4 + Math.random() * 4
      particle.orbitRadius = 2 + Math.random() * 3
      particle.orbitSpeed = 0.002 + Math.random() * 0.002
      particle.growth = 0.012
      particle.lifetime = 650 + Math.random() * 160
      break
    case 'confetti':
      particle.size = 2.5 + Math.random() * 3
      particle.vy = -0.15 + Math.random() * 0.55
      particle.gravity = 0.013
      particle.spin = (Math.random() - 0.5) * 0.18
      particle.lifetime = 720 + Math.random() * 240
      break
    case 'halo':
      particle.size = 2 + Math.random() * 2
      particle.vy = 0.45 + Math.random() * 0.25
      particle.lifetime = 700 + Math.random() * 220
      break
  }

  return particle
}

function updateParticle(particle: Particle, elapsedMs: number) {
  const frameScale = elapsedMs / 16.67
  particle.age += elapsedMs
  particle.x += particle.vx * frameScale
  particle.y += particle.vy * frameScale
  particle.vy += particle.gravity * frameScale
  particle.vx *= Math.pow(particle.drag, frameScale)
  particle.size += particle.growth * frameScale
  particle.rotation += particle.spin * frameScale

  if (particle.orbitRadius > 0) {
    const angle = particle.orbitAngle + particle.age * particle.orbitSpeed
    particle.x = particle.originX + Math.cos(angle) * particle.orbitRadius
    particle.y = particle.originY + Math.sin(angle) * particle.orbitRadius
  }
}

function drawParticle(context: CanvasRenderingContext2D, particle: Particle) {
  const progress = Math.min(1, particle.age / particle.lifetime)
  const fadeIn = Math.min(1, progress * 7)
  const fadeOut = Math.min(1, (1 - progress) * 3)
  const alpha = fadeIn * fadeOut
  const size = Math.max(0.8, particle.size * (0.8 + (1 - progress) * 0.25))
  const color = particle.color

  context.save()
  context.globalAlpha = alpha
  context.translate(particle.x, particle.y)
  context.rotate(particle.rotation)
  context.fillStyle = color
  context.strokeStyle = color
  context.lineCap = 'round'
  context.lineJoin = 'round'
  context.shadowColor = color
  context.shadowBlur = glowFor(particle.family, size)

  switch (particle.family) {
    case 'spark':
      drawStar(context, size, 4, 0.28)
      context.fillStyle = '#fff'
      context.globalAlpha *= 0.78
      context.beginPath()
      context.arc(0, 0, size * 0.15, 0, Math.PI * 2)
      context.fill()
      break
    case 'ripple':
      context.lineWidth = Math.max(0.7, 1.15 * (1 - progress * 0.5))
      context.globalAlpha *= 0.8
      context.beginPath()
      context.arc(0, 0, size * (0.45 + progress * 1.4), 0, Math.PI * 2)
      context.stroke()
      context.globalAlpha *= 0.55
      context.beginPath()
      context.arc(0, 0, size * (0.25 + progress * 0.9), 0, Math.PI * 2)
      context.stroke()
      break
    case 'petal':
      context.beginPath()
      context.ellipse(0, 0, size * 0.35, size, 0, 0, Math.PI * 2)
      context.fill()
      context.globalAlpha *= 0.45
      context.lineWidth = 0.6
      context.beginPath()
      context.moveTo(0, -size * 0.7)
      context.lineTo(0, size * 0.7)
      context.stroke()
      break
    case 'frost':
      drawSnowflake(context, size)
      break
    case 'heart':
      drawHeart(context, size)
      break
    case 'glyph':
      context.font = `500 ${size * 1.7}px ui-monospace, monospace`
      context.textAlign = 'center'
      context.textBaseline = 'middle'
      context.fillText(particle.glyph ?? '♪', 0, 0)
      break
    case 'streak':
      context.lineWidth = Math.max(1, size * 0.45)
      context.globalAlpha *= 0.78
      context.beginPath()
      context.moveTo(-size * 2.2, 0)
      context.lineTo(size * 1.2, 0)
      context.stroke()
      break
    case 'mist':
      drawSoftOrb(context, size, color)
      break
    case 'flame':
      drawFlame(context, size, progress, color)
      break
    case 'electric':
      drawLightning(context, particle, size)
      break
    case 'digital':
      drawDigital(context, particle, size)
      break
    case 'plasma':
      drawPlasma(context, size, color)
      break
    case 'crystal':
      drawCrystal(context, size)
      break
    case 'cosmic':
      drawStar(context, size, particle.effectId === 'supernova' ? 6 : 5, 0.42)
      context.globalAlpha *= 0.58
      context.lineWidth = Math.max(0.55, size * 0.13)
      context.beginPath()
      context.ellipse(0, 0, size * 1.6, size * 0.52, particle.rotation * 0.7, 0, Math.PI * 2)
      context.stroke()
      break
    case 'void':
      drawVoid(context, size, progress, color)
      break
    case 'confetti':
      context.globalAlpha *= 0.9
      context.fillRect(-size * 0.36, -size, size * 0.72, size * 2)
      break
    case 'halo':
      drawHalo(context, size, particle.seed)
      break
  }

  context.restore()
}

function glowFor(family: EffectFamily, size: number) {
  if (['spark', 'electric', 'plasma', 'cosmic', 'halo'].includes(family)) return Math.min(10, size * 1.2)
  if (['flame', 'void', 'crystal'].includes(family)) return Math.min(7, size * 0.7)
  return 0
}

function drawStar(context: CanvasRenderingContext2D, size: number, points: number, innerRatio: number) {
  context.beginPath()
  for (let index = 0; index < points * 2; index++) {
    const radius = index % 2 === 0 ? size : size * innerRatio
    const angle = -Math.PI / 2 + index * Math.PI / points
    const x = Math.cos(angle) * radius
    const y = Math.sin(angle) * radius
    if (index === 0) context.moveTo(x, y)
    else context.lineTo(x, y)
  }
  context.closePath()
  context.fill()
}

function drawSnowflake(context: CanvasRenderingContext2D, size: number) {
  context.lineWidth = Math.max(0.7, size * 0.16)
  for (let arm = 0; arm < 6; arm++) {
    context.save()
    context.rotate((arm * Math.PI) / 3)
    context.beginPath()
    context.moveTo(0, 0)
    context.lineTo(0, -size)
    context.moveTo(0, -size * 0.52)
    context.lineTo(-size * 0.28, -size * 0.78)
    context.moveTo(0, -size * 0.52)
    context.lineTo(size * 0.28, -size * 0.78)
    context.stroke()
    context.restore()
  }
}

function drawHeart(context: CanvasRenderingContext2D, size: number) {
  context.beginPath()
  context.moveTo(0, size * 0.8)
  context.bezierCurveTo(-size * 1.35, 0, -size * 0.95, -size, 0, -size * 0.48)
  context.bezierCurveTo(size * 0.95, -size, size * 1.35, 0, 0, size * 0.8)
  context.fill()
}

function drawSoftOrb(context: CanvasRenderingContext2D, size: number, color: string) {
  const gradient = context.createRadialGradient(0, 0, 0, 0, 0, size)
  gradient.addColorStop(0, rgba(color, 0.55))
  gradient.addColorStop(0.45, rgba(color, 0.2))
  gradient.addColorStop(1, rgba(color, 0))
  context.fillStyle = gradient
  context.beginPath()
  context.arc(0, 0, size, 0, Math.PI * 2)
  context.fill()
}

function drawFlame(context: CanvasRenderingContext2D, size: number, progress: number, color: string) {
  const gradient = context.createLinearGradient(0, -size, 0, size)
  gradient.addColorStop(0, rgba('#fff7ed', 0.82 * (1 - progress)))
  gradient.addColorStop(0.45, rgba(color, 0.9))
  gradient.addColorStop(1, rgba('#ef4444', 0.08))
  context.fillStyle = gradient
  context.beginPath()
  context.moveTo(0, -size)
  context.bezierCurveTo(size * 0.85, -size * 0.15, size * 0.55, size * 0.82, 0, size)
  context.bezierCurveTo(-size * 0.52, size * 0.45, -size * 0.92, -size * 0.08, 0, -size)
  context.fill()
}

function drawLightning(context: CanvasRenderingContext2D, particle: Particle, size: number) {
  context.beginPath()
  context.moveTo(-size * 0.65, -size)
  context.lineTo(size * (0.15 + Math.sin(particle.seed) * 0.18), -size * 0.25)
  context.lineTo(-size * 0.25, size * 0.05)
  context.lineTo(size * 0.68, size)
  context.strokeStyle = particle.color
  context.lineWidth = Math.max(0.8, size * 0.26)
  context.stroke()
  context.globalAlpha *= 0.82
  context.strokeStyle = '#fff'
  context.lineWidth = Math.max(0.45, size * 0.09)
  context.stroke()
}

function drawDigital(context: CanvasRenderingContext2D, particle: Particle, size: number) {
  if (particle.effectId === 'glitch') {
    context.globalAlpha *= 0.35
    context.fillStyle = '#22d3ee'
    context.fillRect(-size - 1.2, -size * 0.35, size * 1.6, size * 0.7)
    context.fillStyle = '#f472b6'
    context.fillRect(size * 0.1, -size * 0.35, size * 1.6, size * 0.7)
    context.globalAlpha *= 2
  }
  context.fillRect(-size * 0.45, -size * 0.45, size * 0.9, size * 0.9)
}

function drawPlasma(context: CanvasRenderingContext2D, size: number, color: string) {
  const gradient = context.createRadialGradient(0, 0, size * 0.1, 0, 0, size)
  gradient.addColorStop(0, rgba('#fff', 0.65))
  gradient.addColorStop(0.3, rgba(color, 0.58))
  gradient.addColorStop(1, rgba(color, 0))
  context.fillStyle = gradient
  context.beginPath()
  context.ellipse(0, 0, size, size * 0.72, 0, 0, Math.PI * 2)
  context.fill()
}

function drawCrystal(context: CanvasRenderingContext2D, size: number) {
  context.beginPath()
  context.moveTo(0, -size)
  context.lineTo(size * 0.7, -size * 0.1)
  context.lineTo(size * 0.38, size)
  context.lineTo(-size * 0.38, size)
  context.lineTo(-size * 0.7, -size * 0.1)
  context.closePath()
  context.fill()
  context.globalAlpha *= 0.7
  context.strokeStyle = '#fff'
  context.lineWidth = Math.max(0.45, size * 0.1)
  context.beginPath()
  context.moveTo(0, -size * 0.75)
  context.lineTo(0, size * 0.72)
  context.moveTo(-size * 0.55, -size * 0.1)
  context.lineTo(0, size * 0.18)
  context.lineTo(size * 0.55, -size * 0.1)
  context.stroke()
}

function drawVoid(context: CanvasRenderingContext2D, size: number, progress: number, color: string) {
  const radius = size * (0.45 + progress * 0.35)
  const gradient = context.createRadialGradient(0, 0, radius * 0.25, 0, 0, size)
  gradient.addColorStop(0, '#08050d')
  gradient.addColorStop(0.58, rgba(color, 0.75))
  gradient.addColorStop(1, rgba(color, 0))
  context.fillStyle = gradient
  context.beginPath()
  context.arc(0, 0, size, 0, Math.PI * 2)
  context.fill()
  context.globalAlpha *= 0.72
  context.lineWidth = Math.max(0.55, size * 0.12)
  context.beginPath()
  context.arc(0, 0, radius, 0, Math.PI * 2)
  context.stroke()
}

function drawHalo(context: CanvasRenderingContext2D, size: number, seed: number) {
  context.lineWidth = Math.max(0.55, size * 0.18)
  context.beginPath()
  context.ellipse(0, 0, size * 1.5, size * 0.55, seed, 0, Math.PI * 2)
  context.stroke()
  context.globalAlpha *= 0.45
  context.beginPath()
  context.moveTo(0, -size * 1.8)
  context.lineTo(0, size * 1.8)
  context.moveTo(-size * 1.1, 0)
  context.lineTo(size * 1.1, 0)
  context.stroke()
}

function rgba(color: string, alpha: number) {
  const hex = color.replace('#', '')
  const normalized = hex.length === 3 ? hex.split('').map(value => value + value).join('') : hex
  const value = Number.parseInt(normalized, 16)
  if (!Number.isFinite(value)) return `rgba(255,255,255,${alpha})`
  const red = (value >> 16) & 255
  const green = (value >> 8) & 255
  const blue = value & 255
  return `rgba(${red},${green},${blue},${alpha})`
}
