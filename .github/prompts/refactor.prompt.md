---
agent: Refactoring Specialist
description: Refactor the open file to follow all project conventions
argument-hint: 'Optional: specific focus area'
---

Refactor the currently open file to follow all project conventions and improve code structure.

## Before You Start

1. **Show me a preview** of the refactoring plan:
   - What structural issues did you find?
   - What specific changes will you make?
   - Which conventions will be applied?
   - Estimated impact (files created/modified)

2. **Wait for my confirmation** before making any changes.

## After I Approve

Apply all recommended refactorings systematically, following your priority system:

- 🔴 High-Impact: Extract logic, split large files, fix TypeScript conventions
- 🟠 Medium-Impact: Rename unclear identifiers, extract repeated JSX
- 🟡 Low-Impact: Optimize imports, extract constants

Run tests before and after to verify behavior is preserved.

## Final Report

Provide a detailed change report showing:

- Specific transformations applied
- All files modified or created
- Test results (before/after)
- Impact on maintainability
