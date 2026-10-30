import { useEffect, useRef, useState } from 'react'

// One observer for all active scenes; no observer or resize work per thumbnail.
const listeners = new Map<Element, (tall: boolean) => void>()
let observer: ResizeObserver | null = null

export function useSceneLayout(enabled: boolean) {
  const ref = useRef<HTMLSpanElement>(null)
  const [tall, setTall] = useState(false)
  useEffect(() => {
    const element = ref.current
    if (!enabled || !element) return
    const update = () => {
      const rect = element.getBoundingClientRect()
      setTall(rect.width > 0 && rect.height > rect.width * .95)
    }
    update()
    if (typeof ResizeObserver === 'undefined') return
    if (!observer) observer = new ResizeObserver(entries => {
      for (const entry of entries) {
        const { width, height } = entry.contentRect
        listeners.get(entry.target)?.(width > 0 && height > width * .95)
      }
    })
    listeners.set(element, setTall)
    observer.observe(element)
    return () => {
      listeners.delete(element)
      observer?.unobserve(element)
      if (listeners.size === 0) { observer?.disconnect(); observer = null }
    }
  }, [enabled])
  return { ref, tall }
}
