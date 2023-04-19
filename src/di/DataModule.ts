import { ChromeStorageDelegate } from '../platform/ChromeStorageDelegate'
import { Clock, DefaultClock } from '../Clock'
import {
  ConfigLocalGateway,
  DefaultConfigLocalGateway,
} from '../data/ConfigLocalGateway'
import { BskyRepository, DefaultBskyRepository } from '../data/BskyRepository'
import { getOrCreate } from './helper'
import { AtpSessionData, AtpSessionEvent, BskyAgent } from '@atproto/api'
import {
  DefaultPostTemplateRepository,
  PostTemplateRepository,
} from '../data/PostTemplateRepository'

export interface DataModule {
  clock(): Clock
  bskyAgent(storage: ChromeStorageDelegate): BskyAgent
  configLocalGateway(storage: ChromeStorageDelegate): ConfigLocalGateway
  bskyRepository(storage: ChromeStorageDelegate): BskyRepository
  postTemplateRepository(storage: ChromeStorageDelegate): PostTemplateRepository
}

export class DefaultDataModule implements DataModule {
  private _clock?: Clock
  private _bskAgent?: BskyAgent
  private _configLocalGateway?: ConfigLocalGateway
  private _bskyRepository?: BskyRepository
  private _postTemplateRepository?: PostTemplateRepository

  clock(): Clock {
    return getOrCreate(
      this._clock,
      () => new DefaultClock(),
      (v) => (this._clock = v)
    )
  }

  // TODO: find a way to reset BskyAgent so that we can swap service
  // maybe create a wrapper?
  bskyAgent(storage: ChromeStorageDelegate): BskyAgent {
    return getOrCreate(
      this._bskAgent,
      () =>
        new BskyAgent({
          service: 'https://bsky.social',
          persistSession: (
            event: AtpSessionEvent,
            session?: AtpSessionData
          ) => {
            console.log('persistSession', event, session)
            if (session) {
              this.configLocalGateway(storage).saveSession(session)
            }
          },
        }),
      (v) => (this._bskAgent = v)
    )
  }

  configLocalGateway(storage: ChromeStorageDelegate): ConfigLocalGateway {
    return getOrCreate(
      this._configLocalGateway,
      () => new DefaultConfigLocalGateway(storage),
      (v) => (this._configLocalGateway = v)
    )
  }

  bskyRepository(storage: ChromeStorageDelegate): BskyRepository {
    return getOrCreate(
      this._bskyRepository,
      () => new DefaultBskyRepository(this.configLocalGateway(storage)),
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
}
