import { defineConfig } from 'vitest/config';

/**
 * `createElementRegistrar` uses only runtime Angular functions — no
 * decorators, no templates — so it needs esbuild's TypeScript transform and a
 * DOM (for `customElements`), but not the Angular compiler. The two Angular
 * entry points it calls are mocked in the spec, which is what makes the
 * registration lifecycle testable in isolation.
 */
export default defineConfig({
  root: import.meta.dirname,
  test: {
    name: 'platform-core',
    environment: 'jsdom',
    include: ['src/**/*.spec.ts'],
    globals: true,
    passWithNoTests: false,
  },
});
