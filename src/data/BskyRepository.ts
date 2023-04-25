import {
  AtpSessionData,
  AtpSessionEvent,
  BskyAgent,
  RichText,
  AppBskyActorDefs,
} from '@atproto/api'
import { LoginCredential } from './model/LoginCredential'
import { ConfigLocalGateway } from './ConfigLocalGateway'

export interface BskyRepository {
  signIn(credential: LoginCredential): Promise<void>
  signOut(): Promise<void>

  resumeSession(): Promise<void>
  hasSession(): boolean
  getSession(): Promise<AtpSessionData | undefined>
  onSessionUpdate(
    listner: (newValue?: AtpSessionData, oldValue?: AtpSessionData) => void
  ): void

  getProfile(): Promise<AppBskyActorDefs.ProfileView | undefined>

  createRichText(text: string): Promise<RichText>
  createPost(text: string): Promise<void>
}

export class DefaultBskyRepository implements BskyRepository {
  readonly agent: BskyAgent
  readonly localGateway: ConfigLocalGateway

  constructor(localGateway: ConfigLocalGateway) {
    this.localGateway = localGateway
    this.agent = new BskyAgent({
      service: 'https://bsky.social',
      persistSession: (event: AtpSessionEvent, session?: AtpSessionData) => {
        console.log('persistSession', event, session)
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
      // new session exists, and saved session exists
      const entries = Object.entries(session) as Array<
        [keyof AtpSessionData, AtpSessionData[keyof AtpSessionData]]
      >
      // some fields are different
      shouldSave = entries.some(([key, value]) => current[key] !== value)
    } else {
      // either or both sessions are undefined
      shouldSave = !!session
    }

    console.log('saveSessionIfNeeded: ', shouldSave, session)
    if (shouldSave && session) {
      await this.localGateway.saveSession(session)
    }
  }

  async signIn(credential: LoginCredential): Promise<void> {
    const res = await this.agent.login({
      identifier: credential.identifier,
      password: credential.password,
    })

    console.log('login', res)
    // credential should already be saved via persistSession callback,
    // but should be saved here as well so that subsequent call can safely access bsky API
    if (res.success && res.data) {
      await this.saveSessionIfNeeded(res.data)
    }
  }

  async signOut(): Promise<void> {
    this.agent.session = undefined
    await this.localGateway.clearSession()
  }

  async resumeSession(): Promise<void> {
    const session = await this.localGateway.getSession()
    if (session) {
      const res = await this.agent.resumeSession(session)
      console.log('resumeSession', res)
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

  async getProfile(): Promise<AppBskyActorDefs.ProfileView | undefined> {
    const session = await this.localGateway.getSession()
    console.log('getProfile', session)
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

  async createPost(text: string): Promise<void> {
    const result = await this.createRichText(text, true)
    await this.agent.post({
      text: result.text,
      facets: result.facets,
    })
  }
}
