import type { ButtonHTMLAttributes, ReactNode } from "react";
import { Spinner, type SpinnerTone } from "./Spinner";

export function LoadingButton({
  children,
  isLoading = false,
  loadingText = "Loading…",
  variant = "primary",
  className = "",
  ...props
}: ButtonHTMLAttributes<HTMLButtonElement> & {
  children: ReactNode;
  isLoading?: boolean;
  loadingText?: string;
  variant?: "primary" | "ghost" | "danger";
}) {
  const variants: Record<string, { base: string; spinner: SpinnerTone }> = {
    primary: {
      base: "bg-vault-teal text-vault-bg hover:bg-vault-teal-deep",
      spinner: "bg",
    },
    ghost: {
      base: "border border-vault-border bg-vault-panel text-vault-muted hover:text-vault-foreground",
      spinner: "muted",
    },
    danger: {
      base: "bg-vault-danger text-vault-bg hover:opacity-90",
      spinner: "bg",
    },
  };
  const v = variants[variant];

  return (
    <button
      {...props}
      disabled={isLoading || props.disabled}
      aria-busy={isLoading}
      className={`inline-flex items-center justify-center gap-2 rounded-xl px-4 py-2.5 text-sm font-medium transition disabled:cursor-not-allowed disabled:opacity-60 ${v.base} ${className}`}
    >
      {isLoading && <Spinner size="sm" tone={v.spinner} />}
      <span>{isLoading ? loadingText : children}</span>
    </button>
  );
}
