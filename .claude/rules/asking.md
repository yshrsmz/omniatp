# Asking the user questions

When you need to ask the user a question — whether to clarify requirements, choose between approaches, or confirm a decision — use the **AskUserQuestion** tool by default. Do not embed questions inside a long prose answer.

Why:

- Structured questions render as selectable options in the UI, which is faster to answer than free-form prose.
- It forces you to enumerate the options yourself instead of asking open-ended "what do you think?" questions that push synthesis back onto the user.
- Multiple related questions can be batched into a single call (up to 4) and answered together, reducing round-trips.

When to skip the tool and ask in plain text:

- The question is purely conversational ("does that match what you remembered?", "anything else?").
- You're confirming a one-line factual detail in passing inside a larger explanation.
- The user explicitly said "just ask me directly" earlier in the session.

Otherwise, default to AskUserQuestion. Each question should have 2-4 mutually-exclusive options with a short label and a one-line description; the UI auto-adds an "Other" escape hatch so do not include one yourself.
