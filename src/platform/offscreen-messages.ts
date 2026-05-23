export const OFFSCREEN_CLIPBOARD_TARGET = 'omniatp.offscreen.clipboard'

export interface OffscreenClipboardMessage {
  target: typeof OFFSCREEN_CLIPBOARD_TARGET
  type: 'copy'
  text: string
}

export interface OffscreenClipboardResponse {
  ok: boolean
  error?: string
}

/**
 * Sent by the offscreen document to the service worker as soon as its
 * onMessage listener is installed. Lets the SW avoid a race where the
 * 'copy' message is dispatched before the listener exists — `createDocument`
 * resolves on initial page load and does not wait for module scripts to
 * finish executing.
 */
export interface OffscreenReadyMessage {
  target: typeof OFFSCREEN_CLIPBOARD_TARGET
  type: 'ready'
}
