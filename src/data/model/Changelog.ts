/**
 * A markdown link extracted from the trailing parens of a changelog item
 * (typically a PR number or a commit SHA).
 */
export interface ChangelogLink {
  text: string
  url: string
}

/**
 * One bullet under a release section. `scope` corresponds to the leading
 * `**scope:**` emitted by Conventional Commits.
 */
export interface ChangelogItem {
  scope?: string
  description: string
  links: ChangelogLink[]
}

/**
 * A grouping of items under a release (e.g. "Features", "Bug Fixes").
 */
export interface ChangelogSection {
  title: string
  items: ChangelogItem[]
}

/**
 * One release entry parsed from CHANGELOG.md (`## …` heading and its body).
 * `versionUrl` points at the GitHub compare URL when present.
 */
export interface ChangelogRelease {
  version: string
  versionUrl?: string
  date?: string
  sections: ChangelogSection[]
}

/**
 * The full parsed CHANGELOG.md, with releases in source order
 * (newest first, as release-please writes them).
 */
export interface Changelog {
  releases: ChangelogRelease[]
}

/**
 * A typed segment within an item description after inline-markdown parsing.
 * Used by the renderer to apply `<code>` / `<strong>` styling to the
 * appropriate ranges instead of leaking raw `` ` `` / `**` characters.
 */
export type InlineToken =
  | { type: 'text'; text: string }
  | { type: 'code'; text: string }
  | { type: 'bold'; text: string }

const RELEASE_HEADING_RE =
  /^##\s+(?:\[(?<linkVersion>[^\]]+)\]\((?<url>[^)]+)\)|(?<bareVersion>[^\s(]+))(?:\s+\((?<date>[^)]+)\))?\s*$/
const SECTION_HEADING_RE = /^###\s+(?<title>.+?)\s*$/
const ITEM_PREFIX_RE = /^[*-]\s+(?<rest>.*)$/
const SCOPE_PREFIX_RE = /^\*\*(?<scope>[^*]+?):\*\*\s+(?<rest>.*)$/
const TRAILING_LINK_RE = /\s*\(\[(?<text>[^\]]+)\]\((?<url>[^)]+)\)\)\s*$/

const parseItem = (raw: string): ChangelogItem => {
  let rest = raw.trim()
  const links: ChangelogLink[] = []

  while (true) {
    const match = rest.match(TRAILING_LINK_RE)
    if (!match?.groups) break
    links.unshift({ text: match.groups.text, url: match.groups.url })
    rest = rest.slice(0, match.index).trimEnd()
  }

  let scope: string | undefined
  const scopeMatch = rest.match(SCOPE_PREFIX_RE)
  if (scopeMatch?.groups) {
    scope = scopeMatch.groups.scope
    rest = scopeMatch.groups.rest
  }

  return {
    scope,
    description: rest.trim(),
    links,
  }
}

/**
 * Parses inline markdown formatting within an item description. Recognises
 * `` `code` `` spans and `**bold**` spans only — no nesting, no italic, no
 * inline links. The first delimiter encountered wins; an unmatched opener is
 * left as plain text. This deliberately stays narrow because release-please's
 * descriptions only use these two inline forms in practice.
 */
export const parseInline = (raw: string): InlineToken[] => {
  const tokens: InlineToken[] = []
  let i = 0
  let textStart = 0

  const flushText = (end: number) => {
    if (end > textStart) {
      tokens.push({ type: 'text', text: raw.slice(textStart, end) })
    }
  }

  while (i < raw.length) {
    if (raw[i] === '`') {
      const close = raw.indexOf('`', i + 1)
      if (close === -1) {
        i++
        continue
      }
      flushText(i)
      tokens.push({ type: 'code', text: raw.slice(i + 1, close) })
      i = close + 1
      textStart = i
      continue
    }
    if (raw[i] === '*' && raw[i + 1] === '*') {
      const close = raw.indexOf('**', i + 2)
      if (close === -1) {
        i++
        continue
      }
      flushText(i)
      tokens.push({ type: 'bold', text: raw.slice(i + 2, close) })
      i = close + 2
      textStart = i
      continue
    }
    i++
  }

  flushText(raw.length)
  return tokens
}

/**
 * Parses a release-please-style CHANGELOG.md into structured data.
 *
 * Recognised lines:
 * - `## [version](url) (date)` or `## version (date)` → release
 * - `### Title` → section under the current release
 * - `* …` or `- …` → item under the current section
 *
 * Anything else is ignored; items before any section are dropped.
 */
export const parseChangelog = (markdown: string): Changelog => {
  const lines = markdown.split(/\r?\n/)
  const releases: ChangelogRelease[] = []
  let currentRelease: ChangelogRelease | undefined
  let currentSection: ChangelogSection | undefined

  for (const line of lines) {
    const releaseMatch = line.match(RELEASE_HEADING_RE)
    if (releaseMatch?.groups) {
      const { linkVersion, bareVersion, url, date } = releaseMatch.groups
      currentRelease = {
        version: linkVersion ?? bareVersion,
        versionUrl: url,
        date,
        sections: [],
      }
      currentSection = undefined
      releases.push(currentRelease)
      continue
    }

    const sectionMatch = line.match(SECTION_HEADING_RE)
    if (sectionMatch?.groups && currentRelease) {
      currentSection = { title: sectionMatch.groups.title, items: [] }
      currentRelease.sections.push(currentSection)
      continue
    }

    const itemMatch = line.match(ITEM_PREFIX_RE)
    if (itemMatch?.groups && currentSection) {
      currentSection.items.push(parseItem(itemMatch.groups.rest))
      continue
    }
  }

  return { releases }
}
