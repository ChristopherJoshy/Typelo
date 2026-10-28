/*   ______      __ ____  _______       _  ____  _   _ 
 *  |  ____|   / / __ \|__   __|/\   | |/ __ \| \ | |
 *  | |__   _ / / |  | |  | |  /  \  | | |  | |  \| |
 *  |  __| | v /| |  | |  | | / /\ \ | | |  | | . ` |
 *  | |____ \ / | |__| |  | |/ ____ \| | |__| | |\  |
 *  |______| \_/ \____/   |_/_/    \_\_|\____/|_| \_|
 *                                                      
 */

/**
 * useTyping Hook - Handles core typing logic, stats (WPM/Accuracy), and input management.
 * 
 * --------------------------------------------------------------------------
 *                                  Functions
 * --------------------------------------------------------------------------
 * useTyping: Main hook function.
 * handleKeyDown: Main input handler for desktop.
 * handleMobileInput: Input handler for mobile.
 * 
 * --------------------------------------------------------------------------
 *                            Variables and others
 * --------------------------------------------------------------------------
 * UseTypingOptions: Config interface.
 * state: Various state variables (chars, words, time).
 * 
 * --------------------------------------------------------------------------
 *                                   imports
 * --------------------------------------------------------------------------
 * react: React hooks.
 * stores/gameStore: Game state management.
 */

import { useCallback, useEffect, useRef } from 'react'
import { useGameStore } from '../stores/gameStore'

function getEffectiveTypedCharacters(words: string[], typedWords: string[], currentWordIndex: number, typedChars: string) {
  let correct = 0
  const enteredWords = [...typedWords]
  if (currentWordIndex < words.length) enteredWords[currentWordIndex] = typedChars

  for (let wordIndex = 0; wordIndex < enteredWords.length && wordIndex < words.length; wordIndex++) {
    const expected = words[wordIndex]
    const entered = enteredWords[wordIndex] || ''
    for (let charIndex = 0; charIndex < Math.min(expected.length, entered.length); charIndex++) {
      if (entered[charIndex] === expected[charIndex]) correct++
    }
  }

  return correct
}

interface UseTypingOptions {
  onKeystroke?: (char: string, charIndex: number, correct: boolean) => void
  onWordComplete?: (word: string, wordIndex: number) => void
  timeOffset?: number
}

export function useTyping(options: UseTypingOptions = {}) {
  const { onKeystroke, onWordComplete, timeOffset = 0 } = options

  const {
    status,
    words,
    currentWordIndex,
    currentCharIndex,
    typedChars,
    typeChar,
    deleteChar,
    completeWord,
    updateWpm,
    updateAccuracy,
    recordKeyStats,
    timeRemaining,
    startTime,
    matchDuration,
    keyStats,
  } = useGameStore()

  const inputRef = useRef<HTMLInputElement>(null)

  // Current word being typed
  const currentWord = words[currentWordIndex] || ''

  // Expected character
  const expectedChar = currentWord[currentCharIndex] || ''

  // Focus input when game starts or is waiting
  useEffect(() => {
    if (status === 'playing' || status === 'waiting') {
      inputRef.current?.focus()
    }
  }, [status, typeChar])

  // Calculate WPM periodically
  useEffect(() => {
    if (status !== 'playing' || !startTime) return

    const interval = setInterval(() => {
      const elapsed = Math.min(matchDuration, Math.max(0, (Date.now() + timeOffset - startTime) / 1000)) / 60
      if (elapsed > 0) {
        const game = useGameStore.getState()
        const effectiveChars = getEffectiveTypedCharacters(
          game.words,
          game.typedWords,
          game.currentWordIndex,
          game.typedChars,
        )
        const wpm = Math.round((effectiveChars / 5) / elapsed)
        updateWpm(wpm)
      }
    }, 500)

    return () => clearInterval(interval)
  }, [status, startTime, matchDuration, timeOffset, updateWpm])

  // Update accuracy
  useEffect(() => {
    if (status === 'playing') {
      const attempts = Object.values(keyStats).reduce((sum, key) => sum + key.total, 0)
      const errors = Object.values(keyStats).reduce((sum, key) => sum + key.errors, 0)
      if (attempts > 0) {
        const accuracy = Math.round(((attempts - errors) / attempts) * 100)
        updateAccuracy(accuracy)
      } else {
        updateAccuracy(100) // Reset to 100% when no chars typed
      }
    }
  }, [status, keyStats, updateAccuracy])

  const handleKeyDown = useCallback((e: React.KeyboardEvent) => {
    if (status !== 'playing' && status !== 'waiting') return
    if (status === 'playing' && currentWordIndex >= words.length) return
    // Strict Timer Check: Block input if time is up, even if status hasn't transitioned yet
    if (status === 'playing' && (timeRemaining <= 0 || (startTime !== null && Date.now() + timeOffset >= startTime + matchDuration * 1000))) return

    // Prevent default for most keys (except Tab for accessibility)
    if (e.key !== 'Tab') {
      e.preventDefault()
    }

    // Ignore modifier keys and function keys
    if (e.ctrlKey || e.altKey || e.metaKey) {
      return
    }

    // Handle backspace - allow deleting characters
    if (e.key === 'Backspace') {
      if (status === 'playing' && currentCharIndex > 0) {
        // Calculate the new char index after deletion
        const newCharIndex = currentCharIndex - 1
        const globalCharIndex = words
          .slice(0, currentWordIndex)
          .reduce((acc, w) => acc + w.length + 1, 0) + newCharIndex

        deleteChar()

        // Notify backend of position change (send current position after backspace)
        onKeystroke?.('\b', globalCharIndex, true)
      }
      return
    }

    // Ignore other special keys (arrows, function keys, etc.)
    if (e.key.length > 1 && e.key !== ' ') {
      return
    }

    const char = e.key
    const isSpace = char === ' '

    if (status === 'waiting') {
      return
    }

    // Handle space - move to next word
    if (isSpace) {
      // Only move to next word if we've typed at least some characters
      if (typedChars.length > 0) {
        onWordComplete?.(typedChars, currentWordIndex)
        completeWord()
      }
      return
    }

    // Regular character input - allow typing even past word length (will show as error)
    const isCorrect = currentCharIndex < currentWord.length && char === expectedChar

    // Calculate global char index (across all words)
    const globalCharIndex = words
      .slice(0, currentWordIndex)
      .reduce((acc, w) => acc + w.length + 1, 0) + currentCharIndex

    typeChar(char, isCorrect)
    recordKeyStats(char, isCorrect)
    onKeystroke?.(char, globalCharIndex, isCorrect)
  }, [
    status,
    currentWord,
    currentWordIndex,
    currentCharIndex,
    typedChars,
    expectedChar,
    timeRemaining,
    startTime,
    matchDuration,
    timeOffset,
    words,
    typeChar,
    deleteChar,
    completeWord,
    onKeystroke,
    onWordComplete,
  ])

  // Handle mobile input (character by character from onChange)
  const handleMobileInput = useCallback((char: string) => {
    if (status !== 'playing' && status !== 'waiting') return
    if (status === 'playing' && currentWordIndex >= words.length) return
    // Strict Timer Check
    if (status === 'playing' && (timeRemaining <= 0 || (startTime !== null && Date.now() + timeOffset >= startTime + matchDuration * 1000))) return

    // Handle backspace
    if (char === '\b') {
      if (status === 'playing' && currentCharIndex > 0) {
        const newCharIndex = currentCharIndex - 1
        const globalCharIndex = words
          .slice(0, currentWordIndex)
          .reduce((acc, w) => acc + w.length + 1, 0) + newCharIndex

        deleteChar()
        onKeystroke?.('\b', globalCharIndex, true)
      }
      return
    }

    const isSpace = char === ' '

    if (status === 'waiting') {
      return
    }

    // Handle space - move to next word
    if (isSpace) {
      if (typedChars.length > 0) {
        onWordComplete?.(typedChars, currentWordIndex)
        completeWord()
      }
      return
    }

    // Regular character input
    const isCorrect = currentCharIndex < currentWord.length && char === expectedChar

    const globalCharIndex = words
      .slice(0, currentWordIndex)
      .reduce((acc, w) => acc + w.length + 1, 0) + currentCharIndex

    typeChar(char, isCorrect)
    recordKeyStats(char, isCorrect)
    onKeystroke?.(char, globalCharIndex, isCorrect)
  }, [
    status,
    currentWord,
    currentWordIndex,
    currentCharIndex,
    typedChars,
    expectedChar,
    words,
    typeChar,
    deleteChar,
    completeWord,
    recordKeyStats,
    onKeystroke,
    onWordComplete,
    timeRemaining,
    startTime,
    matchDuration,
    timeOffset,
  ])

  return {
    inputRef,
    handleKeyDown,
    handleMobileInput,
    currentWord,
    expectedChar,
  }
}
