import { OmniATP } from '../background/OmniATP'
import { Options, Share, SubCommand, Version } from '../background/SubCommands'
import { BskyRepository } from '../data/BskyRepository'
import { PostTemplateRepository } from '../data/PostTemplateRepository'
import { ChromeDelegate } from '../platform/ChromeDelegate'
import { DataModule } from './DataModule'
import { PlatformModule } from './PlatformModule'
import { getOrCreate } from './helper'

export interface OptionsComponent {
  bskyRepository(): BskyRepository
  postTemplateRepository(): PostTemplateRepository
  chromeDelegate(): ChromeDelegate
}

export class DefaultOptionsComponent implements OptionsComponent {
  private _bskyRepository?: BskyRepository
  private _postTemplateRepository?: PostTemplateRepository

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

  chromeDelegate(): ChromeDelegate {
    return this.platformModule.chromeDelegate()
  }
}
