import { useEffect } from 'react'
import { AnimatePresence, motion } from 'framer-motion'
import { usePreferencesStore, type BackgroundDisplayMode } from '../stores/preferencesStore'

interface SettingsModalProps {
  isOpen: boolean
  onClose: () => void
}

const backgroundModes: { id: BackgroundDisplayMode; label: string; description: string }[] = [
  { id: 'lobby', label: 'Lobby & profile', description: 'Use it behind the lobby and profiles.' },
  { id: 'profile', label: 'Profile only', description: 'Keep it on profile screens.' },
  { id: 'off', label: 'Off', description: 'Hide equipped backgrounds.' },
]

export default function SettingsModal({ isOpen, onClose }: SettingsModalProps) {
  const mouseEffectsEnabled = usePreferencesStore(state => state.mouseEffectsEnabled)
  const backgroundDisplayMode = usePreferencesStore(state => state.backgroundDisplayMode)
  const setMouseEffectsEnabled = usePreferencesStore(state => state.setMouseEffectsEnabled)
  const setBackgroundDisplayMode = usePreferencesStore(state => state.setBackgroundDisplayMode)

  useEffect(() => {
    if (!isOpen) return
    const handleKeyDown = (event: KeyboardEvent) => {
      if (event.key === 'Escape') onClose()
    }
    window.addEventListener('keydown', handleKeyDown)
    return () => window.removeEventListener('keydown', handleKeyDown)
  }, [isOpen, onClose])

  return (
    <AnimatePresence>
      {isOpen && (
        <>
          <motion.button
            type="button"
            aria-label="Close settings"
            className="fixed inset-0 z-[110] bg-black/70 backdrop-blur-sm"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={onClose}
          />
          <motion.div
            className="fixed inset-0 z-[111] flex items-center justify-center overflow-y-auto p-4"
            initial={{ opacity: 0, y: 8 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: 8 }}
            onClick={onClose}
          >
            <section
              role="dialog"
              aria-modal="true"
              aria-labelledby="settings-title"
              className="typelo-modal-surface w-full max-w-lg overflow-hidden rounded-2xl border border-white/10 bg-[#0c0c0e] shadow-2xl"
              onClick={event => event.stopPropagation()}
            >
              <header className="flex items-center justify-between border-b border-white/[0.07] px-6 py-5">
                <div>
                  <p className="text-[10px] uppercase tracking-[0.2em] text-white/35">Preferences</p>
                  <h2 id="settings-title" className="mt-1 text-lg font-semibold text-white">Settings</h2>
                </div>
                <button
                  type="button"
                  aria-label="Close settings"
                  onClick={onClose}
                  className="grid h-9 w-9 place-items-center rounded-full bg-white/[0.05] text-white/55 transition-colors hover:bg-white/10 hover:text-white"
                >
                  <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" aria-hidden="true">
                    <path d="m6 6 12 12M18 6 6 18" />
                  </svg>
                </button>
              </header>

              <div className="space-y-7 p-6">
                <section aria-labelledby="mouse-effects-title">
                  <div className="flex items-start justify-between gap-5">
                    <div>
                      <h3 id="mouse-effects-title" className="text-sm font-medium text-white">Mouse trail</h3>
                      <p className="mt-1 text-xs leading-relaxed text-white/45">Decorative trail while browsing. Match effects stay on.</p>
                    </div>
                    <button
                      type="button"
                      role="switch"
                      aria-checked={mouseEffectsEnabled}
                      aria-label="Mouse effects"
                      onClick={() => setMouseEffectsEnabled(!mouseEffectsEnabled)}
                      className={`relative mt-0.5 h-6 w-11 shrink-0 rounded-full border transition-colors ${mouseEffectsEnabled ? 'border-rose-300/50 bg-rose-400/80' : 'border-white/15 bg-white/10'}`}
                    >
                      <span className={`absolute top-0.5 h-4 w-4 rounded-full bg-white shadow transition-transform ${mouseEffectsEnabled ? 'translate-x-[22px]' : 'translate-x-0.5'}`} />
                    </button>
                  </div>
                </section>

                <fieldset>
                  <legend className="text-sm font-medium text-white">Equipped background</legend>
                  <div role="radiogroup" aria-label="Background display" className="mt-3 grid gap-2">
                    {backgroundModes.map(mode => (
                      <label
                        key={mode.id}
                        className={`flex cursor-pointer items-start gap-3 rounded-xl border p-3.5 transition-colors ${backgroundDisplayMode === mode.id ? 'border-rose-300/45 bg-rose-400/[0.07]' : 'border-white/[0.08] bg-white/[0.02] hover:bg-white/[0.045]'}`}
                      >
                        <input
                          className="mt-1 accent-rose-400"
                          type="radio"
                          name="background-display"
                          value={mode.id}
                          checked={backgroundDisplayMode === mode.id}
                          onChange={() => setBackgroundDisplayMode(mode.id)}
                        />
                        <span>
                          <span className="block text-xs font-medium text-white">{mode.label}</span>
                          <span className="mt-1 block text-[11px] text-white/45">{mode.description}</span>
                        </span>
                      </label>
                    ))}
                  </div>
                </fieldset>
              </div>

              <footer className="border-t border-white/[0.07] px-6 py-3 text-[10px] text-white/30">
                Saved on this device
              </footer>
            </section>
          </motion.div>
        </>
      )}
    </AnimatePresence>
  )
}
