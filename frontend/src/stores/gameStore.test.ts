import { beforeEach, describe, expect, it } from 'vitest'
import { useGameStore } from './gameStore'

describe('game start synchronization', () => {
  beforeEach(() => useGameStore.getState().reset())

  it('does not enter the active game until the server confirms the start', () => {
    useGameStore.getState().matchFound({
      matchId: 'match-1',
      opponentDisplayName: 'Opponent',
      opponentPhotoURL: null,
      opponentRank: 'Bronze',
      opponentElo: 1000,
      opponentIsBot: false,
      words: ['ready', 'steady'],
      gameMode: 'ranked',
    })

    useGameStore.getState().startGame(30, Date.now() + 5000)
    expect(useGameStore.getState().status).toBe('waiting')

    useGameStore.getState().activateMatch()
    expect(useGameStore.getState().status).toBe('playing')
  })
})
