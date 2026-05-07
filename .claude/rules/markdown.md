# Markdown / prose style

## Do not hard-wrap prose at a fixed column

Inside this repo (`.claude/rules/`, `*.md`, `README.md`, PR descriptions, commit-body prose, etc.), keep each paragraph as a **single line**. Let the editor / GitHub renderer handle soft-wrapping.

Concretely:

- ✅ `This is one paragraph that runs as long as it needs to without any embedded newlines.`
- ❌ `This is one paragraph that runs across\nseveral lines because the writer hard-wrapped\nat ~80 columns.`

Why this rule exists:

- It was added after a refactor in which Claude hard-wrapped new `.claude/rules/` files at ~80 columns by reflex (a common Markdown-style convention for git-diff readability). The reviewer found the line breaks "weird" — they fight the editor's soft-wrap, hurt diff legibility when prose is edited, and create avoidable churn.
- Prettier in this repo uses the default `proseWrap: 'preserve'`, so it will faithfully keep whatever you write — meaning the only way to enforce no-hard-wrap is at authoring time.

Exceptions where line breaks **are** meaningful and should stay:

- Bullet / numbered lists — one item per line.
- Code fences — preserve original formatting.
- Tables — Markdown table syntax requires line breaks between rows.
- Block quotes — line breaks separate paragraphs inside the quote.

If you find yourself wanting to wrap at column 80 "for readability of the diff," resist it. The diff is not the readership — the rendered file is.
