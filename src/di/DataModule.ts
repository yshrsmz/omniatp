import { ChromeStorageDelegate } from '../platform/ChromeStorageDelegate'
import { Clock, DefaultClock } from '../Clock'
import {
  ConfigLocalGateway,
  DefaultConfigLocalGateway,
} from '../data/ConfigLocalGateway'
import {
  AtpAgentFactory,
  BskyRepository,
  DefaultBskyRepository,
} from '../data/BskyRepository'
import { getOrCreate } from './helper'
import { AtpAgent } from '@atproto/api'
import {
  DefaultPostTemplateRepository,
  PostTemplateRepository,
} from '../data/PostTemplateRepository'
import {
  AppPreferencesRepository,
  DefaultAppPreferencesRepository,
} from '../data/AppPreferencesRepository'
import { Logger } from '../Logger'

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
}

export class DefaultDataModule implements DataModule {
  private _clock?: Clock
  private _configLocalGateway?: ConfigLocalGateway
  private _bskyRepository?: BskyRepository
  private _postTemplateRepository?: PostTemplateRepository
  private _appPreferencesRepository?: AppPreferencesRepository

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
}
