/*   ______      __ ____  _______       _  ____  _   _ 
 *  |  ____|   / / __ \|__   __|/\   | |/ __ \| \ | |
 *  | |__   _ / / |  | |  | |  /  \  | | |  | |  \| |
 *  |  __| | v /| |  | |  | | / /\ \ | | |  | | . ` |
 *  | |____ \ / | |__| |  | |/ ____ \| | |__| | |\  |
 *  |______| \_/ \____/   |_/_/    \_\_|\____/|_| \_|
 *                                                      
 */

/**
 * WebSocket Context - Global WebSocket connection manager.
 * 
 * --------------------------------------------------------------------------
 *                                  Functions
 * --------------------------------------------------------------------------
 * WebSocketProvider: Provider component managing the socket lifecycle.
 * useWebSocket: Hook to access the context.
 * connect: Establishes connection.
 * disconnect: Closes connection.
 * joinQueue: Joins rank queue trying to match other players.
 * joinTrainingQueue: Joins training queue.
 * joinFriendsQueue: Joins friends queue.
 * leaveQueue: Leaves any queue.
 * sendKeystroke: Sends typing events.
 * sendWordComplete: Sends word completion events.
 * handleMessage: Processes incoming server messages.
 * 
 * --------------------------------------------------------------------------
 *                            Variables and others
 * --------------------------------------------------------------------------
 * WebSocketContext: React Context.
 * 
 * --------------------------------------------------------------------------
 *                                   imports
 * --------------------------------------------------------------------------
 * react: React core/hooks.
 * stores: Zustand stores.
 * config: API config.
 * types: Shared types.
 */

import React, { createContext, useContext, useEffect, useRef, useCallback, useState } from 'react'
import { useAuthStore } from '../stores/authStore'
import { useGameStore } from '../stores/gameStore'
import { useOnlineStore } from '../stores/onlineStore'
import { useMatchFeedStore } from '../stores/matchFeedStore'
import { API_ENDPOINTS } from '../config/api'
import { MATCH_TIMEOUT_MS, WS_RECONNECT_BASE_DELAY_MS, WS_RECONNECT_MAX_DELAY_MS, DEFAULT_ELO } from '../constants'
import type { ServerMessageType, MatchInfo, MatchResult, Rank } from '../types'

interface WebSocketContextType {
  connect: () => void
  disconnect: () => void
  joinQueue: () => void
  joinTrainingQueue: () => void
  joinFriendsQueue: () => void
  leaveQueue: () => void
  sendKeystroke: (char: string, charIndex: number) => void
  sendWordComplete: (word: string, wordIndex: number) => void
  isConnected: boolean
  ping: number // RTT in milliseconds
  timeOffset: number // client time + offset = server time
}

type GameEventPayload = {
  type: 'KEYSTROKE' | 'WORD_COMPLETE'
  [key: string]: unknown
}
type QueuedGameEvent = GameEventPayload & { event_id: number }

const WebSocketContext = createContext<WebSocketContextType | null>(null)

export function WebSocketProvider({ children }: { children: React.ReactNode }) {
  const wsRef = useRef<WebSocket | null>(null)
  const reconnectTimeoutRef = useRef<number | null>(null)
  const connectionStableTimeoutRef = useRef<number | null>(null)
  const heartbeatIntervalRef = useRef<number | null>(null)
  const shouldReconnectRef = useRef<boolean>(false)
  // Guard to prevent multiple simultaneous connection attempts
  const isConnectingRef = useRef<boolean>(false)
  // Exponential backoff for reconnection
  const reconnectAttemptRef = useRef<number>(0)
  const baseReconnectDelay = WS_RECONNECT_BASE_DELAY_MS
  const maxReconnectDelay = WS_RECONNECT_MAX_DELAY_MS
  const [isConnected, setIsConnected] = useState(false)
  const [ping, setPing] = useState<number>(0) // Current ping in ms
  const pingTimestampRef = useRef<number>(0) // When we sent the last ping
  const bestPingRef = useRef<number>(Infinity)
  const [timeOffset, setTimeOffset] = useState<number>(0) // Difference between server and client clock
  const pendingGameEventsRef = useRef<QueuedGameEvent[]>([])
  const gameEventFlushTimeoutRef = useRef<number | null>(null)
  const flushPendingGameEventsRef = useRef<(socket: WebSocket) => void>(() => {})

  const { user, stats, idToken, refreshToken } = useAuthStore()
  const gameEventOwnerRef = useRef<string | null>(user?.uid ?? null)
  const nextGameEventIdRef = useRef(1)
  const lastSentGameEventIdRef = useRef(0)
  const lastOpponentProgressRef = useRef<{ matchId: string | null; sequence: number }>({
    matchId: null,
    sequence: -1,
  })
  const {
    matchFound,
    startGame,
    updateQueueElapsed,
    updateOpponentProgress,
    endGame,
  } = useGameStore()
  const { setCount, setUsers } = useOnlineStore()

  // Use refs for values that change but shouldn't trigger reconnection
  const userRef = useRef(user)
  const statsRef = useRef(stats)
  const idTokenRef = useRef(idToken)

  // Keep refs in sync
  useEffect(() => { userRef.current = user }, [user])
  useEffect(() => { statsRef.current = stats }, [stats])
  useEffect(() => { idTokenRef.current = idToken }, [idToken])

  const handleMessage = useCallback((message: ServerMessageType & Record<string, unknown>) => {
    switch (message.type) {

      case 'QUEUE_UPDATE':
        // Server's elapsed time is authoritative - trust it over local optimistic increments
        updateQueueElapsed(message.elapsed)
        break

      case 'MATCH_FOUND':
        // Backend sends snake_case, we need to map to camelCase
        const rawMatch = message as any
        const matchInfo: MatchInfo = {
          matchId: rawMatch.match_id || rawMatch.matchId,
          opponentDisplayName: rawMatch.opponent_display_name || rawMatch.opponentDisplayName,
          opponentPhotoURL: rawMatch.opponent_photo_url || rawMatch.opponentPhotoUrl,
          opponentRank: (rawMatch.opponent_rank || rawMatch.opponentRank) as Rank,
          opponentElo: rawMatch.opponent_elo || rawMatch.opponentElo || 1000,
          opponentIsBot: rawMatch.opponent_is_bot ?? rawMatch.opponentIsBot,
          words: rawMatch.words,
          gameMode: rawMatch.game_mode || rawMatch.gameMode || 'ranked',
          opponentCursor: rawMatch.opponent_cursor || rawMatch.opponentCursor || 'default',
          opponentEffect: rawMatch.opponent_effect || rawMatch.opponentEffect || null,
        }
        matchFound(matchInfo)
        lastOpponentProgressRef.current = { matchId: matchInfo.matchId, sequence: -1 }

        // Play match-found sound
        // Play match-found sound
        try {
          const audio = new Audio('/sounds/match-found.mp3')
          audio.volume = 0.5
          audio.play().catch(() => { })
        } catch (e) { }


        // Safeguard: If GAME_START is not received within timeout, 
        // the backend should have sent GAME_END with forfeit result.
        // If neither happens, reset to idle to prevent frozen UI.
        setTimeout(() => {
          const currentGame = useGameStore.getState()
          if (currentGame.status === 'waiting' && currentGame.matchInfo?.matchId === matchInfo.matchId && !currentGame.startTime) {
            console.warn('Waiting timeout: game never started, resetting to idle')
            useGameStore.getState().reset()
          }
        }, MATCH_TIMEOUT_MS)
        break

      case 'GAME_START':
        // Synchronized Start: Backend provides valid start timestamp
        // We set the state immediately, but input is blocked until startTime is reached
        // The Game component will handle the visual countdown based on (timestamp - now)
        startGame(message.duration, message.timestamp)
        break

      case 'OPPONENT_PROGRESS':
        // Backend sends snake_case, we need to map to camelCase
        const rawProgress = message as any
        // Progress can be queued while a socket is draining. Ignore updates
        // left over from a previous match after the player has re-queued.
        const progressMatchId = rawProgress.match_id ?? rawProgress.matchId
        const currentMatchId = useGameStore.getState().matchInfo?.matchId
        if (progressMatchId && progressMatchId !== currentMatchId) break

        const progressSequence = rawProgress.sequence
        if (Number.isInteger(progressSequence) && progressSequence >= 0) {
          if (lastOpponentProgressRef.current.matchId !== currentMatchId) {
            lastOpponentProgressRef.current = { matchId: currentMatchId ?? null, sequence: -1 }
          }
          if (progressSequence <= lastOpponentProgressRef.current.sequence) break
          lastOpponentProgressRef.current.sequence = progressSequence
        }

        const rawCharIndex = rawProgress.char_index ?? rawProgress.charIndex ?? 0
        if (!Number.isInteger(rawCharIndex) || rawCharIndex < 0) break

        // Improve Word Index Handling:
        // If word_index is missing/undefined, default to current store state instead of 0
        // This prevents resetting to the first word if the backend sends partial updates
        let rawWordIndex = rawProgress.word_index ?? rawProgress.wordIndex
        if (rawWordIndex === undefined || rawWordIndex === null) {
          rawWordIndex = useGameStore.getState().opponentWordIndex
        }
        if (!Number.isInteger(rawWordIndex) || rawWordIndex < 0) break

        updateOpponentProgress(
          rawCharIndex,
          rawWordIndex
        )
        break

      case 'GAME_END':
        pendingGameEventsRef.current = []
        nextGameEventIdRef.current = 1
        lastSentGameEventIdRef.current = 0
        if (gameEventFlushTimeoutRef.current !== null) {
          clearTimeout(gameEventFlushTimeoutRef.current)
          gameEventFlushTimeoutRef.current = null
        }
        // Backend sends snake_case, we need to map to camelCase
        const rawResult = message.result as any
        console.log('[DEBUG] Game End rawResult:', rawResult); // Debug log

        // Recovery: If matchInfo is missing (e.g., safety timeout reset it), reconstruct it
        if (!useGameStore.getState().matchInfo) {
          console.warn('[WebSocket] matchInfo missing on GAME_END, reconstructing from result');
          const recoveredMatchInfo: MatchInfo = {
            matchId: rawResult.match_id,
            opponentDisplayName: rawResult.opponent_display_name,
            opponentPhotoURL: rawResult.opponent_photo_url,
            opponentRank: rawResult.opponent_rank as Rank,
            opponentElo: rawResult.opponent_elo,
            opponentIsBot: rawResult.opponent_is_bot,
            words: [], // Not needed for Result screen
            gameMode: rawResult.game_mode || 'ranked',
            opponentCursor: rawResult.opponent_cursor || 'default',
            opponentEffect: rawResult.opponent_effect || null,
          }
          useGameStore.setState({ matchInfo: recoveredMatchInfo })
        }

        const result: MatchResult = {
          matchId: rawResult.match_id,
          duration: rawResult.duration,
          gameMode: rawResult.game_mode || 'ranked',
          yourWpm: rawResult.your_wpm,
          yourAccuracy: rawResult.your_accuracy,
          yourScore: rawResult.your_score,
          yourEloBefore: rawResult.your_elo_before,
          yourEloAfter: rawResult.your_elo_after,
          yourEloChange: rawResult.your_elo_change,
          opponentDisplayName: rawResult.opponent_display_name,
          opponentPhotoURL: rawResult.opponent_photo_url,
          opponentIsBot: rawResult.opponent_is_bot,
          opponentWpm: rawResult.opponent_wpm,
          opponentAccuracy: rawResult.opponent_accuracy,
          opponentScore: rawResult.opponent_score,
          opponentRank: rawResult.opponent_rank as Rank,
          opponentElo: rawResult.opponent_elo,
          opponentEloChange: rawResult.opponent_elo_change,
          opponentCursor: rawResult.opponent_cursor || 'default',
          opponentEffect: rawResult.opponent_effect || null,
          result: rawResult.result,
          coinsEarned: rawResult.coins_earned || 0,
          baseCoins: rawResult.base_coins || 0,
          rankBonusCoins: rawResult.rank_bonus_coins || 0,
          leaderboardBonusCoins: rawResult.leaderboard_bonus_coins || 0,
        }

        // Update auth store with new Elo immediately
        const { updateStats, refreshStats } = useAuthStore.getState()
        updateStats({ currentElo: result.yourEloAfter })

        // End game in game store
        endGame(result)

        // Refresh full stats from backend after a short delay
        setTimeout(() => {
          refreshStats()
        }, 1000)
        break

      case 'GAME_INPUT_ACK': {
        const ack = message as any
        const eventId = ack.event_id
        if (!Number.isInteger(eventId) || eventId < 0) break
        pendingGameEventsRef.current = pendingGameEventsRef.current.filter(event => event.event_id > eventId)
        if (ack.retry === true) {
          lastSentGameEventIdRef.current = eventId
          const socket = wsRef.current
          if (socket?.readyState === WebSocket.OPEN && gameEventFlushTimeoutRef.current === null) {
            gameEventFlushTimeoutRef.current = window.setTimeout(() => {
              gameEventFlushTimeoutRef.current = null
              flushPendingGameEventsRef.current(socket)
            }, 250)
          }
        }
        break
      }


      case 'ONLINE_COUNT':
        setCount(message.count)
        break

      case 'ONLINE_USERS':
        if (Array.isArray(message.users)) {
          setUsers(message.users.map((u) => ({
            userId: u.user_id,
            displayName: u.display_name,
            photoUrl: u.photo_url,
            elo: u.elo,
          })))
        }
        break

      case 'PUBLIC_MATCH_STARTED': {
        const raw = message as any
        useMatchFeedStore.getState().addMatch({
          matchId: raw.match_id,
          player1Name: raw.player1_name,
          player1Photo: raw.player1_photo,
          player2Name: raw.player2_name,
          player2Photo: raw.player2_photo,
          isBotMatch: raw.is_bot_match,
          gameMode: raw.game_mode,
          timestamp: Date.now()
        })
        break
      }

      case 'PUBLIC_MATCH_ENDED': {
        const raw = message as any
        useMatchFeedStore.getState().endMatch({
          matchId: raw.match_id,
          winnerName: raw.winner_name,
          winnerPhoto: raw.winner_photo,
          loserName: raw.loser_name,
          loserPhoto: raw.loser_photo,
          winnerWpm: raw.winner_wpm,
          loserWpm: raw.loser_wpm,
          isTie: raw.is_tie,
          gameMode: raw.game_mode,
          timestamp: Date.now()
        })
        break
      }

      case 'ERROR':
        console.error('Server error:', message.code, message.message)
        break

      case 'PONG':
        // Calculate RTT from when we sent the ping
        const pong = message as any
        const sentAt = typeof pong.timestamp === 'number' ? pong.timestamp : pingTimestampRef.current
        if (sentAt > 0) {
          const now = Date.now()
          const rtt = now - sentAt
          setPing(rtt)

          // Estimate clock offset from the midpoint of the request round trip.
          // The server timestamp is captured when it handles the PING.
          const serverTime = pong.server_time
          if (serverTime && rtt >= 0 && rtt <= bestPingRef.current + 50) {
            bestPingRef.current = Math.min(bestPingRef.current, rtt)
            const clientMidpoint = sentAt + rtt / 2
            const offset = serverTime - clientMidpoint
            setTimeOffset(offset)
          }
        }
        break
    }
  }, [matchFound, startGame, updateQueueElapsed, updateOpponentProgress, endGame, setCount, setUsers])

  // Use ref for handleMessage to avoid reconnection on callback change
  const handleMessageRef = useRef(handleMessage)
  useEffect(() => { handleMessageRef.current = handleMessage }, [handleMessage])

  // Drain buffered typing after a brief connection drop. Keep a burst below
  // the server's per-second message limit and leave room for live input.
  const flushPendingGameEvents = useCallback((socket: WebSocket) => {
    if (gameEventFlushTimeoutRef.current !== null) {
      clearTimeout(gameEventFlushTimeoutRef.current)
      gameEventFlushTimeoutRef.current = null
    }
    if (socket.readyState !== WebSocket.OPEN) return

    if (socket.bufferedAmount > 64 * 1024) {
      gameEventFlushTimeoutRef.current = window.setTimeout(() => flushPendingGameEventsRef.current(socket), 100)
      return
    }

    const unsent = pendingGameEventsRef.current.filter(event => event.event_id > lastSentGameEventIdRef.current)
    const batch = unsent.slice(0, 30)
    for (const event of batch) {
      socket.send(JSON.stringify(event))
      lastSentGameEventIdRef.current = event.event_id
    }

    if (unsent.length > batch.length) {
      gameEventFlushTimeoutRef.current = window.setTimeout(() => flushPendingGameEventsRef.current(socket), 1000)
    }
  }, [])
  flushPendingGameEventsRef.current = flushPendingGameEvents

  const connect = useCallback(async () => {
    const currentUser = userRef.current
    const currentIdToken = idTokenRef.current
    const currentStats = statsRef.current

    if (!currentUser || !currentIdToken) {
      return
    }

    // Prevent multiple simultaneous connection attempts
    if (isConnectingRef.current) {
      return
    }

    if (wsRef.current?.readyState === WebSocket.OPEN ||
      wsRef.current?.readyState === WebSocket.CONNECTING) {
      return
    }

    isConnectingRef.current = true
    shouldReconnectRef.current = true

    // Refresh token before connecting to ensure it's valid
    let freshToken = currentIdToken
    try {
      const refreshedToken = await refreshToken()
      if (refreshedToken) {
        freshToken = refreshedToken
      }
    } catch (e) {
      console.warn('Token refresh failed, using existing token')
    }

    const params = new URLSearchParams({
      token: freshToken,
      user_id: currentUser.uid,
      display_name: currentUser.displayName || 'Anonymous',
      photo_url: currentUser.photoURL || '',
      elo: String(currentStats?.currentElo || DEFAULT_ELO),
    })

    try {
      const ws = new WebSocket(`${API_ENDPOINTS.matchWs}?${params}`)
      wsRef.current = ws

      ws.onopen = () => {
        bestPingRef.current = Infinity
        lastSentGameEventIdRef.current = 0
        isConnectingRef.current = false
        setIsConnected(true)
        // Only reset backoff after the socket has remained useful. Resetting
        // on every short-lived open turns a backend that immediately drops
        // the connection into a permanent one-second reconnect loop.
        if (connectionStableTimeoutRef.current !== null) {
          clearTimeout(connectionStableTimeoutRef.current)
        }
        connectionStableTimeoutRef.current = window.setTimeout(() => {
          reconnectAttemptRef.current = 0
          connectionStableTimeoutRef.current = null
        }, 10000)
        if (import.meta.env.DEV) console.log('WebSocket connected')

        // Start heartbeat ping every 25 seconds to keep connection alive
        // Mobile browsers and PWAs can timeout idle connections
        if (heartbeatIntervalRef.current) {
          clearInterval(heartbeatIntervalRef.current)
        }

        // Immediate initial ping to sync time offset ASAP
        // This prevents the "timer jumping" issue where offset is calculated late
        if (wsRef.current?.readyState === WebSocket.OPEN) {
          pingTimestampRef.current = Date.now()
          wsRef.current.send(JSON.stringify({ type: 'PING', timestamp: pingTimestampRef.current }))
          flushPendingGameEvents(ws)
        }

        heartbeatIntervalRef.current = window.setInterval(() => {
          if (wsRef.current?.readyState === WebSocket.OPEN) {
            // Track ping timestamp for RTT measurement
            pingTimestampRef.current = Date.now()
            wsRef.current.send(JSON.stringify({ type: 'PING', timestamp: pingTimestampRef.current }))
          }
        }, 25000)
      }

      ws.onmessage = (event) => {
        try {
          const message: ServerMessageType = JSON.parse(event.data)
          handleMessageRef.current(message)
        } catch {
          // Ignore parse errors
        }

      }

      ws.onclose = (event) => {
        // if (import.meta.env.DEV) console.log('WebSocket closed', event.code, event.reason)
        // A late close from an old socket must not tear down a newer one.
        if (wsRef.current !== ws) return
        wsRef.current = null
        isConnectingRef.current = false
        setIsConnected(false)
        if (connectionStableTimeoutRef.current !== null) {
          clearTimeout(connectionStableTimeoutRef.current)
          connectionStableTimeoutRef.current = null
        }

        // Stop heartbeat
        if (heartbeatIntervalRef.current) {
          clearInterval(heartbeatIntervalRef.current)
          heartbeatIntervalRef.current = null
        }

        // Only reconnect if explicitly enabled and user is still authenticated
        if (shouldReconnectRef.current && userRef.current && idTokenRef.current) {
          // Exponential backoff: 1s, 2s, 4s, 8s (max)
          const delay = Math.min(
            baseReconnectDelay * Math.pow(2, reconnectAttemptRef.current),
            maxReconnectDelay
          )
          reconnectAttemptRef.current++
          if (import.meta.env.DEV) console.log(`Reconnecting in ${delay}ms (attempt ${reconnectAttemptRef.current})`)
          reconnectTimeoutRef.current = window.setTimeout(() => {
            connect()
          }, delay)
        }
      }

      ws.onerror = (error) => {
        console.error('WebSocket error', error)
        isConnectingRef.current = false
      }
    } catch (err) {
      console.error('WebSocket connection failed', err)
      isConnectingRef.current = false
    }
  }, [refreshToken, flushPendingGameEvents]) // Only depends on stable connection helpers

  const disconnect = useCallback(() => {
    shouldReconnectRef.current = false
    isConnectingRef.current = false
    if (reconnectTimeoutRef.current) {
      clearTimeout(reconnectTimeoutRef.current)
      reconnectTimeoutRef.current = null
    }
    if (connectionStableTimeoutRef.current !== null) {
      clearTimeout(connectionStableTimeoutRef.current)
      connectionStableTimeoutRef.current = null
    }
    if (heartbeatIntervalRef.current) {
      clearInterval(heartbeatIntervalRef.current)
      heartbeatIntervalRef.current = null
    }
    setIsConnected(false)
    if (wsRef.current) {
      wsRef.current.close()
      wsRef.current = null
    }
  }, [])

  const send = useCallback((data: object) => {
    if (wsRef.current?.readyState === WebSocket.OPEN) {
      wsRef.current.send(JSON.stringify(data))
    }
  }, [])

  const sendGameEvent = useCallback((data: GameEventPayload) => {
    const event: QueuedGameEvent = { ...data, event_id: nextGameEventIdRef.current++ }
    const socket = wsRef.current
    if (pendingGameEventsRef.current.length > 0 || !socket || socket.readyState !== WebSocket.OPEN) {
      // A 30-second match can produce fewer than 1,600 input events at the
      // server's 50-message/second limit. This bound comfortably covers it.
      if (pendingGameEventsRef.current.length < 2048) {
        pendingGameEventsRef.current.push(event)
      }
      if (socket?.readyState === WebSocket.OPEN && gameEventFlushTimeoutRef.current === null) {
        flushPendingGameEvents(socket)
      }
      return
    }
    pendingGameEventsRef.current.push(event)
    flushPendingGameEvents(socket)
  }, [flushPendingGameEvents])

  const joinQueue = useCallback(() => {
    pendingGameEventsRef.current = []
    nextGameEventIdRef.current = 1
    lastSentGameEventIdRef.current = 0
    if (gameEventFlushTimeoutRef.current !== null) {
      clearTimeout(gameEventFlushTimeoutRef.current)
      gameEventFlushTimeoutRef.current = null
    }
    // First, clean up any stale queue state from previous matchmaking
    send({ type: 'LEAVE_QUEUE' })
    // Reset game store to clear any lingering state
    useGameStore.getState().reset()
    // Reset keystroke tracker for new game
    lastSentCharIndexRef.current = -1
    // Then join the queue
    setTimeout(() => {
      send({ type: 'JOIN_QUEUE' })
      // Update local state to show queue UI
      useGameStore.getState().joinQueue()
    }, 100) // Small delay to ensure cleanup completes
  }, [send])

  const joinTrainingQueue = useCallback(() => {
    pendingGameEventsRef.current = []
    nextGameEventIdRef.current = 1
    lastSentGameEventIdRef.current = 0
    if (gameEventFlushTimeoutRef.current !== null) {
      clearTimeout(gameEventFlushTimeoutRef.current)
      gameEventFlushTimeoutRef.current = null
    }
    // First, clean up any stale queue state from previous matchmaking
    send({ type: 'LEAVE_QUEUE' })
    // Reset game store to clear any lingering state
    useGameStore.getState().reset()
    // Reset keystroke tracker for new game
    lastSentCharIndexRef.current = -1
    // Then join the training queue
    setTimeout(() => {
      send({ type: 'JOIN_TRAINING_QUEUE' })
      // Update local state to show queue UI
      useGameStore.getState().joinTrainingQueue()
    }, 100) // Small delay to ensure cleanup completes
  }, [send])

  const joinFriendsQueue = useCallback(() => {
    pendingGameEventsRef.current = []
    nextGameEventIdRef.current = 1
    lastSentGameEventIdRef.current = 0
    if (gameEventFlushTimeoutRef.current !== null) {
      clearTimeout(gameEventFlushTimeoutRef.current)
      gameEventFlushTimeoutRef.current = null
    }
    // First, clean up any stale queue state from previous matchmaking
    send({ type: 'LEAVE_QUEUE' })
    // Reset game store to clear any lingering state
    useGameStore.getState().reset()
    // Reset keystroke tracker for new game
    lastSentCharIndexRef.current = -1
    // Then join the friends queue
    setTimeout(() => {
      send({ type: 'JOIN_FRIENDS_QUEUE' })
      // Update local state to show queue UI
      useGameStore.getState().joinFriendsQueue()
    }, 100) // Small delay to ensure cleanup completes
  }, [send])

  const leaveQueue = useCallback(() => {
    pendingGameEventsRef.current = []
    nextGameEventIdRef.current = 1
    lastSentGameEventIdRef.current = 0
    if (gameEventFlushTimeoutRef.current !== null) {
      clearTimeout(gameEventFlushTimeoutRef.current)
      gameEventFlushTimeoutRef.current = null
    }
    send({ type: 'LEAVE_QUEUE' })
  }, [send])

  // Track last sent char_index for client-side deduplication
  const lastSentCharIndexRef = useRef<number>(-1)

  const sendKeystroke = useCallback((char: string, charIndex: number) => {
    // Client-side deduplication: skip if we already sent this char_index
    // This prevents duplicate sends from network issues or rapid typing
    if (char !== '\b' && charIndex <= lastSentCharIndexRef.current) {
      return // Skip duplicate
    }

    // Update tracker (backspace can go backwards)
    lastSentCharIndexRef.current = char === '\b' ? charIndex - 1 : charIndex

    sendGameEvent({
      type: 'KEYSTROKE',
      char,
      timestamp: Date.now() + timeOffset,
      char_index: charIndex,
    })
  }, [sendGameEvent, timeOffset])

  const sendWordComplete = useCallback((word: string, wordIndex: number) => {
    const words = useGameStore.getState().words
    lastSentCharIndexRef.current = words.slice(0, wordIndex + 1).reduce((sum, item) => sum + item.length + 1, 0) - 1
    sendGameEvent({
      type: 'WORD_COMPLETE',
      word,
      word_index: wordIndex,
      timestamp: Date.now() + timeOffset,
    })
  }, [sendGameEvent, timeOffset])

  // Connect when auth becomes available, but don't recycle a live socket each
  // time Firebase rotates an otherwise valid ID token.
  useEffect(() => {
    const currentUid = user?.uid ?? null
    if (currentUid !== gameEventOwnerRef.current) {
      pendingGameEventsRef.current = []
      nextGameEventIdRef.current = 1
      lastSentGameEventIdRef.current = 0
      if (gameEventFlushTimeoutRef.current !== null) {
        clearTimeout(gameEventFlushTimeoutRef.current)
        gameEventFlushTimeoutRef.current = null
      }
      gameEventOwnerRef.current = currentUid
    }
    if (user && idToken) {
      connect()
    } else {
      pendingGameEventsRef.current = []
      nextGameEventIdRef.current = 1
      lastSentGameEventIdRef.current = 0
      if (gameEventFlushTimeoutRef.current !== null) {
        clearTimeout(gameEventFlushTimeoutRef.current)
        gameEventFlushTimeoutRef.current = null
      }
      disconnect()
    }
    return () => {
      disconnect()
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
    // The token only gates initial auth. Its value can rotate without the
    // authenticated user changing, and the active socket remains authorized.
  }, [user?.uid, Boolean(idToken)])

  return (
    <WebSocketContext.Provider value={{
      connect,
      disconnect,
      joinQueue,
      joinTrainingQueue,
      joinFriendsQueue,
      leaveQueue,
      sendKeystroke,
      sendWordComplete,
      isConnected,
      ping,
      timeOffset
    }}>
      {children}
    </WebSocketContext.Provider>
  )
}

export function useWebSocket() {
  const context = useContext(WebSocketContext)
  if (!context) {
    throw new Error('useWebSocket must be used within a WebSocketProvider')
  }
  return context
}
