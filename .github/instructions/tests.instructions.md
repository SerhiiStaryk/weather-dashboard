---
applyTo: 'tests/**'
---

# Testing Conventions — Single Source of Truth

Full test patterns, code examples, and decision trees for the weather dashboard.

## Test Decision Tree

**When writing a new test, ask:**

1. **What are you testing?**
   - Component → `tests/components/Foo.test.tsx`
   - Hook → `tests/hooks/useFoo.test.ts`
   - API/parser → `tests/Foo.test.ts`

2. **What state does it use?**
   - Props only → no mocking needed
   - Custom hooks → mock with `vi.mock`
   - API data → use MSW handlers from `tests/setup.ts`
   - Browser API (localStorage) → mock with `vi.spyOn(Storage.prototype, 'getItem')`

3. **What should you assert?**
   - Rendered UI → `screen.getByText`, `toBeInTheDocument`
   - User interaction result → `userEvent` + `await screen.findBy...`
   - Error thrown → `await expect(fn()).rejects.toThrow(ErrorType)`
   - State change → check observable effect (rendered text, attribute)

4. **What edge cases exist?**
   - Empty data (`[]`, `null`, `undefined`)
   - Partial data (missing optional fields)
   - Error states (network failure, validation error)
   - Boundary conditions (0, -1, very large numbers)

## Import Patterns

### Basic test imports

```ts
import { describe, it, expect, vi, beforeEach } from 'vitest';
import { render, screen, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
```

### Component imports

```ts
// Use relative paths from tests/ directory
import { CitySearch } from '../../src/components/CitySearch';
import type { Weather } from '../../src/types/weather';
```

## Wrapper Patterns

### React Router wrapper

```ts
import { MemoryRouter } from 'react-router-dom';

const renderWithRouter = () =>
  render(
    <MemoryRouter>
      <ComponentName />
    </MemoryRouter>
  );
```

### TanStack Query wrapper

```ts
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';

const renderWithQuery = () => {
  const queryClient = new QueryClient({
    defaultOptions: {
      queries: { retry: false },
    },
  });

  return render(
    <QueryClientProvider client={queryClient}>
      <ComponentName />
    </QueryClientProvider>
  );
};
```

### Combined wrapper (routing + query)

```ts
const renderWithProviders = () => {
  const queryClient = new QueryClient({
    defaultOptions: {
      queries: { retry: false },
    },
  });

  return render(
    <QueryClientProvider client={queryClient}>
      <MemoryRouter>
        <ComponentName />
      </MemoryRouter>
    </QueryClientProvider>
  );
};
```

## Mocking Patterns

### Custom hook mocking

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

### Resetting mocks between tests

```ts
beforeEach(() => {
  vi.clearAllMocks();
  // For hooks that return mocked functions, reset the implementation:
  (useFavorites as ReturnType<typeof vi.fn>).mockReturnValue({
    favorites: [],
    addFavorite: vi.fn(),
    removeFavorite: vi.fn(),
    isFavorite: vi.fn(() => false),
  });
});
```

### Browser API mocking (localStorage, sessionStorage)

```ts
beforeEach(() => {
  vi.spyOn(Storage.prototype, 'getItem').mockReturnValue(null);
  vi.spyOn(Storage.prototype, 'setItem').mockImplementation(() => {});
  vi.spyOn(Storage.prototype, 'removeItem').mockImplementation(() => {});
});

afterEach(() => {
  vi.restoreAllMocks();
});
```

### MSW for API tests

Never `vi.mock('node:fetch')` — use the MSW server configured in `tests/setup.ts`:

```ts
// MSW is already set up globally, just write your test
it('fetches weather data', async () => {
  const data = await fetchWeather('London');
  expect(data.name).toBe('London');
});

// To override a handler for one test:
import { http, HttpResponse } from 'msw';
import { server } from './setup';

it('handles API error', async () => {
  server.use(
    http.get('*/weather', () => HttpResponse.json(null, { status: 500 })),
  );

  await expect(fetchWeather('London')).rejects.toThrow();
});
```

## User Interaction Patterns

### userEvent for complex interactions

```ts
const user = userEvent.setup();

// Typing into input
const input = screen.getByRole('textbox');
await user.type(input, 'London');

// Click + type sequence
await user.click(screen.getByRole('button', { name: /add/i }));
await user.type(screen.getByRole('textbox'), 'Paris');
await user.keyboard('{Enter}');
```

### fireEvent for simple clicks

```ts
import { fireEvent } from '@testing-library/react';

// Only for isolated single-event tests
fireEvent.click(screen.getByRole('button', { name: /toggle/i }));
```

## Assertion Patterns

### Presence checks

```ts
expect(screen.getByText(/london/i)).toBeInTheDocument();
expect(screen.queryByText(/error/i)).not.toBeInTheDocument();
```

### Content checks

```ts
expect(screen.getByRole('heading')).toHaveTextContent('Weather Dashboard');
expect(screen.getByText(/temperature/i)).toHaveTextContent('15°C');
```

### Error handling

```ts
await expect(fetchWeather('invalid')).rejects.toThrow('Invalid city');
await expect(parseWeather(null)).rejects.toBeInstanceOf(ValidationError);
```

### Async waiting

```ts
// Wait for element to appear
await screen.findByText(/london/i);

// Wait for element to disappear
await waitFor(() => {
  expect(screen.queryByText(/loading/i)).not.toBeInTheDocument();
});
```

## File Structure Template

```ts
import { describe, it, expect, vi, beforeEach } from 'vitest';
import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { MemoryRouter } from 'react-router-dom';

import { ComponentName } from '../../src/components/ComponentName';

// Mocks
vi.mock('../../src/hooks/useCustomHook', () => ({
  useCustomHook: vi.fn(() => ({ data: null })),
}));

describe('ComponentName', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  const renderComponent = () =>
    render(
      <MemoryRouter>
        <ComponentName />
      </MemoryRouter>
    );

  it('renders initial state correctly', () => {
    renderComponent();
    expect(screen.getByText(/expected text/i)).toBeInTheDocument();
  });

  it('handles user interaction', async () => {
    const user = userEvent.setup();
    renderComponent();

    await user.click(screen.getByRole('button', { name: /click me/i }));

    expect(screen.getByText(/result/i)).toBeInTheDocument();
  });

  it('handles error state', () => {
    // Mock error condition
    (useCustomHook as ReturnType<typeof vi.fn>).mockReturnValue({
      data: null,
      error: new Error('Test error'),
    });

    renderComponent();

    expect(screen.getByText(/error/i)).toBeInTheDocument();
  });
});
```

## Coverage Guidelines

### Components

- **Initial render** with default props
- **User interactions** (clicks, typing, form submission)
- **Conditional rendering** (loading, error, success states)
- **Edge cases** (empty data, null values)
- **Error boundaries** (see below)

### Hooks

- Default return values
- State updates
- Side effects (localStorage, API calls)
- Cleanup functions

### API/Parsers

- Happy path with valid data
- Invalid/malformed input
- Network errors
- Specific error types thrown

## Edge Case Patterns

### Partial data handling

```ts
it('renders with missing optional fields', () => {
  const partialWeather: Weather = {
    name: 'London',
    main: { temp: 15 },
    // weather array missing - should not crash
  };

  render(<WeatherCard weather={partialWeather} />);
  expect(screen.getByText('London')).toBeInTheDocument();
  expect(screen.getByText('15°')).toBeInTheDocument();
  // Icon should show fallback or be omitted
  expect(screen.queryByRole('img')).not.toBeInTheDocument();
});
```

### Empty data handling

```ts
it('handles empty favorites list', () => {
  (useFavorites as ReturnType<typeof vi.fn>).mockReturnValue({
    favorites: [],
    addFavorite: vi.fn(),
    removeFavorite: vi.fn(),
    isFavorite: vi.fn(() => false),
  });

  render(<FavoritesList />);
  expect(screen.getByText(/no favorites/i)).toBeInTheDocument();
});
```

### Null/undefined safety

```ts
it('handles null weather data gracefully', () => {
  render(<WeatherCard weather={null} />);
  expect(screen.getByText(/no data/i)).toBeInTheDocument();
});
```

## Error Boundary Testing

When testing error boundaries, isolate component errors:

```ts
import { ErrorBoundary } from 'react-error-boundary';

it('catches errors from child component', () => {
  const ThrowError = () => {
    throw new Error('Test error');
  };

  // Suppress console.error for this test
  const spy = vi.spyOn(console, 'error').mockImplementation(() => {});

  render(
    <ErrorBoundary fallback={<div>Error occurred</div>}>
      <ThrowError />
    </ErrorBoundary>
  );

  expect(screen.getByText('Error occurred')).toBeInTheDocument();
  spy.mockRestore();
});
```

## Global Mocks Reference

Global mocks live in `tests/setup.ts`:

- **MSW server** — intercepts all fetch requests
  - Default handlers in `src/mocks/handlers.ts`
  - Override per-test with `server.use(http.get(...))`
- **jest-dom matchers** — `toBeInTheDocument`, `toHaveTextContent`, etc.
- **Server lifecycle** — `beforeAll`, `afterEach`, `afterAll`

Never import from `src/mocks/` directly in tests — fixtures are for MSW handlers only.

## Anti-Patterns (NEVER do these)

❌ **Snapshot tests**

```ts
expect(component).toMatchSnapshot(); // NO!
```

❌ **Testing implementation details**

```ts
expect(component.state.count).toBe(5); // NO! Test observable behavior
```

❌ **Importing from src/mocks directly**

```ts
import { mockWeather } from '../../src/mocks/fixtures/currentWeather'; // NO!
```

❌ **Using `any` type**

```ts
const data: any = {}; // NO! Use unknown or specific type
```

❌ **Leaving TODOs**

```ts
it.todo('should test something'); // NO! Implement or remove
```

❌ **Mocking fetch directly**

```ts
vi.mock('node:fetch'); // NO! Use MSW from tests/setup.ts
```

## File Naming & Location

- Test files mirror source paths + `.test.ts(x)` suffix
- Component tests → `tests/components/Foo.test.tsx`
- Hook tests → `tests/hooks/useFoo.test.ts`
- API/parser tests → `tests/Foo.test.ts`
