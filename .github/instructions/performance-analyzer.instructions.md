# Performance Analyzer — Memory Patterns & Optimization Guide

Detailed memory leak detection patterns, React performance anti-patterns, profiling interpretation guides, and remediation examples for the Performance Analyzer agent.

## Memory Leak Detection Patterns

### 🔴 Critical: Event Listener Leak

#### ❌ MEMORY LEAK

```tsx
// src/hooks/useTheme.ts
export function useTheme() {
  const [theme, setTheme] = useState<'light' | 'dark'>('light');

  useEffect(() => {
    const handleStorageChange = (e: StorageEvent) => {
      if (e.key === 'theme') setTheme(e.newValue as 'light' | 'dark');
    };

    // ❌ Listener added but never removed
    window.addEventListener('storage', handleStorageChange);
    // Component unmounts → listener remains → memory leak
  }, []);

  return theme;
}
```

**Memory Impact**: ~1KB per mount (handler + closure), unbounded growth  
**Detection**: Chrome DevTools > Memory > Take snapshot > filter "EventTarget"  
**Symptom**: Event listener count grows in Performance Monitor

#### ✅ FIXED

```tsx
// src/hooks/useTheme.ts
export function useTheme() {
  const [theme, setTheme] = useState<'light' | 'dark'>('light');

  useEffect(() => {
    const handleStorageChange = (e: StorageEvent) => {
      if (e.key === 'theme') setTheme(e.newValue as 'light' | 'dark');
    };

    window.addEventListener('storage', handleStorageChange);

    // ✅ Cleanup function removes listener on unmount
    return () => {
      window.removeEventListener('storage', handleStorageChange);
    };
  }, []);

  return theme;
}
```

**Common Event Listener Leaks**:

- `window.addEventListener('resize', ...)`
- `window.addEventListener('scroll', ...)`
- `document.addEventListener('keydown', ...)`
- `element.addEventListener('click', ...)`
- WebSocket `.on('message', ...)`
- EventEmitter `.on('event', ...)`

---

### 🔴 Critical: Timer Leak

#### ❌ MEMORY LEAK

```tsx
// src/components/AutoRefresh.tsx
export function AutoRefresh({ onRefresh }: Props) {
  useEffect(() => {
    // ❌ Timer continues after unmount
    setInterval(() => {
      onRefresh();
    }, 30000); // Refresh every 30s
    // Missing cleanup → interval runs forever
  }, [onRefresh]);

  return <div>Auto-refreshing...</div>;
}
```

**Memory Impact**: Timer + closure retained, parent re-renders accumulate timers  
**Detection**: Multiple timers firing in console logs after component unmounts  
**Symptom**: "Can't perform a React state update on an unmounted component" warning

#### ✅ FIXED

```tsx
// src/components/AutoRefresh.tsx
export function AutoRefresh({ onRefresh }: Props) {
  useEffect(() => {
    const intervalId = setInterval(() => {
      onRefresh();
    }, 30000);

    // ✅ Clear interval on unmount
    return () => {
      clearInterval(intervalId);
    };
  }, [onRefresh]);

  return <div>Auto-refreshing...</div>;
}
```

**Common Timer Leaks**:

- `setInterval(...)` without `clearInterval`
- `setTimeout(...)` without `clearTimeout` (if component can unmount before timeout)
- `requestAnimationFrame(...)` without `cancelAnimationFrame`

---

### 🔴 Critical: Async State Update on Unmounted Component

#### ❌ MEMORY LEAK + WARNING

```tsx
// src/hooks/useWeather.ts (without TanStack Query)
export function useWeatherManual(city: string) {
  const [data, setData] = useState<WeatherData | null>(null);

  useEffect(() => {
    // ❌ No cancellation mechanism
    fetchWeather(city).then(setData);
    // If component unmounts before fetch completes → setState on unmounted component
  }, [city]);

  return data;
}
```

**Memory Impact**: Promise + closure retained until resolution  
**Detection**: Console warning: "Can't perform a React state update on an unmounted component"  
**Symptom**: Potential state update bugs, memory retained during async operations

#### ✅ FIXED (AbortController)

```tsx
// src/hooks/useWeatherManual.ts
export function useWeatherManual(city: string) {
  const [data, setData] = useState<WeatherData | null>(null);

  useEffect(() => {
    const abortController = new AbortController();

    fetchWeather(city, { signal: abortController.signal })
      .then(setData)
      .catch((err) => {
        if (err.name === 'AbortError') return; // Ignore abort
        throw err;
      });

    // ✅ Cancel fetch on unmount
    return () => {
      abortController.abort();
    };
  }, [city]);

  return data;
}
```

#### ✅ BETTER (Use TanStack Query)

```tsx
// src/hooks/useWeather.ts (current project pattern)
import { useQuery } from '@tanstack/react-query';
import { fetchWeather } from '@/api/fetchWeather';

export function useWeather(city: string | undefined) {
  return useQuery({
    queryKey: ['weather', city],
    queryFn: () => fetchWeather(city!),
    enabled: !!city, // ✅ Prevents fetch with undefined
    staleTime: 5 * 60 * 1000, // 5 min
    gcTime: 10 * 60 * 1000, // 10 min
  });
  // TanStack Query handles cleanup automatically
}
```

---

### 🔴 Critical: Observer Leak

#### ❌ MEMORY LEAK

```tsx
// src/components/LazyImage.tsx
export function LazyImage({ src, alt }: Props) {
  const imgRef = useRef<HTMLImageElement>(null);

  useEffect(() => {
    const observer = new IntersectionObserver((entries) => {
      if (entries[0].isIntersecting) {
        imgRef.current?.setAttribute('src', src);
      }
    });

    if (imgRef.current) {
      observer.observe(imgRef.current);
    }

    // ❌ Observer not disconnected on unmount
  }, [src]);

  return <img ref={imgRef} alt={alt} />;
}
```

**Memory Impact**: Observer + callback retained, observed elements not released  
**Detection**: Heap snapshot → search for "Observer" objects

#### ✅ FIXED

```tsx
// src/components/LazyImage.tsx
export function LazyImage({ src, alt }: Props) {
  const imgRef = useRef<HTMLImageElement>(null);

  useEffect(() => {
    const observer = new IntersectionObserver((entries) => {
      if (entries[0].isIntersecting) {
        imgRef.current?.setAttribute('src', src);
        observer.disconnect(); // Optional: stop observing after load
      }
    });

    if (imgRef.current) {
      observer.observe(imgRef.current);
    }

    // ✅ Disconnect observer on unmount
    return () => {
      observer.disconnect();
    };
  }, [src]);

  return <img ref={imgRef} alt={alt} />;
}
```

**Common Observer Leaks**:

- `IntersectionObserver` without `.disconnect()`
- `ResizeObserver` without `.disconnect()`
- `MutationObserver` without `.disconnect()`
- `PerformanceObserver` without `.disconnect()`

---

## React Re-render Inefficiencies

### 🟠 High: Missing useMemo for Expensive Calculation

#### ⚠️ INEFFICIENT

```tsx
// src/pages/HomePage.tsx
export function HomePage() {
  const { data: favorites } = useFavorites();
  const { data: weatherData } = useWeatherBatch(favorites);

  // ❌ Recalculates on EVERY render (even unrelated state changes)
  const sortedCities = weatherData
    ?.filter((w) => w.temp > 0)
    .sort((a, b) => b.temp - a.temp);

  return (
    <div>
      {sortedCities?.map((city) => (
        <WeatherCard key={city.name} data={city} />
      ))}
    </div>
  );
}
```

**Performance Impact**: Filter + sort runs on every render  
**Detection**: React DevTools Profiler → check "Ranked" view, high self-time  
**Symptom**: Slight lag when typing in search or toggling theme

#### ✅ OPTIMIZED

```tsx
// src/pages/HomePage.tsx
export function HomePage() {
  const { data: favorites } = useFavorites();
  const { data: weatherData } = useWeatherBatch(favorites);

  // ✅ Only recalculates when weatherData changes
  const sortedCities = useMemo(() => {
    return weatherData
      ?.filter((w) => w.temp > 0)
      .sort((a, b) => b.temp - a.temp);
  }, [weatherData]);

  return (
    <div>
      {sortedCities?.map((city) => (
        <WeatherCard key={city.name} data={city} />
      ))}
    </div>
  );
}
```

**When to use `useMemo`**:

- Filtering/sorting large arrays (>20 items)
- Complex calculations (date parsing, formatting)
- Object transformations that create new references
- Derived state from multiple sources

**When NOT to use `useMemo`**:

- Simple primitives or small arrays (<10 items)
- Calculations that are faster than useMemo overhead
- Values already stable (e.g., from `useState`)

---

### 🟠 High: Inline Object/Array Creation Causing Re-renders

#### ⚠️ INEFFICIENT

```tsx
// src/pages/CityPage.tsx
export function CityPage() {
  const { name } = useParams();

  return (
    <>
      {/* ❌ New object created every render → child re-renders unnecessarily */}
      <WeatherCard
        city={name}
        options={{ showDetails: true, unit: 'metric' }}
      />
    </>
  );
}
```

**Performance Impact**: Child components re-render even when parent has no changes  
**Detection**: React DevTools Profiler → yellow bars show wasted renders

#### ✅ OPTIMIZED (useMemo)

```tsx
// src/pages/CityPage.tsx
export function CityPage() {
  const { name } = useParams();

  // ✅ Object reference stable across renders
  const options = useMemo(() => ({ showDetails: true, unit: 'metric' }), []);

  return (
    <>
      <WeatherCard city={name} options={options} />
    </>
  );
}
```

#### ✅ BETTER (Lift constant out)

```tsx
// src/pages/CityPage.tsx
const WEATHER_OPTIONS = { showDetails: true, unit: 'metric' }; // ✅ Outside component

export function CityPage() {
  const { name } = useParams();

  return (
    <>
      <WeatherCard city={name} options={WEATHER_OPTIONS} />
    </>
  );
}
```

---

### 🟠 High: Missing useCallback for Function Props

#### ⚠️ INEFFICIENT

```tsx
// src/components/CitySearch.tsx
export function CitySearch() {
  const [query, setQuery] = useState('');
  const navigate = useNavigate();

  // ❌ New function every render → child re-renders
  const handleSelect = (city: string) => {
    navigate(`/city/${city}`);
    setQuery('');
  };

  return <SearchDropdown onSelect={handleSelect} query={query} />;
}
```

**Performance Impact**: `SearchDropdown` re-renders even if `query` unchanged  
**Detection**: React DevTools Profiler → check if child renders when parent does

#### ✅ OPTIMIZED

```tsx
// src/components/CitySearch.tsx
export function CitySearch() {
  const [query, setQuery] = useState('');
  const navigate = useNavigate();

  // ✅ Function reference stable unless navigate changes
  const handleSelect = useCallback(
    (city: string) => {
      navigate(`/city/${city}`);
      setQuery('');
    },
    [navigate], // navigate is stable from React Router
  );

  return <SearchDropdown onSelect={handleSelect} query={query} />;
}
```

**When to use `useCallback`**:

- Function passed as prop to memoized child (`React.memo`)
- Function used as dependency in useEffect/useMemo
- Callback passed to expensive child component

**When NOT to use `useCallback`**:

- Event handlers on native DOM elements (`<button onClick={...}>`)
- Child component is not memoized
- Function doesn't cause re-render issues (profile first!)

---

### 🟡 Medium: Missing React.memo for Pure Component

#### ⚠️ INEFFICIENT

```tsx
// src/components/WeatherIcon.tsx
interface Props {
  condition: string;
  size?: 'sm' | 'md' | 'lg';
}

// ❌ Re-renders whenever parent re-renders (even if props unchanged)
export function WeatherIcon({ condition, size = 'md' }: Props) {
  return (
    <div className={`weather-icon ${condition} ${size}`}>
      {/* Expensive SVG rendering */}
    </div>
  );
}
```

**Performance Impact**: Unnecessary re-renders when parent updates unrelated state  
**Detection**: React DevTools Profiler → component renders but props didn't change

#### ✅ OPTIMIZED

```tsx
// src/components/WeatherIcon.tsx
import { memo } from 'react';

interface Props {
  condition: string;
  size?: 'sm' | 'md' | 'lg';
}

// ✅ Only re-renders when props change
export const WeatherIcon = memo(function WeatherIcon({
  condition,
  size = 'md',
}: Props) {
  return (
    <div className={`weather-icon ${condition} ${size}`}>
      {/* Expensive SVG rendering */}
    </div>
  );
});
```

**When to use `React.memo`**:

- Pure components (output depends only on props)
- Expensive render (complex JSX, heavy calculations)
- Rendered frequently in lists
- Parent re-renders often but props stay the same

**When NOT to use `React.memo`**:

- Props change frequently (memo overhead > benefit)
- Render is already fast
- Component at top of tree (no parent re-renders)

---

## TanStack Query Optimization

### 🟠 High: Missing `enabled` Guard

#### ⚠️ INEFFICIENT (Error-prone)

```tsx
// src/hooks/useWeather.ts
export function useWeather(city: string | undefined) {
  return useQuery({
    queryKey: ['weather', city],
    // ❌ Fetches with undefined city → error
    queryFn: () => fetchWeather(city!),
  });
}
```

**Performance Impact**: Unnecessary error handling, potential network request  
**Detection**: Console errors, network tab shows failed requests

#### ✅ OPTIMIZED

```tsx
// src/hooks/useWeather.ts
export function useWeather(city: string | undefined) {
  return useQuery({
    queryKey: ['weather', city],
    queryFn: () => fetchWeather(city!),
    // ✅ Only fetches when city is defined
    enabled: !!city,
  });
}
```

---

### 🟠 High: Suboptimal Cache Timings

#### ⚠️ INEFFICIENT

```tsx
// src/hooks/useWeather.ts
export function useWeather(city: string) {
  return useQuery({
    queryKey: ['weather', city],
    queryFn: () => fetchWeather(city),
    // ❌ Default: staleTime=0, gcTime=5min
    // Weather data refetches on every focus, wasting API quota
  });
}
```

**Performance Impact**: Excessive network requests, API quota drain  
**Detection**: Network tab shows repeated identical requests

#### ✅ OPTIMIZED

```tsx
// src/hooks/useWeather.ts
export function useWeather(city: string) {
  return useQuery({
    queryKey: ['weather', city],
    queryFn: () => fetchWeather(city),
    // ✅ Weather is fresh for 5min, cached for 10min
    staleTime: 5 * 60 * 1000, // Data considered fresh for 5 min
    gcTime: 10 * 60 * 1000, // Keep in cache for 10 min after unmount
  });
}
```

**Project Conventions (Weather App)**:

- **Current weather**: `staleTime: 5min, gcTime: 10min` (weather updates slowly)
- **Forecast**: `staleTime: 15min, gcTime: 30min` (forecast changes infrequently)
- **City search**: `staleTime: Infinity, gcTime: 30min` (city list is static)

---

### 🟡 Medium: Missing Query Key Scoping

#### ⚠️ CACHE BLOAT

```tsx
// src/hooks/useWeatherBatch.ts
export function useWeatherBatch(cities: string[]) {
  return useQuery({
    // ❌ Same key for all city combinations → cache doesn't differentiate
    queryKey: ['weather-batch'],
    queryFn: () => Promise.all(cities.map(fetchWeather)),
  });
}
```

**Performance Impact**: Cache invalidation issues, stale data  
**Detection**: React Query DevTools shows single entry for different data

#### ✅ OPTIMIZED

```tsx
// src/hooks/useWeatherBatch.ts
export function useWeatherBatch(cities: string[]) {
  return useQuery({
    // ✅ Key includes cities → separate cache per combination
    queryKey: ['weather-batch', cities.sort()], // sort for stable key
    queryFn: () => Promise.all(cities.map(fetchWeather)),
  });
}
```

---

## State Management Issues

### 🟠 High: State at Wrong Level

#### ⚠️ INEFFICIENT (Over-scoped)

```tsx
// src/pages/HomePage.tsx (page-level state)
export function HomePage() {
  // ❌ searchQuery only used in CitySearch, but stored at page level
  const [searchQuery, setSearchQuery] = useState('');

  return (
    <div>
      <CitySearch query={searchQuery} setQuery={setSearchQuery} />
      <FavoritesList /> {/* Re-renders when searchQuery changes */}
      <WeatherGrid /> {/* Re-renders when searchQuery changes */}
    </div>
  );
}
```

**Performance Impact**: Entire page re-renders on search input  
**Detection**: React DevTools Profiler → all children render on input

#### ✅ OPTIMIZED (Component-level state)

```tsx
// src/pages/HomePage.tsx
export function HomePage() {
  return (
    <div>
      <CitySearch /> {/* Manages own state */}
      <FavoritesList />
      <WeatherGrid />
    </div>
  );
}

// src/components/CitySearch.tsx
export function CitySearch() {
  // ✅ State scoped to component that uses it
  const [query, setQuery] = useState('');
  // Only CitySearch re-renders on input
}
```

---

### 🟡 Medium: Derived State Stored Instead of Computed

#### ⚠️ INEFFICIENT

```tsx
// src/hooks/useFavorites.ts
export function useFavorites() {
  const [favorites, setFavorites] = useState<string[]>([]);
  // ❌ Duplicate state — count is derived from favorites
  const [count, setCount] = useState(0);

  const addFavorite = (city: string) => {
    setFavorites((prev) => [...prev, city]);
    setCount((prev) => prev + 1); // Must keep in sync
  };

  return { favorites, count, addFavorite };
}
```

**Performance Impact**: Extra state updates, sync bugs  
**Detection**: Code review, potential state inconsistencies

#### ✅ OPTIMIZED

```tsx
// src/hooks/useFavorites.ts
export function useFavorites() {
  const [favorites, setFavorites] = useState<string[]>([]);

  const addFavorite = (city: string) => {
    setFavorites((prev) => [...prev, city]);
  };

  // ✅ Derived value computed on demand
  return { favorites, count: favorites.length, addFavorite };
}
```

---

## Profiling Interpretation Guide

### Chrome DevTools Memory Profiler

#### Taking Heap Snapshots

1. Open Chrome DevTools → Memory tab
2. Select "Heap snapshot"
3. **Baseline**: Take snapshot before interaction
4. **Interact**: Mount/unmount component, navigate, etc.
5. **After**: Take second snapshot
6. **Compare**: Click "Comparison" dropdown, select baseline

#### What to Look For

**🔴 Detached DOM Nodes**

- Indicates: DOM removed from page but still in memory (likely event listener or ref leak)
- Search: Filter by "Detached"
- Threshold: >0 detached nodes = likely leak

**🔴 Event Listeners Growing**

- Indicates: Listeners added but not removed
- Search: Filter by "EventListener"
- Threshold: Count should return to baseline after unmount

**🟠 Large Objects Retained**

- Indicates: Unnecessary data stored in state/closures
- Search: Filter by constructor name (e.g., "Array", "Object")
- Threshold: >1MB unexpected growth

**🟡 Shallow Size vs Retained Size**

- Shallow: Object itself (small)
- Retained: Object + everything it references (can be huge)
- Focus on high retained size for memory impact

---

### React DevTools Profiler

#### Recording a Profile

1. Open React DevTools → Profiler tab
2. Click record (blue circle)
3. Interact with component (type, click, navigate)
4. Stop recording
5. Analyze flame graph or ranked view

#### What to Look For

**🔴 Wasted Renders (Yellow Bars)**

- Indicates: Component rendered but props/state didn't change
- Flame graph: Yellow bars = no DOM update
- Fix: Add `React.memo`, check prop references

**🟠 Long Render Time (Wide Bars)**

- Indicates: Expensive computation or many children
- Ranked view: Sort by "Self duration"
- Fix: Add `useMemo`, split component, virtualize list

**🟡 Cascading Renders**

- Indicates: Parent re-render triggers all children
- Flame graph: Wide tree of components
- Fix: Lift state down, add `React.memo` to children

---

### Performance Monitor (Real-time)

Enable: DevTools → More tools → Performance monitor

**Thresholds**:

- **JS heap size**: Should stabilize, <50MB for small app
- **DOM nodes**: Should return to baseline after unmount
- **Event listeners**: Should return to baseline after unmount
- **JS event listeners**: Same as above
- **Layouts/sec**: <10 = good, >30 = layout thrashing
- **Recalc/sec**: <5 = good, >20 = excessive style changes

**Red Flags**:

- Heap size grows continuously (never stabilizes) → memory leak
- DOM nodes increase without unmounting → detached node leak
- Event listeners grow with each mount → missing cleanup

---

## Project-Specific Performance Patterns

### Weather App Conventions

**1. TanStack Query Configuration**

```tsx
// Current weather: updates slowly
staleTime: 5 * 60 * 1000; // 5 min
gcTime: 10 * 60 * 1000; // 10 min

// Forecast: updates infrequently
staleTime: 15 * 60 * 1000; // 15 min
gcTime: 30 * 60 * 1000; // 30 min

// Static data (city list)
staleTime: Infinity;
gcTime: 30 * 60 * 1000;
```

**2. localStorage (useFavorites)**

- Max 10 favorites (prevents unbounded growth)
- Store only city names (not full weather data)
- Clear on logout (if auth added)

**3. Component Optimization Priorities**

- `WeatherIcon`: Always memo (used in lists, expensive SVG)
- `WeatherCard`: Memo if >5 cards rendered
- `ForecastCard`: No memo (renders once, props change frequently)

**4. Lazy Loading Strategy**

- Route-level: `React.lazy(() => import('./pages/CityPage'))`
- Heavy libraries: defer chart/map libraries until needed
- Images: native `loading="lazy"` for forecast icons

---

## Auto-Fix Patterns (Safe to Apply)

### 1. Add useEffect Cleanup

```tsx
// Before
useEffect(() => {
  window.addEventListener('resize', handler);
}, []);

// After (auto-apply)
useEffect(() => {
  window.addEventListener('resize', handler);
  return () => window.removeEventListener('resize', handler);
}, []);
```

### 2. Fix Missing Dependencies

```tsx
// Before (ESLint warning)
useEffect(() => {
  fetchData(userId);
}, []); // ❌ Missing userId

// After (auto-apply)
useEffect(() => {
  fetchData(userId);
}, [userId]); // ✅ Added
```

### 3. Add useMemo for Expensive Filters

```tsx
// Before
const filtered = data.filter(expensiveCheck).sort(expensiveSort);

// After (auto-apply if data.length >20)
const filtered = useMemo(
  () => data.filter(expensiveCheck).sort(expensiveSort),
  [data],
);
```

---

## Complex Changes (Ask First)

### 1. Component Restructuring

**Before asking**, analyze:

- Impact: How many files change?
- Risk: Does it change component API?
- Benefit: Measurable performance gain?

**Example**:

> **Complex change detected: Extract theme logic to custom hook**
>
> Current: 3 components duplicate theme state
> Proposed: Single `useTheme` hook
> Benefit: -4KB (eliminates duplicate code)
> Risk: Changes component API, requires test updates
>
> Proceed? [y/n]

### 2. Lazy Loading / Code Splitting

**Before asking**, check:

- Bundle size impact (must be >50KB saved)
- User flow (don't lazy-load critical path)
- Loading state (need fallback UI?)

**Example**:

> **Lazy loading opportunity: CityPage component**
>
> Current size: 87KB (includes chart library)
> Saved: ~65KB on initial load
> Trade-off: 200ms delay on first /city/\* navigation
>
> Apply? [y/n]

### 3. React.memo / useCallback

**Before asking**, confirm:

- Profiler shows actual re-render issue (not premature optimization)
- Component is expensive (>16ms render)
- Props/callbacks are stable

---

## Testing After Fixes

**Mandatory checks**:

```bash
# 1. Run component tests
npm test <ComponentName>.test.tsx

# 2. Verify behavior unchanged
# - Check test output for failures
# - If failed: analyze diff, revert if breaking

# 3. Re-profile if leak was fixed
# Chrome DevTools > Memory > Compare snapshots
# Verify: Heap size returns to baseline after unmount
```

**Revert criteria**:

- Any test fails → immediate revert
- Behavior changes unexpectedly → revert
- Profiling shows no improvement → revert (optimization not needed)
