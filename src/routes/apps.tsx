import { useCallback, useEffect, useState } from "react";
import { createFileRoute } from "@tanstack/react-router";
import { toast } from "sonner";
import { Loader2, Plug, Plus } from "lucide-react";
import { AppShell, DemoDataPill } from "@/components/layout/AppShell";
import { AppRow, Panel } from "@/components/dashboard/primitives";
import { ConnectAppModal } from "@/components/dashboard/ConnectAppModal";
import { api, type ConnectedApp } from "@/lib/api";
import { PROVIDERS } from "@/lib/mock-data";

export const Route = createFileRoute("/apps")({
  component: AppsPage,
  head: () => ({
    meta: [
      { title: "Connected apps — Credit Bank" },
      {
        name: "description",
        content: "Manage OpenAI, Claude, Midjourney, Replicate and Hugging Face API connections and sync status.",
      },
      { property: "og:title", content: "Connected apps — Credit Bank" },
      { property: "og:description", content: "Manage your AI provider connections and key sync health." },
    ],
  }),
});

function AppsPage() {
  const [apps, setApps] = useState<ConnectedApp[]>([]);
  const [loading, setLoading] = useState(true);
  const [modalOpen, setModalOpen] = useState(false);
  const [presetProvider, setPresetProvider] = useState<string | undefined>(undefined);

  const load = useCallback(async () => {
    setApps(await api.getApps());
    setLoading(false);
  }, []);

  useEffect(() => {
    void load();
  }, [load]);

  const openModal = (providerId?: string) => {
    setPresetProvider(providerId);
    setModalOpen(true);
  };

  return (
    <AppShell
      title="Connected apps"
      subtitle="Manage your AI provider connections"
      actions={
        <>
          <button
            type="button"
            onClick={() => openModal(undefined)}
            className="flex items-center gap-2 rounded-full bg-vault-teal px-4 py-2 text-sm font-medium text-vault-bg transition hover:opacity-90"
          >
            <Plus size={15} />
            Add App
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
          <Panel title="Your connections">
            {apps.length === 0 ? (
              <div className="flex flex-col items-center gap-3 py-10 text-center">
                <Plug size={26} className="text-vault-teal" />
                <h3 className="font-display text-base font-semibold text-vault-foreground">No apps connected</h3>
                <p className="max-w-sm text-sm text-vault-muted">
                  Connect your AI provider API keys to start managing credits.
                </p>
                <button
                  type="button"
                  onClick={() => openModal(undefined)}
                  className="mt-2 rounded-full bg-vault-teal px-4 py-2 text-sm font-medium text-vault-bg"
                >
                  Connect first app
                </button>
              </div>
            ) : (
              <div className="space-y-3">
                {apps.map((app) => (
                  <AppRow key={app.id} app={app} />
                ))}
              </div>
            )}
          </Panel>

          <Panel title="Add a new app">
            <div className="grid gap-4 sm:grid-cols-2">
              {PROVIDERS.map((provider) => (
                <div key={provider.id} className="vault-raised flex items-center gap-3 p-4">
                  <span className="flex size-10 shrink-0 items-center justify-center rounded-xl bg-vault-teal/10 font-display text-xs font-semibold text-vault-teal">
                    {provider.initials}
                  </span>
                  <div className="min-w-0 flex-1">
                    <h3 className="font-display text-sm font-semibold text-vault-foreground">{provider.name}</h3>
                    <p className="text-xs text-vault-faint">Connect your API key</p>
                  </div>
                  <button
                    type="button"
                    onClick={() => openModal(provider.id)}
                    className="shrink-0 rounded-lg border border-vault-teal/40 bg-vault-teal/10 px-3 py-1.5 text-xs text-vault-teal transition hover:bg-vault-teal/20"
                  >
                    Connect
                  </button>
                </div>
              ))}
            </div>
          </Panel>
        </>
      )}

      <ConnectAppModal
        isOpen={modalOpen}
        onClose={() => setModalOpen(false)}
        connectedApps={apps}
        initialProvider={presetProvider}
        onConnected={(app) => {
          toast.success(`${app.name} connected`);
          void load();
        }}
      />
    </AppShell>
  );
}
