import { useEffect, useLayoutEffect, useRef, type RefObject } from 'react'
import { createPortal } from 'react-dom'
import { getEffectVisual } from '../effects/visuals'
import { drawAuthoredTail, drawTrailStamp } from '../effects/trailRenderer'
import { TRAIL_ART } from '../effects/trailArt'

interface Particle {
 effectId:string; x:number; y:number; vx:number; vy:number; gravity:number;
 size:number; age:number; lifetime:number; rotation:number
}

interface TrailPoint { x: number; y: number; at: number }

interface CursorEffectProps {
  effectId: string | null
  targetRef?: RefObject<HTMLElement>
  caret?: 'player' | 'opponent'
  progress?: string | number
}

const MAX_PARTICLES = 72
const MAX_TRAIL_POINTS = 42
const PIXEL_RATIO_LIMIT = 1.5
const FRAME_BUDGET_MS = 34

export default function CursorEffect({ effectId, targetRef, caret, progress }: CursorEffectProps) {
  const canvasRef = useRef<HTMLCanvasElement>(null)
  const pointerRef = useRef({ x: 0, y: 0, active: false })

  const wakeRef = useRef<(() => void) | null>(null)
  const movingUntilRef = useRef(0)
  useLayoutEffect(() => {
    movingUntilRef.current = performance.now() + 240
    wakeRef.current?.()
  }, [progress])

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
    let trailPoints: TrailPoint[] = []
    let lastFrameAt = 0
    let lastSpawnAt = 0
    let lastX = pointerRef.current.x
    let lastY = pointerRef.current.y

    const tick = (time: number) => {
      frameId = null
      if (document.hidden) return
      // Limit painting to 30fps; caret movement itself stays at native UI speed.
      if (lastFrameAt && time - lastFrameAt < 30) { frameId = requestAnimationFrame(tick); return }
      const elapsed = lastFrameAt ? Math.min(FRAME_BUDGET_MS, time - lastFrameAt) : 16.67
      lastFrameAt = time
      const surface = targetRef?.current?.getBoundingClientRect()
      if (targetRef) {
        const element = targetRef.current?.querySelector<HTMLElement>(`[data-caret="${caret}"]`)
        const rect = element?.getBoundingClientRect()
        if (rect && surface) {
          const x = rect.left - surface.left
          const y = rect.bottom - 3 - surface.top
          if (!pointerRef.current.active) { lastX = x; lastY = y }
          pointerRef.current = { x, y, active: true }
        } else pointerRef.current.active = false
      }
      const pointer = pointerRef.current
      const dx = pointer.x - lastX
      const dy = pointer.y - lastY
      const distance = Math.hypot(dx, dy)
      // A line wrap or remote resync must not draw a diagonal across the passage.
      const wrapped = Boolean(targetRef && (Math.abs(dy) > 24 || distance > width * .65))
      if (wrapped) { trailPoints = []; particles = [] }

      if (pointer.active && !wrapped && distance > 2 && time - lastSpawnAt >= 22) {
        lastSpawnAt = time
        const count = Math.min(4, Math.max(1, Math.round(distance / 13)))
        for (let index = 1; index <= count; index++) {
          const progress = index / count
          const x = lastX + dx * progress
          const y = lastY + dy * progress
          particles.push(createParticle(effectId, visual, x, y, dx, dy))
        }
      }

      context.globalCompositeOperation = 'source-over'
      context.globalAlpha = 1
      context.clearRect(0, 0, width, height)
      context.save()
      const trailPoint = trailPoints[trailPoints.length - 1]
      if (pointer.active && (!trailPoint || Math.hypot(pointer.x - trailPoint.x, pointer.y - trailPoint.y) > 0.7)) {
        trailPoints.push({ x: pointer.x, y: pointer.y, at: time })
      }
      const trailLifetime = targetRef ? 4200 : 950
      trailPoints = trailPoints.filter(point => time - point.at < trailLifetime).slice(-MAX_TRAIL_POINTS)
      drawAuthoredTail(context, trailPoints, time, visual, effectId, trailLifetime)
      const alive: Particle[] = []
      for (const particle of particles) {
        updateParticle(particle, elapsed)
        if (particle.age < particle.lifetime) {
          drawParticle(context, particle, visual)
          alive.push(particle)
        }
      }
      context.restore()
      particles = alive.slice(-MAX_PARTICLES)
      lastX = pointer.x
      lastY = pointer.y

      if (particles.length > 0 || trailPoints.length > 1 || (targetRef && time < movingUntilRef.current)) frameId = requestAnimationFrame(tick)
    }

    const scheduleFrame = () => {
      if (frameId === null && !document.hidden) frameId = requestAnimationFrame(tick)
    }

    const resize = () => {
      const ratio = Math.min(window.devicePixelRatio || 1, PIXEL_RATIO_LIMIT)
      const surface = targetRef?.current?.getBoundingClientRect()
      const nextWidth = surface?.width ?? window.innerWidth
      const nextHeight = surface?.height ?? window.innerHeight
      const pixelWidth = Math.max(1, Math.round(nextWidth * ratio))
      const pixelHeight = Math.max(1, Math.round(nextHeight * ratio))
      if (canvas.width !== pixelWidth || canvas.height !== pixelHeight) {
        canvas.width = pixelWidth
        canvas.height = pixelHeight
        particles = []
        trailPoints = []
        lastFrameAt = 0
      }
      width = nextWidth
      height = nextHeight
      canvas.style.width = `${width}px`
      canvas.style.height = `${height}px`
      if (surface) {
        canvas.style.inset = 'auto'
        canvas.style.left = `${surface.left}px`
        canvas.style.top = `${surface.top}px`
      } else {
        canvas.style.inset = '0'
        canvas.style.left = '0'
        canvas.style.top = '0'
      }
      context.setTransform(ratio, 0, 0, ratio, 0, 0)
      context.globalCompositeOperation = 'source-over'
      context.globalAlpha = 1
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
      trailPoints = []
      lastX = 0
      lastY = 0
      lastFrameAt = 0
      lastSpawnAt = 0
      if (frameId !== null) cancelAnimationFrame(frameId)
      frameId = null
      context.clearRect(0, 0, width, height)
    }

    wakeRef.current = scheduleFrame
    resize()
    const resizeObserver = targetRef?.current ? new ResizeObserver(resize) : null
    if (targetRef?.current) resizeObserver?.observe(targetRef.current)
    if (!targetRef) window.addEventListener('pointermove', handlePointerMove, { passive: true })
    if (targetRef) window.addEventListener('scroll', resize, { passive: true, capture: true })
    document.documentElement.addEventListener('pointerleave', clearTrail, { passive: true })
    document.addEventListener('visibilitychange', clearTrail)
    window.addEventListener('blur', clearTrail)
    window.addEventListener('resize', resize, { passive: true })

    return () => {
      if (frameId !== null) cancelAnimationFrame(frameId)
      window.removeEventListener('pointermove', handlePointerMove)
      window.removeEventListener('scroll', resize, true)
      document.documentElement.removeEventListener('pointerleave', clearTrail)
      document.removeEventListener('visibilitychange', clearTrail)
      window.removeEventListener('blur', clearTrail)
      window.removeEventListener('resize', resize)
      resizeObserver?.disconnect()
      wakeRef.current = null
      particles = []
      trailPoints = []
      pointerRef.current.active = false
      context.clearRect(0, 0, width, height)
    }
  }, [effectId, targetRef, caret])

  const canvas = (
    <canvas
      ref={canvasRef}
      aria-hidden="true"
      data-trail={caret ?? 'pointer'}
      className="pointer-events-none fixed inset-0 block max-w-none"
      style={{ width: '100vw', height: '100dvh', zIndex: targetRef ? 120 : 50, background: 'transparent', mixBlendMode: 'normal' }}
    />
  )
  // Keep the drawing surface outside transformed application layers. Fixed canvases inside
  // a filtered/animated ancestor can become a viewport-sized opaque slab in some browsers.
  return createPortal(canvas, document.body)
}

function createParticle(effectId:string, _visual:ReturnType<typeof getEffectVisual>, x:number,y:number,dx:number,dy:number):Particle {
 const art=TRAIL_ART[effectId]
 const length=Math.max(1,Math.hypot(dx,dy))
 const drift=art?.drift ?? 'float'
 return {
  effectId,x,y,age:0,size:(art?.size ?? 7)*(.7+Math.random()*.3),
  vx:-dx/length*(drift==='shoot'?1.1:.2)+(Math.random()-.5)*.2,
  vy:drift==='rise'?-.5:drift==='flutter'?.25:drift==='float'?-.15:-dy/length*.2,
  gravity:drift==='flutter'?.004:0,
  lifetime:drift==='shoot'?450:850,
  rotation:drift==='shoot'?Math.atan2(dy,dx):Math.random()*.4-.2,
 }
}
function updateParticle(particle:Particle,elapsedMs:number) {
 const frameScale=elapsedMs/16.67
 particle.age+=elapsedMs
 particle.x+=particle.vx*frameScale
 particle.y+=particle.vy*frameScale
 particle.vy+=particle.gravity*frameScale
 particle.vx*=Math.pow(.985,frameScale)
}
function drawParticle(context:CanvasRenderingContext2D,particle:Particle,visual:ReturnType<typeof getEffectVisual>) {
 const progress=Math.min(1,particle.age/particle.lifetime)
 drawTrailStamp(context,particle.effectId,visual,particle.x,particle.y,particle.size,particle.rotation,Math.min(1,progress*7)*Math.min(1,(1-progress)*3),particle.age)
}
