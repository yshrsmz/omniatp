# OmniATP

WIP: Update your Bluesky status right from Chrome's Omnibox(URL bar).

ATP stands for AT Protocol.

## Development

This project is built with [WXT](https://wxt.dev). After cloning:

```bash
pnpm install         # also runs `wxt prepare` to generate .wxt/
pnpm dev             # starts the dev server, output at .output/chrome-mv3-dev/
pnpm build           # production build, output at .output/chrome-mv3/
pnpm compile         # type check (wxt prepare && tsc --noEmit)
pnpm zip             # build + package for store submission
```

Load `.output/chrome-mv3-dev/` (or `.output/chrome-mv3/`) as an unpacked extension from `chrome://extensions/`.

## Recommended IDE Setup

- [VS Code](https://code.visualstudio.com/) + [Vue (Official)](https://marketplace.visualstudio.com/items?itemName=Vue.volar) (formerly Volar). Disable Vetur if installed.

## Type Support For `.vue` Imports in TS

`.vue` SFCs are typed via `src/shims-vue.d.ts` (re-uses `App.vue` from `src/entrypoints/options/main.ts`). The Vue (Official) extension makes the language service aware of `.vue` types in editors. Type checking on the CLI is handled by `pnpm compile` (`wxt prepare && tsc --noEmit`).

If the standalone TypeScript plugin doesn't feel fast enough to you, Volar has also implemented a [Take Over Mode](https://github.com/johnsoncodehk/volar/discussions/471#discussioncomment-1361669) that is more performant. You can enable it by the following steps:

1. Disable the built-in TypeScript Extension
   1. Run `Extensions: Show Built-in Extensions` from VSCode's command palette
   2. Find `TypeScript and JavaScript Language Features`, right click and select `Disable (Workspace)`
2. Reload the VSCode window by running `Developer: Reload Window` from the command palette.
