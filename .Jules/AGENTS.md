# Jules Agent Rules

Canonical project guidance lives in `context/`. Read `AGENTS.md` at the repo root for the full read order.

## PR creation

- **Max 1 PR per issue/fix.** If a previous PR addressing the same problem exists, update it instead of creating a new one.
- **Check for existing open PRs** before creating a new one.
- **Keep PRs focused.** One concern per PR — do not bundle unrelated performance, accessibility, and documentation changes.

## Performance

- Pre-allocate Three.js objects (`Vector3`, `Euler`, `Quaternion`) outside render loops. Never instantiate them inside `useFrame` or other hot paths.
- Use `out` / target parameters in math functions to avoid allocations.
- Hoist static arrays and objects out of frequently called functions.

## Code quality

- **Do not modify `.jules/` files in application PRs.** Learnings belong in separate documentation updates.
- Keep changes minimal. Small, focused diffs are easier to review and merge.
- Never remove error handling to "optimize" code.

## PR titles and descriptions

- Use clear, descriptive titles. Avoid emoji spam.
- Describe what the change does and why.

## Review process

- All PRs are reviewed before merging.
- If a PR is closed without merging, do not recreate it without addressing the feedback.
