import { vi } from 'vitest'
import { ChromeDelegate } from '../platform/ChromeDelegate'

export const createFakeChromeDelegate = (
  overrides: Partial<ChromeDelegate> = {}
) => {
  const fake = {
    currentPage: vi.fn<ChromeDelegate['currentPage']>(async () => undefined),
    appVersion: vi.fn<ChromeDelegate['appVersion']>(() => '1.2.3'),
    appName: vi.fn<ChromeDelegate['appName']>(() => 'OmniATP'),
    showDefaultSuggestion: vi.fn<ChromeDelegate['showDefaultSuggestion']>(),
    openNewTab: vi.fn<ChromeDelegate['openNewTab']>(),
    openOptionsPage: vi.fn<ChromeDelegate['openOptionsPage']>(),
    createNotification: vi.fn<ChromeDelegate['createNotification']>(),
    copyToClipboard: vi.fn<ChromeDelegate['copyToClipboard']>(async () => {}),
    prewarmOffscreen: vi.fn<ChromeDelegate['prewarmOffscreen']>(async () => {}),
    storeUrl: vi.fn<ChromeDelegate['storeUrl']>(
      () => 'https://chrome.google.com/webstore/detail/test'
    ),
    onStorageChanged: vi.fn<ChromeDelegate['onStorageChanged']>(),
    ...overrides,
  } satisfies ChromeDelegate

  return fake
}

export type FakeChromeDelegate = ReturnType<typeof createFakeChromeDelegate>
