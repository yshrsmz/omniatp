# Dependency injection

OmniATP uses a **manual** DI pattern under `src/di/`. There is no DI container library — wiring is plain TypeScript code. Two component graphs exist:

- `BackgroundComponent` — built for the service worker (`background.ts`).
- `OptionsComponent` — built for the options page Vue app (`App.vue`).

Both graphs share two modules:

- `DataModule` — clock, storage gateway, repositories, and the `AtpAgent` factory.
- `PlatformModule` — Chrome platform delegates (`ChromeDelegate`, `ChromeStorageDelegate`) and `Logger`.

`createBackgroundComponent(chrome)` and `createOptionsComponent(chrome)` in `src/di/factory.ts` are the only public entry points. Consumers (entrypoints, Vue setup blocks) call these once and ask the resulting component for the collaborator they need.

## Layering

`Gateway → Repository → consumer` (see `CLAUDE.md`):

- `ConfigLocalGateway` is the only thing that talks to `ChromeStorageDelegate` directly.
- Repositories (`BskyRepository`, `PostTemplateRepository`, `AppPreferencesRepository`) wrap the gateway and expose a domain API.
- `OmniATP` and Vue components only ever talk to repositories — never to the gateway.

A repository may currently be a thin pass-through to the gateway. That is the _purpose_ of the layer, not a smell — keep it.

## Memoization (`getOrCreate`)

`src/di/helper.ts` defines `getOrCreate(value, creator, updater)`. Use it whenever a module exposes a **stateful** collaborator that should behave like a singleton (gateways, repositories, the chrome delegate, the logger). All current memoized members hold mutable state — caches, side-effecting agents, listener registrations — so handing out a fresh instance each call would be wrong.

Do **not** wrap stateless values in `getOrCreate`. Pure factory functions (e.g. `defaultAtpAgentFactory: (options) => new AtpAgent(options)`) and pure data should be plain module-level constants or trivial returns. `atpAgentFactory()` on `DataModule` is the canonical example: the factory itself holds no state, so it lives as a top-level `const` and the method just returns it.

## Adding a new dependency

1. **Define an interface** next to the implementation. Do not let consumers import the `Default…` class directly (the only exception is when a consumer needs to expose the concrete type for testing, e.g. `(repo as DefaultBskyRepository).agent` in DataModule tests).
2. **Add a method to the relevant module** (`DataModule` or `PlatformModule`). Memoize via `getOrCreate` if the value is stateful; otherwise return a module-level constant directly.
3. **Expose it through the component** (`BackgroundComponent` / `OptionsComponent`) only if the entrypoint or Vue layer needs it directly.
4. **Inject anything non-trivial** as a constructor argument. Don't reach for globals (`chrome`, `Date`, `console.log`-driven flags) inside business logic.

## Factories vs. instances

When a collaborator wraps a stateful third-party object (e.g. `AtpAgent`), inject a **factory** rather than a fresh instance:

```ts
export type AtpAgentFactory = (options: AtpAgentOptions) => AtpAgent

export class DefaultBskyRepository {
  constructor(
    localGateway: ConfigLocalGateway,
    agentFactory: AtpAgentFactory
  ) {
    this.agent = agentFactory({
      service: BskyConfig.service,
      persistSession: …,
    })
  }
}
```

The factory lives on `DataModule` (`atpAgentFactory()`). `DefaultDataModule` provides the real one (`new AtpAgent(options)`); tests pass a factory that returns a hand-rolled fake recording calls. This avoids `vi.mock` on the `@atproto/api` module and keeps the type contract honest.

## Logging

Logging goes through the `Logger` abstraction in `src/Logger.ts`, **not** through `console.*` directly. This keeps service-worker logs taggable (`logger.withTag('BskyRepository')` produces `[BskyRepository] …`) and makes tests silent by default.

- `PlatformModule.logger()` returns a singleton `ConsoleLogger` (writes to `console`). It is consumed by `DefaultDataModule` (passed in via the constructor) and by `BackgroundComponent` when it builds `OmniATP`.
- Each consumer receives a tagged child via `parent.withTag('ClassName')`. Avoid threading the root logger directly into business code.
- New code that wants to log should accept a `Logger` constructor argument — do not reach for `console.log` / `console.error` directly. Tests should pass `noopLogger` (silent) or a `createFakeLogger()` (assertable) from `src/test/FakeLogger.ts`.

## Testing implications

- **Construct collaborators directly in tests**, passing fakes/stubs as constructor arguments. Don't go through `DefaultDataModule` unless you are specifically testing the wiring (see `src/di/DataModule.test.ts`).
- For storage-backed code, use `InMemoryStorageDelegate` from `src/test/` rather than mocking `chrome.storage.local`.
- For chrome-API-backed code, use `createFakeChromeDelegate` from `src/test/`.
- Singletons / module-level state (e.g. the `default new DefaultClock()` export in `src/Clock.ts`) should be avoided in new code; inject a `Clock` through the module instead.
