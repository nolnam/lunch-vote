export default function MenuCardSkeleton() {
  return (
    <div className="flex flex-col gap-3">
      {Array.from({ length: 3 }).map((_, i) => (
        <div
          key={i}
          className="relative p-4 rounded-2xl border-2 border-gray-200 bg-white animate-pulse"
        >
          <div className="flex items-start justify-between gap-3">
            <div className="flex-1 min-w-0 space-y-2">
              <div className="h-5 w-32 bg-gray-200 rounded" />
              <div className="h-4 w-20 bg-gray-200 rounded" />
              <div className="h-4 w-48 bg-gray-200 rounded" />
            </div>
            <div className="w-14 h-14 rounded-xl bg-gray-200 shrink-0" />
          </div>
        </div>
      ))}
    </div>
  );
}
