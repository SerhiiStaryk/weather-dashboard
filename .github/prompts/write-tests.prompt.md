---
agent: Test Writer
description: Write or update Vitest tests for the open source file
---

> **Note:** Switch to the **Test Writer** agent before running this prompt.

Write or update Vitest + Testing Library tests for the currently open file.

Before writing:

1. Determine the expected test file path (mirror source path under `tests/`, add `.test.ts(x)`).
2. Check if that file already exists. If it does, read it first and **update** it — do not overwrite existing passing tests.
3. If it does not exist, create it from scratch.
