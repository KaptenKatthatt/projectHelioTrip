## 2024-05-18 - [Distance Calculation Micro-optimizations]
**Learning:** In Three.js, `distanceTo()` is implemented natively as `Math.sqrt(this.distanceToSquared())`. Replacing `distanceTo()` with `Math.sqrt(distanceToSquared())` provides zero performance benefit and only clutters the code.
**Action:** Only use squared distances (like `distanceToSquared()`) when the math allows us to *completely avoid* calculating the square root (e.g., fast rejection threshold checks). If the actual linear distance is required, simply use `distanceTo()`.

## 2024-05-18 - [Fast Rejection in High-Frequency Loops]
**Learning:** When performing N-body proximity or collision checks in high-frequency loops (like `useFrame`), compute dynamic bounding thresholds once outside the loop to establish a fast-rejection radius using squared distances, avoiding expensive per-body vector math and allocations.
**Action:** Use fast-rejection radius checks using squared distances to avoid per-body vector math and allocations.
