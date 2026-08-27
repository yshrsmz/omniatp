import type { ChromeStorageDelegate } from '../platform/ChromeStorageDelegate'
import type { Clock } from '../Clock'
import { DefaultClock } from '../Clock'
import type { ConfigLocalGateway } from '../data/ConfigLocalGateway'
import { DefaultConfigLocalGateway } from '../data/ConfigLocalGateway'
import type { AtpAgentFactory, BskyRepository } from '../data/BskyRepository'
import { DefaultBskyRepository } from '../data/BskyRepository'
import { getOrCreate } from './helper'
import { AtpAgent } from '@atproto/api'
import type { PostTemplateRepository } from '../data/PostTemplateRepository'
import { DefaultPostTemplateRepository } from '../data/PostTemplateRepository'
import type { AppPreferencesRepository } from '../data/AppPreferencesRepository'
import { DefaultAppPreferencesRepository } from '../data/AppPreferencesRepository'
import type { AmazonAssociateRepository } from '../data/AmazonAssociateRepository'
import { DefaultAmazonAssociateRepository } from '../data/AmazonAssociateRepository'
import type { Logger } from '../Logger'

const defaultAtpAgentFactory: AtpAgentFactory = (options) =>
  new AtpAgent(options)

export interface DataModule {
  clock(): Clock
  atpAgentFactory(): AtpAgentFactory
  configLocalGateway(storage: ChromeStorageDelegate): ConfigLocalGateway
  bskyRepository(storage: ChromeStorageDelegate): BskyRepository
  postTemplateRepository(storage: ChromeStorageDelegate): PostTemplateRepository
  appPreferencesRepository(
    storage: ChromeStorageDelegate
  ): AppPreferencesRepository
  amazonAssociateRepository(
    storage: ChromeStorageDelegate
  ): AmazonAssociateRepository
}

export class DefaultDataModule implements DataModule {
  private _clock?: Clock
  private _configLocalGateway?: ConfigLocalGateway
  private _bskyRepository?: BskyRepository
  private _postTemplateRepository?: PostTemplateRepository
  private _appPreferencesRepository?: AppPreferencesRepository
  private _amazonAssociateRepository?: AmazonAssociateRepository

  constructor(private readonly logger: Logger) {}

  clock(): Clock {
    return getOrCreate(
      this._clock,
      () => new DefaultClock(),
      (v) => (this._clock = v)
    )
  }

  atpAgentFactory(): AtpAgentFactory {
    return defaultAtpAgentFactory
  }

  configLocalGateway(storage: ChromeStorageDelegate): ConfigLocalGateway {
    return getOrCreate(
      this._configLocalGateway,
      () =>
        new DefaultConfigLocalGateway(
          storage,
          this.logger.withTag('ConfigLocalGateway')
        ),
      (v) => (this._configLocalGateway = v)
    )
  }

  bskyRepository(storage: ChromeStorageDelegate): BskyRepository {
    return getOrCreate(
      this._bskyRepository,
      () =>
        new DefaultBskyRepository(
          this.configLocalGateway(storage),
          this.atpAgentFactory(),
          this.logger.withTag('BskyRepository')
        ),
      (v) => (this._bskyRepository = v)
    )
  }

  postTemplateRepository(
    storage: ChromeStorageDelegate
  ): PostTemplateRepository {
    return getOrCreate(
      this._postTemplateRepository,
      () => new DefaultPostTemplateRepository(this.configLocalGateway(storage)),
      (v) => (this._postTemplateRepository = v)
    )
  }

  appPreferencesRepository(
    storage: ChromeStorageDelegate
  ): AppPreferencesRepository {
    return getOrCreate(
      this._appPreferencesRepository,
      () =>
        new DefaultAppPreferencesRepository(this.configLocalGateway(storage)),
      (v) => (this._appPreferencesRepository = v)
    )
  }

  amazonAssociateRepository(
    storage: ChromeStorageDelegate
  ): AmazonAssociateRepository {
    return getOrCreate(
      this._amazonAssociateRepository,
      () =>
        new DefaultAmazonAssociateRepository(this.configLocalGateway(storage)),
      (v) => (this._amazonAssociateRepository = v)
    )
  }
}
