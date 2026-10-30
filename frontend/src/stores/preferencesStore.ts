import { create } from 'zustand'
import { persist } from 'zustand/middleware'

export type BackgroundDisplayMode = 'lobby' | 'profile' | 'off'

interface PreferencesState {
  mouseEffectsEnabled: boolean
  backgroundDisplayMode: BackgroundDisplayMode
  setMouseEffectsEnabled: (enabled: boolean) => void
  setBackgroundDisplayMode: (mode: BackgroundDisplayMode) => void
}

export const usePreferencesStore = create<PreferencesState>()(
  persist(
    set => ({
      mouseEffectsEnabled: true,
      backgroundDisplayMode: 'lobby',
      setMouseEffectsEnabled: mouseEffectsEnabled => set({ mouseEffectsEnabled }),
      setBackgroundDisplayMode: backgroundDisplayMode => set({ backgroundDisplayMode }),
    }),
    {
      name: 'typelo-display-preferences',
      version: 1,
      partialize: state => ({
        mouseEffectsEnabled: state.mouseEffectsEnabled,
        backgroundDisplayMode: state.backgroundDisplayMode,
      }),
      merge: (persisted, current) => {
        const saved = persisted as Partial<PreferencesState> | undefined
        const mode = saved?.backgroundDisplayMode
        return {
          ...current,
          mouseEffectsEnabled: typeof saved?.mouseEffectsEnabled === 'boolean' ? saved.mouseEffectsEnabled : current.mouseEffectsEnabled,
          backgroundDisplayMode: mode === 'profile' || mode === 'off' || mode === 'lobby' ? mode : current.backgroundDisplayMode,
        }
      },
    },
  ),
)
