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

import React, { RefObject, KeyboardEvent, ChangeEvent, useMemo, useEffect, useRef, useState, memo } from 'react'
import { motion } from 'framer-motion'
import { useGameStore } from '../stores/gameStore'
import { CursorInfo, EffectInfo, getCursorInfo, getEffectInfo } from '../types'
import CursorEffect from './CursorEffect'
import { getCursorStyle } from '../effects/cursors'

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

  // Styling logic
  let charStyle: React.CSSProperties = {}
  let className = "relative inline-block transition-colors duration-150 overflow-visible "

  const getTextStyle = (cursor: CursorInfo | null) => {
    if (!cursor) return {}
    if (cursor.color === 'rainbow') {
      return {
        color: '#f9a8d4',
        fontWeight: 700,
        textShadow: `0 0 8px ${cursor.glow}, 0 0 18px ${cursor.glow}`,
        animation: 'typelo-cursor-text-rainbow 1.8s linear infinite',
      }
    }
    const skin = getCursorStyle(cursor.id)
    return {
      color: 'transparent',
      backgroundImage: String(skin.background ?? `linear-gradient(90deg, ${cursor.color}, ${cursor.glow}, ${cursor.color})`),
      backgroundClip: 'text',
      WebkitBackgroundClip: 'text',
      WebkitTextFillColor: 'transparent',
      fontWeight: 700,
      textShadow: `0 0 8px ${cursor.glow}`,
      filter: `drop-shadow(0 0 1px ${cursor.glow})`,
    }
  }

  // Define Styles based on Priority User
  let activeStyle = null
  if (priorityUser === 'player' && status !== 'incorrect') {
    activeStyle = getTextStyle(playerConfig.cursor)
  } else if (priorityUser === 'opponent') {
    activeStyle = getTextStyle(opponentConfig.cursor)
  }

  if (status === 'correct' || (status !== 'incorrect' && priorityUser !== 'none')) {
    if (activeStyle) {
      charStyle = { ...activeStyle }

      // Removed opacity reduction for opponent to keep colors vivid
      /* if (priorityUser === 'opponent') {
        charStyle.opacity = 1.0 
      } */

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

      {/* Opponent Underline */}
      {isOpponentPast && (
        <span
          className="absolute bottom-0 left-0 right-0 h-0.5 bg-violet-500/60 rounded-full"
          style={{ transform: 'translateY(4px)' }}
        />
      )}

      {/* Player Cursor */}
      {isCurrentChar && playerConfig.cursor && (
        <motion.span
          layoutId="player-cursor"
          data-caret="player"
          className="absolute -left-[2px] -top-1 h-[calc(100%+8px)] rounded-full z-30"
          style={{
            ...getCursorStyle(playerConfig.cursor.id),
            width: Math.max(5, Number(getCursorStyle(playerConfig.cursor.id).width) || 0),
            border: '1px solid rgba(255,255,255,0.9)',
            boxShadow: `0 0 0 1px rgba(0,0,0,0.65), 0 0 12px ${playerConfig.cursor.glow}, 0 0 26px ${playerConfig.cursor.glow}`,
          }}
          animate={{
            opacity: [1, 0.6, 1],
          }}
          transition={{
            opacity: { duration: 0.8, repeat: Infinity, ease: 'easeInOut' },
          }}
        />
      )}

      {/* Opponent Cursor - has distinct outline to differentiate from player cursor */}
      {isOpponentHere && opponentConfig.cursor && (
        <motion.span
          data-caret="opponent"
          className="absolute -left-[3px] -top-1 h-[calc(100%+8px)] z-20 rounded-full"
          style={{
            ...getCursorStyle(opponentConfig.cursor.id),
            width: Math.max(7, Number(getCursorStyle(opponentConfig.cursor.id).width) || 0),
            border: '1px solid rgba(255,255,255,0.9)',
            boxShadow: `0 0 0 1px rgba(0,0,0,0.75), 0 0 14px ${opponentConfig.cursor.glow}, 0 0 28px ${opponentConfig.cursor.glow}`,
          }}
          initial={{ opacity: 0, scale: 0.8 }}
          animate={{
            opacity: 1,
            scale: 1,
          }}
          exit={{ opacity: 0, scale: 0.8 }}
          transition={{
            opacity: { duration: 0.1 },
            scale: { type: "spring", stiffness: 500, damping: 30 },
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
          data-caret="player"
          className="absolute right-0 -top-1 h-[calc(100%+8px)] rounded-full z-30"
          style={{
            ...getCursorStyle(playerConfig.cursor.id),
            width: Math.max(5, Number(getCursorStyle(playerConfig.cursor.id).width) || 0),
            border: '1px solid rgba(255,255,255,0.9)',
            boxShadow: `0 0 0 1px rgba(0,0,0,0.65), 0 0 12px ${playerConfig.cursor.glow}, 0 0 26px ${playerConfig.cursor.glow}`,
            transform: 'translateX(100%)',
          }}
          animate={{
            opacity: [1, 0.6, 1],
          }}
          transition={{
            opacity: { duration: 0.8, repeat: Infinity, ease: 'easeInOut' },
          }}
        />
      )}

      {wordIdx === opponentWordIndex && opponentCharIndex - words.slice(0, wordIdx).reduce((sum, w) => sum + w.length + 1, 0) >= word.length && (
        <motion.span
          data-caret="opponent"
          className="absolute right-0 -top-1 h-[calc(100%+8px)] z-20 rounded-full"
          style={{
            ...getCursorStyle(opponentConfig.cursor.id),
            width: Math.max(7, Number(getCursorStyle(opponentConfig.cursor.id).width) || 0),
            border: '1px solid rgba(255,255,255,0.9)',
            boxShadow: `0 0 0 1px rgba(0,0,0,0.75), 0 0 14px ${opponentConfig.cursor.glow}, 0 0 28px ${opponentConfig.cursor.glow}`,
            transform: 'translateX(100%)',
          }}
          initial={{ opacity: 0, scale: 0.8 }}
          animate={{
            opacity: 1,
            scale: 1,
          }}
          exit={{ opacity: 0, scale: 0.8 }}
          transition={{
            opacity: { duration: 0.1 },
            scale: { type: "spring", stiffness: 500, damping: 30 },
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

      <CursorEffect effectId={playerEffect} targetRef={containerRef} caret="player" progress={`${currentWordIndex}:${currentCharIndex}`} />
      <CursorEffect effectId={opponentEffect} targetRef={containerRef} caret="opponent" progress={opponentCharIndex} />
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

