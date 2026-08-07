import { Search, ShieldOff } from "lucide-react";
import { POLICY_TYPES, type PolicyType } from "@/lib/policies";
import { PrimaryButton } from "./ui";

export function PolicyFilters({
  searchQuery,
  onSearch,
  filterType,
  onFilter,
  searchRef,
}: {
  searchQuery: string;
  onSearch: (v: string) => void;
  filterType: PolicyType | "all";
  onFilter: (v: PolicyType | "all") => void;
  searchRef?: React.RefObject<HTMLInputElement | null>;
}) {
  return (
    <div className="flex flex-col gap-3 sm:flex-row sm:items-center">
      <div className="relative flex-1">
        <Search size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-vault-faint" />
        <input
          ref={searchRef}
          type="search"
          value={searchQuery}
          onChange={(e) => onSearch(e.target.value)}
          placeholder="Search by policy name or app"
          aria-label="Search policies"
          className="w-full rounded-xl border border-vault-border bg-vault-bg py-2.5 pl-9 pr-3 text-sm text-vault-foreground outline-none transition focus:border-vault-teal/60"
        />
      </div>
      <div className="flex gap-2 overflow-x-auto">
        {(["all", ...POLICY_TYPES.map((t) => t.id)] as const).map((id) => (
          <button
            key={id}
            type="button"
            onClick={() => onFilter(id)}
            className={`shrink-0 rounded-full px-3 py-1.5 text-xs transition ${
              filterType === id
                ? "bg-vault-teal/10 text-vault-teal"
                : "border border-vault-border text-vault-muted hover:text-vault-foreground"
            }`}
          >
            {id === "all" ? "All types" : POLICY_TYPES.find((t) => t.id === id)!.label}
          </button>
        ))}
      </div>
    </div>
  );
}

export function PolicyEmptyState({ onCreate, filtered }: { onCreate: () => void; filtered: boolean }) {
  return (
    <div className="flex flex-col items-center justify-center gap-4 py-14 text-center">
      <div className="flex size-16 items-center justify-center rounded-2xl border border-vault-border bg-vault-raised text-vault-faint">
        <ShieldOff size={26} />
      </div>
      <div>
        <h3 className="font-display text-lg font-semibold text-vault-foreground">
          {filtered ? "No policies match this filter" : "No policies created yet"}
        </h3>
        <p className="mt-1 max-w-sm text-sm text-vault-muted">
          {filtered
            ? "Try a different search term or clear the type filter."
            : "Policies convert, route and cap credits automatically so nothing expires unused."}
        </p>
      </div>
      {!filtered && <PrimaryButton onClick={onCreate}>Create your first policy</PrimaryButton>}
    </div>
  );
}
