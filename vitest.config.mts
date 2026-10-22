import { fileURLToPath } from 'node:url';

import { defineConfig } from 'vitest/config';

/**
 * `server-only` throws when imported outside a React Server Component bundle.
 * Aliasing it to an empty module lets unit tests import server modules directly.
 */
const serverOnlyStub = fileURLToPath(new URL('./src/test/server-only-stub.ts', import.meta.url));

export default defineConfig({
  resolve: {
    alias: {
      'server-only': serverOnlyStub,
    },
  },
  test: {
    environment: 'node',
    include: ['src/**/*.test.ts', 'src/**/*.test.tsx'],
    passWithNoTests: true,
  },
});
