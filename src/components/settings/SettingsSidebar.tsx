import type { ReactNode } from "react";
import { AlertTriangle, Bell, CreditCard, KeyRound, Share2, User, Users } from "lucide-react";
import type { SettingsTab } from "@/context/SettingsContext";

export const SETTINGS_TABS: { id: SettingsTab; label: string; icon: typeof User; danger?: boolean }[] = [
  { id: "profile", label: "Profile", icon: User },
  { id: "notifications", label: "Notifications", icon: Bell },
  { id: "billing", label: "Billing", icon: CreditCard },
  { id: "team", label: "Team", icon: Users },
  { id: "api", label: "API Keys", icon: KeyRound },
  { id: "export", label: "Export", icon: Share2 },
  { id: "danger", label: "Danger Zone", icon: AlertTriangle, danger: true },
];

export function SettingsSidebar({
  activeTab,
  onTabChange,
}: {
  activeTab: SettingsTab;
  onTabChange: (tab: SettingsTab) => void;
}) {
  return (
    <>
      {/* Desktop / tablet rail */}
      <nav aria-label="Settings sections" className="hidden shrink-0 md:block md:w-56">
        <div className="vault-panel sticky top-28 space-y-1 p-2">
          {SETTINGS_TABS.map(({ id, label, icon: Icon, danger }) => {
            const active = activeTab === id;
            return (
              <button
                key={id}
                type="button"
                aria-current={active ? "page" : undefined}
                onClick={() => onTabChange(id)}
                className={`flex w-full items-center gap-3 rounded-xl px-3 py-2.5 text-sm transition ${
                  active
                    ? danger
                      ? "bg-vault-danger/10 font-medium text-vault-danger"
                      : "bg-vault-teal/10 font-medium text-vault-teal"
                    : danger
                      ? "text-vault-danger/70 hover:bg-vault-raised hover:text-vault-danger"
                      : "text-vault-muted hover:bg-vault-raised hover:text-vault-foreground"
                }`}
              >
                <Icon size={16} className="shrink-0" />
                <span className="truncate">{label}</span>
              </button>
            );
          })}
        </div>
      </nav>

      {/* Mobile scroll tabs */}
      <nav aria-label="Settings sections" className="-mx-1 flex gap-2 overflow-x-auto px-1 pb-1 md:hidden">
        {SETTINGS_TABS.map(({ id, label, icon: Icon, danger }) => {
          const active = activeTab === id;
          return (
            <button
              key={id}
              type="button"
              onClick={() => onTabChange(id)}
              className={`flex shrink-0 items-center gap-2 rounded-full border px-3 py-2 text-xs transition ${
                active
                  ? danger
                    ? "border-vault-danger/40 bg-vault-danger/10 text-vault-danger"
                    : "border-vault-teal/40 bg-vault-teal/10 text-vault-teal"
                  : "border-vault-border bg-vault-panel text-vault-muted"
              }`}
            >
              <Icon size={14} />
              {label}
            </button>
          );
        })}
      </nav>
    </>
  );
}

export function SectionHeader({
  icon,
  title,
  description,
}: {
  icon: ReactNode;
  title: string;
  description?: string;
}) {
  return (
    <div className="flex items-start gap-3">
      <div className="flex size-10 shrink-0 items-center justify-center rounded-xl border border-vault-border bg-vault-raised text-vault-teal">
        {icon}
      </div>
      <div>
        <h2 className="font-display text-xl font-semibold text-vault-foreground">{title}</h2>
        {description && <p className="mt-1 text-sm text-vault-muted">{description}</p>}
      </div>
    </div>
  );
}

export function SubHeading({ children }: { children: ReactNode }) {
  return (
    <div className="flex items-center gap-3">
      <span className="text-xs font-semibold tracking-widest text-vault-faint uppercase">{children}</span>
      <span className="h-px flex-1 bg-vault-border" />
    </div>
  );
}

export function Toggle({
  checked,
  onChange,
  label,
  hint,
}: {
  checked: boolean;
  onChange: (next: boolean) => void;
  label: string;
  hint?: string;
}) {
  return (
    <button
      type="button"
      role="switch"
      aria-checked={checked}
      onClick={() => onChange(!checked)}
      className="flex w-full items-start justify-between gap-4 rounded-xl px-3 py-2.5 text-left transition hover:bg-vault-raised"
    >
      <span>
        <span className="block text-sm text-vault-foreground">{label}</span>
        {hint && <span className="mt-0.5 block text-xs text-vault-faint">{hint}</span>}
      </span>
      <span
        className={`mt-0.5 flex h-5 w-9 shrink-0 items-center rounded-full border transition ${
          checked ? "border-vault-teal/50 bg-vault-teal/30" : "border-vault-border bg-vault-bg"
        }`}
      >
        <span
          className={`size-3.5 rounded-full transition-transform ${
            checked ? "translate-x-[1.15rem] bg-vault-teal" : "translate-x-0.5 bg-vault-faint"
          }`}
        />
      </span>
    </button>
  );
}
