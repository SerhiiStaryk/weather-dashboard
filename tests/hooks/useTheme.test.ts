import { describe, it, expect, beforeEach, afterEach, vi } from 'vitest';
import { renderHook, act } from '@testing-library/react';
import { useTheme } from '../../src/hooks/useTheme';

describe('useTheme', () => {
  const mockMatchMedia = (matches: boolean) => {
    Object.defineProperty(window, 'matchMedia', {
      writable: true,
      configurable: true,
      value: vi.fn().mockImplementation((query: string) => ({
        matches,
        media: query,
        onchange: null,
        addListener: vi.fn(),
        removeListener: vi.fn(),
        addEventListener: vi.fn(),
        removeEventListener: vi.fn(),
        dispatchEvent: vi.fn(),
      })),
    });
  };

  beforeEach(() => {
    localStorage.clear();
    document.documentElement.classList.remove('dark');
    mockMatchMedia(false); // Default to light mode preference
  });

  afterEach(() => {
    vi.restoreAllMocks();
  });

  it('defaults to light theme when no stored preference and system prefers light', () => {
    mockMatchMedia(false);

    const { result } = renderHook(() => useTheme());
    expect(result.current.theme).toBe('light');
    expect(document.documentElement.classList.contains('dark')).toBe(false);
  });

  it('defaults to dark theme when no stored preference and system prefers dark', () => {
    mockMatchMedia(true);

    const { result } = renderHook(() => useTheme());
    expect(result.current.theme).toBe('dark');
    expect(document.documentElement.classList.contains('dark')).toBe(true);
  });

  it('loads stored theme from localStorage', () => {
    localStorage.setItem('weather-dashboard-theme', 'dark');

    const { result } = renderHook(() => useTheme());
    expect(result.current.theme).toBe('dark');
    expect(document.documentElement.classList.contains('dark')).toBe(true);
  });

  it('toggles theme from light to dark', () => {
    const { result } = renderHook(() => useTheme());

    act(() => {
      result.current.toggleTheme();
    });

    expect(result.current.theme).toBe('dark');
    expect(document.documentElement.classList.contains('dark')).toBe(true);
    expect(localStorage.getItem('weather-dashboard-theme')).toBe('dark');
  });

  it('toggles theme from dark to light', () => {
    localStorage.setItem('weather-dashboard-theme', 'dark');

    const { result } = renderHook(() => useTheme());

    act(() => {
      result.current.toggleTheme();
    });

    expect(result.current.theme).toBe('light');
    expect(document.documentElement.classList.contains('dark')).toBe(false);
    expect(localStorage.getItem('weather-dashboard-theme')).toBe('light');
  });

  it('persists theme preference to localStorage', () => {
    const { result } = renderHook(() => useTheme());

    act(() => {
      result.current.toggleTheme();
    });

    expect(localStorage.getItem('weather-dashboard-theme')).toBe('dark');
  });

  it('applies dark class to document element', () => {
    const { result } = renderHook(() => useTheme());

    act(() => {
      result.current.toggleTheme();
    });

    expect(document.documentElement.classList.contains('dark')).toBe(true);
  });

  it('removes dark class when switching to light theme', () => {
    localStorage.setItem('weather-dashboard-theme', 'dark');

    const { result } = renderHook(() => useTheme());

    act(() => {
      result.current.toggleTheme();
    });

    expect(document.documentElement.classList.contains('dark')).toBe(false);
  });

  it('ignores invalid stored values', () => {
    localStorage.setItem('weather-dashboard-theme', 'invalid-value');
    mockMatchMedia(false);

    const { result } = renderHook(() => useTheme());
    expect(result.current.theme).toBe('light');
  });
});
