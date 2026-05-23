import { createBackgroundComponent } from '../di/factory'

export default defineBackground({
  type: 'module',
  main() {
    const component = createBackgroundComponent(chrome)
    component.omniatp().initialize()

    // Warm the offscreen-document path so the first copy after SW wake-up
    // stays within the user-gesture window. Cold createDocument + module
    // load can exceed the ~5s transient activation, after which
    // execCommand('copy') silently no-ops and the post appears to copy
    // but nothing lands on the clipboard.
    void component.chromeDelegate().prewarmOffscreen()

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
