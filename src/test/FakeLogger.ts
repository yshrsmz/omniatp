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
  const fake: FakeLogger = {
    log: vi.fn<Logger['log']>(),
    info: vi.fn<Logger['info']>(),
    warn: vi.fn<Logger['warn']>(),
    error: vi.fn<Logger['error']>(),
    debug: vi.fn<Logger['debug']>(),
    withTag: vi.fn<Logger['withTag']>(),
  }
  fake.withTag.mockReturnValue(fake)
  return fake
}
