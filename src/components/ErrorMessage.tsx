import { Link } from 'react-router-dom';
import {
  CityNotFoundError,
  ApiKeyError,
  ServerError,
  ParseError,
} from '@/api/errors';

interface Props {
  error: Error;
  fullPage?: boolean;
}

export function ErrorMessage({ error, fullPage = false }: Props) {
  let heading = 'Something went wrong';
  let message = error.message;

  if (error instanceof CityNotFoundError) {
    heading = 'City not found';
    message =
      "We couldn't find that city. Please check the spelling and try again.";
  } else if (error instanceof ApiKeyError) {
    heading = 'Invalid API key';
    message =
      'The weather API key is missing or invalid. Please check your configuration.';
  } else if (error instanceof ServerError) {
    heading = 'Service unavailable';
    message =
      'The weather service is currently unavailable. Please try again later.';
  } else if (error instanceof ParseError) {
    heading = 'Unexpected response';
    message = 'The weather service returned unexpected data. Please try again.';
  }

  if (fullPage) {
    return (
      <div
        role="alert"
        className="flex flex-col items-center justify-center text-center py-16 px-4"
      >
        <svg
          className="w-16 h-16 mb-6 text-destructive opacity-75"
          fill="none"
          stroke="currentColor"
          viewBox="0 0 24 24"
          aria-hidden="true"
        >
          <path
            strokeLinecap="round"
            strokeLinejoin="round"
            strokeWidth={1.5}
            d="M12 9v3.75m9-.75a9 9 0 11-18 0 9 9 0 0118 0zm-9 3.75h.008v.008H12v-.008z"
          />
        </svg>
        <h2 className="text-2xl font-bold mb-2 text-destructive">{heading}</h2>
        <p className="text-muted-foreground mb-6 max-w-md">{message}</p>
        <Link
          to="/"
          className="inline-flex items-center justify-center rounded-md text-sm font-medium bg-primary text-primary-foreground hover:bg-primary/90 h-10 px-6 py-2 transition-colors"
        >
          ← Back to search
        </Link>
      </div>
    );
  }

  return (
    <div
      role="alert"
      className="rounded-xl border border-destructive/50 bg-destructive/10 p-6 flex flex-col gap-2 text-destructive"
    >
      <h3 className="font-semibold text-base">{heading}</h3>
      <p className="text-sm">{message}</p>
    </div>
  );
}
