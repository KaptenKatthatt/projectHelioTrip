# ProjectHelioTrip - Agent Reference

This document is the shared source of truth for how the product should behave and look.
All agents must follow this document during implementation, refactoring, and bug fixing.

## 1) Product goal

ProjectHelioTrip should provide a clear, responsive, and visually strong 3D solar-system experience.
Users should be able to explore planets with natural camera controls similar to modern 3D map interactions.

## 2) Interaction requirements (MVP)

### 2.1 Planet selection

- The user must be able to select a planet from the planet list in the UI.
- The selected planet must be visually highlighted in both the list and the scene.
- The camera must focus the selected planet in a smooth and predictable way.

### 2.2 Rotate selected planet (Google Earth feel)

- When a planet is selected and the user clicks and holds on it, the planet must rotate with mouse drag.
- Horizontal drag should rotate around the planet's vertical axis.
- Vertical drag should rotate around the planet's horizontal axis.
- Rotation should feel direct and stable (no jitter or unexpected jumps).
- When the user releases the mouse button, active manual rotation should end.

### 2.3 Scroll zoom (dolly in/out)

- The mouse wheel should dolly the camera in and out toward the selected planet.
- Zoom should be smooth and have clear min/max limits to avoid clipping and disorientation.
- Zoom should keep focus on the selected planet throughout the dolly movement.

## 3) UX principles

- Interactions should be intuitive without requiring instructions for core tasks.
- Camera transitions should be smooth (no hard snap unless explicitly required).
- The UI should feel calm and support progression: select planet -> explore -> zoom -> rotate.
- Behavior should be consistent across planets: the same gestures should produce the same outcome.

## 4) Visual direction

- The aesthetic should be realistic but readable: textures and lighting may be dramatic, but must not reduce clarity.
- The selected planet should always be easy to identify (highlight/outline/label depending on implementation).
- Background and effects should support focus on the planet, not steal attention.

## 5) Technical guidelines for agents

- Stack: React + TypeScript + React Three Fiber + drei.
- Global state is managed with zustand (not React Context for global app state).
- R3F performance is a priority:
  - No unnecessary allocations in `useFrame`.
  - Memoize heavy computations.
  - Keep interaction logic deterministic and easy to debug.
- Avoid breaking changes to existing controls unless this document is updated accordingly.
- **Code comments must always be written in English.** This applies to all source-code comment types (`//`, `/* */`, JSDoc/TSDoc) in files under `src/`, `api/`, `scripts/`, `e2e/`, and other code files. User-facing text (i18n strings, UI text) may of course be Swedish/English according to localization. Project documentation must be written in English.

## 6) Definition of Done per feature

A feature is considered complete when:

- Behavior matches the relevant requirements in this document.
- Behavior is manually tested in the app (desktop, mouse + scroll).
- No regression bugs are introduced in existing camera or planet interaction.
- Code style and structure follow project rules.

## 7) Acceptance criteria - Planet interaction (first build target)

1. When the user selects a planet in the list, that planet gets focus in the scene.
2. When the user clicks and holds on the selected planet and drags the mouse, the planet rotates in the drag direction.
3. When the user scrolls in/out while a planet is selected, the camera dolly-zooms smoothly with reasonable limits.
4. The interaction feels stable and predictable without unexpected camera jumps.

## 8) Change policy

- If product behavior diverges from this document, implementation must be adjusted, or this document must be updated in the same task.
- New major interaction requirements must be added as new sections with clear acceptance criteria.

---

## 9) Analytics guardrails for agents

### Architecture

Analytics has two layers that must stay in sync:

| Layer | File | Role |
|-------|------|------|
| Frontend client | `src/lib/analytics.ts` | Defines `AnonymousEventName` type + sends events |
| Backend validator | `api/_lib/analyticsStore.ts` | Defines `AnalyticsEventName` type + `VALID_EVENT_NAMES` Set |

Both files contain independent copies of the event name list. They **must always contain identical sets of names**. If they diverge, the backend silently discards events with a 400 error and no data is recorded.

### Rule: always update both files together

When adding a new analytics event:
1. Add the event name to `AnonymousEventName` in `src/lib/analytics.ts`
2. Add the same event name to `AnalyticsEventName` **and** `VALID_EVENT_NAMES` in `api/_lib/analyticsStore.ts`
3. Run the sync test to confirm: `npx vitest run api/_lib/analyticsSyncCheck.test.ts`

**Never add to one file without updating the other.**

### Sync test

`api/_lib/analyticsSyncCheck.test.ts` automatically catches drift. If this test is failing, it means `VALID_EVENT_NAMES` in `analyticsStore.ts` is missing one or more event names that the frontend sends. The test error message tells you exactly which names are missing.

### Analytics summary endpoint resilience

`GET /api/analytics/summary` must not return HTTP 500. The implementation bounds the database (Neon) query with an 8-second timeout — passed as an `AbortSignal.timeout(8_000)` via the Neon driver's per-query `fetchOptions` — and catches all errors, returning an empty-but-valid summary on failure. Do not remove this error boundary or the `AbortSignal.timeout` call.

---

Last updated: 2026-05-08
