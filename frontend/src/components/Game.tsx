/*   ______      __ ____  _______       _  ____  _   _ 
 *  |  ____|   / / __ \|__   __|/\   | |/ __ \| \ | |
 *  | |__   _ / / |  | |  | |  /  \  | | |  | |  \| |
 *  |  __| | v /| |  | |  | | / /\ \ | | |  | | . ` |
 *  | |____ \ / | |__| |  | |/ ____ \| | |__| | |\  |
 *  |______| \_/ \____/   |_/_/    \_\_|\____/|_| \_|
 *                                                      
 */

/**
 * Game Component - Orchestrates the main gameplay experience.
 * Manages game states, countdowns, typing area, user feedback, and results.
 * 
 * --------------------------------------------------------------------------
 *                                  Functions
 * --------------------------------------------------------------------------
 * Game: Main component.
 * toggleZenMode: Toggles minimalist mode.
 * handlePlayAgain: Resets game and navigates to dashboard.
 * 
 * --------------------------------------------------------------------------
 *                            Variables and others
 * --------------------------------------------------------------------------
 * matchId: URL parameter.
 * status: Current game status.
 * autoStartCountdown: Visual countdown state.
 * zenMode: Boolean for UI display mode.
 * 
 * --------------------------------------------------------------------------
 *                                   imports
 * --------------------------------------------------------------------------
 * react: React hooks.
 * framer-motion: Animations.
 * hooks: Custom hooks (useTyping, useSound, useWebSocket).
 * stores: Game and Auth stores.
 * components: TypingArea, Result.
 */

import { useEffect, useCallback, useState } from 'react'
import { useParams, useNavigate } from 'react-router-dom'
import { motion, AnimatePresence } from 'framer-motion'
import { useGameStore } from '../stores/gameStore'
import { useAuthStore } from '../stores/authStore'
import { useWebSocket } from '../hooks/useWebSocket'
import { useTyping } from '../hooks/useTyping'
import { useSound } from '../hooks/useSound'
import { DEFAULT_GAME_DURATION_SECONDS } from '../constants'
import TypingArea from './TypingArea'
import Result from './Result'
import { useInventoryStore } from '../stores/inventoryStore'

export default function Game() {
  const { matchId } = useParams<{ matchId: string }>()
  const navigate = useNavigate()
  const { user, stats } = useAuthStore()
  const { equippedCursor, equippedEffect } = useInventoryStore()
  const { sendKeystroke, sendWordComplete, leaveQueue, readyForMatch, leaveMatch, isConnected, ping, timeOffset } = useWebSocket()
  const [autoStartCountdown, setAutoStartCountdown] = useState<number | null>(null)
  const [readySecondsLeft, setReadySecondsLeft] = useState<number | null>(null)
  const [confirmLeave, setConfirmLeave] = useState(false)
  const [recoveringMatch, setRecoveringMatch] = useState(false)

  // Feature: Sound & Zen Mode
  const { playSound, enabled: soundEnabled, toggleSound } = useSound()
  const [zenMode, setZenMode] = useState(() => localStorage.getItem('zen-mode') === 'true')

  const toggleZenMode = () => {
    setZenMode(prev => {
      const next = !prev
      localStorage.setItem('zen-mode', next.toString())
      return next
    })
  }

  const {
    status,
    matchInfo,
    result,
    timeRemaining,
    matchDuration,
    startTime,
    wpm,
    accuracy,
    opponentCharIndex,
    opponentWordIndex,
    words,
    keyStats,
    youReady,
    opponentReady,
    readyExpiresAt,
    reset,
  } = useGameStore()

  const { inputRef, handleKeyDown, handleMobileInput, currentWord } = useTyping({
    timeOffset,
    onKeystroke: (char, charIndex, correct) => {
      // Calculate intensity based on position relative to opponent
      // 0 = calm (ahead), 1 = intense (behind)
      const playerProgress = charIndex
      const oppProgress = opponentCharIndex
      let intensity = 0.5 // Neutral

      if (oppProgress > 0) {
        const diff = oppProgress - playerProgress
        // If behind by 20+ chars, max intensity; if ahead, calm
        intensity = Math.max(0, Math.min(1, 0.5 + (diff / 40)))
      }

      playSound(correct ? 'thock' : 'error', char, intensity, wpm)
      sendKeystroke(char, charIndex)
    },
    onWordComplete: (word, wordIndex) => {
      sendWordComplete(word, wordIndex)
    },
  })

  // A direct reload on /game/:id must leave time for the socket to restore the
  // authoritative match before treating the route as stale.
  useEffect(() => {
    if (!matchInfo && status === 'idle' && matchId) {
      setRecoveringMatch(true)
      const timeout = window.setTimeout(() => {
        const current = useGameStore.getState()
        if (!current.matchInfo && current.status === 'idle') {
          setRecoveringMatch(false)
          navigate('/dashboard')
        }
      }, 45000)
      return () => window.clearTimeout(timeout)
    }
    setRecoveringMatch(false)
  }, [matchId, matchInfo, status, navigate])


  // Synchronized Start Logic
  useEffect(() => {
    // Only run if we have a start time and are in waiting state
    if (status === 'waiting' && startTime) {
      let animationHandle: number

      const updateCountdown = () => {
        const now = Date.now() + timeOffset
        const diff = startTime - now

        if (diff <= 0) {
          // Keep input locked until the server confirms both players are
          // connected and the match is ACTIVE.
          setAutoStartCountdown(0)
          return
        }

        // Convert to seconds, rounded up (3.5s -> 4, 0.1s -> 1, 0 -> GO)
        const seconds = Math.ceil(diff / 1000)
        setAutoStartCountdown(seconds)

        animationHandle = requestAnimationFrame(updateCountdown)
      }

      animationHandle = requestAnimationFrame(updateCountdown)
      return () => cancelAnimationFrame(animationHandle)
    } else if (status === 'waiting' && !startTime) {
      // Fallback for legacy/local starts (if any)
      // This handles the case where matchInfo is set but GAME_START hasn't arrived with a timestamp yet
      // We just wait or show a generic "Get Ready"
      setAutoStartCountdown(null)
    }
  }, [status, startTime, timeOffset])

  useEffect(() => {
    if (status !== 'waiting' || startTime || !readyExpiresAt) {
      setReadySecondsLeft(null)
      return
    }
    const updateReadyClock = () => {
      setReadySecondsLeft(Math.max(0, Math.ceil((readyExpiresAt - (Date.now() + timeOffset)) / 1000)))
    }
    updateReadyClock()
    const timer = window.setInterval(updateReadyClock, 250)
    return () => window.clearInterval(timer)
  }, [status, startTime, readyExpiresAt, timeOffset])

  // Game timer - starts when status becomes 'playing'
  useEffect(() => {
    if (status !== 'playing') return

    // Capture start time relative to server time to ensure synchronization
    // If startTime is available (from GAME_START), use it. Otherwise fall back to current synced time.
    const gamePhaseStartTime = startTime || (Date.now() + timeOffset)
    const duration = matchDuration || DEFAULT_GAME_DURATION_SECONDS

    const interval = setInterval(() => {
      const now = Date.now() + timeOffset
      // Calculate elapsed time based on the absolute start time
      // This handles refresh/rejoin and latency perfectly
      const elapsed = Math.floor((now - gamePhaseStartTime) / 1000)
      const newRemaining = Math.max(0, duration - elapsed)

      useGameStore.setState({ timeRemaining: newRemaining })

      if (newRemaining <= 0) {
        clearInterval(interval)
      }
    }, 100) // Update frequently for smoothness, but logic relies on delta

    return () => clearInterval(interval)
  }, [status, timeOffset, startTime, matchDuration])

  // Play Again: leave queue, reset, wait, then join queue
  const handlePlayAgain = useCallback(() => {
    leaveQueue();
    reset();
    setTimeout(() => {
      navigate('/dashboard');
    }, 500); // 500ms delay for backend cleanup
  }, [leaveQueue, reset, navigate])

  const handleCancelReady = () => {
    leaveQueue()
    useGameStore.getState().cancelPendingMatch('Match cancelled. No stats or rewards changed.')
    navigate('/dashboard')
  }

  const handleConfirmLeave = () => {
    setConfirmLeave(false)
    leaveMatch()
  }

  // Render based on game state
  return (
    <div className={`fixed inset-0 h-[100dvh] w-full flex flex-col bg-bg-primary z-50 ${status === 'finished' ? 'overflow-auto' : 'overflow-hidden'}`}>
      <AnimatePresence mode="wait">
        {/* Active Game (Waiting or Playing) */}
        {(status === 'playing' || status === 'waiting') && (
          <motion.div
            key="game"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="flex-1 flex flex-col relative"
          >
            {status === 'waiting' && (
              <div className="absolute inset-0 z-50 flex items-center justify-center bg-[#050505]">
                <section className="w-full max-w-xl px-5 text-center">
                  <p className="text-xs font-medium uppercase tracking-[0.16em] text-rose-300">
                    {matchInfo?.gameMode === 'training' ? 'Training' : matchInfo?.gameMode === 'friends' ? 'Friends match' : 'Ranked match'}
                  </p>

                  <div className="mt-10 grid grid-cols-[1fr_auto_1fr] items-center gap-4 sm:gap-8">
                    <div className="flex min-w-0 flex-col items-center gap-2">
                      {user?.photoURL ? (
                        <img src={user.photoURL} alt="" className="h-12 w-12 rounded-full object-cover" crossOrigin="anonymous" referrerPolicy="no-referrer" />
                      ) : (
                        <span aria-hidden="true" className="grid h-12 w-12 place-items-center rounded-full border border-white/10 bg-white/[0.04] text-sm text-white/70">
                          {user?.displayName?.charAt(0) || 'Y'}
                        </span>
                      )}
                      <span className="max-w-full truncate text-sm font-medium text-white">{user?.displayName?.split(' ')[0] || 'You'}</span>
                      <span className="font-mono text-xs text-white/40">{stats?.currentElo || 1000}</span>
                    </div>

                    <span aria-hidden="true" className="text-xs font-medium text-white/30">VS</span>

                    <div className="flex min-w-0 flex-col items-center gap-2">
                      {matchInfo?.opponentPhotoURL && !matchInfo.opponentIsBot ? (
                        <img src={matchInfo.opponentPhotoURL} alt="" className="h-12 w-12 rounded-full object-cover" crossOrigin="anonymous" referrerPolicy="no-referrer" />
                      ) : (
                        <span aria-hidden="true" className="grid h-12 w-12 place-items-center rounded-full border border-white/10 bg-white/[0.04] text-sm text-white/55">
                          {matchInfo?.opponentIsBot ? 'AI' : matchInfo?.opponentDisplayName?.charAt(0) || '?'}
                        </span>
                      )}
                      <span className="max-w-full truncate text-sm font-medium text-white">{matchInfo?.opponentDisplayName?.split(' ')[0] || 'Opponent'}</span>
                      <span className="font-mono text-xs text-white/40">{matchInfo?.opponentIsBot ? 'Bot' : matchInfo?.opponentElo || '—'}</span>
                    </div>
                  </div>

                  <div aria-live="polite" className="mt-10 flex min-h-36 flex-col items-center justify-center">
                    {startTime ? (
                      <>
                        {autoStartCountdown !== null && autoStartCountdown > 0 ? (
                          <>
                            <p className="mb-3 text-xs uppercase tracking-[0.16em] text-white/40">Match starts in</p>
                            <span className="font-mono text-7xl font-medium tabular-nums tracking-tight text-white">{autoStartCountdown}</span>
                          </>
                        ) : (
                          <>
                            <span aria-hidden="true" className="mb-4 h-6 w-6 animate-spin rounded-full border-2 border-white/15 border-t-rose-300" />
                            <p className="text-lg font-semibold text-white">Connecting players</p>
                            <p className="mt-2 text-sm text-white/45">
                              {isConnected ? 'Waiting for the server to confirm the start…' : 'Reconnecting. Your match will resume automatically.'}
                            </p>
                          </>
                        )}
                      </>
                    ) : (
                      <>
                        <p className="text-lg font-semibold text-white">{youReady ? 'You’re ready' : 'Ready when you are'}</p>
                        <p className="mt-2 text-sm text-white/45">
                          {!isConnected
                            ? 'Reconnecting to the match service…'
                            : youReady && !opponentReady
                              ? 'Waiting for your opponent to get ready'
                              : opponentReady
                                ? 'Your opponent is ready'
                                : 'Both players must be ready before the race starts'}
                        </p>
                        {readySecondsLeft !== null && (
                          <p className="mt-2 font-mono text-xs tabular-nums text-white/30">{readySecondsLeft}s</p>
                        )}
                        <div className="mt-6 flex flex-wrap justify-center gap-3">
                          <button
                            type="button"
                            onClick={() => matchInfo && readyForMatch(matchInfo.matchId)}
                            disabled={!isConnected || youReady || !matchInfo}
                            className="min-w-36 rounded-xl bg-rose-400 px-6 py-3 text-sm font-semibold text-white transition hover:bg-rose-300 disabled:cursor-not-allowed disabled:bg-white/10 disabled:text-white/40"
                          >
                            {youReady ? 'Ready' : 'I’m ready'}
                          </button>
                          <button
                            type="button"
                            onClick={handleCancelReady}
                            className="rounded-xl border border-white/10 px-5 py-3 text-sm text-white/55 transition hover:border-white/20 hover:text-white"
                          >
                            Cancel match
                          </button>
                        </div>
                      </>
                    )}
                  </div>
                </section>
              </div>
            )}

            {status === 'playing' && timeRemaining === 0 && (
              <div role="status" aria-live="polite" className="absolute inset-0 z-40 flex items-center justify-center bg-[#08090d]/95 backdrop-blur-sm">
                <div className="text-center">
                  <p className="mb-3 font-mono text-xs uppercase tracking-[0.2em] text-rose-300">Time is up</p>
                  <p className="text-3xl font-semibold tracking-tight text-white">Preparing your results</p>
                  <p className="mt-3 text-sm text-white/50">The match is complete. Calculating the final score…</p>
                </div>
              </div>
            )}

            {/* Header with timer and stats */}
            <header className={`flex items-center justify-between px-4 sm:px-8 md:px-12 py-3 sm:py-4 md:py-6 border-b border-white/10 bg-bg-secondary sticky top-0 z-30 transition-all duration-500
                              ${zenMode && status === 'playing' ? 'opacity-0 hover:opacity-100' : 'opacity-100'}`}>

              {/* Controls (Zen & Sound) - Absolute Left or Integrated */}
              <div className="absolute left-1/2 -translate-x-1/2 bottom-full mb-2 flex items-center gap-2 opacity-0 group-hover:opacity-100 transition-opacity">
                {/* This would be a floating menu, but let's put it in the header for simplicity */}
              </div>

              {/* Player Stats (Top Left) */}
              <div className="flex items-center gap-6">
                <div className="flex flex-col gap-0.5 sm:gap-1">
                  <div className="text-[10px] sm:text-sm text-text-muted uppercase tracking-wider font-bold">YOU</div>
                  <div className="flex gap-3 sm:gap-6">
                    <div>
                      <span className="text-[10px] sm:text-xs text-text-muted uppercase tracking-wider">WPM</span>
                      <p className="text-lg sm:text-2xl font-mono text-text-primary">{wpm}</p>
                    </div>
                    <div>
                      <span className="text-[10px] sm:text-xs text-text-muted uppercase tracking-wider">ACC</span>
                      <p className="text-lg sm:text-2xl font-mono text-text-primary">{accuracy}%</p>
                    </div>
                  </div>
                </div>

                {/* Game Controls */}
                <div className="hidden sm:flex items-center gap-2 ml-4 px-3 py-1.5 rounded-full bg-white/5 border border-white/5">
                  <div className="flex items-center gap-1.5 px-2 border-r border-white/10 mr-1">
                    <span className={`w-1.5 h-1.5 rounded-full ${ping < 100 ? 'bg-emerald-500' : ping < 200 ? 'bg-yellow-500' : 'bg-red-500'}`} />
                    <span className="text-[10px] font-mono text-white/50">{ping}ms</span>
                  </div>
                  <button onClick={toggleSound} className={`p-1.5 rounded-full transition-colors ${soundEnabled ? 'text-white hover:bg-white/10' : 'text-text-muted hover:text-white'}`} title="Toggle Sound">
                    {soundEnabled ? (
                      <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><polygon points="11 5 6 9 2 9 2 15 6 15 11 19 11 5"></polygon><path d="M19.07 4.93a10 10 0 0 1 0 14.14M15.54 8.46a5 5 0 0 1 0 7.07"></path></svg>
                    ) : (
                      <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><polygon points="11 5 6 9 2 9 2 15 6 15 11 19 11 5"></polygon><line x1="23" y1="9" x2="17" y2="15"></line><line x1="17" y1="9" x2="23" y2="15"></line></svg>
                    )}
                  </button>
                  <button onClick={toggleZenMode} className={`p-1.5 rounded-full transition-colors ${zenMode ? 'text-accent-focus bg-accent-focus/10' : 'text-text-muted hover:text-white'}`} title="Zen Mode">
                    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M15 3h6v6M9 21H3v-6M21 3l-7 7M3 21l7-7" /></svg>
                  </button>
                </div>
              </div>

              {/* Timer (Center) */}
              <div
                className={`text-3xl sm:text-5xl md:text-6xl font-mono font-bold tabular-nums transition-colors duration-300 ${timeRemaining <= 10 ? 'text-accent-error animate-pulse' : 'text-text-primary'
                  }`}
              >
                {timeRemaining}
              </div>

              {/* Opponent Stats (Top Right) */}
              <div className="flex items-center gap-3">
                <div className="flex flex-col gap-0.5 sm:gap-1 items-end text-right">
                <div className="flex items-center gap-1 sm:gap-2">
                  {matchInfo?.opponentIsBot && (
                    <span className="text-[8px] sm:text-[10px] px-1 sm:px-1.5 py-0.5 bg-violet-500/20 text-violet-300 rounded border border-violet-500/30">AI</span>
                  )}
                  {/* Violet indicator to match opponent cursor */}
                  <div className="w-1 h-1 sm:w-1.5 sm:h-1.5 rounded-full bg-violet-500"></div>
                  <div className="text-[10px] sm:text-sm text-violet-300 uppercase tracking-wider font-bold max-w-[60px] sm:max-w-none truncate">
                    {matchInfo?.opponentDisplayName || 'Opponent'}
                  </div>
                </div>
                {/* Show opponent progress indicator */}
                <div className="text-[10px] sm:text-xs text-violet-400/70 flex items-center gap-1 sm:gap-1.5 h-4">
                  {opponentCharIndex > 0 && (
                    <>
                      <span className="inline-block w-1 h-1 rounded-full bg-violet-400 animate-pulse"></span>
                      Typing...
                    </>
                  )}
                </div>
                </div>
                {status === 'playing' && (
                  <button
                    type="button"
                    onClick={() => setConfirmLeave(true)}
                    className="rounded-lg border border-white/10 px-3 py-2 text-xs font-medium text-white/45 transition hover:border-rose-300/30 hover:text-rose-200 focus-visible:outline focus-visible:outline-2 focus-visible:outline-rose-400"
                  >
                    Leave
                  </button>
                )}
              </div>
            </header>

            {/* Typing Area */}
            <main className="flex-1 flex items-start sm:items-center justify-center px-4 sm:px-6 md:px-8 pt-8 sm:pt-0 overflow-y-auto">
              <TypingArea
                words={words}
                inputRef={inputRef}
                onKeyDown={handleKeyDown}
                onMobileInput={handleMobileInput}
                opponentCharIndex={opponentCharIndex}
                opponentWordIndex={opponentWordIndex}
                playerCursor={equippedCursor}
                playerEffect={equippedEffect}
                opponentCursor={matchInfo?.opponentCursor || 'default'}
                opponentEffect={matchInfo?.opponentEffect}
              />
            </main>
          </motion.div>
        )}

        {/* Results */}
        {status === 'finished' && result && (
          <motion.div
            key="finished"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="flex-1 flex items-center justify-center overflow-y-auto w-full h-full"
          >
            <Result result={result} onPlayAgain={handlePlayAgain} keyStats={keyStats} />
          </motion.div>
        )}
      </AnimatePresence>
      {status === 'idle' && recoveringMatch && (
        <div role="status" aria-live="polite" className="fixed inset-0 z-[60] grid place-items-center bg-[#070708] px-5 text-center">
          <section className="max-w-sm">
            <span aria-hidden="true" className="mx-auto mb-5 block h-7 w-7 animate-spin rounded-full border-2 border-white/15 border-t-rose-300" />
            <h1 className="text-xl font-semibold tracking-tight text-white">Rejoining your match</h1>
            <p className="mt-2 text-sm leading-6 text-white/50">
              {isConnected ? 'Restoring the match state…' : 'Waiting for a stable connection. Your match is being kept safe.'}
            </p>
          </section>
        </div>
      )}
      {confirmLeave && status === 'playing' && (
        <div role="alertdialog" aria-modal="true" aria-labelledby="leave-match-title" className="fixed inset-0 z-[80] grid place-items-center bg-black/75 px-5 backdrop-blur-sm">
          <section className="w-full max-w-sm rounded-2xl border border-white/10 bg-[#101012] p-6 shadow-2xl">
            <h2 id="leave-match-title" className="text-lg font-semibold text-white">Leave this match?</h2>
            <p className="mt-2 text-sm leading-6 text-white/55">Your opponent will win by forfeit. You won’t receive match rewards.</p>
            <div className="mt-6 flex justify-end gap-3">
              <button type="button" onClick={() => setConfirmLeave(false)} className="rounded-lg border border-white/10 px-4 py-2 text-sm text-white/60 hover:text-white">Keep playing</button>
              <button type="button" onClick={handleConfirmLeave} className="rounded-lg bg-rose-400 px-4 py-2 text-sm font-semibold text-white transition hover:bg-rose-300">Leave match</button>
            </div>
          </section>
        </div>
      )}
    </div>
  )
}
