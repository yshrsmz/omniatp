import { describe, expect, it, vi } from 'vitest'
import { Options, Share, Version } from './SubCommands'
import { createFakeChromeDelegate } from '../test/FakeChromeDelegate'
import { PostTemplateRepository } from '../data/PostTemplateRepository'
import { PostTemplate } from '../data/model/PostTemplate'

describe('Options sub-command', () => {
  const sub = new Options()

  it('matches `:options` with or without trailing arguments', () => {
    expect(sub.test(':options')).toBe(true)
    expect(sub.test(':OPTIONS')).toBe(true)
    expect(sub.test(':options foo bar')).toBe(true)
    expect(sub.test(':opt')).toBe(false)
    expect(sub.test('hello :options')).toBe(false)
  })

  it('shows a default suggestion on input', async () => {
    const chrome = createFakeChromeDelegate()
    await sub.handleInputEvent(':options', chrome)
    expect(chrome.showDefaultSuggestion).toHaveBeenCalledWith(
      'Open options page'
    )
  })

  it('opens the options page on enter and returns no payload', async () => {
    const chrome = createFakeChromeDelegate()
    const payload = await sub.handleEnterEvent(':options', chrome)
    expect(chrome.openOptionsPage).toHaveBeenCalled()
    expect(payload).toBeUndefined()
  })
})

describe('Version sub-command', () => {
  const sub = new Version()

  it('matches `:version` with or without trailing arguments', () => {
    expect(sub.test(':version')).toBe(true)
    expect(sub.test(':Version foo')).toBe(true)
    expect(sub.test(':ver')).toBe(false)
  })

  it('shows the version string on input', async () => {
    const chrome = createFakeChromeDelegate({ appVersion: () => '9.9.9' })
    await sub.handleInputEvent(':version', chrome)
    expect(chrome.showDefaultSuggestion).toHaveBeenCalledWith(
      "I'm using OmniATP for Chrome Version 9.9.9"
    )
  })

  it('returns the version string as a payload on enter', async () => {
    const chrome = createFakeChromeDelegate({ appVersion: () => '1.0.0' })
    const payload = await sub.handleEnterEvent(':version', chrome)
    expect(payload).toEqual({
      message: "I'm using OmniATP for Chrome Version 1.0.0",
    })
  })
})

describe('Share sub-command', () => {
  const buildShare = (prefix = 'NowBrowsing: ') => {
    const repo: PostTemplateRepository = {
      get: vi.fn(async () => new PostTemplate(prefix)),
      save: vi.fn(),
      clear: vi.fn(),
    }
    return { share: new Share(repo), repo }
  }

  describe('test()', () => {
    it('matches `:share` with or without trailing arguments', () => {
      const { share } = buildShare()
      expect(share.test(':share')).toBe(true)
      expect(share.test(':share foo')).toBe(true)
      expect(share.test(':SHARE foo')).toBe(true)
      expect(share.test(':sha')).toBe(false)
    })
  })

  describe('extractUserInput()', () => {
    it('returns the trailing user input', () => {
      const { share } = buildShare()
      expect(share.extractUserInput(':share hello world')).toBe('hello world')
    })

    it('returns null when there is no input after the command', () => {
      const { share } = buildShare()
      expect(share.extractUserInput(':share')).toBeNull()
    })
  })

  describe('buildShareMessage()', () => {
    it('falls back to a static message when there is no current page', async () => {
      const { share } = buildShare()
      const chrome = createFakeChromeDelegate({
        currentPage: async () => undefined,
      })

      const payload = await share.buildShareMessage(':share', chrome)

      expect(payload.message).toBe('unable to share this page')
      expect(payload.meta).toBeUndefined()
    })

    it('uses the post template prefix when no user input is provided', async () => {
      const { share } = buildShare('PRE: ')
      const chrome = createFakeChromeDelegate({
        currentPage: async () =>
          ({
            url: 'https://example.com',
            title: 'Example',
          }) as chrome.tabs.Tab,
      })

      const payload = await share.buildShareMessage(':share', chrome)

      expect(payload.message).toContain('PRE: ')
      expect(payload.message).toContain('Example')
      expect(payload.message).toContain('https://example.com')
      expect(payload.meta).toEqual({
        uri: 'https://example.com',
        title: 'Example',
        description: '',
      })
    })

    it('uses the user input as the lead line when provided', async () => {
      const { share } = buildShare('PRE: ')
      const chrome = createFakeChromeDelegate({
        currentPage: async () =>
          ({
            url: 'https://example.com',
            title: 'Example',
          }) as chrome.tabs.Tab,
      })

      const payload = await share.buildShareMessage(':share my comment', chrome)

      expect(payload.message.startsWith('my comment\n')).toBe(true)
      expect(payload.message).not.toMatch(/^PRE: /)
    })
  })

  describe('handleInputEvent', () => {
    it('shows the share message as a default suggestion', async () => {
      const { share } = buildShare()
      const chrome = createFakeChromeDelegate({
        currentPage: async () => undefined,
      })

      await share.handleInputEvent(':share', chrome)

      expect(chrome.showDefaultSuggestion).toHaveBeenCalledWith(
        'unable to share this page'
      )
    })
  })

  describe('handleEnterEvent', () => {
    it('returns the same payload as buildShareMessage', async () => {
      const { share } = buildShare('PRE: ')
      const chrome = createFakeChromeDelegate({
        currentPage: async () =>
          ({
            url: 'https://example.com',
            title: 'Example',
          }) as chrome.tabs.Tab,
      })

      const payload = await share.handleEnterEvent(':share', chrome)

      expect(payload?.meta?.uri).toBe('https://example.com')
    })
  })
})
