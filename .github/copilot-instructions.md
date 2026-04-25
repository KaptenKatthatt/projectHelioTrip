# Copilot / agent instructions for projectHelioTrip

These rules apply to all AI-assisted code changes in this repository. See
`AGENT_REFERENCE.md` for the full product and technical reference.

## Code comments language

**All code comments must be written in English.** This applies to every kind of
comment in source files (`//`, `/* */`, JSDoc/TSDoc) under `src/`, `api/`,
`scripts/`, `e2e/`, and any other code directories.

- Do not write comments in Swedish or any other non-English language in code.
- When editing existing code that contains non-English comments, translate
  those comments to English as part of the change.
- This rule does **not** apply to:
  - User-facing strings, including i18n translation files under
    `src/i18n/locales/` (these may contain Swedish, English, etc.).
  - Project documentation in Markdown files (e.g. `AGENT_REFERENCE.md`,
    `README.md`, `docs/**`), which may be authored in Swedish.

## Tech stack reminders

- React + TypeScript + React Three Fiber + drei.
- Global state via `zustand` (not React Context).
- Avoid allocations inside `useFrame`; memoize heavy computations.
- Prefer inferring types from functions over `as any`.
