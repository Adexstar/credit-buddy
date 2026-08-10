import type { ReactNode } from "react";

export function EmptyState({
  icon,
  title,
  description,
  action,
  actionText,
  secondaryAction,
  secondaryActionText,
}: {
  icon?: ReactNode;
  title: string;
  description?: string;
  action?: () => void;
  actionText?: string;
  secondaryAction?: () => void;
  secondaryActionText?: string;
}) {
  return (
    <div className="mx-auto max-w-md py-16 text-center">
      {icon && <div className="mb-4 text-5xl">{icon}</div>}
      <h3 className="font-display text-xl font-semibold text-vault-foreground">{title}</h3>
      {description && <p className="mt-2 text-sm text-vault-muted">{description}</p>}
      {(actionText || secondaryActionText) && (
        <div className="mt-6 flex flex-wrap justify-center gap-3">
          {actionText && (
            <button
              type="button"
              onClick={action}
              className="rounded-full bg-vault-teal px-5 py-2.5 text-sm font-medium text-vault-bg transition hover:bg-vault-teal-deep"
            >
              {actionText}
            </button>
          )}
          {secondaryActionText && (
            <button
              type="button"
              onClick={secondaryAction}
              className="rounded-full border border-vault-border px-5 py-2.5 text-sm text-vault-muted transition hover:text-vault-foreground"
            >
              {secondaryActionText}
            </button>
          )}
        </div>
      )}
    </div>
  );
}

type Handlers = { action?: () => void; secondaryAction?: () => void };

export const EmptyApps = ({ action, secondaryAction }: Handlers) => (
  <EmptyState
    icon="🔌"
    title="No apps connected"
    description="Connect your first AI provider to start managing credits across platforms."
    actionText="+ Connect App"
    action={action}
    secondaryActionText="View documentation"
    secondaryAction={secondaryAction}
  />
);

export const EmptyBuckets = ({ action, secondaryAction }: Handlers) => (
  <EmptyState
    icon="📦"
    title="No credit buckets"
    description="Add credits or connect an app to start building your credit vault."
    actionText="+ Add Credits"
    action={action}
    secondaryActionText="Connect app"
    secondaryAction={secondaryAction}
  />
);

export const EmptyActivity = ({ action, secondaryAction }: Handlers) => (
  <EmptyState
    icon="📊"
    title="No activity yet"
    description="Start using your AI credits to see activity appear here."
    actionText="Go to dashboard"
    action={action}
    secondaryActionText="View apps"
    secondaryAction={secondaryAction}
  />
);

export const EmptyPolicies = ({ action, secondaryAction }: Handlers) => (
  <EmptyState
    icon="📋"
    title="No policies created"
    description="Create your first automation policy to protect credits before they expire."
    actionText="+ Create Policy"
    action={action}
    secondaryActionText="Learn more"
    secondaryAction={secondaryAction}
  />
);

export const EmptySearch = ({ action }: Handlers) => (
  <EmptyState
    icon="🔍"
    title="No results found"
    description="Try adjusting your search or filters to find what you're looking for."
    actionText="Clear filters"
    action={action}
  />
);
