# ProjectHelioTrip Agent Context (Canonical)

This folder is the canonical location for cross-agent instructions in this repository.

## Read order for any agent

1. `context/AGENTS_CONTEXT.md` (this file)
2. `context/AGENT_REFERENCE.md` (product behavior and engineering guardrails)
3. `context/DESIGN_SYSTEM.md` (UI system and component rules)
4. `.cursor/rules/*.mdc` (Cursor-specific enforced coding rules)
5. `.github/copilot-instructions.md` (Copilot-specific compatibility rules)

## Compatibility entrypoints kept in repo root

To support different agent ecosystems, these files remain at standard paths and point here:

- `CLAUDE.md`
- `AGENTS.md`
- `GEMINI.md`
- `AGENT_REFERENCE.md`
- `DESIGN_SYSTEM.md`

If instructions are updated, update the `context/*` files first, then keep entrypoints in sync.

## PR scope

Keep pull requests focused on a single concern. Do not bundle unrelated changes (for example performance, accessibility, and agent documentation) in one PR.

- One logical change per PR makes review faster and rollback safer.
- Check for an existing open PR on the same issue before opening a new one.
- Update an existing PR instead of creating duplicates for the same fix.

## Mandatory verification after changes

After any code change, agents must verify that no type or lint errors were introduced before reporting completion.

- Required checks:
  - `npx tsc -b`
  - `npm run lint`
- If either check fails, fix errors and rerun the failing check(s).
- Never claim the task is done while TypeScript or lint errors remain.

Use `tsc -b`, not `tsc --noEmit`. The root `tsconfig.json` is a solution file
that contains only `references`, so `npx tsc --noEmit` type-checks **nothing**
and exits 0 no matter what is broken — `const x: number = "a string"` passes it.
Only `tsc -b` walks the referenced projects, which is also what `npm run build`
and CI run.

## Mandatory language for comments and instructions

All project comments and instruction documents must be written in English.

- Code comments must always be in English.
- Agent instruction files and policy documents must always be in English.
- When editing existing non-English comments or instruction text, translate the touched content to English in the same change.
