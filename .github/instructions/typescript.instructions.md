---
applyTo: '**/*.ts,**/*.tsx'
---

# TypeScript Conventions

## Types

- `interface` for object shapes — never `type` aliases for objects
- `unknown` for any unvalidated external data — never `any`
- `import type` for type-only imports:
  ```ts
  import type { WeatherCondition } from '@/types/weather';
  ```

## Classes (error subclasses)

Declare fields explicitly — `erasableSyntaxOnly` forbids constructor parameter properties:

```ts
// ✅ correct
class Foo extends Error {
  readonly code: number;
  constructor(code: number) {
    super();
    this.code = code;
  }
}
// ❌ wrong — banned by erasableSyntaxOnly
class Foo extends Error {
  constructor(public readonly code: number) {
    super();
  }
}
```

## Control flow

- Return early on validation errors rather than nesting:
  ```ts
  if (!city) return null        // ✅
  if (!city) { ... } else { ... }  // ❌
  ```

## Imports

- `@/` alias for all internal imports (maps to `src/`):
  ```ts
  import { useWeather } from '@/hooks/useWeather';
  ```
- External packages first, then `@/` imports — blank line between them
- No relative `../` imports except inside `tests/` pointing to `src/`

## File & export naming

| What        | Convention                    | Example                |
| ----------- | ----------------------------- | ---------------------- |
| Components  | PascalCase `.tsx`             | `WeatherCard.tsx`      |
| Pages       | PascalCase `.tsx`             | `CityPage.tsx`         |
| Hooks       | camelCase `use*.ts`           | `useWeather.ts`        |
| API modules | camelCase `.ts`               | `fetchWeather.ts`      |
| Types       | camelCase `.ts`               | `weather.ts`           |
| Tests       | mirror source + `.test.ts(x)` | `WeatherCard.test.tsx` |

- Named exports everywhere — `export function Foo()`, never `export default` (except `App.tsx`)
- Hook files export exactly one hook
