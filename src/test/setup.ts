import { afterEach, vi } from 'vitest'

class ResizeObserverPolyfill {
  observe() {}
  unobserve() {}
  disconnect() {}
}

class IntersectionObserverPolyfill {
  readonly root = null
  readonly rootMargin = ''
  readonly thresholds = []
  observe() {}
  unobserve() {}
  disconnect() {}
  takeRecords() {
    return []
  }
}

// Headless UI's Dialog reaches for ResizeObserver / IntersectionObserver,
// neither of which is implemented by jsdom.
if (typeof globalThis.ResizeObserver === 'undefined') {
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  globalThis.ResizeObserver = ResizeObserverPolyfill as any
}
if (typeof globalThis.IntersectionObserver === 'undefined') {
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  globalThis.IntersectionObserver = IntersectionObserverPolyfill as any
}

afterEach(() => {
  vi.restoreAllMocks()
  document.body.innerHTML = ''
})
