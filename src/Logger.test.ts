import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest'
import { ConsoleLogger, noopLogger } from './Logger'

describe('ConsoleLogger', () => {
  let logSpy: ReturnType<typeof vi.spyOn>
  let warnSpy: ReturnType<typeof vi.spyOn>
  let errorSpy: ReturnType<typeof vi.spyOn>

  beforeEach(() => {
    logSpy = vi.spyOn(console, 'log').mockImplementation(() => {})
    warnSpy = vi.spyOn(console, 'warn').mockImplementation(() => {})
    errorSpy = vi.spyOn(console, 'error').mockImplementation(() => {})
  })

  afterEach(() => {
    logSpy.mockRestore()
    warnSpy.mockRestore()
    errorSpy.mockRestore()
  })

  it('forwards calls to console without a prefix when untagged', () => {
    new ConsoleLogger().log('hello', 1)
    expect(logSpy).toHaveBeenCalledWith('hello', 1)
  })

  it('prefixes calls with [tag] when a tag is set', () => {
    new ConsoleLogger('Greeter').warn('careful')
    expect(warnSpy).toHaveBeenCalledWith('[Greeter]', 'careful')
  })

  it('combines nested tags with a colon', () => {
    new ConsoleLogger('A').withTag('B').error('boom')
    expect(errorSpy).toHaveBeenCalledWith('[A:B]', 'boom')
  })

  it('returns independent loggers from withTag', () => {
    const root = new ConsoleLogger()
    const child = root.withTag('Child')
    expect(child).not.toBe(root)
  })
})

describe('noopLogger', () => {
  it('returns itself from withTag and never calls console', () => {
    const logSpy = vi.spyOn(console, 'log').mockImplementation(() => {})
    const tagged = noopLogger.withTag('Anything')
    tagged.log('hello')
    expect(tagged).toBe(noopLogger)
    expect(logSpy).not.toHaveBeenCalled()
    logSpy.mockRestore()
  })
})
