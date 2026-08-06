import { useEffect, useState } from "react";
import { createFileRoute } from "@tanstack/react-router";
import { toast } from "sonner";
import { Loader2 } from "lucide-react";
import { AppShell, DemoDataPill } from "@/components/layout/AppShell";
import { Panel } from "@/components/dashboard/primitives";
import { api, type Policy } from "@/lib/api";
import { routingRules } from "@/lib/mock-data";

export const Route = createFileRoute("/policies")({
  component: PoliciesPage,
  head: () => ({
    meta: [
      { title: "Automation policies — Credit Bank" },
      {
        name: "description",
        content: "Rules that convert, route and protect AI credits before they expire or blow a spend ceiling.",
      },
      { property: "og:title", content: "Automation policies — Credit Bank" },
      { property: "og:description", content: "Rules that protect credits before they expire." },
    ],
  }),
});

function PoliciesPage() {
  const [policies, setPolicies] = useState<Policy[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    void api.getPolicies().then((p) => {
      setPolicies(p);
      setLoading(false);
    });
  }, []);

  const toggle = async (policy: Policy) => {
    const next = !policy.active;
    setPolicies((prev) => prev.map((p) => (p.id === policy.id ? { ...p, active: next } : p)));
    await api.togglePolicy(policy.id, next);
    toast.success(`${policy.name} ${next ? "enabled" : "disabled"}`);
  };

  const activeCount = policies.filter((p) => p.active).length;

  return (
    <AppShell
      title="Automation policies"
      subtitle="Rules that protect credits before they expire"
      actions={<DemoDataPill />}
    >
      {loading ? (
        <div className="flex h-64 items-center justify-center">
          <Loader2 size={28} className="animate-spin text-vault-teal" />
        </div>
      ) : (
        <>
          <Panel
            title="Rules"
            action={
              <span className="vault-mono text-xs text-vault-faint">
                {activeCount} of {policies.length} active
              </span>
            }
          >
            <div className="grid gap-4 lg:grid-cols-2">
              {policies.map((policy) => (
                <div key={policy.id} className="vault-raised p-4">
                  <div className="flex items-start justify-between gap-3">
                    <h3 className="font-display text-base font-semibold text-vault-foreground">{policy.name}</h3>
                    <button
                      type="button"
                      role="switch"
                      aria-checked={policy.active}
                      aria-label={`Toggle ${policy.name}`}
                      onClick={() => toggle(policy)}
                      className={`relative h-6 w-11 shrink-0 rounded-full transition ${
                        policy.active ? "bg-vault-teal" : "bg-vault-panel border border-vault-border"
                      }`}
                    >
                      <span
                        className={`absolute top-1/2 size-4.5 -translate-y-1/2 rounded-full bg-vault-foreground transition-all ${
                          policy.active ? "left-[1.4rem]" : "left-1"
                        }`}
                      />
                    </button>
                  </div>
                  <p className="mt-2 text-sm leading-relaxed text-vault-muted">{policy.description}</p>
                  <dl className="mt-4 flex flex-wrap gap-x-8 gap-y-2 text-xs">
                    <div>
                      <dt className="text-vault-faint">Scope</dt>
                      <dd className="mt-0.5 text-vault-foreground">{policy.scope}</dd>
                    </div>
                    <div>
                      <dt className="text-vault-faint">Trigger</dt>
                      <dd className="vault-mono mt-0.5 text-vault-foreground">{policy.trigger}</dd>
                    </div>
                  </dl>
                </div>
              ))}
            </div>
          </Panel>

          <Panel title="How routing decides">
            <ol className="space-y-3">
              {routingRules.map((rule, i) => (
                <li key={rule} className="flex gap-3 text-sm text-vault-muted">
                  <span className="vault-mono text-xs text-vault-teal">{String(i + 1).padStart(2, "0")}</span>
                  {rule}
                </li>
              ))}
            </ol>
          </Panel>
        </>
      )}
    </AppShell>
  );
}
