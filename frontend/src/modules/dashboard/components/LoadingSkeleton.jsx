/**
 * Skeleton loader representing the dashboard layout structure during data fetching.
 */
export default function LoadingSkeleton() {
  return (
    <div className="animate-pulse space-y-8 p-4 sm:p-6 lg:p-8">
      {/* Hero Welcome Skeleton */}
      <div className="rounded-2xl border border-paper-200 bg-white/70 p-6 shadow-sm sm:p-8">
        <div className="h-4 w-32 rounded bg-ink-100/70" />
        <div className="mt-3 h-8 w-64 rounded bg-ink-100/80 sm:w-80" />
        <div className="mt-2 h-4 w-full max-w-md rounded bg-ink-100/60" />
        <div className="mt-6 flex flex-wrap gap-3">
          <div className="h-10 w-44 rounded-lg bg-ink-100/80" />
          <div className="h-10 w-36 rounded-lg bg-ink-100/60" />
        </div>
      </div>

      {/* Stats Cards Skeleton */}
      <div className="grid grid-cols-2 gap-4 sm:grid-cols-4 lg:gap-6">
        {[1, 2, 3, 4].map((i) => (
          <div key={i} className="rounded-xl border border-paper-200 bg-white/70 p-4 shadow-sm">
            <div className="flex items-center justify-between">
              <div className="h-3 w-20 rounded bg-ink-100/60" />
              <div className="h-8 w-8 rounded-lg bg-ink-100/80" />
            </div>
            <div className="mt-4 h-7 w-12 rounded bg-ink-100/90" />
          </div>
        ))}
      </div>

      {/* Quick Actions Skeleton */}
      <div className="space-y-4">
        <div className="h-5 w-32 rounded bg-ink-100/70" />
        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
          {[1, 2, 3, 4].map((i) => (
            <div key={i} className="rounded-xl border border-paper-200 bg-white/70 p-5 shadow-sm">
              <div className="h-9 w-9 rounded-lg bg-ink-100/80" />
              <div className="mt-3 h-4 w-28 rounded bg-ink-100/70" />
              <div className="mt-2 h-3 w-full rounded bg-ink-100/50" />
              <div className="mt-4 h-8 w-full rounded bg-ink-100/60" />
            </div>
          ))}
        </div>
      </div>

      {/* Main Content Grid Skeleton */}
      <div className="grid grid-cols-1 gap-6 lg:grid-cols-3">
        {/* Recent & Draft Assignments */}
        <div className="space-y-6 lg:col-span-2">
          <div className="rounded-xl border border-paper-200 bg-white/70 p-6 shadow-sm">
            <div className="h-5 w-40 rounded bg-ink-100/70" />
            <div className="mt-4 space-y-3">
              {[1, 2, 3].map((i) => (
                <div key={i} className="h-16 rounded-lg bg-ink-100/40" />
              ))}
            </div>
          </div>
        </div>

        {/* Status Side Cards Skeleton */}
        <div className="space-y-6">
          <div className="rounded-xl border border-paper-200 bg-white/70 p-6 shadow-sm">
            <div className="h-5 w-36 rounded bg-ink-100/70" />
            <div className="mt-4 h-12 rounded-lg bg-ink-100/40" />
            <div className="mt-4 h-9 w-full rounded-lg bg-ink-100/60" />
          </div>
          <div className="rounded-xl border border-paper-200 bg-white/70 p-6 shadow-sm">
            <div className="h-5 w-36 rounded bg-ink-100/70" />
            <div className="mt-4 h-12 rounded-lg bg-ink-100/40" />
            <div className="mt-4 h-9 w-full rounded-lg bg-ink-100/60" />
          </div>
        </div>
      </div>
    </div>
  );
}
