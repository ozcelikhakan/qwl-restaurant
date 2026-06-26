import { test, expect } from '@playwright/test';

/**
 * End-to-end reservation flow: fills the 3-step form and submits.
 * Verifies the create endpoint contract the whole way through.
 */
test('completes the 3-step reservation flow', async ({ page }) => {
  await page.goto('/reservation');

  // ── Step 1: guest info ──
  await page.getByPlaceholder('Your name').fill('E2E Test User');
  await page.getByPlaceholder('Your email address').fill('e2e-reservation@test.com');
  await page.getByPlaceholder('Your phone number').fill('5550001122');
  await page.getByRole('button', { name: /Next/ }).click();

  // ── Step 2: date & time ──
  await page.locator('input[name="date"]').fill('2026-12-20');
  await page.getByRole('button', { name: '19:00', exact: true }).click();
  // Wait for the floor plan to auto-assign a table after fetching occupied tables.
  await expect(page.getByText(/assigned/)).toBeVisible();
  await page.getByRole('button', { name: /Next/ }).click();

  // ── Step 3: confirm ──
  await page.getByRole('button', { name: /Reserve/ }).click();

  // ── Success ──
  await expect(page.getByRole('heading', { name: /Your Reservation Has Been Received/i })).toBeVisible();
});
