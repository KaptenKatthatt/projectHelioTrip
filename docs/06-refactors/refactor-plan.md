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

- [ ] Refactor components to use React 19 `ref` patterns (remove `forwardRef`).
