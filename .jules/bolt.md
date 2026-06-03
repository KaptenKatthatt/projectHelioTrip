## 2025-01-20 - Prevent Object Instantiation in useFrame
**Learning:** Instantiating new objects (like `new Euler()`) directly within `useFrame` or continuous tick callbacks triggers the Garbage Collector repeatedly, degrading rendering performance and causing micro-stutters, particularly on low-powered mobile devices where GC overhead is visible.
**Action:** Create module-level reusable objects (`tmpLookEuler`) or define them via `useMemo` in parent contexts to modify and reuse across frames instead.

## 2025-01-22 - Prevent Object and Array Instantiation in Frequent Loops
**Learning:** Instantiating new arrays and objects (like `new Vector3()` or `.clone()`) inside functions that are called frequently or during continuous tick callbacks triggers the Garbage Collector repeatedly. This degrades rendering performance and causes micro-stutters, particularly in Three.js applications.
**Action:** Create module-level reusable arrays and objects (e.g., `BODY_SPHERES` array populated once, and `const end = new Vector3()` allocated once inside the function scope prior to loops) and mutate them in place (e.g., using `copy()` and `addScaledVector()`) to avoid repeated allocations.

## 2026-05-16 - Optimize math operation inside SkyFocusCamera
**Learning:** Found `.clone()` method usage inside `closestPointOnSegment` which creates a new `Vector3` object instance on each calculation. `closestPointOnSegment` is executed continuously during segment intersection calculations via `findSafeEndPosition` while iterating over `BODY_SPHERES`. Generating object allocations across tight math operations leads to GC pauses.
**Action:** Always refactor math calculations and pre-allocate vectors using `new Vector3()` when performing operations within frequent pathing algorithms or calculations. Reused scratch variables such as `tmpPointSubStart` successfully mitigate garbage collection overhead.
## 2025-02-12 - Prevent Array.from within pointer move callbacks
**Learning:** Instantiating new arrays with `Array.from` inside high-frequency callback functions such as `onPointerMove` causes excessive garbage collection and degrades performance. In `ConstellationRotationControls`, converting `canvasPointerIds` to an array each frame on mobile was unnecessary and created micro-stutters during touch pinch rotations.
**Action:** Instead of `Array.from(set).sort(...)`, iterate the set manually with a `for...of` loop and assign values to simple local variables to avoid creating array instances.

## 2025-02-23 - Prevent Vector3 cloning in pathing algorithms
**Learning:** `findSafeEndPosition` inside `SkyFocusCamera.tsx` previously returned `startPos.clone()` and instantiated `new Vector3()`, causing garbage collection pauses during critical path-finding loops.
**Action:** Modify mathematical utility functions to accept an `out` parameter (`out: Vector3`), update it via `.copy()` and mutate it in-place, removing the need for object allocations or returning `.clone()`.
## 2024-05-30 - Prevent shared-state pollution when migrating to module-level vectors
**Learning:** Moving variables instantiated via `useMemo` to the module scope inside React Three Fiber components is an excellent way to reduce React hook overhead and eliminate garbage collection pauses in the `useFrame` loop. However, some objects implicitly hold state across frames (e.g., `velocity.lerp(desired, smoothing)` where `velocity` is carried over from the previous frame). If these stateful objects are moved to the global module scope, their state is shared globally, causing chaotic behavior or regressions if the component re-mounts or multiple instances are rendered.
**Action:** Always verify if a `Vector3` or mathematical object holds state across frames (e.g. for momentum or lerping) before moving it out of the component. Use `useRef(new Vector3())` for instance-specific state persistence, and reserve module-level variables (like `tmpForward` or `tmpDesired`) strictly for single-frame scratch calculations.

## 2025-02-23 - Prevent Math.sqrt in hot loops via squared distance comparisons
**Learning:** When performing intersection or distance checks in high-frequency mathematical or pathfinding loops (such as  inside ), using  invokes , which is an expensive operation that can cause performance regressions when run continuously.
**Action:** Always replace  with  to skip the square root calculation while maintaining mathematical identicality.

## 2025-02-23 - Prevent Math.sqrt in hot loops via squared distance comparisons
**Learning:** When performing intersection or distance checks in high-frequency mathematical or pathfinding loops (such as `segmentIntersectsSphere` inside `SkyFocusCamera.tsx`), using `.distanceTo()` invokes `Math.sqrt()`, which is an expensive operation that can cause performance regressions when run continuously.
**Action:** Always replace `.distanceTo(center) <= radius` with `.distanceToSquared(center) <= radius * radius` to skip the square root calculation while maintaining mathematical correctness.
