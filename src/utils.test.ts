import { describe, expect, it } from 'vitest'
import { escapeText } from './utils'

describe('escapeText', () => {
  it('escapes HTML-significant characters', () => {
    expect(escapeText('<a href="x">it\'s & ok</a>')).toBe(
      '&lt;a href=&quot;x&quot;&gt;it&apos;s &amp; ok&lt;/a&gt;'
    )
  })

  it('returns empty string unchanged', () => {
    expect(escapeText('')).toBe('')
  })

  it('escapes & first so other replacements do not double-encode', () => {
    expect(escapeText('&amp;')).toBe('&amp;amp;')
  })
})
