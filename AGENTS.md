# AGENTS.md - Project Instructions for AI Agents

## Rules for Jules and other AI agents

### PR Creation Rules
- **Max 1 PR per issue/fix.** If a previous PR addressing the same problem exists, update it instead of creating a new one. Do NOT create duplicate PRs for the same fix.
- **Always check for existing open PRs** before creating a new one. If a similar PR exists, close it and create a single consolidated PR.
- **Keep PRs focused.** One concern per PR. Do not bundle unrelated changes.

### Performance Rules
- **Pre-allocate Three.js objects** (Vector3, Euler, Quaternion) outside render loops. Never instantiate them inside useFrame or hot paths.
- **Use target parameters** in math functions to avoid allocations.
- **Hoist static arrays and objects** out of frequently called functions.

### Code Quality
- **Do NOT modify .jules/ files in PRs.** Learnings should be documented separately.
- **Keep changes minimal.** Small, focused diffs are easier to review and merge.
- **Never remove error handling** to "optimize" code.

### PR Titles and Descriptions
- Use clear, descriptive titles. Avoid emoji spam.
- Describe what the change does and WHY.

### Review Process
- All PRs will be reviewed before merging.
- If a PR is closed without merging, do NOT recreate it without addressing the feedback.