import {
  OFFSCREEN_CLIPBOARD_TARGET,
  OffscreenClipboardMessage,
  OffscreenClipboardResponse,
} from './offscreen-messages'
import { Chrome, escapeText } from '../utils'

export interface ChromeDelegate {
  currentPage(): Promise<chrome.tabs.Tab | undefined>
  appVersion(): string
  appName(): string
  showDefaultSuggestion(message: string): void
  openNewTab(url: string, active: boolean): void
  openOptionsPage(): void
  createNotification(iconUrl: string, title: string, message: string): void
  copyToClipboard(text: string): Promise<void>
  storeUrl(): string
  onStorageChanged(
    listener: (changes: { [key: string]: chrome.storage.StorageChange }) => void
  ): void
}

export class DefaultChromeDelegate implements ChromeDelegate {
  constructor(private readonly chrome: Chrome) {}

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

    await offscreen.createDocument({
      url: this.chrome.runtime.getURL('offscreen.html'),
      reasons: [offscreen.Reason.CLIPBOARD],
      justification: 'Write a posted Bluesky message to the clipboard.',
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
