import { useEffect, type ReactNode } from "react";
import { X } from "lucide-react";

export const TONE: Record<string, { text: string; bg: string; border: string }> = {
  blue: { text: "text-vault-blue", bg: "bg-vault-blue/10", border: "border-vault-blue/30" },
  purple: { text: "text-vault-purple", bg: "bg-vault-purple/10", border: "border-vault-purple/30" },
  amber: { text: "text-vault-amber", bg: "bg-vault-amber/10", border: "border-vault-amber/30" },
  danger: { text: "text-vault-danger", bg: "bg-vault-danger/10", border: "border-vault-danger/30" },
  green: { text: "text-vault-green", bg: "bg-vault-green/10", border: "border-vault-green/30" },
};

export function Modal({
  title,
  description,
  onClose,
  footer,
  children,
  width = "max-w-2xl",
}: {
  title: string;
  description?: string;
  onClose: () => void;
  footer?: ReactNode;
  children: ReactNode;
  width?: string;
}) {
  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") onClose();
    };
    window.addEventListener("keydown", onKey);
    document.body.style.overflow = "hidden";
    return () => {
      window.removeEventListener("keydown", onKey);
      document.body.style.overflow = "";
    };
  }, [onClose]);

  return (
    <div className="fixed inset-0 z-50 flex items-end justify-center sm:items-center">
      <button
        type="button"
        aria-label="Close dialog"
        onClick={onClose}
        className="absolute inset-0 bg-black/60 backdrop-blur-sm animate-in fade-in"
      />
      <div
        role="dialog"
        aria-modal="true"
        aria-label={title}
        className={`relative z-10 w-full ${width} max-h-[92vh] overflow-y-auto rounded-t-2xl border border-vault-border bg-vault-panel p-5 shadow-lg sm:rounded-2xl sm:p-6`}
      >
        <header className="mb-5 flex items-start justify-between gap-4">
          <div>
            <h2 className="font-display text-xl font-semibold text-vault-foreground">{title}</h2>
            {description && <p className="mt-1 text-sm text-vault-muted">{description}</p>}
          </div>
          <button
            type="button"
            aria-label="Close"
            onClick={onClose}
            className="rounded-lg p-1.5 text-vault-faint transition hover:bg-vault-raised hover:text-vault-foreground"
          >
            <X size={18} />
          </button>
        </header>

        {children}

        {footer && <div className="mt-6 flex flex-wrap items-center justify-end gap-3">{footer}</div>}
      </div>
    </div>
  );
}

export function Field({ label, hint, children }: { label: string; hint?: string; children: ReactNode }) {
  return (
    <label className="block">
      <span className="text-xs font-medium tracking-wide text-vault-muted uppercase">{label}</span>
      <div className="mt-2">{children}</div>
      {hint && <span className="mt-1.5 block text-xs text-vault-faint">{hint}</span>}
    </label>
  );
}

export const inputClass =
  "w-full rounded-xl border border-vault-border bg-vault-bg px-3 py-2.5 text-sm text-vault-foreground outline-none transition focus:border-vault-teal/60";

export function PrimaryButton({
  children,
  disabled,
  onClick,
  type = "button",
}: {
  children: ReactNode;
  disabled?: boolean;
  onClick?: () => void;
  type?: "button" | "submit";
}) {
  return (
    <button
      type={type}
      disabled={disabled}
      onClick={onClick}
      className="inline-flex items-center gap-2 rounded-xl bg-vault-teal px-4 py-2.5 text-sm font-medium text-vault-bg transition hover:bg-vault-teal-deep disabled:cursor-not-allowed disabled:opacity-40"
    >
      {children}
    </button>
  );
}

export function GhostButton({
  children,
  onClick,
  disabled,
}: {
  children: ReactNode;
  onClick?: () => void;
  disabled?: boolean;
}) {
  return (
    <button
      type="button"
      disabled={disabled}
      onClick={onClick}
      className="inline-flex items-center gap-2 rounded-xl border border-vault-border bg-vault-panel px-4 py-2.5 text-sm text-vault-muted transition hover:text-vault-foreground disabled:opacity-40"
    >
      {children}
    </button>
  );
}
