import { defineConfig, devices } from '@playwright/test';
import { TEST_DATABASE_URL } from './tests/e2e/fixtures';

const PORT = 3100;
const baseURL = `http://localhost:${PORT}`;

export default defineConfig({
  testDir: './tests/e2e',
  testIgnore: ['fixtures.ts'],
  /* Serial: every test reseeds the one database the dev server is pointed at. */
  fullyParallel: false,
  workers: 1,
  forbidOnly: !!process.env.CI,
  retries: process.env.CI ? 1 : 0,
  reporter: process.env.CI ? 'line' : 'list',
  use: { baseURL, trace: 'on-first-retry' },
  projects: [{ name: 'chromium', use: { ...devices['Desktop Chrome'] } }],
  webServer: {
    /**
     * Its own database and port, so a run never touches dev.db or a dev server.
     * The schema push happens here rather than in globalSetup because Playwright
     * starts webServer first — setting up afterwards would leave the health
     * check hitting an empty database.
     */
    command: `npm run e2e:db && npm run dev -- --port ${PORT}`,
    env: { DATABASE_URL: TEST_DATABASE_URL },
    url: baseURL,
    reuseExistingServer: false,
    /* Cold start is a schema push plus Turbopack's first compile of the
       route the health check hits, which alone has taken over a minute. */
    timeout: 300_000,
  },
});
