export function SyncProgressBar({ label = "Fetching latest balance…" }: { label?: string }) {
  return (
    <div className="mt-3" aria-hidden="true">
      <div className="h-1 w-full overflow-hidden rounded-full bg-vault-panel">
        <div className="h-full w-1/3 animate-[vault-sweep_1.1s_ease-in-out_infinite] rounded-full bg-vault-blue" />
      </div>
      <p className="mt-1.5 text-xs text-vault-faint">{label}</p>
    </div>
  );
}

export function Spinner({ size = 15, className = "" }: { size?: number; className?: string }) {
  return (
    <svg
      className={`animate-spin ${className}`}
      width={size}
      height={size}
      viewBox="0 0 24 24"
      fill="none"
      aria-hidden="true"
    >
      <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
      <path
        className="opacity-90"
        fill="currentColor"
        d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
      />
    </svg>
  );
}
