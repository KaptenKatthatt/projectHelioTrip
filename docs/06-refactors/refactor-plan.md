# Low-Hanging Fruit Refactor Plan

## Overview

This document outlines the laziest-but-highest-impact refactors identified during the initial code review. The goal is to improve maintainability and testability without changing functionality.

## Identified Refactors

### 1. Decouple "God Store" Logic (`src/store/useStore.ts`)

**Issue:** Business logic (date calculations, mission evaluation, achievement triggers) is trapped inside the Zustand store.
**Fix:** Move pure logic into `src/lib/`. The store should be a coordinator, not a logic engine.

### 2. Extract Store Sanitization (`src/store/useStore.ts`)

**Issue:** The `merge` function in the persistence middleware is bloated with validation logic.
**Fix:** Create `src/store/stateSanitizer.ts` to handle all `localStorage` validation and default value assignment.

### 3. Formalize API Dispatching (`api/_lib/vercelDispatch.ts`)

**Issue:** Thin wrappers around `dispatchApi` can make route-specific middleware (like rate limiting or admin auth) harder to manage.
**Fix:** Ensure a typed middleware chain is used within the dispatch pattern.

### 4. React 19 Component Optimization

**Issue:** Potential for missed performance gains using React 19 patterns.
**Fix:** Audit `src/components/` to remove `forwardRef` and implement the `use` hook for async patterns where applicable.

---

## Implementation Roadmap

### Phase 1: Store Lean-up

- [ ] Move date and mission utility functions from `useStore.ts` $\rightarrow$ `src/lib/missions/` and `src/lib/dateUtils.ts`.
- [ ] Move sanitization logic $\rightarrow$ `src/store/sanitizer.ts`.
- [ ] Simplify `useStore.ts` to be a pure state definition + action dispatcher.

### Phase 2: Type & Logic Hardening

- [ ] Ensure all `dispatchDomainEvent` triggers are fully typed.

### Phase 3: UI Modernization

- [x] Refactor components to use React 19 `ref` patterns (remove `forwardRef`).

---

## Errors Found During Review & Fixes Applied

### Build Errors Fixed

1. **`Store` not exported from `useStore.ts`** — Tests were importing `Store` from `useStore.ts`, but it was moved to `types.ts`. **Fix:** Added `export type { Store, PersistedState } from './types';` in `useStore.ts` for backward compatibility.
2. **Unused imports in `useStore.ts`** — Many imports (`ConstellationId`, `Locale`, `dateKeyFromLocalDate`, `GameMode`, `getMissionDefinition`, `evaluateMissionStep`, `AchievementId`, `FactCardLevel`, `SimulationSlice`, `GameSlice`) became unused after the refactor. **Fix:** Removed all unused imports.
3. **Circular dependency in `missionLogic.ts`** — It was importing from `../store/useStore` which caused a module resolution error. **Fix:** Changed import path to `../../store/types` to use the dedicated types file.
4. **Unused imports in `missionLogic.ts`** — `MissionProgress` and `AchievementId` were declared but never used. **Fix:** Removed unused imports.
5. **Parameter mismatch in `unlockAchievements`** — Removed the `awardXp` parameter from `unlockAchievements` (it no longer awards XP directly), but the call site was still passing 5 arguments. **Fix:** Updated call site in `useStore.ts` to pass only 4 arguments.

### Verification Results

- `npm run build` — **PASSED** (tsc + vite build, no errors)
- `npm run lint` — **PASSED** (no lint errors)
- `npm run test:unit` — **PASSED** (77 tests, 16 test files)
