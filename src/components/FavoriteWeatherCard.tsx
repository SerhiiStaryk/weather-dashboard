import { Link } from 'react-router-dom';
import { useWeather } from '@/hooks/useWeather';
import { WeatherIcon } from './WeatherIcon';

interface Props {
  city: string;
  onRemove: (city: string) => void;
}

export function FavoriteWeatherCard({ city, onRemove }: Props) {
  const { data, isLoading, error } = useWeather(city);

  return (
    <Link
      to={`/city/${encodeURIComponent(city)}`}
      className="group relative rounded-xl border bg-card text-card-foreground shadow-sm p-4 flex flex-col gap-3 hover:shadow-md transition-shadow focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
    >
      {/* Remove button — sits above the link click area */}
      <button
        onClick={(e) => {
          e.preventDefault();
          e.stopPropagation();
          onRemove(city);
        }}
        aria-label={`Remove ${city} from favorites`}
        className="absolute top-2 right-2 text-muted-foreground hover:text-destructive transition-colors text-xs leading-none p-1 rounded opacity-0 group-hover:opacity-100 focus-visible:opacity-100"
      >
        ✕
      </button>

      {/* City name */}
      <p className="text-sm font-semibold truncate pr-4">{city}</p>

      {/* Loading skeleton */}
      {isLoading && (
        <div className="animate-pulse flex items-center gap-3">
          <div className="h-10 w-10 rounded-full bg-muted shrink-0" />
          <div className="flex flex-col gap-1.5 flex-1">
            <div className="h-5 w-16 rounded bg-muted" />
            <div className="h-3 w-20 rounded bg-muted" />
          </div>
        </div>
      )}

      {/* Error state */}
      {error && !isLoading && (
        <p className="text-xs text-destructive">Failed to load</p>
      )}

      {/* Weather data */}
      {data && !isLoading && (
        <div className="flex items-center gap-2">
          <WeatherIcon
            icon={data.current.icon}
            description={data.current.description}
            size={48}
          />
          <div className="min-w-0">
            <p className="text-2xl font-bold leading-none">
              {Math.round(data.current.temp)}°C
            </p>
            <p className="text-xs text-muted-foreground capitalize truncate mt-0.5">
              {data.current.description}
            </p>
          </div>
        </div>
      )}
    </Link>
  );
}
