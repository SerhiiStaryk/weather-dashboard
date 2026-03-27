---
agent: Refactoring Specialist
description: Fix TypeScript conventions and imports in the open file
---

Fix TypeScript conventions and import issues in the currently open file without changing functionality.

## Preview First

Show me what convention violations you found:

- TypeScript issues (`type` vs `interface`, `React.FC`, etc.)
- Import path problems (relative `../` that should use `@/` alias)
- Props interface placement issues
- Export violations (`export default` usage)
- Other convention mismatches

**Wait for my approval** before making changes.

## After Confirmation

Apply these fixes:

- ✅ Convert `type` to `interface` for object shapes
- ✅ Remove `React.FC` in favor of plain functions
- ✅ Fix import paths to use `@/` alias (no `../` in `src/`)
- ✅ Move props interfaces immediately above components
- ✅ Fix `export default` violations
- ✅ Optimize import order (React, third-party, `@/`, relative)

Run tests to verify nothing breaks.

## Report

Provide:

- List of convention fixes applied
- Before/after test results
- Any remaining issues that couldn't be auto-fixed
