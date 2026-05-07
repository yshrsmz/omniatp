import { describe, expect, it, vi } from 'vitest'
import { XRPCError } from '@atproto/xrpc'
import { OmniATP } from './OmniATP'
import { Payload, SubCommand } from './SubCommands'
import { createFakeChromeDelegate } from '../test/FakeChromeDelegate'
import { BskyRepository } from '../data/BskyRepository'
import { AppPreferencesRepository } from '../data/AppPreferencesRepository'
import { Clock } from '../Clock'

const buildBskyRepository = (
  overrides: Partial<BskyRepository> = {}
): BskyRepository => ({
  signIn: vi.fn(),
  signOut: vi.fn(),
  resumeSession: vi.fn(),
  hasSession: vi.fn(() => true),
  getSession: vi.fn(async () => undefined),
  onSessionUpdate: vi.fn(),
  getProfile: vi.fn(async () => undefined),
  createRichText: vi.fn(async (text: string) => ({
    text,
    graphemeLength: text.length,
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
  })) as any,
  createPost: vi.fn(),
  ...overrides,
})

const buildAppPrefs = (
  shouldCopy = false
): AppPreferencesRepository & {
  shouldCopyToClipboardOnPost: ReturnType<typeof vi.fn>
} => ({
  shouldCopyToClipboardOnPost: vi.fn(async () => shouldCopy),
  setCopyToClipboardOnPost: vi.fn(),
})

const fakeClock: Clock = { currentTimeSeconds: () => 0 }

const buildSubCommand = (
  name: string,
  matcher: (text: string) => boolean,
  enterPayload: Payload | undefined = undefined
): SubCommand => ({
  name,
  description: name,
  test: matcher,
  handleInputEvent: vi.fn(async () => {}),
  handleEnterEvent: vi.fn(async () => enterPayload),
})

describe('OmniATP.initialize', () => {
  it('resumes the session and registers a session-update listener', async () => {
    const bsky = buildBskyRepository()
    const omni = new OmniATP(
      fakeClock,
      createFakeChromeDelegate(),
      bsky,
      buildAppPrefs(),
      []
    )

    await omni.initialize()

    expect(bsky.resumeSession).toHaveBeenCalled()
    expect(bsky.onSessionUpdate).toHaveBeenCalled()
  })

  it('swallows errors from resumeSession so initialize never rejects', async () => {
    const bsky = buildBskyRepository({
      resumeSession: vi.fn(async () => {
        throw new Error('boom')
      }),
    })
    const errSpy = vi.spyOn(console, 'error').mockImplementation(() => {})
    const omni = new OmniATP(
      fakeClock,
      createFakeChromeDelegate(),
      bsky,
      buildAppPrefs(),
      []
    )

    await expect(omni.initialize()).resolves.toBeUndefined()
    expect(errSpy).toHaveBeenCalled()
  })

  it('on session update, resumes when no in-memory session exists but a new value arrived', async () => {
    let listener: ((newValue?: unknown, oldValue?: unknown) => void) | undefined
    const bsky = buildBskyRepository({
      hasSession: vi.fn(() => false),
      onSessionUpdate: vi.fn((l) => {
        listener = l
      }),
    })
    const omni = new OmniATP(
      fakeClock,
      createFakeChromeDelegate(),
      bsky,
      buildAppPrefs(),
      []
    )
    await omni.initialize()

    listener?.({ did: 'x' }, undefined)

    // resumeSession is called once during initialize, and once from the listener
    expect(bsky.resumeSession).toHaveBeenCalledTimes(2)
  })

  it('on session update, signs out when newValue becomes undefined', async () => {
    let listener: ((newValue?: unknown, oldValue?: unknown) => void) | undefined
    const bsky = buildBskyRepository({
      hasSession: vi.fn(() => true),
      onSessionUpdate: vi.fn((l) => {
        listener = l
      }),
    })
    const omni = new OmniATP(
      fakeClock,
      createFakeChromeDelegate(),
      bsky,
      buildAppPrefs(),
      []
    )
    await omni.initialize()

    listener?.(undefined, { did: 'x' })

    expect(bsky.signOut).toHaveBeenCalled()
  })
})

describe('OmniATP.postStatus', () => {
  it('does nothing when the message is empty', async () => {
    const bsky = buildBskyRepository()
    const chrome = createFakeChromeDelegate()
    const omni = new OmniATP(fakeClock, chrome, bsky, buildAppPrefs(), [])

    await omni.postStatus({ message: '' })

    expect(bsky.createPost).not.toHaveBeenCalled()
    expect(chrome.createNotification).not.toHaveBeenCalled()
  })

  it('posts and shows a success notification', async () => {
    const bsky = buildBskyRepository()
    const chrome = createFakeChromeDelegate()
    const omni = new OmniATP(fakeClock, chrome, bsky, buildAppPrefs(), [])

    await omni.postStatus({ message: 'hello' })

    expect(bsky.createPost).toHaveBeenCalledWith('hello', undefined)
    expect(chrome.createNotification).toHaveBeenCalledWith(
      'icon/128.png',
      'OmniATP',
      'hello'
    )
  })

  it('copies to clipboard when the preference is enabled', async () => {
    const bsky = buildBskyRepository()
    const chrome = createFakeChromeDelegate()
    const prefs = buildAppPrefs(true)
    const omni = new OmniATP(fakeClock, chrome, bsky, prefs, [])

    await omni.postStatus({ message: 'hello' })

    expect(chrome.copyToClipboard).toHaveBeenCalledWith('hello')
  })

  it('skips clipboard copy when the preference is disabled', async () => {
    const bsky = buildBskyRepository()
    const chrome = createFakeChromeDelegate()
    const omni = new OmniATP(fakeClock, chrome, bsky, buildAppPrefs(false), [])

    await omni.postStatus({ message: 'hello' })

    expect(chrome.copyToClipboard).not.toHaveBeenCalled()
  })

  it('logs and does not surface clipboard errors', async () => {
    const bsky = buildBskyRepository()
    const chrome = createFakeChromeDelegate({
      copyToClipboard: vi.fn(async () => {
        throw new Error('clipboard fail')
      }),
    })
    const errSpy = vi.spyOn(console, 'error').mockImplementation(() => {})
    const omni = new OmniATP(fakeClock, chrome, bsky, buildAppPrefs(true), [])

    await expect(omni.postStatus({ message: 'hi' })).resolves.toBeUndefined()
    expect(errSpy).toHaveBeenCalled()
  })

  it('shows an error notification when createPost throws an XRPCError', async () => {
    const bsky = buildBskyRepository({
      createPost: vi.fn(async () => {
        const err = new XRPCError(429, 'RateLimit')
        throw err
      }),
    })
    const chrome = createFakeChromeDelegate()
    const omni = new OmniATP(fakeClock, chrome, bsky, buildAppPrefs(), [])

    await omni.postStatus({ message: 'hi' })

    expect(chrome.createNotification).toHaveBeenCalledWith(
      'icon/128.png',
      'Oops! there was an error: 429',
      'RateLimit'
    )
  })

  it('shows an error notification when createPost throws a generic error', async () => {
    const bsky = buildBskyRepository({
      createPost: vi.fn(async () => {
        throw new Error('something broke')
      }),
    })
    const chrome = createFakeChromeDelegate()
    const omni = new OmniATP(fakeClock, chrome, bsky, buildAppPrefs(), [])

    await omni.postStatus({ message: 'hi' })

    expect(chrome.createNotification).toHaveBeenCalledWith(
      'icon/128.png',
      'Oops! there was an error: undefined',
      'something broke'
    )
  })
})

describe('OmniATP.handleInputChengedEvent', () => {
  it('prompts the user to sign in when there is no session', async () => {
    const bsky = buildBskyRepository({ hasSession: vi.fn(() => false) })
    const chrome = createFakeChromeDelegate()
    const omni = new OmniATP(fakeClock, chrome, bsky, buildAppPrefs(), [])

    await omni.handleInputChengedEvent('anything')

    expect(chrome.showDefaultSuggestion).toHaveBeenCalledWith(
      'To use OmniATP, please sign in first(press Enter to sign in)'
    )
  })

  it('routes to a matching sub-command when one matches', async () => {
    const bsky = buildBskyRepository()
    const sub = buildSubCommand(':opt', (t) => t === ':opt')
    const chrome = createFakeChromeDelegate()
    const omni = new OmniATP(fakeClock, chrome, bsky, buildAppPrefs(), [sub])

    await omni.handleInputChengedEvent(':opt')

    expect(sub.handleInputEvent).toHaveBeenCalledWith(':opt', chrome)
    expect(bsky.createRichText).not.toHaveBeenCalled()
  })

  it('shows the remaining grapheme count for normal input', async () => {
    const bsky = buildBskyRepository()
    const chrome = createFakeChromeDelegate()
    const omni = new OmniATP(fakeClock, chrome, bsky, buildAppPrefs(), [])

    await omni.handleInputChengedEvent('hello')

    expect(chrome.showDefaultSuggestion).toHaveBeenCalledWith(
      `${300 - 5} characters left`
    )
  })
})

describe('OmniATP.handleInputEnteredEvent', () => {
  it('opens the options page when the user is not signed in', async () => {
    const bsky = buildBskyRepository({ hasSession: vi.fn(() => false) })
    const chrome = createFakeChromeDelegate()
    const omni = new OmniATP(fakeClock, chrome, bsky, buildAppPrefs(), [])

    await omni.handleInputEnteredEvent('anything')

    expect(chrome.openOptionsPage).toHaveBeenCalled()
    expect(bsky.createPost).not.toHaveBeenCalled()
  })

  it('posts the typed text directly when no sub-command matches', async () => {
    const bsky = buildBskyRepository()
    const chrome = createFakeChromeDelegate()
    const omni = new OmniATP(fakeClock, chrome, bsky, buildAppPrefs(), [])

    await omni.handleInputEnteredEvent('hello world')

    expect(bsky.createPost).toHaveBeenCalledWith('hello world', undefined)
  })

  it('uses the sub-command payload when one matches', async () => {
    const bsky = buildBskyRepository()
    const sub = buildSubCommand(':share', (t) => t.startsWith(':share'), {
      message: 'shared text',
      meta: undefined,
    })
    const chrome = createFakeChromeDelegate()
    const omni = new OmniATP(fakeClock, chrome, bsky, buildAppPrefs(), [sub])

    await omni.handleInputEnteredEvent(':share')

    expect(sub.handleEnterEvent).toHaveBeenCalledWith(':share', chrome)
    expect(bsky.createPost).toHaveBeenCalledWith('shared text', undefined)
  })

  it('skips posting when a sub-command returns undefined', async () => {
    const bsky = buildBskyRepository()
    const sub = buildSubCommand(
      ':options',
      (t) => t.startsWith(':options'),
      undefined
    )
    const chrome = createFakeChromeDelegate()
    const omni = new OmniATP(fakeClock, chrome, bsky, buildAppPrefs(), [sub])

    await omni.handleInputEnteredEvent(':options')

    expect(bsky.createPost).not.toHaveBeenCalled()
  })
})
