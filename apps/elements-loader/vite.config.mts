import { defineConfig } from 'vitest/config';

export default defineConfig({
  root: import.meta.dirname,
  test: {
    name: 'elements-loader',
    environment: 'node',
    include: ['src/**/*.spec.ts'],
    globals: true,
    passWithNoTests: false,
  },
});
