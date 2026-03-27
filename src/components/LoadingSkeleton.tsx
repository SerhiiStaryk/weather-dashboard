export function LoadingSkeleton() {
  return (
    <div
      className="flex flex-col gap-6 animate-pulse"
      aria-label="Loading weather data"
    >
      {/* Current weather skeleton */}
      <div className="rounded-xl border bg-card p-6 flex flex-col gap-4">
        <div className="flex items-start justify-between">
          <div className="flex flex-col gap-2">
            <div className="h-6 w-40 rounded bg-muted" />
            <div className="h-4 w-24 rounded bg-muted" />
          </div>
          <div className="h-8 w-8 rounded bg-muted" />
        </div>
        <div className="flex items-center gap-4">
          <div className="h-20 w-20 rounded-full bg-muted" />
          <div className="h-12 w-28 rounded bg-muted" />
        </div>
        <div className="grid grid-cols-3 gap-2">
          {[0, 1, 2].map((i) => (
            <div key={i} className="flex flex-col gap-1">
              <div className="h-3 w-16 rounded bg-muted" />
              <div className="h-4 w-12 rounded bg-muted" />
            </div>
          ))}
        </div>
      </div>

      {/* Forecast skeleton */}
      <div className="grid grid-cols-3 gap-4">
        {[0, 1, 2].map((i) => (
          <div
            key={i}
            className="rounded-xl border bg-card p-4 flex flex-col items-center gap-2"
          >
            <div className="h-4 w-20 rounded bg-muted" />
            <div className="h-14 w-14 rounded-full bg-muted" />
            <div className="h-3 w-16 rounded bg-muted" />
            <div className="h-4 w-12 rounded bg-muted" />
          </div>
        ))}
      </div>
    </div>
  );
}
