---
name: project-ideas
description: >
  Brainstorm and prioritize improvement ideas for the weather dashboard.
  Use for: suggesting new features, identifying missing UX polish, proposing
  developer-experience upgrades, finding test coverage gaps, and spotting
  architecture improvements. Produces a prioritized, actionable idea list
  grounded in what the codebase already does.
argument-hint: 'Area to focus on: features | ux | dx | testing | architecture | all'
---

# Project Ideas

Produces a prioritized list of concrete improvement ideas for the weather
dashboard, grounded in the actual codebase state.

## When to Use

- "Give me ideas to improve the project"
- "What features could I add next?"
- "What's missing from this app?"
- "How can I improve DX / testing / architecture?"

## Procedure

1. **Scan the codebase** — read `src/` structure, `package.json`, `README.md`,
   and `agent_log.md` to understand what already exists and what tradeoffs were
   already noted.
2. **Load the idea catalog** — read [./references/ideas.md](./references/ideas.md)
   for the full categorized list of potential improvements.
3. **Filter by argument** — if the user passed an area (`features`, `ux`, `dx`,
   `testing`, `architecture`), show only that category; otherwise show all.
4. **Score each idea** in context:
   - **Impact** (H/M/L): user-visible value or developer productivity gain
   - **Effort** (H/M/L): estimated complexity given the current stack
   - **Fits stack** (✅/⚠️): whether it works naturally with
     React 18 + TanStack Query + MSW + Vitest or requires a new dependency
5. **Output** the top 5–10 ideas in a scored table, followed by an
   **Implementation Starter** section with a concrete first step for the
   highest-impact, lowest-effort pick.

## Output Format

```
## 💡 Project Ideas — <Category>

| # | Idea | Impact | Effort | Fits Stack |
|---|------|--------|--------|------------|
| 1 | ... | H | L | ✅ |
...

---

### 🚀 Quick Win: <Title>

**What:** one-sentence description
**Why:** benefit to the user or developer
**How to start:**
1. <concrete first step>
2. <second step>
3. <where to add it in the codebase>
```
