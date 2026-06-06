## 2024-05-18 - [Distance Calculation Micro-optimizations]
**Learning:** In Three.js, `distanceTo()` is implemented natively as `Math.sqrt(this.distanceToSquared())`. Replacing `distanceTo()` with `Math.sqrt(distanceToSquared())` provides zero performance benefit and only clutters the code.
**Action:** Only use squared distances (like `distanceToSquared()`) when the math allows us to *completely avoid* calculating the square root (e.g., fast rejection threshold checks). If the actual linear distance is required, simply use `distanceTo()`.
