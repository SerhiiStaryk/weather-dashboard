import {
  CityNotFoundError,
  ApiKeyError,
  ServerError,
  ParseError,
} from '@/api/errors';

interface Props {
  error: Error;
}

export function ErrorMessage({ error }: Props) {
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
