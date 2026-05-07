# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Project Overview

OmniATP is a Chrome extension that allows posting to Bluesky directly from Chrome's Omnibox (URL bar). ATP stands for AT Protocol (the protocol behind Bluesky).

## Commands

```bash
# Install dependencies (also runs `wxt prepare` via postinstall to generate .wxt/)
pnpm install

# Development build with HMR (loads .output/chrome-mv3-dev/ as an unpacked extension)
pnpm dev

# Production build (outputs to .output/chrome-mv3/)
pnpm build

# Type check (`wxt prepare && tsc --noEmit`)
pnpm compile

# Build and zip for store submission (.output/<name>-<version>-chrome.zip)
pnpm zip

# Lint and format
pnpm lint:fix
```

## Release flow

Releases are automated via [release-please](https://github.com/googleapis/release-please).

1. Land changes on `main` using [Conventional Commits](https://www.conventionalcommits.org/) (`feat:`, `fix:`, `feat!:` …). PR titles are squash-merged, so the PR title itself must be a Conventional Commit.
2. The `release-please` workflow opens (or updates) a release PR that bumps `package.json`, updates `CHANGELOG.md`, and updates `.release-please-manifest.json`.
3. Merging that release PR creates a `v*` git tag and a GitHub Release.
4. The `Release` workflow runs on `release: published`, builds via `pnpm zip`, and uploads `.output/*.zip` to the Release as an asset.

`wxt.config.ts` reads the version from `package.json`, so no manifest edits are needed during a release.

## Architecture

### Chrome Extension Structure

- **Manifest V3** extension built with [WXT](https://wxt.dev) (Vite-based extension framework)
- Omnibox keyword: `at` (production) or `atd` (development), switched in `wxt.config.ts` via `mode === 'development'`
- Entry points (file-based, picked up automatically by WXT):
  - `src/entrypoints/background.ts` - Service worker (wraps logic in `defineBackground`)
  - `src/entrypoints/options/{index.html,main.ts}` - Options page Vue app entry
  - `src/entrypoints/offscreen/{index.html,main.ts}` - Offscreen document used to write to the clipboard from the service worker (built to `offscreen.html` at extension root)
- Static assets:
  - `public/icon/{16,48,128}.png` - Extension icons (auto-discovered by WXT)
- Manifest is defined in `wxt.config.ts` as a function of `{ mode }`; WXT auto-fills `manifest_version`, `icons`, `options_ui`, and `background.service_worker` from the file layout

### Key Components

**Background (Service Worker)**

- `OmniATP` class (`src/background/OmniATP.ts`) - Core controller handling omnibox input/enter events and posting to Bluesky
- `SubCommands` (`src/background/SubCommands.ts`) - Special commands prefixed with `:` (`:options`, `:version`, `:share`)

**Dependency Injection**

- Manual DI pattern in `src/di/` directory
- `BackgroundComponent` - Dependencies for service worker context
- `OptionsComponent` - Dependencies for options page context
- `DataModule` - Data layer (repositories, clock)
- `PlatformModule` - Chrome API abstractions

**Data Layer**

Layered as **Gateway → Repository → consumers**. The gateway is the low-level
storage abstraction; repositories are the domain-facing API. **Always go through
a repository from `OmniATP`, Vue components, or any other consumer — never call
`ConfigLocalGateway` directly outside `src/data/`.** A repository may look like a
thin pass-through today; that's the layer's purpose, not a smell.

- `ConfigLocalGateway` - Chrome storage abstraction (sessions, post prefix, app preferences). Internal to `src/data/`.
- `BskyRepository` - Bluesky API interactions using `@atproto/api`; persists session via `ConfigLocalGateway`.
- `PostTemplateRepository` - User-configurable post template (wraps `ConfigLocalGateway` post-prefix into the `PostTemplate` model).
- `AppPreferencesRepository` - App-level user preferences (e.g. `copyToClipboardOnPost`).

**Platform Abstraction**

- `ChromeDelegate` (`src/platform/ChromeDelegate.ts`) - Wraps Chrome extension APIs. `copyToClipboard()` lazily creates the offscreen document declared in `src/entrypoints/offscreen/` and posts a message to it (see `src/platform/offscreen-messages.ts` for the wire format).
- `ChromeStorageDelegate` - Wraps Chrome storage API.

### Tech Stack

- Vue 3 with TypeScript
- WXT 0.20.x (uses Vite 8 internally) for extension build, HMR, and manifest generation
- `@wxt-dev/module-vue` for Vue SFC integration
- TailwindCSS v4 + Headless UI for styling
- ESLint + Prettier for code quality

### Notes for editing

- `defineBackground` is auto-imported by WXT — do not add `import` statements for it
- `tsconfig.json` extends `./.wxt/tsconfig.json`, which is regenerated on every `wxt prepare`. Do not commit `.wxt/`
- The notification icon path passed to `chrome.notifications.create` must be `'icon/128.png'` (extension-root relative); files under `public/` are emitted to the extension root by WXT
- Offscreen clipboard writes require **both** the `offscreen` and `clipboardWrite` permissions in `wxt.config.ts`. The CLIPBOARD reason alone is not sufficient — `execCommand('copy')` silently returns false without `clipboardWrite`.
- `navigator.clipboard.writeText` is unusable from the offscreen document (it rejects with "Document is not focused" because offscreen documents are never focused by design). Use the `<textarea> + document.execCommand('copy')` pattern in `src/entrypoints/offscreen/main.ts`, and call `window.close()` after each copy so the next call runs against a freshly-loaded page (reusing the document makes execCommand fail on later invocations).
