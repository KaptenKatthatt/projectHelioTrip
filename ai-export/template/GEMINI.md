# ProjectHelioTrip Gemini Instructions

Use `context/` as the canonical source of instructions for this repository.

Read in this order:

1. `context/AGENTS_CONTEXT.md`
2. `context/AGENT_REFERENCE.md`
3. `context/DESIGN_SYSTEM.md`
4. `.cursor/rules/*.mdc`
5. `.github/copilot-instructions.md`

Mandatory verification before completion for any code changes:

- `npx tsc -b`
- `npm run lint`

Use `tsc -b`, not `tsc --noEmit`. The root `tsconfig.json` is a solution file
containing only `references`, so `npx tsc --noEmit` type-checks nothing and
exits 0 however broken the code is. `tsc -b` is what actually checks, and it
is what `npm run build` and CI run.

Mandatory language:

- All code comments must be in English.
- All instruction/policy documents must be in English.
