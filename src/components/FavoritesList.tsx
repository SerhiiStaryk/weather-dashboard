import { useFavorites } from '@/hooks/useFavorites';
import { FavoriteWeatherCard } from '@/components/FavoriteWeatherCard';

export function FavoritesList() {
  const { favorites, removeFavorite } = useFavorites();

  return (
    <section aria-label="Favorite cities">
      <h2 className="text-lg font-semibold mb-3">Favorites</h2>

      {favorites.length === 0 ? (
        <div className="text-center py-12 px-4 rounded-xl border border-dashed border-border bg-muted/30">
          <svg
            className="w-12 h-12 mx-auto mb-4 text-muted-foreground opacity-50"
            fill="none"
            stroke="currentColor"
            viewBox="0 0 24 24"
            aria-hidden="true"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={1.5}
              d="M11.48 3.499a.562.562 0 011.04 0l2.125 5.111a.563.563 0 00.475.345l5.518.442c.499.04.701.663.321.988l-4.204 3.602a.563.563 0 00-.182.557l1.285 5.385a.562.562 0 01-.84.61l-4.725-2.885a.563.563 0 00-.586 0L6.982 20.54a.562.562 0 01-.84-.61l1.285-5.386a.562.562 0 00-.182-.557l-4.204-3.602a.563.563 0 01.321-.988l5.518-.442a.563.563 0 00.475-.345L11.48 3.5z"
            />
          </svg>
          <p className="text-muted-foreground text-sm">
            No favorites yet. Search for a city and click ☆ to save it here.
          </p>
        </div>
      ) : (
        <div className="grid grid-cols-2 gap-3 sm:grid-cols-3">
          {favorites.map((city) => (
            <FavoriteWeatherCard
              key={city}
              city={city}
              onRemove={removeFavorite}
            />
          ))}
        </div>
      )}
    </section>
  );
}
