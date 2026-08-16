import {
  Bell,
  Ban,
  Moon,
  Pencil,
  RefreshCw,
  Trash2,
  FlaskConical,
  GripVertical,
  Sparkles,
  Workflow,
  Webhook,
} from "lucide-react";
import { POLICY_TYPES, actionLabel, scopeLabel, triggerLabel, type Policy, type PolicyType } from "@/lib/policies";
import { TierBadge } from "@/components/common/UpgradePrompt";
import { TONE } from "./ui";

const ICONS: Record<PolicyType, typeof Bell> = {
  "auto-convert": RefreshCw,
  "off-peak": Moon,
  alert: Bell,
  ceiling: Ban,
  "smart-convert": Sparkles,
  orchestration: Workflow,
  webhook: Webhook,
};

export function policyTone(type: PolicyType) {
  return POLICY_TYPES.find((t) => t.id === type)?.tone ?? "blue";
}

export function PolicyTypeIcon({ type, size = 18 }: { type: PolicyType; size?: number }) {
  const Icon = ICONS[type];
  const tone = TONE[policyTone(type)]!;
  return (
    <span className={`flex size-9 shrink-0 items-center justify-center rounded-xl border ${tone.bg} ${tone.border} ${tone.text}`}>
      <Icon size={size} />
    </span>
  );
}

export function PolicyCard({
  policy,
  onEdit,
  onDelete,
  onToggle,
  onTest,
  onDragStart,
  onDragOver,
  onDrop,
  dragging,
}: {
  policy: Policy;
  onEdit: () => void;
  onDelete: () => void;
  onToggle: () => void;
  onTest: () => void;
  onDragStart: () => void;
  onDragOver: () => void;
  onDrop: () => void;
  dragging: boolean;
}) {
  const typeMeta = POLICY_TYPES.find((t) => t.id === policy.type);

  return (
    <article
      draggable
      onDragStart={onDragStart}
      onDragOver={(e) => {
        e.preventDefault();
        onDragOver();
      }}
      onDrop={(e) => {
        e.preventDefault();
        onDrop();
      }}
      className={`vault-raised w-full min-w-0 overflow-hidden p-4 transition ${dragging ? "opacity-50" : ""}`}
    >
      <div className="flex min-w-0 items-start gap-3">
        <PolicyTypeIcon type={policy.type} />
        <div className="min-w-0 flex-1">
          <div className="flex min-w-0 flex-wrap items-center gap-2">
            <h3 className="min-w-0 max-w-full break-words font-display text-base font-semibold text-vault-foreground">
              {policy.name}
            </h3>
            {typeMeta && typeMeta.requiredTier !== "free" && <TierBadge tier={typeMeta.requiredTier} />}
          </div>
          <p className="mt-1 break-words text-sm leading-relaxed text-vault-muted">{typeMeta?.blurb}</p>
        </div>
        <div className="flex shrink-0 flex-col items-end gap-2 sm:flex-row sm:items-center">
          <span
            className={`whitespace-nowrap rounded-full px-2.5 py-1 text-xs ${
              policy.isActive
                ? "bg-vault-green/10 text-vault-green"
                : "border border-vault-border text-vault-faint"
            }`}
          >
            {policy.isActive ? "Active" : "Inactive"}
          </span>
          <button
            type="button"
            role="switch"
            aria-checked={policy.isActive}
            aria-label={`Toggle ${policy.name}`}
            onClick={onToggle}
            className={`relative h-6 w-11 shrink-0 rounded-full transition ${
              policy.isActive ? "bg-vault-teal" : "border border-vault-border bg-vault-panel"
            }`}
          >
            <span
              className={`absolute top-1/2 size-4 -translate-y-1/2 rounded-full bg-vault-foreground transition-all ${
                policy.isActive ? "left-[1.55rem]" : "left-1"
              }`}
            />
          </button>
        </div>
      </div>

      <dl className="mt-4 grid grid-cols-2 gap-x-6 gap-y-3 text-xs sm:grid-cols-3">
        <div className="min-w-0">
          <dt className="text-vault-faint">Scope</dt>
          <dd className="mt-0.5 break-words text-vault-foreground">{scopeLabel(policy.scope)}</dd>
        </div>
        <div className="min-w-0">
          <dt className="text-vault-faint">Trigger</dt>
          <dd className="vault-mono mt-0.5 break-words text-vault-foreground">{triggerLabel(policy)}</dd>
        </div>
        <div className="col-span-2 min-w-0 sm:col-span-1">
          <dt className="text-vault-faint">Action</dt>
          <dd className="mt-0.5 break-words text-vault-foreground">{actionLabel(policy)}</dd>
        </div>
      </dl>

      <dl className="mt-3 grid grid-cols-3 gap-x-4 gap-y-2 rounded-xl border border-vault-border bg-vault-bg/40 px-3 py-2 text-xs">
        <div className="min-w-0">
          <dt className="text-vault-faint">Triggers</dt>
          <dd className="vault-mono mt-0.5 text-vault-foreground">{policy.triggerCount ?? 0}</dd>
        </div>
        <div className="min-w-0">
          <dt className="text-vault-faint">Success</dt>
          <dd className="vault-mono mt-0.5 text-vault-green">{Math.round((policy.successRate ?? 1) * 100)}%</dd>
        </div>
        <div className="min-w-0">
          <dt className="text-vault-faint">Last run</dt>
          <dd className="mt-0.5 break-words text-vault-foreground">
            {policy.lastTriggeredAt ? new Date(policy.lastTriggeredAt).toLocaleDateString() : "Never"}
          </dd>
        </div>
      </dl>


      <div className="mt-4 flex items-center gap-2 border-t border-vault-border pt-3">
        <button
          type="button"
          onClick={onEdit}
          className="inline-flex items-center gap-1.5 rounded-lg px-2.5 py-1.5 text-xs text-vault-muted transition hover:bg-vault-panel hover:text-vault-foreground"
        >
          <Pencil size={14} /> Edit
        </button>
        <button
          type="button"
          onClick={onTest}
          className="inline-flex items-center gap-1.5 rounded-lg px-2.5 py-1.5 text-xs text-vault-muted transition hover:bg-vault-panel hover:text-vault-foreground"
        >
          <FlaskConical size={14} /> Test
        </button>
        <button
          type="button"
          onClick={onDelete}
          className="inline-flex items-center gap-1.5 rounded-lg px-2.5 py-1.5 text-xs text-vault-danger transition hover:bg-vault-danger/10"
        >
          <Trash2 size={14} /> Delete
        </button>
        <span
          aria-label="Drag to reorder"
          className="ml-auto cursor-grab rounded-lg p-1.5 text-vault-faint transition hover:text-vault-foreground"
        >
          <GripVertical size={16} />
        </span>
      </div>
    </article>
  );
}
