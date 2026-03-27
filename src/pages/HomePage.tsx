import { CitySearch } from '@/components/CitySearch';
import { FavoritesList } from '@/components/FavoritesList';

export function HomePage() {
  return (
    <main className="min-h-screen bg-background py-12 px-4">
      <div className="max-w-2xl mx-auto flex flex-col gap-8">
        <div className="text-center">
          <h1 className="text-3xl font-bold tracking-tight">
            Weather Dashboard
          </h1>
          <p className="text-muted-foreground mt-1 text-sm">
            Search for any city to see current conditions and a 3-day forecast.
          </p>
        </div>

        <CitySearch />
        <FavoritesList />
      </div>
    </main>
  );
}
