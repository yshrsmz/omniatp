# Testing

## Tooling

- Test runner: **vitest** (`pnpm test`, `pnpm test:watch`).
- Vue components are tested with **@vue/test-utils** under **jsdom**.
- Coverage uses **@vitest/coverage-v8** (`pnpm test:coverage`). The reporters
  emit `coverage/coverage-summary.json` and `coverage/coverage-final.json`,
  which CI feeds into
  [`davelosert/vitest-coverage-report-action`](https://github.com/davelosert/vitest-coverage-report-action)
  to post a PR comment / job summary.

## File layout

- Tests live next to the code under test: `src/foo/Bar.ts` ↔
  `src/foo/Bar.test.ts`. Do not introduce a separate `tests/` or `__tests__/`
  directory.
- Reusable test helpers live under `src/test/` (e.g. fakes, stubs,
  Headless UI shims, vitest setup file).

## Conventions

- Prefer **named imports** from `vitest` (`describe`, `it`, `expect`, `vi`)
  over enabling `globals: true` — keeps tests self-explaining.
- Group related cases with nested `describe` blocks. Use `it('should…')`-style
  sentences only when a single condition matters; otherwise plain
  behavior-first phrasing is preferred (`it('falls back to … when …')`).
- The setup file at `src/test/setup.ts`:
  - polyfills `ResizeObserver` / `IntersectionObserver` (jsdom does not ship
    them and Headless UI's `Dialog` requires them);
  - clears `document.body` and resets mocks in `afterEach`.

## Test doubles

For most code, **prefer hand-written fakes over `vi.mock` of modules**. Manual
mocking keeps the type system in play and makes failures easy to read.

- **`InMemoryStorageDelegate`** (`src/test/InMemoryStorageDelegate.ts`) — an
  in-memory implementation of `ChromeStorageDelegate`. Use it to test
  `ConfigLocalGateway` and any repository that goes through the gateway.
- **`createFakeChromeDelegate`** (`src/test/FakeChromeDelegate.ts`) — returns
  a `ChromeDelegate` whose methods are `vi.fn()`s. Pass `overrides` to swap
  individual methods (e.g. `currentPage`, `appVersion`).
- **`createFakeLogger`** (`src/test/FakeLogger.ts`) — returns a `Logger`
  whose every method is `vi.fn()`, with `withTag` returning the same fake.
  Use this when a test needs to assert that something was logged. When the
  test does not care about logging, pass `noopLogger` from `src/Logger.ts`
  instead — it has zero overhead and no observable side effects.
- **`headlessuiStubs`** (`src/test/headlessui-stubs.ts`) — lightweight stubs
  for `TransitionRoot`, `TransitionChild`, `Dialog`, `DialogPanel`,
  `DialogTitle`. Pass via `global.stubs` when mounting any component that
  composes a Headless UI dialog. Direct DOM-level testing of the real
  Headless UI dialog is unreliable under jsdom.

## Component testing notes

- For dialogs (`TextInputDialog`, `SignInDialog`, `SignOutDialog`), assert on
  the `wrapper`, **not on `document.body`**. Use `wrapper.text()` /
  `wrapper.findAll('button')` and stub the Headless UI primitives.
- For child components that you do not want to render fully, prefer
  `global.stubs: { ChildComponent: true }` and assert on the stub via
  `wrapper.findComponent({ name: 'ChildComponent' })`.

## What to test

- **Pure logic** (`PostTemplate`, `escapeText`, `extractUserInput`, etc.) —
  always.
- **Repositories** — through `InMemoryStorageDelegate`; verify the
  storage-side effects, not internal calls.
- **`OmniATP` and sub-commands** — exercise public methods with fake
  `BskyRepository`, `AppPreferencesRepository`, and `ChromeDelegate`. Verify
  the side effects (notifications, clipboard, sub-command dispatch) and the
  control flow (no-session early returns, error notifications).
- **Vue components** — verify emitted events for a representative set of
  inputs, plus state-dependent rendering (e.g. error message, disabled
  buttons). Skip pure presentational components (`SettingsListHeader`,
  `LoadingSpinner`).

## Adding new tests

1. Co-locate the test next to the source.
2. Reuse fakes from `src/test/`. Add a new helper there only when the same
   shape would be repeated in 2+ tests.
3. If you need a new external dependency to be testable, prefer **dependency
   injection over module mocking** (see `di.md`).
