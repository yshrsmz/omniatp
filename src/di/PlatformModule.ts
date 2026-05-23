import {
  ChromeDelegate,
  DefaultChromeDelegate,
} from '../platform/ChromeDelegate'
import {
  ChromeStorageDelegate,
  DefaultChromeStorageDelegate,
} from '../platform/ChromeStorageDelegate'
import { Chrome } from '../utils'
import { ConsoleLogger, Logger } from '../Logger'
import { getOrCreate } from './helper'

export interface PlatformModule {
  storageDelegate(): ChromeStorageDelegate
  chromeDelegate(): ChromeDelegate
  logger(): Logger
}

export class DefaultPlatformModule implements PlatformModule {
  private _storageDelegate?: ChromeStorageDelegate
  private _chromeDelegate?: ChromeDelegate
  private _logger?: Logger

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
      () => new DefaultChromeDelegate(this.chrome, this.logger()),
      (v) => (this._chromeDelegate = v)
    )
  }

  logger(): Logger {
    return getOrCreate(
      this._logger,
      () => new ConsoleLogger(),
      (v) => (this._logger = v)
    )
  }
}
