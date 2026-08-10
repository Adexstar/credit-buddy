import { useEffect, useState } from "react";
import { Loader2, Mail, Plus, RefreshCw, Trash2, Users, X } from "lucide-react";
import { Field, GhostButton, Modal, PrimaryButton, inputClass } from "@/components/policies/ui";
import { SectionHeader, SubHeading, Toggle } from "@/components/settings/SettingsSidebar";
import { useTeamManagement } from "@/hooks/useTeamManagement";
import { ROLE_INFO, type TeamRole } from "@/lib/settings";

const ROLE_STYLE: Record<TeamRole, string> = {
  owner: "border-vault-amber/30 bg-vault-amber/10 text-vault-amber",
  admin: "border-vault-teal/30 bg-vault-teal/10 text-vault-teal",
  member: "border-vault-blue/30 bg-vault-blue/10 text-vault-blue",
  viewer: "border-vault-border bg-vault-raised text-vault-muted",
};

export function InviteMemberModal({
  onClose,
  onInvite,
  busy,
}: {
  onClose: () => void;
  onInvite: (email: string, role: TeamRole) => Promise<boolean>;
  busy?: boolean;
}) {
  const [email, setEmail] = useState("");
  const [role, setRole] = useState<TeamRole>("member");
  const valid = /^[^@\s]+@[^@\s]+\.[^@\s]+$/.test(email.trim());

  const submit = async () => {
    if (!valid) return;
    const ok = await onInvite(email.trim(), role);
    if (ok) onClose();
  };

  return (
    <Modal
      title="Invite team member"
      description="They receive an email with a join link that expires in 7 days."
      onClose={onClose}
      width="max-w-lg"
      footer={
        <>
          <GhostButton onClick={onClose}>Cancel</GhostButton>
          <PrimaryButton onClick={submit} disabled={!valid || busy}>
            {busy && <Loader2 size={15} className="animate-spin" />}
            Send invite
          </PrimaryButton>
        </>
      }
    >
      <div className="space-y-4">
        <Field label="Email">
          <input
            className={inputClass}
            type="email"
            autoFocus
            maxLength={255}
            placeholder="newteam@member.com"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            onKeyDown={(e) => e.key === "Enter" && void submit()}
          />
        </Field>
        <Field label="Role">
          <div className="space-y-2">
            {(Object.keys(ROLE_INFO) as TeamRole[]).map((key) => (
              <button
                key={key}
                type="button"
                onClick={() => setRole(key)}
                className={`flex w-full items-start gap-3 rounded-xl border p-3 text-left transition ${
                  role === key
                    ? "border-vault-teal/50 bg-vault-teal/5"
                    : "border-vault-border bg-vault-bg hover:border-vault-teal/30"
                }`}
              >
                <span
                  className={`mt-1 size-3 shrink-0 rounded-full border ${
                    role === key ? "border-vault-teal bg-vault-teal" : "border-vault-border"
                  }`}
                />
                <span>
                  <span className="block text-sm text-vault-foreground">{ROLE_INFO[key].label}</span>
                  <span className="block text-xs text-vault-faint">{ROLE_INFO[key].description}</span>
                </span>
              </button>
            ))}
          </div>
        </Field>
      </div>
    </Modal>
  );
}

export function TeamSection({
  inviteOpen,
  setInviteOpen,
}: {
  inviteOpen: boolean;
  setInviteOpen: (open: boolean) => void;
}) {
  const { team, saving, inviteMember, updateMemberRole, removeMember, resendInvite, cancelInvite, updateTeamSettings } =
    useTeamManagement();
  const [settingsDraft, setSettingsDraft] = useState(team?.settings ?? null);

  useEffect(() => {
    if (team) setSettingsDraft(team.settings);
  }, [team]);

  if (!team || !settingsDraft) return null;
  const dirty = JSON.stringify(settingsDraft) !== JSON.stringify(team.settings);

  return (
    <div className="space-y-6">
      <SectionHeader
        icon={<Users size={18} />}
        title="Team management"
        description="Invite collaborators and control what they can do with shared credits."
      />

      <SubHeading>Team members</SubHeading>
      <ul className="divide-y divide-vault-border rounded-xl border border-vault-border bg-vault-bg/40">
        {team.members.map((member) => (
          <li key={member.id} className="flex flex-wrap items-center gap-3 p-3.5">
            <span className="flex size-9 shrink-0 items-center justify-center rounded-full bg-vault-teal/15 font-display text-sm text-vault-teal">
              {member.name.charAt(0)}
            </span>
            <div className="min-w-0 flex-1">
              <p className="truncate text-sm text-vault-foreground">{member.name}</p>
              <p className="truncate text-xs text-vault-faint">{member.email}</p>
            </div>
            {member.role === "owner" ? (
              <span className={`rounded-full border px-2.5 py-1 text-xs ${ROLE_STYLE.owner}`}>Owner</span>
            ) : (
              <>
                <select
                  aria-label={`Role for ${member.name}`}
                  value={member.role}
                  disabled={saving}
                  onChange={(e) => void updateMemberRole(member.id, e.target.value as TeamRole)}
                  className={`rounded-full border px-2.5 py-1 text-xs ${ROLE_STYLE[member.role]}`}
                >
                  {(Object.keys(ROLE_INFO) as TeamRole[])
                    .filter((r) => r !== "owner")
                    .map((r) => (
                      <option key={r} value={r}>
                        {ROLE_INFO[r].label}
                      </option>
                    ))}
                </select>
                <button
                  type="button"
                  aria-label={`Remove ${member.name}`}
                  onClick={() => void removeMember(member.id)}
                  disabled={saving}
                  className="rounded-lg border border-vault-border p-1.5 text-vault-danger transition hover:bg-vault-danger/10 disabled:opacity-40"
                >
                  <Trash2 size={14} />
                </button>
              </>
            )}
          </li>
        ))}
      </ul>
      <PrimaryButton onClick={() => setInviteOpen(true)}>
        <Plus size={15} />
        Invite member
      </PrimaryButton>

      <SubHeading>Pending invites</SubHeading>
      <ul className="divide-y divide-vault-border rounded-xl border border-vault-border bg-vault-bg/40">
        {team.pending.map((invite) => (
          <li key={invite.id} className="flex flex-wrap items-center gap-3 p-3.5">
            <Mail size={16} className="text-vault-amber" />
            <div className="min-w-0 flex-1">
              <p className="truncate text-sm text-vault-foreground">{invite.email}</p>
              <p className="text-xs text-vault-faint">
                {ROLE_INFO[invite.role].label} · sent {new Date(invite.sent).toLocaleDateString()}
              </p>
            </div>
            <button
              type="button"
              onClick={() => void resendInvite(invite.id)}
              disabled={saving}
              className="inline-flex items-center gap-1.5 rounded-lg border border-vault-border px-2.5 py-1.5 text-xs text-vault-muted transition hover:text-vault-foreground disabled:opacity-40"
            >
              <RefreshCw size={13} />
              Resend
            </button>
            <button
              type="button"
              onClick={() => void cancelInvite(invite.id)}
              disabled={saving}
              className="inline-flex items-center gap-1.5 rounded-lg border border-vault-border px-2.5 py-1.5 text-xs text-vault-danger transition hover:bg-vault-danger/10 disabled:opacity-40"
            >
              <X size={13} />
              Cancel
            </button>
          </li>
        ))}
        {team.pending.length === 0 && <li className="p-4 text-sm text-vault-faint">No pending invites.</li>}
      </ul>

      <SubHeading>Team settings</SubHeading>
      <div className="rounded-xl border border-vault-border bg-vault-bg/40 p-2">
        <Toggle
          label="Members can invite other members"
          checked={settingsDraft.canInvite}
          onChange={(v) => setSettingsDraft({ ...settingsDraft, canInvite: v })}
        />
        <Toggle
          label="Members can see billing info"
          checked={settingsDraft.canSeeBilling}
          onChange={(v) => setSettingsDraft({ ...settingsDraft, canSeeBilling: v })}
        />
        <Toggle
          label="Members can delete credits"
          checked={settingsDraft.canDelete}
          onChange={(v) => setSettingsDraft({ ...settingsDraft, canDelete: v })}
        />
        <Toggle
          label="Auto-approve team credit requests"
          checked={settingsDraft.autoApprove}
          onChange={(v) => setSettingsDraft({ ...settingsDraft, autoApprove: v })}
        />
      </div>
      <PrimaryButton onClick={() => void updateTeamSettings(settingsDraft)} disabled={!dirty || saving}>
        {saving && <Loader2 size={15} className="animate-spin" />}
        Save team settings
      </PrimaryButton>

      {inviteOpen && (
        <InviteMemberModal busy={saving} onClose={() => setInviteOpen(false)} onInvite={inviteMember} />
      )}
    </div>
  );
}
