import { useEffect, useRef, useState } from "react";
import { createFileRoute } from "@tanstack/react-router";
import { Plug } from "lucide-react";
import { AppShell, DemoDataPill } from "@/components/layout/AppShell";
import { Panel } from "@/components/dashboard/primitives";
import { AppsHeaderActions, AppsHeaderStats, Breadcrumb, StatusSummary } from "@/components/apps/AppsHeader";
import { AppFiltersBar } from "@/components/apps/AppFilters";
import { AppsGrid, AppsList } from "@/components/apps/AppsViews";
import { AppsBulkActions, AppsEmptyState, AppsLoadingState } from "@/components/apps/AppsStates";
import { AppSettingsPanel } from "@/components/apps/AppSettingsPanel";
import { DisconnectConfirmModal, RotateKeyModal } from "@/components/apps/AppsModals";
import { ConnectAppWizard } from "@/components/apps/ConnectAppWizard";
import { useAppsManagement } from "@/hooks/useAppsManagement";
import type { ManagedApp } from "@/lib/apps";

export const Route = createFileRoute("/apps")({
  component: AppsPage,
  head: () => ({
    meta: [
      { title: "App Management — Credit Bank" },
      {
        name: "description",
        content:
          "Manage connected AI providers: rotate API keys, configure sync settings, review connection history and disconnect apps.",
      },
      { property: "og:title", content: "App Management — Credit Bank" },
      { property: "og:description", content: "Full control over your connected AI provider integrations." },
      { property: "og:type", content: "website" },
      { name: "twitter:card", content: "summary_large_image" },
    ],
  }),
});

function AppsPage() {
  const m = useAppsManagement();
  const [connectOpen, setConnectOpen] = useState(false);
  const [settingsApp, setSettingsApp] = useState<ManagedApp | null>(null);
  const [rotateApp, setRotateApp] = useState<ManagedApp | null>(null);
  const [disconnectApp, setDisconnectApp] = useState<ManagedApp | null>(null);
  const [bulkDisconnect, setBulkDisconnect] = useState(false);
  const searchRef = useRef<HTMLInputElement>(null);

  // Keep the open settings panel in sync with refreshed data.
  useEffect(() => {
    if (!settingsApp) return;
    const fresh = m.apps.find((a) => a.id === settingsApp.id);
    if (!fresh) setSettingsApp(null);
    else if (fresh !== settingsApp) setSettingsApp(fresh);
  }, [m.apps, settingsApp]);

  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      const mod = e.metaKey || e.ctrlKey;
      const key = e.key.toLowerCase();
      if (mod && key === "n") {
        e.preventDefault();
        setConnectOpen(true);
      } else if (mod && key === "f") {
        e.preventDefault();
        searchRef.current?.focus();
      } else if (mod && key === "a") {
        e.preventDefault();
        m.selectAll();
      } else if (mod && key === "s") {
        e.preventDefault();
        void m.bulkSync();
      } else if ((e.key === "Delete" || e.key === "Backspace") && m.selected.length > 0) {
        const tag = (e.target as HTMLElement | null)?.tagName;
        if (tag === "INPUT" || tag === "TEXTAREA") return;
        e.preventDefault();
        setBulkDisconnect(true);
      } else if (e.key === "Escape") {
        if (settingsApp) setSettingsApp(null);
        else m.clearSelection();
      }
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [m, settingsApp]);

  const viewProps = {
    apps: m.visible,
    syncingApps: m.syncingApps,
    selected: m.selected,
    onToggleSelect: m.toggleSelect,
    onSync: (app: ManagedApp) => void m.syncApp(app.id, app.displayName),
    onSettings: (app: ManagedApp) => setSettingsApp(app),
    onDisconnect: (app: ManagedApp) => setDisconnectApp(app),
  };

  return (
    <AppShell
      title="App Management"
      subtitle="Manage your connected AI providers and API keys"
      actions={
        <>
          <AppsHeaderActions
            selectedCount={m.selected.length}
            onConnect={() => setConnectOpen(true)}
            onSyncAll={() => void m.bulkSync()}
            onDisconnectSelected={() => m.selected.length && setBulkDisconnect(true)}
            onExport={m.exportSelected}
          />
          <DemoDataPill />
        </>
      }
    >
      <div className="flex flex-wrap items-center justify-between gap-3">
        <Breadcrumb />
        <StatusSummary connected={m.stats.connected} pending={m.stats.pending} disconnected={m.stats.disconnected} />
      </div>

      <AppsHeaderStats stats={m.stats} />

      {m.loading ? (
        <AppsLoadingState />
      ) : m.apps.length === 0 ? (
        <Panel title="Your connections">
          <AppsEmptyState onConnect={() => setConnectOpen(true)} />
        </Panel>
      ) : (
        <Panel title="Your connections">
          <div className="space-y-5">
            <AppFiltersBar
              ref={searchRef}
              filters={m.filters}
              setFilter={m.setFilter}
              clearFilters={m.clearFilters}
              view={m.view}
              setView={m.setView}
              resultCount={m.visible.length}
            />
            {m.visible.length === 0 ? (
              <div className="flex flex-col items-center gap-2 py-10 text-center">
                <Plug size={24} className="text-vault-teal" />
                <p className="text-sm text-vault-muted">No apps match these filters.</p>
                <button type="button" onClick={m.clearFilters} className="text-xs text-vault-teal hover:underline">
                  Clear filters
                </button>
              </div>
            ) : m.view === "grid" ? (
              <AppsGrid {...viewProps} />
            ) : (
              <AppsList {...viewProps} />
            )}
          </div>
        </Panel>
      )}

      <AppsBulkActions
        count={m.selected.length}
        onClear={m.clearSelection}
        onSync={() => void m.bulkSync()}
        onDisconnect={() => setBulkDisconnect(true)}
        onExport={m.exportSelected}
      />

      {settingsApp && (
        <AppSettingsPanel
          app={settingsApp}
          busy={m.busy}
          onClose={() => setSettingsApp(null)}
          onSave={(patch) => m.saveSettings(settingsApp.id, patch, settingsApp.displayName)}
          onRotateKey={() => setRotateApp(settingsApp)}
          onDisconnect={() => setDisconnectApp(settingsApp)}
        />
      )}

      {rotateApp && (
        <RotateKeyModal
          app={rotateApp}
          onClose={() => setRotateApp(null)}
          onRotate={(key) => m.rotateKey(rotateApp.id, key, rotateApp.displayName)}
        />
      )}

      {disconnectApp && (
        <DisconnectConfirmModal
          appName={disconnectApp.displayName}
          busy={m.busy}
          onClose={() => setDisconnectApp(null)}
          onConfirm={() => {
            const target = disconnectApp;
            setDisconnectApp(null);
            setSettingsApp(null);
            void m.disconnect(target.id, target.displayName);
          }}
        />
      )}

      {bulkDisconnect && (
        <DisconnectConfirmModal
          count={m.selected.length}
          busy={m.busy}
          onClose={() => setBulkDisconnect(false)}
          onConfirm={() => {
            setBulkDisconnect(false);
            void m.bulkDisconnect();
          }}
        />
      )}

      {connectOpen && (
        <ConnectAppWizard
          connectedApps={m.apps}
          onClose={() => setConnectOpen(false)}
          onConnected={() => void m.reload()}
        />
      )}
    </AppShell>
  );
}
