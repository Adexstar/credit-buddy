import { useCallback } from "react";
import { useSettingsContext } from "@/context/SettingsContext";
import { settingsApi, type NotificationPrefs, type Profile } from "@/lib/settings";

/** Profile, notification and billing operations wired to the settings API. */
export function useSettings() {
  const ctx = useSettingsContext();
  const { run, setProfile, setNotifications, setBilling, setExports } = ctx;

  const saveProfile = useCallback(
    async (patch: Partial<Profile>) => {
      const next = await run(() => settingsApi.updateProfile(patch), "✅ Profile updated successfully");
      if (next) setProfile(next);
      return Boolean(next);
    },
    [run, setProfile],
  );

  const uploadAvatar = useCallback(
    async (dataUrl: string) => {
      const next = await run(() => settingsApi.uploadAvatar(dataUrl), "🖼️ Avatar uploaded successfully");
      if (next) setProfile(next);
    },
    [run, setProfile],
  );

  const changePassword = useCallback(
    async (current: string, next: string) => {
      const ok = await run(() => settingsApi.changePassword(current, next), "🔑 Password changed successfully");
      return Boolean(ok);
    },
    [run],
  );

  const saveNotifications = useCallback(
    async (prefs: NotificationPrefs) => {
      const next = await run(() => settingsApi.updateNotifications(prefs), "✅ Notification preferences saved");
      if (next) setNotifications(next);
    },
    [run, setNotifications],
  );

  const verifyPhone = useCallback(async () => {
    const next = await run(() => settingsApi.verifyPhone(), "✅ Phone verified");
    if (next) setNotifications(next);
  }, [run, setNotifications]);

  const changePlan = useCallback(
    async (plan: "free" | "premium") => {
      const next = await run(() => settingsApi.changePlan(plan), "⭐ Plan updated successfully");
      if (next) {
        setBilling(next);
        setProfile({ ...(ctx.profile as Profile), plan });
      }
    },
    [run, setBilling, setProfile, ctx.profile],
  );

  const cancelSubscription = useCallback(async () => {
    const next = await run(() => settingsApi.cancelSubscription(), "↩️ Subscription cancelled");
    if (next) setBilling(next);
  }, [run, setBilling]);

  const addPaymentMethod = useCallback(
    async (input: { type: string; last4: string; expiry: string }) => {
      const next = await run(() => settingsApi.addPaymentMethod(input), "💳 Payment method added");
      if (next) setBilling(next);
    },
    [run, setBilling],
  );

  const removePaymentMethod = useCallback(
    async (id: string) => {
      const next = await run(() => settingsApi.removePaymentMethod(id), "💳 Payment method removed");
      if (next) setBilling(next);
    },
    [run, setBilling],
  );

  const createExport = useCallback(
    async (config: { dataType: string; format: string }) => {
      const next = await run(() => settingsApi.createExport(config), "📊 Export is ready for download");
      if (next) setExports(next);
    },
    [run, setExports],
  );

  const clearExports = useCallback(async () => {
    const next = await run(() => settingsApi.clearExports(), "🗑️ Export history cleared");
    if (next) setExports(next);
  }, [run, setExports]);

  return {
    ...ctx,
    saveProfile,
    uploadAvatar,
    changePassword,
    saveNotifications,
    verifyPhone,
    changePlan,
    cancelSubscription,
    addPaymentMethod,
    removePaymentMethod,
    createExport,
    clearExports,
  };
}
