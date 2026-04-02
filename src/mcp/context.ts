import type { CurrentWeatherRaw, ForecastRaw } from '@/types/weather';

export interface McpCachedPayload {
  city: string;
  current: CurrentWeatherRaw;
  forecast: ForecastRaw;
  cached_at: number;
  ttl_ms: number;
  expires_at: number;
}

export interface McpContext {
  ttl_ms?: number;
  cached_payloads?: Record<string, McpCachedPayload> | McpCachedPayload[];
  [key: string]: unknown;
}

const DEFAULT_TTL_MS = 5 * 60 * 1000;

const SENSITIVE_KEY_PATTERN =
  /(api[-_]?key|token|secret|password|authorization|auth|credentials?)/i;

function deepClone<T>(value: T): T {
  return JSON.parse(JSON.stringify(value)) as T;
}

function normalizeCity(city: string): string {
  return city.trim().toLowerCase();
}

function readCachedPayload(
  context: McpContext,
  city: string,
): McpCachedPayload | undefined {
  const key = normalizeCity(city);
  const cachedPayloads = context.cached_payloads;

  if (!cachedPayloads) return undefined;

  if (Array.isArray(cachedPayloads)) {
    return cachedPayloads.find((entry) => normalizeCity(entry.city) === key);
  }

  return cachedPayloads[key];
}

function writeCachedPayload(
  context: McpContext,
  city: string,
  payload: McpCachedPayload,
): void {
  const key = normalizeCity(city);

  if (!context.cached_payloads) {
    context.cached_payloads = {};
  }

  if (Array.isArray(context.cached_payloads)) {
    const index = context.cached_payloads.findIndex(
      (entry) => normalizeCity(entry.city) === key,
    );
    if (index === -1) {
      context.cached_payloads.push(payload);
      return;
    }
    context.cached_payloads[index] = payload;
    return;
  }

  context.cached_payloads[key] = payload;
}

function isExpired(payload: McpCachedPayload, now: number): boolean {
  if (typeof payload.expires_at === 'number') {
    return payload.expires_at <= now;
  }

  const ttlMs =
    typeof payload.ttl_ms === 'number' && payload.ttl_ms > 0
      ? payload.ttl_ms
      : DEFAULT_TTL_MS;
  return payload.cached_at + ttlMs <= now;
}

function redactSensitive(value: unknown): unknown {
  if (Array.isArray(value)) {
    return value.map((item) => redactSensitive(item));
  }

  if (value && typeof value === 'object') {
    const record = value as Record<string, unknown>;
    const next: Record<string, unknown> = {};

    for (const key of Object.keys(record).sort()) {
      if (SENSITIVE_KEY_PATTERN.test(key)) {
        continue;
      }
      next[key] = redactSensitive(record[key]);
    }

    return next;
  }

  return value;
}

export function serializeMcpContext(context: McpContext): string {
  return JSON.stringify(redactSensitive(context));
}

export class McpContextStore {
  private confirmed: McpContext;
  private draft: McpContext;

  constructor(initialContext: McpContext = {}) {
    this.confirmed = deepClone(initialContext);
    this.draft = deepClone(initialContext);
  }

  getContext(): McpContext {
    return deepClone(this.confirmed);
  }

  readCache(city: string, now = Date.now(), allowExpired = false) {
    const payload = readCachedPayload(this.confirmed, city);
    if (!payload) return undefined;
    if (!allowExpired && isExpired(payload, now)) {
      return undefined;
    }
    return deepClone(payload);
  }

  stageCache(
    city: string,
    raw: {
      current: CurrentWeatherRaw;
      forecast: ForecastRaw;
    },
    now = Date.now(),
  ): void {
    const ttlMs =
      typeof this.draft.ttl_ms === 'number' && this.draft.ttl_ms > 0
        ? this.draft.ttl_ms
        : DEFAULT_TTL_MS;

    const payload: McpCachedPayload = {
      city: city.trim(),
      current: raw.current,
      forecast: raw.forecast,
      cached_at: now,
      ttl_ms: ttlMs,
      expires_at: now + ttlMs,
    };

    writeCachedPayload(this.draft, city, payload);
  }

  verify(verifier: (draft: McpContext) => boolean = () => true): boolean {
    const snapshot = deepClone(this.draft);
    const ok = verifier(snapshot);
    if (!ok) {
      return false;
    }

    this.confirmed = snapshot;
    this.draft = deepClone(snapshot);
    return true;
  }

  rollback(): void {
    this.draft = deepClone(this.confirmed);
  }

  serializeConfirmed(): string {
    return serializeMcpContext(this.confirmed);
  }
}

export function createMcpContextStore(initialContext: McpContext = {}) {
  return new McpContextStore(initialContext);
}
