import { Link } from 'react-router-dom';
import { useWeather } from '@/hooks/useWeather';
import { WeatherIcon } from './WeatherIcon';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Skeleton } from '@/components/ui/skeleton';
import { Alert, AlertDescription } from '@/components/ui/alert';

interface Props {
  city: string;
  onRemove: (city: string) => void;
}

export function FavoriteWeatherCard({ city, onRemove }: Props) {
  const { data, isLoading, error } = useWeather(city);

  return (
    <Card className="group relative hover:shadow-lg hover:-translate-y-1 transition-all duration-300">
      <Button
        variant="ghost"
        size="icon"
        onClick={(e) => {
          e.preventDefault();
          e.stopPropagation();
          onRemove(city);
        }}
        aria-label={`Remove ${city} from favorites`}
        className="absolute top-2 right-2 z-10 h-6 w-6 text-muted-foreground hover:text-destructive hover:scale-125 transition-all opacity-0 group-hover:opacity-100 focus-visible:opacity-100 hover:rotate-90"
      >
        ✕
      </Button>
      <Link
        to={`/city/${encodeURIComponent(city)}`}
        className="block rounded-lg focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2"
      >
        <CardContent className="p-4 flex flex-col gap-3">
          <p className="pr-8 text-sm font-medium truncate">{city}</p>

          {/* Loading skeleton */}
          {isLoading && (
            <div
              className="flex items-center gap-3"
              role="status"
              aria-label={`Loading weather for ${city}`}
            >
              <Skeleton className="h-12 w-12 rounded-full shrink-0" />
              <div className="flex flex-col gap-1.5 flex-1">
                <Skeleton className="h-5 w-16" />
                <Skeleton className="h-3 w-20" />
              </div>
            </div>
          )}

          {/* Error state */}
          {error && !isLoading && (
            <Alert variant="destructive" className="py-2 animate-fade-in">
              <AlertDescription className="text-xs">
                Failed to load
              </AlertDescription>
            </Alert>
          )}

          {/* Weather data */}
          {data && !isLoading && (
            <div className="flex items-center gap-2">
              <div className="transform group-hover:scale-110 transition-transform">
                <WeatherIcon
                  icon={data.current.icon}
                  description={data.current.description}
                  size={48}
                />
              </div>
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
        </CardContent>
      </Link>
    </Card>
  );
}
