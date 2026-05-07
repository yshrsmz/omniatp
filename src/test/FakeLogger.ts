import { Mock, vi } from 'vitest'
import { Logger } from '../Logger'

export interface FakeLogger extends Logger {
  log: Mock
  info: Mock
  warn: Mock
  error: Mock
  debug: Mock
  withTag: Mock
}

export const createFakeLogger = (): FakeLogger => {
  const fake = {
    log: vi.fn<(...args: unknown[]) => void>(),
    info: vi.fn<(...args: unknown[]) => void>(),
    warn: vi.fn<(...args: unknown[]) => void>(),
    error: vi.fn<(...args: unknown[]) => void>(),
    debug: vi.fn<(...args: unknown[]) => void>(),
    withTag: vi.fn<(tag: string) => Logger>(),
  }
  fake.withTag.mockReturnValue(fake as unknown as Logger)
  return fake as unknown as FakeLogger
}
