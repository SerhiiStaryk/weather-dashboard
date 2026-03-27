---
description: 'Code review guidance for detecting bugs, security issues, type-safety violations, and project convention violations in the weather dashboard. Covers API layer separation, error handling patterns, React component structure, and TypeScript strict mode compliance.'
---

# Code Review Checklist — By Severity

## 🔴 Critical (must fix before merge)

### API Key Exposure

```ts
// ❌ WRONG - exposes key in error or log
throw new Error(`Failed to fetch ${url}`); // url contains appid=...
console.log(url);

// ✅ CORRECT - never log or expose
const maskedUrl = url.replace(/appid=[^&]+/, 'appid=***');
```

### External Data Not Validated

```ts
// ❌ WRONG - assuming shape without validation (runtime crash if malformed)
function parseWeather(data: any) {
  return { temp: data.main.temp };
}

// ✅ CORRECT - validate as unknown
function parseWeather(data: unknown): WeatherData {
  const main = assertObject(data, 'main');
  const temp = assertNumber(main.temp, 'main.temp');
  ...
}
```

### Constructor Parameter Properties (erasableSyntaxOnly violation)

```ts
// ❌ WRONG - TypeScript error
class ApiError extends Error {
  constructor(public readonly code: number) {}
}

// ✅ CORRECT
class ApiError extends Error {
  readonly code: number;
  constructor(code: number) {
    super();
    this.code = code;
  }
}
```

### TypeScript `any` Without Validation

```ts
// ❌ WRONG - hides type errors
function parse(data: any) { ... }

// ✅ CORRECT - validate unknown
function parse(data: unknown) {
  assertObject(data, 'root');
  ...
}
```

### Unhandled Promise Rejections

```ts
// ❌ WRONG - missing await
useEffect(() => {
  fetchWeather(city); // promise ignored
}, [city]);

// ✅ CORRECT - use TanStack Query or handle rejection
const { data } = useQuery({
  queryKey: ['weather', city],
  queryFn: () => fetchWeather(city),
});
```

## 🟠 High (should fix)

### Generic Error Instead of Typed Subclass

```ts
// ❌ WRONG - lose type safety
throw new Error('City not found');

// ✅ CORRECT - typed error
throw new CityNotFoundError(city);
```

### Raw API Data Reaching UI (Bypassing Parser)

```ts
// ❌ WRONG - components should never see unparsed data
const response = await fetch(url);
const data = await response.json();
return <WeatherCard data={data} />;

// ✅ CORRECT - always parse first
const rawData = await response.json();
const weather = parseWeatherData(rawData);  // throws ParseError if invalid
return <WeatherCard data={weather} />;
```

### localStorage Accessed Outside useFavorites

```ts
// ❌ WRONG - violates encapsulation
localStorage.setItem('city', city);

// ✅ CORRECT - create dedicated hook or use useFavorites
export function useFavorites() {
  const [favorites, setFavorites] = useState(() => {
    const stored = localStorage.getItem('favorites');
    ...
  });
}
```

### Business Logic in Page Component

```ts
// ❌ WRONG - pages should only compose UI
export function CityPage() {
  const [weather, setWeather] = useState(null);
  useEffect(() => {
    fetch(...).then(parseWeather).then(setWeather);
  }, [city]);
}

// ✅ CORRECT - extract to hook
export function CityPage() {
  const { data } = useWeather(city);
}
```

### useState for Async Data (Instead of TanStack Query)

```ts
// ❌ WRONG - reinventing server state management
const [data, setData] = useState(null);
const [loading, setLoading] = useState(false);
useEffect(() => { ... }, []);

// ✅ CORRECT - TanStack Query handles loading/error/caching
const { data, isLoading, error } = useQuery({
  queryKey: ['weather', city],
  queryFn: () => fetchWeather(city)
});
```

### Missing enabled Guard on useQuery

```ts
// ❌ WRONG - fires with undefined city
useQuery({
  queryKey: ['weather', city],
  queryFn: () => fetchWeather(city!), // non-null assertion risky
});

// ✅ CORRECT - guard against falsy values
useQuery({
  queryKey: ['weather', city],
  queryFn: () => fetchWeather(city!),
  enabled: !!city,
});
```

## 🟡 Medium (convention violation)

### type Alias for Object Shape (Should Be interface)

```ts
// ❌ WRONG
type Weather = { temp: number; city: string };

// ✅ CORRECT
interface Weather {
  temp: number;
  city: string;
}
```

### export default (Except App.tsx)

```ts
// ❌ WRONG - all exports should be named
export default function WeatherCard() {}

// ✅ CORRECT
export function WeatherCard() {}

// ✅ EXCEPTION - only App.tsx uses default export
```

### Relative ../ Imports Inside src/

```ts
// ❌ WRONG
import { useWeather } from '../../hooks/useWeather';

// ✅ CORRECT - use @ alias
import { useWeather } from '@/hooks/useWeather';

// ✅ EXCEPTION - tests/ can use relative paths to src/
```

### Props Interface Declared Away From Component

```ts
// ❌ WRONG - separated from component
export interface WeatherCardProps { ... }
// ... other code ...
export function WeatherCard(props: WeatherCardProps) { }

// ✅ CORRECT - immediately above component
interface WeatherCardProps {
  city: string;
  temp: number;
}

export function WeatherCard({ city, temp }: WeatherCardProps) { }
```

### React.FC Used

```ts
// ❌ WRONG
export const WeatherCard: React.FC<Props> = ({ city }) => {};

// ✅ CORRECT - plain function
export function WeatherCard({ city }: Props) {}
```

### Nested if/else Instead of Early Return

```tsx
// ❌ WRONG - nested conditionals
function Component() {
  if (isLoading) {
    return <Loading />;
  } else {
    if (error) {
      return <Error />;
    } else {
      return <Content />;
    }
  }
}

// ✅ CORRECT - early returns
function Component() {
  if (isLoading) return <Loading />;
  if (error) return <Error />;
  return <Content />;
}
```

### API Layer Boundary Violations (3-File Rule)

**Structure**: `errors.ts` → `fetchWeather.ts` → `weatherParser.ts`

- `errors.ts`: Custom error classes only
- `fetchWeather.ts`: HTTP only, maps status → typed errors
- `weatherParser.ts`: Validation/parsing only

**Watch for**: Parsing logic in fetch functions, or HTTP logic in parsers

## 🔵 Low (minor / informational)

### Unused Imports or Variables

Flag if noisy or confusing, though TypeScript compiler catches these.

### Missing aria-label or Roles

```tsx
// ⚠️ INFORMATIONAL - accessibility issue
<button onClick={handleClick}>
  <Icon name="close" />
</button>

// ✅ BETTER
<button onClick={handleClick} aria-label="Close weather card">
  <Icon name="close" />
</button>
```

### Magic Numbers/Strings

```ts
// ⚠️ INFORMATIONAL - readability issue
if (response.status === 404) { ... }

// ✅ BETTER
const NOT_FOUND = 404;
if (response.status === NOT_FOUND) { ... }
```

### Missing import type for Type-Only Imports

```ts
// ⚠️ INFORMATIONAL - runtime bloat (minor)
import { WeatherData } from '@/types/weather';

// ✅ BETTER
import type { WeatherData } from '@/types/weather';
```

---

## Reference: Testing Expectations

When reviewing test files (`tests/**`):

### Expected File Organization

- Mirror source structure: `tests/components/Foo.test.tsx` for `src/components/Foo.tsx`
- Relative imports from test to source: `import { Foo } from '../../src/components/Foo'`

### Required Assertions

- **Component tests**: `screen.getByText`, `toBeInTheDocument`, user event interactions
- **Parser tests**: `expect(fn).rejects.toThrow(ParseError)` for invalid inputs
- **Edge cases**: empty arrays, `null`, `undefined`, partial API responses
- **NO snapshot tests** (unless testing exact string formatting)

### MSW Mock Behavior

Special test cities defined in handlers:

- `london` → 200 + fixture data
- `UNKNOWN` → 404 + `CityNotFoundError`
- `ERROR` → 500 + `ServerError`
- `BADKEY` → 401 + `ApiKeyError`

Flag if test uses hardcoded mock data instead of leveraging these special cases.

---

## Reference: localStorage Safety Patterns

When reviewing `useFavorites` or similar hooks that use `localStorage`:

### Required Error Handling

```ts
// ✅ CORRECT - handles corrupt JSON
const [favorites, setFavorites] = useState<string[]>(() => {
  try {
    const stored = localStorage.getItem('favorites');
    if (!stored) return [];
    return JSON.parse(stored);
  } catch {
    return []; // gracefully handle corrupt data
  }
});

// ✅ CORRECT - handles quota exceeded
const saveFavorites = (cities: string[]) => {
  try {
    localStorage.setItem('favorites', JSON.stringify(cities));
  } catch (error) {
    // Silently fail on quota/private browsing
    console.warn('Failed to save favorites:', error);
  }
};
```

### Security Checks

- Normalize user input: `city.trim()` before storing
- Validate array structure after JSON.parse
- Never store sensitive data (API keys, tokens)
