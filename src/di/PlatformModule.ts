import {
  ChromeDelegate,
  DefaultChromeDelegate,
} from '../platform/ChromeDelegate'
import {
  ChromeStorageDelegate,
  DefaultChromeStorageDelegate,
} from '../platform/ChromeStorageDelegate'
import { Chrome } from '../utils'
import { getOrCreate } from './helper'

export interface PlatformModule {
  storageDelegate(): ChromeStorageDelegate
  chromeDelegate(): ChromeDelegate
}

export class DefaultPlatformModule implements PlatformModule {
  private _storageDelegate?: ChromeStorageDelegate
  private _chromeDelegate?: ChromeDelegate

  constructor(readonly chrome: Chrome) {}

  storageDelegate(): ChromeStorageDelegate {
    return getOrCreate(
      this._storageDelegate,
      () => new DefaultChromeStorageDelegate(this.chrome.storage.local),
      (v) => (this._storageDelegate = v)
    )
  }

  chromeDelegate(): ChromeDelegate {
    return getOrCreate(
      this._chromeDelegate,
      () => new DefaultChromeDelegate(this.chrome),
      (v) => (this._chromeDelegate = v)
    )
  }
}
