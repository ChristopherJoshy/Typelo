/*   ______      __ ____  _______       _  ____  _   _ 
 *  |  ____|   / / __ \|__   __|/\   | |/ __ \| \ | |
 *  | |__   _ / / |  | |  | |  /  \  | | |  | |  \| |
 *  |  __| | v /| |  | |  | | / /\ \ | | |  | | . ` |
 *  | |____ \ / | |__| |  | |/ ____ \| | |__| | |\  |
 *  |______| \_/ \____/   |_/_/    \_\_|\____/|_| \_|
 *                                                      
 */

/**
 * Dashboard Component - Main navigation hub.
 * Displays user stats, matchmaking controls, leaderboards, and live feed.
 * 
 * --------------------------------------------------------------------------
 *                                  Functions
 * --------------------------------------------------------------------------
 * Dashboard: Main component.
 * handlePlay: Initiates matchmaking flow.
 * handleCancelQueue: Cancels active queue.
 * formatQueueTime: Formats elapsed time for UI.
 * 
 * --------------------------------------------------------------------------
 *                            Variables and others
 * --------------------------------------------------------------------------
 * containerVariants: Animation variants for layout.
 * itemVariants: Animation variants for children.
 * activeMatches: Live matches data.
 * selectedMode: Current game mode selection.
 * cooldown: Anti-spam cooldown timer.
 * 
 * --------------------------------------------------------------------------
 *                                   imports
 * --------------------------------------------------------------------------
 * react: React hooks.
 * framer-motion: UI animations.
 * hooks: Auth, WebSocket.
 * stores: Game, Auth, Online.
 * components: Sub-components (UserStats, Leaderboard, etc).
 */

import { useEffect, useState, useRef } from 'react'
import { createPortal } from 'react-dom'
import { useNavigate } from 'react-router-dom'
import { motion, Variants, AnimatePresence } from 'framer-motion'
import { useAuth } from '../hooks/useAuth'
import { useWebSocket } from '../hooks/useWebSocket'
import { useGameStore } from '../stores/gameStore'
import { useAuthStore } from '../stores/authStore'
import { GameMode, PROFILE_BACKGROUNDS } from '../types'
import UserStats from './UserStats'
import Leaderboard from './Leaderboard'
import ProfileModal from './ProfileModal'
import FriendsModal from './FriendsModal'
import LiveMatchFeed from './LiveMatchFeed'
import DailyRewardModal from './DailyRewardModal'
import UpdateModal from './UpdateModal'
import SettingsModal from './SettingsModal'
import { getFriends, getDailyStatus } from '../config/api'
import { useOnlineStore } from '../stores/onlineStore'
import { useInventoryStore } from '../stores/inventoryStore'
import { usePreferencesStore } from '../stores/preferencesStore'

const containerVariants: Variants = {
  hidden: { opacity: 0 },
  visible: {
    opacity: 1,
    transition: {
      staggerChildren: 0.1,
      delayChildren: 0.2
    }
  }
}

const itemVariants: Variants = {
  hidden: { opacity: 0, y: 20 },
  visible: {
    opacity: 1,
    y: 0,
    transition: { type: 'spring', stiffness: 100, damping: 10 }
  }
}

const modeAccentClasses: Record<GameMode, { selected: string }> = {
  ranked: {
    selected: 'border-rose-400/45 bg-rose-400/[0.08]',
  },
  training: {
    selected: 'border-emerald-400/45 bg-emerald-400/[0.08]',
  },
  friends: {
    selected: 'border-violet-400/45 bg-violet-400/[0.08]',
  },
}

export default function Dashboard() {
  const navigate = useNavigate()
  const { user, stats, signOut, refreshStats } = useAuth()
  const { idToken } = useAuthStore()
  const { joinQueue, joinTrainingQueue, joinFriendsQueue, leaveQueue, isConnected, connectionMessage, retryConnection } = useWebSocket()
  const { status, queueElapsed, matchInfo, gameMode, matchNotice, clearMatchNotice } = useGameStore()
  const { equippedBackground, fetchProfileInventory } = useInventoryStore()
  const backgroundDisplayMode = usePreferencesStore(state => state.backgroundDisplayMode)

  const [isConnecting, setIsConnecting] = useState(false)
  const [cooldown, setCooldown] = useState(0)
  const [selectedMode, setSelectedMode] = useState<GameMode>('ranked')

  useEffect(() => {
    if (user && useAuthStore.getState().idToken) {
      fetchProfileInventory(useAuthStore.getState().idToken!)
    }
  }, [user, fetchProfileInventory])

  const [showProfile, setShowProfile] = useState(false)
  const [showSettings, setShowSettings] = useState(false)
  const [showFriends, setShowFriends] = useState(false)
  const [showUserMenu, setShowUserMenu] = useState(false)
  const [friendsCount, setFriendsCount] = useState({ online: 0, offline: 0 })
  const [friendIds, setFriendIds] = useState<string[]>([])
  const [showReferralBonus, setShowReferralBonus] = useState(false)
  const [showDailyReward, setShowDailyReward] = useState(false)
  const [hasUnclaimedQuests, setHasUnclaimedQuests] = useState(false)
  const [hasPendingRequests, setHasPendingRequests] = useState(false)
  const [hasUnclaimedRankReward, setHasUnclaimedRankReward] = useState(false)
  const [isAfkMode, setIsAfkMode] = useState(false)
  const [afkCoinsEarned, setAfkCoinsEarned] = useState(0)
  const [lastAfkReward, setLastAfkReward] = useState<number | null>(null)
  const [invitedCount, setInvitedCount] = useState(0)
  const afkIntervalRef = useRef<ReturnType<typeof setInterval> | null>(null)
  const userMenuRef = useRef<HTMLDivElement>(null)
  const { users: onlineUsers } = useOnlineStore()
  const { addAfkCoins } = useInventoryStore()

  // Notification Check Logic
  const checkNotifications = async () => {
    const { idToken } = useAuthStore.getState()
    if (!user || !idToken) return

    try {
      // 0. Fetch invited count for AFK mode
      const { getQuests, getFriendRequests, getUserProfile } = await import('../config/api')
      try {
        const profile = await getUserProfile(idToken)
        setInvitedCount(profile.invited_count || 0)
      } catch (e) {
        console.error('Failed to fetch profile for invite count:', e)
      }

      // 1. Check Quests
      const quests = await getQuests(idToken)
      const hasClaimable = [...quests.daily_quests, ...quests.weekly_quests].some(q => q.is_complete && !q.claimed)
      setHasUnclaimedQuests(hasClaimable)

      // 2. Check Friend Requests
      const requests = await getFriendRequests(idToken)
      setHasPendingRequests(requests.length > 0)

      // 3. Check Rank Rewards
      const currentRank = stats?.rank || 'Unranked'
      if (currentRank !== 'Unranked') {
        const bgId = `rank_${currentRank.toLowerCase()}`
        const inventory = useInventoryStore.getState()
        // Only check if they actually have items (avoid false positives on empty inventory load)
        if (inventory.unlockedBackgrounds && inventory.unlockedBackgrounds.length > 0) {
          setHasUnclaimedRankReward(!inventory.unlockedBackgrounds.includes(bgId))
        }
      }
    } catch (e) {
      // Suppress network errors for background notifications to keep console clean
      if (e instanceof TypeError && e.message === 'NetworkError when attempting to fetch resource.') {
        return
      }
      console.warn("Failed to check notifications (background check)", e)
    }
  }

  useEffect(() => {
    if (user) {
      checkNotifications()
      // Poll every 30s? Or just once on mount/user change is fine for now to avoid spam.
      const interval = setInterval(checkNotifications, 30000)
      return () => clearInterval(interval)
    }
  }, [user, stats]) // Re-check when stats (rank) changes

  useEffect(() => {
    if (status === 'idle') {
      setCooldown(5)
    }
  }, [status])

  useEffect(() => {
    if (cooldown > 0) {
      const timer = setTimeout(() => setCooldown(cooldown - 1), 1000)
      return () => clearTimeout(timer)
    }
  }, [cooldown])

  useEffect(() => {
    refreshStats()
  }, [refreshStats])

  // Check for referral bonus popup (only shows once)
  useEffect(() => {
    const shouldShowBonus = localStorage.getItem('show_referral_bonus_popup')
    if (shouldShowBonus === 'true') {
      setShowReferralBonus(true)
      localStorage.removeItem('show_referral_bonus_popup')
    }
  }, [])

  // Check for daily reward availability
  useEffect(() => {
    const checkDailyReward = async () => {
      const token = useAuthStore.getState().idToken
      if (!token) return
      try {
        const status = await getDailyStatus(token)
        if (status.can_claim) {
          // Small delay before showing to avoid UI flash
          setTimeout(() => setShowDailyReward(true), 1500)
        }
      } catch (e) {
        console.error('Failed to check daily status', e)
      }
    }
    checkDailyReward()
  }, [])

  // Fetch the friend list once; presence updates only recalculate local counts.
  useEffect(() => {
    if (!user?.uid || !idToken) {
      setFriendIds([])
      return
    }

    let active = true
    const fetchFriends = async () => {
      try {
        const friends = await getFriends(idToken)
        if (active) setFriendIds(friends.map(friend => friend.uid))
      } catch (e) {
        console.error('Failed to fetch friends count', e)
      }
    }
    fetchFriends()
    return () => { active = false }
  }, [user?.uid, idToken])

  useEffect(() => {
    const onlineUserIds = new Set(onlineUsers.map(onlineUser => onlineUser.userId))
    const online = friendIds.filter(friendId => onlineUserIds.has(friendId)).length
    setFriendsCount({ online, offline: Math.max(0, friendIds.length - online) })
  }, [friendIds, onlineUsers])

  // AFK Mode - Earn 1000 coins every 30 minutes (requires 2+ referrals)
  useEffect(() => {
    if (isAfkMode) {
      afkIntervalRef.current = setInterval(async () => {
        const reward = 500  // Reduced for challenging economy (was 1000)
        // Get token freshly
        const token = useAuthStore.getState().idToken
        if (token) {
          await addAfkCoins(reward, token)
          // Only update UI states after attempt (optimistic update handled in store)
          setAfkCoinsEarned(prev => prev + reward)
          setLastAfkReward(reward)
          // Clear the last reward display after 3 seconds
          setTimeout(() => setLastAfkReward(null), 3000)
        }
      }, 1800000) // Every 30 minutes
    } else {
      if (afkIntervalRef.current) {
        clearInterval(afkIntervalRef.current)
        afkIntervalRef.current = null
      }
    }
    return () => {
      if (afkIntervalRef.current) {
        clearInterval(afkIntervalRef.current)
      }
    }
  }, [isAfkMode, addAfkCoins])

  useEffect(() => {
    if (matchInfo) {
      if (status === 'finished') {
        // Immediate redirect for recovered games (race condition fix)
        navigate(`/game/${matchInfo.matchId}`)
      } else {
        setTimeout(() => {
          navigate(`/game/${matchInfo.matchId}`)
        }, 1500)
      }
    }
  }, [matchInfo, status, navigate])

  // Click outside handler for user menu
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (userMenuRef.current && !userMenuRef.current.contains(event.target as Node)) {
        setShowUserMenu(false)
      }
    }
    document.addEventListener('mousedown', handleClickOutside)
    return () => document.removeEventListener('mousedown', handleClickOutside)
  }, [])

  const handlePlay = () => {
    if (cooldown > 0 || isConnecting || !isConnected) return

    if (status === 'queue' || status === 'waiting') {
      handleCancelQueue()
    } else if (status === 'idle') {
      setIsConnecting(true)
      refreshStats() // Refresh stats before playing

      if (selectedMode === 'training') {
        joinTrainingQueue()
        useGameStore.getState().joinTrainingQueue()
      } else if (selectedMode === 'friends') {
        joinFriendsQueue()
        useGameStore.getState().joinFriendsQueue()
      } else {
        joinQueue()
        useGameStore.getState().joinQueue()
      }

      setTimeout(() => setIsConnecting(false), 500)
    }
  }

  // Optimistic Queue Timer: Increment locally to prevent "stuck at 0" feel
  // The backend sends sync updates which will correct any drift (processed in WebSocketContext)
  useEffect(() => {
    let interval: ReturnType<typeof setInterval>;

    if (status === 'queue') {
      interval = setInterval(() => {
        const { queueElapsed, updateQueueElapsed } = useGameStore.getState();
        updateQueueElapsed(queueElapsed + 1);
      }, 1000);
    }

    return () => {
      if (interval) clearInterval(interval);
    };
  }, [status]);

  // Keyboard Shortcuts
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      // Ignore if typing in an input
      if (e.target instanceof HTMLInputElement || e.target instanceof HTMLTextAreaElement) return

      if (e.key === 'Enter' && status === 'idle' && cooldown === 0) {
        if (e.ctrlKey || e.metaKey) {
          // Ctrl+Enter: Force Training Mode
          setSelectedMode('training')
          // Need to call these directly since state update is async/batched
          joinTrainingQueue()
          useGameStore.getState().joinTrainingQueue()
        } else {
          // Enter: Play selected mode
          handlePlay()
        }
      }

      if (e.key === 'Escape' && (status === 'queue' || status === 'waiting')) {
        handleCancelQueue()
      }
    }

    window.addEventListener('keydown', handleKeyDown)
    return () => window.removeEventListener('keydown', handleKeyDown)
  }, [status, cooldown, selectedMode, joinQueue, joinTrainingQueue, joinFriendsQueue])

  const handleCancelQueue = () => {
    leaveQueue()
    if (matchInfo) {
      useGameStore.getState().cancelPendingMatch('Match cancelled. No stats or rewards changed.')
    } else {
      useGameStore.getState().leaveQueue()
    }
  }

  const formatQueueTime = (seconds: number) => {
    const mins = Math.floor(seconds / 60)
    const secs = seconds % 60
    return `${mins}:${secs.toString().padStart(2, '0')}`
  }

  return (
    <motion.div
      variants={containerVariants}
      initial="hidden"
      animate="visible"
      className="w-full flex flex-col bg-transparent relative min-h-screen overflow-x-hidden"
    >
      {/* Ambient Background Gradient Orbs or Custom BG */}
      <div className="fixed inset-0 pointer-events-none overflow-hidden">
        {backgroundDisplayMode === 'lobby' && equippedBackground && PROFILE_BACKGROUNDS[equippedBackground as keyof typeof PROFILE_BACKGROUNDS] ? (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ duration: 1 }}
            className="absolute inset-0"
          >
            {/* Background Image */}
            <img
              src={PROFILE_BACKGROUNDS[equippedBackground as keyof typeof PROFILE_BACKGROUNDS].path}
              alt="Dashboard Background"
              className="w-full h-full object-cover blur-[3px] scale-105"
            />
            {/* Dark Overlay for readability */}
            <div className="absolute inset-0 bg-black/60" />

            {/* Subtle animated gradient overlay to keep it alive */}
          </motion.div>
        ) : (
          <div className="absolute inset-0 bg-[#050505]" />
        )}
      </div>

      {/* Header */}
      <motion.header
        variants={itemVariants}
        className="flex items-center justify-between px-6 sm:px-12 py-6 relative z-20"
      >
        {/* App Logo and Name */}
        <div className="flex items-center gap-3">
          <h1 className="text-2xl font-semibold tracking-[-0.06em] text-white">typelo<span className="text-rose-400">.</span></h1>
        </div>

        <div className="flex items-center gap-6">
          {/* User Menu */}
          <div className="relative" ref={userMenuRef}>
            <button
              onClick={() => setShowUserMenu(!showUserMenu)}
              aria-label={user?.displayName ? `Account menu for ${user.displayName}` : 'Open account menu'}
              aria-expanded={showUserMenu}
              className="flex items-center gap-3 rounded-full border border-white/10 bg-white/[0.03] px-3 py-2 transition-colors hover:bg-white/[0.06]"
            >
              <div className="relative">
                {user?.photoURL && (
                  <img
                    src={user.photoURL}
                    alt={user.displayName}
                    className="w-6 h-6 rounded-full"
                    crossOrigin="anonymous"
                    referrerPolicy="no-referrer"
                  />
                )}
                {/* Online indicator */}
                <div className="absolute -bottom-0.5 -right-0.5 w-2.5 h-2.5 rounded-full bg-emerald-500 border-2 border-bg-primary" />
              </div>
              <span className="text-sm font-medium text-text-secondary hidden sm:inline hover:text-white transition-colors">{user?.displayName}</span>
              <svg
                width="12"
                height="12"
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                strokeWidth="2"
                className={`text-white/30 transition-transform ${showUserMenu ? 'rotate-180' : ''}`}
              >
                <path d="M6 9l6 6 6-6" />
              </svg>
            </button>

            {/* Dropdown Menu - Inline with z-50 */}
            {showUserMenu && (
              <div
                className="absolute right-0 top-full z-50 mt-2 w-48 overflow-hidden rounded-xl border border-white/10 bg-[#0b0b0c] py-1 shadow-xl"
              >
                <div>
                  <button
                    onClick={() => {
                      setShowProfile(true)
                      setShowUserMenu(false)
                    }}
                    className="w-full px-4 py-3 flex items-center gap-3 text-left transition-colors hover:bg-white/[0.05] relative"
                  >
                    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" className="text-white">
                      <circle cx="12" cy="8" r="4" />
                      <path d="M20 21v-2a4 4 0 00-4-4H8a4 4 0 00-4 4v2" />
                    </svg>
                    <span className="text-sm text-white">Profile</span>
                    {hasUnclaimedRankReward && (
                      <span className="absolute right-4 w-2 h-2 bg-rose-500 rounded-full animate-pulse" />
                    )}
                  </button>
                  <button
                    onClick={() => {
                      setShowFriends(true)
                      setShowUserMenu(false)
                    }}
                    className="w-full px-4 py-3 flex items-center gap-3 text-left transition-colors hover:bg-white/[0.05] relative"
                  >
                    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" className="text-white">
                      <path d="M16 21v-2a4 4 0 00-4-4H5a4 4 0 00-4 4v2" />
                      <circle cx="8.5" cy="7" r="4" />
                      <path d="M20 8v6M23 11h-6" />
                    </svg>
                    <span className="text-sm text-white">Friends</span>
                    {hasPendingRequests && (
                      <span className="absolute right-4 w-2 h-2 bg-rose-500 rounded-full animate-pulse" />
                    )}
                  </button>
                  <button
                    onClick={() => {
                      setShowSettings(true)
                      setShowUserMenu(false)
                    }}
                    className="w-full px-4 py-3 flex items-center gap-3 text-left transition-colors hover:bg-white/[0.05]"
                  >
                    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" className="text-white/70" aria-hidden="true">
                      <path d="M4 21v-7m0-4V3m8 18v-9m0-4V3m8 18v-5m0-4V3M2 14h4m4-4h4m4 6h4" />
                    </svg>
                    <span className="text-sm text-white/80">Settings</span>
                  </button>
                </div>
                <div className="border-t border-white/10">
                  <button
                    onClick={() => {
                      signOut()
                      setShowUserMenu(false)
                    }}
                    className="w-full px-4 py-3 flex items-center gap-3 text-left transition-colors hover:bg-white/[0.05]"
                  >
                    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" className="text-white/50">
                      <path d="M9 21H5a2 2 0 01-2-2V5a2 2 0 012-2h4" />
                      <polyline points="16 17 21 12 16 7" />
                      <line x1="21" y1="12" x2="9" y2="12" />
                    </svg>
                    <span className="text-sm text-white/70">Sign out</span>
                  </button>
                </div>
              </div>
            )}
          </div>
        </div>
      </motion.header>

      {(matchNotice || connectionMessage) && (
        <div className="relative z-20 mx-auto mb-2 flex w-[calc(100%-2rem)] max-w-2xl flex-col gap-2">
          {matchNotice && (
            <div role="status" className="flex items-start justify-between gap-4 rounded-xl border border-white/10 bg-[#101012]/90 px-4 py-3 text-sm text-white/65 shadow-lg backdrop-blur">
              <p>{matchNotice}</p>
              <button type="button" aria-label="Dismiss match notice" onClick={clearMatchNotice} className="shrink-0 text-white/35 transition hover:text-white">×</button>
            </div>
          )}
          {connectionMessage && (
            <div role="status" className="flex items-center justify-between gap-4 rounded-xl border border-rose-300/15 bg-[#101012]/90 px-4 py-3 text-sm text-white/65 shadow-lg backdrop-blur">
              <span>{connectionMessage}</span>
              {!isConnected && (
                <button type="button" onClick={retryConnection} className="shrink-0 rounded-lg border border-white/10 px-3 py-1.5 text-xs font-medium text-white/65 transition hover:border-rose-300/30 hover:text-white">Retry</button>
              )}
            </div>
          )}
        </div>
      )}

      {/* Main Content */}
      <div className="flex flex-col lg:flex-row px-6 sm:px-12 pb-24 lg:pb-12 gap-12 relative">
        {/* Left Panel - User Stats */}
        <motion.aside aria-label="Player stats" variants={itemVariants} className="order-2 w-full flex flex-col justify-center lg:order-none lg:w-80">
          <UserStats
            stats={stats}
            onOpenFriends={() => setShowFriends(true)}
            onlineFriendsCount={friendsCount.online}
            offlineFriendsCount={friendsCount.offline}
            hasUnclaimedQuests={hasUnclaimedQuests}
            hasPendingRequests={hasPendingRequests}
            hasUnclaimedRankReward={hasUnclaimedRankReward}
          />
        </motion.aside>

        {/* Center - Match Action */}
        <motion.section aria-label="Matchmaking controls" variants={itemVariants} className="order-1 flex min-h-[300px] flex-1 items-center justify-center lg:order-none lg:min-h-0">
          <div className="flex w-full flex-col items-center">
            {status === 'idle' && (
              <section className="mx-auto flex w-full max-w-lg flex-col items-center gap-7 px-4 py-8">
                <div className="text-center">
                  <h2 className="text-2xl font-semibold tracking-tight text-white">Ready to play?</h2>
                  <p className="mt-2 text-sm text-white/55">Choose a mode and start typing.</p>
                </div>

                <div role="group" aria-label="Match mode" className="grid w-full grid-cols-3 gap-2">
                  {(['ranked', 'training', 'friends'] as GameMode[]).map((mode) => (
                    <button
                      key={mode}
                      type="button"
                      aria-pressed={selectedMode === mode}
                      onClick={() => setSelectedMode(mode)}
                      className={`h-14 rounded-xl border px-3 text-sm font-medium transition-colors focus-visible:outline focus-visible:outline-2 focus-visible:outline-rose-400
                        ${selectedMode === mode
                          ? `${modeAccentClasses[mode].selected} text-white`
                          : 'border-white/10 bg-white/[0.02] text-white/55 hover:border-white/20 hover:text-white/85'}`}
                    >
                      {mode === 'training' ? 'Practice' : mode === 'friends' ? 'Friends' : 'Ranked'}
                    </button>
                  ))}
                </div>

                <button
                  type="button"
                  onClick={handlePlay}
                  disabled={isConnecting || cooldown > 0 || !isConnected}
                  data-mode={selectedMode}
                  className="match-mode-button h-16 w-full rounded-xl px-6 text-base font-semibold text-white transition-colors focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-white/70 disabled:cursor-not-allowed disabled:bg-white/10 disabled:text-white/40 disabled:shadow-none"
                >
                  {isConnecting ? 'Connecting…' : !isConnected ? connectionMessage ? 'Server unavailable' : 'Reconnecting…' : 'Find a match'}
                </button>

                {cooldown > 0 && (
                  <p role="status" className="text-xs text-white/45">
                    Available in <span className="font-mono tabular-nums text-white/70">{cooldown}s</span>
                  </p>
                )}

                {invitedCount >= 2 && (
                  <button
                    type="button"
                    onClick={() => setIsAfkMode(!isAfkMode)}
                    aria-pressed={isAfkMode}
                    className={`rounded-full border px-3 py-2 text-xs transition-colors ${isAfkMode
                      ? 'border-rose-400/30 bg-rose-400/[0.08] text-rose-200'
                      : 'border-white/10 text-white/50 hover:text-white'}`}
                  >
                    AFK rewards {isAfkMode ? 'on' : 'off'}{isAfkMode ? ` · ${afkCoinsEarned} coins` : ''}
                  </button>
                )}

                {lastAfkReward !== null && (
                  <div role="status" className="fixed bottom-5 left-1/2 z-50 -translate-x-1/2 rounded-full border border-white/10 bg-[#0b0b0c] px-4 py-2 text-sm text-white shadow-lg">
                    +{lastAfkReward} coins
                  </div>
                )}
              </section>
            )}

            {(status === 'queue' || status === 'waiting') && !matchInfo && (
              <motion.section
                initial={{ opacity: 0, y: 4 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: 4 }}
                className="mx-auto flex w-full max-w-sm flex-col items-center gap-6 px-4 py-8 text-center"
              >
                <div className="flex items-center gap-3">
                  <div aria-hidden="true" className="h-5 w-5 animate-spin rounded-full border-2 border-white/15 border-t-rose-400" />
                  <h2 className="text-lg font-semibold text-white">Finding an opponent</h2>
                </div>
                <p className="text-sm text-white/45">
                  {isConnected ? 'Searching for a player…' : connectionMessage || 'Reconnecting to the match service…'}
                </p>
                <p aria-label="Time in queue" className="font-mono text-4xl tabular-nums tracking-tight text-white">
                  {formatQueueTime(queueElapsed)}
                </p>
                <p className="text-xs text-white/40">
                  {gameMode === 'training' ? 'Practice' : gameMode === 'friends' ? 'Friends' : 'Ranked'} queue
                </p>
                <button
                  type="button"
                  onClick={handleCancelQueue}
                  className="rounded-lg border border-white/10 px-4 py-2 text-sm text-white/55 transition-colors hover:border-white/20 hover:text-white"
                >
                  Cancel search
                </button>
              </motion.section>
            )}

            {matchInfo && (
              <motion.section
                role="status"
                aria-live="polite"
                initial={{ opacity: 0, y: 4 }}
                animate={{ opacity: 1, y: 0 }}
                className="mx-auto w-full max-w-sm px-4 py-8 text-center"
              >
                <p className="text-sm font-medium text-rose-300">Match found</p>
                <div className="mt-6 grid grid-cols-[1fr_auto_1fr] items-center gap-4">
                  <div className="min-w-0">
                    {user?.photoURL ? (
                      <img src={user.photoURL} alt="" className="mx-auto mb-2 h-10 w-10 rounded-full object-cover" crossOrigin="anonymous" referrerPolicy="no-referrer" />
                    ) : (
                      <span aria-hidden="true" className="mx-auto mb-2 grid h-10 w-10 place-items-center rounded-full border border-white/10 bg-white/[0.04] text-sm text-white/70">
                        {user?.displayName?.charAt(0) || 'Y'}
                      </span>
                    )}
                    <p className="truncate text-sm text-white">{user?.displayName || 'You'}</p>
                  </div>
                  <span aria-hidden="true" className="text-xs text-white/35">VS</span>
                  <div className="min-w-0">
                    {matchInfo.opponentPhotoURL && !matchInfo.opponentIsBot ? (
                      <img src={matchInfo.opponentPhotoURL} alt="" className="mx-auto mb-2 h-10 w-10 rounded-full object-cover" crossOrigin="anonymous" referrerPolicy="no-referrer" />
                    ) : (
                      <span aria-hidden="true" className="mx-auto mb-2 grid h-10 w-10 place-items-center rounded-full border border-white/10 bg-white/[0.04] text-xs text-white/60">
                        {matchInfo.opponentIsBot ? 'AI' : matchInfo.opponentDisplayName?.charAt(0) || '?'}
                      </span>
                    )}
                    <p className="truncate text-sm text-white">{matchInfo.opponentDisplayName}</p>
                  </div>
                </div>
                <p className="mt-6 text-xs text-white/40">Preparing the match…</p>
              </motion.section>
            )}
          </div>
        </motion.section>

        {/* Right Panel - Leaderboard */}
        <motion.aside aria-label="Leaderboard" variants={itemVariants} className="order-3 w-full flex flex-col justify-center lg:order-none lg:w-80">
          <Leaderboard />
        </motion.aside>
      </div>

      {/* Profile Modal */}
      <ProfileModal isOpen={showProfile} onClose={() => setShowProfile(false)} />

      <SettingsModal isOpen={showSettings} onClose={() => setShowSettings(false)} />

      {/* Friends Modal */}
      <FriendsModal isOpen={showFriends} onClose={() => setShowFriends(false)} />

      {/* Live Match Feed - Shows active matches and results */}
      <LiveMatchFeed />

      {/* Referral Bonus */}
      <AnimatePresence>
        {showReferralBonus && (
          <>
            <motion.button
              type="button"
              aria-label="Close referral reward"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="fixed inset-0 z-[100] cursor-default bg-black/75 backdrop-blur-sm"
              onClick={() => setShowReferralBonus(false)}
            />
            <motion.div
              role="dialog"
              aria-modal="true"
              aria-labelledby="referral-reward-title"
              initial={{ opacity: 0, y: 8 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: 8 }}
              className="fixed inset-0 z-[101] flex items-center justify-center p-4"
            >
              <section className="w-full max-w-sm rounded-2xl border border-white/10 bg-[#0b0b0c] p-6 text-center shadow-xl">
                <p className="font-mono text-2xl tabular-nums text-rose-300">+5</p>
                <h2 id="referral-reward-title" className="mt-3 text-lg font-semibold text-white">Referral reward</h2>
                <p className="mt-1 text-sm text-white/50">Your invite added 5 coins.</p>
                <button
                  type="button"
                  onClick={() => setShowReferralBonus(false)}
                  className="mt-6 h-11 w-full rounded-xl bg-rose-500 text-sm font-medium text-white transition-colors hover:bg-rose-400"
                >
                  Continue
                </button>
              </section>
            </motion.div>
          </>
        )}
      </AnimatePresence>

      {/* Daily Reward Modal */}
      <DailyRewardModal
        isOpen={showDailyReward}
        onClose={() => setShowDailyReward(false)}
      />

      {/* Update Modal - Auto shows once per version */}
      <UpdateModal />
    </motion.div >
  )
}
