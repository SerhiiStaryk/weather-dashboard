import { describe, it, expect, vi } from 'vitest';
import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { MemoryRouter } from 'react-router-dom';
import { CitySearch } from '../../src/components/CitySearch';

// Capture navigate calls
const mockNavigate = vi.fn();
vi.mock('react-router-dom', async (importOriginal) => {
  const actual = await importOriginal<typeof import('react-router-dom')>();
  return { ...actual, useNavigate: () => mockNavigate };
});

describe('CitySearch', () => {
  beforeEach(() => {
    mockNavigate.mockClear();
  });

  const renderSearch = () =>
    render(
      <MemoryRouter>
        <CitySearch />
      </MemoryRouter>,
    );

  it('renders the search input and button', () => {
    renderSearch();
    expect(screen.getByPlaceholderText(/search city/i)).toBeInTheDocument();
    expect(screen.getByRole('button', { name: /search/i })).toBeInTheDocument();
  });

  it('navigates to /city/:name on valid submit', async () => {
    renderSearch();
    await userEvent.type(screen.getByRole('textbox'), 'London');
    await userEvent.click(screen.getByRole('button', { name: /search/i }));
    expect(mockNavigate).toHaveBeenCalledWith('/city/London');
  });

  it('shows validation error and does NOT navigate on empty submit', async () => {
    renderSearch();
    await userEvent.click(screen.getByRole('button', { name: /search/i }));
    expect(screen.getByRole('alert')).toHaveTextContent(/please enter a city/i);
    expect(mockNavigate).not.toHaveBeenCalled();
  });

  it('trims whitespace from input before navigating', async () => {
    renderSearch();
    await userEvent.type(screen.getByRole('textbox'), '  Paris  ');
    await userEvent.click(screen.getByRole('button', { name: /search/i }));
    expect(mockNavigate).toHaveBeenCalledWith('/city/Paris');
  });

  it('URL-encodes city names with spaces', async () => {
    renderSearch();
    await userEvent.type(screen.getByRole('textbox'), 'New York');
    await userEvent.click(screen.getByRole('button', { name: /search/i }));
    expect(mockNavigate).toHaveBeenCalledWith('/city/New%20York');
  });

  it('clears the validation error when the user starts typing', async () => {
    renderSearch();
    // Trigger error
    await userEvent.click(screen.getByRole('button', { name: /search/i }));
    expect(screen.getByRole('alert')).toBeInTheDocument();
    // Start typing — error should disappear
    await userEvent.type(screen.getByRole('textbox'), 'L');
    expect(screen.queryByRole('alert')).not.toBeInTheDocument();
  });
});
