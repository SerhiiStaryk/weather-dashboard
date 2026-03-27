---
agent: Refactoring Specialist
description: Extract business logic from the open file into a custom hook
argument-hint: 'Optional: hook name suggestion'
---

Extract business logic from the currently open file into a properly structured custom hook.

## Analysis Phase

First, analyze the open file and tell me:

1. What business logic did you identify that should be extracted?
2. What would you name the new hook?
3. What would the hook's interface be (parameters, return value)?
4. Where would the hook file be created?
5. What will remain in the original file after extraction?

**Wait for my confirmation** before proceeding.

## After Approval

1. Create the new hook file in `src/hooks/`
2. Move the business logic into the hook
3. Update the original file to use the hook
4. Ensure TypeScript types are properly defined
5. Verify tests exist for both files
6. Run tests to confirm behavior is preserved

## Report Format

Show me:

- The new hook file path and its interface
- What was moved and what stayed
- Test results before/after
- Usage example in the original file
