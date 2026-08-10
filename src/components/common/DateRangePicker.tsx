export function DateRangePicker({
  startDate,
  endDate,
  onStartChange,
  onEndChange,
  className = "",
}: {
  startDate: string;
  endDate: string;
  onStartChange: (v: string) => void;
  onEndChange: (v: string) => void;
  className?: string;
}) {
  const inputClass =
    "h-10 w-full rounded-xl border border-vault-border bg-vault-raised px-3 text-sm text-vault-foreground outline-none transition focus:border-vault-teal/60 [color-scheme:dark]";

  return (
    <div className={`flex items-end gap-2 ${className}`}>
      <label className="flex-1">
        <span className="mb-1 block text-[11px] font-medium uppercase tracking-[0.12em] text-vault-faint">From</span>
        <input type="date" value={startDate} max={endDate || undefined} onChange={(e) => onStartChange(e.target.value)} className={inputClass} />
      </label>
      <label className="flex-1">
        <span className="mb-1 block text-[11px] font-medium uppercase tracking-[0.12em] text-vault-faint">To</span>
        <input type="date" value={endDate} min={startDate || undefined} onChange={(e) => onEndChange(e.target.value)} className={inputClass} />
      </label>
    </div>
  );
}
