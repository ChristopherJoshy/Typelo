import { useEffect, useRef } from 'react'
import { playCosmeticPair } from '../effects/cosmeticAudio'

/** A single opening cue, including profiles whose equipment arrives asynchronously. */
export function useProfileCosmeticAudio(isOpen: boolean, effect: string | null | undefined, border: string | null | undefined, owner: string) {
  const played = useRef<string | null>(null)
  useEffect(() => {
    if (!isOpen) { played.current = null; return }
    if (played.current === owner || (!effect && !border)) return
    played.current = owner
    playCosmeticPair('profile', effect ?? null, border ?? null, owner)
  }, [isOpen, effect, border, owner])
}
