/*   ______      __ ____  _______       _  ____  _   _ 
 *  |  ____|   / / __ \|__   __|/\   | |/ __ \| \ | |
 *  | |__   _ / / |  | |  | |  /  \  | | |  | |  \| |
 *  |  __| | v /| |  | |  | | / /\ \ | | |  | | . ` |
 *  | |____ \ / | |__| |  | |/ ____ \| | |__| | |\  |
 *  |______| \_/ \____/   |_/_/    \_\_|\____/|_| \_|
 *                                                      
 */

/**
 * Game Store - Manages real-time game state during gameplay.
 * 
 * --------------------------------------------------------------------------
 *                                  Functions
 * --------------------------------------------------------------------------
 * useGameStore: Zustand store hook.
 * reset: Resets game state to idle.
 * joinQueue: Updates state for queueing.
 * joinTrainingQueue: Updates state for training queue.
 * joinFriendsQueue: Updates state for friends queue.
 * leaveQueue: Resets state after leaving queue.
 * updateQueueElapsed: Updates queue wait time.
 * matchFound: Sets up game with match details.
 * startCountdown: (Deprecated/Legacy countdown handling).
 * startGame: Sets state to active playing (handling sync start).
 * updateTimeRemaining: Updates game timer.
 * typeChar: Handles local typing updates.
 * deleteChar: Handles character deletion.
 * completeWord: Handles word completion.
 * updateOpponentProgress: Updates opponent cursor.
 * endGame: Handles game conclusion.
 * updateWpm: Updates local WPM.
 * updateAccuracy: Updates local accuracy.
 * recordKeyStats: Tracks per-key statistics.
 * 
 * --------------------------------------------------------------------------
 *                            Variables and others
 * --------------------------------------------------------------------------
 * GameStore: Interface for store actions and state.
 * initialState: Default state values.
 * 
 * --------------------------------------------------------------------------
 *                                   imports
 * --------------------------------------------------------------------------
 * zustand: State management.
 * types: Shared type definitions.
 */

import { create } from 'zustand'
import type { GameState, MatchInfo, MatchResult } from '../types'

interface GameStore extends GameState {
  matchDuration: number
  // Actions
  reset: () => void
  joinQueue: () => void
  joinTrainingQueue: () => void
  joinFriendsQueue: () => void
  leaveQueue: () => void
  updateQueueElapsed: (elapsed: number) => void
  matchFound: (info: MatchInfo) => void
  startCountdown: () => void
  startGame: (duration: number, startTime: number) => void
  activateMatch: () => void
  updateTimeRemaining: (time: number) => void
  typeChar: (char: string, correct: boolean) => void
  deleteChar: () => void
  completeWord: () => void
  updateOpponentProgress: (charIndex: number, wordIndex: number) => void
  updateMatchReadyStatus: (youReady: boolean, opponentReady: boolean, expiresAt: number | null) => void
  cancelPendingMatch: (notice: string) => void
  clearMatchNotice: () => void
  endGame: (result: MatchResult) => void
  updateWpm: (wpm: number) => void
  updateAccuracy: (accuracy: number) => void
  recordKeyStats: (char: string, correct: boolean) => void // New
}

const initialState: GameState = {
  status: 'idle',
  gameMode: 'ranked',
  matchInfo: null,
  result: null,
  queueElapsed: 0,
  countdown: 3,
  timeRemaining: 30,
  words: [],
  currentWordIndex: 0,
  currentCharIndex: 0,
  typedChars: '',
  typedWords: [],
  errors: 0,
  wpm: 0,
  accuracy: 100,
  opponentCharIndex: 0,
  opponentWordIndex: 0,
  keyStats: {}, // New
  startTime: null,
  youReady: false,
  opponentReady: false,
  readyExpiresAt: null,
  matchNotice: null,
}

export const useGameStore = create<GameStore>((set) => ({
  ...initialState,
  matchDuration: 30,

  recordKeyStats: (char, correct) => set((state) => {
    const key = char.toLowerCase()
    const current = state.keyStats[key] || { total: 0, errors: 0 }
    return {
      keyStats: {
        ...state.keyStats,
        [key]: {
          total: current.total + 1,
          errors: correct ? current.errors : current.errors + 1
        }
      }
    }
  }),

  reset: () => set({ ...initialState, matchDuration: 30 }),

  joinQueue: () => set({
    status: 'queue',
    gameMode: 'ranked',
    queueElapsed: 0,
    matchInfo: null,
    result: null,
    matchNotice: null,
  }),

  joinTrainingQueue: () => set({
    status: 'queue',
    gameMode: 'training',
    queueElapsed: 0,
    matchInfo: null,
    result: null,
    matchNotice: null,
  }),

  joinFriendsQueue: () => set({
    status: 'queue',
    gameMode: 'friends',
    queueElapsed: 0,
    matchInfo: null,
    result: null,
    matchNotice: null,
  }),

  leaveQueue: () => set({
    status: 'idle',
    queueElapsed: 0
  }),

  updateQueueElapsed: (elapsed: number) => set({
    queueElapsed: elapsed
  }),

  matchFound: (info: MatchInfo) => set({
    status: 'waiting',  // Changed from 'countdown' to 'waiting'
    matchInfo: info,
    words: info.words,
    countdown: 0,  // No countdown needed
    currentWordIndex: 0,
    currentCharIndex: 0,
    typedChars: '',
    typedWords: [],
    errors: 0,
    wpm: 0,
    accuracy: 100,
    opponentCharIndex: 0,
    opponentWordIndex: 0,
    startTime: null,
    youReady: false,
    opponentReady: false,
    readyExpiresAt: null,
    matchNotice: null,
  }),

  startCountdown: () => set({ status: 'waiting' }),  // Changed to waiting

  startGame: (duration: number, startTime: number) => set((state) => {
    const resumingSameMatch = state.status === 'playing' && state.startTime === startTime
    return {
      status: resumingSameMatch ? 'playing' : 'waiting', // New starts run through the countdown; reconnects keep the live game visible.
      timeRemaining: resumingSameMatch ? state.timeRemaining : duration,
      matchDuration: duration,
      countdown: 0,
      startTime,
    }
  }),

  activateMatch: () => set((state) => state.status === 'waiting' ? { status: 'playing' } : state),

  updateTimeRemaining: (time: number) => set({
    timeRemaining: time
  }),

  typeChar: (char: string, correct: boolean) => set((state) => ({
    typedChars: state.typedChars + char,
    currentCharIndex: state.currentCharIndex + 1,
    errors: correct ? state.errors : state.errors + 1,
  })),

  deleteChar: () => set((state) => {
    if (state.typedChars.length === 0) return state
    return {
      typedChars: state.typedChars.slice(0, -1),
      currentCharIndex: Math.max(0, state.currentCharIndex - 1),
    }
  }),

  completeWord: () => set((state) => ({
    currentWordIndex: state.currentWordIndex + 1,
    currentCharIndex: 0,
    typedWords: [...state.typedWords, state.typedChars],
    typedChars: '',
  })),

  updateOpponentProgress: (charIndex: number, wordIndex: number) => set({
    opponentCharIndex: charIndex,
    opponentWordIndex: wordIndex,
  }),

  updateMatchReadyStatus: (youReady, opponentReady, expiresAt) => set({
    youReady,
    opponentReady,
    readyExpiresAt: expiresAt,
  }),

  cancelPendingMatch: (notice) => set({
    ...initialState,
    matchNotice: notice,
    matchDuration: 30,
  }),

  clearMatchNotice: () => set({ matchNotice: null }),

  endGame: (result: MatchResult) => set({
    status: 'finished',
    result,
  }),

  updateWpm: (wpm: number) => set({ wpm }),

  updateAccuracy: (accuracy: number) => set({ accuracy }),
}))
