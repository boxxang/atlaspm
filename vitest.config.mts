import { defineConfig } from 'vitest/config';
import { resolve } from 'node:path';

/**
 * Unit tests only. Pure logic under /src/lib and /src/data (schedule calculator,
 * date-edit ripple, derivations) — see PORTING_PLAN Phase 2. No DOM environment:
 * if a test needs the DOM it belongs in Playwright.
 */
export default defineConfig({
  resolve: {
    alias: { '@': resolve(import.meta.dirname, 'src') },
  },
  test: {
    environment: 'node',
    include: ['src/**/*.test.ts', 'tests/unit/**/*.test.ts'],
    passWithNoTests: true,
  },
});
