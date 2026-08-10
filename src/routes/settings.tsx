import { useEffect, useState } from "react";
import { createFileRoute } from "@tanstack/react-router";
import { Loader2, Settings as SettingsIcon } from "lucide-react";
import { AppShell, DemoDataPill } from "@/components/layout/AppShell";
import { SettingsProvider, useSettingsContext, type SettingsTab } from "@/context/SettingsContext";
import { SETTINGS_TABS, SettingsSidebar } from "@/components/settings/SettingsSidebar";
import { ProfileSection } from "@/components/settings/ProfileSection";
import { NotificationsSection } from "@/components/settings/NotificationsSection";
import { BillingSection } from "@/components/settings/BillingSection";
import { TeamSection } from "@/components/settings/TeamSection";
import { ApiKeysSection } from "@/components/settings/ApiKeysSection";
import { ExportSection } from "@/components/settings/ExportSection";
import { DangerSection } from "@/components/settings/DangerSection";

export const Route = createFileRoute("/settings")({
  component: SettingsRoute,
  head: () => ({
    meta: [
      { title: "Settings — AI Credit Bank" },
      {
        name: "description",
        content:
          "Manage your profile, notifications, billing, team, API keys and data exports for the AI Credit Bank dashboard.",
      },
      { property: "og:title", content: "Settings — AI Credit Bank" },
      { property: "og:description", content: "Profile, billing, team and API configuration in one place." },
      { property: "og:type", content: "website" },
      { name: "twitter:card", content: "summary_large_image" },
    ],
  }),
});

function SettingsRoute() {
  return (
    <SettingsProvider>
      <SettingsPage />
    </SettingsProvider>
  );
}

function SettingsPage() {
  const { loading, activeTab, setActiveTab } = useSettingsContext();
  const [inviteOpen, setInviteOpen] = useState(false);
  const [generateOpen, setGenerateOpen] = useState(false);

  // Keyboard shortcuts: ⌘N new key, ⌘I invite member, ⌘S save hint, Tab cycles sections.
  useEffect(() => {
    const onKey = (event: KeyboardEvent) => {
      const meta = event.metaKey || event.ctrlKey;
      if (!meta) return;
      const key = event.key.toLowerCase();
      if (key === "n") {
        event.preventDefault();
        setActiveTab("api");
        setGenerateOpen(true);
      } else if (key === "i") {
        event.preventDefault();
        setActiveTab("team");
        setInviteOpen(true);
      } else if (key === "s") {
        event.preventDefault();
        const button = document.querySelector<HTMLButtonElement>("[data-settings-save]");
        button?.click();
      } else if (event.shiftKey && key === "arrowdown") {
        event.preventDefault();
      }
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [setActiveTab]);

  const tab = SETTINGS_TABS.find((t) => t.id === activeTab);

  return (
    <AppShell
      title="Settings"
      subtitle={`${tab?.label ?? "Profile"} · ⌘N new API key · ⌘I invite member`}
      actions={<DemoDataPill />}
    >
      <div className="flex flex-col gap-6 md:flex-row">
        <SettingsSidebar activeTab={activeTab} onTabChange={(id: SettingsTab) => setActiveTab(id)} />

        <section className="vault-panel min-w-0 flex-1 p-5 sm:p-6">
          {loading ? (
            <div className="flex min-h-72 items-center justify-center gap-3 text-vault-muted">
              <Loader2 size={18} className="animate-spin" />
              Loading settings…
            </div>
          ) : (
            <>
              {activeTab === "profile" && <ProfileSection />}
              {activeTab === "notifications" && <NotificationsSection />}
              {activeTab === "billing" && <BillingSection />}
              {activeTab === "team" && <TeamSection inviteOpen={inviteOpen} setInviteOpen={setInviteOpen} />}
              {activeTab === "api" && (
                <ApiKeysSection generateOpen={generateOpen} setGenerateOpen={setGenerateOpen} />
              )}
              {activeTab === "export" && <ExportSection />}
              {activeTab === "danger" && <DangerSection />}
            </>
          )}
        </section>
      </div>

      <p className="flex items-center gap-2 text-xs text-vault-faint">
        <SettingsIcon size={13} />
        Settings are stored locally in this demo and switch to your API when VITE_API_URL is set.
      </p>
    </AppShell>
  );
}
