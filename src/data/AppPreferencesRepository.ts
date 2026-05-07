import { ConfigLocalGateway } from './ConfigLocalGateway'

export interface AppPreferencesRepository {
  shouldCopyToClipboardOnPost(): Promise<boolean>
  setCopyToClipboardOnPost(value: boolean): Promise<void>
}

export class DefaultAppPreferencesRepository
  implements AppPreferencesRepository
{
  constructor(readonly localGateway: ConfigLocalGateway) {}

  shouldCopyToClipboardOnPost(): Promise<boolean> {
    return this.localGateway.shouldCopyToClipboardOnPost()
  }

  setCopyToClipboardOnPost(value: boolean): Promise<void> {
    return this.localGateway.saveCopyToClipboardOnPost(value)
  }
}
