import { AtpSessionData } from '@atproto/api'
import { ChromeStorageDelegate } from '../platform/ChromeStorageDelegate'

export interface ConfigLocalGateway {
  getPostPrefix(): Promise<string>
  savePostPrefix(prefix: string): Promise<void>
  clearPostPrefix(): Promise<void>

  saveSession(session: AtpSessionData): Promise<void>
  getSession(): Promise<AtpSessionData | undefined>
  clearSession(): Promise<void>
  onSessionUpdate(
    listener: (newValue?: AtpSessionData, oldValue?: AtpSessionData) => void
  ): void
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

  async saveSession(session: AtpSessionData): Promise<void> {
    console.log('saveSession', session)
    return this.storage.save({ session })
  }

  async getSession(): Promise<AtpSessionData | undefined> {
    const { session } = await this.storage.get({
      session: null as AtpSessionData | null,
    })
    return session ?? undefined
  }

  async clearSession(): Promise<void> {
    console.log('clearSession')
    await this.storage.remove(['session'])
  }

  onSessionUpdate(
    listener: (newValue?: AtpSessionData, oldValue?: AtpSessionData) => void
  ) {
    this.storage.onChanged((changes) => {
      const { session } = changes
      if (session) {
        listener(
          session.newValue as AtpSessionData | undefined,
          session.oldValue as AtpSessionData | undefined
        )
      }
    })
  }
}
