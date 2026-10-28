import { act, cleanup, renderHook } from '@testing-library/react'
import { afterEach, describe, expect, it, vi } from 'vitest'
import { useGameStore } from '../stores/gameStore'
import { useTyping } from './useTyping'
import type { KeyboardEvent } from 'react'

afterEach(() => {
  cleanup()
  useGameStore.getState().reset()
})

describe('typing during a synchronized start', () => {
  it('does not queue or send input before the countdown finishes', () => {
    useGameStore.setState({ status: 'waiting', words: ['cat'], timeRemaining: 30 })
    const onKeystroke = vi.fn()
    const { result } = renderHook(() => useTyping({ onKeystroke }))
    const key = { key: 'c', preventDefault: vi.fn(), ctrlKey: false, altKey: false, metaKey: false } as unknown as KeyboardEvent

    act(() => result.current.handleKeyDown(key))
    expect(onKeystroke).not.toHaveBeenCalled()
    expect(useGameStore.getState().typedChars).toBe('')

    act(() => useGameStore.setState({ status: 'playing' }))
    expect(useGameStore.getState().typedChars).toBe('')
    act(() => result.current.handleKeyDown(key))
    expect(onKeystroke).toHaveBeenCalledWith('c', 0, true)
  })
})
