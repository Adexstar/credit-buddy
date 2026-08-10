const block = "bg-vault-raised rounded";

export function Skeleton({ className = "" }: { className?: string }) {
  return <div className={`animate-pulse ${block} ${className}`} />;
}

export function SkeletonCard({ className = "" }: { className?: string }) {
  return (
    <div className={`vault-panel animate-pulse p-5 ${className}`}>
      <div className="flex items-center gap-4">
        <div className={`size-12 rounded-full ${block}`} />
        <div className="flex-1 space-y-2">
          <div className={`h-4 w-3/4 ${block}`} />
          <div className={`h-3 w-1/2 ${block}`} />
        </div>
      </div>
      <div className="mt-5 space-y-2">
        <div className={`h-8 w-full ${block}`} />
        <div className={`h-3 w-5/6 ${block}`} />
      </div>
    </div>
  );
}

export function SkeletonStats() {
  return (
    <div className="vault-panel animate-pulse p-5">
      <div className="flex items-start justify-between">
        <div className="space-y-2">
          <div className={`h-3.5 w-20 ${block}`} />
          <div className={`h-8 w-24 ${block}`} />
        </div>
        <div className={`size-10 rounded-lg ${block}`} />
      </div>
    </div>
  );
}

export function SkeletonTableRow() {
  return (
    <div className="flex animate-pulse items-center gap-4 border-b border-vault-border p-4">
      <div className={`h-4 w-8 ${block}`} />
      <div className="flex-1 space-y-2">
        <div className={`h-4 w-1/4 ${block}`} />
        <div className={`h-3 w-1/3 ${block}`} />
      </div>
      <div className={`h-6 w-16 rounded-full ${block}`} />
      <div className={`h-8 w-20 ${block}`} />
    </div>
  );
}

export function SkeletonGrid({ count = 4 }: { count?: number }) {
  return (
    <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
      {Array.from({ length: count }).map((_, i) => (
        <SkeletonCard key={i} />
      ))}
    </div>
  );
}

export function SkeletonTable({ rows = 5 }: { rows?: number }) {
  return (
    <div className="vault-panel overflow-hidden">
      {Array.from({ length: rows }).map((_, i) => (
        <SkeletonTableRow key={i} />
      ))}
    </div>
  );
}
