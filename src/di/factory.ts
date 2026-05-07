import { Chrome } from '../utils'
import {
  BackgroundComponent,
  DefaultBackgroundComponent,
} from './BackgroundComponent'
import { DefaultDataModule } from './DataModule'
import { DefaultOptionsComponent, OptionsComponent } from './OptionsComponent'
import { DefaultPlatformModule } from './PlatformModule'

export const createBackgroundComponent = (
  chrome: Chrome
): BackgroundComponent => {
  const platformModule = new DefaultPlatformModule(chrome)
  return new DefaultBackgroundComponent(
    new DefaultDataModule(platformModule.logger()),
    platformModule
  )
}

export const createOptionsComponent = (chrome: Chrome): OptionsComponent => {
  const platformModule = new DefaultPlatformModule(chrome)
  return new DefaultOptionsComponent(
    new DefaultDataModule(platformModule.logger()),
    platformModule
  )
}
