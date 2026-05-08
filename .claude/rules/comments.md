# Comments

## Exported declarations get a doc comment

Top-level **exported** declarations — functions, constants, variables, classes, types, interfaces — should have a leading JSDoc-style comment (`/** … */`) describing what they are.

```ts
/**
 * Parses a release-please CHANGELOG.md into structured releases.
 */
export const parseChangelog = (markdown: string): Changelog => { … }

/**
 * One bullet item under a release section.
 */
export interface ChangelogItem { … }
```

Why this rule overrides the "default to no comments" guidance:

- Exports are the public surface of a module. Callers shouldn't have to read the body to understand intent.
- A short doc comment shows up in IDE hovers / autocomplete and pays for itself.

What the comment should say:

- Lead with **what** the thing is, in one sentence. The implementation answers _how_; the comment answers _what / why_.
- Mention non-obvious constraints (input format expectations, side effects, ownership of returned objects) when they exist.
- Skip restating the type signature. `parseChangelog(markdown: string): Changelog` already says it takes a string and returns a `Changelog` — don't repeat that.

What is **not** required:

- Internal (non-exported) helpers in the same file. Keep them comment-free unless the _why_ is non-obvious (per CLAUDE.md).
- `default export` of Vue SFCs / single-component files where the filename and `<script setup>` props already describe the component. A comment is welcome but not mandatory.
- Re-exports that just forward another module's symbol — the original declaration carries the doc.
- Test files (`*.test.ts`) — `describe`/`it` strings carry the documentation.

If a comment would only restate the identifier name (`/** The user. */ export const user = …`), don't write it. Either say something useful or omit.
