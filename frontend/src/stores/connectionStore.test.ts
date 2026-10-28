import { beforeEach, describe, expect, it, vi } from 'vitest'
import { checkBackendHealth } from '../config/api'
import { useConnectionStore } from './connectionStore'

vi.mock('../config/api', () => ({ checkBackendHealth: vi.fn() }))

beforeEach(() => {
  useConnectionStore.setState({ status: 'connected', lastCheck: null, retryCount: 0 })
  vi.mocked(checkBackendHealth).mockReset()
})

describe('connection health', () => {
  it('keeps an established session mounted through brief network failures', async () => {
    vi.mocked(checkBackendHealth).mockResolvedValue(false)
    await useConnectionStore.getState().checkConnection()
    await useConnectionStore.getState().checkConnection()
    expect(useConnectionStore.getState().status).toBe('connected')
    await useConnectionStore.getState().checkConnection()
    expect(useConnectionStore.getState().status).toBe('disconnected')
  })

  it('shares an in-flight health check instead of overlapping requests', async () => {
    let finish!: (value: boolean) => void
    vi.mocked(checkBackendHealth).mockReturnValue(new Promise(resolve => { finish = resolve }))
    const first = useConnectionStore.getState().checkConnection()
    const second = useConnectionStore.getState().checkConnection()
    expect(checkBackendHealth).toHaveBeenCalledTimes(1)
    finish(true)
    await Promise.all([first, second])
    expect(useConnectionStore.getState().status).toBe('connected')
  })
})
