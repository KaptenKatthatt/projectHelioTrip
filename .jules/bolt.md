## 2024-05-18 - [Distance Calculation Micro-optimizations]
**Learning:** In Three.js, `distanceTo()` is implemented natively as `Math.sqrt(this.distanceToSquared())`. Replacing `distanceTo()` with `Math.sqrt(distanceToSquared())` provides zero performance benefit and only clutters the code.
**Action:** Only use squared distances (like `distanceToSquared()`) when the math allows us to *completely avoid* calculating the square root (e.g., fast rejection threshold checks). If the actual linear distance is required, simply use `distanceTo()`.

## 2024-05-18 - [Squared Distance Optimizations in useFrame]
**Learning:** When performing distance comparisons against constant thresholds in high-frequency rendering loops like `useFrame`, computing `.length()` or `.distanceTo()` forces `Math.sqrt()` to execute on every frame.
**Action:** Always pre-calculate squared threshold constants outside the loop, and use `.lengthSq()` or `.distanceToSquared()` to perform the comparisons, completely eliminating `Math.sqrt()` overhead.
