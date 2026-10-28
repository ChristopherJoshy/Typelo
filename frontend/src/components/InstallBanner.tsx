/*   ______      __ ____  _______       _  ____  _   _ 
 *  |  ____|   / / __ \|__   __|/\   | |/ __ \| \ | |
 *  | |__   _ / / |  | |  | |  /  \  | | |  | |  \| |
 *  |  __| | v /| |  | |  | | / /\ \ | | |  | | . ` |
 *  | |____ \ / | |__| |  | |/ ____ \| | |__| | |\  |
 *  |______| \_/ \____/   |_/_/    \_\_|\____/|_| \_|
 *                                                      
 */

/**
 * InstallBanner Component - Prompts user to install the PWA.
 * 
 * --------------------------------------------------------------------------
 *                                  Functions
 * --------------------------------------------------------------------------
 * InstallBanner: Main component.
 * handleInstall: Triggers the browser installation prompt.
 * handleDismiss: Dismisses the banner and saves preference to localStorage.
 * 
 * --------------------------------------------------------------------------
 *                            Variables and others
 * --------------------------------------------------------------------------
 * deferredPrompt: Stores the browser's install prompt event.
 * showBanner: Visibility state of the banner.
 * isInstalled: Application installation status.
 * 
 * --------------------------------------------------------------------------
 *                                   imports
 * --------------------------------------------------------------------------
 * react: React hooks.
 * framer-motion: UI animations.
 */

import { useState, useEffect } from 'react'
import { motion, AnimatePresence } from 'framer-motion'

interface BeforeInstallPromptEvent extends Event {
    prompt: () => Promise<void>
    userChoice: Promise<{ outcome: 'accepted' | 'dismissed' }>
}

export default function InstallBanner() {
    const [deferredPrompt, setDeferredPrompt] = useState<BeforeInstallPromptEvent | null>(null)
    const [showBanner, setShowBanner] = useState(false)
    const [isInstalled, setIsInstalled] = useState(false)

    useEffect(() => {
        // Check if already installed
        if (window.matchMedia('(display-mode: standalone)').matches) {
            setIsInstalled(true)
            return
        }

        // Check if user dismissed before
        const dismissed = localStorage.getItem('pwa-install-dismissed')
        if (dismissed) {
            const dismissedTime = parseInt(dismissed, 10)
            // Show again after 7 days
            if (Date.now() - dismissedTime < 7 * 24 * 60 * 60 * 1000) {
                return
            }
        }

        const handleBeforeInstall = (e: Event) => {
            e.preventDefault()
            setDeferredPrompt(e as BeforeInstallPromptEvent)
            setShowBanner(true)
        }

        const handleAppInstalled = () => {
            setIsInstalled(true)
            setShowBanner(false)
            setDeferredPrompt(null)
        }

        window.addEventListener('beforeinstallprompt', handleBeforeInstall)
        window.addEventListener('appinstalled', handleAppInstalled)

        return () => {
            window.removeEventListener('beforeinstallprompt', handleBeforeInstall)
            window.removeEventListener('appinstalled', handleAppInstalled)
        }
    }, [])

    const handleInstall = async () => {
        if (!deferredPrompt) return

        await deferredPrompt.prompt()
        const { outcome } = await deferredPrompt.userChoice

        if (outcome === 'accepted') {
            setShowBanner(false)
        }
        setDeferredPrompt(null)
    }

    const handleDismiss = () => {
        localStorage.setItem('pwa-install-dismissed', Date.now().toString())
        setShowBanner(false)
    }

    if (isInstalled || !showBanner) return null

    return (
        <AnimatePresence>
            <motion.div
                initial={{ y: 100, opacity: 0 }}
                animate={{ y: 0, opacity: 1 }}
                exit={{ y: 100, opacity: 0 }}
                transition={{ duration: 0.18 }}
                className="fixed bottom-4 left-4 right-4 z-[100] sm:left-auto sm:right-4 sm:w-80"
            >
                <div className="rounded-xl border border-white/10 bg-[#0a0a0a] p-4 shadow-xl">
                    <div className="flex items-start gap-3">
                        <svg className="mt-0.5 h-5 w-5 shrink-0 text-rose-400" viewBox="0 0 24 24" fill="currentColor" aria-hidden="true">
                            <path d="M13.2 1.8 4.5 13.4h5.9l-1.7 8.8 10.8-13h-6.1l1.6-7.4z" />
                        </svg>
                        <div className="min-w-0 flex-1">
                            <p className="text-sm font-medium text-white">Install Typelo</p>
                            <p className="mt-0.5 text-xs text-white/45">Add a shortcut to your home screen.</p>
                        </div>
                        <button
                            type="button"
                            aria-label="Dismiss install prompt"
                            onClick={handleDismiss}
                            className="-mr-1 -mt-1 rounded-md p-1.5 text-white/35 transition-colors hover:bg-white/[0.05] hover:text-white/70"
                        >
                            <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" aria-hidden="true">
                                <path d="M18 6L6 18M6 6l12 12" />
                            </svg>
                        </button>
                    </div>
                    <div className="mt-3 flex items-center gap-2 pl-8">
                        <button
                            type="button"
                            onClick={handleInstall}
                            className="h-9 rounded-lg bg-rose-500 px-4 text-xs font-semibold text-white transition-colors hover:bg-rose-400 focus-visible:outline focus-visible:outline-2 focus-visible:outline-rose-300"
                        >
                            Install
                        </button>
                        <button
                            type="button"
                            onClick={handleDismiss}
                            className="h-9 rounded-lg px-3 text-xs text-white/45 transition-colors hover:bg-white/[0.05] hover:text-white focus-visible:outline focus-visible:outline-2 focus-visible:outline-white/40"
                        >
                            Not now
                        </button>
                    </div>
                </div>
            </motion.div>
        </AnimatePresence>
    )
}
