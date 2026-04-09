import { Card, CardContent } from '@/components/ui/card';
import { Skeleton } from '@/components/ui/skeleton';

export function LoadingSkeleton() {
  return (
    <div className="flex flex-col gap-6" aria-label="Loading weather data">
      {/* Current weather skeleton */}
      <Card>
        <CardContent className="p-6 flex flex-col gap-4">
          <div className="flex items-start justify-between">
            <div className="flex flex-col gap-2">
              <Skeleton className="h-6 w-40" />
              <Skeleton className="h-4 w-24" />
            </div>
            <Skeleton className="h-8 w-8" />
          </div>
          <div className="flex items-center gap-4">
            <Skeleton className="h-20 w-20 rounded-full" />
            <Skeleton className="h-12 w-28" />
          </div>
          <div className="grid grid-cols-3 gap-2">
            {[0, 1, 2].map((i) => (
              <div key={i} className="flex flex-col gap-1">
                <Skeleton className="h-3 w-16" />
                <Skeleton className="h-4 w-12" />
              </div>
            ))}
          </div>
        </CardContent>
      </Card>

      {/* Forecast skeleton */}
      <div className="grid grid-cols-3 gap-4">
        {[0, 1, 2].map((i) => (
          <Card key={i}>
            <CardContent className="p-4 flex flex-col items-center gap-2">
              <Skeleton className="h-4 w-20" />
              <Skeleton className="h-14 w-14 rounded-full" />
              <Skeleton className="h-3 w-16" />
              <Skeleton className="h-4 w-12" />
            </CardContent>
          </Card>
        ))}
      </div>
    </div>
  );
}
