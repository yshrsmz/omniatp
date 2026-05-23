import { afterEach, describe, expect, it, vi } from 'vitest'
import { DefaultChromeDelegate } from './ChromeDelegate'
import { OFFSCREEN_CLIPBOARD_TARGET } from './offscreen-messages'
import { createFakeLogger } from '../test/FakeLogger'
import type { Chrome } from '../utils'

type Listener = (msg: unknown) => void

interface BuildOptions {
  hasDocument?: boolean
  sendMessageResponse?: unknown
}

const buildStubChrome = (opts: BuildOptions = {}) => {
  const listeners: Listener[] = []

  const hasDocument = vi.fn(async () => opts.hasDocument ?? false)
  const closeDocument = vi.fn(async () => {})
  const createDocument = vi.fn(async () => {})
  const sendMessage = vi.fn(
    async () => opts.sendMessageResponse ?? { ok: true }
  )
  const addListener = vi.fn((listener: Listener) => {
    listeners.push(listener)
  })
  const removeListener = vi.fn((listener: Listener) => {
    const idx = listeners.indexOf(listener)
    if (idx >= 0) listeners.splice(idx, 1)
  })

  const chrome = {
    runtime: {
      getURL: (path: string) => `chrome-extension://test/${path}`,
      sendMessage,
      onMessage: { addListener, removeListener },
    },
    offscreen: {
      hasDocument,
      closeDocument,
      createDocument,
      Reason: { CLIPBOARD: 'CLIPBOARD' },
    },
  } as unknown as Chrome

  const fireReady = (): void => {
    const msg = { target: OFFSCREEN_CLIPBOARD_TARGET, type: 'ready' }
    for (const l of [...listeners]) l(msg)
  }

  return {
    chrome,
    listeners,
    hasDocument,
    closeDocument,
    createDocument,
    sendMessage,
    addListener,
    removeListener,
    fireReady,
  }
}

const flushMicrotasks = async (): Promise<void> => {
  for (let i = 0; i < 5; i++) {
    await Promise.resolve()
  }
}

describe('DefaultChromeDelegate.copyToClipboard', () => {
  afterEach(() => {
    vi.useRealTimers()
  })

  it('sends copy after the offscreen document reports ready', async () => {
    const stub = buildStubChrome()
    const logger = createFakeLogger()
    const delegate = new DefaultChromeDelegate(stub.chrome, logger)

    const p = delegate.copyToClipboard('hello')
    await flushMicrotasks()
    stub.fireReady()
    await p

    expect(stub.createDocument).toHaveBeenCalledTimes(1)
    expect(stub.sendMessage).toHaveBeenCalledWith({
      target: OFFSCREEN_CLIPBOARD_TARGET,
      type: 'copy',
      text: 'hello',
    })
  })

  it('registers the ready listener before creating the offscreen document', async () => {
    const stub = buildStubChrome()
    const logger = createFakeLogger()
    const delegate = new DefaultChromeDelegate(stub.chrome, logger)

    const p = delegate.copyToClipboard('hello')
    await flushMicrotasks()
    stub.fireReady()
    await p

    const addOrder = stub.addListener.mock.invocationCallOrder[0]
    const createOrder = stub.createDocument.mock.invocationCallOrder[0]
    expect(addOrder).toBeLessThan(createOrder)
  })

  it('does not dispatch the copy message until ready arrives', async () => {
    const stub = buildStubChrome()
    const logger = createFakeLogger()
    const delegate = new DefaultChromeDelegate(stub.chrome, logger)

    const p = delegate.copyToClipboard('hello')
    await flushMicrotasks()

    expect(stub.createDocument).toHaveBeenCalledTimes(1)
    expect(stub.sendMessage).not.toHaveBeenCalled()

    stub.fireReady()
    await p

    expect(stub.sendMessage).toHaveBeenCalledTimes(1)
  })

  it('falls through and warns when the ready signal times out', async () => {
    vi.useFakeTimers()
    const stub = buildStubChrome()
    const logger = createFakeLogger()
    const delegate = new DefaultChromeDelegate(stub.chrome, logger)

    const p = delegate.copyToClipboard('hello')
    await vi.advanceTimersByTimeAsync(2000)
    await p

    expect(logger.warn).toHaveBeenCalled()
    expect(stub.sendMessage).toHaveBeenCalledWith({
      target: OFFSCREEN_CLIPBOARD_TARGET,
      type: 'copy',
      text: 'hello',
    })
    expect(stub.removeListener).toHaveBeenCalled()
  })

  it('closes any existing offscreen document before creating a new one', async () => {
    const stub = buildStubChrome({ hasDocument: true })
    const logger = createFakeLogger()
    const delegate = new DefaultChromeDelegate(stub.chrome, logger)

    const p = delegate.copyToClipboard('hello')
    await flushMicrotasks()
    stub.fireReady()
    await p

    expect(stub.closeDocument).toHaveBeenCalledTimes(1)
    const closeOrder = stub.closeDocument.mock.invocationCallOrder[0]
    const createOrder = stub.createDocument.mock.invocationCallOrder[0]
    expect(closeOrder).toBeLessThan(createOrder)
  })

  it('creates and closes an offscreen during prewarm to warm the cache', async () => {
    const stub = buildStubChrome()
    const logger = createFakeLogger()
    const delegate = new DefaultChromeDelegate(stub.chrome, logger)

    await delegate.prewarmOffscreen()

    expect(stub.createDocument).toHaveBeenCalledTimes(1)
    expect(stub.closeDocument).toHaveBeenCalledTimes(1)
    const createOrder = stub.createDocument.mock.invocationCallOrder[0]
    const closeOrder = stub.closeDocument.mock.invocationCallOrder[0]
    expect(createOrder).toBeLessThan(closeOrder)
  })

  it('skips prewarm when an offscreen document already exists', async () => {
    const stub = buildStubChrome({ hasDocument: true })
    const logger = createFakeLogger()
    const delegate = new DefaultChromeDelegate(stub.chrome, logger)

    await delegate.prewarmOffscreen()

    expect(stub.createDocument).not.toHaveBeenCalled()
    expect(stub.closeDocument).not.toHaveBeenCalled()
  })

  it('throws when sendMessage reports failure', async () => {
    const stub = buildStubChrome({
      sendMessageResponse: { ok: false, error: 'boom' },
    })
    const logger = createFakeLogger()
    const delegate = new DefaultChromeDelegate(stub.chrome, logger)

    const p = delegate.copyToClipboard('hello')
    await flushMicrotasks()
    stub.fireReady()

    await expect(p).rejects.toThrow('boom')
  })
})
