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
        if (session) {
          this.localGateway.saveSession(session)
        } else {
          this.localGateway.clearSession()
        }
      },
    })
  }

  async signIn(credential: LoginCredential): Promise<void> {
    const res = await this.agent.login({
      identifier: credential.identifier,
      password: credential.password,
    })

    console.log('login', res)
    if (res.success && res.data) {
      await this.localGateway.saveSession(res.data)
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

  async getProfile(): Promise<AppBskyActorDefs.ProfileView | undefined> {
    const session = await this.localGateway.getSession()
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
