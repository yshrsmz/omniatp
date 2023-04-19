import { AtpSessionData } from '@atproto/api'
import { ChromeStorageDelegate } from '../platform/ChromeStorageDelegate'

export interface ConfigLocalGateway {
  getPostPrefix(): Promise<string>
  savePostPrefix(prefix: string): Promise<void>
  clearPostPrefix(): Promise<void>

  saveSession(session: AtpSessionData): Promise<void>
  getSession(): Promise<AtpSessionData | undefined>
}

export class DefaultConfigLocalGateway implements ConfigLocalGateway {
  constructor(readonly storage: ChromeStorageDelegate) {}

  async getPostPrefix(): Promise<string> {
    const { postPrefix } = await this.storage.get({
      postPrefix: 'NowBrowsing: ',
    })
    return postPrefix
  }

  async savePostPrefix(prefix: string): Promise<void> {
    await this.storage.save({ postPrefix: prefix })
  }

  async clearPostPrefix(): Promise<void> {
    await this.storage.remove(['postPrefix'])
  }

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
