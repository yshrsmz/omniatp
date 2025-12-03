# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Project Overview

OmniATP is a Chrome extension that allows posting to Bluesky directly from Chrome's Omnibox (URL bar). ATP stands for AT Protocol (the protocol behind Bluesky).

## Commands

```bash
# Install dependencies
pnpm install

# Development build with hot reload
pnpm dev

# Production build (runs vue-tsc type checking first)
pnpm build

# Lint and format
pnpm lint:fix

# Component stories (Histoire)
pnpm story:dev
```

## Architecture

### Chrome Extension Structure

- **Manifest V3** extension using `@crxjs/vite-plugin` for build tooling
- Omnibox keyword: `at` (production) or `atd` (development)
- Entry points:
  - `src/background/index.ts` - Service worker handling omnibox events
  - `src/options.ts` - Options page Vue app entry

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
- Vite + @crxjs/vite-plugin for extension builds
- TailwindCSS + Headless UI for styling
- Histoire for component development
- ESLint + Prettier for code quality
