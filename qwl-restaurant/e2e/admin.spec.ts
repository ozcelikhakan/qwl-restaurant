import { test, expect, Page } from '@playwright/test';

const ADMIN_EMAIL = 'admin@qwlrestaurant.com';
const ADMIN_PASSWORD = 'Admin123';

/**
 * Logs in through the navbar auth modal as the seeded admin user.
 */
async function loginAsAdmin(page: Page): Promise<void> {
  await page.goto('/');
  await page.getByRole('button', { name: 'Sign In' }).first().click();

  const modal = page.locator('.modal-backdrop');
  await expect(modal).toBeVisible();
  await modal.locator('input[type="email"]').fill(ADMIN_EMAIL);
  await modal.locator('input[type="password"]').fill(ADMIN_PASSWORD);
  await modal.locator('button[type="submit"]').click();

  // Modal closes once the login succeeds.
  await expect(modal).toBeHidden();
}

test.describe('Admin', () => {
  test('admin can sign in and open the dashboard', async ({ page }) => {
    await loginAsAdmin(page);
    await page.goto('/admin/reservations');
    // Not redirected back to home by the admin guard.
    await expect(page).toHaveURL(/\/admin\/reservations/);
    await expect(page.getByRole('heading', { name: 'Reservations' })).toBeVisible();
  });

  test('admin can confirm a pending reservation (status update)', async ({ page, request }) => {
    // Seed a pending reservation via the public API so the test is order-independent.
    const seed = await request.post('http://localhost:5232/api/reservation', {
      data: {
        fullName: 'E2E Confirm Target',
        email: 'e2e-confirm@test.com',
        phone: '5559998877',
        reservationDate: '2026-12-22',
        reservationTime: '20:00:00',
        personCount: 2,
        message: null,
        tableNumber: 'T1',
      },
    });
    expect(seed.ok()).toBeTruthy();

    await loginAsAdmin(page);
    await page.goto('/admin/reservations');
    await expect(page.getByRole('heading', { name: 'Reservations' })).toBeVisible();

    const confirmButtons = page.locator('button[title="Confirm"]');
    const before = await confirmButtons.count();
    expect(before).toBeGreaterThan(0);

    await confirmButtons.first().click();
    // Confirming hides that row's Confirm button → count drops by one.
    await expect(confirmButtons).toHaveCount(before - 1);
  });

  test('admin can open the blog comment moderation tab', async ({ page }) => {
    await loginAsAdmin(page);
    await page.goto('/admin/blogs');
    await page.getByRole('button', { name: 'Comments' }).click();
    await expect(page.getByText(/awaiting approval/i)).toBeVisible();
  });
});
