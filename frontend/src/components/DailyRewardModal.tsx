/*   ______      __ ____  _______       _  ____  _   _ 
 *  |  ____|   / / __ \|__   __|/\   | |/ __ \| \ | |
 *  | |__   _ / / |  | |  | |  /  \  | | |  | |  \| |
 *  |  __| | v /| |  | |  | | / /\ \ | | |  | | . ` |
 *  | |____ \ / | |__| |  | |/ ____ \| | |__| | |\  |
 *  |______| \_/ \____/   |_/_/    \_\_|\____/|_| \_|
 *                                                      
 */

/**
 * DailyRewardModal - Shows 7-day login reward calendar and claim button.
 * 
 * --------------------------------------------------------------------------
 *                                  Functions
 * --------------------------------------------------------------------------
 * DailyRewardModal: Main modal component with streak calendar.
 * 
 * --------------------------------------------------------------------------
 *                            Variables and others
 * --------------------------------------------------------------------------
 * REWARD_ICONS: Icon mapping for reward types.
 * DAILY_REWARDS: Client-side reward preview data.
 * 
 * --------------------------------------------------------------------------
 *                                   imports
 * --------------------------------------------------------------------------
 * react, framer-motion, api functions.
 */

import { useState, useEffect } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { createPortal } from 'react-dom'
import { getDailyStatus, claimDailyReward, DailyStatus, ClaimDailyResult } from '../config/api'
import { useAuthStore } from '../stores/authStore'
import { useInventoryStore } from '../stores/inventoryStore'

interface DailyRewardModalProps {
    isOpen: boolean
    onClose: () => void
}

const DAILY_REWARDS = [
    { day: 1, coins: 100, type: 'coins', label: '100' },
    { day: 2, coins: 200, type: 'coins', label: '200' },
    { day: 3, type: 'effect', label: 'Effect + 50' },
    { day: 4, coins: 300, type: 'coins', label: '300' },
    { day: 5, type: 'cursor', label: 'Cursor + 100' },
    { day: 6, coins: 400, type: 'coins', label: '400' },
    { day: 7, type: 'special', label: '1,000 + 5 boosts' },
]

const RewardIcon = ({ type, size = 32, isActive }: { type: string; size?: number; isActive?: boolean }) => {
    const iconClass = isActive ? 'text-rose-300' : 'text-white/35'
    switch (type) {
        case 'coins':
            return <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.7" className={iconClass}><circle cx="12" cy="12" r="9" /><path d="M12 6v12M9 10h6M9 14h6" /></svg>
        case 'effect':
            return <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.7" className={iconClass}><path d="M12 2l3.09 6.26L22 9.27l-5 4.87 1.18 6.88L12 17.77l-6.18 3.25L7 14.14 2 9.27l6.91-1.01L12 2z" /></svg>
        case 'cursor':
            return <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.7" className={iconClass}><path d="M4 4v16l4-4h12V4H4z" /></svg>
        case 'special':
            return <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.7" className={iconClass}><path d="M12 3l1.5 4.5H18l-3.5 2.5 1.5 4.5L12 12l-4 2.5 1.5-4.5L6 7.5h4.5L12 3z" /><path d="M12 17v4" /></svg>
        default:
            return null
    }
}

export default function DailyRewardModal({ isOpen, onClose }: DailyRewardModalProps) {
    const { idToken } = useAuthStore()
    const { fetchInventory } = useInventoryStore()
    const [status, setStatus] = useState<DailyStatus | null>(null)
    const [isLoading, setIsLoading] = useState(true)
    const [isClaiming, setIsClaiming] = useState(false)
    const [claimResult, setClaimResult] = useState<ClaimDailyResult | null>(null)

    useEffect(() => {
        if (isOpen && idToken) {
            setClaimResult(null)
            setIsLoading(true)
            getDailyStatus(idToken)
                .then(setStatus)
                .catch(console.error)
                .finally(() => setIsLoading(false))
        }
    }, [isOpen, idToken])

    const handleClaim = async () => {
        if (!idToken || !status?.can_claim) return

        setIsClaiming(true)
        try {
            const result = await claimDailyReward(idToken)
            setClaimResult(result)
            // Refresh inventory to get new coins/items
            fetchInventory(idToken)
            // Update status
            const newStatus = await getDailyStatus(idToken)
            setStatus(newStatus)
        } catch (error) {
            console.error('Failed to claim:', error)
        } finally {
            setIsClaiming(false)
        }
    }

    if (!isOpen) return null

    const modal = (
        <AnimatePresence>
            {isOpen && (
                <motion.div
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    exit={{ opacity: 0 }}
                    className="fixed inset-0 z-50 flex items-center justify-center overflow-y-auto bg-black/80 p-4 backdrop-blur-sm typelo-modal-backdrop"
                    onClick={onClose}
                >
                    <motion.div
                        initial={{ opacity: 0, y: 8 }}
                        animate={{ opacity: 1, y: 0 }}
                        exit={{ opacity: 0, y: 8 }}
                        onClick={(e) => e.stopPropagation()}
                        role="dialog" aria-modal="true" aria-labelledby="daily-rewards-title"
                        className="relative my-auto w-full max-w-3xl overflow-hidden rounded-2xl border border-white/10 bg-[#0b0b0c] shadow-xl typelo-modal-surface"
                    >
                        {/* Close Button */}
                        <button
                            onClick={onClose}
                            aria-label="Close daily rewards"
                            className="absolute right-3 top-3 z-20 rounded-lg p-2 text-white/45 transition-colors hover:bg-white/5 hover:text-white"
                        >
                            <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                                <path d="M18 6L6 18M6 6l12 12" />
                            </svg>
                        </button>

                        <div className="relative z-10 flex flex-col p-5 sm:p-7">

                            {/* Header */}
                            <div className="mb-6 pr-9 text-left">
                                <h2 id="daily-rewards-title" className="text-xl font-semibold tracking-tight text-white sm:text-2xl">
                                    Daily rewards
                                </h2>
                                <div className="mt-1 text-sm text-white/50">
                                    {status ? `${status.streak} day streak` : 'Your 7-day reward cycle'}
                                </div>
                            </div>

                            {/* Rewards Grid */}
                            {isLoading ? (
                                <div className="flex h-40 w-full items-center justify-center">
                                    <div className="h-6 w-6 animate-spin rounded-full border-2 border-white/15 border-t-rose-400" />
                                </div>
                            ) : (
                                <div className="mb-6 grid w-full grid-cols-4 gap-2 sm:grid-cols-7">
                                    {DAILY_REWARDS.map((reward) => {
                                        const isPast = Boolean(status && reward.day < status.current_day)
                                        const isCurrent = Boolean(status && reward.day === status.current_day)
                                        const isFuture = Boolean(status && reward.day > status.current_day)
                                        return (
                                            <motion.div
                                                key={reward.day}
                                                className={`
                                                    relative flex min-h-[100px] min-w-0 flex-col items-center justify-center gap-2 rounded-xl border px-2 py-3 text-center
                                                    ${isFuture ? 'border-white/[0.08] bg-white/[0.025]' : ''}
                                                    ${isPast ? 'border-white/[0.08] bg-white/[0.05]' : ''}
                                                    ${isCurrent ? 'border-rose-400/50 bg-rose-400/[0.08]' : ''}
                                                `}
                                            >
                                                <div className="flex w-full items-center justify-between gap-1">
                                                    <span className={`text-[10px] font-medium ${isCurrent ? 'text-rose-300' : 'text-white/40'}`}>
                                                        Day {reward.day}
                                                    </span>
                                                    {isPast && <span aria-label="Claimed" className="text-xs text-emerald-300">✓</span>}
                                                </div>

                                                <div className="text-white/65">
                                                    <RewardIcon type={reward.type} size={20} isActive={isCurrent} />
                                                </div>

                                                <p className={`max-w-full text-[10px] leading-tight ${isCurrent ? 'font-semibold text-white' : 'text-white/50'}`}>
                                                    {reward.label}
                                                </p>
                                            </motion.div>
                                        )
                                    })}
                                </div>
                            )}

                            {/* Claim Result Message */}
                            {claimResult && (
                                <motion.div
                                    initial={{ opacity: 0, height: 0 }}
                                    animate={{ opacity: 1, height: 'auto' }}
                                    className="mb-5 w-full rounded-lg border border-emerald-400/15 bg-emerald-400/[0.06] px-4 py-3 text-center"
                                >
                                    <p className="text-sm text-emerald-200">
                                        Claimed {claimResult.coins_added} coins
                                        {claimResult.luck_boost_added > 0 && <span className="text-white/60"> · {claimResult.luck_boost_added} bonus spins</span>}
                                    </p>
                                </motion.div>
                            )}

                            {/* Main Action Button */}
                            <div className="w-full">
                                <motion.button
                                    onClick={handleClaim}
                                    disabled={!status?.can_claim || isClaiming}
                                    className={`
                                        w-full rounded-xl border px-4 py-3 text-sm font-semibold transition-colors
                                        ${status?.can_claim
                                            ? 'border-rose-400/40 bg-rose-500/10 text-rose-100 hover:bg-rose-500/15'
                                            : 'cursor-not-allowed border-white/[0.08] bg-white/[0.03] text-white/35'
                                        }
                                    `}
                                >
                                    {isClaiming ? (
                                        <span className="flex items-center justify-center gap-2">
                                            <div className="h-4 w-4 animate-spin rounded-full border-2 border-white/30 border-t-white" />
                                            Claiming…
                                        </span>
                                    ) : status?.can_claim ? (
                                        <span className="flex items-center justify-center gap-2">
                                            Claim Rewards
                                        </span>
                                    ) : (
                                        <span className="flex items-center justify-center gap-2">
                                            <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                                                <rect x="3" y="11" width="18" height="11" rx="2" ry="2" />
                                                <path d="M7 11V7a5 5 0 0 1 10 0v4" />
                                            </svg>
                                            Next reward in {Math.ceil(status?.hours_until_reset || 0)}h
                                        </span>
                                    )}
                                </motion.button>
                            </div>

                        </div>
                    </motion.div>
                </motion.div>
            )}
        </AnimatePresence>
    )

    return createPortal(modal, document.body)
}
