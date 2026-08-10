export type FilterOption = { value: string; label: string };

export const selectClass =
  "h-10 w-full rounded-xl border border-vault-border bg-vault-raised px-3 text-sm text-vault-foreground outline-none transition focus:border-vault-teal/60";

export function FilterDropdown({
  label,
  options,
  value,
  onChange,
  className = "",
}: {
  label?: string;
  options: FilterOption[];
  value: string;
  onChange: (v: string) => void;
  className?: string;
}) {
  return (
    <div className={className}>
      {label && (
        <span className="mb-1 block text-[11px] font-medium uppercase tracking-[0.12em] text-vault-faint">{label}</span>
      )}
      <select className={selectClass} value={value} aria-label={label ?? "Filter"} onChange={(e) => onChange(e.target.value)}>
        {options.map((o) => (
          <option key={o.value} value={o.value}>
            {o.label}
          </option>
        ))}
      </select>
    </div>
  );
}
