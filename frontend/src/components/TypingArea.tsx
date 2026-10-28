/*   ______      __ ____  _______       _  ____  _   _ 
 *  |  ____|   / / __ \|__   __|/\   | |/ __ \| \ | |
 *  | |__   _ / / |  | |  | |  /  \  | | |  | |  \| |
 *  |  __| | v /| |  | |  | | / /\ \ | | |  | | . ` |
 *  | | ____ \ / | |__| |  | |/ ____ \| | | __ | | |\  |
 *  | ______ | \_ / \____ /   | _ / _ /    \_\_ |\____ /| _ | \_ |
 *                                                      
 */

/**
 * TypingArea Component - The core game component where users type words.
 * Handles user input, character validation, and visual feedback for typing progress.
 * Supports both desktop physical keyboards and mobile virtual keyboards.
 * 
 * --------------------------------------------------------------------------
 *                                  Functions
 * --------------------------------------------------------------------------
 * TypingArea: Main component.
 * checkMobile: Helper to detect mobile devices.
 * handleMobileInputChange: Processes input from mobile virtual keyboard.
 * handleContainerClick: Focuses input when area is clicked.
 * 
 * --------------------------------------------------------------------------
 *                            Variables and others
 * --------------------------------------------------------------------------
 * currentWordIndex: Pointer to current word.
 * currentCharIndex: Pointer to current character.
 * typedChars: Characters typed for current word.
 * status: Game status (waiting, playing, etc.).
 * isMobile: Boolean state for device type.
 * mobileInputValue: Controlled value for hidden mobile input.
 * wordPositions: Calculated positions for rendering.
 * 
 * --------------------------------------------------------------------------
 *                                   imports
 * --------------------------------------------------------------------------
 * react: React hooks.
 * framer-motion: Animations.
 * stores: Game store.
 */

import React, { RefObject, KeyboardEvent, ChangeEvent, useMemo, useEffect, useRef, useState, useCallback, memo } from 'react'
import { motion } from 'framer-motion'
import { useGameStore } from '../stores/gameStore'
import { CursorInfo, EffectInfo, getCursorInfo, getEffectInfo } from '../types'
import { getEffectVisual } from '../effects/visuals'

// --- Types ---
interface TypingAreaProps {
  words: string[]
  inputRef: RefObject<HTMLInputElement>
  onKeyDown: (e: KeyboardEvent) => void
  onMobileInput?: (value: string) => void
  opponentCharIndex: number
  opponentWordIndex: number
  playerCursor?: string
  opponentCursor?: string
  playerEffect?: string | null
  opponentEffect?: string | null
}

// One small burst per moving cursor every 100 ms keeps expensive cosmetic
// particles readable on mobile while the underlying carets still move on each
// accepted input update.
let lastPlayerBurstAt = 0
let lastOpponentBurstAt = 0

// Compact, effect-specific bursts. Fixed offsets avoid a different animation
// on every React render and keep multiplayer typing light on slower devices.
const CursorBurst = memo(({ type, color, onComplete }: { type: string, color: string, onComplete?: () => void }) => {
  const visual = useMemo(() => getEffectVisual(type, color), [type, color])

  useEffect(() => {
    const timer = window.setTimeout(() => onComplete?.(), 620)
    return () => window.clearTimeout(timer)
  }, [onComplete])

  const isRing = visual.family === 'ripple' || visual.family === 'halo' || visual.family === 'void'
  const isGlyph = visual.family === 'glyph' || visual.family === 'digital'
  const isPetal = visual.family === 'petal' || visual.family === 'flame' || visual.family === 'mist'
  const glyph = visual.glyph ?? (visual.family === 'digital' ? '▪' : visual.family === 'cosmic' ? '✦' : '·')
  const particles = [
    { x: -8, y: -8, delay: 0 },
    { x: 8, y: -4, delay: 0.035 },
    { x: 1, y: 7, delay: 0.07 },
  ]

  return (
    <span className="absolute inset-0 z-30 flex items-center justify-center overflow-visible pointer-events-none" aria-hidden="true">
      {particles.map((particle, index) => {
        const particleColor = visual.palette[index % visual.palette.length]
        return (
          <motion.span
            key={`${type}-${index}`}
            className={`absolute ${isRing ? 'rounded-full border' : isGlyph ? 'font-mono font-semibold' : 'rounded-full'} ${isPetal ? 'rounded-tl-full rounded-br-full' : ''}`}
            style={{
              width: isGlyph ? 'auto' : isRing ? 7 : 3,
              height: isGlyph ? 'auto' : isRing ? 7 : 3,
              color: particleColor,
              borderColor: isRing ? particleColor : undefined,
              backgroundColor: isRing || isGlyph ? 'transparent' : particleColor,
              boxShadow: `0 0 6px ${particleColor}80`,
              fontSize: 9,
              lineHeight: 1,
            }}
            initial={{ opacity: 0.9, x: 0, y: 0, scale: 0.65, rotate: 0 }}
            animate={{
              opacity: 0,
              x: particle.x,
              y: particle.y,
              scale: isRing ? 1.8 : 0.8,
              rotate: isPetal ? (index - 1) * 36 : 0,
            }}
            transition={{ duration: 0.48, delay: particle.delay, ease: [0.2, 0.7, 0.2, 1] }}
          >
            {isGlyph ? glyph : null}
          </motion.span>
        )
      })}
    </span>
  )
})


// --- Character Component (Memoized) ---
const MemoizedCharacter = memo(({
  char,
  charIdx,
  status, // 'correct' | 'incorrect' | 'pending'
  isCurrentChar,
  isOpponentPast,
  isOpponentHere,
  playerConfig,
  opponentConfig,
  priorityUser, // 'player' | 'opponent' | 'none'
}: {
  char: string
  charIdx: number
  status: string
  isCurrentChar: boolean
  isOpponentPast: boolean
  isOpponentHere: boolean
  playerConfig: { cursor: CursorInfo, effect: EffectInfo | null }
  opponentConfig: { cursor: CursorInfo, effect: EffectInfo | null }
  priorityUser: string
}) => {

  // State to track if burst should be shown (ephemeral)
  const [showPlayerBurst, setShowPlayerBurst] = useState(false)
  const [showOpponentBurst, setShowOpponentBurst] = useState(false)

  // Ref to prevent re-triggering burst if status doesn't change meaningfully
  const prevStatusRef = useRef(status)
  const prevOppPastRef = useRef(isOpponentPast)

  // Trigger Player Burst
  useEffect(() => {
    if (playerConfig.effect && status === 'correct' && prevStatusRef.current !== 'correct') {
      const now = performance.now()
      if (now - lastPlayerBurstAt >= 100) {
        lastPlayerBurstAt = now
        setShowPlayerBurst(true)
      }
    }
    prevStatusRef.current = status
  }, [status, playerConfig.effect])

  // Trigger Opponent Burst
  useEffect(() => {
    if (opponentConfig.effect && isOpponentPast && !prevOppPastRef.current) {
      const now = performance.now()
      if (now - lastOpponentBurstAt >= 100) {
        lastOpponentBurstAt = now
        setShowOpponentBurst(true)
      }
    }
    prevOppPastRef.current = isOpponentPast
  }, [isOpponentPast, opponentConfig.effect])

  // Handlers to cleanup bursts
  const handlePlayerBurstComplete = useCallback(() => setShowPlayerBurst(false), [])
  const handleOpponentBurstComplete = useCallback(() => setShowOpponentBurst(false), [])

  // Styling logic
  let charStyle: React.CSSProperties = {}
  let className = "relative inline-block transition-colors duration-150 overflow-visible "

  const getTextStyle = (cursor: CursorInfo | null, isRainbow: boolean) => {
    if (!cursor) return {}
    const color = isRainbow ? '#ec4899' : cursor.color
    return { color: color }
  }

  // Define Styles based on Priority User
  let activeStyle = null
  if (priorityUser === 'player' && status !== 'incorrect') {
    activeStyle = getTextStyle(playerConfig.cursor, playerConfig.cursor?.color === 'rainbow')
  } else if (priorityUser === 'opponent') {
    activeStyle = getTextStyle(opponentConfig.cursor, opponentConfig.cursor?.color === 'rainbow')
  }

  if (status === 'correct' || (status !== 'incorrect' && priorityUser !== 'none')) {
    if (activeStyle) {
      charStyle = { ...activeStyle }

      // Removed opacity reduction for opponent to keep colors vivid
      /* if (priorityUser === 'opponent') {
        charStyle.opacity = 1.0 
      } */

      if ((priorityUser === 'player' && playerConfig.cursor?.color === 'rainbow') ||
        (priorityUser === 'opponent' && opponentConfig.cursor?.color === 'rainbow')) {
        charStyle.animation = 'rainbow-text 2s linear infinite'
        charStyle.color = undefined
      }
    } else {
      // Default colors if no cursor
      if (priorityUser === 'player') className += "text-emerald-400 "
      else if (priorityUser === 'opponent') className += "text-white/50 " // Fallback
    }
  } else if (status === 'incorrect') {
    className += "text-white underline decoration-red-500/50 decoration-2 underline-offset-2 "
  } else {
    className += "text-white/50 "
  }

  return (
    <span className={className} style={charStyle}>
      {char}

      {/* Rainbow Animation Style */}
      {(playerConfig.cursor?.color === 'rainbow' || opponentConfig.cursor?.color === 'rainbow') && (
        <style>{`
            @keyframes rainbow-text {
                0% { color: #ec4899; }
                20% { color: #8b5cf6; }
                40% { color: #3b82f6; }
                60% { color: #10b981; }
                80% { color: #fbbf24; }
                100% { color: #ec4899; }
            }
        `}</style>
      )}

      {/* Opponent Underline */}
      {isOpponentPast && (
        <span
          className="absolute bottom-0 left-0 right-0 h-0.5 bg-violet-500/60 rounded-full"
          style={{ transform: 'translateY(4px)' }}
        />
      )}

      {/* Bursts */}
      {showOpponentBurst && opponentConfig.effect && (
        <CursorBurst
          type={opponentConfig.effect.id}
          color={opponentConfig.effect.color}
          onComplete={handleOpponentBurstComplete}
        />
      )}
      {showPlayerBurst && playerConfig.effect && (
        <CursorBurst
          type={playerConfig.effect.id}
          color={playerConfig.effect.color}
          onComplete={handlePlayerBurstComplete}
        />
      )}

      {/* Player Cursor */}
      {isCurrentChar && playerConfig.cursor && (
        <motion.span
          layoutId="player-cursor"
          className="absolute -left-[1px] top-0 w-[5px] h-full rounded-full z-10"
          style={{
            backgroundColor: playerConfig.cursor.color === 'rainbow' ? '#ec4899' : playerConfig.cursor.color,
            boxShadow: `0 0 16px ${playerConfig.cursor.glow}`, // Increased Glow
          }}
          animate={{
            opacity: [1, 0.6, 1],
            backgroundColor: playerConfig.cursor.color === 'rainbow' ? ["#ec4899", "#8b5cf6", "#3b82f6", "#10b981", "#fbbf24", "#f43f5e", "#ec4899"] : playerConfig.cursor.color
          }}
          transition={{
            opacity: { duration: 0.8, repeat: Infinity, ease: 'easeInOut' },
            backgroundColor: playerConfig.cursor.color === 'rainbow' ? { duration: 2, repeat: Infinity, ease: "linear" } : {}
          }}
        />
      )}

      {/* Opponent Cursor - has distinct outline to differentiate from player cursor */}
      {isOpponentHere && opponentConfig.cursor && (
        <motion.span
          className="absolute -left-[2px] top-0 w-[8px] h-full z-5 rounded-full"
          style={{
            backgroundColor: opponentConfig.cursor.color === 'rainbow' ? '#ec4899' : opponentConfig.cursor.color,
            boxShadow: `0 0 20px ${opponentConfig.cursor.glow}, inset 0 0 0 1px rgba(0,0,0,0.5)`, // Increased Glow
            border: '2px solid rgba(255,255,255,0.4)', // Thicker border
          }}
          initial={{ opacity: 0, scale: 0.8 }}
          animate={{
            opacity: 1,
            scale: 1,
            backgroundColor: opponentConfig.cursor.color === 'rainbow' ? ["#ec4899", "#8b5cf6", "#3b82f6", "#10b981", "#fbbf24", "#f43f5e", "#ec4899"] : opponentConfig.cursor.color
          }}
          exit={{ opacity: 0, scale: 0.8 }}
          transition={{
            opacity: { duration: 0.1 },
            scale: { type: "spring", stiffness: 500, damping: 30 },
            backgroundColor: opponentConfig.cursor.color === 'rainbow' ? { duration: 2, repeat: Infinity, ease: "linear" } : {}
          }}
        />
      )}
    </span>
  )
})

// --- Word Component (Memoized) ---
const MemoizedWord = memo(({
  word,
  wordIdx,
  currentWordIndex,
  currentCharIndex,
  typedChars, // Passed only if this is current word
  typedWords,
  opponentWordIndex,
  opponentCharIndex,
  words,
  playerConfig,
  opponentConfig,
  activeWordRef,
  dominantUser // 'player' | 'opponent' - The user who currently leads or won the catch-up
}: {
  word: string
  wordIdx: number
  currentWordIndex: number
  currentCharIndex: number
  typedChars: string
  typedWords: { [key: number]: string }
  opponentWordIndex: number
  opponentCharIndex: number
  words: string[]
  playerConfig: any
  opponentConfig: any
  activeWordRef: React.RefObject<HTMLSpanElement> | null
  dominantUser: 'player' | 'opponent'
}) => {

  const isCurrentWord = wordIdx === currentWordIndex
  const isPastWord = wordIdx < currentWordIndex
  // isFutureWord unused but implied

  // Calculate extra chars logic
  const extraChars = isCurrentWord && typedChars.length > word.length
    ? typedChars.slice(word.length)
    : ''

  return (
    <span
      ref={activeWordRef}
      className={`relative inline-block mr-3 sm:mr-4 mb-2 px-1 rounded transition-all duration-200 ${isCurrentWord ? 'bg-white/5 scale-105 shadow-[0_0_15px_rgba(255,255,255,0.05)]' : ''
        } ${isPastWord ? 'opacity-50 blur-[0.5px]' : 'opacity-80'
        }`}
    >
      {word.split('').map((char, charIdx) => {
        let charStatus = 'pending'
        if (isPastWord) {
          charStatus = 'correct'
          if (typedWords[wordIdx]) {
            const typedWord = typedWords[wordIdx] || ''
            if (charIdx < typedWord.length) {
              charStatus = typedWord[charIdx] === char ? 'correct' : 'incorrect'
            } else {
              charStatus = 'incorrect'
            }
          } else {
            charStatus = 'correct'
          }
        } else if (isCurrentWord) {
          if (charIdx < currentCharIndex) {
            const isCorrect = typedChars[charIdx] === char
            charStatus = isCorrect ? 'correct' : 'incorrect'
          }
        }

        // Compute word start offset for this word to convert global opponentCharIndex to word-local
        // Each word is followed by a space (length + 1) except the last one
        const wordStartOffset = words
          .slice(0, wordIdx)
          .reduce((acc, w) => acc + w.length + 1, 0)
        const opponentLocalCharIndex = opponentCharIndex - wordStartOffset

        const isOpponentHere = wordIdx === opponentWordIndex && charIdx === opponentLocalCharIndex
        const isOpponentPast = wordIdx < opponentWordIndex || (wordIdx === opponentWordIndex && charIdx < opponentLocalCharIndex)
        const isCurrentChar = isCurrentWord && charIdx === currentCharIndex

        // === PRIORITY COLORING LOGIC ===
        // Leader owns the shared territory color.
        // dominantUser is passed from parent (tracks global winner/catch-up state)

        let priorityUser = 'none'

        if (charStatus === 'correct') {
          // Always prioritize player color for correctly typed characters
          // This ensures player sees their own progress clearly even when overlapping
          priorityUser = 'player'
        } else if (isOpponentPast) {
          // Only opponent typed it (or player typed incorrectly)
          priorityUser = 'opponent'
        }

        return (
          <MemoizedCharacter
            key={charIdx}
            char={char}
            charIdx={charIdx}
            status={charStatus}
            isCurrentChar={isCurrentChar}
            isOpponentPast={isOpponentPast}
            isOpponentHere={isOpponentHere}
            playerConfig={playerConfig}
            opponentConfig={opponentConfig}
            priorityUser={priorityUser}
          />
        )
      })}

      {/* Extra Chars */}
      {extraChars && (
        <span className="text-red-400 bg-red-500/10 rounded px-0.5">
          {extraChars}
        </span>
      )}

      {/* End of word Carets */}
      {isCurrentWord && currentCharIndex >= word.length && (
        <motion.span
          layoutId="player-cursor"
          className="absolute right-0 top-0 w-[5px] h-full rounded-full"
          style={{
            backgroundColor: playerConfig.cursor.color === 'rainbow' ? '#ec4899' : playerConfig.cursor.color,
            boxShadow: `0 0 16px ${playerConfig.cursor.glow}`,
            transform: 'translateX(100%)',
          }}
          animate={{
            opacity: [1, 0.6, 1],
            backgroundColor: playerConfig.cursor.color === 'rainbow' ? ["#ec4899", "#8b5cf6", "#3b82f6", "#10b981", "#fbbf24", "#f43f5e", "#ec4899"] : playerConfig.cursor.color
          }}
          transition={{
            opacity: { duration: 0.8, repeat: Infinity, ease: 'easeInOut' },
            backgroundColor: playerConfig.cursor.color === 'rainbow' ? { duration: 2, repeat: Infinity, ease: "linear" } : {}
          }}
        />
      )}

      {wordIdx === opponentWordIndex && opponentCharIndex - words.slice(0, wordIdx).reduce((sum, w) => sum + w.length + 1, 0) >= word.length && (
        <motion.span
          className="absolute right-0 top-0 w-[8px] h-full rounded-full"
          style={{
            backgroundColor: opponentConfig.cursor.color === 'rainbow' ? '#ec4899' : opponentConfig.cursor.color,
            boxShadow: `0 0 20px ${opponentConfig.cursor.glow}, inset 0 0 0 1px rgba(0,0,0,0.5)`,
            border: '2px solid rgba(255,255,255,0.4)',
            transform: 'translateX(100%)',
          }}
          initial={{ opacity: 0, scale: 0.8 }}
          animate={{
            opacity: 1,
            scale: 1,
            backgroundColor: opponentConfig.cursor.color === 'rainbow' ? ["#ec4899", "#8b5cf6", "#3b82f6", "#10b981", "#fbbf24", "#f43f5e", "#ec4899"] : opponentConfig.cursor.color
          }}
          exit={{ opacity: 0, scale: 0.8 }}
          transition={{
            opacity: { duration: 0.1 },
            scale: { type: "spring", stiffness: 500, damping: 30 },
            backgroundColor: opponentConfig.cursor.color === 'rainbow' ? { duration: 2, repeat: Infinity, ease: "linear" } : {}
          }}
        />
      )}
    </span>
  )
})

export default function TypingArea({
  words,
  inputRef,
  onKeyDown,
  onMobileInput,
  opponentCharIndex,
  opponentWordIndex,
  playerCursor = 'default',
  opponentCursor = 'default',
  playerEffect = null,
  opponentEffect = null,
}: TypingAreaProps) {

  const playerConfig = useMemo(() => ({
    cursor: getCursorInfo(playerCursor),
    effect: getEffectInfo(playerEffect)
  }), [playerCursor, playerEffect])

  const opponentConfig = useMemo(() => ({
    cursor: getCursorInfo(opponentCursor),
    effect: getEffectInfo(opponentEffect)
  }), [opponentCursor, opponentEffect])

  // Derive opponent word index locally to ensure smooth per-character updates
  // Backend opponentWordIndex might only update on word completion
  const derivedOpponentWordIndex = useMemo(() => {
    // Safety check: if opponentCharIndex is invalid, render at start to avoid jumping to end
    if (typeof opponentCharIndex !== 'number' || opponentCharIndex < 0 || isNaN(opponentCharIndex)) {
      return 0
    }

    let chars = 0
    // Try to find which word the opponentCharIndex falls into
    for (let i = 0; i < words.length; i++) {
      // +1 for space, except maybe last word but logic holds
      const wordLen = words[i].length + 1
      if (opponentCharIndex < chars + wordLen) {
        return i
      }
      chars += wordLen
    }
    return words.length - 1
  }, [words, opponentCharIndex])

  const {
    currentWordIndex,
    currentCharIndex,
    typedChars,
    typedWords,
    status,
  } = useGameStore()

  // Calculate Global Character Index for Player
  // We need to know exactly how many chars the player has typed to compare with opponent
  const playerGlobalCharIndex = useMemo(() => {
    // Sum length of all completed words + spaces (1 per word)
    const completedLength = words.slice(0, currentWordIndex).reduce((acc, word) => acc + word.length + 1, 0)
    // Add current word progress
    return completedLength + currentCharIndex
  }, [words, currentWordIndex, currentCharIndex])

  // Determine Winning User (Dominant Color Logic)
  // - If Player > Opponent: Player dominates
  // - If Opponent > Player: Opponent dominates
  // - If Equal: The one who "caught up" (moved last to reach equality) dominates
  const [winningUser, setWinningUser] = useState<'player' | 'opponent'>('player')
  const prevPlayerIdx = useRef(playerGlobalCharIndex)
  const prevOppIdx = useRef(opponentCharIndex)

  useEffect(() => {
    const p = playerGlobalCharIndex
    const o = opponentCharIndex
    const pp = prevPlayerIdx.current
    const po = prevOppIdx.current

    if (p > o) {
      setWinningUser('player')
    } else if (o > p) {
      setWinningUser('opponent')
    } else {
      // Equality State (Catch-up moment)
      if (pp < po) {
        // Player was behind, now equal -> Player caught up
        setWinningUser('player')
      } else if (po < pp) {
        // Opponent was behind, now equal -> Opponent caught up
        setWinningUser('opponent')
      }
      // If previously equal, maintain current winner
    }

    prevPlayerIdx.current = p
    prevOppIdx.current = o
  }, [playerGlobalCharIndex, opponentCharIndex])

  // Ref for mobile input handling
  const mobileInputRef = useRef<HTMLInputElement>(null)
  const containerRef = useRef<HTMLDivElement>(null)
  const currentWordRef = useRef<HTMLSpanElement>(null)


  const [mobileInputValue, setMobileInputValue] = useState('')
  const [isMobile, setIsMobile] = useState(false)

  // Detect mobile
  useEffect(() => {
    const checkMobile = () => {
      const isTouch = 'ontouchstart' in window || navigator.maxTouchPoints > 0
      const isSmallScreen = window.innerWidth < 768
      setIsMobile(isTouch || isSmallScreen)
    }
    checkMobile()
    window.addEventListener('resize', checkMobile)
    return () => window.removeEventListener('resize', checkMobile)
  }, [])

  // Auto-focus logic
  useEffect(() => {
    const focusInput = () => {
      if (!isMobile && inputRef.current) {
        inputRef.current.focus()
      }
    }
    focusInput()
    const handleFocus = () => focusInput()
    window.addEventListener('focus', handleFocus)
    document.addEventListener('click', handleFocus)
    return () => {
      window.removeEventListener('focus', handleFocus)
      document.removeEventListener('click', handleFocus)
    }
  }, [isMobile, inputRef])

  // Auto-scroll logic - Always keep active word vertically centered
  useEffect(() => {
    if (currentWordRef.current && containerRef.current) {
      const wordTop = currentWordRef.current.offsetTop
      const wordHeight = currentWordRef.current.offsetHeight
      const containerHeight = containerRef.current.clientHeight

      const targetScroll = wordTop - containerHeight / 2 + wordHeight / 2

      containerRef.current.scrollTo({
        top: targetScroll,
        behavior: 'smooth'
      })
    }
  }, [currentWordIndex])


  const handleContainerClick = () => {
    if (isMobile && mobileInputRef.current) {
      mobileInputRef.current.focus()
    } else if (inputRef.current) {
      inputRef.current.focus()
    }
  }

  const handleMobileInputChange = (e: ChangeEvent<HTMLInputElement>) => {
    const val = e.target.value
    const prevVal = mobileInputValue

    if (val.length > prevVal.length) {
      // Characters were added - process each new character
      const newChars = val.slice(prevVal.length)
      for (const char of newChars) {
        onMobileInput?.(char)
      }
    } else if (val.length < prevVal.length) {
      // Characters were deleted (backspace) - call onMobileInput for each deletion
      const deletedCount = prevVal.length - val.length
      for (let i = 0; i < deletedCount; i++) {
        onMobileInput?.('\b')
      }
    }
    setMobileInputValue(val)
  }

  return (
    <div
      className="relative w-full max-w-5xl mx-auto min-h-[160px] perspective-[1000px] px-2 sm:px-0"
      onClick={handleContainerClick}
    >
      {/* Hidden Inputs */}
      <input
        ref={inputRef}
        type="text"
        className="opacity-0 absolute top-0 left-0 w-full h-full cursor-default -z-10"
        onKeyDown={onKeyDown}
        aria-hidden="true"
        autoComplete="off"
        autoCapitalize="off"
        autoCorrect="off"
        spellCheck="false"
      />
      {isMobile && (
        <input
          ref={mobileInputRef}
          type="text"
          value={mobileInputValue}
          onChange={handleMobileInputChange}
          className="opacity-0 absolute top-0 left-0 w-full h-full text-base"
          style={{ fontSize: '16px' }}
          autoComplete="off"
          autoCapitalize="off"
          autoCorrect="off"
          spellCheck="false"
        />
      )}

      {/* Main Text Container */}
      <div
        ref={containerRef}
        className="glass-panel p-2 sm:p-10 rounded-2xl w-full h-[280px] sm:h-[360px] overflow-y-auto text-xl sm:text-3xl font-mono leading-relaxed sm:leading-loose tracking-wide custom-scrollbar relative scroll-smooth text-center"
        style={{
          textShadow: '0 2px 10px rgba(0,0,0,0.3)',
          maskImage: 'linear-gradient(to bottom, transparent 0%, black 15%, black 85%, transparent 100%)',
          WebkitMaskImage: 'linear-gradient(to bottom, transparent 0%, black 15%, black 85%, transparent 100%)',
        }}
      >
        {words.map((word, idx) => (
          <MemoizedWord
            key={idx}
            word={word}
            wordIdx={idx}
            currentWordIndex={currentWordIndex}
            currentCharIndex={currentCharIndex}
            typedChars={typedChars}
            typedWords={typedWords}
            opponentWordIndex={derivedOpponentWordIndex} // Use derived index
            opponentCharIndex={opponentCharIndex}
            words={words}
            playerConfig={playerConfig}
            opponentConfig={opponentConfig}
            activeWordRef={idx === currentWordIndex ? currentWordRef : null}
            dominantUser={winningUser}
          />
        ))}
      </div>

      <div className="mt-6 flex flex-col sm:flex-row items-center justify-center gap-4 sm:gap-8">
        <p className="text-xs text-white/30">
          <span className="hidden sm:inline">Press space after each word</span>
          <span className="sm:hidden">Tap to type • Space after each word</span>
        </p>

        {opponentWordIndex > 0 && (
          <div className="flex items-center gap-2 text-xs text-white/30">
            <span className="w-3 h-0.5 rounded-full bg-violet-500/60" />
            <span>Opponent progress</span>
          </div>
        )}
      </div>
    </div>
  )
}

