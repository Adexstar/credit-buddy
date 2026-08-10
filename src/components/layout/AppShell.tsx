import { useState, type ReactNode } from "react";
import { Link, useRouterState } from "@tanstack/react-router";
import {
  Bell,
  CreditCard,
  LayoutGrid,
  Link2,
  PanelLeftClose,
  PanelLeftOpen,
  Search,
  LogOut,
  Settings,
  ShieldCheck,
  Target,
  Vault,
  Wifi,
  WifiOff,
} from "lucide-react";
import { useAuth } from "@/hooks/useAuth";
import { useWebSocket } from "@/hooks/useWebSocket";
import { RequireAuth } from "@/components/auth/RequireAuth";
import { useSearchContext } from "@/context/SearchContext";
import { useShortcuts } from "@/context/ShortcutsContext";
import { KeyboardShortcutsHelp } from "@/components/common/KeyboardShortcutsHelp";


const NAV = [
  { to: "/", label: "Dashboard", icon: LayoutGrid },
  { to: "/apps", label: "Connected Apps", icon: Link2 },
  { to: "/credits", label: "Credits", icon: CreditCard },
  { to: "/policies", label: "Policies", icon: ShieldCheck },
  { to: "/settings", label: "Settings", icon: Settings },
] as const;

interface AppShellProps {
  title: string;
  subtitle: string;
  actions?: ReactNode;
  children: ReactNode;
}

export function AppShell(props: AppShellProps) {
  return (
    <RequireAuth>
      <AppShellInner {...props} />
    </RequireAuth>
  );
}

function AppShellInner({ title, subtitle, actions, children }: AppShellProps) {
  const [collapsed, setCollapsed] = useState(false);
  const { user, logout, demoMode } = useAuth();
  const { isConnected, configured: realtimeConfigured } = useWebSocket();
  const pathname = useRouterState({ select: (s) => s.location.pathname });
  const { openSearch } = useSearchContext();
  const { startTour } = useShortcuts();


  return (
    <div className="min-h-screen bg-vault-bg">
      <aside
        className={`fixed inset-y-0 left-0 z-40 hidden flex-col border-r border-vault-border bg-vault-panel transition-all duration-300 lg:flex ${
          collapsed ? "w-20" : "w-64"
        }`}
      >
        <div className="flex items-center gap-3 px-4 py-4">
          <div className="flex size-10 shrink-0 items-center justify-center rounded-xl border border-vault-teal/30 bg-vault-teal/10 text-vault-teal">
            <Vault size={20} />
          </div>
          {!collapsed && (
            <div className="min-w-0 flex-1">
              <p className="font-display text-sm font-semibold text-vault-foreground">Credit Bank</p>
              <p className="truncate text-xs text-vault-faint">Unified AI credits</p>
            </div>
          )}
          <button
            type="button"
            aria-label={collapsed ? "Expand sidebar" : "Collapse sidebar"}
            onClick={() => setCollapsed((v) => !v)}
            className="rounded-lg p-1.5 text-vault-faint transition hover:bg-vault-raised hover:text-vault-foreground"
          >
            {collapsed ? <PanelLeftOpen size={18} /> : <PanelLeftClose size={18} />}
          </button>
        </div>

        <nav className="flex flex-1 flex-col gap-1 px-3 py-4">
          {NAV.map(({ to, label, icon: Icon }) => {
            const active = pathname === to;
            return (
              <Link
                key={to}
                to={to}
                title={label}
                className={`flex items-center gap-3 rounded-xl px-3 py-2.5 text-sm transition ${
                  active
                    ? "bg-vault-teal/10 font-medium text-vault-teal"
                    : "text-vault-muted hover:bg-vault-raised hover:text-vault-foreground"
                }`}
              >
                <Icon size={18} className="shrink-0" />
                {!collapsed && <span className="truncate">{label}</span>}
              </Link>
            );
          })}
        </nav>

        <div className="border-t border-vault-border p-3">
          <div className="flex items-center gap-3 rounded-xl px-2 py-2">
            <div className="flex size-9 shrink-0 items-center justify-center rounded-full bg-vault-teal/15 font-display text-sm text-vault-teal">
              {(user?.name ?? "?").charAt(0)}
            </div>
            {!collapsed && (
              <div className="min-w-0 flex-1">
                <p className="truncate text-sm font-medium text-vault-foreground">{user?.name}</p>
                <p className="truncate text-xs text-vault-faint">{user?.email}</p>
              </div>
            )}
            <button
              type="button"
              onClick={() => void logout()}
              title="Sign out"
              aria-label="Sign out"
              className="rounded-lg p-1.5 text-vault-faint transition hover:bg-vault-raised hover:text-vault-danger"
            >
              <LogOut size={16} />
            </button>
          </div>
        </div>
      </aside>

      <div className={`transition-all duration-300 ${collapsed ? "lg:ml-20" : "lg:ml-64"}`}>
        <header className="sticky top-0 z-30 border-b border-vault-border bg-vault-bg/90 px-4 py-4 backdrop-blur sm:px-8">
          <div className="flex flex-wrap items-center justify-between gap-4">
            <div>
              <h1 className="font-display text-2xl font-bold text-vault-foreground sm:text-3xl">{title}</h1>
              <p className="mt-1 text-sm text-vault-muted">{subtitle}</p>
            </div>
            <div className="flex flex-wrap items-center gap-3">
              {actions}
              <button
                type="button"
                onClick={openSearch}
                className="flex items-center gap-2 rounded-full border border-vault-border bg-vault-panel px-3 py-2 text-sm text-vault-muted transition hover:text-vault-foreground"
              >
                <Search size={15} />
                <span className="hidden sm:inline">Search…</span>
                <kbd className="rounded border border-vault-border bg-vault-raised px-1.5 py-0.5 text-xs">⌘K</kbd>
              </button>
              {realtimeConfigured && (
                <span
                  title={isConnected ? "Realtime updates connected" : "Realtime updates offline"}
                  className={`inline-flex items-center gap-1.5 rounded-full border px-3 py-2 text-xs ${
                    isConnected
                      ? "border-vault-green/35 bg-vault-green/10 text-vault-green"
                      : "border-vault-border bg-vault-panel text-vault-faint"
                  }`}
                >
                  {isConnected ? <Wifi size={14} /> : <WifiOff size={14} />}
                  <span className="hidden sm:inline">{isConnected ? "Live" : "Offline"}</span>
                </span>
              )}
              {demoMode && (
                <span className="rounded-full border border-vault-amber/35 bg-vault-amber/10 px-3 py-2 text-xs text-vault-amber">
                  Demo mode
                </span>
              )}
              <KeyboardShortcutsHelp />
              <button
                type="button"
                onClick={startTour}
                title="Take the product tour"
                className="inline-flex items-center gap-2 rounded-full border border-vault-border bg-vault-panel px-3 py-2 text-sm text-vault-muted transition hover:text-vault-foreground"
              >
                <Target size={15} />
                <span className="hidden sm:inline">Take tour</span>
              </button>
              <button
                type="button"
                aria-label="Notifications"
                className="relative rounded-full border border-vault-border bg-vault-panel p-2.5 text-vault-muted transition hover:text-vault-foreground"
              >
                <Bell size={18} />
                <span className="absolute right-1.5 top-1.5 size-2 rounded-full bg-vault-teal" />
              </button>

            </div>
          </div>
        </header>

        <nav className="flex gap-2 overflow-x-auto border-b border-vault-border px-4 py-3 lg:hidden">
          {NAV.map(({ to, label, icon: Icon }) => (
            <Link
              key={to}
              to={to}
              className={`flex shrink-0 items-center gap-2 rounded-full px-3 py-1.5 text-xs transition ${
                pathname === to ? "bg-vault-teal/10 text-vault-teal" : "text-vault-muted"
              }`}
            >
              <Icon size={14} />
              {label}
            </Link>
          ))}
        </nav>

        <main className="vault-grid min-h-[calc(100vh-5.5rem)] px-4 py-8 sm:px-8">
          <div className="mx-auto max-w-6xl space-y-8">{children}</div>
        </main>
      </div>
    </div>
  );
}

export function DemoDataPill() {
  return (
    <span className="rounded-full border border-vault-border bg-vault-panel px-3 py-1.5 text-xs text-vault-muted">
      Demo data
    </span>
  );
}
