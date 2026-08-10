import { Spinner } from "./Spinner";

export function PageLoader({
  fullScreen = false,
  label = "Loading your dashboard…",
}: {
  fullScreen?: boolean;
  label?: string;
}) {
  if (fullScreen) {
    return (
      <div className="fixed inset-0 z-50 flex items-center justify-center bg-vault-bg/80 backdrop-blur-sm">
        <div className="text-center">
          <Spinner size="xl" tone="teal" />
          <p className="mt-4 text-sm text-vault-muted">{label}</p>
        </div>
      </div>
    );
  }

  return (
    <div className="flex items-center justify-center py-12">
      <div className="text-center">
        <Spinner size="lg" tone="teal" />
        {label && <p className="mt-3 text-xs text-vault-faint">{label}</p>}
      </div>
    </div>
  );
}
