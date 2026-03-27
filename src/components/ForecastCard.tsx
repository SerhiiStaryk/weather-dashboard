import type { ForecastDay } from '@/types/weather';
import { WeatherIcon } from './WeatherIcon';

interface Props {
  day: ForecastDay;
}

function formatDate(dateStr: string): string {
  const date = new Date(`${dateStr}T12:00:00Z`);
  return date.toLocaleDateString(undefined, {
    weekday: 'short',
    month: 'short',
    day: 'numeric',
  });
}

export function ForecastCard({ day }: Props) {
  return (
    <div className="rounded-xl border bg-card text-card-foreground shadow-sm p-4 flex flex-col items-center gap-2">
      <p className="text-sm font-medium text-muted-foreground">
        {formatDate(day.date)}
      </p>
      <WeatherIcon icon={day.icon} description={day.description} size={56} />
      <p className="text-xs capitalize text-center text-muted-foreground">
        {day.description}
      </p>
      <div className="flex gap-2 text-sm font-medium">
        <span>{Math.round(day.tempMax)}°</span>
        <span className="text-muted-foreground">
          {Math.round(day.tempMin)}°
        </span>
      </div>
    </div>
  );
}
