import { ChromeDelegate } from '../platform/ChromeDelegate'
import { Clock } from '../Clock'
import { BskyRepository } from '../data/BskyRepository'
import { AppPreferencesRepository } from '../data/AppPreferencesRepository'
import { Payload, SubCommand } from './SubCommands'
import { XRPCError } from '@atproto/xrpc'
import { Logger } from '../Logger'

const NOTIFICATION_ICON = 'icon/128.png'

const extractError = (
  e: unknown
): { status: number | undefined; error: string | undefined } => {
  if (e instanceof XRPCError) {
    return { status: e.status, error: e.error }
  } else {
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    return { status: undefined, error: (e as any).message ?? 'Unknown error' }
  }
}

export class OmniATP {
  constructor(
    readonly clock: Clock,
    readonly chrome: ChromeDelegate,
    readonly bskyRepository: BskyRepository,
    readonly appPreferencesRepository: AppPreferencesRepository,
    readonly subCommands: SubCommand[],
    readonly logger: Logger
  ) {}

  async initialize() {
    try {
      await this.bskyRepository.resumeSession()
    } catch (e) {
      // not resumeable
      this.logger.error(e)
    }

    this.bskyRepository.onSessionUpdate((newValue, _oldValue) => {
      if (!this.bskyRepository.hasSession() && newValue) {
        this.bskyRepository.resumeSession()
        return
      }

      if (!newValue) {
        this.bskyRepository.signOut()
      }
    })
  }

  async postStatus(payload: Payload) {
    if (!payload.message) {
      return
    }

    this.logger.log('postStatus', payload)

    await Promise.all([
      this.submitPost(payload),
      this.maybeCopyToClipboard(payload),
    ])
  }

  private async submitPost(payload: Payload): Promise<void> {
    try {
      await this.bskyRepository.createPost(payload.message, payload.meta)
      this.logger.log('Posted', payload.message)
      this.chrome.createNotification(
        NOTIFICATION_ICON,
        this.chrome.appName(),
        payload.message
      )
    } catch (e) {
      const { status, error } = extractError(e)
      this.chrome.createNotification(
        NOTIFICATION_ICON,
        `Oops! there was an error: ${status}`,
        error ?? 'Unknown error'
      )
    }
  }

  private async maybeCopyToClipboard(payload: Payload): Promise<void> {
    try {
      if (await this.appPreferencesRepository.shouldCopyToClipboardOnPost()) {
        await this.chrome.copyToClipboard(payload.message)
        this.logger.log('Copied to clipboard', payload.message)
      }
    } catch (clipboardError) {
      this.logger.error('Failed to copy to clipboard', clipboardError)
    }
  }

  async handleInputChengedEvent(text: string) {
    if (!this.bskyRepository.hasSession()) {
      this.chrome.showDefaultSuggestion(
        'To use OmniATP, please sign in first(press Enter to sign in)'
      )
      return
    }

    const subCommand = this.subCommands.find((c) => c.test(text))
    if (subCommand) {
      subCommand.handleInputEvent(text, this.chrome)
      return
    }

    const rt = await this.bskyRepository.createRichText(text)
    const message = `${300 - rt.graphemeLength} characters left`
    this.chrome.showDefaultSuggestion(message)
  }

  async handleInputEnteredEvent(text: string) {
    if (!this.bskyRepository.hasSession()) {
      this.chrome.openOptionsPage()
      return
    }

    let payload: Payload | undefined = { message: text }

    const subCommand = this.subCommands.find((c) => c.test(text))
    if (subCommand) {
      payload = await subCommand.handleEnterEvent(text, this.chrome)
    }

    if (payload) {
      await this.postStatus(payload)
    }
  }
}
