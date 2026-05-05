# Human README - Agent Guidance in ProjectHelioTrip

This document is for humans.  
The goal is to quickly know **which file to edit** based on what you want to control.

## Quick version

- Want to change shared agent rules? -> `context/AGENTS_CONTEXT.md`
- Want to change product behavior/requirements? -> `context/AGENT_REFERENCE.md`
- Want to change UI/design rules? -> `context/DESIGN_SYSTEM.md`

## File responsibilities

### `context/AGENTS_CONTEXT.md` (global agent policy)

Responsible for:

- Agent read order
- Cross-cutting rules that should apply to all agents
- Mandatory verification before "done" (for example `npx tsc --noEmit` and `npm run lint`)

Edit this file when you want to control **how agents work in general**.

### `context/AGENT_REFERENCE.md` (product and behavior)

Responsible for:

- Product goals
- Interaction requirements and acceptance criteria
- UX principles
- Technical guidelines tied to functional behavior

Edit this file when you want to control **what the product should do**.

### `context/DESIGN_SYSTEM.md` (design system and UI rules)

Responsible for:

- Design principles
- Color/typography/spacing token rules
- Component structure and UI guardrails

Edit this file when you want to control **how the product should look and be built visually**.

## Important note about root files

Files in the repository root (such as `CLAUDE.md`, `AGENTS.md`, `GEMINI.md`, `AGENT_REFERENCE.md`, `DESIGN_SYSTEM.md`) are now mainly **compatibility entrypoints** for different agent tools.

Rule of thumb:

- Always update `context/*` first.
- Touch root files only when you need to adjust compatibility routing.

## Recommended workflow

1. Make the change in the correct `context` file.
2. Save and commit.
3. Ask the agent to follow the instructions in `context/AGENTS_CONTEXT.md`.
