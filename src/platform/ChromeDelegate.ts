import { Chrome, escapeText } from '../utils'

export interface ChromeDelegate {
  currentPage(): Promise<chrome.tabs.Tab | undefined>
  appVersion(): string
  appName(): string
  showDefaultSuggestion(message: string): void
  openNewTab(url: string, active: boolean): void
  openOptionsPage(): void
  createNotification(iconUrl: string, title: string, message: string): void
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

  onStorageChanged(
    listener: (changes: { [key: string]: chrome.storage.StorageChange }) => void
  ): void {
    this.chrome.storage.local.onChanged.addListener(listener)
  }
}
