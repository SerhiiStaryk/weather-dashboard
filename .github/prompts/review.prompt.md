---
description: 'Review the currently open file for bugs, security vulnerabilities, type-safety issues, and project convention violations. Returns a structured severity-ranked report.'
argument-hint: 'focus area (optional: security, types, conventions, performance, all)'
agent: Code Reviewer
---

Review the currently open file for issues across all severity levels:

- 🔴 Critical: runtime errors, security vulnerabilities, TypeScript violations
- 🟠 High: wrong error types, bypassed parsers, architecture violations
- 🟡 Medium: convention violations (exports, imports, component structure)
- 🔵 Low: accessibility, magic numbers, unused code

Focus areas:

- `security`: XSS, injection, API key exposure, OWASP Top 10
- `types`: TypeScript strict mode, `any` usage, unsafe casts, type guards
- `conventions`: Project patterns (imports, exports, component structure, hooks)
- `performance`: React re-renders, missing memo/useCallback, expensive computations, component lifecycle
- `all`: Full review (default)

If an argument is provided, focus the review on that specific area but still report critical findings in all categories.

Produce a structured report with:

1. One-line verdict (✅ No issues / ⚠️ N issues found)
2. Findings grouped by severity with line numbers
3. Concrete fix suggestions for each issue
4. Summary of top 5 action items
