import { BskyRepository } from '../data/BskyRepository'
import { PostTemplateRepository } from '../data/PostTemplateRepository'
import { AppPreferencesRepository } from '../data/AppPreferencesRepository'
import { ChromeDelegate } from '../platform/ChromeDelegate'
import { DataModule } from './DataModule'
import { PlatformModule } from './PlatformModule'
import { getOrCreate } from './helper'

export interface OptionsComponent {
  bskyRepository(): BskyRepository
  postTemplateRepository(): PostTemplateRepository
  appPreferencesRepository(): AppPreferencesRepository
  chromeDelegate(): ChromeDelegate
}

export class DefaultOptionsComponent implements OptionsComponent {
  private _bskyRepository?: BskyRepository
  private _postTemplateRepository?: PostTemplateRepository
  private _appPreferencesRepository?: AppPreferencesRepository

  constructor(
    readonly dataModule: DataModule,
    readonly platformModule: PlatformModule
  ) {}

  bskyRepository(): BskyRepository {
    return getOrCreate(
      this._bskyRepository,
      () =>
        this.dataModule.bskyRepository(this.platformModule.storageDelegate()),
      (v) => (this._bskyRepository = v)
    )
  }

  postTemplateRepository(): PostTemplateRepository {
    return getOrCreate(
      this._postTemplateRepository,
      () =>
        this.dataModule.postTemplateRepository(
          this.platformModule.storageDelegate()
        ),
      (v) => (this._postTemplateRepository = v)
    )
  }

  appPreferencesRepository(): AppPreferencesRepository {
    return getOrCreate(
      this._appPreferencesRepository,
      () =>
        this.dataModule.appPreferencesRepository(
          this.platformModule.storageDelegate()
        ),
      (v) => (this._appPreferencesRepository = v)
    )
  }

  chromeDelegate(): ChromeDelegate {
    return this.platformModule.chromeDelegate()
  }
}
