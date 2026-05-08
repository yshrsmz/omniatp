import { describe, expect, it } from 'vitest'
import { parseChangelog } from './Changelog'

describe('parseChangelog', () => {
  it('returns no releases for an empty changelog', () => {
    const result = parseChangelog('# Changelog\n')
    expect(result.releases).toEqual([])
  })

  it('parses a release heading with a compare link and date', () => {
    const md = `# Changelog

## [0.0.4](https://github.com/yshrsmz/omniatp/compare/v0.0.3...v0.0.4) (2026-05-08)
`
    const result = parseChangelog(md)
    expect(result.releases).toHaveLength(1)
    expect(result.releases[0]).toMatchObject({
      version: '0.0.4',
      versionUrl: 'https://github.com/yshrsmz/omniatp/compare/v0.0.3...v0.0.4',
      date: '2026-05-08',
      sections: [],
    })
  })

  it('parses a release heading without a compare link', () => {
    const md = `# Changelog

## 0.0.1 (2025-01-01)
`
    const result = parseChangelog(md)
    expect(result.releases[0]).toMatchObject({
      version: '0.0.1',
      versionUrl: undefined,
      date: '2025-01-01',
    })
  })

  it('parses sections and items, including scope and trailing links', () => {
    const md = `# Changelog

## [0.0.4](https://example.com/c) (2026-05-08)


### Features

* copy posted message to clipboard ([#70](https://example.com/i70)) ([b50c0a3](https://example.com/cb50))
* **share:** rewrite Amazon URLs with associate tag ([#92](https://example.com/i92)) ([3ec4370](https://example.com/c3ec))


### Bug Fixes

* **clipboard:** recreate offscreen document on each clipboard write ([#93](https://example.com/i93)) ([294466a](https://example.com/c294))
`

    const result = parseChangelog(md)
    expect(result.releases).toHaveLength(1)
    const release = result.releases[0]
    expect(release.sections).toHaveLength(2)

    const features = release.sections[0]
    expect(features.title).toBe('Features')
    expect(features.items).toEqual([
      {
        scope: undefined,
        description: 'copy posted message to clipboard',
        links: [
          { text: '#70', url: 'https://example.com/i70' },
          { text: 'b50c0a3', url: 'https://example.com/cb50' },
        ],
      },
      {
        scope: 'share',
        description: 'rewrite Amazon URLs with associate tag',
        links: [
          { text: '#92', url: 'https://example.com/i92' },
          { text: '3ec4370', url: 'https://example.com/c3ec' },
        ],
      },
    ])

    const bugFixes = release.sections[1]
    expect(bugFixes.title).toBe('Bug Fixes')
    expect(bugFixes.items).toHaveLength(1)
    expect(bugFixes.items[0]).toMatchObject({
      scope: 'clipboard',
      description: 'recreate offscreen document on each clipboard write',
    })
  })

  it('parses an item with no trailing links', () => {
    const md = `# Changelog

## 0.0.1 (2025-01-01)

### Features

* initial release
`
    const result = parseChangelog(md)
    expect(result.releases[0].sections[0].items[0]).toEqual({
      scope: undefined,
      description: 'initial release',
      links: [],
    })
  })

  it('parses multiple releases in order', () => {
    const md = `# Changelog

## [0.0.4](https://example.com/a) (2026-05-08)

### Features

* later

## [0.0.3](https://example.com/b) (2026-04-01)

### Features

* earlier
`
    const result = parseChangelog(md)
    expect(result.releases.map((r) => r.version)).toEqual(['0.0.4', '0.0.3'])
    expect(result.releases[0].sections[0].items[0].description).toBe('later')
    expect(result.releases[1].sections[0].items[0].description).toBe('earlier')
  })

  it('ignores items that appear before any section', () => {
    const md = `# Changelog

## 0.0.1 (2025-01-01)

* stray item
`
    const result = parseChangelog(md)
    expect(result.releases[0].sections).toEqual([])
  })
})
