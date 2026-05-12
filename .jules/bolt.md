## 2025-01-20 - Prevent Object Instantiation in useFrame
**Learning:** Instantiating new objects (like `new Euler()`) directly within `useFrame` or continuous tick callbacks triggers the Garbage Collector repeatedly, degrading rendering performance and causing micro-stutters, particularly on low-powered mobile devices where GC overhead is visible.
**Action:** Create module-level reusable objects (`tmpLookEuler`) or define them via `useMemo` in parent contexts to modify and reuse across frames instead.
