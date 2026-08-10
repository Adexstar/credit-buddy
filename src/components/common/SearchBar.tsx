import { forwardRef, useState } from "react";
import { Search, X } from "lucide-react";

export const SearchBar = forwardRef<
  HTMLInputElement,
  {
    value: string;
    onChange: (v: string) => void;
    placeholder?: string;
    className?: string;
    onClear?: () => void;
    label?: string;
  }
>(function SearchBar({ value, onChange, placeholder = "Search…", className = "", onClear, label = "Search" }, ref) {
  const [focused, setFocused] = useState(false);

  return (
    <div className={`relative ${className}`}>
      <Search size={15} className="absolute left-3 top-1/2 -translate-y-1/2 text-vault-faint" />
      <input
        ref={ref}
        type="text"
        value={value}
        aria-label={label}
        placeholder={placeholder}
        onChange={(e) => onChange(e.target.value)}
        onFocus={() => setFocused(true)}
        onBlur={() => setFocused(false)}
        className={`h-10 w-full rounded-xl border bg-vault-bg pl-9 pr-9 text-sm text-vault-foreground outline-none transition ${
          focused ? "border-vault-teal/60" : "border-vault-border"
        }`}
      />
      {value && (
        <button
          type="button"
          aria-label="Clear search"
          onClick={() => (onClear ? onClear() : onChange(""))}
          className="absolute right-2.5 top-1/2 -translate-y-1/2 rounded-md p-1 text-vault-faint transition hover:text-vault-foreground"
        >
          <X size={14} />
        </button>
      )}
    </div>
  );
});
