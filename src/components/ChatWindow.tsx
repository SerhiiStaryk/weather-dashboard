import { useMemo, useState } from 'react';
import type { SyntheticEvent } from 'react';

import { useFavorites } from '@/hooks/useFavorites';
import { Button } from '@/components/ui/button';
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from '@/components/ui/card';
import { Input } from '@/components/ui/input';

interface ChatMessage {
  id: number;
  role: 'user' | 'assistant';
  text: string;
}

function buildAssistantReply(message: string, favorites: string[]): string {
  const normalized = message.toLowerCase();

  if (normalized.includes('wear') && normalized.includes('yesterday')) {
    const cityHint = favorites[0]
      ? ` If you are in ${favorites[0]}, open that city page for exact conditions.`
      : '';

    return `I cannot change yesterday, but I can still help: choose light layers, a waterproof jacket, and comfortable shoes.${cityHint}`;
  }

  if (normalized.includes('wear')) {
    return 'Start with layers: a breathable base, a light outer layer, and closed shoes. Add a jacket if it is windy or rainy.';
  }

  if (normalized.includes('favorite') || normalized.includes('city')) {
    if (favorites.length === 0) {
      return 'You do not have favorite cities yet. Search for a city and click the star to save it.';
    }

    return `Your favorite cities are: ${favorites.join(', ')}.`;
  }

  return 'Ask me about what to wear or your favorite cities, and I will suggest the next step.';
}

const INITIAL_MESSAGES: ChatMessage[] = [
  {
    id: 1,
    role: 'assistant',
    text: 'Hi, I am your weather helper. Ask things like: What should I wear tomorrow?',
  },
];

export function ChatWindow() {
  const { favorites } = useFavorites();
  const [draft, setDraft] = useState('');
  const [messages, setMessages] = useState<ChatMessage[]>(INITIAL_MESSAGES);

  const nextId = useMemo(() => messages.length + 1, [messages.length]);

  function handleSubmit(event: SyntheticEvent<HTMLFormElement>) {
    event.preventDefault();

    const trimmed = draft.trim();
    if (!trimmed) return;

    const userMessage: ChatMessage = {
      id: nextId,
      role: 'user',
      text: trimmed,
    };

    const assistantMessage: ChatMessage = {
      id: nextId + 1,
      role: 'assistant',
      text: buildAssistantReply(trimmed, favorites),
    };

    setMessages((prev) => [...prev, userMessage, assistantMessage]);
    setDraft('');
  }

  function handleClearHistory() {
    setMessages(INITIAL_MESSAGES);
  }

  return (
    <Card className="h-full">
      <CardHeader>
        <CardTitle className="text-xl">Weather Chat</CardTitle>
        <CardDescription>
          Send a message and get quick outfit ideas.
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-4">
        <div
          aria-label="Chat history"
          className="max-h-72 space-y-2 overflow-y-auto rounded-md border p-3"
        >
          {messages.map((message) => (
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

        <form onSubmit={handleSubmit} className="flex gap-2">
          <Input
            aria-label="Chat message"
            placeholder="Ask: What should I wear tomorrow?"
            value={draft}
            onChange={(event) => setDraft(event.target.value)}
          />
          <Button type="submit">Send</Button>
          <Button type="button" variant="outline" onClick={handleClearHistory}>
            Clear Chat
          </Button>
        </form>

        <div className="rounded-md border border-dashed p-3">
          <h3 className="text-sm font-medium">Favorite Cities</h3>
          {favorites.length === 0 ? (
            <p className="mt-2 text-sm text-muted-foreground">
              No favorites yet.
            </p>
          ) : (
            <ul className="mt-2 flex flex-wrap gap-2">
              {favorites.map((city) => (
                <li
                  key={city}
                  className="rounded-full bg-muted px-3 py-1 text-xs"
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
