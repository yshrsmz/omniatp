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
