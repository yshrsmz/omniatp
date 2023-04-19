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
  return new DefaultBackgroundComponent(
    new DefaultDataModule(),
    new DefaultPlatformModule(chrome)
  )
}

export const createOptionsComponent = (chrome: Chrome): OptionsComponent => {
  return new DefaultOptionsComponent(
    new DefaultDataModule(),
    new DefaultPlatformModule(chrome)
  )
}
