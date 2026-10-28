/*   ______      __ ____  _______       _  ____  _   _ 
 *  |  ____|   / / __ \|__   __|/\   | |/ __ \| \ | |
 *  | |__   _ / / |  | |  | |  /  \  | | |  | |  \| |
 *  |  __| | v /| |  | |  | | / /\ \ | | |  | | . ` |
 *  | |____ \ / | |__| |  | |/ ____ \| | |__| | |\  |
 *  |______| \_/ \____/   |_/_/    \_\_|\____/|_| \_|
 *                                                      
 */

/**
 * Result Component - Displays match outcomes, stats, and ELO changes.
 * Handles victory/defeat animations and play again functionality.
 * 
 * --------------------------------------------------------------------------
 *                                  Functions
 * --------------------------------------------------------------------------
 * Result: Main component.
 * MobileStatsRow: Helper for mobile layout rows.
 * MobilePlayerCard: Helper for mobile player profile.
 * MobileStatsGrid: Helper for mobile stats grid.
 * 
 * --------------------------------------------------------------------------
 *                            Variables and others
 * --------------------------------------------------------------------------
 * isWin: Result status.
 * eloChange: Calculations for ELO change.
 * displayedElo: Animated ELO value.
 * springElo: Spring animation for ELO.
 * 
 * --------------------------------------------------------------------------
 *                                   imports
 * --------------------------------------------------------------------------
 * react: React hooks.
 * framer-motion: Animations.
 * stores: Auth, Game stores.
 * hooks: useWebSocket, useSound.
 * types: MatchResult, Ranks.
 */

import { motion, useSpring, AnimatePresence } from 'framer-motion'
import { useEffect, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { useAuthStore } from '../stores/authStore'
import type { MatchResult } from '../types'
import { getRankFromElo, getRankColor } from '../types'
import { useWebSocket } from '../hooks/useWebSocket'
import { useGameStore } from '../stores/gameStore'
import { useSound } from '../hooks/useSound'

interface ResultProps {
  result: MatchResult
  onPlayAgain: () => void
  keyStats?: Record<string, { total: number; errors: number }>
}

export default function Result({ result, onPlayAgain, keyStats }: ResultProps) {
  const navigate = useNavigate()
  const { joinQueue, joinTrainingQueue, leaveQueue } = useWebSocket()
  const { playSound } = useSound()
  const isWin = result.result === 'win'
  const isTie = result.result === 'tie'
  const isTraining = result.gameMode === 'training'
  const isFriends = result.gameMode === 'friends'

  const eloChange = isTraining ? 0 : result.yourEloChange

  // Play victory/defeat sound on mount using the sound hook
  useEffect(() => {
    // Small delay to ensure browser allows audio (after user interaction in game)
    const timer = setTimeout(() => {
      if (isWin) {
        playSound('victory')
      } else if (!isTie) {
        playSound('defeat')
      }
    }, 100)
    return () => clearTimeout(timer)
  }, [isWin, isTie, playSound])

  // Elo Animation
  const [displayedElo, setDisplayedElo] = useState(result.yourEloBefore)
  const springElo = useSpring(result.yourEloBefore, { duration: 2000, bounce: 0 })

  // Animated ELO change display
  const [displayedChange, setDisplayedChange] = useState(0)
  const [showChange, setShowChange] = useState(false)
  const springChange = useSpring(0, { duration: 1500, bounce: 0.2 })

  useEffect(() => {
    const timeout = setTimeout(() => {
      springElo.set(result.yourEloAfter)
    }, 500)

    // Start change animation after a delay
    const changeTimeout = setTimeout(() => {
      setShowChange(true)
      springChange.set(eloChange)
    }, 800)

    const unsubscribe = springElo.on('change', (latest) => {
      setDisplayedElo(Math.round(latest))
    })

    const unsubscribeChange = springChange.on('change', (latest) => {
      setDisplayedChange(Math.round(latest))
    })

    return () => {
      clearTimeout(timeout)
      clearTimeout(changeTimeout)
      unsubscribe()
      unsubscribeChange()
    }
  }, [result.yourEloAfter, eloChange, springElo, springChange])

  // Keyboard shortcut: Press 'R' to play again
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      // Only trigger if no modifiers and key is r/R
      if (!e.ctrlKey && !e.altKey && !e.metaKey && e.key.toLowerCase() === 'r') {
        onPlayAgain()
      }
    }
    window.addEventListener('keydown', handleKeyDown)
    return () => window.removeEventListener('keydown', handleKeyDown)
  }, [onPlayAgain])

  // Rank Up Check
  const rankBefore = getRankFromElo(result.yourEloBefore)
  const rankAfter = getRankFromElo(result.yourEloAfter)
  const isRankUp = rankAfter !== rankBefore && eloChange > 0

  const containerVariants = {
    hidden: { opacity: 0 },
    visible: {
      opacity: 1,
      transition: {
        duration: 0.25,
        when: "beforeChildren",
        staggerChildren: 0.04
      }
    }
  }

  const itemVariants = {
    hidden: { opacity: 0, y: 4 },
    visible: { opacity: 1, y: 0 }
  }

  const { user } = useAuthStore()

  return (
    <motion.div
      variants={containerVariants}
      initial="hidden"
      animate="visible"
      className="relative mx-auto flex min-h-full w-full max-w-6xl flex-col justify-center px-4 py-5 sm:px-6 sm:py-8"
    >
      <motion.div
        variants={itemVariants}
        className="mb-5 text-center sm:mb-7"
      >
        <p className="mb-2 text-xs font-medium uppercase tracking-[0.14em] text-white/45">
          {isTraining ? 'Training' : isFriends ? 'Friends match' : 'Ranked match'}
        </p>

        <motion.h2
          initial={{ opacity: 0, y: 4 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.25 }}
          className={`text-4xl font-semibold tracking-tight sm:text-5xl ${isWin ? 'text-emerald-300' : isTie ? 'text-white/80' : 'text-rose-300'}`}
        >
          {isWin ? 'Victory' : isTie ? 'Draw' : 'Defeat'}
        </motion.h2>

        {/* Your Elo Change - Minimal */}
        {!isTraining && eloChange !== 0 && (
          <motion.div
            initial={{ opacity: 0, y: 5 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.4 }}
            className="mt-4 flex items-center justify-center gap-2"
          >
            <span className="text-xs uppercase tracking-widest text-white/40">Rating Change</span>
            <span className={`font-mono text-xl ${eloChange > 0 ? 'text-emerald-400' : 'text-red-400'}`}>
              {eloChange > 0 ? '+' : ''}{displayedChange}
            </span>
          </motion.div>
        )}

        {/* Coins Earned Display */}
        {result.coinsEarned !== undefined && result.coinsEarned > 0 && (
          <motion.div
            initial={{ opacity: 0, y: 5 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.6 }}
            className="mt-2 flex items-center justify-center gap-2 text-sm"
          >
            <span aria-hidden="true" className="text-rose-300">◉</span>
            <span className="font-mono font-semibold tabular-nums text-white">+{result.coinsEarned} coins</span>
          </motion.div>
        )}
      </motion.div>

      {/* Main Stats Card - Minimal Transparent */}
      <motion.div
        variants={itemVariants}
        className="mx-auto w-full max-w-4xl rounded-2xl border border-white/[0.08] bg-[#08090b] p-2 sm:p-4"
      >
        {/* Main card - No background, just clean layout */}
        <div className="relative">

          {/* Desktop Layout: Clean Table-like Structure */}
          <div className="relative z-10 hidden rounded-2xl p-4 md:block md:p-6">
            {/* Players Header Row */}
            <div className="flex items-end justify-between mb-8 px-4">
              {/* Player (Left) */}
              <div className="flex flex-col items-start gap-3">
                <div className="relative">
                  <div className={`h-16 w-16 rounded-full border ${isWin ? 'border-emerald-400/60' : 'border-white/15'} p-1`}>
                    {user?.photoURL ? (
                      <img src={user.photoURL} alt="You" className="w-full h-full rounded-full object-cover" crossOrigin="anonymous" referrerPolicy="no-referrer" />
                    ) : (
                      <div className="w-full h-full rounded-full bg-white/5 flex items-center justify-center text-xl font-light text-white/60">
                        {user?.displayName?.charAt(0) || 'Y'}
                      </div>
                    )}
                  </div>
                  {isRankUp && (
                    <div className="absolute -bottom-2 -right-2 bg-emerald-500 text-black text-[9px] font-bold px-1.5 py-0.5 rounded uppercase tracking-wide">
                      Rank Up
                    </div>
                  )}
                </div>
                <div>
                  <h3 className="text-2xl font-light text-white tracking-tight">You</h3>
                  <div className="flex items-center gap-2">
                    <p className="text-xs text-white/40 uppercase tracking-wider">{rankAfter}</p>
                    <span className="text-xs font-mono text-white/60">{displayedElo}</span>
                  </div>
                  {isWin && <span className="mt-1 inline-flex rounded-full border border-emerald-400/25 bg-emerald-400/10 px-2 py-0.5 text-[9px] font-bold uppercase tracking-[0.16em] text-emerald-300">Winner</span>}
                </div>
              </div>

              {/* VS Divider */}
              <div className="flex flex-col items-center pb-4">
                <div className="mb-2 h-12 w-px bg-gradient-to-b from-white/0 via-white/20 to-white/0"></div>
                <span className="text-xs font-light uppercase tracking-[0.2em] text-white/40">VS</span>
                <div className="mt-2 h-12 w-px bg-gradient-to-b from-white/0 via-white/20 to-white/0"></div>
              </div>

              {/* Opponent (Right) */}
              <div className="flex flex-col items-end gap-3 text-right">
                <div className="relative">
                  <div className={`h-16 w-16 rounded-full border ${!isWin && !isTie ? 'border-emerald-400/60' : 'border-white/15'} p-1`}>
                    {result.opponentPhotoURL && !result.opponentIsBot ? (
                      <img src={result.opponentPhotoURL} alt={result.opponentDisplayName} className="w-full h-full rounded-full object-cover" crossOrigin="anonymous" referrerPolicy="no-referrer" />
                    ) : (
                      <div className="w-full h-full rounded-full bg-white/5 flex items-center justify-center text-xl font-light text-white/60">
                        {result.opponentIsBot ? (
                          <svg width="60%" height="60%" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" className="text-white/60">
                            <rect x="3" y="11" width="18" height="10" rx="2" />
                            <circle cx="12" cy="5" r="2" />
                            <path d="M12 7v4" />
                            <line x1="8" y1="16" x2="8" y2="16" />
                            <line x1="16" y1="16" x2="16" y2="16" />
                          </svg>
                        ) : (
                          result.opponentDisplayName?.charAt(0) || '?'
                        )}
                      </div>
                    )}
                  </div>
                </div>
                <div>
                  <h3 className="text-2xl font-light text-white tracking-tight">{result.opponentIsBot ? 'Bot' : result.opponentDisplayName}</h3>
                  <div className="flex items-center justify-end gap-2">
                    {/* Opponent Elo Change */}
                    {!isTraining && result.opponentEloChange !== 0 && (
                      <span className={`text-xs font-mono ${result.opponentEloChange > 0 ? 'text-emerald-400' : 'text-red-400'}`}>
                        {result.opponentEloChange > 0 ? '+' : ''}{result.opponentEloChange}
                      </span>
                    )}
                    <span className="text-xs font-mono text-white/60">{result.opponentElo ?? (result.opponentIsBot ? 1000 : '???')}</span>
                    <p className="text-xs text-white/40 uppercase tracking-wider">{result.opponentRank}</p>
                  </div>
                  {!isWin && !isTie && <span className="mt-1 inline-flex rounded-full border border-emerald-400/25 bg-emerald-400/10 px-2 py-0.5 text-[9px] font-bold uppercase tracking-[0.16em] text-emerald-300">Winner</span>}
                </div>
              </div>
            </div>

            {/* Stats Grid - Minimal Lines */}
            <div className="divide-y divide-white/[0.08] border-y border-white/[0.08]">
              {/* Rows */}
              {[
                {
                  label: 'Net WPM',
                  p1: Number(result.yourWpm.toFixed(1)).toString(),
                  p2: Number(result.opponentWpm.toFixed(1)).toString(),
                  p1Value: result.yourWpm,
                  p2Value: result.opponentWpm
                },
                {
                  label: 'Accuracy',
                  p1: Math.round(result.yourAccuracy) + '%',
                  p2: Math.round(result.opponentAccuracy) + '%',
                  p1Value: result.yourAccuracy,
                  p2Value: result.opponentAccuracy
                },
                {
                  label: 'Score',
                  p1: Math.round(result.yourScore),
                  p2: Math.round(result.opponentScore),
                  p1Value: result.yourScore,
                  p2Value: result.opponentScore
                }
              ].map((row) => {
                const p1Leads = row.p1Value > row.p2Value
                const p2Leads = row.p2Value > row.p1Value
                return (
                  <div key={row.label} className="flex items-center px-4 py-4 transition-colors hover:bg-white/[0.02]">
                    <div className="flex-1 text-left">
                      <div className="flex items-center gap-2">
                        <span className={`text-2xl font-mono font-medium tabular-nums ${p1Leads ? 'text-emerald-300' : 'text-white/75'}`}>{row.p1}</span>
                        {p1Leads && <span className="text-[9px] font-bold uppercase tracking-wider text-emerald-300/80">Stat edge</span>}
                      </div>
                    </div>
                    <div className="w-32 text-center text-xs font-semibold uppercase tracking-[0.16em] text-white/55">
                      {row.label}
                    </div>
                    <div className="flex-1 text-right">
                      <div className="flex items-center justify-end gap-2">
                        {p2Leads && <span className="text-[9px] font-bold uppercase tracking-wider text-emerald-300/80">Stat edge</span>}
                        <span className={`text-2xl font-mono font-medium tabular-nums ${p2Leads ? 'text-emerald-300' : 'text-white/75'}`}>{row.p2}</span>
                      </div>
                    </div>
                  </div>
                )
              })}
            </div>
          </div>

          {/* Mobile Layout: Stacked Minimal */}
          <div className="block md:hidden">
            <div className="grid grid-cols-2 gap-4 mb-6">
              {/* You */}
              <div className="bg-white/[0.02] rounded-lg p-4 flex flex-col items-center">
                <div className="w-12 h-12 rounded-full bg-white/10 mb-2 overflow-hidden">
                  {user?.photoURL ? <img src={user.photoURL} alt="You" /> : <div className="w-full h-full flex items-center justify-center">Y</div>}
                </div>
                <div className="font-bold text-white mb-0.5">You</div>
                <div className="text-[10px] text-white/40 mb-2">{rankAfter}</div>
                <div className={`text-xs font-mono ${eloChange > 0 ? 'text-emerald-400' : 'text-red-400'}`}>
                  {eloChange > 0 ? '+' : ''}{displayedChange}
                </div>
              </div>

              {/* Opponent */}
              <div className="bg-white/[0.02] rounded-lg p-4 flex flex-col items-center">
                <div className="w-12 h-12 rounded-full bg-white/10 mb-2 overflow-hidden">
                  {result.opponentPhotoURL ? <img src={result.opponentPhotoURL} alt="Opp" /> : <div className="w-full h-full flex items-center justify-center">?</div>}
                </div>
                <div className="font-bold text-white mb-0.5 truncate max-w-full">{result.opponentDisplayName}</div>
                <div className="text-[10px] text-white/40 mb-2">{result.opponentRank}</div>
                {!isTraining && (
                  <div className={`text-xs font-mono flex items-center gap-1 ${result.opponentEloChange > 0 ? 'text-emerald-400' : 'text-red-400'}`}>
                    <span>{result.opponentEloChange > 0 ? '+' : ''}{result.opponentEloChange}</span>
                  </div>
                )}
              </div>
            </div>

            {/* Mobile Stats */}
            <div className="space-y-2">
              <MobileStatsRow label="NET WPM" p1={result.yourWpm} p2={result.opponentWpm} />
              <MobileStatsRow label="ACC" p1={Math.round(result.yourAccuracy) + '%'} p2={Math.round(result.opponentAccuracy) + '%'} />
              <MobileStatsRow label="SCORE" p1={Math.round(result.yourScore)} p2={Math.round(result.opponentScore)} />
            </div>
          </div>

          {/* Trouble Keys - Minimal */}
          {keyStats && Object.keys(keyStats).some(k => keyStats[k].errors > 0) && (
            <div className="mt-8 flex flex-col items-center gap-3">
                  <span className="text-[10px] font-semibold uppercase tracking-[0.18em] text-white/55">Opportunities for Improvement</span>
              <div className="flex gap-2">
                {Object.entries(keyStats)
                  .filter(([_, stats]) => stats.errors > 0)
                  .sort((a, b) => b[1].errors - a[1].errors)
                  .slice(0, 4)
                  .map(([key]) => (
                    <span key={key} className="flex h-8 w-8 items-center justify-center rounded border border-white/10 bg-white/[0.02] font-mono text-sm text-white/70">
                      {key.toUpperCase()}
                    </span>
                  ))}
              </div>
            </div>
          )}
        </div>
      </motion.div>

      {/* Action Buttons - Minimal Outlines */}
      <motion.div
        variants={itemVariants}
        className="mt-5 flex items-center justify-center gap-2 pb-2 sm:mt-7 sm:gap-3"
      >
        <button
          onClick={() => {
            useGameStore.getState().reset()
            navigate('/dashboard')
          }}
          className="rounded-lg px-4 py-3 text-sm text-white/50 transition-colors hover:bg-white/[0.04] hover:text-white"
        >
          Dashboard
        </button>

        <button
          onClick={() => {
            useGameStore.getState().reset();
            useGameStore.getState().leaveQueue();
            leaveQueue();
            setTimeout(() => {
              if (isTraining) {
                useGameStore.getState().joinTrainingQueue();
                joinTrainingQueue();
              } else {
                useGameStore.getState().joinQueue();
                joinQueue();
              }
              navigate('/dashboard');
            }, 500);
          }}
          className="flex items-center gap-2 rounded-xl border border-rose-400/30 bg-rose-400/[0.08] px-5 py-3 text-sm font-medium text-rose-200 transition-colors hover:border-rose-300/50 hover:bg-rose-400/[0.14]"
        >
          {isTraining ? 'Train Again' : 'Play Again'}
          <span className="text-[10px] opacity-40 border border-current px-1 rounded">R</span>
        </button>
      </motion.div>
    </motion.div >
  )
}

function MobileStatsRow({ label, p1, p2 }: { label: string, p1: string | number, p2: string | number }) {
  const v1 = Number.parseFloat(p1.toString())
  const v2 = Number.parseFloat(p2.toString())
  const p1Leads = v1 > v2
  const p2Leads = v2 > v1
  return (
    <div className="flex items-center justify-between rounded-lg border border-white/[0.08] bg-white/[0.025] p-3">
      <div className="flex items-center gap-1.5">
        <span className={`font-mono font-bold tabular-nums ${p1Leads ? 'text-emerald-300' : 'text-white/75'}`}>{p1}</span>
        {p1Leads && <span className="text-[8px] font-bold uppercase tracking-wider text-emerald-300/80">Edge</span>}
      </div>
      <span className="text-[10px] font-medium uppercase tracking-widest text-white/50">{label}</span>
      <div className="flex items-center gap-1.5">
        {p2Leads && <span className="text-[8px] font-bold uppercase tracking-wider text-emerald-300/80">Edge</span>}
        <span className={`font-mono font-bold tabular-nums ${p2Leads ? 'text-emerald-300' : 'text-white/75'}`}>{p2}</span>
      </div>
    </div>
  )
}

// ----------------------------------------------------------------------
// Sub-components
// ----------------------------------------------------------------------

// Mobile-specific player card component
interface MobilePlayerCardProps {
  name: string
  rank: string
  isWinner: boolean
  rating?: number
  ratingChange?: number
  displayedChange?: number
  showChange?: boolean
  photoUrl?: string | null
  isYou: boolean
}

function MobilePlayerCard({ name, rank, isWinner, rating, ratingChange, displayedChange, showChange, photoUrl, isYou }: MobilePlayerCardProps) {
  return (
    <div className="flex flex-col items-center gap-2">
      {/* Compact Avatar */}
      <div className={`w-14 h-14 sm:w-16 sm:h-16 rounded-full border-2 ${isWinner ? 'border-accent-correct/50' : 'border-white/10'} 
         flex items-center justify-center text-xl font-bold relative bg-bg-tertiary overflow-hidden shadow-lg shrink-0
       `}>
        {photoUrl ? (
          <img
            src={photoUrl}
            alt={name}
            className="w-full h-full object-cover"
            crossOrigin="anonymous"
            referrerPolicy="no-referrer"
          />
        ) : (
          <div className={`w-full h-full flex items-center justify-center ${isYou ? 'bg-accent-correct/10' : 'bg-accent-error/10'}`}>
            {name.charAt(0).toUpperCase()}
          </div>
        )}

        {/* Winner Badge */}
        {isWinner && (
          <div className="absolute -bottom-0.5 bg-accent-correct text-black text-[7px] px-1.5 py-0.5 rounded-full font-black uppercase">
            Win
          </div>
        )}
      </div>

      {/* Name & Rank */}
      <div className="text-center">
        <h3 className="text-sm sm:text-base font-bold text-text-primary truncate max-w-[120px] sm:max-w-[150px]">
          {name}
        </h3>
        <span className="text-[10px] font-medium opacity-80" style={{ color: getRankColor(rank as any) }}>
          {rank}
        </span>
        <AnimatePresence>
          {showChange && ratingChange !== undefined && ratingChange !== 0 && (
            <motion.span
              initial={{ opacity: 0, scale: 0.5, y: 5 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              transition={{ type: "spring", stiffness: 300, damping: 20 }}
              className={`block text-[11px] font-mono font-bold px-1.5 py-0.5 rounded mt-1 ${ratingChange > 0
                ? 'text-accent-correct bg-accent-correct/10'
                : 'text-accent-error bg-accent-error/10'
                }`}
            >
              {ratingChange > 0 ? '+' : ''}{displayedChange ?? ratingChange}
            </motion.span>
          )}
        </AnimatePresence>
      </div>
    </div>
  )
}

// Mobile stats grid - shows stats in a unified comparison format
interface MobileStatsGridProps {
  yourWpm: number
  yourAccuracy: number
  yourScore: number
  opponentWpm: number
  opponentAccuracy: number
  opponentScore: number
}

function MobileStatsGrid({ yourWpm, yourAccuracy, yourScore, opponentWpm, opponentAccuracy, opponentScore }: MobileStatsGridProps) {
  const stats = [
    { label: 'WPM', you: yourWpm, opp: opponentWpm, youRaw: yourWpm, oppRaw: opponentWpm },
    { label: 'ACC', you: `${yourAccuracy}%`, opp: `${opponentAccuracy}%`, youRaw: yourAccuracy, oppRaw: opponentAccuracy },
    { label: 'SCORE', you: yourScore, opp: opponentScore, youRaw: yourScore, oppRaw: opponentScore },
  ]

  return (
    <div className="grid grid-cols-3 gap-2 sm:gap-3">
      {stats.map((stat) => {
        const isYouHigher = stat.youRaw >= stat.oppRaw

        return (
          <div key={stat.label} className="text-center bg-white/[0.02] rounded-lg p-2 sm:p-3 border border-white/5">
            <span className="text-[8px] sm:text-[9px] font-bold text-text-muted tracking-wide block mb-1">{stat.label}</span>

            <div className="flex items-center justify-center gap-1.5 sm:gap-2 text-[10px] sm:text-xs font-mono font-bold">
              <span className={isYouHigher ? 'text-accent-correct' : 'text-text-secondary opacity-80'}>
                {stat.you}
              </span>
              <span className="text-white/10">|</span>
              <span className={!isYouHigher ? 'text-accent-error' : 'text-text-muted opacity-50'}>
                {stat.opp}
              </span>
            </div>
          </div>
        )
      })}
    </div>
  )
}
