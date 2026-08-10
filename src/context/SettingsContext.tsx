import { createContext, useCallback, useContext, useEffect, useMemo, useState, type ReactNode } from "react";
import { toast } from "sonner";
import {
  settingsApi,
  type ApiKey,
  type Billing,
  type ExportFile,
  type NotificationPrefs,
  type Profile,
  type Team,
} from "@/lib/settings";

export type SettingsTab =
  | "profile"
  | "notifications"
  | "billing"
  | "team"
  | "api"
  | "export"
  | "danger";

interface SettingsState {
  loading: boolean;
  saving: boolean;
  profile: Profile | null;
  notifications: NotificationPrefs | null;
  billing: Billing | null;
  team: Team | null;
  apiKeys: ApiKey[];
  exports: ExportFile[];
  activeTab: SettingsTab;
  setActiveTab: (tab: SettingsTab) => void;
  setProfile: (p: Profile) => void;
  setNotifications: (n: NotificationPrefs) => void;
  setTeamState: (t: Team) => void;
  setApiKeys: (k: ApiKey[]) => void;
  setBilling: (b: Billing) => void;
  setExports: (e: ExportFile[]) => void;
  run: <T>(fn: () => Promise<T>, successMessage?: string) => Promise<T | null>;
}

const SettingsContext = createContext<SettingsState | null>(null);

export function SettingsProvider({ children }: { children: ReactNode }) {
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [profile, setProfile] = useState<Profile | null>(null);
  const [notifications, setNotifications] = useState<NotificationPrefs | null>(null);
  const [billing, setBilling] = useState<Billing | null>(null);
  const [team, setTeamState] = useState<Team | null>(null);
  const [apiKeys, setApiKeys] = useState<ApiKey[]>([]);
  const [exports, setExports] = useState<ExportFile[]>([]);
  const [activeTab, setActiveTab] = useState<SettingsTab>("profile");

  useEffect(() => {
    let cancelled = false;
    void settingsApi
      .getAll()
      .then((data) => {
        if (cancelled) return;
        setProfile(data.profile);
        setNotifications(data.notifications);
        setBilling(data.billing);
        setTeamState(data.team);
        setApiKeys(data.apiKeys);
        setExports(data.exports);
      })
      .catch(() => toast.error("❌ Something went wrong. Please try again."))
      .finally(() => !cancelled && setLoading(false));
    return () => {
      cancelled = true;
    };
  }, []);

  const run = useCallback(async <T,>(fn: () => Promise<T>, successMessage?: string) => {
    setSaving(true);
    try {
      const result = await fn();
      if (successMessage) toast.success(successMessage);
      return result;
    } catch (error) {
      toast.error(`❌ ${error instanceof Error ? error.message : "Something went wrong. Please try again."}`);
      return null;
    } finally {
      setSaving(false);
    }
  }, []);

  const value = useMemo<SettingsState>(
    () => ({
      loading,
      saving,
      profile,
      notifications,
      billing,
      team,
      apiKeys,
      exports,
      activeTab,
      setActiveTab,
      setProfile,
      setNotifications,
      setTeamState,
      setApiKeys,
      setBilling,
      setExports,
      run,
    }),
    [loading, saving, profile, notifications, billing, team, apiKeys, exports, activeTab, run],
  );

  return <SettingsContext.Provider value={value}>{children}</SettingsContext.Provider>;
}

export function useSettingsContext() {
  const ctx = useContext(SettingsContext);
  if (!ctx) throw new Error("useSettingsContext must be used inside SettingsProvider");
  return ctx;
}
