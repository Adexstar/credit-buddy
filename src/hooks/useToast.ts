import { useMemo } from "react";
import { useToastContext } from "@/context/ToastContext";

export function useToast() {
  const { showToast, dismissToast, clearToasts } = useToastContext();
  return useMemo(
    () => ({
      success: (message: string, duration?: number) => showToast("success", message, duration),
      error: (message: string, duration?: number) => showToast("error", message, duration),
      warning: (message: string, duration?: number) => showToast("warning", message, duration),
      info: (message: string, duration?: number) => showToast("info", message, duration),
      dismiss: dismissToast,
      clear: clearToasts,
    }),
    [showToast, dismissToast, clearToasts],
  );
}
