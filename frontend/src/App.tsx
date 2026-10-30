/*   ______      __ ____  _______       _  ____  _   _ 
 *  |  ____|   / / __ \|__   __|/\   | |/ __ \| \ | |
 *  | |__   _ / / |  | |  | |  /  \  | | |  | |  \| |
 *  |  __| | v /| |  | |  | | / /\ \ | | |  | | . ` |
 *  | |____ \ / | |__| |  | |/ ____ \| | |__| | |\  |
 *  |______| \_/ \____/   |_/_/    \_\_|\____/|_| \_|
 *                                                      
 */

/**
 * Main App Component - Handles routing and global initialization.
 * 
 * --------------------------------------------------------------------------
 *                                  Functions
 * --------------------------------------------------------------------------
 * App: The root component structure.
 * 
 * --------------------------------------------------------------------------
 *                            Variables and others
 * --------------------------------------------------------------------------
 * user: Authenticated user state.
 * loading: Auth loading state.
 * connectionStatus: Global WebSocket/Server connection status.
 * 
 * --------------------------------------------------------------------------
 *                                   imports
 * --------------------------------------------------------------------------
 * react: React core/hooks.
 * react-router-dom: Routing.
 * stores: Zustand stores for state.
 * contexts: React contexts (WebSocket).
 * hooks: Custom hooks.
 * components: UI Components.
 */

import { lazy, Suspense, useEffect } from 'react'
import { Routes, Route, Navigate, useLocation } from 'react-router-dom'
import { MotionConfig } from 'framer-motion'
import { Helmet } from 'react-helmet-async'
import { useAuthStore } from './stores/authStore'
import { useConnectionStore } from './stores/connectionStore'
import { useInventoryStore } from './stores/inventoryStore'
import { usePreferencesStore } from './stores/preferencesStore'
import { useGameStore } from './stores/gameStore'
import { WebSocketProvider } from './contexts/WebSocketContext'
import { useDevToolsDetection } from './hooks/useDevToolsDetection'
import Layout from './components/Layout'
import Login from './components/Login'
import ConnectionError from './components/ConnectionError'
import InstallBanner from './components/InstallBanner'
import UpdateBanner from './components/UpdateBanner'
import CursorEffect from './components/CursorEffect'
import { unlockCosmeticAudio } from './effects/cosmeticAudio'

const Dashboard = lazy(() => import('./components/Dashboard'))
const Game = lazy(() => import('./components/Game'))
const InvitePage = lazy(() => import('./components/InvitePage'))
const FAQ = lazy(() => import('./components/FAQ'))
const TypeloVsMonkeytype = lazy(() => import('./components/compare/TypeloVsMonkeytype'))
const TypeloVsTypeRacer = lazy(() => import('./components/compare/TypeloVsTypeRacer'))

function App() {
  const { user, loading, idToken } = useAuthStore()
  const { status: connectionStatus, startHealthCheck, stopHealthCheck } = useConnectionStore()
  const { equippedEffect, fetchInventory, fetchProfileInventory } = useInventoryStore()
  const mouseEffectsEnabled = usePreferencesStore(state => state.mouseEffectsEnabled)
  const { pathname } = useLocation()
  const gameStatus = useGameStore(state => state.status)

  const pageTitle = pathname.startsWith('/game/')
    ? gameStatus === 'playing'
      ? 'Typing race · Typelo'
      : gameStatus === 'finished'
        ? 'Match results · Typelo'
        : 'Match found · Typelo'
    : pathname === '/dashboard'
      ? connectionStatus === 'disconnected'
        ? 'Reconnecting · Typelo'
        : gameStatus === 'queue' || gameStatus === 'waiting'
          ? 'Searching · Typelo'
          : 'Lobby · Typelo'
      : pathname === '/faq'
        ? 'Help · Typelo'
        : pathname === '/compare/typelo-vs-monkeytype'
          ? 'Typelo vs Monkeytype'
          : pathname === '/compare/typelo-vs-typeracer'
            ? 'Typelo vs TypeRacer'
            : pathname.startsWith('/invite/')
              ? 'Friend invite · Typelo'
              : pathname === '/'
                ? 'Sign in · Typelo'
                : 'Typelo · Competitive typing'

  const faviconPath = connectionStatus === 'disconnected'
    ? '/favicon-offline.svg'
    : pathname.startsWith('/game/')
      ? '/favicon-match.svg'
      : '/favicon.svg'

  useEffect(() => {
    const favicon = document.getElementById('app-favicon') as HTMLLinkElement | null
    if (favicon) favicon.href = faviconPath
  }, [faviconPath])

  // Anti-cheat: disabled to prevent site reload issues
  // useDevToolsDetection()

  useEffect(() => {
    window.addEventListener('pointerdown', unlockCosmeticAudio, { passive: true })
    window.addEventListener('keydown', unlockCosmeticAudio)
    return () => {
      window.removeEventListener('pointerdown', unlockCosmeticAudio)
      window.removeEventListener('keydown', unlockCosmeticAudio)
    }
  }, [])

  // Start health check on mount
  useEffect(() => {
    startHealthCheck()
    return () => stopHealthCheck()
  }, [startHealthCheck, stopHealthCheck])

  // Fetch inventory to get equipped effect if user logged in
  useEffect(() => {
    if (user && idToken) {
      void Promise.all([fetchInventory(idToken), fetchProfileInventory(idToken)])
    }
  }, [user, idToken, fetchInventory, fetchProfileInventory])

  // The backend health check must not block login or public pages.
  if (loading) {
    return (
      <main aria-busy="true" aria-labelledby="app-loading-heading" className="h-screen w-screen flex flex-col items-center justify-center bg-bg-primary gap-4">
        <h1 id="app-loading-heading" className="sr-only">Loading Typelo</h1>
        <div className="relative">
          <div className="w-8 h-8 border-2 border-white/20 border-t-white rounded-full animate-spin" />
        </div>
        <p role="status" className="text-xs text-text-muted font-mono uppercase tracking-wider">
          {connectionStatus === 'checking' ? 'Connecting to server' : 'Loading'}
        </p>
      </main>
    )
  }

  return (
    <MotionConfig reducedMotion="user">
      <>
        <Helmet>
          <title>{pageTitle}</title>
        </Helmet>
        {user && connectionStatus === 'disconnected' && <ConnectionError />}
        <CursorEffect effectId={pathname.startsWith('/game/') || !mouseEffectsEnabled ? null : equippedEffect} />
        <WebSocketProvider>
          <Layout>
            <Suspense fallback={
              <div role="status" aria-live="polite" className="flex min-h-[55vh] items-center justify-center gap-3 text-sm text-white/50">
                <span aria-hidden="true" className="h-4 w-4 animate-spin rounded-full border border-white/15 border-t-rose-400" />
                Loading Typelo…
              </div>
            }>
              <Routes>
                <Route
                  path="/"
                  element={user ? <Navigate to="/dashboard" replace /> : <Login />}
                />
                <Route
                  path="/dashboard"
                  element={user ? <Dashboard /> : <Navigate to="/" replace />}
                />
                <Route
                  path="/game/:matchId"
                  element={user ? <Game /> : <Navigate to="/" replace />}
                />
                <Route
                  path="/invite/:code"
                  element={<InvitePage />}
                />
                <Route path="/faq" element={<FAQ />} />
                <Route path="/compare/typelo-vs-monkeytype" element={<TypeloVsMonkeytype />} />
                <Route path="/compare/typelo-vs-typeracer" element={<TypeloVsTypeRacer />} />
                <Route path="*" element={<Navigate to="/" replace />} />
              </Routes>
            </Suspense>
          </Layout>
        </WebSocketProvider>
        <InstallBanner />
        <UpdateBanner />
      </>
    </MotionConfig>
  )
}

export default App
