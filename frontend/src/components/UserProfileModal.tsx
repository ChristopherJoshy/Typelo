/*   ______      __ ____  _______       _  ____  _   _ 
 *  |  ____|   / / __ \|__   __|/\   | |/ __ \| \ | |
 *  | |__   _ / / |  | |  | |  /  \  | | |  | |  \| |
 *  |  __| | v /| |  | |  | | / /\ \ | | |  | | . ` |
 *  | |____ \ / | |__| |  | |/ ____ \| | |__| | |\  |
 *  |______| \_/ \____/   |_/_/    \_\_|\____/|_| \_|
 *                                                      
 */

/**
 * UserProfileModal Component - Displays another user's detailed public profile.
 * Enhanced gaming-style design with full stats, level progress, and friend request.
 * 
 * --------------------------------------------------------------------------
 *                                  Functions
 * --------------------------------------------------------------------------
 * UserProfileModal: Main component.
 * fetchProfile: Gets public profile data from API.
 * handleSendRequest: Sends a friend request to the user.
 * StatCard: Sub-component for stat display.
 * 
 * --------------------------------------------------------------------------
 *                            Variables and others
 * --------------------------------------------------------------------------
 * profile: Public profile data.
 * loading: Loading state.
 * sending: Request sending state.
 * sent: Request sent success state.
 * error: Error message.
 * activeTab: Currently selected tab.
 * 
 * --------------------------------------------------------------------------
 *                                   imports
 * --------------------------------------------------------------------------
 * react: React hooks.
 * framer-motion: Animations.
 * stores: Auth store.
 * config: API functions.
 * types: Rank utilities.
 */

import { useState, useEffect } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { useAuthStore } from '../stores/authStore'
import { usePreferencesStore } from '../stores/preferencesStore'
import { sendFriendRequest, getUserPublicProfile, PublicProfile } from '../config/api'
import { getRankColor, Rank, getRankFromElo, getProfileBackgroundInfo, getProfileBorderInfo, getProfileEffectInfo } from '../types'
import AvatarDecoration, { BORDER_TO_DECORATION } from './AvatarDecoration'
import ProfileEffectFrame from './ProfileEffectFrame'

interface UserProfileModalProps {
    isOpen: boolean
    onClose: () => void
    userId: string
    userName: string
    userPhoto: string | null
    userElo: number
    userRank: string
}

type TabType = 'stats' | 'overview'

export default function UserProfileModal({
    isOpen,
    onClose,
    userId,
    userName,
    userPhoto,
    userElo,
    userRank,
}: UserProfileModalProps) {
    const { idToken, user: currentUser } = useAuthStore()
    const [profile, setProfile] = useState<PublicProfile | null>(null)
    const [loading, setLoading] = useState(false)
    const [sending, setSending] = useState(false)
    const [sent, setSent] = useState(false)
    const [error, setError] = useState<string | null>(null)
    const [activeTab, setActiveTab] = useState<TabType>('overview')

    const fetchProfile = async () => {
        if (!idToken) return

        setLoading(true)
        setError(null)

        try {
            const data = await getUserPublicProfile(userId, idToken)
            setProfile(data)
        } catch (err) {
            console.error('Failed to fetch profile:', err)
        } finally {
            setLoading(false)
        }
    }

    useEffect(() => {
        if (isOpen && idToken) {
            setSent(false)
            setError(null)
            setActiveTab('overview')
            fetchProfile()
        }
    }, [isOpen, idToken, userId])

    useEffect(() => {
        const handleKeyDown = (e: KeyboardEvent) => {
            if (isOpen && e.key === 'Escape') onClose()
        }
        window.addEventListener('keydown', handleKeyDown)
        return () => window.removeEventListener('keydown', handleKeyDown)
    }, [isOpen, onClose])

    const handleSendRequest = async () => {
        if (!idToken || sending || sent) return

        setSending(true)
        setError(null)

        try {
            await sendFriendRequest(userId, idToken)
            setSent(true)
        } catch (err: unknown) {
            console.error('Failed to send request:', err)
            const apiError = err as { message?: string }
            setError(apiError.message || 'Failed to send request')
        } finally {
            setSending(false)
        }
    }

    const winRate = profile && profile.total_matches > 0
        ? Math.round((profile.wins / profile.total_matches) * 100)
        : 0
    const rank = getRankFromElo(userElo)
    const backgroundDisplayMode = usePreferencesStore(state => state.backgroundDisplayMode)
    const isOwnProfile = currentUser?.uid === userId
    const currentElo = userElo
    const nextRankElo = currentElo < 1000 ? 1000 : currentElo < 2000 ? 2000 : currentElo < 3000 ? 3000 : 10000
    const prevRankElo = currentElo < 1000 ? 0 : currentElo < 2000 ? 1000 : currentElo < 3000 ? 2000 : 3000
    const eloProgress = ((currentElo - prevRankElo) / (nextRankElo - prevRankElo)) * 100

    // Profile customization
    const bgInfo = backgroundDisplayMode !== 'off' && profile?.equipped_background ? getProfileBackgroundInfo(profile.equipped_background) : null
    const borderInfo = profile?.equipped_border ? getProfileBorderInfo(profile.equipped_border) : null
    const effectInfo = profile?.equipped_profile_effect ? getProfileEffectInfo(profile.equipped_profile_effect) : null

    return (
        <AnimatePresence>
            {isOpen && (
                <>
                    <motion.div
                        className="fixed inset-0 z-[60] typelo-modal-backdrop"
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        exit={{ opacity: 0 }}
                        onClick={onClose}
                    />

                    <motion.div
                        className="fixed inset-0 flex items-center justify-center z-[60] p-4"
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        exit={{ opacity: 0 }}
                    >
                        <motion.div
                            className="relative w-full max-w-2xl max-h-[90vh] overflow-hidden rounded-2xl typelo-modal-surface"
                            initial={{ scale: 0.95, y: 20 }}
                            animate={{ scale: 1, y: 0 }}
                            exit={{ scale: 0.95, y: 20 }}
                            transition={{ type: 'spring', damping: 25, stiffness: 400 }}
                            onClick={(e) => e.stopPropagation()}
                        >
                            {effectInfo && <ProfileEffectFrame effect={effectInfo} />}
                            <div
                                className="relative z-10 rounded-2xl overflow-hidden"
                                style={{
                                    background: bgInfo ? `url(${bgInfo.path}) center/cover no-repeat` : 'linear-gradient(180deg, #1a1a1a 0%, #0d0d0d 100%)',
                                    border: '1px solid rgba(255,255,255,0.08)',
                                }}
                            >
                                    <div className="absolute inset-0 bg-gradient-to-b from-transparent via-[#0d0d0d]/80 to-[#0d0d0d]" />

                                    <div className="relative z-10 overflow-y-auto max-h-[90vh] custom-scrollbar">
                                        <div className="px-6 py-5 flex items-center justify-between border-b border-white/[0.04]">
                                            <h2 className="text-base font-semibold text-white">Player Profile</h2>
                                            <button
                                                onClick={onClose}
                                                className="w-8 h-8 rounded-full bg-zinc-800 hover:bg-zinc-700 text-gray-400 flex items-center justify-center transition-colors shadow-lg"
                                            >
                                                <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                                                    <path d="M18 6L6 18M6 6l12 12" />
                                                </svg>
                                            </button>
                                        </div>

                                        <div className="p-6">
                                            <div className="flex flex-col items-center mb-6">
                                                <div className="relative">
                                                    {/* Avatar container with proper spacing for decorations */}
                                                    <div className="relative p-4">
                                                        {/* Border decoration - wraps around avatar */}
                                                        {borderInfo && profile?.equipped_border && (
                                                            <div className="absolute inset-0 flex items-center justify-center pointer-events-none">
                                                                <AvatarDecoration
                                                                    decorationType={BORDER_TO_DECORATION[profile.equipped_border] || 'default'}
                                                                    size={144}
                                                                    animate={true}
                                                                />
                                                            </div>
                                                        )}
                                                        {/* Actual avatar - innermost */}
                                                        <div
                                                            className="relative w-24 h-24 rounded-full overflow-hidden shadow-lg"
                                                            style={{
                                                                boxShadow: borderInfo?.color ? `0 2px 12px ${borderInfo.color}25` : undefined
                                                            }}
                                                        >
                                                            {userPhoto ? (
                                                                <img
                                                                    src={userPhoto}
                                                                    alt={userName}
                                                                    className="w-full h-full object-cover"
                                                                    crossOrigin="anonymous"
                                                                    referrerPolicy="no-referrer"
                                                                />
                                                            ) : (
                                                                <div className="w-full h-full flex items-center justify-center text-3xl text-white/60 bg-gradient-to-br from-orange-500/20 to-red-500/20">
                                                                    {userName.charAt(0)}
                                                                </div>
                                                            )}
                                                        </div>
                                                    </div>
                                                    {/* Friend request button */}
                                                    {!isOwnProfile && (
                                                        <button
                                                            onClick={handleSendRequest}
                                                            disabled={sending || sent}
                                                            className={`absolute -bottom-1 -right-1 w-7 h-7 rounded-full border-2 border-[#0d0d0d] flex items-center justify-center transition-colors ${sent ? 'bg-emerald-500' : 'bg-emerald-500 hover:bg-emerald-400'
                                                                }`}
                                                            title={sent ? "Friend request sent" : "Add friend"}
                                                        >
                                                            {sending ? (
                                                                <div className="w-3 h-3 border border-white/50 border-t-white rounded-full animate-spin" />
                                                            ) : sent ? (
                                                                <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth="3">
                                                                    <path d="M20 6L9 17l-5-5" />
                                                                </svg>
                                                            ) : (
                                                                <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth="2">
                                                                    <path d="M12 5v14M5 12h14" />
                                                                </svg>
                                                            )}
                                                        </button>
                                                    )}
                                                </div>

                                                <h3 className="text-xl font-bold text-white mb-2">{userName}</h3>

                                                <div className="flex items-center gap-3 mb-4">
                                                    <span
                                                        className="px-3 py-1 rounded text-sm font-bold"
                                                        style={{
                                                            backgroundColor: `${getRankColor(userRank as Rank)}20`,
                                                            color: getRankColor(userRank as Rank)
                                                        }}
                                                    >
                                                        {userRank}
                                                    </span>
                                                    <span className="text-sm font-mono text-white/50">{userElo} / {nextRankElo}</span>
                                                </div>

                                                <div className="w-full max-w-xs space-y-2">
                                                    <div className="flex justify-between text-xs text-white/40">
                                                        <span>Next rank</span>
                                                        <span>{rank === 'Ranker' ? 'MAX' : `${nextRankElo - currentElo} ELO to go`}</span>
                                                    </div>
                                                    <div className="relative h-2 bg-white/5 rounded-full overflow-hidden">
                                                        <motion.div
                                                            className="absolute inset-y-0 left-0 rounded-full"
                                                            initial={{ width: 0 }}
                                                            animate={{ width: `${Math.min(eloProgress, 100)}%` }}
                                                            transition={{ duration: 1, ease: 'easeOut' }}
                                                            style={{
                                                                background: 'linear-gradient(90deg, #f97316, #ea580c, #dc2626)',
                                                            }}
                                                        />
                                                    </div>
                                                </div>
                                            </div>

                                            <div className="border-t border-white/5 pt-4">
                                                <div className="flex items-center gap-1 mb-4">
                                                    {(['overview', 'stats'] as TabType[]).map((tab) => (
                                                        <button
                                                            key={tab}
                                                            onClick={() => setActiveTab(tab)}
                                                            className={`px-4 py-2 text-sm font-medium rounded-lg transition-colors ${activeTab === tab
                                                                ? 'bg-white/[0.05] text-white'
                                                                : 'text-white/40 hover:text-white/60'
                                                                }`}
                                                        >
                                                            {tab.charAt(0).toUpperCase() + tab.slice(1)}
                                                        </button>
                                                    ))}
                                                </div>

                                                {loading ? (
                                                    <div className="py-8 flex justify-center">
                                                        <div className="w-6 h-6 border-2 border-white/20 border-t-orange-400 rounded-full animate-spin" />
                                                    </div>
                                                ) : profile && (
                                                    <>
                                                        {activeTab === 'overview' && (
                                                            <div className="grid grid-cols-2 gap-3">
                                                                <StatCard
                                                                    icon={
                                                                        <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" className="text-white/40">
                                                                            <circle cx="12" cy="12" r="10" />
                                                                            <path d="M12 6v6l4 2" />
                                                                        </svg>
                                                                    }
                                                                    value={profile.total_matches}
                                                                    label="Total Games"
                                                                />
                                                                <StatCard
                                                                    icon={
                                                                        <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" className="text-emerald-400">
                                                                            <path d="M20 6L9 17l-5-5" />
                                                                        </svg>
                                                                    }
                                                                    value={`${winRate}%`}
                                                                    label="Win Rate"
                                                                    highlight
                                                                />
                                                                <StatCard
                                                                    icon={
                                                                        <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" className="text-white/40">
                                                                            <path d="M12 2L2 7l10 5 10-5-10-5zM2 17l10 5 10-5M2 12l10 5 10-5" />
                                                                        </svg>
                                                                    }
                                                                    value={profile.wins}
                                                                    label="Wins"
                                                                />
                                                                <StatCard
                                                                    icon={
                                                                        <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" className="text-white/40">
                                                                            <path d="M13 2L3 14h9l-1 8 10-12h-9l1-8z" />
                                                                        </svg>
                                                                    }
                                                                    value={`${Math.round(profile.avg_wpm)} WPM`}
                                                                    label="Avg Speed"
                                                                />
                                                            </div>
                                                        )}

                                                        {activeTab === 'stats' && (
                                                            <div className="space-y-3">
                                                                <div className="flex items-center justify-between p-3 bg-white/[0.02] rounded-lg border border-white/5">
                                                                    <span className="text-sm text-white/50">Total Matches</span>
                                                                    <span className="font-mono font-bold text-white">{profile.total_matches}</span>
                                                                </div>
                                                                <div className="flex items-center justify-between p-3 bg-white/[0.02] rounded-lg border border-white/5">
                                                                    <span className="text-sm text-white/50">Wins</span>
                                                                    <span className="font-mono font-bold text-emerald-400">{profile.wins}</span>
                                                                </div>
                                                                <div className="flex items-center justify-between p-3 bg-white/[0.02] rounded-lg border border-white/5">
                                                                    <span className="text-sm text-white/50">Losses</span>
                                                                    <span className="font-mono font-bold text-red-400">{profile.losses}</span>
                                                                </div>
                                                                <div className="flex items-center justify-between p-3 bg-white/[0.02] rounded-lg border border-white/5">
                                                                    <span className="text-sm text-white/50">Win Rate</span>
                                                                    <span className="font-mono font-bold text-white">{winRate}%</span>
                                                                </div>
                                                                <div className="flex items-center justify-between p-3 bg-white/[0.02] rounded-lg border border-white/5">
                                                                    <span className="text-sm text-white/50">Average WPM</span>
                                                                    <span className="font-mono font-bold text-orange-400">{Math.round(profile.avg_wpm)}</span>
                                                                </div>
                                                                <div className="flex items-center justify-between p-3 bg-white/[0.02] rounded-lg border border-white/5">
                                                                    <span className="text-sm text-white/50">Current ELO</span>
                                                                    <span className="font-mono font-bold text-white">{profile.elo_rating}</span>
                                                                </div>
                                                                <div className="flex items-center justify-between p-3 bg-white/[0.02] rounded-lg border border-white/5">
                                                                    <span className="text-sm text-white/50">Rank</span>
                                                                    <span className="font-bold" style={{ color: getRankColor(profile.rank as Rank) }}>{profile.rank}</span>
                                                                </div>
                                                            </div>
                                                        )}
                                                    </>
                                                )}

                                                {error && (
                                                    <p className="text-red-400 text-sm text-center mt-4">{error}</p>
                                                )}
                                            </div>
                                        </div>
                                    </div>
                                </div>
                        </motion.div>
                    </motion.div>
                </>
            )}
        </AnimatePresence>
    )
}

function StatCard({ icon, value, label, highlight }: { icon: React.ReactNode; value: string | number; label: string; highlight?: boolean }) {
    return (
        <div className="bg-white/[0.03] rounded-xl p-4 border border-white/5 flex items-center gap-3">
            <div className="w-10 h-10 rounded-lg bg-white/[0.03] flex items-center justify-center">
                {icon}
            </div>
            <div>
                <p className={`text-xl font-semibold ${highlight ? 'text-emerald-400' : 'text-white'}`}>{value}</p>
                <p className="text-[10px] text-white/40 uppercase tracking-wider">{label}</p>
            </div>
        </div>
    )
}
