'use client';

type DashboardErrorProps = {
  reset: () => void;
};

export default function DashboardError({ reset }: DashboardErrorProps) {
  return (
    <main className="grid min-h-screen place-items-center px-6 py-12">
      <section className="max-w-md rounded-xl border border-error bg-surface p-6 text-center shadow-theme">
        <h1 className="text-xl font-semibold text-primary">
          We could not load your reading dashboard
        </h1>
        <p className="mt-2 text-sm text-secondary">Please try again in a moment.</p>
        <button
          className="mt-5 rounded-lg bg-button px-4 py-2.5 text-sm font-semibold text-button-text transition hover:opacity-90 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-focus focus-visible:ring-offset-2 focus-visible:ring-offset-surface"
          onClick={reset}
          type="button"
        >
          Try again
        </button>
      </section>
    </main>
  );
}
