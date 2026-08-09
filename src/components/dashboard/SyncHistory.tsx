import { useEffect, useState } from "react";
import { Modal } from "@/components/policies/ui";
import { api } from "@/lib/api";
import type { SyncHistoryEntry } from "@/lib/sync";

export function SyncHistoryModal({
  appId,
  appName,
  onClose,
}: {
  appId?: string;
  appName?: string;
  onClose: () => void;
}) {
  const [history, setHistory] = useState<SyncHistoryEntry[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    let live = true;
    setLoading(true);
    api
      .getSyncHistory(appId)
      .then((data) => live && setHistory(data))
      .finally(() => live && setLoading(false));
    return () => {
      live = false;
    };
  }, [appId]);

  return (
    <Modal
      title="Sync history"
      description={appName ? `Recent sync attempts for ${appName}` : "Recent sync attempts across all apps"}
      onClose={onClose}
      width="max-w-xl"
    >
      {loading ? (
        <div className="space-y-2">
          {[1, 2, 3].map((i) => (
            <div key={i} className="h-14 animate-pulse rounded-xl bg-vault-raised" />
          ))}
        </div>
      ) : history.length === 0 ? (
        <p className="py-8 text-center text-sm text-vault-muted">No syncs recorded yet. Run a sync to see it here.</p>
      ) : (
        <ul className="space-y-2">
          {history.map((entry) => (
            <li key={entry.id} className="vault-raised flex items-start justify-between gap-4 p-3">
              <div className="min-w-0">
                <p className="font-display text-sm font-semibold text-vault-foreground">
                  <span className={entry.success ? "text-vault-teal" : "text-vault-danger"}>
                    {entry.success ? "Success" : "Failed"}
                  </span>{" "}
                  · {entry.appName}
                </p>
                <p className="mt-1 text-xs text-vault-muted">{entry.message}</p>
                <p className="vault-mono mt-1 text-xs text-vault-faint">
                  {new Date(entry.timestamp).toLocaleString()}
                </p>
              </div>
              <div className="shrink-0 text-right">
                <p className="vault-mono text-sm text-vault-foreground">{entry.balance.toFixed(2)} cr</p>
                {typeof entry.difference === "number" && entry.difference !== 0 && (
                  <p
                    className={`vault-mono text-xs ${
                      entry.difference > 0 ? "text-vault-teal" : "text-vault-danger"
                    }`}
                  >
                    {entry.difference > 0 ? "+" : ""}
                    {entry.difference.toFixed(2)}
                  </p>
                )}
              </div>
            </li>
          ))}
        </ul>
      )}
    </Modal>
  );
}
