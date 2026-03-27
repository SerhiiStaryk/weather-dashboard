import { useState, type FormEvent } from 'react';
import { useNavigate } from 'react-router-dom';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';

export function CitySearch() {
  const [value, setValue] = useState('');
  const [error, setError] = useState('');
  const navigate = useNavigate();

  function handleSubmit(e: FormEvent) {
    e.preventDefault();
    const trimmed = value.trim();
    if (!trimmed) {
      setError('Please enter a city name.');
      return;
    }
    setError('');
    navigate(`/city/${encodeURIComponent(trimmed)}`);
  }

  return (
    <form
      onSubmit={handleSubmit}
      className="flex flex-col gap-2 w-full max-w-md mx-auto"
    >
      <div className="flex gap-2">
        <Input
          type="text"
          value={value}
          onChange={(e) => {
            setValue(e.target.value);
            if (error) setError('');
          }}
          placeholder="Search city…"
          aria-label="City name"
          className="focus:ring-2 focus:ring-primary transition-all"
        />
        <Button
          type="submit"
          className="whitespace-nowrap hover:scale-105 active:scale-95 transition-transform"
        >
          Search
        </Button>
      </div>
      {error && (
        <p
          role="alert"
          className="text-sm text-destructive animate-fade-in-down"
        >
          {error}
        </p>
      )}
    </form>
  );
}
