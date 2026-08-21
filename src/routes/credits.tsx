import { useEffect, useRef, useState } from "react";
import { createFileRoute, Link } from "@tanstack/react-router";
import { Coins, Download, LayoutGrid, Plus, Rows3 } from "lucide-react";
import { AppShell, DemoDataPill } from "@/components/layout/AppShell";
import { Panel } from "@/components/dashboard/primitives";
import { UsageChart } from "@/components/dashboard/UsageChart";
import { CreditsFilters } from "@/components/credits/CreditsFilters";
import { CreditsGrid, CreditsTable } from "@/components/credits/CreditsViews";
import { CreditsBulkActions } from "@/components/credits/CreditsBulkActions";
import { CreditsAnalytics } from "@/components/credits/CreditsAnalytics";
import { CreditsHistory } from "@/components/credits/CreditsHistory";
import { CreditsEmptyState, CreditsLoadingState } from "@/components/credits/CreditsStates";
import { AddCreditsModal, ConfirmDeleteModal } from "@/components/credits/CreditsModals";
import { BucketDetailPanel } from "@/components/credits/BucketDetailPanel";
import { SpendOptionsPanel } from "@/components/credits/SpendOptionsPanel";
import { useCreditsManagement } from "@/hooks/useCreditsManagement";
import { PROVIDERS } from "@/lib/mock-data";
import { api, type TimeRange, type UsageData } from "@/lib/api";
import type { CreditBucket } from "@/lib/credits";

export const Route = createFileRoute("/credits")({
  component: CreditsPage,
  head: () => ({
    meta: [
      { title: "Credits management — Credit Bank" },
      {
        name: "description",
        content:
          "Manage every credit bucket: filter by app, status and source, track expiry, add credits and export your ledger to CSV.",
      },
      { property: "og:title", content: "Credits management — Credit Bank" },
      { property: "og:description", content: "Filter, sort, track and export credit buckets across every provider." },
      { property: "og:type", content: "website" },
      { name: "twitter:card", content: "summary_large_image" },
    ],
  }),
});

function StatTile({ label, value }: { label: string; value: string }) {
  return (
    <div className="vault-panel p-4">
      <p className="text-[11px] font-medium tracking-[0.14em] text-vault-faint uppercase">{label}</p>
      <p className="vault-mono mt-2 text-xl font-semibold text-vault-foreground">{value}</p>
    </div>
  );
}

function CreditsPage() {
  const credits = useCreditsManagement();
  const [view, setView] = useState<"table" | "grid">("table");
  const [usage, setUsage] = useState<UsageData | null>(null);
  const [range, setRange] = useState<TimeRange>("7d");
  const [detail, setDetail] = useState<CreditBucket | null>(null);
  const [spendBucket, setSpendBucket] = useState<CreditBucket | null>(null);
  const [showAdd, setShowAdd] = useState(false);
  const [deleteIds, setDeleteIds] = useState<string[] | null>(null);
  const searchRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    void api.getUsage(range).then(setUsage);
  }, [range]);

  const appNames = Array.from(new Set([...PROVIDERS.map((p) => p.name.replace(" (Anthropic)", "")), ...credits.buckets.map((b) => b.appName)]));

  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      const meta = e.metaKey || e.ctrlKey;
      const typing = document.activeElement instanceof HTMLInputElement || document.activeElement instanceof HTMLSelectElement;
      if (meta && e.key.toLowerCase() === "a") {
        e.preventDefault();
        credits.selectAll();
      } else if (meta && e.key.toLowerCase() === "f") {
        e.preventDefault();
        searchRef.current?.focus();
      } else if (meta && e.key.toLowerCase() === "e") {
        e.preventDefault();
        credits.exportCsv();
      } else if (meta && e.key.toLowerCase() === "n") {
        e.preventDefault();
        setShowAdd(true);
      } else if ((e.key === "Delete" || e.key === "Backspace") && !typing && credits.selected.length > 0) {
        e.preventDefault();
        setDeleteIds(credits.selected);
      } else if (e.key === "Escape") {
        credits.clearSelection();
      }
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [credits]);

  const filtersActive =
    credits.filters.app !== "all" ||
    credits.filters.status !== "all" ||
    credits.filters.source !== "all" ||
    credits.filters.expiry !== "all" ||
    credits.filters.search !== "";

  return (
    <AppShell
      title="Credits management"
      subtitle="Every bucket, with filters, bulk actions and full transaction history"
      actions={
        <div className="flex flex-wrap items-center gap-2">
          <DemoDataPill />
          <button
            type="button"
            onClick={() => credits.exportCsv()}
            className="inline-flex items-center gap-1.5 rounded-xl border border-vault-border bg-vault-panel px-3 py-2 text-xs text-vault-muted transition hover:text-vault-foreground"
          >
            <Download size={14} /> Export CSV
          </button>
          <button
            type="button"
            onClick={() => setShowAdd(true)}
            className="inline-flex items-center gap-1.5 rounded-xl bg-vault-teal px-3 py-2 text-xs font-medium text-vault-bg transition hover:bg-vault-teal-deep"
          >
            <Plus size={14} /> Add credits
          </button>
        </div>
      }
    >
      <nav aria-label="Breadcrumb" className="text-xs text-vault-faint">
        <Link to="/" className="hover:text-vault-foreground">
          Dashboard
        </Link>
        <span className="mx-1.5">/</span>
        <span className="text-vault-muted">Credits management</span>
      </nav>

      <div className="vault-panel flex flex-wrap items-end justify-between gap-4 p-5">
        <div>
          <p className="flex items-center gap-2 text-[11px] font-medium tracking-[0.14em] text-vault-faint uppercase">
            <Coins size={13} className="text-vault-teal" /> Total balance
          </p>
          <p className="vault-mono mt-2 text-3xl font-semibold text-vault-foreground">${credits.stats.total.toFixed(2)}</p>
        </div>
        <p className="text-sm text-vault-muted">
          {credits.stats.active} active buckets · {credits.stats.expiring} expiring soon · {credits.stats.empty} empty
        </p>
      </div>

      <div className="grid grid-cols-2 gap-3 lg:grid-cols-3 xl:grid-cols-6">
        <StatTile label="Total credits" value={credits.stats.total.toFixed(2)} />
        <StatTile label="Active buckets" value={String(credits.stats.active)} />
        <StatTile label="Expiring ≤ 7d" value={String(credits.stats.expiring)} />
        <StatTile label="Empty buckets" value={String(credits.stats.empty)} />
        <StatTile label="Used this month" value={credits.stats.usedThisMonth.toFixed(2)} />
        <StatTile label="Added this month" value={credits.stats.addedThisMonth.toFixed(2)} />
      </div>

      <CreditsFilters
        filters={credits.filters}
        apps={appNames}
        searchRef={searchRef}
        onChange={credits.setFilter}
        onReset={credits.resetFilters}
      />

      <Panel
        title={`Credit buckets (${credits.visible.length})`}
        action={
          <div className="flex items-center gap-1 rounded-lg border border-vault-border bg-vault-raised p-1">
            {([
              ["table", Rows3],
              ["grid", LayoutGrid],
            ] as const).map(([value, Icon]) => (
              <button
                key={value}
                type="button"
                aria-label={`${value} view`}
                onClick={() => setView(value)}
                className={`rounded-md p-1.5 transition ${view === value ? "bg-vault-teal/15 text-vault-teal" : "text-vault-muted hover:text-vault-foreground"}`}
              >
                <Icon size={15} />
              </button>
            ))}
          </div>
        }
      >
        {credits.loading ? (
          <CreditsLoadingState />
        ) : credits.visible.length === 0 ? (
          <CreditsEmptyState filtered={filtersActive} onAdd={() => setShowAdd(true)} />
        ) : view === "table" ? (
          <div className="hidden sm:block">
            <CreditsTable
              rows={credits.visible}
              selected={credits.selected}
              onToggle={credits.toggleSelect}
              onSelectAll={() => (credits.selected.length === credits.visible.length ? credits.clearSelection() : credits.selectAll())}
              onOpen={setDetail}
            />
          </div>
        ) : null}

        {!credits.loading && credits.visible.length > 0 && (
          <div className={view === "table" ? "sm:hidden" : ""}>
            <CreditsGrid rows={credits.visible} selected={credits.selected} onToggle={credits.toggleSelect} onOpen={setDetail} />
          </div>
        )}
      </Panel>

      <CreditsBulkActions
        selected={credits.selectedBuckets}
        busy={credits.busy}
        onFreeze={() => void credits.freeze(credits.selected, !credits.selectedBuckets.every((b) => b.frozen))}
        onDelete={() => setDeleteIds(credits.selected)}
        onExport={() => credits.exportCsv(credits.selectedBuckets)}
        onMarkUsed={() => void credits.markUsed(credits.selected)}
        onClear={credits.clearSelection}
      />

      <CreditsAnalytics buckets={credits.buckets} />

      <UsageChart data={usage} range={range} onRangeChange={setRange} />

      <Panel title="Transaction history">
        <CreditsHistory />
      </Panel>

      {detail && (
        <BucketDetailPanel
          bucket={credits.buckets.find((b) => b.id === detail.id) ?? detail}
          onClose={() => setDetail(null)}
          onSpendOptions={(bucket) => {
            setDetail(null);
            setSpendBucket(bucket);
          }}
          onFreeze={(bucket) => void credits.freeze([bucket.id], !bucket.frozen)}
          onDelete={(bucket) => {
            setDetail(null);
            setDeleteIds([bucket.id]);
          }}
        />
      )}

      {showAdd && (
        <AddCreditsModal apps={appNames} onClose={() => setShowAdd(false)} onAdd={(input) => void credits.addCredits(input)} />
      )}


      {deleteIds && (
        <ConfirmDeleteModal count={deleteIds.length} onClose={() => setDeleteIds(null)} onConfirm={() => void credits.remove(deleteIds)} />
      )}

      {spendBucket && <SpendOptionsPanel bucket={spendBucket} onClose={() => setSpendBucket(null)} />}
    </AppShell>
  );
}
