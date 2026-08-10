import { useCallback, useEffect, useState } from "react";
import { createFileRoute } from "@tanstack/react-router";
import { toast } from "sonner";
import { AlertTriangle, Clock, Coins, Download, Layers, Loader2, RefreshCw, Wallet } from "lucide-react";
import { EXPORT_EVENT, REFRESH_EVENT } from "@/context/ShortcutsContext";
import { ExportModal } from "@/components/modals/ExportModal";
import { exportData } from "@/utils/export";

import { AppShell, DemoDataPill } from "@/components/layout/AppShell";
import {
  ActivityList,
  AppRow,
  BucketCard,
  ManageLink,
  Milestones,
  Panel,
  StatCard,
} from "@/components/dashboard/primitives";
import { UsageChart } from "@/components/dashboard/UsageChart";
import { ConnectAppModal } from "@/components/dashboard/ConnectAppModal";
import { BatchSyncButton } from "@/components/dashboard/BatchSyncButton";
import { SyncHistoryModal } from "@/components/dashboard/SyncHistory";
import { useSync } from "@/hooks/useSync";
import { CreditConversionModal } from "@/components/conversion/CreditConversionModal";
import { api, type Activity, type ConnectedApp, type CreditBucket, type Stats, type TimeRange, type UsageData } from "@/lib/api";
import { mockUser } from "@/lib/mock-data";

export const Route = createFileRoute("/")({
  component: DashboardPage,
  head: () => ({
    meta: [
      { title: "Dashboard — Credit Bank" },
      {
        name: "description",
        content: "See every AI credit balance, expiring bucket and automation in one unified vault dashboard.",
      },
      { property: "og:title", content: "Credit Bank dashboard" },
      { property: "og:description", content: "Every AI credit you own, in one vault." },
    ],
  }),
});

function DashboardPage() {
  const [stats, setStats] = useState<Stats | null>(null);
  const [apps, setApps] = useState<ConnectedApp[]>([]);
  const [buckets, setBuckets] = useState<CreditBucket[]>([]);
  const [activities, setActivities] = useState<Activity[]>([]);
  const [usage, setUsage] = useState<UsageData | null>(null);
  const [range, setRange] = useState<TimeRange>("7d");
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [modalOpen, setModalOpen] = useState(false);
  const [convertBucketId, setConvertBucketId] = useState<string | null>(null);
  const [historyApp, setHistoryApp] = useState<ConnectedApp | null>(null);
  const [exportOpen, setExportOpen] = useState(false);

  const load = useCallback(async () => {
    const [s, a, b, act] = await Promise.all([
      api.getStats(),
      api.getApps(),
      api.getBuckets(),
      api.getActivity(),
    ]);
    setStats(s);
    setApps(a);
    setBuckets(b);
    setActivities(act);
    setLoading(false);
  }, []);

  useEffect(() => {
    void load();
  }, [load]);

  const { syncApp, syncingApps, errors } = useSync(load);

  useEffect(() => {
    void api.getUsage(range).then(setUsage);
  }, [range]);

  const refresh = useCallback(async () => {
    setRefreshing(true);
    await load();
    setRefreshing(false);
    toast.success("Balances refreshed");
  }, [load]);

  useEffect(() => {
    const onRefresh = () => void refresh();
    const onExport = () => setExportOpen(true);
    document.addEventListener(REFRESH_EVENT, onRefresh);
    document.addEventListener(EXPORT_EVENT, onExport);
    return () => {
      document.removeEventListener(REFRESH_EVENT, onRefresh);
      document.removeEventListener(EXPORT_EVENT, onExport);
    };
  }, [refresh]);

  const exportRows = buckets.map((b) => ({
    id: b.id,
    app: b.appName,
    source: b.sourceType,
    remaining: b.remaining,
    original: b.original,
    expires: b.softExpiry,
  }));

  return (
    <AppShell
      title={`Welcome back, ${mockUser.name.split(" ")[0]}`}
      subtitle="Every AI credit you own, in one vault"
      actions={
        <>
          <button
            type="button"
            onClick={() => void refresh()}
            className="flex items-center gap-2 rounded-full bg-vault-teal px-4 py-2 text-sm font-medium text-vault-bg transition hover:opacity-90"
          >
            {refreshing ? <Loader2 size={15} className="animate-spin" /> : <RefreshCw size={15} />}
            Refresh
          </button>
          <BatchSyncButton apps={apps} onSync={syncApp} />
          <button
            type="button"
            onClick={() => setExportOpen(true)}
            className="inline-flex items-center gap-2 rounded-full border border-vault-border bg-vault-panel px-3 py-2 text-sm text-vault-muted transition hover:text-vault-foreground"
          >
            <Download size={15} />
            <span className="hidden sm:inline">Export</span>
          </button>
          <DemoDataPill />
        </>
      }
    >

      {loading ? (
        <div className="flex h-64 items-center justify-center">
          <Loader2 size={28} className="animate-spin text-vault-teal" />
        </div>
      ) : (
        <>
          <div id="stats-cards" className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
            <StatCard
              label="Connected apps"
              value={String(stats?.connectedApps ?? 0)}
              subtext={`${stats?.connectedApps ?? 0}/${stats?.providersSupported ?? 5} providers supported`}
              icon={<Layers size={18} />}
            />
            <StatCard
              label="Active buckets"
              value={String(stats?.activeBuckets ?? 0)}
              subtext="Credit pools with balance"
              icon={<Wallet size={18} />}
              trend={stats?.bucketsTrend}
            />
            <StatCard
              label="Expiring credits"
              value={`$${(stats?.expiringCredits ?? 0).toFixed(2)}`}
              subtext="Within the next 7 days"
              icon={<Clock size={18} />}
              tone="amber"
            />
            <StatCard
              label="Total balance"
              value={`$${(stats?.totalBalance ?? 0).toFixed(2)}`}
              subtext="Across all connected apps"
              icon={<Coins size={18} />}
              trend={stats?.balanceTrend}
              tone="danger"
            />
          </div>

          <Milestones
            steps={[
              {
                label: "Connect an app",
                hint: "Link a provider API key",
                done: apps.length > 0,
                onClick: () => setModalOpen(true),
              },
              { label: "Set a policy", hint: "Automate conversions", done: true },
              { label: "Route a request", hint: "Send traffic through the proxy", done: false },
            ]}
          />

          <div className="grid gap-6 lg:grid-cols-[1.6fr_1fr]">
            <div className="space-y-6">
              <div id="connected-apps">
                <Panel title="Connected apps" action={<ManageLink to="/apps">Manage</ManageLink>}>
                  <div className="space-y-3">
                    {apps.map((app) => (
                      <AppRow
                        key={app.id}
                        app={app}
                        isSyncing={Boolean(syncingApps[app.id])}
                        errorMessage={errors[app.id]}
                        onSync={() => void syncApp(app.id, app.name)}
                        onHistory={() => setHistoryApp(app)}
                      />
                    ))}
                  </div>
                </Panel>
              </div>

              <div id="credit-buckets">
                <Panel title="Credit buckets" action={<ManageLink to="/credits">All buckets</ManageLink>}>
                  <div className="space-y-3">
                    {buckets.map((bucket) => (
                      <BucketCard
                        key={bucket.id}
                        bucket={bucket}
                        onConvert={() => setConvertBucketId(bucket.id)}
                      />
                    ))}
                  </div>
                </Panel>
              </div>
            </div>

            <div id="recent-activity">
              <Panel title="Recent activity" className="h-fit">
                <ActivityList activities={activities} />
              </Panel>
            </div>
          </div>


          <UsageChart data={usage} range={range} onRangeChange={setRange} />

          <p className="flex items-center gap-2 text-xs text-vault-faint">
            <AlertTriangle size={13} />
            {api.usingMockData
              ? "Showing demo data — set VITE_API_URL to point at your backend."
              : "Live data from your backend API."}
          </p>
        </>
      )}

      {historyApp && (
        <SyncHistoryModal appId={historyApp.id} appName={historyApp.name} onClose={() => setHistoryApp(null)} />
      )}

      <CreditConversionModal
        isOpen={convertBucketId !== null}
        onClose={() => setConvertBucketId(null)}
        buckets={buckets}
        apps={apps}
        initialBucketId={convertBucketId ?? undefined}
        onConverted={() => void load()}
        onConnectApp={() => setModalOpen(true)}
      />

      <ConnectAppModal
        isOpen={modalOpen}
        onClose={() => setModalOpen(false)}
        connectedApps={apps}
        onConnected={(app) => {
          toast.success(`${app.name} connected`);
          void load();
        }}
      />

      <ExportModal
        isOpen={exportOpen}
        onClose={() => setExportOpen(false)}
        rowCount={exportRows.length}
        onExport={(options) => {
          try {
            exportData(exportRows, "credit-buckets", options);
            toast.success(`Exported credit-buckets.${options.format}`);
          } catch (error) {
            toast.error(`Export failed: ${(error as Error).message}`);
          }
        }}
      />
    </AppShell>

  );
}
