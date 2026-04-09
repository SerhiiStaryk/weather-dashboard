import {
  createMcpContextStore,
  serializeMcpContext,
  type McpContext,
  type McpContextStore,
} from '@/mcp/context';

const defaultContext: McpContext = {
  ttl_ms: 5 * 60 * 1000,
  cached_payloads: {},
};

const MCP_CONTEXT_STORAGE_KEY = 'weather-dashboard.mcp.context';

function hasBrowserStorage(): boolean {
  return (
    typeof window !== 'undefined' && typeof window.localStorage !== 'undefined'
  );
}

function isObject(value: unknown): value is Record<string, unknown> {
  return typeof value === 'object' && value !== null && !Array.isArray(value);
}

function readPersistedContext(): McpContext | undefined {
  if (!hasBrowserStorage()) {
    return undefined;
  }

  const raw = window.localStorage.getItem(MCP_CONTEXT_STORAGE_KEY);
  if (!raw) {
    return undefined;
  }

  try {
    const parsed: unknown = JSON.parse(raw);
    if (!isObject(parsed)) {
      return undefined;
    }
    return parsed as McpContext;
  } catch {
    return undefined;
  }
}

class McpWeatherServer {
  private readonly contextStore: McpContextStore;

  constructor(initialContext: McpContext = defaultContext) {
    const persisted = readPersistedContext();
    this.contextStore = createMcpContextStore(persisted ?? initialContext);
  }

  getStore(): McpContextStore {
    return this.contextStore;
  }

  persistConfirmedContext(): void {
    if (!hasBrowserStorage()) {
      return;
    }

    const serialized = serializeMcpContext(this.contextStore.getContext());
    window.localStorage.setItem(MCP_CONTEXT_STORAGE_KEY, serialized);
  }
}

export const mcpWeatherServer = new McpWeatherServer();
