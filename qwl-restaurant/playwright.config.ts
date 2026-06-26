import { defineConfig, devices } from '@playwright/test';

/**
 * Playwright E2E configuration for the QWL Restaurant app.
 *
 * Starts both the .NET backend (port 5232) and the Angular dev server (port 4200)
 * automatically before running the tests. Set REUSE=1 to reuse already-running servers.
 */
export default defineConfig({
  testDir: './e2e',
  fullyParallel: false,
  workers: 1,
  timeout: 60_000,
  expect: { timeout: 15_000 },
  reporter: [['list'], ['html', { open: 'never' }]],

  use: {
    baseURL: 'http://localhost:4200',
    trace: 'on-first-retry',
    screenshot: 'only-on-failure',
  },

  projects: [
    { name: 'chromium', use: { ...devices['Desktop Chrome'] } },
  ],

  webServer: [
    {
      command: 'dotnet run --project ../backend/qwl-restaurant.API --no-launch-profile --urls http://localhost:5232',
      url: 'http://localhost:5232/api/events',
      timeout: 120_000,
      reuseExistingServer: true,
      env: { ASPNETCORE_ENVIRONMENT: 'Development' },
    },
    {
      command: 'npm start',
      url: 'http://localhost:4200',
      timeout: 120_000,
      reuseExistingServer: true,
    },
  ],
});
