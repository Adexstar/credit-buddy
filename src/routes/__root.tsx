import { Outlet, createRootRoute } from "@tanstack/react-router";
import { Toaster } from "sonner";

import "../styles.css";

export const Route = createRootRoute({
  component: RootComponent,
});

function RootComponent() {
  return (
    <>
      <Outlet />
      <Toaster theme="dark" position="bottom-right" />
    </>
  );
}
