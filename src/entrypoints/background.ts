import { createBackgroundComponent } from '../di/factory'

export default defineBackground({
  type: 'module',
  main() {
    const component = createBackgroundComponent(chrome)
    component.omniatp().initialize()

    chrome.runtime.onInstalled.addListener(async (detail) => {
      await (self as unknown as { skipWaiting(): Promise<void> }).skipWaiting()
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
  },
})
