import { Outlet, createRootRoute } from "@tanstack/react-router";
import { Toaster } from "sonner";
import { ToastProvider } from "@/context/ToastContext";
import { SearchProvider } from "@/context/SearchContext";
import { ShortcutsProvider } from "@/context/ShortcutsContext";
import { AuthProvider } from "@/context/AuthContext";

import "../styles.css";

export const Route = createRootRoute({
  component: RootComponent,
});

function RootComponent() {
  return (
    <ToastProvider>
      <AuthProvider>
        <SearchProvider>
          <ShortcutsProvider>
            <Outlet />
            <Toaster theme="dark" position="bottom-right" />
          </ShortcutsProvider>
        </SearchProvider>
      </AuthProvider>
    </ToastProvider>
  );
}

