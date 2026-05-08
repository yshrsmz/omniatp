import { BskyRepository } from '../data/BskyRepository'
import { PostTemplateRepository } from '../data/PostTemplateRepository'
import { AppPreferencesRepository } from '../data/AppPreferencesRepository'
import { AmazonAssociateRepository } from '../data/AmazonAssociateRepository'
import { ChromeDelegate } from '../platform/ChromeDelegate'
import { DataModule } from './DataModule'
import { PlatformModule } from './PlatformModule'
import { getOrCreate } from './helper'

export interface OptionsComponent {
  bskyRepository(): BskyRepository
  postTemplateRepository(): PostTemplateRepository
  appPreferencesRepository(): AppPreferencesRepository
  amazonAssociateRepository(): AmazonAssociateRepository
  chromeDelegate(): ChromeDelegate
}

export class DefaultOptionsComponent implements OptionsComponent {
  private _bskyRepository?: BskyRepository
  private _postTemplateRepository?: PostTemplateRepository
  private _appPreferencesRepository?: AppPreferencesRepository
  private _amazonAssociateRepository?: AmazonAssociateRepository

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

  amazonAssociateRepository(): AmazonAssociateRepository {
    return getOrCreate(
      this._amazonAssociateRepository,
      () =>
        this.dataModule.amazonAssociateRepository(
          this.platformModule.storageDelegate()
        ),
      (v) => (this._amazonAssociateRepository = v)
    )
  }

  chromeDelegate(): ChromeDelegate {
    return this.platformModule.chromeDelegate()
  }
}
