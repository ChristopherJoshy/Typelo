/*   ______      __ ____  _______       _  ____  _   _ 
 *  |  ____|   / / __ \|__   __|/\   | |/ __ \| \ | |
 *  | |__   _ / / |  | |  | |  /  \  | | |  | |  \| |
 *  |  __| | v /| |  | |  | | / /\ \ | | |  | | . ` |
 *  | |____ \ / | |__| |  | |/ ____ \| | |__| | |\  |
 *  |______| \_/ \____/   |_/_/    \_\_|\____/|_| \_|
 *                                                      
 */

/**
 * CursorEffect.tsx - Visual effects that follow the mouse cursor.
 * Supports 36 unique trail effects across all rarity tiers.
 * 
 * --------------------------------------------------------------------------
 *                                  Functions
 * --------------------------------------------------------------------------
 * CursorEffect: Main component observing mouse movement and rendering particles.
 * createParticle: Creates a new particle based on effect type.
 * updateParticle: Updates particle physics based on effect type.
 * getTransform: Returns CSS transform for particle based on effect.
 * getFilter: Returns CSS filter for particle visual effects.
 * getGlow: Returns CSS box-shadow for particle glow.
 * getParticleShape: Returns CSS properties for non-circular particle shapes.
 * 
 * --------------------------------------------------------------------------
 *                            Variables and others
 * --------------------------------------------------------------------------
 * Particle: Interface for particle state.
 * MAX_PARTICLES: Limit on concurrent particles for performance.
 * SPAWN_RATE: Milliseconds between particle spawning.
 * 
 * --------------------------------------------------------------------------
 *                                   Imports
 * --------------------------------------------------------------------------
 * react: useEffect, useRef
 * EFFECTS: Effect definitions from types
 */

import { useEffect, useRef } from 'react'
import { EFFECTS } from '../types'

interface Particle {
    x: number
    y: number
    vx: number
    vy: number
    color: string
    size: number
    createdAt: number
    life: number
    rotation?: number
    shape?: string
    char?: string
}
interface CursorEffectProps {
    effectId: string | null
}

const MAX_PARTICLES = 120
const SPAWN_RATE = 10

export default function CursorEffect({ effectId }: CursorEffectProps) {
    const canvasRef = useRef<HTMLCanvasElement>(null)
    const pointerRef = useRef({ x: 0, y: 0, active: false })

    useEffect(() => {
        if (!effectId || effectId === 'none' || !EFFECTS[effectId] ||
            window.matchMedia('(prefers-reduced-motion: reduce)').matches) return

        const canvas = canvasRef.current
        const context = canvas?.getContext('2d', { alpha: true })
        if (!canvas || !context) return

        let frameId: number | null = null
        let particles: Particle[] = []
        let lastSpawnAt = 0
        let lastX = pointerRef.current.x
        let lastY = pointerRef.current.y
        let width = 0
        let height = 0

        const tick = (time: number) => {
            frameId = null
            const pointer = pointerRef.current
            const dx = pointer.x - lastX
            const dy = pointer.y - lastY
            const distance = Math.hypot(dx, dy)

            if (pointer.active && distance > 1 && time - lastSpawnAt >= SPAWN_RATE) {
                lastSpawnAt = time
                const count = Math.min(12, Math.max(1, Math.ceil(distance / 5)))
                for (let index = 1; index <= count; index++) {
                    const amount = index / count
                    particles.push(createParticle(
                        effectId,
                        lastX + dx * amount,
                        lastY + dy * amount,
                        dx,
                        dy,
                    ))
                }
            }

            particles = particles
                .map(particle => updateParticle(particle, effectId))
                .filter(particle => particle.life > 0)
                .slice(-MAX_PARTICLES)

            context.clearRect(0, 0, width, height)
            for (const particle of particles) drawParticle(context, particle, effectId)

            lastX = pointer.x
            lastY = pointer.y
            if (particles.length > 0) frameId = requestAnimationFrame(tick)
        }

        const scheduleFrame = () => {
            if (frameId === null) frameId = requestAnimationFrame(tick)
        }

        const resize = () => {
            const dpr = Math.min(window.devicePixelRatio || 1, 2)
            width = window.innerWidth
            height = window.innerHeight
            canvas.width = Math.round(width * dpr)
            canvas.height = Math.round(height * dpr)
            canvas.style.width = `${width}px`
            canvas.style.height = `${height}px`
            context.setTransform(dpr, 0, 0, dpr, 0, 0)
            scheduleFrame()
        }

        const handlePointerMove = (event: PointerEvent) => {
            const wasActive = pointerRef.current.active
            pointerRef.current = { x: event.clientX, y: event.clientY, active: true }
            if (!wasActive) {
                lastX = event.clientX
                lastY = event.clientY
            }
            scheduleFrame()
        }
        const handlePointerLeave = () => { pointerRef.current.active = false }

        resize()
        window.addEventListener('pointermove', handlePointerMove, { passive: true })
        document.documentElement.addEventListener('pointerleave', handlePointerLeave, { passive: true })
        window.addEventListener('blur', handlePointerLeave)
        window.addEventListener('resize', resize, { passive: true })
        return () => {
            if (frameId !== null) cancelAnimationFrame(frameId)
            window.removeEventListener('pointermove', handlePointerMove)
            document.documentElement.removeEventListener('pointerleave', handlePointerLeave)
            window.removeEventListener('blur', handlePointerLeave)
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

function drawParticle(context: CanvasRenderingContext2D, particle: Particle, type: string) {
    const size = Math.max(1, particle.size)
    const radius = size / 2
    context.save()
    context.globalAlpha = Math.max(0, Math.min(1, particle.life))
    context.translate(particle.x, particle.y)
    context.rotate(((particle.rotation || 0) * Math.PI) / 180)
    context.fillStyle = particle.color
    context.strokeStyle = particle.color
    context.lineWidth = Math.max(1, size * 0.14)
    context.shadowColor = particle.color
    context.shadowBlur = ['sparkle', 'fire', 'electric', 'thunder', 'neon', 'supernova', 'divine_light', 'cyberpunk', 'plasma_trail'].includes(type)
        ? Math.min(16, size * 1.4)
        : 0

    if (particle.char) {
        context.font = `700 ${size}px ui-monospace, monospace`
        context.textAlign = 'center'
        context.textBaseline = 'middle'
        context.fillText(particle.char, 0, 0)
        context.restore()
        return
    }

    switch (particle.shape) {
        case 'square':
            context.fillRect(-radius, -radius, size, size)
            break
        case 'diamond':
        case 'crystal':
            context.beginPath()
            context.moveTo(0, -radius)
            context.lineTo(radius * 0.72, 0)
            context.lineTo(0, radius)
            context.lineTo(-radius * 0.72, 0)
            context.closePath()
            context.fill()
            break
        case 'star': {
            context.beginPath()
            for (let point = 0; point < 10; point++) {
                const angle = -Math.PI / 2 + (point * Math.PI) / 5
                const pointRadius = point % 2 === 0 ? radius : radius * 0.45
                const x = Math.cos(angle) * pointRadius
                const y = Math.sin(angle) * pointRadius
                if (point === 0) context.moveTo(x, y)
                else context.lineTo(x, y)
            }
            context.closePath()
            context.fill()
            break
        }
        case 'leaf':
        case 'petal':
            context.beginPath()
            context.ellipse(0, 0, radius * 0.62, radius, 0, 0, Math.PI * 2)
            context.fill()
            break
        case 'heart':
            context.beginPath()
            context.moveTo(0, radius * 0.85)
            context.bezierCurveTo(-radius * 1.5, -radius * 0.05, -radius * 0.85, -radius, 0, -radius * 0.42)
            context.bezierCurveTo(radius * 0.85, -radius, radius * 1.5, -radius * 0.05, 0, radius * 0.85)
            context.fill()
            break
        case 'tear':
            context.beginPath()
            context.moveTo(0, -radius)
            context.bezierCurveTo(radius * 0.9, -radius * 0.05, radius * 0.75, radius, 0, radius)
            context.bezierCurveTo(-radius * 0.75, radius, -radius * 0.9, -radius * 0.05, 0, -radius)
            context.fill()
            break
        case 'ghost':
            context.beginPath()
            context.arc(0, -radius * 0.12, radius * 0.72, Math.PI, 0)
            context.lineTo(radius * 0.72, radius * 0.7)
            context.lineTo(radius * 0.3, radius * 0.45)
            context.lineTo(0, radius * 0.72)
            context.lineTo(-radius * 0.3, radius * 0.45)
            context.lineTo(-radius * 0.72, radius * 0.7)
            context.closePath()
            context.fill()
            break
        default:
            if (type === 'ripple' || type === 'bubble') {
                context.beginPath()
                context.arc(0, 0, radius, 0, Math.PI * 2)
                context.stroke()
            } else {
                context.beginPath()
                context.arc(0, 0, radius, 0, Math.PI * 2)
                context.fill()
            }
    }
    context.restore()
}

function createParticle(type: string, x: number, y: number, dx: number, dy: number): Particle {
    // For trails: particles should stay mostly stationary where spawned
    const spread = 0.5  // Reduced from 1 for tighter trails
    let vx = (Math.random() - 0.5) * spread
    let vy = (Math.random() - 0.5) * spread
    let size = 12 // Increased base size from 8 (was 6)
    let color = '#fff'
    let life = 1.2 // Increased base life from 1
    let shape = 'circle'
    let char: string | undefined = undefined
    let rotation = 0

    switch (type) {
        case 'sparkle':
            color = '#fbbf24'
            size = Math.random() * 8 + 6 // Increased from 6+4
            vx = (Math.random() - 0.5) * 1  // Reduced from 4
            vy = (Math.random() - 0.5) * 1
            life = 1.5  // Increased lifetime for longer trail
            break
        case 'smoke':
            color = '#9ca3af'
            size = Math.random() * 8 + 4
            vx = dx * -0.1 + (Math.random() - 0.5) * 1
            vy = dy * -0.1 + (Math.random() - 0.5) * 1
            life = 0.8
            break
        case 'fire':
            color = Math.random() > 0.5 ? '#ef4444' : '#fb923c'
            size = Math.random() * 10 + 4 // Increased from 6+2
            vy = -1 - Math.random() * 2
            life = 0.6
            break
        case 'electric':
            color = '#60a5fa'
            size = 2
            life = 0.5
            break
        case 'confetti':
            const confettiColors = ['#ec4899', '#8b5cf6', '#ef4444', '#fbbf24', '#22c55e']
            color = confettiColors[Math.floor(Math.random() * confettiColors.length)]
            size = 10 // Increased from 6
            vx = (Math.random() - 0.5) * 1  // Reduced from 5
            vy = (Math.random() - 0.5) * 1
            life = 1.5  // Increased for longer trail
            shape = 'square'
            break
        case 'matrix':
            color = '#22c55e'
            size = 16 // Increased from 10
            life = 0.8
            char = String.fromCharCode(0x30A0 + Math.random() * 96)
            break
        case 'bubble':
            color = '#60a5fa'
            size = Math.random() * 8 + 4
            vy = -0.5 - Math.random() * 1
            vx = (Math.random() - 0.5) * 0.5
            life = 1.2
            break
        case 'leaf':
            color = ['#84cc16', '#22c55e', '#eab308', '#f97316'][Math.floor(Math.random() * 4)]
            size = Math.random() * 6 + 4
            vy = 0.5 + Math.random() * 1
            vx = (Math.random() - 0.5) * 2
            life = 1.5
            rotation = Math.random() * 360
            shape = 'leaf'
            break
        case 'dust':
            color = '#fcd34d'
            size = Math.random() * 3 + 1
            vx = (Math.random() - 0.5) * 1.5
            vy = (Math.random() - 0.5) * 1.5
            life = 0.8
            break
        case 'ripple':
            color = '#06b6d4'
            size = 4
            life = 0.8
            break
        case 'snow':
            color = '#e0f2fe'
            size = Math.random() * 4 + 2
            vy = 0.5 + Math.random() * 1
            vx = (Math.random() - 0.5) * 0.5
            life = 1.5
            break
        case 'hearts':
            color = '#f472b6'
            size = Math.random() * 6 + 4
            vy = -1 - Math.random() * 1
            vx = (Math.random() - 0.5) * 1
            life = 1.0
            shape = 'heart'
            break
        case 'star':
            color = '#fbbf24'
            size = Math.random() * 5 + 3
            vy = -1.5 - Math.random() * 2
            vx = (Math.random() - 0.5) * 2
            life = 0.8
            shape = 'star'
            break
        case 'wind':
            color = '#94a3b8'
            size = 3
            vx = 3 + Math.random() * 2
            vy = (Math.random() - 0.5) * 1
            life = 0.6
            break
        case 'thunder':
            color = '#facc15'
            size = 2
            vx = (Math.random() - 0.5) * 8
            vy = (Math.random() - 0.5) * 8
            life = 0.3
            break
        case 'neon':
            const neonColors = ['#e879f9', '#22d3ee', '#a855f7', '#f472b6']
            color = neonColors[Math.floor(Math.random() * neonColors.length)]
            size = Math.random() * 4 + 2
            life = 0.7
            break
        case 'shadow':
            color = '#a78bfa'
            size = Math.random() * 10 + 6
            vx = dx * -0.3 + (Math.random() - 0.5) * 2
            vy = dy * -0.3 + (Math.random() - 0.5) * 2
            life = 0.6
            break
        case 'ice':
            color = '#7dd3fc'
            size = Math.random() * 5 + 2
            vx = (Math.random() - 0.5) * 2
            vy = 0.5 + Math.random() * 1
            life = 1.0
            shape = 'crystal'
            break
        case 'lava':
            color = Math.random() > 0.5 ? '#f59e0b' : '#ef4444'
            size = Math.random() * 6 + 3
            vy = 1 + Math.random() * 1.5
            vx = (Math.random() - 0.5) * 1
            life = 0.8
            break
        case 'poison':
            color = '#a3e635'
            size = Math.random() * 6 + 4
            vy = -0.5 - Math.random() * 1
            vx = (Math.random() - 0.5) * 1.5
            life = 1.0
            break
        case 'crystal':
            color = '#c4b5fd'
            size = Math.random() * 5 + 3
            vx = (Math.random() - 0.5) * 3
            vy = (Math.random() - 0.5) * 3
            life = 0.9
            shape = 'diamond'
            break
        case 'aurora_trail':
            const auroraColors = ['#2dd4bf', '#22d3ee', '#a78bfa', '#34d399']
            color = auroraColors[Math.floor(Math.random() * auroraColors.length)]
            size = Math.random() * 8 + 4
            vy = -0.5 - Math.random() * 1
            life = 1.0
            break
        case 'galaxy_trail':
            const galaxyColors = ['#8b5cf6', '#6366f1', '#a855f7', '#c084fc']
            color = galaxyColors[Math.floor(Math.random() * galaxyColors.length)]
            size = Math.random() * 4 + 2
            rotation = Math.random() * 360
            life = 1.0
            break
        case 'cherry':
            color = '#fda4af'
            size = Math.random() * 5 + 3
            vy = 0.5 + Math.random() * 1
            vx = Math.sin(Date.now() / 200) * 0.5
            life = 1.2
            shape = 'petal'
            break
        case 'gold_trail':
            color = '#f59e0b'
            size = Math.random() * 4 + 3
            vx = (Math.random() - 0.5) * 1
            vy = (Math.random() - 0.5) * 1
            life = 0.9
            break
        case 'dragon':
            color = Math.random() > 0.3 ? '#ef4444' : '#fbbf24'
            size = Math.random() * 8 + 4
            vy = -1.5 - Math.random() * 2
            vx = (Math.random() - 0.5) * 3
            life = 0.6
            break
        case 'cosmic_dust':
            const cosmicColors = ['#a78bfa', '#c084fc', '#8b5cf6', '#e879f9']
            color = cosmicColors[Math.floor(Math.random() * cosmicColors.length)]
            size = Math.random() * 3 + 1
            vx = (Math.random() - 0.5) * 2
            vy = (Math.random() - 0.5) * 2
            life = 1.2
            break
        case 'lightning':
            color = '#60a5fa'
            size = 2
            vx = (Math.random() - 0.5) * 15
            vy = (Math.random() - 0.5) * 15
            life = 0.2
            break
        case 'supernova':
            const supernovaColors = ['#fef08a', '#fbbf24', '#f59e0b', '#fef3c7']
            color = supernovaColors[Math.floor(Math.random() * supernovaColors.length)]
            size = Math.random() * 6 + 3
            const angle = Math.random() * Math.PI * 2
            const speed = 3 + Math.random() * 3
            vx = Math.cos(angle) * speed
            vy = Math.sin(angle) * speed
            life = 0.7
            break
        case 'void_rift':
            color = '#a78bfa'
            size = Math.random() * 12 + 6
            vx = (Math.random() - 0.5) * 3
            vy = (Math.random() - 0.5) * 3
            life = 0.8
            break
        case 'spirit':
            color = '#22d3ee'
            size = Math.random() * 6 + 3
            vy = -1 - Math.random() * 1.5
            vx = Math.sin(Date.now() / 100) * 1
            life = 1.0
            shape = 'ghost'
            break
        case 'divine_light':
            color = '#fffbeb'
            size = Math.random() * 5 + 3
            vy = 2 + Math.random() * 2
            vx = (Math.random() - 0.5) * 0.5
            life = 0.6
            break
        case 'reality_tear':
            const tearColors = ['#f0abfc', '#e879f9', '#c084fc', '#a855f7']
            color = tearColors[Math.floor(Math.random() * tearColors.length)]
            size = Math.random() * 10 + 5
            vx = (Math.random() - 0.5) * 0.5
            vy = (Math.random() - 0.5) * 0.5
            life = 0.5
            shape = 'tear'
            break
        case 'infinity':
            color = '#818cf8'
            size = 12
            life = 1.0
            char = '∞'
            break
        case 'godray':
            color = '#fef3c7'
            size = Math.random() * 4 + 3
            vy = 4 + Math.random() * 2
            vx = (Math.random() - 0.5) * 0.5
            life = 0.5
            break
        case 'singularity':
            color = '#c084fc'
            size = Math.random() * 8 + 4
            const sAngle = Math.atan2(dy, dx) + Math.PI
            const sDist = Math.random() * 20
            vx = Math.cos(sAngle + Math.random() * 0.5) * -2
            vy = Math.sin(sAngle + Math.random() * 0.5) * -2
            life = 0.8
            break
        // NEW EFFECTS
        case 'sparkle_mini':
            color = '#fbbf24'
            size = Math.random() * 2 + 1
            vx = (Math.random() - 0.5) * 1.5
            vy = (Math.random() - 0.5) * 1.5
            life = 0.6
            break
        case 'dots':
            const dotColors = ['#a78bfa', '#c084fc', '#8b5cf6', '#e879f9']
            color = dotColors[Math.floor(Math.random() * dotColors.length)]
            size = Math.random() * 4 + 2
            vx = (Math.random() - 0.5) * 1
            vy = (Math.random() - 0.5) * 1
            life = 0.8
            break
        case 'music':
            color = '#8b5cf6'
            size = 12
            life = 0.8
            char = ['♪', '♫', '♬'][Math.floor(Math.random() * 3)]
            vy = -1 - Math.random() * 1
            vx = (Math.random() - 0.5) * 2
            break
        case 'feather':
            color = '#e0e7ff'
            size = Math.random() * 6 + 4
            vy = 0.3 + Math.random() * 0.5
            vx = Math.sin(Date.now() / 300) * 0.8
            life = 1.5
            rotation = Math.random() * 360
            shape = 'leaf'
            break
        case 'pixel':
            const pixelColors = ['#22c55e', '#16a34a', '#15803d', '#14532d']
            color = pixelColors[Math.floor(Math.random() * pixelColors.length)]
            size = 4
            vx = (Math.random() - 0.5) * 2
            vy = 1 + Math.random() * 1
            life = 0.8
            shape = 'square'
            break
        case 'glitch':
            const glitchColors = ['#ef4444', '#22d3ee', '#ffffff', '#000000']
            color = glitchColors[Math.floor(Math.random() * glitchColors.length)]
            size = Math.random() * 8 + 2
            vx = (Math.random() - 0.5) * 10
            vy = (Math.random() - 0.5) * 2
            life = 0.15
            shape = 'square'
            break
        case 'plasma_trail':
            const plasmaColors = ['#22d3ee', '#06b6d4', '#0891b2', '#38bdf8']
            color = plasmaColors[Math.floor(Math.random() * plasmaColors.length)]
            size = Math.random() * 6 + 3
            vx = (Math.random() - 0.5) * 2
            vy = (Math.random() - 0.5) * 2
            life = 0.7
            break
        case 'ember':
            color = Math.random() > 0.5 ? '#fb923c' : '#f97316'
            size = Math.random() * 4 + 2
            vy = -0.5 - Math.random() * 1
            vx = (Math.random() - 0.5) * 1.5
            life = 0.8
            break
        case 'cyberpunk':
            color = '#00ff88'
            size = 3
            vx = (Math.random() > 0.5 ? 1 : -1) * (2 + Math.random() * 3)
            vy = (Math.random() - 0.5) * 1
            life = 0.5
            shape = 'square'
            break
        case 'timeshift':
            const timeColors = ['#6366f1', '#818cf8', '#a5b4fc', '#4f46e5']
            color = timeColors[Math.floor(Math.random() * timeColors.length)]
            size = Math.random() * 5 + 3
            const tAngle = Math.random() * Math.PI * 2
            vx = Math.cos(tAngle) * 2
            vy = Math.sin(tAngle) * 2
            life = 0.6
            rotation = Math.random() * 360
            break
    }

    return {
        x,
        y,
        vx,
        vy,
        color,
        size,
        createdAt: Date.now(),
        life,
        rotation,
        shape,
        char
    }
}

function updateParticle(p: Particle, type: string): Particle {
    let next = { ...p }

    switch (type) {
        case 'sparkle':
            next.x += next.vx
            next.y += next.vy
            next.life -= 0.05
            next.size *= 0.95
            break
        case 'smoke':
            next.x += next.vx
            next.y += next.vy - 0.5
            next.life -= 0.02
            next.size *= 1.02
            break
        case 'fire':
            next.x += next.vx + (Math.random() - 0.5)
            next.y += next.vy
            next.life -= 0.03
            next.size *= 0.9
            break
        case 'electric':
            next.x += next.vx + (Math.random() - 0.5) * 10
            next.y += next.vy + (Math.random() - 0.5) * 10
            next.life -= 0.1
            break
        case 'confetti':
            next.x += next.vx
            next.y += next.vy + 2
            next.life -= 0.02
            next.vx *= 0.95
            next.rotation = (next.rotation || 0) + 10
            break
        case 'matrix':
            next.y += 2
            next.life -= 0.02
            break
        case 'bubble':
            next.x += next.vx + Math.sin(Date.now() / 200 + p.createdAt) * 0.3
            next.y += next.vy
            next.life -= 0.015
            next.size *= 1.01
            break
        case 'leaf':
            next.x += next.vx + Math.sin(Date.now() / 300 + p.createdAt) * 0.5
            next.y += next.vy
            next.life -= 0.015
            next.rotation = (next.rotation || 0) + 3
            break
        case 'dust':
            next.x += next.vx
            next.y += next.vy
            next.life -= 0.03
            next.size *= 0.98
            break
        case 'ripple':
            next.life -= 0.03
            next.size *= 1.15
            break
        case 'snow':
            next.x += next.vx + Math.sin(Date.now() / 400 + p.createdAt) * 0.2
            next.y += next.vy
            next.life -= 0.012
            break
        case 'hearts':
            next.x += next.vx
            next.y += next.vy
            next.life -= 0.025
            next.size *= 0.98
            break
        case 'star':
            next.x += next.vx
            next.y += next.vy
            next.life -= 0.03
            next.rotation = (next.rotation || 0) + 5
            break
        case 'wind':
            next.x += next.vx
            next.y += next.vy
            next.life -= 0.04
            next.vx *= 0.95
            break
        case 'thunder':
            next.x += next.vx
            next.y += next.vy
            next.life -= 0.15
            break
        case 'neon':
            next.x += next.vx
            next.y += next.vy
            next.life -= 0.035
            break
        case 'shadow':
            next.x += next.vx
            next.y += next.vy
            next.life -= 0.04
            next.size *= 1.05
            break
        case 'ice':
            next.x += next.vx
            next.y += next.vy
            next.life -= 0.025
            next.rotation = (next.rotation || 0) + 2
            break
        case 'lava':
            next.x += next.vx
            next.y += next.vy
            next.life -= 0.025
            next.size *= 0.97
            break
        case 'poison':
            next.x += next.vx
            next.y += next.vy
            next.life -= 0.02
            next.size *= 1.03
            break
        case 'crystal':
            next.x += next.vx
            next.y += next.vy
            next.life -= 0.025
            next.vx *= 0.9
            next.vy *= 0.9
            break
        case 'aurora_trail':
            next.x += next.vx
            next.y += next.vy
            next.life -= 0.02
            next.size *= 1.02
            break
        case 'galaxy_trail':
            next.x += Math.cos(Date.now() / 100 + p.createdAt) * 1
            next.y += Math.sin(Date.now() / 100 + p.createdAt) * 1
            next.life -= 0.02
            next.rotation = (next.rotation || 0) + 5
            break
        case 'cherry':
            next.x += next.vx
            next.y += next.vy
            next.vx = Math.sin(Date.now() / 200 + p.createdAt) * 0.8
            next.life -= 0.015
            next.rotation = (next.rotation || 0) + 2
            break
        case 'gold_trail':
            next.x += next.vx
            next.y += next.vy
            next.life -= 0.025
            break
        case 'dragon':
            next.x += next.vx + (Math.random() - 0.5) * 2
            next.y += next.vy
            next.life -= 0.04
            next.size *= 0.92
            break
        case 'cosmic_dust':
            next.x += next.vx
            next.y += next.vy
            next.life -= 0.015
            break
        case 'lightning':
            next.x += next.vx
            next.y += next.vy
            next.life -= 0.2
            break
        case 'supernova':
            next.x += next.vx
            next.y += next.vy
            next.vx *= 0.95
            next.vy *= 0.95
            next.life -= 0.03
            next.size *= 0.95
            break
        case 'void_rift':
            next.x += next.vx
            next.y += next.vy
            next.life -= 0.025
            next.size *= 1.05
            break
        case 'spirit':
            next.x += Math.sin(Date.now() / 100 + p.createdAt) * 1
            next.y += next.vy
            next.life -= 0.02
            next.size *= 0.98
            break
        case 'divine_light':
            next.x += next.vx
            next.y += next.vy
            next.life -= 0.04
            break
        case 'reality_tear':
            next.life -= 0.02
            next.size *= 1.08
            break
        case 'infinity':
            next.life -= 0.02
            next.rotation = (next.rotation || 0) + 2
            break
        case 'godray':
            next.x += next.vx
            next.y += next.vy
            next.life -= 0.05
            break
        case 'singularity':
            next.x += next.vx
            next.y += next.vy
            next.life -= 0.025
            next.size *= 0.95
            break
        // NEW EFFECTS
        case 'sparkle_mini':
            next.x += next.vx
            next.y += next.vy
            next.life -= 0.04
            next.size *= 0.95
            break
        case 'dots':
            next.x += next.vx
            next.y += next.vy
            next.life -= 0.025
            break
        case 'music':
            next.x += next.vx + Math.sin(Date.now() / 150 + p.createdAt) * 0.5
            next.y += next.vy
            next.life -= 0.025
            break
        case 'feather':
            next.x += next.vx
            next.y += next.vy
            next.vx = Math.sin(Date.now() / 300 + p.createdAt) * 0.8
            next.life -= 0.012
            next.rotation = (next.rotation || 0) + 1
            break
        case 'pixel':
            next.x += next.vx
            next.y += next.vy
            next.life -= 0.025
            break
        case 'glitch':
            next.x += next.vx + (Math.random() - 0.5) * 5
            next.y += next.vy
            next.life -= 0.15
            break
        case 'plasma_trail':
            next.x += next.vx
            next.y += next.vy
            next.life -= 0.03
            next.size *= 0.98
            break
        case 'ember':
            next.x += next.vx + (Math.random() - 0.5) * 0.5
            next.y += next.vy
            next.life -= 0.025
            next.size *= 0.96
            break
        case 'cyberpunk':
            next.x += next.vx
            next.y += next.vy
            next.life -= 0.04
            next.vx *= 0.95
            break
        case 'timeshift':
            next.x += next.vx
            next.y += next.vy
            next.life -= 0.035
            next.rotation = (next.rotation || 0) + 8
            next.size *= 0.97
            break
        default:
            next.x += next.vx
            next.y += next.vy
            next.life -= 0.03
    }

    return next
}
