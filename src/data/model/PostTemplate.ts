import { RichText } from '@atproto/api'
import { BskyConfig } from '../../Configs'

export class PostTemplate {
  constructor(readonly prefix: string) {}

  buildPost(userInput: string, title: string, url: string): string {
    const prefix = userInput ? `${userInput}\n` : this.prefix
    const baseMessage = `${prefix} ${title}`
    const baseResult = `${baseMessage}\n${url}`

    const rt = new RichText({ text: baseResult })

    let result = ''
    if (rt.graphemeLength <= BskyConfig.maxPostLength) {
      result = baseResult
    } else {
      const diff = BskyConfig.maxPostLength - rt.graphemeLength
      result = `${baseMessage.slice(0, diff)}\n${url}`
    }

    return result
  }

  public static empty(): PostTemplate {
    return new PostTemplate('')
  }
}
