import { SYNC_STATUS_META, type SyncUiStatus } from "@/lib/sync";

export function SyncStatusBadge({ status }: { status: SyncUiStatus }) {
  const meta = SYNC_STATUS_META[status];
  return (
    <span
      role="status"
      aria-live="polite"
      title={meta.tooltip}
      className={`inline-flex items-center gap-1.5 rounded-full border px-2 py-0.5 text-xs ${meta.className}`}
    >
      <span className={`size-1.5 rounded-full ${meta.dot} ${status === "syncing" ? "animate-pulse" : ""}`} />
      {meta.label}
    </span>
  );
}
