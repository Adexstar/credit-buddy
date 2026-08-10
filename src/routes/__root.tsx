import { Outlet, createRootRoute } from "@tanstack/react-router";
import { Toaster } from "sonner";
import { ToastProvider } from "@/context/ToastContext";

import "../styles.css";

export const Route = createRootRoute({
  component: RootComponent,
});

function RootComponent() {
  return (
    <ToastProvider>
      <Outlet />
      <Toaster theme="dark" position="bottom-right" />
    </ToastProvider>
  );
}
