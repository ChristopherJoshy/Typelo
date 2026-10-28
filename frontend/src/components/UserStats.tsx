/*   ______      __ ____  _______       _  ____  _   _ 
 *  |  ____|   / / __ \|__   __|/\   | |/ __ \| \ | |
 *  | |__   _ / / |  | |  | |  /  \  | | |  | |  \| |
 *  |  __| | v /| |  | |  | | / /\ \ | | |  | | . ` |
 *  | |____ \ / | |__| |  | |/ ____ \| | |__| | |\  |
 *  |______| \_/ \____/   |_/_/    \_\_|\____/|_| \_|
 *                                                      
 */

/**
 * UserStats Component - Displays the user's main statistics on the Dashboard.
 * Includes rank card, history charts, and quick stats grid.
 * 
 * --------------------------------------------------------------------------
 *                                  Functions
 * --------------------------------------------------------------------------
 * UserStats: Main component.
 * StatBox: Sub-component for individual stat cards with optional charts.
 * 
 * --------------------------------------------------------------------------
 *                            Variables and others
 * --------------------------------------------------------------------------
 * stats: Computed user statistics.
 * rank: Current rank derived from ELO.
 * winRate: Calculated win/loss percentage.
 * wpmHistory: Historical WPM data for charts.
 * eloHistory: Historical ELO data for charts.
 * 
 * --------------------------------------------------------------------------
 *                                   imports
 * --------------------------------------------------------------------------
 * react: React hooks.
 * framer-motion: Animations.
 * types: Rank types.
 * config: API functions.
 * stores: Auth store.
 * components: Sub-components like MatchHistoryModal, SparklineChart.
 */

import { useState, useEffect } from 'react'
import { motion } from 'framer-motion'
import type { UserStats as UserStatsType } from '../types'
import { getRankFromElo } from '../types'
import { getUserMatches } from '../config/api'
import { useAuthStore } from '../stores/authStore'
import RankBadge from './icons/RankBadge'
import RanksModal from './RanksModal'
import MatchHistoryModal from './MatchHistoryModal'
import EnhancedProfileModal from './EnhancedProfileModal'
import SparklineChart from './SparklineChart'
import InventoryModal from './InventoryModal'
import ShopModal from './ShopModal'
import EarnCoinsModal from './EarnCoinsModal'
import DailyRewardModal from './DailyRewardModal'
import { useInventoryStore } from '../stores/inventoryStore'

interface UserStatsProps {
  stats: UserStatsType | null
  onOpenFriends?: () => void
  onlineFriendsCount?: number
  offlineFriendsCount?: number
  hasUnclaimedQuests?: boolean
  hasPendingRequests?: boolean
  hasUnclaimedRankReward?: boolean
}

const container = {
  hidden: { opacity: 0 },
  visible: {
    opacity: 1,
    transition: {
      staggerChildren: 0.1
    }
  }
}

const item = {
  hidden: { opacity: 0, x: -20 },
  visible: {
    opacity: 1,
    x: 0,
    transition: { type: 'spring', stiffness: 100 }
  }
}

export default function UserStats({
  stats,
  onOpenFriends,
  onlineFriendsCount = 0,
  offlineFriendsCount = 0,
  hasUnclaimedQuests = false,
  hasPendingRequests = false,
  hasUnclaimedRankReward = false
}: UserStatsProps) {
  const [showRanksModal, setShowRanksModal] = useState(false)
  const [showHistoryModal, setShowHistoryModal] = useState(false)
  const [showProfileModal, setShowProfileModal] = useState(false)
  const [showInventory, setShowInventory] = useState(false)
  const [showShop, setShowShop] = useState(false)
  const [showEarnCoins, setShowEarnCoins] = useState(false)
  const [showDailyReward, setShowDailyReward] = useState(false)
  const [wpmHistory, setWpmHistory] = useState<number[]>([])
  const [eloHistory, setEloHistory] = useState<number[]>([])
  const { idToken } = useAuthStore()
  const { coins, fetchInventory } = useInventoryStore()

  useEffect(() => {
    if (stats && idToken) {
      getUserMatches(idToken, 20).then(matches => {
        // Sort chronological
        const sorted = [...matches].reverse()
        setWpmHistory(sorted.map(m => m.wpm))
        setEloHistory(sorted.map(m => m.elo_after))
      }).catch(err => console.error('Failed to load history stats', err))

      // Fetch inventory for coins display
      fetchInventory(idToken)
    }
  }, [stats, idToken, fetchInventory])

  if (!stats) {
    return (
      <div className="flex items-center justify-center h-full">
        <div className="w-6 h-6 border-2 border-white/20 border-t-accent-focus rounded-full animate-spin" />
      </div>
    )
  }

  const rank = getRankFromElo(stats.currentElo)
  const winRate = stats.totalMatches > 0
    ? Math.round((stats.wins / stats.totalMatches) * 100)
    : 0

  return (
    <>
      <motion.div
        variants={container}
        initial="hidden"
        animate="visible"
        className="flex flex-col gap-3 sm:gap-4 lg:gap-5"
      >
        {/* Rank Badge - Clickable */}
        <motion.div
          variants={item}
          className="flex items-center gap-5 rounded-2xl border border-white/10 bg-white/[0.025] p-4 transition-colors hover:border-white/20 cursor-pointer group"
          onClick={() => setShowRanksModal(true)}
        >
          <RankBadge
            rank={rank}
            size={76}
            animate={false}
          />
          <div className="flex-1">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <h2 className="text-xl font-semibold tracking-tight text-white">
                  {rank}
                </h2>
              </div>
            </div>
            <p className="mt-1 text-sm font-mono tabular-nums text-rose-300">{stats.currentElo} ELO</p>
            {/* Rank Progress Bar */}
            {(() => {
              const rankThresholds = [
                { rank: 'Unranked', min: 0, max: 1000 },
                { rank: 'Bronze', min: 1000, max: 2000 },
                { rank: 'Gold', min: 2000, max: 3000 },
                { rank: 'Platinum', min: 3000, max: 10000 },
                { rank: 'Ranker', min: 10000, max: 10000 },
              ]
              const currentThreshold = rankThresholds.find(t => t.rank === rank) || rankThresholds[0]
              const isMaxRank = currentThreshold.rank === 'Ranker'
              const progressMin = currentThreshold.min
              const progressMax = currentThreshold.max
              const progressPercent = isMaxRank ? 100 : Math.min(100, Math.max(0, ((stats.currentElo - progressMin) / (progressMax - progressMin)) * 100))

              return (
                <div className="mt-3">
                  <div className="relative h-1.5 overflow-hidden rounded-full bg-white/10">
                    <div
                      className="absolute inset-y-0 left-0 rounded-full transition-all duration-500"
                      style={{
                        width: `${progressPercent}%`,
                        background: '#fb7185',
                      }}
                    />
                  </div>
                  <div className="flex justify-end mt-1.5">
                    <span className="text-xs font-mono text-white/40">
                      {isMaxRank ? (
                        <span className="text-rose-300">MAX RANK</span>
                      ) : (
                        <>
                          <span className="text-white/60">{stats.currentElo}</span>
                          <span className="text-white/45">/</span>
                          <span className="text-white/60">{progressMax}</span>
                        </>
                      )}
                    </span>
                  </div>
                </div>
              )
            })()}
          </div>
        </motion.div>

        {/* Stats Grid */}
        <div className="grid grid-cols-2 gap-3">
          <StatBox
            variants={item}
            label="Avg WPM"
            value={Math.round(stats.avgWpm)}
            chartData={wpmHistory}
            color="#ec4899"
          />
          <StatBox variants={item} label="Best WPM" value={stats.bestWpm} color="#a855f7" />
          <StatBox variants={item} label="Accuracy" value={`${Math.round(stats.avgAccuracy)}%`} color="#22c55e" />
          <StatBox variants={item} label="Win Rate" value={`${winRate}%`} color="#3b82f6" />
        </div>

        {/* Profile Button */}
        <motion.button
          variants={item}
          onClick={() => setShowProfileModal(true)}
          whileTap={{ scale: 0.99 }}
          className="relative flex items-center justify-between rounded-xl border border-white/10 bg-white/[0.025] p-4 transition-colors hover:border-white/20 group"
        >
          {hasUnclaimedRankReward && (
            <span className="absolute top-2 right-2 w-2.5 h-2.5 bg-rose-500 rounded-full animate-pulse z-10 box-content border-2 border-[#1a1a1a]" />
          )}
          <div className="flex items-center gap-4">
            <div className="grid h-10 w-10 place-items-center rounded-lg bg-white/[0.04]">
              <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" className="text-rose-300">
                <path d="M20 21v-2a4 4 0 00-4-4H8a4 4 0 00-4 4v2" />
                <circle cx="12" cy="7" r="4" />
              </svg>
            </div>
            <div className="text-left">
              <p className="text-sm font-medium text-text-primary">
                My Profile
              </p>
              <p className="mt-0.5 text-xs text-white/55">
                View stats, history & more
              </p>
            </div>
          </div>
          <div className="flex items-center gap-3">
            <div className="text-right hidden sm:block">
              <span className="text-xs font-mono text-accent-correct">{stats.wins}W</span>
              <span className="text-xs font-mono text-text-muted mx-1">/</span>
              <span className="text-xs font-mono text-accent-error">{stats.losses}L</span>
            </div>
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" className="text-white/30 transition-transform group-hover:translate-x-0.5">
              <path d="M9 5l7 7-7 7" />
            </svg>
          </div>
        </motion.button>

        {/* Peak Elo */}
        {stats.peakElo > stats.currentElo && (
          <motion.div variants={item} className="px-4 py-3 rounded-lg border border-white/20 flex items-center justify-between bg-white/[0.02]">
            <span className="text-[10px] text-text-muted uppercase tracking-widest font-medium">
              Peak Performance
            </span>
            <span className="text-sm font-mono text-text-secondary">{stats.peakElo} ELO</span>
          </motion.div>
        )}

        {/* Friends Tab */}
        {onOpenFriends && (
          <motion.button
            variants={item}
            onClick={onOpenFriends}
              whileTap={{ scale: 0.99 }}
            className="relative flex items-center justify-between rounded-lg border border-white/10 bg-white/[0.025] px-4 py-3 transition-colors hover:border-white/20 cursor-pointer group"
          >
            {hasPendingRequests && (
              <span className="absolute top-2 right-2 w-2 h-2 bg-rose-500 rounded-full animate-pulse z-10 box-content border-2 border-[#1a1a1a]" />
            )}
            <span className="text-[10px] font-medium uppercase tracking-widest text-text-muted transition-colors group-hover:text-white">
              Friends
            </span>
            <div className="flex items-center gap-3">
              <div className="flex items-center gap-1.5">
                <span className="w-1.5 h-1.5 rounded-full bg-emerald-500" />
                <span className="text-sm font-mono text-emerald-400">{onlineFriendsCount}</span>
              </div>
              <div className="flex items-center gap-1.5">
                <span className="w-1.5 h-1.5 rounded-full bg-red-500/70" />
                <span className="text-sm font-mono text-text-secondary">{offlineFriendsCount}</span>
              </div>
            </div>
          </motion.button>
        )}

        {/* Inventory Button */}
        <motion.button
          variants={item}
          onClick={() => setShowInventory(true)}
          whileTap={{ scale: 0.99 }}
          className="flex items-center justify-between rounded-lg border border-white/10 bg-white/[0.025] px-4 py-3 transition-colors hover:border-white/20 cursor-pointer group"
        >
          <div className="flex items-center gap-2">
            <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" className="text-rose-300">
              <rect x="3" y="3" width="7" height="7" />
              <rect x="14" y="3" width="7" height="7" />
              <rect x="3" y="14" width="7" height="7" />
              <rect x="14" y="14" width="7" height="7" />
            </svg>
            <span className="text-[10px] font-medium uppercase tracking-widest text-text-muted transition-colors group-hover:text-white">
              Inventory
            </span>
          </div>
          <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" className="text-text-muted group-hover:translate-x-1 transition-transform">
            <path d="M9 5l7 7-7 7" />
          </svg>
        </motion.button>

        {/* Shop Button */}
        <motion.button
          variants={item}
          onClick={() => setShowShop(true)}
          whileTap={{ scale: 0.99 }}
          className="flex items-center justify-between rounded-lg border border-white/10 bg-white/[0.025] px-4 py-3 transition-colors hover:border-white/20 cursor-pointer group"
        >
          <div className="flex items-center gap-2">
            <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" className="text-rose-300">
              <circle cx="9" cy="21" r="1" />
              <circle cx="20" cy="21" r="1" />
              <path d="M1 1h4l2.68 13.39a2 2 0 002 1.61h9.72a2 2 0 002-1.61L23 6H6" />
            </svg>
            <span className="text-[10px] font-medium uppercase tracking-widest text-text-muted transition-colors group-hover:text-white">
              Shop
            </span>
          </div>
          <div className="flex items-center gap-2">
            <span className="text-xs font-mono tabular-nums text-white/65">{coins}</span>
            <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" className="text-text-muted group-hover:translate-x-1 transition-transform">
              <path d="M9 5l7 7-7 7" />
            </svg>
          </div>
        </motion.button>

        {/* Earn Coins Button */}
        <motion.button
          variants={item}
          onClick={() => setShowEarnCoins(true)}
          whileTap={{ scale: 0.99 }}
          className="relative flex items-center justify-between rounded-lg border border-white/10 bg-white/[0.025] px-4 py-3 transition-colors hover:border-white/20 cursor-pointer group"
        >
          {hasUnclaimedQuests && (
            <span className="absolute top-2 right-2 w-2 h-2 bg-rose-500 rounded-full animate-pulse z-10 box-content border-2 border-[#1a1a1a]" />
          )}
          <div className="flex items-center gap-2">
            <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" className="text-rose-300">
              <rect x="2" y="7" width="20" height="14" rx="2" ry="2" />
              <path d="M16 21V5a2 2 0 0 0-2-2h-4a2 2 0 0 0-2 2v16" />
            </svg>
            <span className="text-[10px] font-medium uppercase tracking-widest text-text-muted transition-colors group-hover:text-white">
              Earn Coins
            </span>
          </div>
          <div className="flex items-center gap-2">
            <span className="text-[10px] font-mono uppercase text-white/65">Free</span>
            <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" className="text-text-muted group-hover:translate-x-1 transition-transform">
              <path d="M9 5l7 7-7 7" />
            </svg>
          </div>
        </motion.button>

        {/* Daily Rewards Button */}
        <motion.button
          variants={item}
          onClick={() => setShowDailyReward(true)}
          whileTap={{ scale: 0.99 }}
          className="flex items-center justify-between rounded-lg border border-white/10 bg-white/[0.025] px-4 py-3 transition-colors hover:border-white/20 cursor-pointer group"
        >
          <div className="flex items-center gap-2">
            <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" className="text-rose-300">
              <rect x="3" y="4" width="18" height="18" rx="2" />
              <path d="M16 2v4M8 2v4M3 10h18" />
            </svg>
            <span className="text-[10px] font-medium uppercase tracking-widest text-text-muted transition-colors group-hover:text-white">
              Daily Rewards
            </span>
          </div>
          <div className="flex items-center gap-2">
            <span className="h-1.5 w-1.5 rounded-full bg-rose-400" />
            <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" className="text-text-muted group-hover:translate-x-1 transition-transform">
              <path d="M9 5l7 7-7 7" />
            </svg>
          </div>
        </motion.button>
      </motion.div>

      {/* Modals */}
      <RanksModal
        isOpen={showRanksModal}
        onClose={() => setShowRanksModal(false)}
        currentRank={rank}
      />
      <MatchHistoryModal
        isOpen={showHistoryModal}
        onClose={() => setShowHistoryModal(false)}
      />
      <EnhancedProfileModal
        isOpen={showProfileModal}
        onClose={() => setShowProfileModal(false)}
      />
      <InventoryModal
        isOpen={showInventory}
        onClose={() => setShowInventory(false)}
      />
      <ShopModal
        isOpen={showShop}
        onClose={() => setShowShop(false)}
      />
      <EarnCoinsModal
        isOpen={showEarnCoins}
        onClose={() => setShowEarnCoins(false)}
      />
      <DailyRewardModal
        isOpen={showDailyReward}
        onClose={() => setShowDailyReward(false)}
      />
    </>
  )
}

function StatBox({ label, value, variants, chartData, color = '#ffffff' }: { label: string; value: string | number; variants?: any; chartData?: number[]; color?: string }) {
  return (
    <motion.div
      variants={variants}
      className="relative rounded-xl border border-white/10 bg-white/[0.025] p-4 transition-colors hover:border-white/20"
    >
      <div>
        <p className="mb-2 text-[10px] font-medium uppercase tracking-widest text-text-muted">
          {label}
        </p>
        <p
          className="text-2xl font-mono font-medium tabular-nums tracking-tight text-white"
        >
          {value}
        </p>
      </div>

      {/* Background Chart */}
      {chartData && chartData.length > 2 && (
        <div className="absolute bottom-0 left-0 right-0 h-12 opacity-20">
          <SparklineChart data={chartData} color={color} height={48} showArea={true} />
        </div>
      )}
    </motion.div>
  )
}
