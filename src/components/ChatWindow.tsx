import { useMemo, useState } from 'react';
import type { SyntheticEvent } from 'react';

import { useFavorites } from '@/hooks/useFavorites';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';

interface ChatMessage {
  id: number;
  role: 'user' | 'assistant';
  text: string;
}

// Local reply helper removed: replies are expected from the backend API.

function formatOutgoingMessage(input: string, fallbackCity?: string) {
  const trimmed = input.trim();

  if (/^what should i wear in/i.test(trimmed)) return trimmed;

  const lc = trimmed.toLowerCase();

  // Handle relative dates like 'tomorrow' and 'today'
  let dateObj: Date | null = null;
  if (lc.includes('tomorrow')) {
    dateObj = new Date();
    dateObj.setDate(dateObj.getDate() + 1);
  } else if (lc.includes('today')) {
    dateObj = new Date();
  }

  // Try to find explicit date if no relative date matched
  if (!dateObj) {
    const explicit = trimmed.match(new RegExp('(\\d{1,4}[-/]\\d{1,2}[-/]\\d{1,4})'));
    if (explicit) {
      const raw = explicit[1].replace(/\//g, '-');
      const parts = raw.split('-').map(Number);
      if (parts.length === 3) {
        let y = parts[0],
          m = parts[1],
          d = parts[2];
        if (y < 1000) {
          d = parts[0];
          m = parts[1];
          y = parts[2];
        }
        const parsed = new Date(y, m - 1, d);
        if (!Number.isNaN(parsed.getTime())) dateObj = parsed;
      }
    }
  }

  // Find city in the input: 'in <city>' preferred
  let city: string | undefined;
  const inMatch = trimmed.match(
    /in\s+([A-Za-z\u00C0-\u024F\u0400-\u04FF-]+(?:\s+[A-Za-z\u00C0-\u024F\u0400-\u04FF-]+)*)/i,
  );
  if (inMatch) city = inMatch[1];

  // If still no city, use fallback if provided
  if (!city && fallbackCity) city = fallbackCity;

  if (city && dateObj) {
    const dd = String(dateObj.getDate()).padStart(2, '0');
    const mm = String(dateObj.getMonth() + 1).padStart(2, '0');
    const yyyy = dateObj.getFullYear();
    const dateStr = `${dd}-${mm}-${yyyy}`;
    return `What should I wear in ${city.toLowerCase()} at ${dateStr}`;
  }

  return trimmed;
}

function readEnvVar(key: string): string | undefined {
  const im = import.meta as unknown;
  if (typeof im === 'object' && im && 'env' in im) {
    const env = (im as { env?: Record<string, unknown> }).env;
    const v = env?.[key];
    if (typeof v === 'string') return v;
  }

  if (typeof process !== 'undefined' && typeof (process as unknown) === 'object') {
    const proc = process as unknown as { env?: Record<string, string | undefined> };
    const v = proc.env?.[key];
    if (typeof v === 'string') return v;
  }

  const g = globalThis as unknown as Record<string, unknown>;
  const gv = g[key];
  if (typeof gv === 'string') return gv;

  return undefined;
}

function readGlobalFlag(name: string): boolean {
  const g = globalThis as unknown as Record<string, unknown>;
  const v = g[name];
  return typeof v === 'boolean' ? v : false;
}

const INITIAL_MESSAGES: ChatMessage[] = [
  {
    id: 1,
    role: 'assistant',
    text: 'Hi, I am your weather helper. Ask things like: What should I wear tomorrow?',
  },
];

export function ChatWindow() {
  const CHAT_API_URL = (import.meta.env.VITE_CHAT_API_URL as string) || '';
  const { favorites } = useFavorites();
  const [draft, setDraft] = useState('');
  const [messages, setMessages] = useState<ChatMessage[]>(INITIAL_MESSAGES);
  const [showCityPicker, setShowCityPicker] = useState(false);
  const [pendingDraft, setPendingDraft] = useState<string | null>(null);

  const nextId = useMemo(() => messages.length + 1, [messages.length]);

  async function handleSubmit(event: SyntheticEvent<HTMLFormElement>) {
    event.preventDefault();

    const trimmed = draft.trim();
    if (!trimmed) return;

    // Do not auto-fallback to favorites here — prompt user to pick if city missing
    // Check if message already contains an explicit city ("in <city>")
    const hasExplicitCity = /in\s+[A-Za-z\u00C0-\u024F\u0400-\u04FF-]+/i.test(trimmed);

    if (!hasExplicitCity && favorites.length > 0) {
      // If user asked about a relative date or a date, prompt to choose a city
      const wantsDate = new RegExp('tomorrow|today|\\d{1,4}[-/]\\d{1,2}[-/]\\d{1,4}', 'i').test(trimmed);
      if (wantsDate) {
        setPendingDraft(trimmed);
        setShowCityPicker(true);
        return;
      }
    }

    const outgoing = formatOutgoingMessage(trimmed);

    const userMessage: ChatMessage = {
      id: nextId,
      role: 'user',
      text: trimmed,
    };

    // If chat replies are disabled via env/flag, only add the user message
    const chatRepliesDisabled = readEnvVar('VITE_CHAT_DISABLE') === 'true' || readGlobalFlag('__CHAT_DISABLE');

    if (chatRepliesDisabled) {
      setMessages(prev => [...prev, userMessage]);
      setDraft('');
      return;
    }

    const assistantId = nextId + 1;
    const assistantPlaceholder: ChatMessage = {
      id: assistantId,
      role: 'assistant',
      text: '…',
    };

    setMessages(prev => [...prev, userMessage, assistantPlaceholder]);
    setDraft('');

    // During tests, avoid network calls — use local reply
    const isTestEnv = readEnvVar('VITEST') === 'true' || readGlobalFlag('__vitest');

    if (isTestEnv) {
      const reply = 'No assistant reply available in test environment.';
      setMessages(prev => prev.map(m => (m.id === assistantId ? { ...m, text: reply } : m)));
      return;
    }

    const endpoint = CHAT_API_URL || '/api/Chat';

    try {
      const res = await fetch(endpoint, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ message: outgoing }),
      });
      let assistantText = '';

      if (!res.ok) {
        try {
          const contentType = res.headers.get('content-type') || '';
          if (contentType.includes('application/json')) {
            const data = await res.json();
            console.error('Chat API error response:', res.status, data);
          } else {
            const txt = await res.text();
            console.error('Chat API error response:', res.status, txt);
          }
        } catch (e) {
          console.error('Chat API error while reading response:', e);
        }

        if (res.status >= 500) {
          assistantText = 'Service temporarily unavailable. Please try again later.';
        } else if (res.status === 429) {
          assistantText = 'Rate limit exceeded. Please try again later.';
        } else {
          assistantText = `Request failed (${res.status}).`;
        }
      } else {
        const contentType = res.headers.get('content-type') || '';
        if (contentType.includes('application/json')) {
          const data = await res.json();
          assistantText = data?.message ?? data?.reply ?? JSON.stringify(data);
        } else {
          assistantText = await res.text();
        }
        if (!assistantText) assistantText = 'No assistant reply available.';
      }

      setMessages(prev => prev.map(m => (m.id === assistantId ? { ...m, text: assistantText } : m)));
    } catch (error) {
      console.error('Chat send error:', error);
      const fallback = 'No assistant reply available.';
      setMessages(prev => prev.map(m => (m.id === assistantId ? { ...m, text: fallback } : m)));
    }
  }

  async function submitWithCity(selectedCity: string) {
    if (!pendingDraft) return;
    const trimmed = pendingDraft;
    const outgoing = formatOutgoingMessage(trimmed, selectedCity);

    const userMessage: ChatMessage = {
      id: nextId,
      role: 'user',
      text: trimmed,
    };

    const assistantId = nextId + 1;
    const assistantPlaceholder: ChatMessage = {
      id: assistantId,
      role: 'assistant',
      text: '…',
    };

    setMessages(prev => [...prev, userMessage, assistantPlaceholder]);
    setDraft('');
    setShowCityPicker(false);
    setPendingDraft(null);

    // reuse the existing send flow (copied network logic)
    const endpoint = CHAT_API_URL || '/api/Chat';
    try {
      const res = await fetch(endpoint, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ message: outgoing }),
      });
      let assistantText = '';

      if (!res.ok) {
        try {
          const contentType = res.headers.get('content-type') || '';
          if (contentType.includes('application/json')) {
            const data = await res.json();
            console.error('Chat API error response:', res.status, data);
          } else {
            const txt = await res.text();
            console.error('Chat API error response:', res.status, txt);
          }
        } catch (e) {
          console.error('Chat API error while reading response:', e);
        }

        if (res.status >= 500) {
          assistantText = 'Service temporarily unavailable. Please try again later.';
        } else if (res.status === 429) {
          assistantText = 'Rate limit exceeded. Please try again later.';
        } else {
          assistantText = `Request failed (${res.status}).`;
        }
      } else {
        const contentType = res.headers.get('content-type') || '';
        if (contentType.includes('application/json')) {
          const data = await res.json();
          assistantText = data?.message ?? data?.reply ?? JSON.stringify(data);
        } else {
          assistantText = await res.text();
        }
        if (!assistantText) assistantText = 'No assistant reply available.';
      }

      setMessages(prev => prev.map(m => (m.id === assistantId ? { ...m, text: assistantText } : m)));
    } catch (error) {
      console.error('Chat send error:', error);
      const fallback = 'No assistant reply available.';
      setMessages(prev => prev.map(m => (m.id === assistantId ? { ...m, text: fallback } : m)));
    }
  }

  function handleClearHistory() {
    setMessages(INITIAL_MESSAGES);
  }

  return (
    <Card className='h-full'>
      <CardHeader>
        <CardTitle className='text-xl'>Weather Chat</CardTitle>
        <CardDescription>Send a message and get quick outfit ideas.</CardDescription>
      </CardHeader>
      <CardContent className='space-y-4'>
        <div
          aria-label='Chat history'
          className='max-h-72 space-y-2 overflow-y-auto rounded-md border p-3'
        >
          {messages.map(message => (
            <div
              key={message.id}
              className={message.role === 'user' ? 'text-right' : 'text-left'}
            >
              <p
                className={
                  message.role === 'user'
                    ? 'inline-block rounded-lg bg-primary px-3 py-2 text-sm text-primary-foreground'
                    : 'inline-block rounded-lg bg-muted px-3 py-2 text-sm text-foreground'
                }
              >
                {message.text}
              </p>
            </div>
          ))}
        </div>

        <form
          onSubmit={handleSubmit}
          className='flex gap-2'
        >
          <Input
            aria-label='Chat message'
            placeholder='Ask: What should I wear tomorrow?'
            value={draft}
            onChange={event => setDraft(event.target.value)}
          />
          <Button type='submit'>Send</Button>
          <Button
            type='button'
            variant='outline'
            onClick={handleClearHistory}
          >
            Clear Chat
          </Button>
        </form>

        {showCityPicker && (
          <div className='mt-2 rounded-md border p-3'>
            <h4 className='text-sm font-medium'>Choose a city</h4>
            <p className='text-xs text-muted-foreground'>No city detected — pick from your favorites:</p>
            <div className='mt-2 flex flex-wrap gap-2'>
              {favorites.map(city => (
                <Button
                  key={city}
                  onClick={() => submitWithCity(city)}
                >
                  {city}
                </Button>
              ))}
              <Button
                variant='outline'
                onClick={() => {
                  setShowCityPicker(false);
                  setPendingDraft(null);
                }}
              >
                Cancel
              </Button>
            </div>
          </div>
        )}

        <div className='rounded-md border border-dashed p-3'>
          <h3 className='text-sm font-medium'>Favorite Cities</h3>
          {favorites.length === 0 ? (
            <p className='mt-2 text-sm text-muted-foreground'>No favorites yet.</p>
          ) : (
            <ul className='mt-2 flex flex-wrap gap-2'>
              {favorites.map(city => (
                <li
                  key={city}
                  className='rounded-full bg-muted px-3 py-1 text-xs'
                >
                  {city}
                </li>
              ))}
            </ul>
          )}
        </div>
      </CardContent>
    </Card>
  );
}
