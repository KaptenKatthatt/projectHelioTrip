## 2025-01-20 - Prevent Object Instantiation in useFrame
**Learning:** Instantiating new objects (like `new Euler()`) directly within `useFrame` or continuous tick callbacks triggers the Garbage Collector repeatedly, degrading rendering performance and causing micro-stutters, particularly on low-powered mobile devices where GC overhead is visible.
**Action:** Create module-level reusable objects (`tmpLookEuler`) or define them via `useMemo` in parent contexts to modify and reuse across frames instead.

## 2025-01-22 - Prevent Object and Array Instantiation in Frequent Loops
**Learning:** Instantiating new arrays and objects (like `new Vector3()` or `.clone()`) inside functions that are called frequently or during continuous tick callbacks triggers the Garbage Collector repeatedly. This degrades rendering performance and causes micro-stutters, particularly in Three.js applications.
**Action:** Create module-level reusable arrays and objects (e.g., `BODY_SPHERES` array populated once, and `const end = new Vector3()` allocated once inside the function scope prior to loops) and mutate them in place (e.g., using `copy()` and `addScaledVector()`) to avoid repeated allocations.
