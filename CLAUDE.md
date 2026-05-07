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

## Architecture

### Chrome Extension Structure

- **Manifest V3** extension built with [WXT](https://wxt.dev) (Vite-based extension framework)
- Omnibox keyword: `at` (production) or `atd` (development), switched in `wxt.config.ts` via `mode === 'development'`
- Entry points (file-based, picked up automatically by WXT):
  - `src/entrypoints/background.ts` - Service worker (wraps logic in `defineBackground`)
  - `src/entrypoints/options/{index.html,main.ts}` - Options page Vue app entry
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

- `BskyRepository` - Bluesky API interactions using `@atproto/api`
- `ConfigLocalGateway` - Chrome storage abstraction for session persistence
- `PostTemplateRepository` - User-configurable post templates

**Platform Abstraction**

- `ChromeDelegate` (`src/platform/ChromeDelegate.ts`) - Wraps Chrome extension APIs
- `ChromeStorageDelegate` - Wraps Chrome storage API

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
