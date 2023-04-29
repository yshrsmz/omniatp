import { PostTemplateRepository } from '../data/PostTemplateRepository'
import { LinkMeta } from '../data/model/LinkMeta'
import { ChromeDelegate } from '../platform/ChromeDelegate'

export interface Payload {
  message: string
  meta?: LinkMeta
}

export interface SubCommand {
  name: string
  description: string
  test: (command: string) => boolean
  handleInputEvent: (command: string, chrome: ChromeDelegate) => Promise<void>

  /**
   * @return message string to tweet or null
   */
  handleEnterEvent: (
    command: string,
    chrome: ChromeDelegate
  ) => Promise<Payload | undefined>
}

export class Options implements SubCommand {
  name = ':options'
  description = 'Open options page'
  test(command: string): boolean {
    return /^:options(\s*|\s+[\w\W]*)$/i.test(command)
  }

  async handleInputEvent(command: string, chrome: ChromeDelegate) {
    chrome.showDefaultSuggestion('Open options page')
  }

  async handleEnterEvent(command: string, chrome: ChromeDelegate) {
    chrome.openOptionsPage()
    return undefined
  }
}

export class Version implements SubCommand {
  name = ':version'
  description = `Show OmniATP version`

  test(command: string): boolean {
    return /^:version(\s*|\s+[\w\W]*)$/i.test(command)
  }

  private buildVersionString(chrome: ChromeDelegate): string {
    const version = chrome.appVersion()
    // const url = AppConfig.URL_CHROME_WEBSTORE
    return `I'm using OmniATP for Chrome Version ${version}`
  }

  async handleInputEvent(command: string, chrome: ChromeDelegate) {
    chrome.showDefaultSuggestion(this.buildVersionString(chrome))
  }

  async handleEnterEvent(
    command: string,
    chrome: ChromeDelegate
  ): Promise<Payload | undefined> {
    return {
      message: this.buildVersionString(chrome),
    }
  }
}

export class Share implements SubCommand {
  name = ':share'
  description = 'Share url to twitter'

  constructor(
    private readonly postTemplateRepository: PostTemplateRepository
  ) {}

  test(command: string) {
    return /^:share(\s*|\s+[\w\W]*)$/i.test(command)
  }

  extractUserInput(command: string): string | null {
    const match = /^:share\s+([\w\W]+)$/i.exec(command)
    if (match && match.length > 1) {
      return match[1]
    } else {
      return null
    }
  }

  async buildShareMessage(
    command: string,
    chrome: ChromeDelegate
  ): Promise<Payload> {
    const currentPage = await chrome.currentPage()
    const template = await this.postTemplateRepository.get()

    let message = 'unable to share this page'
    let meta: LinkMeta | undefined = undefined
    if (currentPage && currentPage.url && currentPage.title) {
      const userInput = this.extractUserInput(command)

      message = template.buildPost(
        userInput ?? '',
        currentPage.title,
        currentPage.url
      )
      meta = {
        uri: currentPage.url,
        title: currentPage.title,
        description: '',
      }
    }

    return {
      message,
      meta,
    }
  }

  async handleInputEvent(command: string, chrome: ChromeDelegate) {
    const payload = await this.buildShareMessage(command, chrome)
    chrome.showDefaultSuggestion(payload.message)
  }

  async handleEnterEvent(command: string, chrome: ChromeDelegate) {
    return await this.buildShareMessage(command, chrome)
  }
}
