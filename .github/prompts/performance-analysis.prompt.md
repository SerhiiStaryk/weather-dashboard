---
agent: Performance Analyzer
description: Analyze the currently open file for memory leaks and performance issues
---

Perform a comprehensive performance analysis of the currently open file. Detect memory leaks, component lifecycle issues, missing cleanup, React re-render inefficiencies, and TanStack Query optimization opportunities. Generate a detailed report with profiling metrics, severity-tagged findings, and prioritized recommendations.

## What Gets Analyzed

- **Memory leaks**: Event listeners, timers, async operations, observers
- **Component lifecycle**: State updates on unmounted components, missing cleanup
- **Re-render efficiency**: Missing useMemo/useCallback/React.memo, inline object creation
- **TanStack Query**: Missing `enabled` guards, suboptimal cache timings, query key issues
- **State management**: Over-scoped state, derived state stored unnecessarily

## Workflow

1. **Profile** the component with actual tools (Chrome DevTools Memory, React DevTools Profiler)
2. **Report** findings grouped by severity with memory impact estimates
3. **Offer to apply fixes**:
   - ✅ Auto-apply: cleanup returns, dependency arrays
   - ⚠️ Ask first: restructuring, lazy loading, memoization
4. **Run tests** after every single edit to verify behavior is preserved

## Optional Arguments

Add these to customize the analysis:

- **`--project-wide`** — Analyze all components in `src/components/` and `src/pages/` instead of just the open file
- **`--report-only`** — Skip fix application, generate report only
- **`--auto-fix`** — Apply all safe optimizations without asking (cleanup, deps only)

## Example Invocations

**Standard single-file analysis:**

```
#performance-analysis
```

**Project-wide audit (no fixes):**

```
#performance-analysis --project-wide --report-only
```

**Auto-fix memory leaks:**

```
#performance-analysis --auto-fix
```
