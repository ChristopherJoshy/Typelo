/*   ______      __ ____  _______       _  ____  _   _ 
 *  |  ____|   / / __ \|__   __|/\   | |/ __ \| \ | |
 *  | |__   _ / / |  | |  | |  /  \  | | |  | |  \| |
 *  |  __| | v /| |  | |  | | / /\ \ | | |  | | . ` |
 *  | |____ \ / | |__| |  | |/ ____ \| | |__| | |\  |
 *  |______| \_/ \____/   |_/_/    \_\_|\____/|_| \_|
 *                                                      
 */

/**
 * ConnectionError Component - Full-screen error state when backend is unreachable.
 * 
 * --------------------------------------------------------------------------
 *                                  Functions
 * --------------------------------------------------------------------------
 * ConnectionError: Main component.
 * handleRetry: Manual retry action.
 * 
 * --------------------------------------------------------------------------
 *                            Variables and others
 * --------------------------------------------------------------------------
 * retryCount: Number of failed retry attempts.
 * 
 * --------------------------------------------------------------------------
 *                                   imports
 * --------------------------------------------------------------------------
 * framer-motion: Animations.
 * stores/connectionStore: Connection state.
 */

import { useConnectionStore } from '../stores/connectionStore'

export default function ConnectionError() {
  const { checkConnection } = useConnectionStore()

  const handleRetry = async () => {
    await checkConnection()
  }

  return (
    <div role="alert" aria-live="polite" className="fixed left-1/2 top-3 z-[200] hidden h-11 w-[calc(100%-1.5rem)] max-w-sm -translate-x-1/2 items-center justify-between gap-3 rounded-xl border border-white/10 bg-[#0b0b0c] px-3 shadow-xl sm:flex">
      <div className="flex min-w-0 items-center gap-2.5">
        <span aria-hidden="true" className="h-1.5 w-1.5 shrink-0 rounded-full bg-rose-400" />
        <p className="truncate text-xs font-medium text-white/75">Match server unavailable</p>
      </div>
      <button
        type="button"
        onClick={handleRetry}
        className="shrink-0 rounded-md px-2.5 py-1.5 text-xs font-medium text-white/45 transition-colors hover:bg-white/[0.05] hover:text-white focus-visible:outline focus-visible:outline-2 focus-visible:outline-rose-400"
      >
        Retry
      </button>
    </div>
  )
}
