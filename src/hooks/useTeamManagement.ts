import { useCallback } from "react";
import { useSettingsContext } from "@/context/SettingsContext";
import { settingsApi, type TeamRole, type TeamSettings } from "@/lib/settings";

/** Team member, invite and permission operations. */
export function useTeamManagement() {
  const { team, setTeamState, run, saving } = useSettingsContext();

  const inviteMember = useCallback(
    async (email: string, role: TeamRole) => {
      const next = await run(() => settingsApi.inviteMember(email, role), "📨 Invite sent successfully");
      if (next) setTeamState(next);
      return Boolean(next);
    },
    [run, setTeamState],
  );

  const updateMemberRole = useCallback(
    async (id: string, role: TeamRole) => {
      const next = await run(() => settingsApi.updateMemberRole(id, role), "🔄 Role updated");
      if (next) setTeamState(next);
    },
    [run, setTeamState],
  );

  const removeMember = useCallback(
    async (id: string) => {
      const next = await run(() => settingsApi.removeMember(id), "👤 Member removed");
      if (next) setTeamState(next);
    },
    [run, setTeamState],
  );

  const resendInvite = useCallback(
    async (id: string) => {
      const next = await run(() => settingsApi.resendInvite(id), "📨 Invite resent");
      if (next) setTeamState(next);
    },
    [run, setTeamState],
  );

  const cancelInvite = useCallback(
    async (id: string) => {
      const next = await run(() => settingsApi.cancelInvite(id), "🗑️ Invite cancelled");
      if (next) setTeamState(next);
    },
    [run, setTeamState],
  );

  const updateTeamSettings = useCallback(
    async (settings: TeamSettings) => {
      const next = await run(() => settingsApi.updateTeamSettings(settings), "✅ Team settings saved");
      if (next) setTeamState(next);
    },
    [run, setTeamState],
  );

  return {
    team,
    saving,
    inviteMember,
    updateMemberRole,
    removeMember,
    resendInvite,
    cancelInvite,
    updateTeamSettings,
  };
}
