import { describe, expect, it, vi } from 'vitest'
import {
  AtpAgentOptions,
  AtpSessionData,
  AtpSessionEvent,
  AppBskyActorDefs,
} from '@atproto/api'
import { DefaultBskyRepository } from './BskyRepository'
import { DefaultConfigLocalGateway } from './ConfigLocalGateway'
import { InMemoryStorageDelegate } from '../test/InMemoryStorageDelegate'
import { noopLogger } from '../Logger'

const sampleSession: AtpSessionData = {
  did: 'did:plc:abc',
  handle: 'tester.bsky.social',
  email: 'tester@example.com',
  accessJwt: 'access',
  refreshJwt: 'refresh',
  active: true,
}

interface FakeAgentInstance {
  options: AtpAgentOptions
  hasSession: boolean
  login: ReturnType<typeof vi.fn>
  logout: ReturnType<typeof vi.fn>
  resumeSession: ReturnType<typeof vi.fn>
  getProfile: ReturnType<typeof vi.fn>
  post: ReturnType<typeof vi.fn>
  triggerPersistSession: (
    event: AtpSessionEvent,
    session?: AtpSessionData
  ) => void
}

const buildRepo = (
  configure: (agent: FakeAgentInstance) => void = () => {}
) => {
  const storage = new InMemoryStorageDelegate()
  const gateway = new DefaultConfigLocalGateway(storage, noopLogger)
  let captured: FakeAgentInstance | undefined

  const repo = new DefaultBskyRepository(
    gateway,
    (options) => {
      const agent: FakeAgentInstance = {
        options,
        hasSession: false,
        login: vi.fn(),
        logout: vi.fn(),
        resumeSession: vi.fn(),
        getProfile: vi.fn(),
        post: vi.fn(),
        triggerPersistSession: (event, session) => {
          options.persistSession?.(event, session)
        },
      }
      captured = agent
      configure(agent)
      // The repository expects an AtpAgent; we provide a structural stand-in.
      return agent as unknown as ReturnType<typeof Object>
    },
    noopLogger
  ) as DefaultBskyRepository & { agent: FakeAgentInstance }

  if (!captured) throw new Error('agentFactory was not invoked')
  return { repo, agent: captured, gateway, storage }
}

describe('DefaultBskyRepository', () => {
  describe('constructor / agent factory', () => {
    it('creates the agent with the bsky service URL and a persistSession handler', () => {
      const { agent } = buildRepo()
      expect(agent.options.service).toBe('https://bsky.social')
      expect(typeof agent.options.persistSession).toBe('function')
    })
  })

  describe('persistSession callback', () => {
    it('saves the session for non-create events when something is provided', async () => {
      const { agent, gateway } = buildRepo()

      agent.triggerPersistSession('update', sampleSession)
      // saveSessionIfNeeded is async — give it a tick to flush
      await Promise.resolve()
      await Promise.resolve()

      expect(await gateway.getSession()).toEqual(sampleSession)
    })

    it('clears the saved session when persistSession fires with no session', async () => {
      const { agent, gateway } = buildRepo()
      await gateway.saveSession(sampleSession)

      agent.triggerPersistSession('expired', undefined)
      await Promise.resolve()

      expect(await gateway.getSession()).toBeUndefined()
    })
  })

  describe('saveSessionIfNeeded', () => {
    it('saves when no current session exists and a new one is provided', async () => {
      const { repo, gateway } = buildRepo()
      await repo.saveSessionIfNeeded(sampleSession)
      expect(await gateway.getSession()).toEqual(sampleSession)
    })

    it('does not save when both current and new sessions are undefined', async () => {
      const { repo, gateway } = buildRepo()
      await repo.saveSessionIfNeeded(undefined)
      expect(await gateway.getSession()).toBeUndefined()
    })

    it('does not save when nothing has changed', async () => {
      const { repo, gateway } = buildRepo()
      await gateway.saveSession(sampleSession)
      const saveSpy = vi.spyOn(gateway, 'saveSession')

      await repo.saveSessionIfNeeded({ ...sampleSession })

      expect(saveSpy).not.toHaveBeenCalled()
    })

    it('saves when at least one field differs', async () => {
      const { repo, gateway } = buildRepo()
      await gateway.saveSession(sampleSession)

      const next = { ...sampleSession, accessJwt: 'new-access' }
      await repo.saveSessionIfNeeded(next)

      expect(await gateway.getSession()).toEqual(next)
    })
  })

  describe('signIn', () => {
    it('logs in and persists the returned session', async () => {
      const { repo, agent, gateway } = buildRepo((a) => {
        a.login.mockResolvedValue({
          success: true,
          data: { ...sampleSession, active: undefined },
        })
      })

      await repo.signIn({
        identifier: 'tester.bsky.social',
        password: 'pw',
      })

      expect(agent.login).toHaveBeenCalledWith({
        identifier: 'tester.bsky.social',
        password: 'pw',
      })
      expect(await gateway.getSession()).toEqual({
        ...sampleSession,
        active: true,
      })
    })

    it('does not save when the login response is not successful', async () => {
      const { repo, gateway } = buildRepo((a) => {
        a.login.mockResolvedValue({ success: false, data: undefined })
      })

      await repo.signIn({ identifier: 'x', password: 'y' })

      expect(await gateway.getSession()).toBeUndefined()
    })
  })

  describe('signOut', () => {
    it('logs out the agent and clears the saved session', async () => {
      const { repo, agent, gateway } = buildRepo()
      await gateway.saveSession(sampleSession)

      await repo.signOut()

      expect(agent.logout).toHaveBeenCalled()
      expect(await gateway.getSession()).toBeUndefined()
    })
  })

  describe('resumeSession', () => {
    it('resumes the saved session via the agent', async () => {
      const { repo, agent, gateway } = buildRepo()
      await gateway.saveSession(sampleSession)

      await repo.resumeSession()

      expect(agent.resumeSession).toHaveBeenCalledWith(sampleSession)
    })

    it('does nothing when no session is saved', async () => {
      const { repo, agent } = buildRepo()
      await repo.resumeSession()
      expect(agent.resumeSession).not.toHaveBeenCalled()
    })
  })

  describe('hasSession', () => {
    it('reflects the underlying agent state', () => {
      const { repo, agent } = buildRepo()
      expect(repo.hasSession()).toBe(false)
      agent.hasSession = true
      expect(repo.hasSession()).toBe(true)
    })
  })

  describe('getProfile', () => {
    it('returns undefined when there is no saved session', async () => {
      const { repo, agent } = buildRepo()
      expect(await repo.getProfile()).toBeUndefined()
      expect(agent.getProfile).not.toHaveBeenCalled()
    })

    it('asks the agent for the profile of the saved session DID', async () => {
      const profile = { did: sampleSession.did, handle: sampleSession.handle }
      const { repo, agent, gateway } = buildRepo((a) => {
        a.getProfile.mockResolvedValue({
          data: profile as AppBskyActorDefs.ProfileViewDetailed,
        })
      })
      await gateway.saveSession(sampleSession)

      const result = await repo.getProfile()

      expect(agent.getProfile).toHaveBeenCalledWith({
        actor: sampleSession.did,
      })
      expect(result).toEqual(profile)
    })
  })

  describe('createPost', () => {
    it('posts text without an embed when no link meta is provided', async () => {
      const { repo, agent } = buildRepo()

      await repo.createPost('hello')

      expect(agent.post).toHaveBeenCalledTimes(1)
      const args = agent.post.mock.calls[0][0]
      expect(args.text).toBe('hello')
      expect(args.embed).toBeUndefined()
    })

    it('attaches an external embed when link meta is provided', async () => {
      const { repo, agent } = buildRepo()

      await repo.createPost('hello', {
        uri: 'https://example.com',
        title: 'Example',
        description: '',
      })

      expect(agent.post).toHaveBeenCalledTimes(1)
      const args = agent.post.mock.calls[0][0]
      expect(args.embed).toEqual({
        $type: 'app.bsky.embed.external',
        external: {
          uri: 'https://example.com',
          title: 'Example',
          description: '',
        },
      })
    })
  })
})
