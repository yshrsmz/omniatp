import {
  OFFSCREEN_CLIPBOARD_TARGET,
  OffscreenClipboardMessage,
  OffscreenClipboardResponse,
  OffscreenReadyMessage,
} from './offscreen-messages'
import { Chrome, escapeText } from '../utils'
import { Logger } from '../Logger'

const OFFSCREEN_READY_TIMEOUT_MS = 2000

export interface ChromeDelegate {
  currentPage(): Promise<chrome.tabs.Tab | undefined>
  appVersion(): string
  appName(): string
  showDefaultSuggestion(message: string): void
  openNewTab(url: string, active: boolean): void
  openOptionsPage(): void
  createNotification(iconUrl: string, title: string, message: string): void
  copyToClipboard(text: string): Promise<void>
  prewarmOffscreen(): Promise<void>
  storeUrl(): string
  onStorageChanged(
    listener: (changes: { [key: string]: chrome.storage.StorageChange }) => void
  ): void
}

export class DefaultChromeDelegate implements ChromeDelegate {
  private readonly logger: Logger

  constructor(
    private readonly chrome: Chrome,
    logger: Logger
  ) {
    this.logger = logger.withTag('ChromeDelegate')
  }

  async currentPage(): Promise<chrome.tabs.Tab | undefined> {
    return new Promise((resolve) => {
      this.chrome.tabs.query({ active: true, currentWindow: true }, (tabs) => {
        if (tabs.length > 0) {
          resolve(tabs[0])
        } else {
          resolve(undefined)
        }
      })
    })
  }

  appVersion(): string {
    const manifest = this.chrome.runtime.getManifest()
    return manifest.version_name ?? manifest.version
  }

  appName(): string {
    const manifest = this.chrome.runtime.getManifest()
    return manifest.name
  }

  showDefaultSuggestion(message: string): void {
    this.chrome.omnibox.setDefaultSuggestion({
      description: escapeText(message),
    })
  }

  openNewTab(url: string, active: boolean): void {
    this.chrome.tabs.create({ url, active })
  }

  openOptionsPage(): void {
    this.chrome.runtime.openOptionsPage()
  }

  createNotification(iconUrl: string, title: string, message: string): void {
    this.chrome.notifications.create(
      'OmniATP',
      {
        type: 'basic',
        iconUrl,
        title,
        message,
      },
      (id) => {
        setTimeout(() => {
          this.chrome.notifications.clear(id)
        }, 3000)
      }
    )
  }

  async prewarmOffscreen(): Promise<void> {
    const offscreen = this.chrome.offscreen
    if (!offscreen) return
    try {
      if (await offscreen.hasDocument()) return
      // Create + close round-trip so the offscreen HTML and JS chunk land
      // in disk cache / V8 code cache. The next user-initiated copy then
      // pays a warm createDocument and stays within the ~5s transient
      // activation window — without this, cold path execCommand('copy')
      // silently no-ops because the user gesture has expired.
      await offscreen.createDocument({
        url: this.chrome.runtime.getURL('offscreen.html'),
        reasons: [offscreen.Reason.CLIPBOARD],
        justification: 'Pre-warm clipboard offscreen for fast first copy.',
      })
      await offscreen.closeDocument()
    } catch (e) {
      this.logger.warn('Pre-warm offscreen failed', e)
    }
  }

  async copyToClipboard(text: string): Promise<void> {
    await this.ensureOffscreenDocument()

    const message: OffscreenClipboardMessage = {
      target: OFFSCREEN_CLIPBOARD_TARGET,
      type: 'copy',
      text,
    }
    const response = (await this.chrome.runtime.sendMessage(message)) as
      | OffscreenClipboardResponse
      | undefined

    if (!response?.ok) {
      throw new Error(response?.error ?? 'Clipboard copy failed')
    }
  }

  private async ensureOffscreenDocument(): Promise<void> {
    const offscreen = this.chrome.offscreen
    if (!offscreen) {
      throw new Error('chrome.offscreen API is not available')
    }

    // After a service-worker restart, hasDocument() may still report an
    // offscreen document from the previous session whose onMessage listener
    // is no longer registered — sendMessage() then silently has no receiver.
    // Always recreate so the listener is fresh.
    if (await offscreen.hasDocument()) {
      await offscreen.closeDocument()
    }

    // Attach the ready-listener BEFORE createDocument so we can't miss the
    // ping on the warm/fast path. createDocument resolves on initial page
    // load, not on module-script execution, so the offscreen listener may
    // not be registered yet when createDocument resolves.
    const ready = this.waitForOffscreenReady(OFFSCREEN_READY_TIMEOUT_MS)

    await offscreen.createDocument({
      url: this.chrome.runtime.getURL('offscreen.html'),
      reasons: [offscreen.Reason.CLIPBOARD],
      justification: 'Write a posted Bluesky message to the clipboard.',
    })

    await ready
  }

  private waitForOffscreenReady(timeoutMs: number): Promise<void> {
    return new Promise((resolve) => {
      const onMessage = (msg: unknown): void => {
        const m = msg as Partial<OffscreenReadyMessage>
        if (m?.target === OFFSCREEN_CLIPBOARD_TARGET && m.type === 'ready') {
          this.chrome.runtime.onMessage.removeListener(onMessage)
          clearTimeout(timer)
          resolve()
        }
      }
      const timer = setTimeout(() => {
        this.chrome.runtime.onMessage.removeListener(onMessage)
        this.logger.warn(
          'Offscreen ready signal timed out after',
          timeoutMs,
          'ms; attempting copy anyway'
        )
        resolve()
      }, timeoutMs)
      this.chrome.runtime.onMessage.addListener(onMessage)
    })
  }

  storeUrl(): string {
    return `https://chrome.google.com/webstore/detail/${this.chrome.runtime.id}`
  }

  onStorageChanged(
    listener: (changes: { [key: string]: chrome.storage.StorageChange }) => void
  ): void {
    this.chrome.storage.local.onChanged.addListener(listener)
  }
}
