export interface ShortcutDef {
  keys: string[];
  hotkey: string;
  description: string;
  group: "General" | "Navigation" | "Actions";
}

export const SHORTCUTS: ShortcutDef[] = [
  { keys: ["⌘", "K"], hotkey: "cmd+k", description: "Open global search", group: "General" },
  { keys: ["?"], hotkey: "shift+?", description: "Show keyboard shortcuts", group: "General" },
  { keys: ["Esc"], hotkey: "escape", description: "Close modal / clear selection", group: "General" },
  { keys: ["⌘", "D"], hotkey: "cmd+d", description: "Go to dashboard", group: "Navigation" },
  { keys: ["⌘", "1"], hotkey: "cmd+1", description: "Go to connected apps", group: "Navigation" },
  { keys: ["⌘", "2"], hotkey: "cmd+2", description: "Go to credits", group: "Navigation" },
  { keys: ["⌘", "3"], hotkey: "cmd+3", description: "Go to policies", group: "Navigation" },
  { keys: ["⌘", ","], hotkey: "cmd+,", description: "Open settings", group: "Navigation" },
  { keys: ["⌘", "⇧", "R"], hotkey: "cmd+shift+r", description: "Refresh dashboard data", group: "Actions" },
  { keys: ["⌘", "⇧", "E"], hotkey: "cmd+shift+e", description: "Export current data", group: "Actions" },
  { keys: ["⌘", "⇧", "T"], hotkey: "cmd+shift+t", description: "Restart the product tour", group: "Actions" },
];

export const SHORTCUT_GROUPS = ["General", "Navigation", "Actions"] as const;
