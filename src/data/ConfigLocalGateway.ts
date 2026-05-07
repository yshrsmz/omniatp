import { AtpSessionData } from '@atproto/api'
import { ChromeStorageDelegate } from '../platform/ChromeStorageDelegate'
import { Logger } from '../Logger'

export interface ConfigLocalGateway {
  getPostPrefix(): Promise<string>
  savePostPrefix(prefix: string): Promise<void>
  clearPostPrefix(): Promise<void>

  shouldCopyToClipboardOnPost(): Promise<boolean>
  saveCopyToClipboardOnPost(value: boolean): Promise<void>

  saveSession(session: AtpSessionData): Promise<void>
  getSession(): Promise<AtpSessionData | undefined>
  clearSession(): Promise<void>
  onSessionUpdate(
    listener: (newValue?: AtpSessionData, oldValue?: AtpSessionData) => void
  ): void
}

export class DefaultConfigLocalGateway implements ConfigLocalGateway {
  constructor(
    readonly storage: ChromeStorageDelegate,
    readonly logger: Logger
  ) {}

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

  async shouldCopyToClipboardOnPost(): Promise<boolean> {
    const { copyToClipboardOnPost } = await this.storage.get({
      copyToClipboardOnPost: false,
    })
    return copyToClipboardOnPost
  }

  async saveCopyToClipboardOnPost(value: boolean): Promise<void> {
    await this.storage.save({ copyToClipboardOnPost: value })
  }

  async saveSession(session: AtpSessionData): Promise<void> {
    this.logger.log('saveSession', session)
    return this.storage.save({ session })
  }

  async getSession(): Promise<AtpSessionData | undefined> {
    const { session } = await this.storage.get({
      session: null as AtpSessionData | null,
    })
    return session ?? undefined
  }

  async clearSession(): Promise<void> {
    this.logger.log('clearSession')
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
