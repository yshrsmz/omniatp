import type { Chrome } from '../utils'
import type { BackgroundComponent } from './BackgroundComponent'
import { DefaultBackgroundComponent } from './BackgroundComponent'
import { DefaultDataModule } from './DataModule'
import type { OptionsComponent } from './OptionsComponent'
import { DefaultOptionsComponent } from './OptionsComponent'
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
