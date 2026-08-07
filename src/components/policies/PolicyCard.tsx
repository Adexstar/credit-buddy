import { Bell, Ban, Moon, Pencil, RefreshCw, Trash2, FlaskConical, GripVertical } from "lucide-react";
import { POLICY_TYPES, actionLabel, scopeLabel, triggerLabel, type Policy, type PolicyType } from "@/lib/policies";
import { TONE } from "./ui";

const ICONS: Record<PolicyType, typeof Bell> = {
  "auto-convert": RefreshCw,
  "off-peak": Moon,
  alert: Bell,
  ceiling: Ban,
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
      className={`vault-raised p-4 transition ${dragging ? "opacity-50" : ""}`}
    >
      <div className="flex items-start gap-3">
        <PolicyTypeIcon type={policy.type} />
        <div className="min-w-0 flex-1">
          <h3 className="truncate font-display text-base font-semibold text-vault-foreground">{policy.name}</h3>
          <p className="mt-1 text-sm leading-relaxed text-vault-muted">{typeMeta?.blurb}</p>
        </div>
        <div className="flex items-center gap-2">
          <span
            className={`rounded-full px-2.5 py-1 text-xs ${
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

      <dl className="mt-4 flex flex-wrap gap-x-8 gap-y-2 text-xs">
        <div>
          <dt className="text-vault-faint">Scope</dt>
          <dd className="mt-0.5 text-vault-foreground">{scopeLabel(policy.scope)}</dd>
        </div>
        <div>
          <dt className="text-vault-faint">Trigger</dt>
          <dd className="vault-mono mt-0.5 text-vault-foreground">{triggerLabel(policy)}</dd>
        </div>
        <div>
          <dt className="text-vault-faint">Action</dt>
          <dd className="mt-0.5 text-vault-foreground">{actionLabel(policy)}</dd>
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
