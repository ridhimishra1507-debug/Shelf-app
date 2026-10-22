/**
 * Empty stand-in for the `server-only` marker package.
 *
 * The real package throws when a module is imported from a client bundle. The
 * Vitest alias in `vitest.config.mts` points `server-only` here so unit tests
 * can import server modules without a React Server Component environment.
 */
export {};
