import type { ReactNode } from 'react';

type EmptyStateProps = {
  children?: ReactNode;
  description: string;
  title: string;
};

/** A consistent, accessible empty state for page and feature content. */
export function EmptyState({ children, description, title }: EmptyStateProps) {
  return (
    <div className="rounded-xl border border-dashed border-stone-300 bg-stone-50 p-6 text-stone-700">
      <h2 className="text-lg font-semibold text-stone-950">{title}</h2>
      <p className="mt-1 text-sm text-stone-600">{description}</p>
      {children ? <div className="mt-4">{children}</div> : null}
    </div>
  );
}
