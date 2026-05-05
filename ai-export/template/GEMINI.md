# ProjectHelioTrip Gemini Instructions

Use `context/` as the canonical source of instructions for this repository.

Read in this order:

1. `context/AGENTS_CONTEXT.md`
2. `context/AGENT_REFERENCE.md`
3. `context/DESIGN_SYSTEM.md`
4. `.cursor/rules/*.mdc`
5. `.github/copilot-instructions.md`

Mandatory verification before completion for any code changes:

- `npx tsc --noEmit`
- `npm run lint`

Mandatory language:

- All code comments must be in English.
- All instruction/policy documents must be in English.
