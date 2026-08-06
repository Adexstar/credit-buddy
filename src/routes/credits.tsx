import { useCallback, useEffect, useState } from "react";
import { createFileRoute } from "@tanstack/react-router";
import { toast } from "sonner";
import { Loader2 } from "lucide-react";
import { AppShell, DemoDataPill } from "@/components/layout/AppShell";
import { ActivityList, BucketCard, Panel } from "@/components/dashboard/primitives";
import { UsageChart } from "@/components/dashboard/UsageChart";
import { api, type Activity, type CreditBucket, type Stats, type TimeRange, type UsageData } from "@/lib/api";

export const Route = createFileRoute("/credits")({
  component: CreditsPage,
  head: () => ({
    meta: [
      { title: "Credit overview — Credit Bank" },
      {
        name: "description",
        content: "Break down credit buckets by source, expiry and app, with usage trends and recent ledger activity.",
      },
      { property: "og:title", content: "Credit overview — Credit Bank" },
      { property: "og:description", content: "Buckets, expiry windows and usage trends across every provider." },
    ],
  }),
});

function CreditsPage() {
  const [stats, setStats] = useState<Stats | null>(null);
  const [buckets, setBuckets] = useState<CreditBucket[]>([]);
  const [activities, setActivities] = useState<Activity[]>([]);
  const [usage, setUsage] = useState<UsageData | null>(null);
  const [range, setRange] = useState<TimeRange>("7d");
  const [appFilter, setAppFilter] = useState("all");
  const [loading, setLoading] = useState(true);

  const load = useCallback(async () => {
    const [s, b, act] = await Promise.all([api.getStats(), api.getBuckets(), api.getActivity()]);
    setStats(s);
    setBuckets(b);
    setActivities(act);
    setLoading(false);
  }, []);

  useEffect(() => {
    void load();
  }, [load]);

  useEffect(() => {
    void api.getUsage(range).then(setUsage);
  }, [range]);

  const appNames = ["all", ...Array.from(new Set(buckets.map((b) => b.appName)))];
  const visible = appFilter === "all" ? buckets : buckets.filter((b) => b.appName === appFilter);

  return (
    <AppShell
      title="Credit overview"
      subtitle="Balances, buckets and expiry windows across all apps"
      actions={<DemoDataPill />}
    >
      {loading ? (
        <div className="flex h-64 items-center justify-center">
          <Loader2 size={28} className="animate-spin text-vault-teal" />
        </div>
      ) : (
        <>
          <Panel>
            <div className="flex flex-wrap items-end justify-between gap-4">
              <div>
                <p className="text-[11px] font-medium tracking-[0.14em] text-vault-faint uppercase">Total balance</p>
                <p className="vault-mono mt-2 text-3xl font-semibold text-vault-foreground">
                  ${(stats?.totalBalance ?? 0).toFixed(2)}
                </p>
              </div>
              <p className="text-sm text-vault-muted">Across all connected apps</p>
            </div>
          </Panel>

          <Panel
            title="Credit buckets"
            action={
              <select
                value={appFilter}
                onChange={(e) => setAppFilter(e.target.value)}
                className="h-9 rounded-lg border border-vault-border bg-vault-raised px-3 text-xs text-vault-foreground outline-none"
              >
                {appNames.map((name) => (
                  <option key={name} value={name}>
                    {name === "all" ? "All apps" : name}
                  </option>
                ))}
              </select>
            }
          >
            <div className="space-y-3">
              {visible.map((bucket) => (
                <BucketCard
                  key={bucket.id}
                  bucket={bucket}
                  onConvert={() => toast.info(`Conversion queued for ${bucket.appName} ${bucket.sourceType}`)}
                />
              ))}
            </div>
          </Panel>

          <UsageChart data={usage} range={range} onRangeChange={setRange} />

          <Panel title="Recent activity">
            <ActivityList activities={activities} />
          </Panel>
        </>
      )}
    </AppShell>
  );
}
