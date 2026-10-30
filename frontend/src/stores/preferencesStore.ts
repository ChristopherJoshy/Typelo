import { create } from 'zustand'
import { persist } from 'zustand/middleware'

export type BackgroundDisplayMode = 'lobby' | 'profile' | 'off'

interface PreferencesState {
  cosmeticSoundsEnabled: boolean
  setCosmeticSoundsEnabled: (enabled: boolean) => void
  mouseEffectsEnabled: boolean
  backgroundDisplayMode: BackgroundDisplayMode
  setMouseEffectsEnabled: (enabled: boolean) => void
  setBackgroundDisplayMode: (mode: BackgroundDisplayMode) => void
}

export const usePreferencesStore = create<PreferencesState>()(
  persist(
    set => ({
      cosmeticSoundsEnabled: true,
      setCosmeticSoundsEnabled: cosmeticSoundsEnabled => set({ cosmeticSoundsEnabled }),
      mouseEffectsEnabled: true,
      backgroundDisplayMode: 'lobby',
      setMouseEffectsEnabled: mouseEffectsEnabled => set({ mouseEffectsEnabled }),
      setBackgroundDisplayMode: backgroundDisplayMode => set({ backgroundDisplayMode }),
    }),
    {
      name: 'typelo-display-preferences',
      version: 1,
      partialize: state => ({
        cosmeticSoundsEnabled: state.cosmeticSoundsEnabled,
        mouseEffectsEnabled: state.mouseEffectsEnabled,
        backgroundDisplayMode: state.backgroundDisplayMode,
      }),
      merge: (persisted, current) => {
        const saved = persisted as Partial<PreferencesState> | undefined
        const mode = saved?.backgroundDisplayMode
        return {
          ...current,
          cosmeticSoundsEnabled: typeof saved?.cosmeticSoundsEnabled === 'boolean' ? saved.cosmeticSoundsEnabled : current.cosmeticSoundsEnabled,
          mouseEffectsEnabled: typeof saved?.mouseEffectsEnabled === 'boolean' ? saved.mouseEffectsEnabled : current.mouseEffectsEnabled,
          backgroundDisplayMode: mode === 'profile' || mode === 'off' || mode === 'lobby' ? mode : current.backgroundDisplayMode,
        }
      },
    },
  ),
)
