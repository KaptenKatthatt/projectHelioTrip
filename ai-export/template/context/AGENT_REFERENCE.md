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

Last updated: 2026-04-24
