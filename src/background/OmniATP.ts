import { ChromeDelegate } from '../ChromeDelegate'
import { Clock } from '../Clock'

export class OmniATP {
  constructor(readonly clock: Clock) {}

  async initialize() {}

  async handleInputChengedEvent(text: string, chrome: ChromeDelegate) {}

  async handleInputEnteredEvent(text: string, chrome: ChromeDelegate) {}
}
