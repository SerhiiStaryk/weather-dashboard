import { useParams, Link } from 'react-router-dom';
import { useWeather } from '@/hooks/useWeather';
import { WeatherCard } from '@/components/WeatherCard';
import { ForecastCard } from '@/components/ForecastCard';
import { LoadingSkeleton } from '@/components/LoadingSkeleton';
import { ErrorMessage } from '@/components/ErrorMessage';
import { ThemeToggle } from '@/components/ThemeToggle';
import { Button } from '@/components/ui/button';

export function CityPage() {
  const { name } = useParams<{ name: string }>();
  const decodedName = name ? decodeURIComponent(name) : undefined;
  const { data, isLoading, error } = useWeather(decodedName);

  return (
    <main className="min-h-screen bg-background text-foreground py-12 px-4">
      <div className="max-w-xl mx-auto flex flex-col gap-6">
        <div className="flex items-center justify-between animate-fade-in-down">
          <div className="flex items-center gap-3">
            <Button
              asChild
              variant="outline"
              size="sm"
              className="gap-2 hover:-translate-x-1 transition-all group"
            >
              <Link to="/" aria-label="Back to home">
                <svg
                  className="w-4 h-4 transition-transform group-hover:-translate-x-0.5"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                  aria-hidden="true"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M10 19l-7-7m0 0l7-7m-7 7h18"
                  />
                </svg>
                Back
              </Link>
            </Button>
            <h1 className="text-2xl font-bold tracking-tight">{decodedName}</h1>
          </div>
          <ThemeToggle />
        </div>

        {isLoading && <LoadingSkeleton />}

        {error && <ErrorMessage error={error} fullPage />}

        {data && (
          <>
            <div className="animate-fade-in-up">
              <WeatherCard data={data.current} />
            </div>

            <section
              aria-label="3-day forecast"
              className="animate-fade-in-up stagger-1"
            >
              <h2 className="text-base font-semibold mb-3">3-Day Forecast</h2>
              <div className="grid grid-cols-3 gap-4">
                {data.forecast.map((day, index) => (
                  <div
                    key={day.date}
                    className={`animate-scale-in stagger-${Math.min(index + 2, 6)}`}
                  >
                    <ForecastCard day={day} />
                  </div>
                ))}
              </div>
            </section>
          </>
        )}
      </div>
    </main>
  );
}
