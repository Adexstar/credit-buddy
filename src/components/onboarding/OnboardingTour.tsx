import { useEffect, useState } from "react";
import { ArrowRight, Rocket } from "lucide-react";

interface TourStep {
  id: string;
  title: string;
  description: string;
  target: string | null;
  side: "top" | "bottom" | "center";
}

const TOUR_STEPS: TourStep[] = [
  {
    id: "welcome",
    title: "Welcome to Credit Bank",
    description: "Your unified AI credit vault. Here's a 30-second tour of the essentials.",
    target: null,
    side: "center",
  },
  {
    id: "stats",
    title: "Overview stats",
    description: "Total balance, connected apps and credits about to expire — always at the top.",
    target: "stats-cards",
    side: "bottom",
  },
  {
    id: "apps",
    title: "Connected apps",
    description: "Sync, configure and monitor every AI provider from one panel.",
    target: "connected-apps",
    side: "top",
  },
  {
    id: "buckets",
    title: "Credit buckets",
    description: "Track individual credit pools with expiry dates and usage progress.",
    target: "credit-buckets",
    side: "top",
  },
  {
    id: "activity",
    title: "Recent activity",
    description: "Usage, expiry warnings and syncs stream in here as they happen.",
    target: "recent-activity",
    side: "top",
  },
  {
    id: "search",
    title: "Global search",
    description: "Press ⌘K to jump to any app, bucket, activity entry or policy instantly.",
    target: null,
    side: "center",
  },
  {
    id: "complete",
    title: "You're all set",
    description: "Press ? at any time to see every keyboard shortcut. Happy optimising.",
    target: null,
    side: "center",
  },
];

interface Rect {
  top: number;
  left: number;
  width: number;
  height: number;
}

function tooltipStyle(rect: Rect | null, side: TourStep["side"]): React.CSSProperties {
  if (!rect || side === "center") {
    return { top: "50%", left: "50%", transform: "translate(-50%, -50%)" };
  }
  const padding = 16;
  const width = Math.min(400, window.innerWidth - 32);
  const height = 220;
  let top = side === "bottom" ? rect.top + rect.height + padding : rect.top - height - padding;
  let left = rect.left + (rect.width - width) / 2;
  top = Math.max(padding, Math.min(top, window.innerHeight - height - padding));
  left = Math.max(padding, Math.min(left, window.innerWidth - width - padding));
  return { top, left, width };
}

export function OnboardingTour({
  isOpen,
  onClose,
  onOpenSearch,
}: {
  isOpen: boolean;
  onClose: () => void;
  onOpenSearch?: () => void;
}) {
  const [index, setIndex] = useState(0);
  const [rect, setRect] = useState<Rect | null>(null);

  useEffect(() => {
    if (!isOpen) {
      setIndex(0);
      return;
    }
    const step = TOUR_STEPS[index];
    if (!step?.target) {
      setRect(null);
      return;
    }
    const el = document.getElementById(step.target);
    if (!el) {
      setRect(null);
      return;
    }
    el.scrollIntoView({ behavior: "smooth", block: "center" });
    const measure = () => {
      const r = el.getBoundingClientRect();
      setRect({ top: r.top, left: r.left, width: r.width, height: r.height });
    };
    const timer = setTimeout(measure, 350);
    window.addEventListener("resize", measure);
    return () => {
      clearTimeout(timer);
      window.removeEventListener("resize", measure);
    };
  }, [index, isOpen]);

  if (!isOpen) return null;

  const step = TOUR_STEPS[index]!;
  const progress = ((index + 1) / TOUR_STEPS.length) * 100;
  const isLast = index === TOUR_STEPS.length - 1;

  const next = () => {
    if (isLast) {
      onClose();
      return;
    }
    if (step.id === "search") onOpenSearch?.();
    setIndex(index + 1);
  };

  return (
    <div className="fixed inset-0 z-[120]">
      <div className="absolute inset-0 bg-vault-bg/75 backdrop-blur-[2px]" onClick={onClose} />

      {rect && (
        <div
          className="pointer-events-none absolute rounded-2xl border-2 border-vault-teal/70 transition-all duration-300"
          style={{
            top: rect.top - 6,
            left: rect.left - 6,
            width: rect.width + 12,
            height: rect.height + 12,
            boxShadow: "0 0 0 9999px hsl(0 0% 0% / 0.55)",
          }}
        />
      )}

      <div
        role="dialog"
        aria-modal="true"
        aria-label={step.title}
        className="absolute max-w-[400px] rounded-2xl border border-vault-border bg-vault-panel p-6 shadow-2xl animate-[vault-scale-in_0.2s_ease-out]"
        style={tooltipStyle(rect, step.side)}
      >
        <h3 className="font-display text-lg font-semibold text-vault-foreground">{step.title}</h3>
        <p className="mt-2 text-sm text-vault-muted">{step.description}</p>

        <div className="mt-4 h-1 overflow-hidden rounded-full bg-vault-raised">
          <div className="h-full bg-vault-teal transition-all duration-300" style={{ width: `${progress}%` }} />
        </div>

        <div className="mt-5 flex items-center justify-between gap-3">
          <div className="flex items-center gap-3 text-xs text-vault-faint">
            <span>
              {index + 1}/{TOUR_STEPS.length}
            </span>
            <button type="button" onClick={onClose} className="transition hover:text-vault-foreground">
              Skip tour
            </button>
          </div>
          <div className="flex gap-2">
            {index > 0 && (
              <button
                type="button"
                onClick={() => setIndex(index - 1)}
                className="rounded-full border border-vault-border px-3.5 py-2 text-sm text-vault-muted transition hover:text-vault-foreground"
              >
                Back
              </button>
            )}
            <button
              type="button"
              onClick={next}
              className="inline-flex items-center gap-2 rounded-full bg-vault-teal px-4 py-2 text-sm font-medium text-vault-bg transition hover:opacity-90"
            >
              {isLast ? (
                <>
                  Get started <Rocket size={15} />
                </>
              ) : (
                <>
                  Next <ArrowRight size={15} />
                </>
              )}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
