import {
  OFFSCREEN_CLIPBOARD_TARGET,
  OffscreenClipboardMessage,
  OffscreenReadyMessage,
} from '../../platform/offscreen-messages'

chrome.runtime.onMessage.addListener((message, _sender, sendResponse) => {
  const msg = message as Partial<OffscreenClipboardMessage>
  if (msg?.target !== OFFSCREEN_CLIPBOARD_TARGET) {
    return false
  }

  if (msg.type === 'copy' && typeof msg.text === 'string') {
    void writeToClipboard(msg.text)
      .then(() => sendResponse({ ok: true }))
      .catch((e: unknown) => {
        const message = e instanceof Error ? e.message : String(e)
        sendResponse({ ok: false, error: message })
      })
      // Close so the next copy runs against a fresh document; reusing the
      // page makes execCommand('copy') silently fail on later invocations.
      .finally(() => window.close())
    return true
  }

  return false
})

// Signal readiness AFTER the listener above is installed. Without this,
// the SW can race ahead and send 'copy' before the listener exists when
// the offscreen document is cold-loaded.
const ready: OffscreenReadyMessage = {
  target: OFFSCREEN_CLIPBOARD_TARGET,
  type: 'ready',
}
void chrome.runtime.sendMessage(ready).catch(() => {})

// Offscreen documents are never focused, so navigator.clipboard.writeText
// throws "Document is not focused". The textarea + execCommand pattern is
// the path Chrome officially supports for offscreen clipboard writes.
async function writeToClipboard(text: string): Promise<void> {
  const textarea =
    document.querySelector<HTMLTextAreaElement>('#clipboard-target')
  if (!textarea) {
    throw new Error('Clipboard textarea element is missing')
  }

  textarea.value = text
  textarea.focus()
  textarea.select()

  const ok = document.execCommand('copy')
  textarea.value = ''
  if (!ok) {
    throw new Error('document.execCommand("copy") returned false')
  }
}
