import { useCallback, useEffect, useState } from 'react'
import { AnimatePresence, motion } from 'framer-motion'
import { getUpdateSeen, markUpdateSeen } from '../config/api'
import { useAuthStore } from '../stores/authStore'

const UPDATE_VERSION = '2026-10-28-minimal-refresh-v13'

const UPDATES = [
    {
        title: 'A clearer lobby',
        description: 'Modes and the match button now sit together in the center of the play area.',
    },
    {
        title: 'Calmer screens',
        description: 'The shop, rewards, profiles, and match results follow the same quieter style.',
    },
    {
        title: 'A more reliable reveal',
        description: 'Crate animations now finish on the item the server actually awarded.',
    },
]

interface UpdateModalProps {
    forceOpen?: boolean
    onClose?: () => void
}

export default function UpdateModal({ forceOpen, onClose }: UpdateModalProps) {
    const [isOpen, setIsOpen] = useState(false)
    const uid = useAuthStore(state => state.user?.uid ?? null)
    const idToken = useAuthStore(state => state.idToken)
    const storageKey = uid ? `typelo:last_seen_update:${uid}` : null

    const handleClose = useCallback(() => {
        if (storageKey) localStorage.setItem(storageKey, UPDATE_VERSION)
        setIsOpen(false)
        onClose?.()

        if (idToken) {
            void markUpdateSeen(UPDATE_VERSION, idToken).catch(() => {
                // The per-account local marker prevents repeated popups while offline.
            })
        }
    }, [idToken, onClose, storageKey])

    useEffect(() => {
        if (forceOpen) {
            setIsOpen(true)
            return
        }

        if (!uid || !storageKey) {
            setIsOpen(false)
            return
        }

        let cancelled = false
        const localSeen = localStorage.getItem(storageKey) === UPDATE_VERSION
        if (localSeen) {
            setIsOpen(false)
            if (idToken) {
                void markUpdateSeen(UPDATE_VERSION, idToken).catch(() => {
                    // Keep retrying this idempotent sync on the user's next visit.
                })
            }
            return
        }

        if (!idToken) {
            setIsOpen(true)
            return
        }

        void getUpdateSeen(UPDATE_VERSION, idToken)
            .then(seen => {
                if (cancelled) return
                if (seen) localStorage.setItem(storageKey, UPDATE_VERSION)
                setIsOpen(!seen)
            })
            .catch(() => {
                if (!cancelled) setIsOpen(true)
            })

        return () => { cancelled = true }
    }, [forceOpen, idToken, storageKey, uid])

    useEffect(() => {
        if (!isOpen) return
        const handleKeyDown = (event: KeyboardEvent) => {
            if (event.key === 'Escape') handleClose()
        }
        window.addEventListener('keydown', handleKeyDown)
        return () => window.removeEventListener('keydown', handleKeyDown)
    }, [handleClose, isOpen])

    return (
        <AnimatePresence>
            {isOpen && (
                <>
                    <motion.button
                        type="button"
                        aria-label="Close What's New"
                        className="fixed inset-0 z-50 typelo-modal-backdrop"
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        exit={{ opacity: 0 }}
                        onClick={handleClose}
                    />

                    <motion.div
                        role="dialog"
                        aria-modal="true"
                        aria-labelledby="updates-title"
                        className="fixed inset-0 z-50 flex items-center justify-center p-4"
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        exit={{ opacity: 0 }}
                    >
                        <motion.section
                            className="typelo-modal-surface relative w-full max-w-md overflow-hidden rounded-2xl border border-white/[0.08] bg-[#0c0c0c]"
                            initial={{ opacity: 0, y: 8, scale: 0.99 }}
                            animate={{ opacity: 1, y: 0, scale: 1 }}
                            exit={{ opacity: 0, y: 8, scale: 0.99 }}
                            transition={{ duration: 0.18 }}
                        >
                            <header className="flex items-start justify-between border-b border-white/[0.07] px-6 py-5">
                                <div>
                                    <p className="text-xs font-medium uppercase tracking-[0.16em] text-rose-300">Typelo updates</p>
                                    <h2 id="updates-title" className="mt-2 text-xl font-semibold tracking-tight text-white">What’s new</h2>
                                </div>
                                <button
                                    type="button"
                                    aria-label="Close What's New"
                                    onClick={handleClose}
                                    className="rounded-lg p-2 text-white/45 transition-colors hover:bg-white/[0.06] hover:text-white focus-visible:outline focus-visible:outline-2 focus-visible:outline-rose-400"
                                >
                                    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" aria-hidden="true">
                                        <path d="M18 6 6 18M6 6l12 12" />
                                    </svg>
                                </button>
                            </header>

                            <ul className="divide-y divide-white/[0.06] px-6">
                                {UPDATES.map((update, index) => (
                                    <li key={update.title} className="flex gap-4 py-4">
                                        <span aria-hidden="true" className="pt-0.5 font-mono text-xs tabular-nums text-rose-300/70">0{index + 1}</span>
                                        <div>
                                            <h3 className="text-sm font-medium text-white">{update.title}</h3>
                                            <p className="mt-1 text-sm leading-relaxed text-white/50">{update.description}</p>
                                        </div>
                                    </li>
                                ))}
                            </ul>

                            <footer className="px-6 pb-6 pt-2">
                                <button
                                    type="button"
                                    onClick={handleClose}
                                    className="h-12 w-full rounded-xl bg-rose-500 text-sm font-semibold text-white transition-colors hover:bg-rose-400 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-rose-300"
                                >
                                    Continue
                                </button>
                            </footer>
                        </motion.section>
                    </motion.div>
                </>
            )}
        </AnimatePresence>
    )
}
