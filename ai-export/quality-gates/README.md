# Quality Gates Reuse Guide

Use this guide when applying quality guardrails in another repository.

## Copy as baseline

- `source-reference/tsconfig.json`
- `source-reference/tsconfig.app.json`
- `source-reference/tsconfig.node.json`
- `source-reference/eslint.config.js`
- `source-reference/vitest.config.ts`
- `source-reference/playwright.config.ts`

## Must-customize values

- `source-reference/package.json`
  - Adapt scripts and dependencies to the target project stack.
- `source-reference/eslint.config.js`
  - Update parser/plugins if the target differs (framework, runtime).
- `source-reference/vitest.config.ts`
  - Update test setup paths and environment settings.
- `source-reference/playwright.config.ts`
  - Update `baseURL`, web server command, and browser matrix.

## Mandatory verification commands

Run after each AI-generated code change:

- `npx tsc -b` (not `--noEmit`: a solution-style root `tsconfig.json` makes that a no-op)
- `npm run lint`

Optionally add test gates:

- `npm run test:unit`
- `npm run test:e2e`
