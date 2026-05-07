import { describe, expect, it } from 'vitest'
import { PostTemplate } from './PostTemplate'
import { BskyConfig } from '../../Configs'

describe('PostTemplate', () => {
  describe('buildPost', () => {
    it('uses the template prefix when no user input is provided', () => {
      const template = new PostTemplate('NowBrowsing: ')
      const url = 'https://example.com/article'
      const title = 'Example Article'

      const result = template.buildPost('', title, url)

      expect(result).toBe(`NowBrowsing:  ${title}\n${url}`)
    })

    it('uses the user input followed by a newline when provided', () => {
      const template = new PostTemplate('NowBrowsing: ')
      const url = 'https://example.com/x'
      const title = 'Title'

      const result = template.buildPost('great read', title, url)

      expect(result).toBe(`great read\n ${title}\n${url}`)
    })

    it('truncates the message to fit within the max post length', () => {
      const template = new PostTemplate('PRE: ')
      const url = 'https://example.com'
      const longTitle = 'a'.repeat(BskyConfig.maxPostLength)

      const result = template.buildPost('', longTitle, url)
      const lines = result.split('\n')

      expect(lines).toHaveLength(2)
      expect(lines[1]).toBe(url)
      expect(result.length).toBeLessThanOrEqual(
        BskyConfig.maxPostLength + url.length + 'PRE: '.length
      )
    })

    it('factory empty() returns a template with empty prefix', () => {
      expect(PostTemplate.empty().prefix).toBe('')
    })
  })
})
