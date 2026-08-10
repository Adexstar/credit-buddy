import { useEffect, useRef, useState } from "react";
import { AlertTriangle, CheckCircle2, Info, X, XCircle } from "lucide-react";

export type ToastType = "success" | "error" | "warning" | "info";

export type ToastItem = {
  id: number;
  type: ToastType;
  message: string;
  duration?: number;
};

const CONFIG: Record<
  ToastType,
  { icon: typeof Info; bg: string; border: string; text: string; bar: string }
> = {
  success: {
    icon: CheckCircle2,
    bg: "bg-vault-green/10",
    border: "border-vault-green/35",
    text: "text-vault-green",
    bar: "bg-vault-green",
  },
  error: {
    icon: XCircle,
    bg: "bg-vault-danger/10",
    border: "border-vault-danger/35",
    text: "text-vault-danger",
    bar: "bg-vault-danger",
  },
  warning: {
    icon: AlertTriangle,
    bg: "bg-vault-amber/10",
    border: "border-vault-amber/35",
    text: "text-vault-amber",
    bar: "bg-vault-amber",
  },
  info: {
    icon: Info,
    bg: "bg-vault-blue/10",
    border: "border-vault-blue/35",
    text: "text-vault-blue",
    bar: "bg-vault-blue",
  },
};

export function Toast({
  id,
  type,
  message,
  duration = 5000,
  onDismiss,
}: ToastItem & { onDismiss: (id: number) => void }) {
  const [paused, setPaused] = useState(false);
  const [progress, setProgress] = useState(100);
  const [leaving, setLeaving] = useState(false);
  const remaining = useRef(duration);

  useEffect(() => {
    if (paused || leaving) return;
    const step = 100;
    const timer = setInterval(() => {
      remaining.current -= step;
      const next = Math.max(0, (remaining.current / duration) * 100);
      setProgress(next);
      if (remaining.current <= 0) {
        clearInterval(timer);
        setLeaving(true);
      }
    }, step);
    return () => clearInterval(timer);
  }, [paused, leaving, duration]);

  useEffect(() => {
    if (!leaving) return;
    const t = setTimeout(() => onDismiss(id), 220);
    return () => clearTimeout(t);
  }, [leaving, id, onDismiss]);

  const config = CONFIG[type];
  const Icon = config.icon;

  return (
    <div
      role="status"
      aria-live="polite"
      onMouseEnter={() => setPaused(true)}
      onMouseLeave={() => setPaused(false)}
      className={`relative w-[min(22rem,calc(100vw-2rem))] overflow-hidden rounded-xl border bg-vault-panel p-4 pb-5 shadow-lg backdrop-blur ${config.bg} ${config.border} ${
        leaving ? "animate-[vault-toast-out_0.2s_ease-in_forwards]" : "animate-[vault-toast-in_0.25s_ease-out]"
      }`}
    >
      <div className="flex items-start gap-3">
        <Icon size={18} className={`mt-0.5 shrink-0 ${config.text}`} />
        <p className="flex-1 text-sm font-medium text-vault-foreground">{message}</p>
        <button
          type="button"
          aria-label="Dismiss notification"
          onClick={() => setLeaving(true)}
          className="rounded-md p-1 text-vault-faint transition hover:bg-vault-raised hover:text-vault-foreground"
        >
          <X size={14} />
        </button>
      </div>
      <div className="absolute bottom-0 left-0 right-0 h-1 bg-vault-raised">
        <div
          className={`h-full transition-[width] duration-100 ease-linear ${config.bar}`}
          style={{ width: `${progress}%` }}
        />
      </div>
    </div>
  );
}

export function ToastViewport({
  toasts,
  onDismiss,
}: {
  toasts: ToastItem[];
  onDismiss: (id: number) => void;
}) {
  return (
    <div className="pointer-events-none fixed right-4 top-4 z-[100] flex flex-col items-end gap-2">
      {toasts.map((toast) => (
        <div key={toast.id} className="pointer-events-auto">
          <Toast {...toast} onDismiss={onDismiss} />
        </div>
      ))}
    </div>
  );
}
