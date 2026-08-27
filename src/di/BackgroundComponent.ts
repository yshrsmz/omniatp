import { OmniATP } from '../background/OmniATP'
import type { SubCommand } from '../background/SubCommands'
import { Options, Share, Version } from '../background/SubCommands'
import type { ChromeDelegate } from '../platform/ChromeDelegate'
import type { DataModule } from './DataModule'
import type { PlatformModule } from './PlatformModule'
import { getOrCreate } from './helper'

export interface BackgroundComponent {
  omniatp(): OmniATP
  chromeDelegate(): ChromeDelegate
}

export class DefaultBackgroundComponent implements BackgroundComponent {
  private _subCommands?: SubCommand[]
  private _omniatp?: OmniATP

  constructor(
    private readonly dataModule: DataModule,
    private readonly platformModule: PlatformModule
  ) {}

  subCommands(): SubCommand[] {
    return getOrCreate(
      this._subCommands,
      () => [
        new Options(),
        new Version(),
        new Share(
          this.dataModule.postTemplateRepository(
            this.platformModule.storageDelegate()
          ),
          this.dataModule.amazonAssociateRepository(
            this.platformModule.storageDelegate()
          )
        ),
      ],
      (v) => (this._subCommands = v)
    )
  }

  chromeDelegate(): ChromeDelegate {
    return this.platformModule.chromeDelegate()
  }

  omniatp(): OmniATP {
    return getOrCreate(
      this._omniatp,
      () =>
        new OmniATP(
          this.dataModule.clock(),
          this.platformModule.chromeDelegate(),
          this.dataModule.bskyRepository(this.platformModule.storageDelegate()),
          this.dataModule.appPreferencesRepository(
            this.platformModule.storageDelegate()
          ),
          this.subCommands(),
          this.platformModule.logger().withTag('OmniATP')
        ),
      (v) => (this._omniatp = v)
    )
  }
}
