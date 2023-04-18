import {
  AtpSessionData,
  AtpSessionEvent,
  BskyAgent,
  RichText,
} from '@atproto/api'
import { XRPCError } from '@atproto/xrpc'
import { LoginCredential } from './model/LoginCredential'
import { BskyLocalGateway } from './BskyLocalGateway'
import { ResponseError } from './model/Errors'
import { Result } from './model/Result'

export interface BskyRepository {
  login(credential: LoginCredential): Promise<void>
  resumeSession(): Promise<void>
  createPost(text: string): Promise<void>
}

export class DefaultBskyRepository implements BskyRepository {
  readonly agent: BskyAgent
  readonly localGateway: BskyLocalGateway

  constructor(localGateway: BskyLocalGateway) {
    this.localGateway = localGateway
    this.agent = new BskyAgent({
      service: 'https://bsky.social',
      persistSession: (event: AtpSessionEvent, session?: AtpSessionData) => {
        console.log('persistSession', event, session)
        if (session) {
          this.localGateway.saveSession(session)
        }
      },
    })
  }

  async login(credential: LoginCredential): Promise<void> {
    const res = await this.agent.login({
      identifier: credential.identifier,
      password: credential.password,
    })

    console.log('login', res)
    if (res.success && res.data) {
      await this.localGateway.saveSession(res.data)
    }
  }

  async resumeSession(): Promise<void> {
    const session = await this.localGateway.getSession()
    if (session) {
      const res = await this.agent.resumeSession(session)
      console.log('resumeSession', res)
    }
  }

  async createPost(text: string): Promise<void> {
    const result = new RichText({ text })
    await result.detectFacets(this.agent)
    await this.agent.post({
      text: result.text,
      facets: result.facets,
    })
  }
}
