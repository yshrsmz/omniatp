import { DefaultChromeDelegate } from '../ChromeDelegate'
import { DefaultClock } from '../Clock'
import { OmniATP } from './OmniATP'

declare const self: ServiceWorkerGlobalScope
export {}

const omniatp = new OmniATP(new DefaultClock())

chrome.runtime.onInstalled.addListener(async (detail) => {
  await self.skipWaiting()
  await new Promise((resolve) => setTimeout(resolve, 1000))

  console.log('onInstalled', detail)

  if (detail.reason === chrome.runtime.OnInstalledReason.INSTALL) {
    chrome.runtime.openOptionsPage()
  }
})

chrome.omnibox.onInputChanged.addListener((text) => {
  console.log('onInputChanged', text)

  omniatp.handleInputChengedEvent(text, new DefaultChromeDelegate(chrome))
})

chrome.omnibox.onInputEntered.addListener((text) => {
  console.log('onInputEntered', text)

  omniatp.handleInputEnteredEvent(text, new DefaultChromeDelegate(chrome))
})
