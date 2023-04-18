import { AtpSessionData } from '@atproto/api'
import { ChromeStorageDelegate } from '../ChromeStorageDelegate'

export interface BskyLocalGateway {
  saveSession(session: AtpSessionData): Promise<void>
  getSession(): Promise<AtpSessionData | undefined>
}

export class DefaultBskyLocalGateway implements BskyLocalGateway {
  constructor(readonly storage: ChromeStorageDelegate) {}

  saveSession(session: AtpSessionData): Promise<void> {
    return this.storage.save({ session })
  }

  async getSession(): Promise<AtpSessionData | undefined> {
    const { session } = await this.storage.get({
      session: null as AtpSessionData | null,
    })
    return session ?? undefined
  }
}
