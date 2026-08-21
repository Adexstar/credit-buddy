import { useEffect, useRef, useState } from "react";
import { createFileRoute } from "@tanstack/react-router";
import { Loader2, Plus } from "lucide-react";
import { AppShell, DemoDataPill } from "@/components/layout/AppShell";
import { Panel } from "@/components/dashboard/primitives";
import { PolicyProvider, usePolicies } from "@/context/PolicyContext";
import { PolicyCard } from "@/components/policies/PolicyCard";
import { PolicyEmptyState, PolicyFilters } from "@/components/policies/PolicyFilters";
import { PolicyWizard } from "@/components/policies/PolicyWizard";
import { PolicyDeleteConfirm, PolicySimulator } from "@/components/policies/PolicySimulator";
import { PrimaryButton } from "@/components/policies/ui";
import type { Policy } from "@/lib/policies";
import { TierBadge, UpgradePrompt } from "@/components/common/UpgradePrompt";
import { limitLabel, tierName } from "@/lib/tiers";
import { routingRules } from "@/lib/mock-data";

export const Route = createFileRoute("/policies")({
  component: PoliciesRoute,
  head: () => ({
    meta: [
      { title: "Automation policies — Credit Bank" },
      {
        name: "description",
        content: "Create, edit and test rules that alert, route and cap AI credit spend before it expires.",
      },
      { property: "og:title", content: "Automation policies — Credit Bank" },
      { property: "og:description", content: "Rules that protect credits before they expire." },
      { property: "og:type", content: "website" },
      { name: "twitter:card", content: "summary_large_image" },
    ],
  }),
});

function PoliciesRoute() {
  return (
    <PolicyProvider>
      <PoliciesPage />
    </PolicyProvider>
  );
}

function PoliciesPage() {
  const {
    policies,
    filtered,
    loading,
    searchQuery,
    setSearchQuery,
    filterType,
    setFilterType,
    selectedPolicy,
    isEditorOpen,
    openEditor,
    closeEditor,
    pendingDelete,
    requestDelete,
    createPolicy,
    updatePolicy,
    deletePolicy,
    togglePolicy,
    reorderPolicies,
    tier,
    activeCount,
    policyLimit,
    atLimit,
  } = usePolicies();

  const [simulating, setSimulating] = useState<Policy | null>(null);
  const [dragId, setDragId] = useState<string | null>(null);
  const [overId, setOverId] = useState<string | null>(null);
  const searchRef = useRef<HTMLInputElement | null>(null);

  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      const meta = e.metaKey || e.ctrlKey;
      if (meta && e.key.toLowerCase() === "n") {
        e.preventDefault();
        openEditor(null);
      }
      if (meta && e.key.toLowerCase() === "f") {
        e.preventDefault();
        searchRef.current?.focus();
      }
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [openEditor]);

  const drop = () => {
    if (!dragId || !overId || dragId === overId) {
      setDragId(null);
      setOverId(null);
      return;
    }
    const order = policies.map((p) => p.id);
    const from = order.indexOf(dragId);
    const to = order.indexOf(overId);
    order.splice(to, 0, ...order.splice(from, 1));
    void reorderPolicies(order);
    setDragId(null);
    setOverId(null);
  };

  return (
    <AppShell
      title="Automation policies"
      subtitle="Rules that protect credits before they expire"
      actions={
        <>
          <DemoDataPill />
          <TierBadge tier={tier} />
          <PrimaryButton onClick={() => openEditor(null)}>
            <Plus size={16} /> Add new policy
          </PrimaryButton>
        </>
      }
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
                {activeCount} of {limitLabel(policyLimit)} active · {tierName(tier)}
              </span>
            }
          >
            <div className="space-y-5">
              <div className="space-y-2">
                <div className="flex items-center justify-between text-xs text-vault-muted">
                  <span>Active policies</span>
                  <span className="vault-mono">
                    {activeCount} / {limitLabel(policyLimit)}
                  </span>
                </div>
                <div className="h-2 overflow-hidden rounded-full border border-vault-border bg-vault-bg">
                  <div
                    className={`h-full rounded-full transition-all ${atLimit ? "bg-vault-amber" : "bg-vault-teal"}`}
                    style={{ width: `${Math.min(100, (activeCount / Math.max(1, policyLimit)) * 100)}%` }}
                  />
                </div>
              </div>

              {atLimit && (
                <UpgradePrompt
                  requiredTier={tier === "free" ? "premium" : "pro"}
                  reason={`You have used all ${limitLabel(policyLimit)} active policies on ${tierName(tier)}.`}
                  compact
                />
              )}

              <PolicyFilters
                searchQuery={searchQuery}
                onSearch={setSearchQuery}
                filterType={filterType}
                onFilter={setFilterType}
                searchRef={searchRef}
              />

              {filtered.length === 0 ? (
                <PolicyEmptyState
                  onCreate={() => openEditor(null)}
                  filtered={policies.length > 0}
                />
              ) : (
                <div className="grid min-w-0 gap-4 lg:grid-cols-2 [&>*]:min-w-0">
                  {filtered.map((policy) => (
                    <PolicyCard
                      key={policy.id}
                      policy={policy}
                      dragging={dragId === policy.id}
                      onEdit={() => openEditor(policy)}
                      onDelete={() => requestDelete(policy)}
                      onToggle={() => void togglePolicy(policy.id)}
                      onTest={() => setSimulating(policy)}
                      onDragStart={() => setDragId(policy.id)}
                      onDragOver={() => setOverId(policy.id)}
                      onDrop={drop}
                    />
                  ))}
                </div>
              )}
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

      {isEditorOpen && (
        <PolicyWizard
          policy={selectedPolicy}
          onClose={closeEditor}
          onSave={async (draft) => {
            if (selectedPolicy) await updatePolicy(selectedPolicy.id, draft);
            else await createPolicy(draft);
          }}
          onTest={(draft) => setSimulating(draft)}
          tier={tier}
          policies={policies}
        />
      )}

      {simulating && (
        <PolicySimulator policy={simulating} tier={tier} onClose={() => setSimulating(null)} />
      )}

      {pendingDelete && (
        <PolicyDeleteConfirm
          policy={pendingDelete}
          onCancel={() => requestDelete(null)}
          onConfirm={async () => {
            await deletePolicy(pendingDelete.id);
            requestDelete(null);
          }}
        />
      )}
    </AppShell>
  );
}
