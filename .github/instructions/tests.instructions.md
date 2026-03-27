---
applyTo: 'tests/**'
---

# Testing Conventions

## Imports

```ts
import { describe, it, expect, vi, beforeEach } from 'vitest';
import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
```

## Wrappers

- Routing → `<MemoryRouter>`
- TanStack Query → `<QueryClientProvider client={new QueryClient()}>`

## Mocking

- Stub custom hooks with `vi.mock`:
  ```ts
  vi.mock('../../src/hooks/useFavorites', () => ({
    useFavorites: vi.fn(() => ({
      favorites: [],
      addFavorite: vi.fn(),
      removeFavorite: vi.fn(),
      isFavorite: vi.fn(() => false),
    })),
  }));
  ```
- Never let `useFavorites` touch real `localStorage` in component tests
- For API integration tests: use the MSW server from `tests/setup.ts` — never `vi.mock('node:fetch')`

## Clearing

```ts
beforeEach(() => {
  vi.clearAllMocks();
  mockFn.mockClear();
});
```

## Interactions

- Use `userEvent` for typed input and multi-step interactions
- `fireEvent` only for isolated single-event tests (e.g. one click with no typing)

## Assertions

- Specific text, roles, and attributes — no snapshots
- Error path: `await expect(promise).rejects.toBeInstanceOf(SomeError)`
- Presence: `expect(el).toBeInTheDocument()`
- Content: `expect(el).toHaveTextContent(/pattern/i)`

## File structure

```ts
describe('ComponentName', () => {
  beforeEach(() => { /* clear mocks */ })

  const renderX = () => render(<MemoryRouter><X /></MemoryRouter>)

  it('does specific thing', () => { ... })
})
```

- Test files mirror source paths + `.test.ts(x)` suffix
- Component tests live in `tests/components/`
- Parser/fetch tests live in `tests/`
