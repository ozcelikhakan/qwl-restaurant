import { test, expect } from '@playwright/test';

/**
 * Smoke test: the home page loads and its admin-managed sections render.
 */
test.describe('Home page', () => {
  test('loads and shows the main sections', async ({ page }) => {
    await page.goto('/');

    // Hero call-to-action
    await expect(page.getByRole('link', { name: 'Book a Table' }).first()).toBeVisible();

    // Section headings (dynamic content sections)
    await expect(page.getByRole('heading', { name: /Menu/i }).first()).toBeVisible();
    await expect(page.getByRole('heading', { name: /Events/i }).first()).toBeVisible();
    await expect(page.getByRole('heading', { name: /From the Blog/i })).toBeVisible();
  });

  test('can navigate to the reservation page', async ({ page }) => {
    await page.goto('/');
    await page.getByRole('link', { name: 'Book a Table' }).first().click();
    await expect(page).toHaveURL(/\/reservation/);
  });
});
