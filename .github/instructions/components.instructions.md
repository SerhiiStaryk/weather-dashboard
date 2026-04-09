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

### Default props pattern

```tsx
interface Props {
  size?: 'sm' | 'md' | 'lg';
  variant?: 'default' | 'outline';
}

export function Button({ size = 'md', variant = 'default' }: Props) {
  // Defaults in destructuring — no `Button.defaultProps`
}
```

### Children pattern

```tsx
import type { PropsWithChildren } from 'react';

interface Props {
  title: string;
}

export function Card({ title, children }: PropsWithChildren<Props>) {
  return (
    <div className="rounded-xl border bg-card p-6">
      <h2>{title}</h2>
      {children}
    </div>
  );
}
```

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
- Standard card shell:
  ```
  rounded-xl border bg-card text-card-foreground shadow-sm p-6
  ```
- Focus ring:
  ```
  focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2
  ```

### Color semantics

- **Background**: `bg-background` (page), `bg-card` (surface), `bg-primary` (action)
- **Text**: `text-card-foreground` (primary), `text-muted-foreground` (secondary), `text-primary-foreground` (on primary bg)
- **Borders**: `border-input` (form elements), `border`

## When to split a component

Split when:

- **Extraction opportunity**: Repeated JSX structure appears 2+ times
- **Single responsibility**: Component does more than one thing (e.g., search + display)
- **Independent state**: Part of the UI has its own local state
- **Testability**: A piece of logic is hard to test in the larger component
- **>150 lines**: File length suggests multiple concerns

Keep together when:

- Used only once and tightly coupled to parent
- Splitting would require excessive prop drilling
- JSX is simple and splitting adds no clarity (default)
- **Feedback**: `text-destructive` (errors), `ring-ring` (focus)
- Never use arbitrary values — use design tokens only

### Spacing rules

- **Between sections**: `space-y-4` (tight), `space-y-6` (default), `space-y-8` (loose)
- **Card padding**: `p-4` (compact), `p-6` (default), `p-8` (spacious)
- **Inline gaps**: `gap-2` (icons + text), `gap-4` (related items), `gap-6` (distinct groups)
- **Margin**: Avoid `m-*` — prefer `space-y-*` or `gap-*` in flex/grid parents

### Hover states

```tsx
// Interactive card with hover effect
<button className="group rounded-xl border bg-card p-6 transition-colors hover:bg-accent">
  <h3>{title}</h3>
  <p className="text-muted-foreground group-hover:text-foreground transition-colors">
    {description}
  </p>
</button>

// Icon reveal on hover
<div className="group relative">
  <span>{name}</span>
  <TrashIcon className="opacity-0 group-hover:opacity-100 transition-opacity" />
</div>
```

## Pages are thin

- Pages read route params, call a hook, render loading/error/data branches
- No business logic — delegate to hooks and API modules
