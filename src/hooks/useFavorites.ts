import { useState, useCallback } from 'react';

const STORAGE_KEY = 'weather-favorites';

function readFavorites(): string[] {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (!raw) return [];
    const parsed: unknown = JSON.parse(raw);
    if (!Array.isArray(parsed)) return [];
    return parsed.filter((item): item is string => typeof item === 'string');
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
      if (!normalized || prev.includes(normalized)) return prev;
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
