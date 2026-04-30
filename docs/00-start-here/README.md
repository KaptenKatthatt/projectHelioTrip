# Documentation Hub

This folder is the entrypoint for project documentation.

## Start here

- Read `current-priorities.md` for what is active right now.
- Read `migration-map.md` for the planned `from -> to` document moves.

## Quick links

- Product and UX: `../01-product/`
- Design and redesign plans: `../02-design/`
- Engineering and performance: `../03-engineering/`
- Learning and planning docs: `../04-planning/`
- Architecture decisions (ADR): `../05-decisions/`
- Historical docs: `../99-archive/`

## Conventions

- Use one language per section when possible.
- Use `kebab-case.md` filenames.
- Use ISO dates in names (`YYYY-MM-DD`) when relevant.
- Add frontmatter to important docs:

```md
---
title: Example Title
status: active
owner: jonas
last_updated: 2026-04-30
related:
  - docs/02-design/design-system.md
---
```
