import {
  AtpSessionData,
  AtpSessionEvent,
  AtpAgent,
  AtpAgentOptions,
  RichText,
  AppBskyActorDefs,
  AppBskyEmbedExternal,
  $Typed,
} from '@atproto/api'
import { LoginCredential } from './model/LoginCredential'
import { ConfigLocalGateway } from './ConfigLocalGateway'
import { LinkMeta } from './model/LinkMeta'
import { BskyConfig } from '../Configs'
import { Logger } from '../Logger'

export interface BskyRepository {
  signIn(credential: LoginCredential): Promise<void>
  signOut(): Promise<void>

  resumeSession(): Promise<void>
  hasSession(): boolean
  getSession(): Promise<AtpSessionData | undefined>
  onSessionUpdate(
    listner: (newValue?: AtpSessionData, oldValue?: AtpSessionData) => void
  ): void

  getProfile(): Promise<AppBskyActorDefs.ProfileViewDetailed | undefined>

  createRichText(text: string): Promise<RichText>
  createPost(text: string, meta?: LinkMeta): Promise<void>
}

export type AtpAgentFactory = (options: AtpAgentOptions) => AtpAgent

export class DefaultBskyRepository implements BskyRepository {
  readonly agent: AtpAgent

  constructor(
    public readonly localGateway: ConfigLocalGateway,
    agentFactory: AtpAgentFactory,
    public readonly logger: Logger
  ) {
    this.agent = agentFactory({
      service: BskyConfig.service,
      persistSession: (event: AtpSessionEvent, session?: AtpSessionData) => {
        this.logger.log('persistSession', event, session)
        if (session && event !== 'create') {
          this.saveSessionIfNeeded(session)
          return
        }

        if (!session) {
          this.localGateway.clearSession()
        }
      },
    })
  }

  /**
   * |                    | new undefined | new exists |
   * |--------------------|---------------|------------|
   * | current: undefined |       x       |     o      |
   * | current: exits     |       o       |     A      |
   *
   * diffrent: save
   * same: do nothing
   */
  async saveSessionIfNeeded(session: AtpSessionData | undefined) {
    const current = await this.getSession()

    let shouldSave
    if (session && current) {
      const entries = Object.entries(session) as Array<
        [keyof AtpSessionData, AtpSessionData[keyof AtpSessionData]]
      >
      shouldSave = entries.some(([key, value]) => current[key] !== value)
    } else {
      shouldSave = !!session
    }

    this.logger.log('saveSessionIfNeeded:', shouldSave, session)
    if (shouldSave && session) {
      await this.localGateway.saveSession(session)
    }
  }

  async signIn(credential: LoginCredential): Promise<void> {
    const res = await this.agent.login({
      identifier: credential.identifier,
      password: credential.password,
    })

    this.logger.log('login', res)
    // credential should already be saved via persistSession callback,
    // but should be saved here as well so that subsequent call can safely access bsky API
    if (res.success && res.data) {
      const sessionData: AtpSessionData = {
        ...res.data,
        active: res.data.active ?? true,
      }
      await this.saveSessionIfNeeded(sessionData)
    }
  }

  async signOut(): Promise<void> {
    await this.agent.logout()
    await this.localGateway.clearSession()
  }

  async resumeSession(): Promise<void> {
    const session = await this.localGateway.getSession()
    if (session) {
      const res = await this.agent.resumeSession(session)
      this.logger.log('resumeSession', res)
    }
  }

  hasSession(): boolean {
    return this.agent.hasSession
  }

  getSession(): Promise<AtpSessionData | undefined> {
    return this.localGateway.getSession()
  }

  onSessionUpdate(
    listner: (
      newValue?: AtpSessionData | undefined,
      oldValue?: AtpSessionData | undefined
    ) => void
  ): void {
    this.localGateway.onSessionUpdate(listner)
  }

  async getProfile(): Promise<
    AppBskyActorDefs.ProfileViewDetailed | undefined
  > {
    const session = await this.localGateway.getSession()
    this.logger.log('getProfile', session)
    if (session) {
      const res = await this.agent.getProfile({ actor: session.did })
      return res.data
    } else {
      return undefined
    }
  }

  async createRichText(text: string, detectFacets = false): Promise<RichText> {
    const result = new RichText({ text })
    if (detectFacets) {
      await result.detectFacets(this.agent)
    }
    return result
  }

  async createPost(text: string, meta?: LinkMeta): Promise<void> {
    const result = await this.createRichText(text, true)

    let embed: $Typed<AppBskyEmbedExternal.Main> | undefined = undefined
    if (meta) {
      embed = {
        $type: 'app.bsky.embed.external',
        external: {
          ...meta,
        },
      }
    }

    await this.agent.post({
      text: result.text,
      facets: result.facets,
      embed,
    })
  }
}
