import { ChromeStorageDelegate } from '../ChromeStorageDelegate'
import { Clock, DefaultClock } from '../Clock'
import {
  BskyLocalGateway,
  DefaultBskyLocalGateway,
} from '../data/BskyLocalGateway'
import { BskyRepository, DefaultBskyRepository } from '../data/BskyRepository'
import { getOrCreate } from './helper'

export interface DataModule {
  clock(): Clock
  bskyLocalGateway(storage: ChromeStorageDelegate): BskyLocalGateway
  bskyRepository(storage: ChromeStorageDelegate): BskyRepository
}

export class DefaultDataModule implements DataModule {
  private _clock?: Clock
  private _bskyLocalGateway?: BskyLocalGateway
  private _bskyRepository?: BskyRepository

  clock(): Clock {
    return getOrCreate(
      this._clock,
      () => new DefaultClock(),
      (v) => (this._clock = v)
    )
  }

  bskyLocalGateway(storage: ChromeStorageDelegate): BskyLocalGateway {
    return getOrCreate(
      this._bskyLocalGateway,
      () => new DefaultBskyLocalGateway(storage),
      (v) => (this._bskyLocalGateway = v)
    )
  }

  bskyRepository(storage: ChromeStorageDelegate): BskyRepository {
    return getOrCreate(
      this._bskyRepository,
      () => new DefaultBskyRepository(this.bskyLocalGateway(storage)),
      (v) => (this._bskyRepository = v)
    )
  }
}
