import { useState } from "react";
import { Bell, Loader2, ShieldCheck } from "lucide-react";
import { Field, GhostButton, PrimaryButton, inputClass } from "@/components/policies/ui";
import { SectionHeader, SubHeading, Toggle } from "@/components/settings/SettingsSidebar";
import { useSettings } from "@/hooks/useSettings";
import type { NotificationPrefs } from "@/lib/settings";

const EMAIL_ROWS: { key: keyof NotificationPrefs["email"]; label: string; hint: string }[] = [
  { key: "lowBalance", label: "Low balance alerts", hint: "When a bucket drops below your threshold" },
  { key: "expiryDigest", label: "Expiry digest", hint: "Weekly summary of credits about to expire" },
  { key: "syncUpdates", label: "Sync status updates", hint: "Daily digest of provider syncs" },
  { key: "marketing", label: "Marketing communications", hint: "Offers and partner news" },
  { key: "security", label: "Security alerts", hint: "Key rotations and new sign-ins" },
  { key: "updates", label: "Product updates and newsletters", hint: "What shipped this month" },
];

const PUSH_ROWS: { key: keyof NotificationPrefs["push"]; label: string; hint: string }[] = [
  { key: "expiring", label: "Credit expiring soon (3 days)", hint: "Last chance to spend them with that provider" },
  { key: "policyTriggers", label: "Policy triggered", hint: "When one of your rules fires" },
  { key: "dailySummary", label: "Daily usage summary", hint: "One push at 9am local time" },
  { key: "syncStatus", label: "Sync completed / failed", hint: "Per-provider sync outcome" },
];

export function NotificationsSection() {
  const { notifications, saving, saveNotifications, verifyPhone } = useSettings();
  const [draft, setDraft] = useState<NotificationPrefs | null>(notifications);

  if (!notifications) return null;
  const prefs = draft ?? notifications;
  const dirty = JSON.stringify(prefs) !== JSON.stringify(notifications);

  return (
    <div className="space-y-6">
      <SectionHeader
        icon={<Bell size={18} />}
        title="Notification settings"
        description="Choose how the vault reaches you when credits move or expire."
      />

      <SubHeading>Email notifications</SubHeading>
      <div className="rounded-xl border border-vault-border bg-vault-bg/40 p-2">
        {EMAIL_ROWS.map((row) => (
          <Toggle
            key={row.key}
            label={row.label}
            hint={row.hint}
            checked={prefs.email[row.key]}
            onChange={(next) => setDraft({ ...prefs, email: { ...prefs.email, [row.key]: next } })}
          />
        ))}
      </div>

      <SubHeading>Push notifications</SubHeading>
      <div className="rounded-xl border border-vault-border bg-vault-bg/40 p-2">
        {PUSH_ROWS.map((row) => (
          <Toggle
            key={row.key}
            label={row.label}
            hint={row.hint}
            checked={prefs.push[row.key]}
            onChange={(next) => setDraft({ ...prefs, push: { ...prefs.push, [row.key]: next } })}
          />
        ))}
      </div>

      <SubHeading>SMS notifications</SubHeading>
      <div className="space-y-4 rounded-xl border border-vault-border bg-vault-bg/40 p-4">
        <Toggle
          label="Critical balance alerts"
          hint="Only for balances that will expire within 24 hours"
          checked={prefs.sms.criticalAlerts}
          onChange={(next) => setDraft({ ...prefs, sms: { ...prefs.sms, criticalAlerts: next } })}
        />
        <div className="grid gap-3 sm:grid-cols-[1fr_auto] sm:items-end">
          <Field label="Phone number">
            <input
              className={inputClass}
              value={prefs.sms.phone}
              maxLength={24}
              onChange={(e) => setDraft({ ...prefs, sms: { ...prefs.sms, phone: e.target.value } })}
            />
          </Field>
          {prefs.sms.verified ? (
            <span className="inline-flex items-center gap-2 rounded-xl border border-vault-teal/30 bg-vault-teal/10 px-4 py-2.5 text-sm text-vault-teal">
              <ShieldCheck size={15} />
              Verified
            </span>
          ) : (
            <GhostButton onClick={() => void verifyPhone()} disabled={saving}>
              Verify phone
            </GhostButton>
          )}
        </div>
      </div>

      <div className="flex flex-wrap gap-3">
        <PrimaryButton onClick={() => void saveNotifications(prefs)} disabled={!dirty || saving}>
          {saving && <Loader2 size={15} className="animate-spin" />}
          Save preferences
        </PrimaryButton>
        <GhostButton onClick={() => setDraft(null)} disabled={!dirty}>
          Cancel
        </GhostButton>
      </div>
    </div>
  );
}
