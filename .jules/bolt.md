## 2024-05-18 - [Distance Calculation Micro-optimizations]
**Learning:** In Three.js, `distanceTo()` is implemented natively as `Math.sqrt(this.distanceToSquared())`. Replacing `distanceTo()` with `Math.sqrt(distanceToSquared())` provides zero performance benefit and only clutters the code.
**Action:** Only use squared distances (like `distanceToSquared()`) when the math allows us to *completely avoid* calculating the square root (e.g., fast rejection threshold checks). If the actual linear distance is required, simply use `distanceTo()`.

## 2024-05-18 - [Distance Calculation Micro-optimizations]
**Learning:** In the high-frequency collision loop `applyCollisionConstraints`, checking proximity to every body involves vector copying, subtraction, and `.length()` calls. This can be optimized.
**Action:** Use `.distanceToSquared()` with a pre-computed bound (softLimit + movement distance) to quickly reject bodies that cannot possibly collide this frame. This avoids square roots and vector allocations for bodies that are far away.
