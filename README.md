# Weather Dashboard

A React 18 + TypeScript weather app with city search, favorites, and 3-day forecasts — powered by the OpenWeatherMap API.

## Tech Stack

| Layer        | Library / Version                                        |
| ------------ | -------------------------------------------------------- |
| UI           | React 19, TypeScript 5.9 (strict + `erasableSyntaxOnly`) |
| Build        | Vite 8, `@tailwindcss/vite` (Tailwind v4)                |
| Routing      | React Router v7                                          |
| Server state | TanStack Query v5                                        |
| API mocking  | MSW v2 (Node server for tests, browser worker for dev)   |
| Testing      | Vitest 4, Testing Library, jsdom                         |

## Getting Started

### Prerequisites

- Node.js 20+
- An [OpenWeatherMap](https://openweathermap.org/api) API key (free tier works)

### Install & run

```bash
npm install

# copy the example env file and add your API key
cp .env.example .env
# VITE_OPENWEATHER_API_KEY=your_key_here
npm run dev      # http://localhost:5173
```

### Environment variables

| Variable                   | Required | Default                          |
| -------------------------- | -------- | -------------------------------- |
| `VITE_OPENWEATHER_API_KEY` | Yes      | —                                |
| `VITE_API_BASE_URL`        | No       | `https://api.openweathermap.org` |

## Scripts

```bash
npm run dev           # Vite dev server with MSW browser worker
npm run build         # tsc + Vite production bundle
npm run preview       # Preview production build locally
npm run lint          # ESLint
npm run test          # Vitest (single run)
npm run test:watch    # Vitest watch mode
npm run test:coverage # Coverage report
```

## Project Structure

src/
api/ # HTTP fetching + response parsing (no React)
components/ # Reusable UI components
hooks/ # Data + local-state hooks
mocks/ # MSW handlers, Node server, browser worker, fixtures
pages/ # Route-level components
types/ # Shared TypeScript interfaces (no logic)
tests/
components/ # Component tests (Testing Library)
setup.ts # MSW lifecycle + jest-dom matchers

```

## Routes

| ------------- | ---------- | ------------------------------------------- |
| `/`           | `HomePage` | City search bar + saved favorites grid      |
| `/city/:name` | `CityPage` | Current weather + 3-day forecast for a city |
| `*`           | —          | Redirects to `/`                            |

## Key Modules

### API (`src/api/`)

- `fetchWeather.ts` — fetches `/data/2.5/weather` and `/data/2.5/forecast` from OpenWeatherMap
- `weatherParser.ts` — transforms raw API responses into typed `WeatherData` / `ForecastDay[]`
- `errors.ts` — maps HTTP status codes to typed `WeatherError` instances
### Hooks (`src/hooks/`)
#### Performance Analyzer

Memory-focused performance analysis for the currently open file. Detects memory leaks, component lifecycle issues, missing cleanup, event listener problems, and React re-render inefficiencies. Generates a detailed report with metrics, bottlenecks, and prioritized recommendations — can apply optimizations automatically. Supports both single-file and project-wide analysis modes.

**How to invoke:**

1. Open the file or folder you want analyzed.
2. Open the Copilot Chat panel.
3. Switch the agent to **Performance Analyzer** using the agent picker.
4. Send a message like "analyze this file for memory leaks" or "run a project-wide performance audit".

---


- `useWeather(city)` — TanStack Query wrapper; fetches current + forecast in parallel, caches for 5 min
- `useFavorites()` — manages a favorites list in `localStorage` (add / remove / isFavorite)

### Components (`src/components/`)

| Component             | Purpose                                                             |
| --------------------- | ------------------------------------------------------------------- |
| `CitySearch`          | Search form → navigates to `/city/:name`                            |
| `WeatherCard`         | Main current-weather detail card (temp, feels-like, humidity, wind) |
| `ForecastCard`        | Single forecast day (high/low, description, icon)                   |
| `FavoriteWeatherCard` | Compact city card shown in the favorites grid                       |
| `FavoritesList`       | Grid container for `FavoriteWeatherCard` items                      |
| `ErrorMessage`        | User-friendly error display mapped from `WeatherError` type         |
| `LoadingSkeleton`     | Pulse-animation placeholders shown while fetching                   |


## GitHub Copilot Agents

### Agents

#### Performance Analyzer

Memory-focused performance analysis for the currently open file. Detects memory leaks, component lifecycle issues, missing cleanup, event listener problems, and React re-render inefficiencies. Generates a detailed report with metrics, bottlenecks, and prioritized recommendations — can apply optimizations automatically. Supports both single-file and project-wide analysis modes.

**How to invoke:**

1. Open the file or folder you want analyzed.
2. Open the Copilot Chat panel.
3. Switch the agent to **Performance Analyzer** using the agent picker.
4. Send a message like "analyze this file for memory leaks" or "run a project-wide performance audit".

---

#### Test Writer

Writes or updates Vitest + Testing Library tests for the currently open source file. Reads the file, checks if a test file already exists and updates it if so, otherwise creates a new one — following project conventions, then runs the suite to confirm it passes.

**How to invoke:**

1. Open the relevant source file (if applicable).
2. Open the Copilot Chat panel.
3. Switch the agent to **Test Writer** using the agent picker.
4. Send a message describing what you want, or run the associated `/write-tests` prompt.

---

#### Readme Updater

Keeps README.md in sync whenever a new prompt (.prompt.md) or agent (.agent.md) is added or changed. Reads all files in .github/prompts/ and .github/agents/, then updates the "GitHub Copilot Agents" section in README.md to reflect the current state — without touching any other section.

**How to invoke:**

1. Open the Copilot Chat panel.
2. Switch the agent to **Readme Updater** using the agent picker.
3. Send a message describing what you want, such as "update the readme".

---

#### Code Reviewer

Reviews the currently open file for bugs, type-safety issues, security vulnerabilities (OWASP), and violations of project conventions (TypeScript strict mode, component/hook/API/test patterns). Produces a structured report with severity-tagged findings and concrete fix suggestions — does NOT edit any files.

**How to invoke:**

1. Open the file you want reviewed.
2. Open the Copilot Chat panel.
3. Switch the agent to **Code Reviewer** using the agent picker.
4. Send a message describing what you want reviewed.

---

#### Security Auditor

Deep security analysis for the currently open file. Identifies OWASP Top 10 vulnerabilities, secrets exposure, injection flaws, authentication bypasses, and insecure dependencies. Returns a threat-prioritized report with exploit scenarios and remediation steps — does NOT edit files.

Reads project security conventions and detection patterns from `.github/instructions/security-auditor.instructions.md` and other relevant instructions files. Checks dependencies, traces user input, and evaluates against React/TypeScript security issues. Reports findings with threat modeling and concrete fixes. Can hand off to a fix agent for remediation.

**How to invoke:**

1. Open the file you want to audit.
2. Open the Copilot Chat panel.
3. Switch the agent to **Security Auditor** using the agent picker.
4. Send a message describing what you want, or run the associated `/security-audit` prompt.

---

#### Refactoring Specialist

Restructures code to follow project conventions after Code Reviewer identifies improvements. Extracts components/hooks, renames for clarity, converts patterns, and improves file organization — preserves behavior, verifies with tests.

**How to invoke:**

1. Open the file you want to refactor.
2. Open the Copilot Chat panel.
3. Use Code Reviewer agent first, then click the **"Apply Refactors"** handoff button.
4. Alternatively, use one of the refactoring prompts: `/refactor`, `/extract-hook`, `/extract-component`, or `/fix-conventions`.

### Prompts

| Slash command        | Agent                  | Description                                                  |
| -------------------- | ---------------------- | ------------------------------------------------------------ |
| `/write-tests`       | Test Writer            | Write or update Vitest tests for the open source file        |
| `/update-readme`     | Readme Updater         | Update the "GitHub Copilot Agents" section in README.md      |
| `/security-audit`    | Security Auditor       | Run a deep security audit on the currently open file         |
| `/refactor`          | Refactoring Specialist | Refactor the open file to follow all project conventions     |
| `/extract-hook`      | Refactoring Specialist | Extract business logic from the open file into a custom hook |
| `/extract-component` | Refactoring Specialist | Extract a reusable component from the open file              |
| `/fix-conventions`   | Refactoring Specialist | Fix TypeScript conventions and imports in the open file      |

| `/performance-analysis` | Performance Analyzer     | Analyze the currently open file for memory leaks and performance issues |

### Mocks (`src/mocks/`)

MSW intercepts `api.openweathermap.org` requests. Special city names trigger error states:

| City name | Response |
| anything else | 200 with London fixture data |
| `unknown` | 404 Not Found |
| `badkey` | 401 Unauthorized |
| `error` | 500 Server Error |

## Project Ideas Skill

You can brainstorm and prioritize improvement ideas for this project using the **project-ideas** skill.

**How to use:**

1. Open the Copilot Chat panel.
2. Type `/project-ideas` and optionally add a focus area (e.g. `/project-ideas features`, `/project-ideas ux`, `/project-ideas testing`).
3. The skill will scan the codebase and output a prioritized table of actionable ideas, plus a quick-win starter.

**Categories:**

- `features` — new functionality
- `ux` — user experience polish
- `dx` — developer experience
- `testing` — test coverage
- `architecture` — code structure
- `all` — everything

Example:

```

/project-ideas features

```

See `.github/skills/project-ideas/SKILL.md` for details.
```
