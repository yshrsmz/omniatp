import { describe, expect, it, vi } from 'vitest'
import { AtpSessionData } from '@atproto/api'
import { DefaultConfigLocalGateway } from './ConfigLocalGateway'
import { InMemoryStorageDelegate } from '../test/InMemoryStorageDelegate'

const sampleSession: AtpSessionData = {
  did: 'did:plc:abc',
  handle: 'tester.bsky.social',
  email: 'tester@example.com',
  accessJwt: 'access',
  refreshJwt: 'refresh',
  active: true,
}

describe('DefaultConfigLocalGateway', () => {
  describe('post prefix', () => {
    it('returns the default prefix when nothing is saved', async () => {
      const gateway = new DefaultConfigLocalGateway(
        new InMemoryStorageDelegate()
      )
      expect(await gateway.getPostPrefix()).toBe('NowBrowsing: ')
    })

    it('round-trips the saved prefix', async () => {
      const gateway = new DefaultConfigLocalGateway(
        new InMemoryStorageDelegate()
      )
      await gateway.savePostPrefix('Watching ')
      expect(await gateway.getPostPrefix()).toBe('Watching ')
    })

    it('clears the prefix back to the default', async () => {
      const gateway = new DefaultConfigLocalGateway(
        new InMemoryStorageDelegate()
      )
      await gateway.savePostPrefix('Watching ')
      await gateway.clearPostPrefix()
      expect(await gateway.getPostPrefix()).toBe('NowBrowsing: ')
    })
  })

  describe('copy to clipboard preference', () => {
    it('defaults to false', async () => {
      const gateway = new DefaultConfigLocalGateway(
        new InMemoryStorageDelegate()
      )
      expect(await gateway.shouldCopyToClipboardOnPost()).toBe(false)
    })

    it('round-trips the saved value', async () => {
      const gateway = new DefaultConfigLocalGateway(
        new InMemoryStorageDelegate()
      )
      await gateway.saveCopyToClipboardOnPost(true)
      expect(await gateway.shouldCopyToClipboardOnPost()).toBe(true)
    })
  })

  describe('session', () => {
    it('returns undefined when no session is saved', async () => {
      const gateway = new DefaultConfigLocalGateway(
        new InMemoryStorageDelegate()
      )
      expect(await gateway.getSession()).toBeUndefined()
    })

    it('round-trips a session', async () => {
      const gateway = new DefaultConfigLocalGateway(
        new InMemoryStorageDelegate()
      )
      await gateway.saveSession(sampleSession)
      expect(await gateway.getSession()).toEqual(sampleSession)
    })

    it('clears the session', async () => {
      const gateway = new DefaultConfigLocalGateway(
        new InMemoryStorageDelegate()
      )
      await gateway.saveSession(sampleSession)
      await gateway.clearSession()
      expect(await gateway.getSession()).toBeUndefined()
    })

    it('notifies onSessionUpdate when the session key changes', async () => {
      const gateway = new DefaultConfigLocalGateway(
        new InMemoryStorageDelegate()
      )
      const listener = vi.fn()
      gateway.onSessionUpdate(listener)

      await gateway.saveSession(sampleSession)

      expect(listener).toHaveBeenCalledTimes(1)
      const [newValue, oldValue] = listener.mock.calls[0]
      expect(newValue).toEqual(sampleSession)
      expect(oldValue).toBeUndefined()
    })

    it('does not notify when an unrelated key changes', async () => {
      const gateway = new DefaultConfigLocalGateway(
        new InMemoryStorageDelegate()
      )
      const listener = vi.fn()
      gateway.onSessionUpdate(listener)

      await gateway.savePostPrefix('Watching ')

      expect(listener).not.toHaveBeenCalled()
    })
  })
})
