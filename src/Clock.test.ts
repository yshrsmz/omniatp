import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest'
import { DefaultClock } from './Clock'

describe('DefaultClock', () => {
  beforeEach(() => {
    vi.useFakeTimers()
  })

  afterEach(() => {
    vi.useRealTimers()
  })

  it('returns the current time in unix seconds', () => {
    vi.setSystemTime(new Date('2026-05-07T14:00:00.000Z'))
    expect(new DefaultClock().currentTimeSeconds()).toBe(
      Math.floor(new Date('2026-05-07T14:00:00.000Z').getTime() / 1000)
    )
  })
})
