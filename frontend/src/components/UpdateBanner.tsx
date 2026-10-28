/*   ______      __ ____  _______       _  ____  _   _ 
 *  |  ____|   / / __ \|__   __|/\   | |/ __ \| \ | |
 *  | |__   _ / / |  | |  | |  /  \  | | |  | |  \| |
 *  |  __| | v /| |  | |  | | / /\ \ | | |  | | . ` |
 *  | |____ \ / | |__| |  | |/ ____ \| | |__| | |\  |
 *  |______| \_/ \____/   |_/_/    \_\_|\____/|_| \_|
 *                                                      
 */

/**
 * UpdateBanner Component - Checks for application updates (new deployments).
 * Prompts the user to refresh the page when a new version is detected.
 * 
 * --------------------------------------------------------------------------
 *                                  Functions
 * --------------------------------------------------------------------------
 * UpdateBanner: Main component.
 * checkForUpdates: Fetches version.json to check for new build timestamp.
 * handleRefresh: Refreshes the page and updates service worker.
 * handleDismiss: Closes the banner.
 * 
 * --------------------------------------------------------------------------
 *                            Variables and others
 * --------------------------------------------------------------------------
 * VERSION_CHECK_INTERVAL: Interval in ms to check for updates.
 * showBanner: Visibility state.
 * currentVersion: Stores the currently detected version/timestamp.
 * 
 * --------------------------------------------------------------------------
 *                                   imports
 * --------------------------------------------------------------------------
 * react: React hooks.
 * framer-motion: Animations.
 */

import { useState, useEffect, useCallback } from 'react'
import { motion, AnimatePresence } from 'framer-motion'

const VERSION_CHECK_INTERVAL = 60000 // 60 seconds

export default function UpdateBanner() {
    const [showBanner, setShowBanner] = useState(false)
    const [currentVersion, setCurrentVersion] = useState<string | null>(null)

    const checkForUpdates = useCallback(async () => {
        try {
            // Add cache-busting query param
            const response = await fetch(`/version.json?t=${Date.now()}`)
            if (!response.ok) return

            const data = await response.json()
            const newVersion = data.buildTime

            if (currentVersion && currentVersion !== newVersion) {
                setShowBanner(true)
            } else if (!currentVersion) {
                setCurrentVersion(newVersion)
            }
        } catch (e) {
            // Silently fail - network issues shouldn't show errors
        }
    }, [currentVersion])

    useEffect(() => {
        // Initial check
        checkForUpdates()

        // Periodic checks
        const interval = setInterval(checkForUpdates, VERSION_CHECK_INTERVAL)
        return () => clearInterval(interval)
    }, [checkForUpdates])

    const handleRefresh = () => {
        // Tell service worker to skip waiting
        if ('serviceWorker' in navigator && navigator.serviceWorker.controller) {
            navigator.serviceWorker.controller.postMessage('skipWaiting')
        }
        window.location.reload()
    }

    const handleDismiss = () => {
        setShowBanner(false)
        // Update current version so we don't show again for this version
        setCurrentVersion(null)
    }

    if (!showBanner) return null

    return (
        <AnimatePresence>
            <motion.div
                initial={{ y: -100, opacity: 0 }}
                animate={{ y: 0, opacity: 1 }}
                exit={{ y: -100, opacity: 0 }}
                transition={{ duration: 0.18 }}
                className="fixed top-4 left-4 right-4 z-[100] sm:left-1/2 sm:-translate-x-1/2 sm:w-auto sm:max-w-md"
            >
                <div className="rounded-xl border border-white/10 bg-[#0a0a0a] p-3 shadow-xl">
                    <div className="flex items-center gap-3">
                        <span aria-hidden="true" className="h-1.5 w-1.5 shrink-0 rounded-full bg-rose-400" />
                        <p className="min-w-0 flex-1 text-sm font-medium text-white/80">Update available</p>
                        <button
                            type="button"
                            onClick={handleRefresh}
                            className="h-9 rounded-lg bg-rose-500 px-3 text-xs font-semibold text-white transition-colors hover:bg-rose-400 focus-visible:outline focus-visible:outline-2 focus-visible:outline-rose-300"
                        >
                            Refresh
                        </button>

                        <button
                            type="button"
                            aria-label="Dismiss update notice"
                            onClick={handleDismiss}
                            className="rounded-md p-1.5 text-white/35 transition-colors hover:bg-white/[0.05] hover:text-white/70"
                        >
                            <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" aria-hidden="true">
                                <path d="M18 6L6 18M6 6l12 12" />
                            </svg>
                        </button>
                    </div>
                </div>
            </motion.div>
        </AnimatePresence>
    )
}
