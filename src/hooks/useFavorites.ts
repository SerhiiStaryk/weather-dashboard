import { useState, useCallback } from 'react';

const STORAGE_KEY = 'weather-favorites';
const MAX_FAVORITES = 6;

function readFavorites(): string[] {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (!raw) return [];
    const parsed: unknown = JSON.parse(raw);
    if (!Array.isArray(parsed)) return [];
    return parsed
      .filter((item): item is string => typeof item === 'string')
      .map((city) => city.trim())
      .filter((city) => city.length > 0)
      .slice(0, MAX_FAVORITES);
  } catch {
    return [];
  }
}

function writeFavorites(favorites: string[]): void {
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(favorites));
  } catch {
    // Storage quota exceeded or private browsing — silently ignore
  }
}

export function useFavorites() {
  const [favorites, setFavorites] = useState<string[]>(readFavorites);

  const addFavorite = useCallback((city: string) => {
    setFavorites((prev) => {
      const normalized = city.trim();
      if (
        !normalized ||
        prev.includes(normalized) ||
        prev.length >= MAX_FAVORITES
      )
        return prev;
      const next = [...prev, normalized];
      writeFavorites(next);
      return next;
    });
  }, []);

  const removeFavorite = useCallback((city: string) => {
    setFavorites((prev) => {
      const next = prev.filter((c) => c !== city);
      writeFavorites(next);
      return next;
    });
  }, []);

  const isFavorite = useCallback(
    (city: string) => favorites.includes(city.trim()),
    [favorites],
  );

  return { favorites, addFavorite, removeFavorite, isFavorite };
}
