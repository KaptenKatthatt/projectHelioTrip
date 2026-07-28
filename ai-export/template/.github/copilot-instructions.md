# Copilot / agent instructions for projectHelioTrip

These rules apply to all AI-assisted code changes in this repository. See
`context/AGENTS_CONTEXT.md` first, then `AGENT_REFERENCE.md` for the full product and technical reference.

## Code comments language

**All code comments must be written in English.** This applies to every kind of
comment in source files (`//`, `/* */`, JSDoc/TSDoc) under `src/`, `api/`,
`scripts/`, `e2e/`, and any other code directories.

- Do not write comments in Swedish or any other non-English language in code.
- When editing existing code that contains non-English comments, translate
  those comments to English as part of the change.
- This rule does **not** apply to user-facing strings, including i18n translation
  files under `src/i18n/locales/` (these may contain Swedish, English, etc.).

## Instruction documents language

**All agent instruction and policy documents must be written in English.**
If you edit existing non-English instruction text, translate the touched content
to English in the same change.

## Tech stack reminders

- React + TypeScript + React Three Fiber + drei.
- Global state via `zustand` (not React Context).
- Avoid allocations inside `useFrame`; memoize heavy computations.
- Prefer inferring types from functions over `as any`.

## Mandatory verification before completion

After any code change, run:

- `npx tsc -b`
- `npm run lint`

Use `tsc -b`, not `tsc --noEmit`. The root `tsconfig.json` is a solution file
containing only `references`, so `npx tsc --noEmit` type-checks nothing and
exits 0 however broken the code is. `tsc -b` is what actually checks, and it
is what `npm run build` and CI run.

Do not report a task as completed while TypeScript or lint errors remain.
