import type { WeatherCondition } from '@/types/weather';
import { useFavorites } from '@/hooks/useFavorites';
import { WeatherIcon } from './WeatherIcon';

interface Props {
  data: WeatherCondition;
}

export function WeatherCard({ data }: Props) {
  const { isFavorite, addFavorite, removeFavorite } = useFavorites();
  const favorited = isFavorite(data.cityName);

  return (
    <div className="rounded-xl border bg-card text-card-foreground shadow-sm p-6 flex flex-col gap-4">
      {/* Header */}
      <div className="flex items-start justify-between">
        <div>
          <h2 className="text-2xl font-semibold">
            {data.cityName}, {data.country}
          </h2>
          <p className="text-muted-foreground capitalize">{data.description}</p>
        </div>
        <button
          onClick={() =>
            favorited
              ? removeFavorite(data.cityName)
              : addFavorite(data.cityName)
          }
          aria-label={favorited ? 'Remove from favorites' : 'Add to favorites'}
          className="text-2xl leading-none transition-transform hover:scale-110 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring rounded"
          title={favorited ? 'Remove from favorites' : 'Add to favorites'}
        >
          {favorited ? '★' : '☆'}
        </button>
      </div>

      {/* Icon + Temp */}
      <div className="flex items-center gap-4">
        <WeatherIcon
          icon={data.icon}
          description={data.description}
          size={80}
        />
        <span className="text-5xl font-bold">{Math.round(data.temp)}°C</span>
      </div>

      {/* Details grid */}
      <dl className="grid grid-cols-3 gap-2 text-sm">
        <div className="flex flex-col">
          <dt className="text-muted-foreground">Feels like</dt>
          <dd className="font-medium">{Math.round(data.feelsLike)}°C</dd>
        </div>
        <div className="flex flex-col">
          <dt className="text-muted-foreground">Humidity</dt>
          <dd className="font-medium">{data.humidity}%</dd>
        </div>
        <div className="flex flex-col">
          <dt className="text-muted-foreground">Wind</dt>
          <dd className="font-medium">{data.windSpeed} m/s</dd>
        </div>
      </dl>
    </div>
  );
}
