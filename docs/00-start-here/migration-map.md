# Documentation Migration Map

This is the concrete move plan for current markdown files.

## Root-level project docs

- `DESIGN.md` -> `docs/02-design/design-system.md`
- `LEGACY_DESIGN_SYSTEM.md` -> `docs/99-archive/legacy/legacy-design-system.md`
- `AGENT_REFERENCE.md` -> `docs/03-engineering/agent-reference.md`
- `CLAUDE.md` -> `docs/03-engineering/claude-instructions.md`
- `ATTRIBUTIONS.md` -> `docs/01-product/attributions.md`

## UX and product reports

- `docs/Samlad-ux-rapport-29-apr.md` -> `docs/01-product/ux/ux-report-2026-04-29.md`
- `docs/Samlad-ux-rapport-29-apr-executive-summary.md` -> `docs/01-product/ux/ux-report-2026-04-29-exec-summary.md`
- `docs/Samlad-ux-rapport-29-apr-jira-todo.md` -> `docs/04-planning/ux-report-2026-04-29-jira-todo.md`
- `docs/claude-ux-rapport.md` -> `docs/01-product/ux/claude-ux-report.md`

## Redesign plans

- `docs/Desktop and iPad redesign plan.md` -> `docs/02-design/ui-redesign-desktop-ipad.md`
- `docs/Mobile redesign plan by Claude Code.md` -> `docs/02-design/ui-redesign-mobile.md`
- `docs/LEARNING_PLAN_uppdatering.md` -> `docs/04-planning/learning-plan-update.md`

## Learning plan package

- `docs/claude_learning_plan/README.md` -> `docs/04-planning/learning-plan/README.md`
- `docs/claude_learning_plan/constellations.md` -> `docs/04-planning/learning-plan/constellations.md`
- `docs/claude_learning_plan/factcards.md` -> `docs/04-planning/learning-plan/factcards.md`
- `docs/claude_learning_plan/missions_adventure.md` -> `docs/04-planning/learning-plan/missions-adventure.md`
- `docs/claude_learning_plan/quiz.md` -> `docs/04-planning/learning-plan/quiz.md`
- `docs/claude_learning_plan/ui_redesign.md` -> `docs/02-design/ui-redesign-master-plan.md`
- `docs/claude_learning_plan/xp_titles.md` -> `docs/04-planning/learning-plan/xp-titles.md`

## TODO consolidation

- `docs/TODO.md` -> merge into `docs/00-start-here/current-priorities.md`

## Performance docs

- `docs/perf/baseline-2026-04-28.md` -> `docs/03-engineering/performance/baseline-2026-04-28.md`
- `docs/perf/baseline-*.md` (timestamped snapshots) -> `docs/03-engineering/performance/snapshots/`

## Archive and legacy

- `docs/archived/PHASE3_IMPLEMENTATION_PLAN.md` -> `docs/99-archive/phase-3/phase3-implementation-plan.md`
- `docs/archived/PHASE3_REPORT.md` -> `docs/99-archive/phase-3/phase3-report.md`
- `docs/archived/camera-and-constellation-revision.md` -> `docs/99-archive/research/camera-and-constellation-revision.md`
- `docs/archived/Gammal redesign plan av Claude Code.md` -> `docs/99-archive/redesign/old-redesign-plan-claude.md`

## Move order (safe)

1. Create target folders.
2. Move active docs first (`00`, `01`, `02`, `03`, `04`).
3. Update internal links.
4. Move old docs into `99-archive`.
5. Remove empty old folders.
