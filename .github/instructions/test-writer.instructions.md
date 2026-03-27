# Test Writer — Detailed Conventions

This file contains detailed code patterns and examples for the Test Writer agent.

## Import patterns

### Basic test imports

```ts
import { describe, it, expect, vi, beforeEach } from 'vitest';
import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
```

### Component imports

```ts
// Use relative paths from tests/ directory
import { CitySearch } from '../../src/components/CitySearch';
import type { Weather } from '../../src/types/weather';
```

## Wrapper patterns

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

### Combined wrapper

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

## Mocking patterns

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

## User interaction patterns

### userEvent for complex interactions

```ts
// Typing into input
const user = userEvent.setup();
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

fireEvent.click(screen.getByRole('button', { name: /toggle/i }));
```

## Assertion patterns

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

## File structure template

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

## Coverage guidelines

### Components

- Initial render with default props
- User interactions (clicks, typing, form submission)
- Conditional rendering (loading, error, success states)
- Edge cases (empty data, null values)

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

## Anti-patterns (NEVER do these)

❌ Snapshot tests

```ts
expect(component).toMatchSnapshot(); // NO!
```

❌ Testing implementation details

```ts
expect(component.state.count).toBe(5); // NO! Test observable behavior
```

❌ Importing from src/mocks directly

```ts
import { mockWeather } from '../../src/mocks/fixtures/currentWeather'; // NO!
```

❌ Using `any` type

```ts
const data: any = {}; // NO! Use unknown or specific type
```

❌ Leaving TODOs

```ts
it.todo('should test something'); // NO! Implement or remove
```
