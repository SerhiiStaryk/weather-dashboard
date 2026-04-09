import { describe, it, expect, beforeEach } from 'vitest';
import { renderHook, act } from '@testing-library/react';
import { useFavorites } from '../../src/hooks/useFavorites';

describe('useFavorites', () => {
  beforeEach(() => {
    localStorage.clear();
  });

  it('adds a city to favorites', () => {
    const { result } = renderHook(() => useFavorites());

    act(() => {
      result.current.addFavorite('London');
    });

    expect(result.current.favorites).toEqual(['London']);
  });

  it('does not add more than 6 favorites', () => {
    const { result } = renderHook(() => useFavorites());

    act(() => {
      result.current.addFavorite('London');
      result.current.addFavorite('Paris');
      result.current.addFavorite('Tokyo');
      result.current.addFavorite('Seoul');
      result.current.addFavorite('Berlin');
      result.current.addFavorite('Rome');
      result.current.addFavorite('Madrid');
    });

    expect(result.current.favorites).toEqual([
      'London',
      'Paris',
      'Tokyo',
      'Seoul',
      'Berlin',
      'Rome',
    ]);
  });

  it('limits loaded favorites from localStorage to 6 items', () => {
    localStorage.setItem(
      'weather-favorites',
      JSON.stringify([
        'London',
        'Paris',
        'Tokyo',
        'Seoul',
        'Berlin',
        'Rome',
        'Madrid',
      ]),
    );

    const { result } = renderHook(() => useFavorites());

    expect(result.current.favorites).toEqual([
      'London',
      'Paris',
      'Tokyo',
      'Seoul',
      'Berlin',
      'Rome',
    ]);
  });

  it('trims city names before storing', () => {
    const { result } = renderHook(() => useFavorites());

    act(() => {
      result.current.addFavorite('  London  ');
    });

    expect(result.current.favorites).toEqual(['London']);
  });
});
