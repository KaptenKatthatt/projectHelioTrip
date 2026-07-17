# ProjectHelioTrip Agent Instructions

This repository uses `context/` as the canonical source for shared agent guidance.

Read in this order:

1. `context/AGENTS_CONTEXT.md`
2. `context/AGENT_REFERENCE.md`
3. `context/DESIGN_SYSTEM.md`
4. `.cursor/rules/*.mdc` for Cursor-specific rule enforcement
5. `.github/copilot-instructions.md` for Copilot-specific compatibility

Mandatory verification before completion for any code changes:

- `npx tsc --noEmit`
- `npm run lint`

Mandatory language:

- All code comments must be in English.
- All instruction/policy documents must be in English.
