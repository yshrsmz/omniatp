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
