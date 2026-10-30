import { AnimatePresence, motion, useReducedMotion } from 'framer-motion'
import { getRarityColor } from '../types'

interface GachaRevealProps {
    isVisible: boolean
    rarity: string
    children: React.ReactNode
    onComplete?: () => void
}

export default function GachaReveal({ isVisible, rarity, children, onComplete }: GachaRevealProps) {
    const reduceMotion = useReducedMotion()
    const color = getRarityColor(rarity as Parameters<typeof getRarityColor>[0])

    return (
        <AnimatePresence>
            {isVisible && (
                <div className="pointer-events-none absolute inset-0 flex items-center justify-center overflow-hidden">
                    {!reduceMotion && (
                        <>
                            <motion.div
                                aria-hidden="true"
                                initial={{ scale: 0.2, opacity: 0.8 }}
                                animate={{ scale: 2.2, opacity: 0 }}
                                transition={{ duration: 0.62, ease: 'easeOut' }}
                                className="absolute h-24 w-24 rounded-full blur-xl"
                                style={{ background: `radial-gradient(circle, ${color}b8 0%, ${color}55 38%, transparent 72%)` }}
                            />
                            <motion.div
                                aria-hidden="true"
                                initial={{ scale: 0.65, opacity: 0.9 }}
                                animate={{ scale: 2.05, opacity: 0 }}
                                transition={{ duration: 0.54, ease: 'easeOut' }}
                                className="absolute h-16 w-16 rounded-full border-2"
                                style={{ borderColor: color, boxShadow: `0 0 22px ${color}88` }}
                            />
                            <motion.div
                                aria-hidden="true"
                                initial={{ scale: 0.55, opacity: 0.65 }}
                                animate={{ scale: 2.55, opacity: 0 }}
                                transition={{ duration: 0.68, delay: 0.08, ease: 'easeOut' }}
                                className="absolute h-16 w-16 rounded-full border"
                                style={{ borderColor: color }}
                            />
                        </>
                    )}
                    <motion.div
                        initial={reduceMotion ? false : { y: 14, scale: 0.78, opacity: 0 }}
                        animate={{ y: 0, scale: 1, opacity: 1 }}
                        transition={reduceMotion ? { duration: 0 } : { type: 'spring', stiffness: 340, damping: 20 }}
                        onAnimationComplete={onComplete}
                        className="relative z-10"
                    >
                        <div
                            aria-hidden="true"
                            className="absolute inset-0 -z-10 rounded-full opacity-25 blur-2xl"
                            style={{ backgroundColor: color }}
                        />
                        {children}
                    </motion.div>
                </div>
            )}
        </AnimatePresence>
    )
}
