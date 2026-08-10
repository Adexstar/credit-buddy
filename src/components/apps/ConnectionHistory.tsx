import { useEffect, useState } from "react";
import { Loader2 } from "lucide-react";
import { appsApi, type ConnectionEvent, type ManagedApp } from "@/lib/apps";

const ICON: Record<ConnectionEvent["type"], string> = {
  connected: "🔌",
  sync: "🔄",
  key_rotated: "🔑",
  error: "❌",
  settings: "📝",
  disconnected: "🔴",
};

export function ConnectionHistory({ app }: { app: ManagedApp }) {
  const [history, setHistory] = useState<ConnectionEvent[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    let alive = true;
    setLoading(true);
    void appsApi.getHistory(app.id, app).then((data) => {
      if (alive) {
        setHistory(data);
        setLoading(false);
      }
    });
    return () => {
      alive = false;
    };
  }, [app]);

  if (loading) {
    return (
      <div className="flex justify-center py-6">
        <Loader2 size={20} className="animate-spin text-vault-teal" />
      </div>
    );
  }

  if (history.length === 0) return <p className="text-sm text-vault-faint">No connection events yet.</p>;

  return (
    <div className="space-y-2">
      {history.map((entry) => (
        <div key={entry.id} className="flex items-center gap-3 rounded-xl bg-vault-bg/60 p-3">
          <span className="text-lg">{ICON[entry.type]}</span>
          <div className="min-w-0 flex-1">
            <p className="truncate text-sm text-vault-foreground">{entry.message}</p>
            <p className="text-xs text-vault-faint">{new Date(entry.timestamp).toLocaleString()}</p>
          </div>
          {typeof entry.balance === "number" && (
            <span className="shrink-0 font-mono text-xs text-vault-teal">{entry.balance.toFixed(2)} cr</span>
          )}
        </div>
      ))}
    </div>
  );
}
