---
description: 'Review the currently open file for issues, then automatically apply safe refactoring fixes. Runs tests to verify behavior is preserved.'
argument-hint: 'focus area (optional: security, types, conventions, performance, all)'
agent: Code Reviewer
---

Perform a two-step review and fix workflow:

## Step 1: Review

Review the currently open file for issues across all severity levels:

- 🔴 Critical: runtime errors, security vulnerabilities, TypeScript violations
- 🟠 High: wrong error types, bypassed parsers, architecture violations
- 🟡 Medium: convention violations (exports, imports, component structure)
- 🔵 Low: accessibility, magic numbers, unused code

If an argument is provided (security, types, conventions, performance, all), focus the review on that specific area but still report critical findings.

Produce a structured report with:

1. One-line verdict
2. Findings grouped by severity with line numbers
3. Concrete fix suggestions for each issue

## Step 2: Auto-Fix

After showing the review report, automatically invoke the **Refactoring Specialist** agent via the "Apply Refactors" handoff to:

- Apply high and medium priority structural changes
- Preserve all behavior (no logic changes)
- Run tests before and after to verify nothing breaks
- Skip critical security issues that require manual review
- Report what was fixed and what requires manual attention

**Safety**: Only applies safe refactors (imports, exports, component structure, type annotations). Security vulnerabilities and logic errors require manual review.
