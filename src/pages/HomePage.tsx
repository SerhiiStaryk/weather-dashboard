import { CitySearch } from '@/components/CitySearch';
import { FavoritesList } from '@/components/FavoritesList';
import { ThemeToggle } from '@/components/ThemeToggle';

export function HomePage() {
  return (
    <main className="min-h-screen bg-background text-foreground py-12 px-4">
      <div className="max-w-2xl mx-auto flex flex-col gap-8">
        <div className="flex justify-between items-start animate-fade-in-down">
          <div className="text-center flex-1">
            <h1 className="text-3xl font-bold tracking-tight">
              Weather Dashboard
            </h1>
            <p className="text-muted-foreground mt-1 text-sm">
              Search for any city to see current conditions and a 3-day
              forecast.
            </p>
          </div>
          <ThemeToggle />
        </div>

        <div className="animate-fade-in-up stagger-1">
          <CitySearch />
        </div>
        <div className="animate-fade-in-up stagger-2">
          <FavoritesList />
        </div>
      </div>
    </main>
  );
}
