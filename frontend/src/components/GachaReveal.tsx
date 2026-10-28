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
                        <motion.div
                            aria-hidden="true"
                            initial={{ scale: 0.72, opacity: 0.3 }}
                            animate={{ scale: 1.28, opacity: 0 }}
                            transition={{ duration: 0.48, ease: 'easeOut' }}
                            className="absolute h-20 w-20 rounded-full border"
                            style={{ borderColor: color }}
                        />
                    )}
                    <motion.div
                        initial={reduceMotion ? false : { y: 8, scale: 0.94, opacity: 0 }}
                        animate={{ y: 0, scale: 1, opacity: 1 }}
                        transition={{ duration: reduceMotion ? 0 : 0.28, ease: 'easeOut' }}
                        onAnimationComplete={onComplete}
                        className="relative z-10"
                    >
                        <div
                            aria-hidden="true"
                            className="absolute inset-0 -z-10 rounded-full opacity-15 blur-xl"
                            style={{ backgroundColor: color }}
                        />
                        {children}
                    </motion.div>
                </div>
            )}
        </AnimatePresence>
    )
}
