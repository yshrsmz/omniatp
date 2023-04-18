import {
  ChromeStorageDelegate,
  DefaultChromeStorageDelegate,
} from '../ChromeStorageDelegate'
import { getOrCreate } from './helper'

export interface PlatformModule {
  storageDelegate(): ChromeStorageDelegate
}

export class DefaultPlatformModule implements PlatformModule {
  private _storageDelegate?: ChromeStorageDelegate

  storageDelegate(): ChromeStorageDelegate {
    return getOrCreate(
      this._storageDelegate,
      () => new DefaultChromeStorageDelegate(chrome.storage.local),
      (v) => (this._storageDelegate = v)
    )
  }
}
