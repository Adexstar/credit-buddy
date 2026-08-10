import { ArrowUpDown } from "lucide-react";
import type { FilterOption } from "./FilterDropdown";

export function SortDropdown({
  options,
  value,
  onChange,
  label = "Sort by",
  className = "",
}: {
  options: FilterOption[];
  value: string;
  onChange: (v: string) => void;
  label?: string;
  className?: string;
}) {
  return (
    <div className={`flex items-center gap-2 ${className}`}>
      <ArrowUpDown size={14} className="text-vault-faint" />
      <span className="hidden text-xs text-vault-faint sm:inline">{label}</span>
      <select
        value={value}
        aria-label={label}
        onChange={(e) => onChange(e.target.value)}
        className="h-10 rounded-xl border border-vault-border bg-vault-raised px-3 text-sm text-vault-foreground outline-none transition focus:border-vault-teal/60"
      >
        {options.map((o) => (
          <option key={o.value} value={o.value}>
            {o.label}
          </option>
        ))}
      </select>
    </div>
  );
}
