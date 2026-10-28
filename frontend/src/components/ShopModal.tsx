/*   ______      __ ____  _______       _  ____  _   _ 
 *  |  ____|   / / __ \|__   __|/\   | |/ __ \| \ | |
 *  | |__   _ / / |  | |  | |  /  \  | | |  | |  \| |
 *  |  __| | v /| |  | |  | | / /\ \ | | |  | | . ` |
 *  | |____ \ / | |__| |  | |/ ____ \| | |__| | |\  |
 *  |______| \_/ \____/   |_/_/    \_\_|\____/|_| \_|
 *                                                      
 */

/**
 * ShopModal - Main shop interface with Cursor Royal gacha section.
 * 
 * --------------------------------------------------------------------------
 *                                  Functions
 * --------------------------------------------------------------------------
 * ShopModal: Main component managing the shop and spinning logic.
 * CrownIcon: Custom SVG icon for the "Cursor Royal" header.
 * CoinIcon: Custom SVG icon for coins.
 * SpinnerIcon: Custom SVG icon for the loading state.
 * playSpinTick: Plays a short browser-native tick during the roll.
 * playWinSound: Plays a rarity-based reveal sound.
 * 
 * --------------------------------------------------------------------------
 *                            Variables and others
 * --------------------------------------------------------------------------
 * SPIN_COST: Cost in coins to spin the wheel (50).
 * SLOT_HEIGHT: Height of a single item slot in pixels (64).
 * VISIBLE_SLOTS: Number of slots visible at once (3).
 * SPINS_BEFORE_STOP: Minimum number of items to scroll past (50).
 * ANIMATION_DURATION: Duration of the spin animation in seconds (5).
 * 
 * --------------------------------------------------------------------------
 *                                   Imports
 * --------------------------------------------------------------------------
 * react: useState, useEffect, useMemo, useRef.
 * framer-motion: motion, AnimatePresence, useAnimation.
 * react-dom: createPortal.
 * utils/audio: Lazy browser-native sound effects.
 * inventoryStore: Global state for user inventory and spin actions.
 * authStore: Authentication state.
 * types: Shared types like CursorInfo, SpinResult, and helpers like getRarityColor.
 */

import { useState, useEffect, useMemo, useRef, useCallback } from 'react'
import { motion, AnimatePresence, useAnimation, useReducedMotion } from 'framer-motion'
import { createPortal } from 'react-dom'
import { useInventoryStore, SPIN_COST, PROFILE_SPIN_COST } from '../stores/inventoryStore'
import { useAuthStore } from '../stores/authStore'
import { playClickSound, playRaritySound, unlockAudio } from '../utils/audio'
import { getLeaderboardBonus, type LeaderboardBonus } from '../config/api'
import {
    CURSORS, EFFECTS, getRarityColor, type SpinResult, type CursorInfo, type EffectInfo,
    PROFILE_BACKGROUNDS, PROFILE_EFFECTS as PROFILE_EFFECTS_DATA, PROFILE_BORDERS,
    type ProfileSpinResult, type ProfileBackgroundInfo, type ProfileEffectInfo, type ProfileBorderInfo
} from '../types'
import GachaReveal from './GachaReveal'
import crateImg from '../assets/crate.png'

import profileCrateImg from '../assets/profile_crate.png'

const ITEM_WIDTH = 120
const VISIBLE_ITEMS = 5
const ITEMS_BEFORE_WINNER = 36
const ANIMATION_DURATION = 3.8

interface SpinItem {
    type: 'cursor' | 'coins' | 'effect' | 'background' | 'profile_effect' | 'border' | 'nothing' | 'unknown'
    cursor?: CursorInfo
    effect?: EffectInfo
    coins?: number
    background?: ProfileBackgroundInfo
    profileEffect?: ProfileEffectInfo
    border?: ProfileBorderInfo
    id: string
}

interface ShopModalProps {
    isOpen: boolean
    onClose: () => void
}

const CoinIcon = ({ size = 48 }: { size?: number }) => (
    <svg width={size} height={size} viewBox="0 0 48 48" fill="none">
        <circle cx="24" cy="24" r="20" fill="#fbbf24" />
        <text x="24" y="31" textAnchor="middle" fontSize="18" fontWeight="bold" fill="#000">$</text>
    </svg>
)

const EffectIcon = ({ color, size = 40 }: { color: string; size?: number }) => (
    <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke={color} strokeWidth="2">
        <path d="M12 2l3.09 6.26L22 9.27l-5 4.87 1.18 6.88L12 17.77l-6.18 3.25L7 14.14 2 9.27l6.91-1.01L12 2z" />
    </svg>
)

export default function ShopModal({ isOpen, onClose }: ShopModalProps) {
    const reduceMotion = useReducedMotion()
    const { idToken } = useAuthStore()
    const {
        coins, fetchInventory, spin, pityActive, pityStreak, cratesOpened,
        spinProfileCrate, profilePityActive, profilePityStreak, profileCratesOpened,
        fetchProfileInventory,
    } = useInventoryStore()

    const [phase, setPhase] = useState<'crates' | 'rolling' | 'reveal'>('crates')
    const [activeRollType, setActiveRollType] = useState<'cursor' | 'profile'>('cursor')
    const [isSpinning, setIsSpinning] = useState(false)
    const [spinResult, setSpinResult] = useState<SpinResult | null>(null)
    const [profileSpinResult, setProfileSpinResult] = useState<ProfileSpinResult | null>(null)
    const [displayItems, setDisplayItems] = useState<SpinItem[]>([])
    const [showDropRates, setShowDropRates] = useState(false)
    const [showProfileDropRates, setShowProfileDropRates] = useState(false)
    const [leaderboardBonus, setLeaderboardBonus] = useState<LeaderboardBonus | null>(null)
    const [autoSpinCursor, setAutoSpinCursor] = useState(false)
    const [autoSpinProfile, setAutoSpinProfile] = useState(false)

    const controls = useAnimation()
    const tickIntervalRef = useRef<ReturnType<typeof setTimeout> | null>(null)
    const lastTickRef = useRef<number>(0)
    const containerRef = useRef<HTMLDivElement>(null)
    const winnerCardRef = useRef<HTMLDivElement>(null)

    const baseItems: SpinItem[] = useMemo(() => {
        const items: SpinItem[] = []
        Object.values(CURSORS).forEach((cursor, idx) => {
            items.push({ type: 'cursor', cursor, id: `base-cursor-${idx}` })
        })
        Object.values(EFFECTS).forEach((effect, idx) => {
            items.push({ type: 'effect', effect, id: `base-effect-${idx}` })
        })
        items.push({ type: 'coins', coins: 5, id: 'base-coin-5' })
        items.push({ type: 'coins', coins: 10, id: 'base-coin-10' })
        return items
    }, [])

    const profileBaseItems: SpinItem[] = useMemo(() => {
        const items: SpinItem[] = []
        Object.values(PROFILE_BACKGROUNDS).forEach((bg, idx) => {
            items.push({ type: 'background', background: bg, id: `base-bg-${idx}` })
        })
        Object.values(PROFILE_EFFECTS_DATA).forEach((effect, idx) => {
            items.push({ type: 'profile_effect', profileEffect: effect, id: `base-peffect-${idx}` })
        })
        Object.values(PROFILE_BORDERS).forEach((border, idx) => {
            items.push({ type: 'border', border, id: `base-border-${idx}` })
        })
        return items
    }, [])

    useEffect(() => {
        if (isOpen && idToken) {
            fetchInventory(idToken)
            fetchProfileInventory(idToken)
            // Fetch leaderboard bonus for price display
            getLeaderboardBonus(idToken).then(setLeaderboardBonus).catch(console.error)
        }
    }, [isOpen, idToken, fetchInventory, fetchProfileInventory])

    useEffect(() => {
        const handleKeyDown = (e: KeyboardEvent) => {
            if (isOpen && e.key === 'Escape' && !isSpinning) onClose()
        }
        window.addEventListener('keydown', handleKeyDown)
        return () => window.removeEventListener('keydown', handleKeyDown)
    }, [isOpen, onClose, isSpinning])

    // Sound Helpers
    const playTickSound = useCallback(() => {
        const now = performance.now()
        if (now - lastTickRef.current < 30) return
        lastTickRef.current = now
        playClickSound()
    }, [])

    const playWinSound = useCallback((rarity: string = 'common') => {
        playRaritySound(rarity)
    }, [])

    // Handle Animation Phase
    useEffect(() => {
        let cancelled = false
        if (phase === 'rolling') {
            const animate = async () => {
                // Allow a frame for the ROLLING view to render so containerRef is valid
                await new Promise<void>((resolve) => {
                    requestAnimationFrame(() => {
                        requestAnimationFrame(() => {
                            resolve()
                        })
                    })
                })
                if (cancelled) return

                // Reset controller
                await controls.set({ x: 0 })

                // Center the actual server-selected card using its rendered
                // position, so CSS sizing and responsive layout cannot change
                // which reward lands under the marker.
                const containerRect = containerRef.current?.getBoundingClientRect()
                const winnerRect = winnerCardRef.current?.getBoundingClientRect()
                const containerWidth = containerRect?.width || ITEM_WIDTH * VISIBLE_ITEMS
                const responsiveItemWidth = Math.min(120, Math.max(72, window.innerWidth * 0.2))
                const targetX = containerRect && winnerRect
                    ? containerWidth / 2 - (winnerRect.left - containerRect.left + winnerRect.width / 2)
                    : -(ITEMS_BEFORE_WINNER * responsiveItemWidth) + (containerWidth / 2 - responsiveItemWidth / 2)

                // Start tick sounds
                let tickCount = 0
                const maxTicks = 80
                const scheduleNextTick = () => {
                    playTickSound()
                    tickCount++
                    const progress = tickCount / maxTicks
                    const nextDelay = 30 + (200 * Math.pow(progress, 2))
                    if (tickCount < maxTicks) {
                        tickIntervalRef.current = setTimeout(scheduleNextTick, nextDelay)
                    }
                }
                if (!reduceMotion) scheduleNextTick()

                // Start roll animation
                if (reduceMotion) {
                    await controls.set({ x: targetX })
                } else {
                    await controls.start({
                        x: targetX,
                        transition: {
                            duration: ANIMATION_DURATION,
                            ease: [0.12, 0.78, 0.22, 1]
                        }
                    })
                }
                if (cancelled) return

                // Animation Complete
                if (tickIntervalRef.current) clearTimeout(tickIntervalRef.current)

                // Play Win Sound
                const winningItem = displayItems[ITEMS_BEFORE_WINNER]
                if (winningItem) {
                    playWinSound(
                        winningItem.cursor?.rarity ||
                        winningItem.effect?.rarity ||
                        winningItem.background?.rarity ||
                        winningItem.profileEffect?.rarity ||
                        winningItem.border?.rarity ||
                        'common'
                    )
                }

                setPhase('reveal')
                setIsSpinning(false)

                // Refresh Inventory Data
                if (idToken) {
                    fetchInventory(idToken)
                    if (activeRollType === 'profile') {
                        fetchProfileInventory(idToken)
                    }
                }
            }
            animate()
        }
        return () => {
            cancelled = true
            if (tickIntervalRef.current) clearTimeout(tickIntervalRef.current)
        }
    }, [phase, controls, displayItems, activeRollType, idToken, fetchInventory, fetchProfileInventory, playTickSound, playWinSound, containerRef, reduceMotion])

    useEffect(() => {
        if (!isOpen) {
            setPhase('crates')
            setSpinResult(null)
            setIsSpinning(false)
            setAutoSpinCursor(false)
            setAutoSpinProfile(false)
            controls.stop()
            if (tickIntervalRef.current) clearTimeout(tickIntervalRef.current)
        }
    }, [isOpen, controls])



    const handleOpenCrate = async () => {
        const cost = leaderboardBonus?.gachaDiscountedCost ?? SPIN_COST
        if (!idToken || coins < cost || isSpinning) return

        // Unlock audio synchronously from this click before the API request.
        unlockAudio()

        setIsSpinning(true)
        if (tickIntervalRef.current) clearTimeout(tickIntervalRef.current)

        try {
            // FIRST: Get the result from the API
            const result = await spin(idToken, cost)

            if (!result) {
                setIsSpinning(false)
                setPhase('crates')
                return
            }

            setSpinResult(result)
            setActiveRollType('cursor')

            // SECOND: Determine the winning item
            let winningItem: SpinItem | undefined

            if (result.type === 'cursor' && result.cursorId) {
                const cursorInfo = result.cursorInfo || CURSORS[result.cursorId]
                if (cursorInfo) {
                    winningItem = { type: 'cursor', cursor: cursorInfo, id: `winner-${Date.now()}` }
                }
            } else if (result.type === 'effect' && result.effectId) {
                const effectInfo = result.effectInfo || EFFECTS[result.effectId]
                if (effectInfo) {
                    winningItem = { type: 'effect', effect: effectInfo, id: `winner-${Date.now()}` }
                }
            } else if (result.type === 'coins' && result.coinsWon === 5) {
                winningItem = { type: 'coins', coins: 5, id: `winner-${Date.now()}` }
            } else if (result.type === 'coins' && result.coinsWon === 10) {
                winningItem = { type: 'coins', coins: 10, id: `winner-${Date.now()}` }
            } else if (result.type === 'nothing') {
                winningItem = { type: 'nothing', id: `winner-nothing-${Date.now()}` }
            }

            // Fallback
            if (!winningItem) {
                winningItem = { type: 'unknown', id: `winner-fallback-${Date.now()}` }
            }

            // THIRD: Generate items with the winner ALREADY in place at position ITEMS_BEFORE_WINNER
            const items: SpinItem[] = []
            for (let i = 0; i < ITEMS_BEFORE_WINNER + 10; i++) {
                if (i === ITEMS_BEFORE_WINNER) {
                    // Place the winning item at the target position
                    items.push(winningItem)
                } else {
                    const randomBase = baseItems[Math.floor(Math.random() * baseItems.length)]
                    items.push({ ...randomBase, id: `roll-${Date.now()}-${i}` })
                }
            }

            // FOURTH: Set items and show rolling phase
            setDisplayItems(items)
            setPhase('rolling')



        } catch (error) {
            console.error("Spin failed", error)
            setIsSpinning(false)
            setPhase('crates')
        }
    }

    const handleOpenProfileCrate = async () => {
        const cost = leaderboardBonus?.profileDiscountedCost ?? PROFILE_SPIN_COST
        if (!idToken || coins < cost || isSpinning) return

        unlockAudio()
        setIsSpinning(true)
        if (tickIntervalRef.current) clearTimeout(tickIntervalRef.current)

        try {
            // FIRST: Get the result from the API
            const result = await spinProfileCrate(idToken, cost)
            if (!result) {
                setIsSpinning(false)
                setPhase('crates')
                return
            }

            setProfileSpinResult(result)
            setActiveRollType('profile')

            // SECOND: Determine the winning item
            let winningItem: SpinItem | undefined

            if (result.type === 'background' && result.itemId) {
                const bgInfo = result.backgroundInfo || PROFILE_BACKGROUNDS[result.itemId as keyof typeof PROFILE_BACKGROUNDS]
                if (bgInfo) {
                    winningItem = { type: 'background', background: bgInfo, id: `profile-winner-${Date.now()}` }
                }
            } else if (result.type === 'profile_effect' && result.itemId) {
                const effectInfo = result.effectInfo || PROFILE_EFFECTS_DATA[result.itemId]
                if (effectInfo) {
                    winningItem = { type: 'profile_effect', profileEffect: effectInfo, id: `profile-winner-${Date.now()}` }
                }
            } else if (result.type === 'border' && result.itemId) {
                const borderInfo = result.borderInfo || PROFILE_BORDERS[result.itemId]
                if (borderInfo) {
                    winningItem = { type: 'border', border: borderInfo, id: `profile-winner-${Date.now()}` }
                }
            } else if (result.type === 'nothing') {
                winningItem = { type: 'nothing', id: `profile-nothing-${Date.now()}` }
            } else if (result.type === 'coins' && result.coinsWon) {
                winningItem = { type: 'coins', coins: result.coinsWon, id: `profile-coins-${Date.now()}` }
            }

            if (!winningItem) {
                winningItem = { type: 'unknown', id: `profile-fallback-${Date.now()}` }
            }

            if (!winningItem) throw new Error("No winning item found")

            // THIRD: Generate items with the winner ALREADY in place at position ITEMS_BEFORE_WINNER
            const items: SpinItem[] = []
            for (let i = 0; i < ITEMS_BEFORE_WINNER + 10; i++) {
                if (i === ITEMS_BEFORE_WINNER) {
                    // Place the winning item at the target position
                    items.push(winningItem)
                } else if (profileBaseItems.length > 0) {
                    const randomBase = profileBaseItems[Math.floor(Math.random() * profileBaseItems.length)]
                    items.push({ ...randomBase, id: `profile-roll-${Date.now()}-${i}` })
                }
            }

            // FOURTH: Set items and show rolling phase
            setDisplayItems(items)
            setPhase('rolling')



        } catch (error) {
            console.error("Profile spin failed", error)
            setIsSpinning(false)
            setPhase('crates')
        }
    }

    const calculateBoostedRate = (baseRateStr: string, bonusPercent: number = 0) => {
        if (!bonusPercent) return baseRateStr
        const baseRate = parseFloat(baseRateStr.replace('%', ''))
        const boostedRate = baseRate * (1 + bonusPercent / 100)

        // Handle decimals intelligently
        if (boostedRate < 0.01) return boostedRate.toFixed(4) + '%'
        if (boostedRate < 0.1) return boostedRate.toFixed(3) + '%'
        if (boostedRate < 1) return boostedRate.toFixed(2) + '%'
        if (boostedRate % 1 === 0) return boostedRate.toFixed(0) + '%'
        return boostedRate.toFixed(1) + '%'
    }

    const getItemRarity = () => {
        if (!spinResult) return 'common'
        if (spinResult.type === 'cursor' && spinResult.cursorInfo) return spinResult.cursorInfo.rarity
        if (spinResult.type === 'effect' && spinResult.effectInfo) return spinResult.effectInfo.rarity
        return 'common'
    }

    const modal = (
        <AnimatePresence>
            {isOpen && (
                <motion.div
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    exit={{ opacity: 0 }}
                    className="fixed inset-0 z-[300] flex items-center justify-center bg-black/85 p-4 backdrop-blur-sm typelo-modal-backdrop"
                    onClick={() => phase === 'crates' && onClose()}
                >
                    <motion.div
                        initial={{ scale: 0.95, opacity: 0 }}
                        animate={{ scale: 1, opacity: 1 }}
                        exit={{ scale: 0.95, opacity: 0 }}
                        onClick={(e) => e.stopPropagation()}
                        role="dialog" aria-modal="true" aria-label="Cosmetic shop"
                        className="relative max-h-[90dvh] w-full max-w-2xl overflow-y-auto overscroll-contain rounded-2xl border border-white/10 bg-[#0b0b0c] shadow-xl typelo-modal-surface"
                    >
                        {/* Header */}
                        <div className="flex items-center justify-between px-5 md:px-7 py-4 md:py-5 border-b border-white/[0.07] bg-white/[0.02]">
                            <div className="flex items-center gap-2 md:gap-3">
                                <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" className="text-purple-400 md:w-6 md:h-6">
                                    <path d="M21 16V8a2 2 0 0 0-1-1.73l-7-4a2 2 0 0 0-2 0l-7 4A2 2 0 0 0 3 8v8a2 2 0 0 0 1 1.73l7 4a2 2 0 0 0 2 0l7-4A2 2 0 0 0 21 16z" />
                                </svg>
                                <h2 className="text-base font-semibold tracking-tight text-white">Shop</h2>
                                {/* OPENED counter - desktop only, inline with title */}
                                <span className="hidden md:inline text-[10px] text-white/40 font-mono ml-2">
                                    OPENED: <span className="text-white/80">{cratesOpened}</span>
                                </span>
                            </div>
                            <div className="flex items-center gap-2 md:gap-4">
                                <div className="flex items-center gap-1.5 rounded-lg border border-white/10 bg-white/[0.035] px-2.5 py-1.5">
                                    <span className="font-mono text-xs font-semibold tabular-nums text-white">{coins}</span>
                                    <span className="text-[10px] text-white/45">coins</span>
                                </div>
                                <button onClick={onClose} className="p-1 text-white/40 hover:text-white transition-colors">
                                    <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" className="md:w-5 md:h-5">
                                        <path d="M18 6L6 18M6 6l12 12" />
                                    </svg>
                                </button>
                            </div>
                        </div>

                        {/* Phase: Crates */}
                        {phase === 'crates' && (
                            <div className="p-4 md:p-6">
                                <div className="grid grid-cols-1 gap-3 sm:grid-cols-2 sm:gap-4">

                                    {/* ==================== ALL IN ONE CRATE ==================== */}
                                    <motion.div
                                        whileHover={{ y: -2 }}
                                        className="relative flex flex-col justify-between overflow-hidden rounded-xl border border-white/[0.08] bg-white/[0.02]"
                                    >
                                        {/* Content Container */}
                                        <div className="relative z-10 flex h-full flex-col p-4">

                                            {/* Header Section */}
                                            <div className="mb-3 flex items-start justify-between">
                                                <div className="flex flex-col">
                                                    <h3 className="text-sm font-semibold text-white">
                                                        Cursor crate
                                                    </h3>
                                                    <p className="mt-1 text-xs text-white/45">Cursors and effects</p>
                                                </div>
                                            </div>

                                            {/* Centerpiece Image - Static */}
                                            <div className="flex items-center justify-center py-1">
                                                <img
                                                    src={crateImg}
                                                    alt="Cursor crate"
                                                    className="h-20 w-20 object-contain"
                                                />
                                            </div>

                                            {/* Pity Meter */}
                                            <div className="mb-4 mt-2 space-y-2">
                                                <div className="flex justify-between items-end">
                                                    <span className="text-xs text-white/45">Luck protection</span>
                                                    <span className={`font-mono text-xs tabular-nums ${pityActive ? 'text-rose-300' : 'text-white/45'}`}>
                                                        {pityActive ? 'Ready' : `${pityStreak}/5`}
                                                    </span>
                                                </div>
                                                <div className="flex h-1 gap-1">
                                                    {[...Array(5)].map((_, i) => (
                                                        <div key={i} className="relative flex-1 overflow-hidden rounded-full bg-white/[0.06]">
                                                            <div
                                                                className={`absolute inset-0 ${pityStreak > i || pityActive
                                                                    ? 'bg-rose-400'
                                                                    : ''
                                                                    }`}
                                                            />
                                                        </div>
                                                    ))}
                                                </div>
                                            </div>

                                            {/* Action Area */}
                                            <div className="mt-auto space-y-3">
                                                {/* Leaderboard/Bonus Info - hidden on mobile */}
                                                {leaderboardBonus?.isTopPlayer && (
                                                    <div className="flex flex-wrap justify-center gap-2 text-[10px]">
                                                        <div className="rounded border border-white/10 px-2 py-1 text-white/60">
                                                            -{leaderboardBonus.coinReductionPercent}% Cost
                                                        </div>
                                                        <div className="rounded border border-white/10 px-2 py-1 text-white/60">
                                                            +{leaderboardBonus.luckBonusPercent}% Luck
                                                        </div>
                                                    </div>
                                                )}

                                                <motion.button
                                                    whileHover={{ scale: 1.02 }}
                                                    whileTap={{ scale: 0.98 }}
                                                    onClick={handleOpenCrate}
                                                    disabled={coins < (leaderboardBonus?.gachaDiscountedCost ?? SPIN_COST) || isSpinning}
                                                    className={`
                                                        w-full overflow-hidden rounded-lg border px-3 py-2.5 text-sm font-semibold transition-colors
                                                        ${coins >= (leaderboardBonus?.gachaDiscountedCost ?? SPIN_COST) && !isSpinning
                                                            ? 'border-rose-400/35 bg-rose-500/10 text-rose-100 hover:bg-rose-500/15'
                                                            : 'cursor-not-allowed border-white/[0.08] bg-white/[0.03] text-white/30'
                                                        }
                                                    `}
                                                >
                                                    <div className="flex items-center justify-center gap-2">
                                                        {isSpinning ? (
                                                            <div className="h-4 w-4 animate-spin rounded-full border-2 border-white/30 border-t-white" />
                                                        ) : (
                                                            <span>Open · {leaderboardBonus?.isTopPlayer ? leaderboardBonus.gachaDiscountedCost : SPIN_COST} coins</span>
                                                        )}
                                                    </div>
                                                </motion.button>

                                                {/* Auto and Info buttons - hidden on mobile */}
                                                <div className="flex items-center justify-between gap-2">
                                                    <button
                                                        onClick={(e) => { e.stopPropagation(); setAutoSpinCursor(!autoSpinCursor) }}
                                                        className={`flex-1 rounded-lg border px-3 py-2 text-xs transition-colors ${autoSpinCursor
                                                            ? 'border-rose-400/30 bg-rose-400/[0.08] text-rose-200'
                                                            : 'border-white/[0.08] text-white/50 hover:bg-white/[0.04] hover:text-white'
                                                            }`}
                                                    >
                                                        {autoSpinCursor ? 'Auto: ON' : 'Enable Auto'}
                                                    </button>

                                                    <button
                                                        onClick={(e) => { e.stopPropagation(); setShowDropRates(!showDropRates) }}
                                                        className="flex h-9 w-9 items-center justify-center rounded-lg border border-white/[0.08] text-white/50 transition-colors hover:bg-white/[0.04] hover:text-white"
                                                        title="View Drop Rates"
                                                    >
                                                        <span className="font-serif italic font-bold">i</span>
                                                    </button>
                                                </div>
                                            </div>
                                        </div>
                                    </motion.div>

                                    {/* ==================== PROFILE CRATE ==================== */}
                                    <motion.div
                                        whileHover={{ y: -2 }}
                                        className="relative flex flex-col justify-between overflow-hidden rounded-xl border border-white/[0.08] bg-white/[0.02]"
                                    >
                                        {/* Content Container */}
                                        <div className="relative z-10 flex h-full flex-col p-4">

                                            {/* Header Section */}
                                            <div className="mb-3 flex items-start justify-between">
                                                <div className="flex flex-col">
                                                    <h3 className="text-sm font-semibold text-white">
                                                        Profile Kit
                                                    </h3>
                                                    <p className="mt-1 text-xs text-white/45">Banners and borders</p>
                                                </div>
                                            </div>

                                            {/* Centerpiece Image - Static */}
                                            <div className="flex items-center justify-center py-1">
                                                <img
                                                    src={profileCrateImg}
                                                    alt="Profile Crate"
                                                    className="h-20 w-20 object-contain"
                                                />
                                            </div>

                                            {/* Pity Meter */}
                                            <div className="mb-4 mt-2 space-y-2">
                                                <div className="flex justify-between items-end">
                                                    <span className="text-xs text-white/45">Luck protection</span>
                                                    <span className={`font-mono text-xs tabular-nums ${profilePityActive ? 'text-rose-300' : 'text-white/45'}`}>
                                                        {profilePityActive ? 'Ready' : `${profilePityStreak}/7`}
                                                    </span>
                                                </div>
                                                <div className="flex h-1 gap-1">
                                                    {[...Array(7)].map((_, i) => (
                                                        <div key={i} className="relative flex-1 overflow-hidden rounded-full bg-white/[0.06]">
                                                            <div
                                                                className={`absolute inset-0 ${profilePityStreak > i || profilePityActive
                                                                    ? 'bg-rose-400'
                                                                    : ''
                                                                    }`}
                                                            />
                                                        </div>
                                                    ))}
                                                </div>
                                            </div>

                                            {/* Action Area */}
                                            <div className="mt-auto space-y-3">
                                                {/* Leaderboard/Bonus Info - hidden on mobile */}
                                                {leaderboardBonus?.isTopPlayer && (
                                                    <div className="flex flex-wrap justify-center gap-2 text-[10px]">
                                                        <div className="rounded border border-white/10 px-2 py-1 text-white/60">
                                                            -{leaderboardBonus.coinReductionPercent}% Cost
                                                        </div>
                                                        <div className="rounded border border-white/10 px-2 py-1 text-white/60">
                                                            +{leaderboardBonus.luckBonusPercent}% Luck
                                                        </div>
                                                    </div>
                                                )}

                                                <motion.button
                                                    whileHover={{ scale: 1.02 }}
                                                    whileTap={{ scale: 0.98 }}
                                                    onClick={handleOpenProfileCrate}
                                                    disabled={coins < (leaderboardBonus?.profileDiscountedCost ?? PROFILE_SPIN_COST) || isSpinning}
                                                    className={`
                                                        w-full overflow-hidden rounded-lg border px-3 py-2.5 text-sm font-semibold transition-colors
                                                        ${coins >= (leaderboardBonus?.profileDiscountedCost ?? PROFILE_SPIN_COST) && !isSpinning
                                                            ? 'border-rose-400/35 bg-rose-500/10 text-rose-100 hover:bg-rose-500/15'
                                                            : 'cursor-not-allowed border-white/[0.08] bg-white/[0.03] text-white/30'
                                                        }
                                                    `}
                                                >
                                                    <div className="flex items-center justify-center gap-2">
                                                        {isSpinning ? (
                                                            <div className="h-4 w-4 animate-spin rounded-full border-2 border-white/30 border-t-white" />
                                                        ) : (
                                                            <span>Open · {leaderboardBonus?.isTopPlayer ? leaderboardBonus.profileDiscountedCost : PROFILE_SPIN_COST} coins</span>
                                                        )}
                                                    </div>
                                                </motion.button>

                                                {/* Auto and Info buttons - hidden on mobile */}
                                                <div className="flex items-center justify-between gap-2">
                                                    <button
                                                        onClick={(e) => { e.stopPropagation(); setAutoSpinProfile(!autoSpinProfile) }}
                                                        className={`flex-1 rounded-lg border px-3 py-2 text-xs transition-colors ${autoSpinProfile
                                                            ? 'border-rose-400/30 bg-rose-400/[0.08] text-rose-200'
                                                            : 'border-white/[0.08] text-white/50 hover:bg-white/[0.04] hover:text-white'
                                                            }`}
                                                    >
                                                        {autoSpinProfile ? 'Auto: ON' : 'Enable Auto'}
                                                    </button>

                                                    <button
                                                        onClick={(e) => { e.stopPropagation(); setShowProfileDropRates(!showProfileDropRates) }}
                                                        className="flex h-9 w-9 items-center justify-center rounded-lg border border-white/[0.08] text-white/50 transition-colors hover:bg-white/[0.04] hover:text-white"
                                                        title="View Drop Rates"
                                                    >
                                                        <span className="font-serif italic font-bold">i</span>
                                                    </button>
                                                </div>
                                            </div>
                                        </div>
                                    </motion.div>

                                </div>

                                {/* Shared Drop Rates Popover (Conditional Rendering) */}
                                <AnimatePresence>
                                    {(showDropRates || showProfileDropRates) && (
                                        <motion.div
                                            initial={{ opacity: 0, scale: 0.95 }}
                                            animate={{ opacity: 1, scale: 1 }}
                                            exit={{ opacity: 0, scale: 0.95 }}
                                            className="absolute inset-x-4 top-1/2 z-50 max-h-[75dvh] -translate-y-1/2 overflow-y-auto rounded-xl border border-white/10 bg-[#0b0b0c] p-4 shadow-xl sm:inset-x-8 sm:p-5"
                                        >
                                            <div className="flex items-center justify-between mb-4 border-b border-white/10 pb-4">
                                                <div>
                                                    <h4 className="text-xl font-bold text-white">
                                                        {showDropRates ? 'Crate Probabilities' : 'Profile Kit Odds'}
                                                    </h4>
                                                    <p className="text-xs text-white/40 mt-1">
                                                        Selected base outcome weights. Actual odds are normalized and change with luck boosts and your collection; boosts do not guarantee an item.
                                                    </p>
                                                </div>
                                                <button
                                                    onClick={() => { setShowDropRates(false); setShowProfileDropRates(false); }}
                                                    className="p-2 rounded-full bg-white/5 hover:bg-white/10"
                                                >
                                                    <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" className="text-white/60">
                                                        <path d="M18 6L6 18M6 6l12 12" />
                                                    </svg>
                                                </button>
                                            </div>

                                            <div className="grid grid-cols-2 gap-x-4 gap-y-1">
                                                {(showDropRates ? [
                                                    { label: 'Better Luck Next Time', rate: '25%', color: '#ef4444' },
                                                    { label: 'Common Item', rate: '20%', color: getRarityColor('common') },
                                                    { label: 'Common Effect', rate: '8%', color: getRarityColor('common') },
                                                    { label: 'Uncommon Item', rate: '5%', color: getRarityColor('uncommon') },
                                                    { label: 'Rare Item', rate: '3%', color: getRarityColor('rare') },
                                                    { label: 'Epic Item', rate: '2%', color: getRarityColor('epic') },
                                                    { label: 'Legendary', rate: '1%', color: getRarityColor('legendary') },
                                                    { label: 'Ultra', rate: '0.5%', color: getRarityColor('ultra') },
                                                    { label: 'Divine', rate: '0.15%', color: getRarityColor('divine') },
                                                    { label: 'Mythical', rate: '0.001%', color: getRarityColor('mythical') },
                                                ] : [
                                                    { label: 'Better Luck Next Time', rate: '25%', color: '#ef4444' },
                                                    { label: 'Common Background', rate: '10%', color: getRarityColor('common') },
                                                    { label: 'Common Effect', rate: '12%', color: getRarityColor('common') },
                                                    { label: 'Common Border', rate: '8%', color: getRarityColor('common') },
                                                    { label: 'Uncommon', rate: '2%', color: getRarityColor('uncommon') },
                                                    { label: 'Rare', rate: '0.8%', color: getRarityColor('rare') },
                                                    { label: 'Epic', rate: '0.3%', color: getRarityColor('epic') },
                                                    { label: 'Legendary', rate: '0.1%', color: getRarityColor('legendary') },
                                                    { label: 'Mythical', rate: '0.01%', color: getRarityColor('mythical') },
                                                ]).map((item, i) => (
                                                    <div key={i} className="flex items-center justify-between py-2 border-b border-white/5 last:border-0">
                                                        <span className="text-sm font-medium" style={{ color: item.color }}>{item.label}</span>
                                                        <span className="font-mono text-sm text-white/50">{item.rate.replace('%', '')} weight</span>
                                                    </div>
                                                ))}
                                            </div>
                                        </motion.div>
                                    )}
                                </AnimatePresence>
                            </div>
                        )}{/* Phase: Rolling */}
                        {
                            phase === 'rolling' && (
                                <div className="py-6">
                                    {/* Center Marker */}
                                    <div className="relative">
                                        <div aria-hidden="true" className="absolute bottom-0 left-1/2 top-0 z-20 w-px -translate-x-1/2 bg-rose-400" />

                                        {/* Rolling Strip */}
                                        <div ref={containerRef} className="relative mx-auto w-full max-w-[600px] overflow-hidden rounded-xl border border-white/10 bg-white/[0.025]">
                                            {/* Edge fades */}
                                            <div className="pointer-events-none absolute bottom-0 left-0 top-0 z-10 w-8 bg-gradient-to-r from-[#0b0b0c] to-transparent" />
                                            <div className="pointer-events-none absolute bottom-0 right-0 top-0 z-10 w-8 bg-gradient-to-l from-[#0b0b0c] to-transparent" />

                                            <motion.div
                                                className="flex"
                                                animate={controls}
                                                initial={{ x: 0 }}
                                            >
                                                {displayItems.map((item, index) => (
                                                    <div
                                                        key={item.id}
                                                        ref={index === ITEMS_BEFORE_WINNER ? winnerCardRef : undefined}
                                                        className="flex flex-shrink-0 flex-col items-center justify-center border-r border-white/[0.05] p-2"
                                                        style={{ width: 'clamp(72px, 20vw, 120px)', height: 112 }}
                                                    >
                                                        {item.type === 'cursor' && item.cursor ? (
                                                            <>
                                                                <div
                                                                    className="w-2 h-12 rounded-full mb-2"
                                                                    style={{
                                                                        backgroundColor: item.cursor.color === 'rainbow' ? '#ec4899' : item.cursor.color,
                                                                        boxShadow: `0 0 16px ${item.cursor.glow}`,
                                                                    }}
                                                                />
                                                                <span className="text-[10px] text-white/60 text-center truncate w-full px-1">{item.cursor.name}</span>
                                                                <span className="text-[8px] uppercase mt-0.5" style={{ color: getRarityColor(item.cursor.rarity) }}>
                                                                    {item.cursor.rarity}
                                                                </span>
                                                            </>
                                                        ) : item.type === 'effect' && item.effect ? (
                                                            <>
                                                                <EffectIcon color={item.effect.color} size={40} />
                                                                <span className="text-[10px] text-white/60 text-center truncate w-full px-1 mt-1">{item.effect.name}</span>
                                                                <span className="text-[8px] uppercase mt-0.5" style={{ color: getRarityColor(item.effect.rarity) }}>
                                                                    {item.effect.rarity}
                                                                </span>
                                                            </>
                                                        ) : item.type === 'background' && item.background ? (
                                                            <>
                                                                <div
                                                                    className="w-16 h-10 rounded overflow-hidden mb-1"
                                                                    style={{ backgroundColor: `${getRarityColor(item.background.rarity)}20` }}
                                                                >
                                                                    <img
                                                                        src={item.background.path}
                                                                        alt={item.background.name}
                                                                        className="w-full h-full object-cover"
                                                                        loading="lazy"
                                                                        decoding="async"
                                                                    />
                                                                </div>
                                                                <span className="text-[10px] text-white/60 text-center truncate w-full px-1">{item.background.name}</span>
                                                                <span className="text-[8px] uppercase mt-0.5" style={{ color: getRarityColor(item.background.rarity) }}>
                                                                    {item.background.rarity}
                                                                </span>
                                                            </>
                                                        ) : item.type === 'profile_effect' && item.profileEffect ? (
                                                            <>
                                                                <div
                                                                    className="w-10 h-10 rounded-full flex items-center justify-center mb-1"
                                                                    style={{ backgroundColor: `${item.profileEffect.color}20`, border: `2px solid ${item.profileEffect.color}` }}
                                                                >
                                                                    <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke={item.profileEffect.color} strokeWidth="2">
                                                                        <path d="M12 2l3.09 6.26L22 9.27l-5 4.87 1.18 6.88L12 17.77l-6.18 3.25L7 14.14 2 9.27l6.91-1.01L12 2z" />
                                                                    </svg>
                                                                </div>
                                                                <span className="text-[10px] text-white/60 text-center truncate w-full px-1">{item.profileEffect.name}</span>
                                                                <span className="text-[8px] uppercase mt-0.5" style={{ color: getRarityColor(item.profileEffect.rarity) }}>
                                                                    {item.profileEffect.rarity}
                                                                </span>
                                                            </>
                                                        ) : item.type === 'border' && item.border ? (
                                                            <>
                                                                <div
                                                                    className="w-10 h-10 rounded-full mb-1"
                                                                    style={{
                                                                        border: `${item.border.width}px ${item.border.style === 'gradient' ? 'solid' : item.border.style} ${item.border.color || '#22d3ee'}`,
                                                                        background: item.border.style === 'gradient' && item.border.colors ?
                                                                            `linear-gradient(45deg, ${item.border.colors.join(', ')})` : 'transparent'
                                                                    }}
                                                                />
                                                                <span className="text-[10px] text-white/60 text-center truncate w-full px-1">{item.border.name}</span>
                                                                <span className="text-[8px] uppercase mt-0.5" style={{ color: getRarityColor(item.border.rarity) }}>
                                                                    {item.border.rarity}
                                                                </span>
                                                            </>
                                                        ) : item.type === 'coins' ? (
                                                            <>
                                                                <CoinIcon size={40} />
                                                                <span className="text-[10px] text-yellow-400 font-bold mt-1">+{item.coins}</span>
                                                            </>
                                                        ) : (
                                                            <>
                                                                <span aria-hidden="true" className="grid h-10 w-10 place-items-center rounded-full border border-white/10 bg-white/5 text-lg text-white/50">—</span>
                                                                <span className="mt-1 text-center text-[10px] text-white/60">{item.type === 'nothing' ? 'No reward' : 'See result'}</span>
                                                            </>
                                                        )}
                                                    </div>
                                                ))}
                                            </motion.div>
                                        </div>
                                    </div>
                                </div>
                            )
                        }

                        {/* Phase: Reveal */}
                        {
                            phase === 'reveal' && (spinResult || profileSpinResult) && (
                                <div className="relative">
                                    {/* Rarity-colored header bar */}
                                    <div
                                        className="border-b border-white/[0.08] py-3 text-center text-xs font-medium text-white/55"
                                    >
                                        Reward received
                                    </div>

                                    {/* Item Showcase */}
                                    <div className="flex flex-col items-center px-5 py-7 sm:px-8">
                                        {/* Item Display */}
                                        <div className="relative mb-5 flex h-32 w-full items-center justify-center">
                                            <GachaReveal isVisible={true} rarity={
                                                activeRollType === 'cursor'
                                                    ? getItemRarity()
                                                    : (profileSpinResult?.backgroundInfo?.rarity || profileSpinResult?.effectInfo?.rarity || profileSpinResult?.borderInfo?.rarity || 'common')
                                            }>
                                                {activeRollType === 'cursor' ? (
                                                    // Cursor/Effect crate reveal
                                                    spinResult?.type === 'cursor' && spinResult.cursorInfo ? (
                                                        <div className="relative">
                                                            <div
                                                                className="absolute inset-0 blur-3xl opacity-40"
                                                                style={{ backgroundColor: spinResult.cursorInfo.color }}
                                                            />
                                                            <motion.div
                                                            initial={{ scaleY: 0.82, opacity: 0 }}
                                                            animate={{ scaleY: 1, opacity: 1 }}
                                                            transition={{ duration: 0.32, ease: 'easeOut' }}
                                                            className="relative h-24 w-3 rounded-full"
                                                                style={{
                                                                    backgroundColor: spinResult.cursorInfo.color === 'rainbow' ? '#ec4899' : spinResult.cursorInfo.color,
                                                                boxShadow: `0 0 18px ${spinResult.cursorInfo.glow}`,
                                                                }}
                                                            />
                                                        </div>
                                                    ) : spinResult?.type === 'effect' && spinResult.effectInfo ? (
                                                        <motion.div initial={{ scale: 0.85, opacity: 0 }} animate={{ scale: 1, opacity: 1 }} transition={{ duration: 0.3 }}>
                                                            <EffectIcon color={spinResult.effectInfo.color} size={80} />
                                                        </motion.div>
                                                    ) : spinResult?.type === 'nothing' ? (
                                                        <div className="flex flex-col items-center">
                                                            <div className="flex h-16 w-16 items-center justify-center rounded-full border border-white/15 bg-white/[0.03]">
                                                                <svg width="48" height="48" viewBox="0 0 24 24" fill="none" stroke="#ef4444" strokeWidth="2">
                                                                    <circle cx="12" cy="12" r="10" />
                                                                    <path d="M16 16s-1.5-2-4-2-4 2-4 2" />
                                                                    <line x1="9" y1="9" x2="9.01" y2="9" />
                                                                    <line x1="15" y1="9" x2="15.01" y2="9" />
                                                                </svg>
                                                            </div>
                                                        </div>
                                                    ) : (
                                                        <motion.div initial={{ scale: 0.85, opacity: 0 }} animate={{ scale: 1, opacity: 1 }} transition={{ duration: 0.3 }}>
                                                            <CoinIcon size={80} />
                                                        </motion.div>
                                                    )
                                                ) : (
                                                    // Profile crate reveal
                                                    profileSpinResult?.type === 'coins' ? (
                                                        <motion.div initial={{ scale: 0.9, opacity: 0 }} animate={{ scale: 1, opacity: 1 }} transition={{ duration: 0.3 }} className="flex flex-col items-center gap-2">
                                                            <CoinIcon size={80} />
                                                            <span className="font-mono text-lg font-bold text-amber-300">+{profileSpinResult.coinsWon ?? 10}</span>
                                                        </motion.div>
                                                    ) : profileSpinResult?.type === 'background' && profileSpinResult.backgroundInfo ? (
                                                        <motion.div initial={{ y: 8, opacity: 0 }} animate={{ y: 0, opacity: 1 }} transition={{ duration: 0.3 }} className="h-24 w-40 overflow-hidden rounded-lg border border-white/10">
                                                            <img
                                                                src={profileSpinResult.backgroundInfo.path}
                                                                alt={profileSpinResult.backgroundInfo.name}
                                                                className="w-full h-full object-cover"
                                                            />
                                                        </motion.div>
                                                    ) : profileSpinResult?.type === 'profile_effect' && profileSpinResult.effectInfo ? (
                                                        <motion.div
                                                            initial={{ scale: 0.85, opacity: 0 }}
                                                            animate={{ scale: 1, opacity: 1 }}
                                                            transition={{ duration: 0.3 }}
                                                            className="flex h-20 w-20 items-center justify-center rounded-full"
                                                            style={{
                                                                backgroundColor: `${profileSpinResult.effectInfo.color}30`,
                                                                border: `2px solid ${profileSpinResult.effectInfo.color}`
                                                            }}
                                                        >
                                                            <svg width="48" height="48" viewBox="0 0 24 24" fill="none" stroke={profileSpinResult.effectInfo.color} strokeWidth="2">
                                                                <path d="M12 2l3.09 6.26L22 9.27l-5 4.87 1.18 6.88L12 17.77l-6.18 3.25L7 14.14 2 9.27l6.91-1.01L12 2z" />
                                                            </svg>
                                                        </motion.div>
                                                    ) : profileSpinResult?.type === 'border' && profileSpinResult.borderInfo ? (
                                                        <motion.div
                                                            initial={{ scale: 0.85, opacity: 0 }}
                                                            animate={{ scale: 1, opacity: 1 }}
                                                            transition={{ duration: 0.3 }}
                                                            className="h-20 w-20 rounded-full"
                                                            style={{
                                                                border: `${profileSpinResult.borderInfo.width * 2}px ${profileSpinResult.borderInfo.style === 'gradient' ? 'solid' : profileSpinResult.borderInfo.style} ${profileSpinResult.borderInfo.color || '#22d3ee'}`,
                                                            }}
                                                        />
                                                    ) : profileSpinResult?.type === 'nothing' ? (
                                                        <div className="flex flex-col items-center">
                                                            <div className="flex h-16 w-16 items-center justify-center rounded-full border border-white/15 bg-white/[0.03]">
                                                                <svg width="48" height="48" viewBox="0 0 24 24" fill="none" stroke="#ef4444" strokeWidth="2">
                                                                    <circle cx="12" cy="12" r="10" />
                                                                    <path d="M16 16s-1.5-2-4-2-4 2-4 2" />
                                                                    <line x1="9" y1="9" x2="9.01" y2="9" />
                                                                    <line x1="15" y1="9" x2="15.01" y2="9" />
                                                                </svg>
                                                            </div>
                                                        </div>
                                                    ) : null
                                                )}
                                            </GachaReveal>
                                        </div>

                                        {/* Item Name and Rarity */}
                                        <div className="mb-4 text-center">
                                            <h3 className="mb-2 text-xl font-semibold text-white">
                                                {activeRollType === 'cursor' ? (
                                                    <>
                                                        {spinResult?.type === 'cursor' && spinResult.cursorInfo?.name}
                                                        {spinResult?.type === 'effect' && spinResult.effectInfo?.name}
                                                        {spinResult?.type === 'coins' && `${spinResult.coinsWon} Coins`}
                                                        {spinResult?.type === 'nothing' && 'Try Again!'}
                                                    </>
                                                ) : (
                                                    <>
                                                        {profileSpinResult?.type === 'background' && profileSpinResult.backgroundInfo?.name}
                                                        {profileSpinResult?.type === 'profile_effect' && profileSpinResult.effectInfo?.name}
                                                        {profileSpinResult?.type === 'border' && profileSpinResult.borderInfo?.name}
                                                        {profileSpinResult?.type === 'coins' && `+${profileSpinResult.coinsWon ?? 10} Coins`}
                                                        {profileSpinResult?.type === 'nothing' && 'Try Again!'}
                                                    </>
                                                )}
                                            </h3>
                                            <div className="inline-flex items-center justify-center rounded-full border border-white/10 bg-white/[0.04] px-3 py-1">
                                                <span
                                                    className="text-[10px] font-medium uppercase tracking-wider"
                                                    style={{
                                                        color: getRarityColor(
                                                            activeRollType === 'cursor'
                                                                ? getItemRarity()
                                                                : (profileSpinResult?.backgroundInfo?.rarity || profileSpinResult?.effectInfo?.rarity || profileSpinResult?.borderInfo?.rarity || 'common')
                                                        )
                                                    }}
                                                >
                                                    {activeRollType === 'cursor'
                                                        ? getItemRarity()
                                                        : (profileSpinResult?.backgroundInfo?.rarity || profileSpinResult?.effectInfo?.rarity || profileSpinResult?.borderInfo?.rarity || 'common')}
                                                </span>
                                            </div>
                                        </div>

                                        {/* Text and Button */}
                                        <div className="text-center">
                                            <p className="mb-5 max-w-sm text-sm text-white/55">
                                                {activeRollType === 'cursor'
                                                    ? spinResult?.type === 'nothing'
                                                        ? 'No reward this time. Your pity progress has been saved.'
                                                        : spinResult?.type === 'coins'
                                                            ? `+${spinResult.coinsWon ?? 0} coins added to your balance.`
                                                            : spinResult?.isNew
                                                                ? 'You unlocked a new item!'
                                                                : 'Already owned. Coins were refunded.'
                                                    : profileSpinResult?.type === 'nothing'
                                                        ? 'No reward this time. Your pity progress has been saved.'
                                                        : profileSpinResult?.type === 'coins'
                                                            ? `+${profileSpinResult.coinsWon ?? 0} coins added to your balance.`
                                                            : profileSpinResult?.isNew
                                                                ? 'You unlocked a new item!'
                                                                : 'Already owned. Coins were refunded.'}
                                            </p>

                                            {/* Auto Spin Progress Indicator */}
                                            {((activeRollType === 'cursor' && autoSpinCursor) || (activeRollType === 'profile' && autoSpinProfile)) && (
                                                <div className="mb-4">
                                                    <motion.div
                                                        className="h-1 bg-white/10 rounded-full overflow-hidden w-32 mx-auto"
                                                        initial={{ opacity: 0 }}
                                                        animate={{ opacity: 1 }}
                                                    >
                                                        <motion.div
                                                            className={`h-full ${activeRollType === 'cursor' ? 'bg-purple-500' : 'bg-cyan-500'}`}
                                                            initial={{ width: '0%' }}
                                                            animate={{ width: '100%' }}
                                                            transition={{ duration: 1.5, ease: 'linear' }}
                                                            onAnimationComplete={() => {
                                                                const cost = activeRollType === 'cursor'
                                                                    ? (leaderboardBonus?.gachaDiscountedCost ?? SPIN_COST)
                                                                    : (leaderboardBonus?.profileDiscountedCost ?? PROFILE_SPIN_COST)

                                                                // Seamless auto-spin: check coins and trigger next spin immediately
                                                                // without going back to 'crates' phase
                                                                if (coins >= cost) {
                                                                    if (activeRollType === 'cursor') {
                                                                        handleOpenCrate()
                                                                    } else {
                                                                        handleOpenProfileCrate()
                                                                    }
                                                                } else {
                                                                    // Not enough coins, disable auto spin and return to crates
                                                                    if (activeRollType === 'cursor') {
                                                                        setAutoSpinCursor(false)
                                                                    } else {
                                                                        setAutoSpinProfile(false)
                                                                    }
                                                                    setPhase('crates')
                                                                }
                                                            }}
                                                        />
                                                    </motion.div>
                                                    <span className="text-[10px] text-white/40 mt-2 inline-block">Auto spinning...</span>
                                                </div>
                                            )}

                                            <div className="flex items-center justify-center gap-3">
                                                <motion.button
                                                    whileHover={{ scale: 1.05 }}
                                                    whileTap={{ scale: 0.95 }}
                                                    onClick={() => {
                                                        setPhase('crates')
                                                        setActiveRollType('cursor')
                                                        // Disable auto spin on manual continue
                                                        if (activeRollType === 'cursor') setAutoSpinCursor(false)
                                                        else setAutoSpinProfile(false)
                                                    }}
                                                    className="px-8 py-3 rounded-lg bg-gradient-to-r from-emerald-500 to-green-500 text-white font-bold hover:from-emerald-400 hover:to-green-400 transition-all"
                                                >
                                                    Continue
                                                </motion.button>

                                                {/* Stop Auto Spin Button */}
                                                {((activeRollType === 'cursor' && autoSpinCursor) || (activeRollType === 'profile' && autoSpinProfile)) && (
                                                    <motion.button
                                                        initial={{ opacity: 0, scale: 0.8 }}
                                                        animate={{ opacity: 1, scale: 1 }}
                                                        whileHover={{ scale: 1.05 }}
                                                        whileTap={{ scale: 0.95 }}
                                                        onClick={() => {
                                                            if (activeRollType === 'cursor') setAutoSpinCursor(false)
                                                            else setAutoSpinProfile(false)
                                                        }}
                                                        className="px-6 py-3 rounded-lg bg-red-500/20 text-red-400 border border-red-500/50 font-bold hover:bg-red-500/30 transition-all"
                                                    >
                                                        Stop Auto
                                                    </motion.button>
                                                )}
                                            </div>
                                        </div>
                                    </div>
                                </div>
                            )
                        }
                    </motion.div >
                </motion.div >
            )
            }
        </AnimatePresence >
    )

    return createPortal(modal, document.body)
}
