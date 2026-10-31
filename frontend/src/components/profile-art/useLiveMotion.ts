import { useEffect, useRef, useState } from 'react'

/**
 * CSS animations are paused until a cosmetic is near the viewport. Leaderboards
 * can mount a hundred decorations; only the handful on screen should tick.
 */
export function useLiveMotion<T extends HTMLElement>(active: boolean) {
  const ref = useRef<T>(null)
  const [inView, setInView] = useState(active)

  useEffect(() => {
    if (!active) {
      setInView(false)
      return
    }
    const node = ref.current
    if (!node || typeof IntersectionObserver === 'undefined') {
      setInView(true)
      return
    }
    const observer = new IntersectionObserver(entries => {
      const entry = entries[0]
      if (entry) setInView(entry.isIntersecting)
    }, { rootMargin: '120px 0px' })
    observer.observe(node)
    return () => observer.disconnect()
  }, [active])

  return [ref, active && inView] as const
}
