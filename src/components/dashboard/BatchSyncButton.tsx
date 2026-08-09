import { useState } from "react";
import { RefreshCw } from "lucide-react";
import { Spinner } from "./SyncProgressBar";
import type { ConnectedApp } from "@/lib/api";
import type { SyncResult } from "@/lib/sync";

export function BatchSyncButton({
  apps,
  onSync,
}: {
  apps: ConnectedApp[];
  onSync: (id: string, name: string) => Promise<SyncResult | null>;
}) {
  const [running, setRunning] = useState(false);
  const [progress, setProgress] = useState(0);

  const handleSyncAll = async () => {
    if (running || apps.length === 0) return;
    setRunning(true);
    setProgress(0);
    let successes = 0;
    for (let i = 0; i < apps.length; i++) {
      const app = apps[i]!;
      const result = await onSync(app.id, app.name);
      if (result?.success) successes++;
      setProgress(((i + 1) / apps.length) * 100);
    }
    setRunning(false);
    const { toast } = await import("sonner");
    toast.success(`Synced ${successes}/${apps.length} apps`);
  };

  return (
    <button
      type="button"
      onClick={handleSyncAll}
      disabled={running || apps.length === 0}
      aria-label="Sync all connected apps"
      className="relative flex items-center gap-2 overflow-hidden rounded-full border border-vault-border bg-vault-panel px-4 py-2 text-sm text-vault-muted transition hover:border-vault-teal/40 hover:text-vault-teal disabled:opacity-50"
    >
      {running ? <Spinner /> : <RefreshCw size={15} />}
      {running ? `Syncing… ${Math.round(progress)}%` : "Sync all"}
      {running && (
        <span
          className="absolute bottom-0 left-0 h-0.5 bg-vault-teal transition-all duration-300"
          style={{ width: `${progress}%` }}
        />
      )}
    </button>
  );
}
