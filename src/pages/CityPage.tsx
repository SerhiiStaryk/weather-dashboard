import { useParams, Link } from 'react-router-dom';
import { useWeather } from '@/hooks/useWeather';
import { WeatherCard } from '@/components/WeatherCard';
import { ForecastCard } from '@/components/ForecastCard';
import { LoadingSkeleton } from '@/components/LoadingSkeleton';
import { ErrorMessage } from '@/components/ErrorMessage';

export function CityPage() {
  const { name } = useParams<{ name: string }>();
  const decodedName = name ? decodeURIComponent(name) : undefined;
  const { data, isLoading, error } = useWeather(decodedName);

  return (
    <main className="min-h-screen bg-background py-12 px-4">
      <div className="max-w-xl mx-auto flex flex-col gap-6">
        <div className="flex items-center gap-3">
          <Link
            to="/"
            className="text-sm text-muted-foreground hover:underline"
            aria-label="Back to home"
          >
            ← Back
          </Link>
          <h1 className="text-2xl font-bold tracking-tight">{decodedName}</h1>
        </div>

        {isLoading && <LoadingSkeleton />}

        {error && <ErrorMessage error={error} />}

        {data && (
          <>
            <WeatherCard data={data.current} />

            <section aria-label="3-day forecast">
              <h2 className="text-base font-semibold mb-3">3-Day Forecast</h2>
              <div className="grid grid-cols-3 gap-4">
                {data.forecast.map((day) => (
                  <ForecastCard key={day.date} day={day} />
                ))}
              </div>
            </section>
          </>
        )}
      </div>
    </main>
  );
}
