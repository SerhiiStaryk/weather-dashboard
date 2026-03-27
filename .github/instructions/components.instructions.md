---
applyTo: 'src/components/**,src/pages/**'
---

# Component & Page Conventions

## Component shape

```tsx
import type { WeatherCondition } from '@/types/weather';

// Props interface immediately above the component — never inline
interface Props {
  data: WeatherCondition;
}

export function WeatherCard({ data }: Props) {
  // 1. hooks
  // 2. derived values
  // 3. return JSX
}
```

- Destructure props in the function signature
- No `React.FC` — plain function only
- Named export — no `export default` (except `App.tsx`)

## Conditional rendering

```tsx
// Single branch → &&
{
  isLoading && <LoadingSkeleton />;
}

// Two branches → ternary
{
  error ? <ErrorMessage error={error} /> : <WeatherCard data={data} />;
}
```

## Loading / error / data pattern (pages)

```tsx
{
  isLoading && <LoadingSkeleton />;
}
{
  error && <ErrorMessage error={error} />;
}
{
  data && <WeatherCard data={data.current} />;
}
```

## Styling (Tailwind v4)

- Utility classes in JSX only — no CSS files for components, no `style={}`
- Color tokens: `bg-background`, `bg-card`, `text-card-foreground`, `text-muted-foreground`, `text-destructive`, `border-input`, `bg-primary`, `text-primary-foreground`, `ring-ring`
- Standard card shell:
  ```
  rounded-xl border bg-card text-card-foreground shadow-sm p-6
  ```
- Focus ring:
  ```
  focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2
  ```
- Hover-reveal: parent gets `group`, revealing child uses `group-hover:opacity-100`

## Pages are thin

- Pages read route params, call a hook, render loading/error/data branches
- No business logic — delegate to hooks and API modules
