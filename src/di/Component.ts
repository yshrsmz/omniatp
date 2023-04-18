import { OmniATP } from '../background/OmniATP'
import { DataModule } from './DataModule'
import { PlatformModule } from './PlatformModule'

export class Component {
  constructor(
    private readonly dataModule: DataModule,
    private readonly platformModule: PlatformModule
  ) {}

  omniatp(): OmniATP {
    return new OmniATP(this.dataModule.clock())
  }
}
