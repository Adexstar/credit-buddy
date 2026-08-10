import { useEffect, useMemo, useRef, useState } from "react";
import { useNavigate } from "@tanstack/react-router";
import { Clock, Loader2, Package, Plug, Rocket, ScrollText, Search, TrendingUp, X } from "lucide-react";
import { api } from "@/lib/api";

type ResultType = "app" | "bucket" | "activity" | "policy";

interface SearchResult {
  id: string;
  type: ResultType;
  title: string;
  description: string;
  to: string;
}

const RECENT_KEY = "recent_searches";

const TYPE_META: Record<ResultType, { icon: typeof Plug; tone: string; label: string }> = {
  app: { icon: Plug, tone: "bg-vault-blue/10 text-vault-blue border-vault-blue/30", label: "app" },
  bucket: { icon: Package, tone: "bg-vault-teal/10 text-vault-teal border-vault-teal/30", label: "bucket" },
  activity: { icon: TrendingUp, tone: "bg-vault-green/10 text-vault-green border-vault-green/30", label: "activity" },
  policy: { icon: ScrollText, tone: "bg-vault-amber/10 text-vault-amber border-vault-amber/30", label: "policy" },
};

const match = (q: string, ...fields: Array<string | undefined>) =>
  fields.some((f) => (f ?? "").toLowerCase().includes(q.toLowerCase()));

async function performSearch(q: string): Promise<SearchResult[]> {
  const [apps, buckets, activities, policies] = await Promise.all([
    api.getApps(),
    api.getBuckets(),
    api.getActivity(),
    api.getPolicies(),
  ]);

  return [
    ...apps
      .filter((a) => match(q, a.name, a.provider))
      .map<SearchResult>((a) => ({
        id: `app-${a.id}`,
        type: "app",
        title: a.name,
        description: `${a.credits.toFixed(2)} credits • ${a.syncStatus}`,
        to: "/apps",
      })),
    ...buckets
      .filter((b) => match(q, b.appName, b.sourceType))
      .map<SearchResult>((b) => ({
        id: `bucket-${b.id}`,
        type: "bucket",
        title: `${b.appName} ${b.sourceType}`,
        description: `${b.remaining.toFixed(2)} / ${b.original.toFixed(2)} credits • expires ${new Date(
          b.softExpiry,
        ).toLocaleDateString()}`,
        to: "/credits",
      })),
    ...activities
      .filter((act) => match(q, act.message, act.appName, act.kind))
      .map<SearchResult>((act) => ({
        id: `activity-${act.id}`,
        type: "activity",
        title: act.message,
        description: `${act.appName} • ${new Date(act.timestamp).toLocaleString()}`,
        to: "/credits",
      })),
    ...policies
      .filter((p) => match(q, p.name, p.description, p.trigger))
      .map<SearchResult>((p) => ({
        id: `policy-${p.id}`,
        type: "policy",
        title: p.name,
        description: p.trigger || p.description,
        to: "/policies",
      })),
  ];
}

export function GlobalSearch({ isOpen, onClose }: { isOpen: boolean; onClose: () => void }) {
  const [query, setQuery] = useState("");
  const [results, setResults] = useState<SearchResult[]>([]);
  const [selectedIndex, setSelectedIndex] = useState(0);
  const [isLoading, setIsLoading] = useState(false);
  const [recentSearches, setRecentSearches] = useState<string[]>([]);
  const inputRef = useRef<HTMLInputElement>(null);
  const navigate = useNavigate();

  useEffect(() => {
    const saved = window.localStorage.getItem(RECENT_KEY);
    if (saved) {
      try {
        setRecentSearches(JSON.parse(saved) as string[]);
      } catch {
        setRecentSearches([]);
      }
    }
  }, []);

  useEffect(() => {
    if (isOpen) {
      setSelectedIndex(0);
      inputRef.current?.focus();
    } else {
      setQuery("");
      setResults([]);
    }
  }, [isOpen]);

  useEffect(() => {
    if (!isOpen) return;
    if (query.trim().length < 2) {
      setResults([]);
      setIsLoading(false);
      return;
    }
    setIsLoading(true);
    const timer = setTimeout(() => {
      void performSearch(query.trim())
        .then((r) => {
          setResults(r);
          setSelectedIndex(0);
          if (query.trim().length >= 3) {
            setRecentSearches((prev) => {
              const next = [query.trim(), ...prev.filter((s) => s !== query.trim())].slice(0, 8);
              window.localStorage.setItem(RECENT_KEY, JSON.stringify(next));
              return next;
            });
          }
        })
        .finally(() => setIsLoading(false));
    }, 300);
    return () => clearTimeout(timer);
  }, [query, isOpen]);

  const grouped = useMemo(() => results, [results]);

  useEffect(() => {
    if (!isOpen) return;
    const onEscape = (event: KeyboardEvent) => {
      if (event.key === "Escape") onClose();
    };
    document.addEventListener("keydown", onEscape);
    return () => document.removeEventListener("keydown", onEscape);
  }, [isOpen, onClose]);

  const openResult = (result: SearchResult) => {
    onClose();
    void navigate({ to: result.to });
  };


  const onKeyDown = (event: React.KeyboardEvent) => {
    if (event.key === "Escape") {
      event.preventDefault();
      onClose();
    } else if (event.key === "ArrowDown") {
      event.preventDefault();
      setSelectedIndex((i) => (grouped.length ? (i + 1) % grouped.length : 0));
    } else if (event.key === "ArrowUp") {
      event.preventDefault();
      setSelectedIndex((i) => (grouped.length ? (i - 1 + grouped.length) % grouped.length : 0));
    } else if (event.key === "Enter" && grouped[selectedIndex]) {
      event.preventDefault();
      openResult(grouped[selectedIndex]!);
    }
  };

  if (!isOpen) return null;

  return (
    <div
      role="dialog"
      aria-modal="true"
      aria-label="Global search"
      className="fixed inset-0 z-[110] bg-vault-bg/80 px-4 py-16 backdrop-blur-sm animate-[vault-fade-in_0.15s_ease-out] sm:py-24"
      onClick={onClose}
    >
      <div
        className="mx-auto w-full max-w-2xl overflow-hidden rounded-2xl border border-vault-border bg-vault-panel shadow-2xl animate-[vault-scale-in_0.18s_ease-out]"
        onClick={(e) => e.stopPropagation()}
        onKeyDown={onKeyDown}
      >
        <div className="flex items-center gap-3 border-b border-vault-border px-4 py-3">
          <Search size={18} className="shrink-0 text-vault-faint" />
          <input
            ref={inputRef}
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            placeholder="Search apps, buckets, activity or policies…"
            aria-label="Search"
            className="flex-1 bg-transparent text-base text-vault-foreground outline-none placeholder:text-vault-faint"
          />
          <kbd className="hidden rounded border border-vault-border bg-vault-raised px-1.5 py-0.5 text-xs text-vault-faint sm:inline">
            ⌘K
          </kbd>
          <button
            type="button"
            aria-label="Close search"
            onClick={onClose}
            className="rounded-md p-1 text-vault-faint transition hover:bg-vault-raised hover:text-vault-foreground"
          >
            <X size={16} />
          </button>
        </div>

        <div className="max-h-[24rem] overflow-y-auto p-2">
          {isLoading ? (
            <div className="py-10 text-center">
              <Loader2 size={22} className="mx-auto animate-spin text-vault-teal" />
              <p className="mt-2 text-sm text-vault-muted">Searching…</p>
            </div>
          ) : grouped.length > 0 ? (
            <ul className="space-y-1">
              {grouped.map((result, index) => {
                const meta = TYPE_META[result.type];
                const Icon = meta.icon;
                return (
                  <li key={result.id}>
                    <button
                      type="button"
                      onClick={() => openResult(result)}
                      onMouseEnter={() => setSelectedIndex(index)}
                      className={`flex w-full items-center gap-3 rounded-xl px-3 py-2.5 text-left transition ${
                        index === selectedIndex ? "bg-vault-raised" : "hover:bg-vault-raised/60"
                      }`}
                    >
                      <span className={`flex size-9 shrink-0 items-center justify-center rounded-lg border ${meta.tone}`}>
                        <Icon size={16} />
                      </span>
                      <span className="min-w-0 flex-1">
                        <span className="block truncate text-sm font-medium text-vault-foreground">{result.title}</span>
                        <span className="block truncate text-xs text-vault-faint">{result.description}</span>
                      </span>
                      <span className={`rounded-full border px-2 py-0.5 text-[11px] ${meta.tone}`}>{meta.label}</span>
                    </button>
                  </li>
                );
              })}
            </ul>
          ) : query.trim().length >= 2 ? (
            <div className="py-10 text-center">
              <Search size={26} className="mx-auto text-vault-faint" />
              <p className="mt-2 text-sm text-vault-muted">No results found</p>
              <p className="mt-1 text-xs text-vault-faint">Try a different search term</p>
            </div>
          ) : recentSearches.length > 0 ? (
            <div className="p-2">
              <p className="px-2 pb-2 text-xs font-medium tracking-wide text-vault-faint uppercase">Recent searches</p>
              {recentSearches.map((term) => (
                <button
                  key={term}
                  type="button"
                  onClick={() => setQuery(term)}
                  className="flex w-full items-center gap-2 rounded-lg px-3 py-2 text-left text-sm text-vault-muted transition hover:bg-vault-raised hover:text-vault-foreground"
                >
                  <Clock size={14} className="text-vault-faint" />
                  {term}
                </button>
              ))}
            </div>
          ) : (
            <div className="py-10 text-center">
              <Rocket size={26} className="mx-auto text-vault-teal" />
              <p className="mt-2 text-sm text-vault-muted">Search across your entire Credit Bank</p>
              <div className="mt-4 flex flex-wrap justify-center gap-3 text-xs text-vault-faint">
                <span className="inline-flex items-center gap-1.5">
                  <Plug size={13} /> Apps
                </span>
                <span className="inline-flex items-center gap-1.5">
                  <Package size={13} /> Buckets
                </span>
                <span className="inline-flex items-center gap-1.5">
                  <TrendingUp size={13} /> Activity
                </span>
                <span className="inline-flex items-center gap-1.5">
                  <ScrollText size={13} /> Policies
                </span>
              </div>
            </div>
          )}
        </div>

        <div className="flex items-center justify-between border-t border-vault-border px-4 py-2.5 text-xs text-vault-faint">
          <span>Esc to close • ↑↓ to navigate • Enter to open</span>
          <span>{grouped.length ? `${grouped.length} results` : "Credit Bank"}</span>
        </div>
      </div>
    </div>
  );
}
