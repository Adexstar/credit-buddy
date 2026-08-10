export function ProgressBar({
  progress,
  label,
  showLabel = true,
  tone = "teal",
  className = "",
}: {
  progress: number;
  label?: string;
  showLabel?: boolean;
  tone?: "teal" | "blue" | "amber" | "danger";
  className?: string;
}) {
  const value = Math.max(0, Math.min(100, Math.round(progress)));
  const tones = {
    teal: "bg-vault-teal",
    blue: "bg-vault-blue",
    amber: "bg-vault-amber",
    danger: "bg-vault-danger",
  } as const;

  return (
    <div className={className}>
      {showLabel && (
        <div className="mb-1.5 flex justify-between text-xs">
          <span className="text-vault-muted">{label}</span>
          <span className="vault-mono text-vault-faint">{value}%</span>
        </div>
      )}
      <div
        role="progressbar"
        aria-valuenow={value}
        aria-valuemin={0}
        aria-valuemax={100}
        aria-label={label ?? "Progress"}
        className="h-2 w-full overflow-hidden rounded-full bg-vault-raised"
      >
        <div className={`h-full rounded-full transition-all duration-300 ease-out ${tones[tone]}`} style={{ width: `${value}%` }} />
      </div>
    </div>
  );
}
