export type SpinnerSize = "sm" | "md" | "lg" | "xl";
export type SpinnerTone = "teal" | "foreground" | "muted" | "bg";

const SIZES: Record<SpinnerSize, string> = {
  sm: "size-4",
  md: "size-6",
  lg: "size-8",
  xl: "size-12",
};

const TONES: Record<SpinnerTone, string> = {
  teal: "border-vault-teal",
  foreground: "border-vault-foreground",
  muted: "border-vault-muted",
  bg: "border-vault-bg",
};

export function Spinner({
  size = "sm",
  tone = "teal",
  className = "",
}: {
  size?: SpinnerSize;
  tone?: SpinnerTone;
  className?: string;
}) {
  return (
    <span
      role="status"
      aria-label="Loading"
      className={`inline-block animate-spin rounded-full border-2 border-t-transparent ${SIZES[size]} ${TONES[tone]} ${className}`}
    />
  );
}
