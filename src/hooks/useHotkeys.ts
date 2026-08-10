import { useCallback, useEffect } from "react";

export interface HotkeyOptions {
  enabled?: boolean;
  preventDefault?: boolean;
  /** Allow the hotkey to fire while typing in an input/textarea. */
  allowInInput?: boolean;
}

const isMac = () =>
  typeof navigator !== "undefined" && /mac|iphone|ipad/i.test(navigator.userAgent);

function isEditable(target: EventTarget | null) {
  const el = target as HTMLElement | null;
  if (!el) return false;
  const tag = el.tagName;
  return tag === "INPUT" || tag === "TEXTAREA" || tag === "SELECT" || el.isContentEditable;
}

/**
 * Bind a keyboard shortcut such as "cmd+k", "ctrl+shift+e", "escape" or "?".
 * "cmd" maps to metaKey on macOS and ctrlKey elsewhere.
 */
export function useHotkeys(
  key: string,
  callback: (event: KeyboardEvent) => void,
  options: HotkeyOptions = {},
) {
  const { enabled = true, preventDefault = true, allowInInput = false } = options;

  const handler = useCallback(
    (event: KeyboardEvent) => {
      if (!enabled) return;
      if (!allowInInput && isEditable(event.target) && event.key !== "Escape") return;

      const parts = key.toLowerCase().split("+");
      const target = parts.pop() ?? "";
      const wantsMod = parts.includes("cmd") || parts.includes("mod");
      const wantsCtrl = parts.includes("ctrl");
      const wantsAlt = parts.includes("alt");
      const wantsShift = parts.includes("shift");

      const mod = isMac() ? event.metaKey : event.ctrlKey;
      if (wantsMod && !mod) return;
      if (!wantsMod && !wantsCtrl && (event.metaKey || event.ctrlKey)) return;
      if (wantsCtrl && !event.ctrlKey) return;
      if (wantsAlt !== event.altKey) return;
      if (wantsShift && !event.shiftKey) return;

      const pressed = event.key.toLowerCase();
      const matches =
        pressed === target ||
        (target === "escape" && pressed === "esc") ||
        (target === "," && pressed === ",");
      if (!matches) return;

      if (preventDefault) event.preventDefault();
      callback(event);
    },
    [key, callback, enabled, preventDefault, allowInInput],
  );

  useEffect(() => {
    document.addEventListener("keydown", handler);
    return () => document.removeEventListener("keydown", handler);
  }, [handler]);
}
