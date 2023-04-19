import { createBackgroundComponent } from '../di/factory'

declare const self: ServiceWorkerGlobalScope
export {}

const component = createBackgroundComponent(chrome)
component.omniatp().initialize()

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

  component.omniatp().handleInputChengedEvent(text)
})

chrome.omnibox.onInputEntered.addListener((text) => {
  console.log('onInputEntered', text)

  component.omniatp().handleInputEnteredEvent(text)
})
