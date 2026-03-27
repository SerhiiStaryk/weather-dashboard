import { useFavorites } from '@/hooks/useFavorites';
import { FavoriteWeatherCard } from '@/components/FavoriteWeatherCard';

export function FavoritesList() {
  const { favorites, removeFavorite } = useFavorites();

  if (favorites.length === 0) {
    return null;
  }

  return (
    <section aria-label="Favorite cities">
      <h2 className="text-lg font-semibold mb-3">Favorites</h2>
      <div className="grid grid-cols-2 gap-3 sm:grid-cols-3">
        {favorites.map((city) => (
          <FavoriteWeatherCard
            key={city}
            city={city}
            onRemove={removeFavorite}
          />
        ))}
      </div>
    </section>
  );
}
