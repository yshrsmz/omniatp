import { ChromeDelegate } from '../platform/ChromeDelegate'
import { Clock } from '../Clock'
import { BskyRepository } from '../data/BskyRepository'
import { Payload, SubCommand } from './SubCommands'
import { XRPCError } from '@atproto/xrpc'

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
    readonly subCommands: SubCommand[]
  ) {}

  async initialize() {
    try {
      await this.bskyRepository.resumeSession()
    } catch (e) {
      // not resumeable
      console.error(e)
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

    try {
      console.log('postStatus', payload)

      await this.bskyRepository.createPost(payload.message, payload.meta)

      this.chrome.createNotification(
        './src/assets/icon_128.png',
        this.chrome.appName(),
        payload.message
      )
    } catch (e) {
      const { status, error } = extractError(e)
      this.chrome.createNotification(
        './src/assets/icon_128.png',
        `Oops! there was an error: ${status}`,
        error ?? 'Unknown error'
      )
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
