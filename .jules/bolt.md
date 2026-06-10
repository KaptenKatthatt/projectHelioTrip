## 2024-05-18 - [Distance Calculation Micro-optimizations]
**Learning:** In Three.js, `distanceTo()` is implemented natively as `Math.sqrt(this.distanceToSquared())`. Replacing `distanceTo()` with `Math.sqrt(distanceToSquared())` provides zero performance benefit and only clutters the code.
**Action:** Only use squared distances (like `distanceToSquared()`) when the math allows us to *completely avoid* calculating the square root (e.g., fast rejection threshold checks). If the actual linear distance is required, simply use `distanceTo()`.

## 2024-05-18 - [Fast Rejection in High-Frequency Loops]
**Learning:** In Three.js `useFrame` or collision loops, evaluating squared distances (`distanceToSquared()`) combined with maximum possible movement (`moveDelta.length()`) provides a highly effective fast-reject threshold. By computing this early, we can completely bypass subsequent per-body expensive math (vector subtractions, length calculations, normal generation) for bodies that are mathematically impossible to reach this frame.
**Action:** When performing proximity checks across multiple objects in a hot loop, compute a fast-reject squared distance threshold early to `continue` and avoid inner-loop vector math and variable assignments.
