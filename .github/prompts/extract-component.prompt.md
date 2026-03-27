---
agent: Refactoring Specialist
description: Extract a reusable component from the open file
argument-hint: 'Optional: component name'
---

Extract a reusable component from the currently open file to improve code organization.

## Discovery Phase

Analyze the open file and propose:

1. Which parts should be extracted into separate components?
2. What would you name each extracted component?
3. What props interface would each component have?
4. Where would the new component files be created?
5. How would this improve the file structure?

**Show me the extraction plan and wait for approval.**

## After I Approve

1. Create new component file(s) in `src/components/`
2. Extract the JSX and relevant logic
3. Define proper props interfaces
4. Update the original file to use the new component(s)
5. Ensure import paths use `@/` alias
6. Verify tests exist
7. Run tests to confirm behavior is preserved

## Final Report

Include:

- New component file paths with their interfaces
- What was extracted and why
- Updated structure of the original file
- Test results (before/after)
- Benefits to maintainability
