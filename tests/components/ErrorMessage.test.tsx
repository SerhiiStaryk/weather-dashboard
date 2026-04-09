import { describe, it, expect } from 'vitest';
import { render, screen } from '@testing-library/react';
import { MemoryRouter } from 'react-router-dom';
import { ErrorMessage } from '../../src/components/ErrorMessage';
import {
  CityNotFoundError,
  ApiKeyError,
  ServerError,
  ParseError,
} from '../../src/api/errors';

describe('ErrorMessage', () => {
  describe('inline variant (default)', () => {
    it('renders city not found error', () => {
      const error = new CityNotFoundError('London');

      render(<ErrorMessage error={error} />);

      expect(screen.getByText('City not found')).toBeInTheDocument();
      expect(screen.getByText(/couldn't find that city/i)).toBeInTheDocument();
    });

    it('renders API key error', () => {
      const error = new ApiKeyError();

      render(<ErrorMessage error={error} />);

      expect(screen.getByText('Invalid API key')).toBeInTheDocument();
      expect(screen.getByText(/API key is missing/i)).toBeInTheDocument();
    });

    it('renders server error', () => {
      const error = new ServerError();

      render(<ErrorMessage error={error} />);

      expect(screen.getByText('Service unavailable')).toBeInTheDocument();
      expect(
        screen.getByText(/service is currently unavailable/i),
      ).toBeInTheDocument();
    });

    it('renders parse error', () => {
      const error = new ParseError('Invalid data');

      render(<ErrorMessage error={error} />);

      expect(screen.getByText('Unexpected response')).toBeInTheDocument();
      expect(screen.getByText(/returned unexpected data/i)).toBeInTheDocument();
    });

    it('renders generic error', () => {
      const error = new Error('Something bad happened');

      render(<ErrorMessage error={error} />);

      expect(screen.getByText('Something went wrong')).toBeInTheDocument();
      expect(screen.getByText('Something bad happened')).toBeInTheDocument();
    });

    it('has alert role', () => {
      const error = new Error('Test');

      render(<ErrorMessage error={error} />);

      expect(screen.getByRole('alert')).toBeInTheDocument();
    });

    it('does not show back button in inline mode', () => {
      const error = new CityNotFoundError('Test');

      render(
        <MemoryRouter>
          <ErrorMessage error={error} />
        </MemoryRouter>,
      );

      expect(
        screen.queryByRole('link', { name: /back to search/i }),
      ).not.toBeInTheDocument();
    });
  });

  describe('fullPage variant', () => {
    it('renders city not found error in full page mode', () => {
      const error = new CityNotFoundError('London');

      render(
        <MemoryRouter>
          <ErrorMessage error={error} fullPage />
        </MemoryRouter>,
      );

      expect(
        screen.getByRole('heading', { name: 'City not found' }),
      ).toBeInTheDocument();
      expect(screen.getByText(/couldn't find that city/i)).toBeInTheDocument();
    });

    it('renders back to search link', () => {
      const error = new CityNotFoundError('Test');

      render(
        <MemoryRouter>
          <ErrorMessage error={error} fullPage />
        </MemoryRouter>,
      );

      const link = screen.getByRole('link', { name: /back to search/i });
      expect(link).toBeInTheDocument();
      expect(link).toHaveAttribute('href', '/');
    });

    it('renders error icon', () => {
      const error = new Error('Test');

      const { container } = render(
        <MemoryRouter>
          <ErrorMessage error={error} fullPage />
        </MemoryRouter>,
      );

      const icon = container.querySelector('svg');
      expect(icon).toBeInTheDocument();
    });

    it('uses h2 for heading in full page mode', () => {
      const error = new ServerError();

      render(
        <MemoryRouter>
          <ErrorMessage error={error} fullPage />
        </MemoryRouter>,
      );

      expect(
        screen.getByRole('heading', { level: 2, name: 'Service unavailable' }),
      ).toBeInTheDocument();
    });

    it('has alert role in full page mode', () => {
      const error = new Error('Test');

      render(
        <MemoryRouter>
          <ErrorMessage error={error} fullPage />
        </MemoryRouter>,
      );

      expect(screen.getByRole('alert')).toBeInTheDocument();
    });
  });
});
