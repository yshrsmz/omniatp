import { ConfigLocalGateway } from './ConfigLocalGateway'

export interface AppPreferencesRepository {
  getCopyToClipboardOnPost(): Promise<boolean>
  setCopyToClipboardOnPost(value: boolean): Promise<void>
}

export class DefaultAppPreferencesRepository
  implements AppPreferencesRepository
{
  constructor(readonly localGateway: ConfigLocalGateway) {}

  getCopyToClipboardOnPost(): Promise<boolean> {
    return this.localGateway.getCopyToClipboardOnPost()
  }

  setCopyToClipboardOnPost(value: boolean): Promise<void> {
    return this.localGateway.saveCopyToClipboardOnPost(value)
  }
}
