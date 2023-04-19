import { PostTemplateRepository } from '../data/PostTemplateRepository'
import { ChromeDelegate } from '../platform/ChromeDelegate'

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
  ) => Promise<string | undefined>
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

  async handleEnterEvent(command: string, chrome: ChromeDelegate) {
    return this.buildVersionString(chrome)
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

  async buildShareMessage(command: string, chrome: ChromeDelegate) {
    const currentPage = await chrome.currentPage()
    const template = await this.postTemplateRepository.get()

    let message = 'unable to share this page'
    if (currentPage && currentPage.url && currentPage.title) {
      const userInput = (() => {
        const match = /^:share\s+([\w\W]+)$/i.exec(command)
        if (match && match.length > 1) {
          return match[1]
        } else {
          return null
        }
      })()

      message = template.buildPost(
        userInput ?? '',
        currentPage.title,
        currentPage.url
      )
    }
    return message
  }

  async handleInputEvent(command: string, chrome: ChromeDelegate) {
    chrome.showDefaultSuggestion(await this.buildShareMessage(command, chrome))
  }

  async handleEnterEvent(command: string, chrome: ChromeDelegate) {
    return await this.buildShareMessage(command, chrome)
  }
}
