# Test Writer — Agent Workflow & Automation

This file defines the **automated workflow** for the Test Writer agent.

**For all code patterns, examples, and conventions**, see `.github/instructions/tests.instructions.md` — it's the single source of truth.

## Agent Responsibilities

When given a source file (or when one is open), the Test Writer agent:

1. **Verifies environment**: Run `npx vitest --version` to confirm Vitest works before proceeding.
2. **Reads** the source file in full to understand what to test.
3. **Determines the test file path**:
   - `src/components/Foo.tsx` → `tests/components/Foo.test.tsx`
   - `src/hooks/useFoo.ts` → `tests/hooks/useFoo.test.ts`
   - `src/api/foo.ts` → `tests/foo.test.ts`
4. **Checks** whether that test file already exists (`file_search`):
   - If exists → read it fully
   - Run tests to verify current status: `npx vitest run <test-file-path>` (30s timeout)
   - If existing tests pass, **preserve them** and only add missing coverage
   - Before overwriting, show a concise diff preview and ask user to confirm
5. **Writes or updates** the test file with full coverage of the public interface.
6. **Runs** `npx vitest run <test-file-path> --reporter=verbose` (30s timeout) and fixes failures.
7. **Retry limit**: If tests fail after 3 fix attempts, report findings to user and stop.

## Critical Rules for Agent

- **Read tests.instructions.md** when you need specific implementation patterns
- **No snapshots** — test observable behavior only
- **No implementation details** — test the public interface
- **No TODOs** — implement or remove
- **No `any` type** — use `unknown` or specific types
- **No direct src/mocks imports** — use `tests/setup.ts` for MSW
- **Preserve passing tests** when updating existing test files
- **Ask confirmation** before overwriting existing test files (show brief diff)

## Agent Workflow Summary

```
1. Pre-flight: npx vitest --version
2. Read source file fully
3. Determine test file path
4. Check if test exists
   ├─ Yes → Read + Run tests (30s timeout)
   │         ├─ Passing → Preserve + Add missing coverage
   │         └─ Failing → Fix or rewrite
   └─ No → Create new test file
5. Write/update test file
   └─ Follow patterns from tests.instructions.md
6. Run tests: npx vitest run <path> --reporter=verbose (30s)
7. Fix failures (up to 3 attempts)
8. Report: Confirm which cases were added and that suite passes
```

## Coverage Checklist (use with test decision tree from tests.instructions.md)

### For Components

- [ ] Initial render with default props
- [ ] All user interactions (clicks, typing, form submission)
- [ ] Conditional rendering (loading, error, success states)
- [ ] Edge cases (empty data, null values, partial data)
- [ ] Error boundary behavior (if component can throw)

### For Hooks

- [ ] Default return values
- [ ] State updates
- [ ] Side effects (localStorage, API calls)
- [ ] Cleanup functions
- [ ] Edge cases (null, undefined, empty arrays)

### For API/Parsers

- [ ] Happy path with valid data
- [ ] Invalid/malformed input
- [ ] Network errors
- [ ] Specific error types thrown
- [ ] Partial data handling

## Safety & Performance

- **Verify Vitest works** before starting (`npx vitest --version`)
- **Preserve passing tests** when updating existing test files
- **Ask confirmation** before overwriting existing test files (show brief diff)
- **Timeout**: If test run exceeds 30s, abort and report the issue
- **Retry limit**: Maximum 3 fix attempts — if tests still fail, report findings and stop

## Quick Reference (full details in tests.instructions.md)

### Imports

```ts
import { describe, it, expect, vi, beforeEach } from 'vitest';
import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
```

### Wrappers

- Router → `<MemoryRouter>`
- Query → `<QueryClientProvider client={new QueryClient({ defaultOptions: { queries: { retry: false }}})}>`

### Mocking

- Hooks → `vi.mock('../../src/hooks/useFoo', () => ({ useFoo: vi.fn(() => ({ ... })) }))`
- Clear → `beforeEach(() => { vi.clearAllMocks(); })`
- MSW → already configured in `tests/setup.ts`

### Assertions

- Presence → `expect(el).toBeInTheDocument()`
- Content → `expect(el).toHaveTextContent(/pattern/i)`
- Errors → `await expect(fn()).rejects.toThrow(ErrorType)`

For detailed patterns, examples, and edge cases — **always consult `.github/instructions/tests.instructions.md`**.
