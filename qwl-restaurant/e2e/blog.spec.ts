import { test, expect } from '@playwright/test';

/**
 * Blog reader flow: open the first published post and submit a comment,
 * which should be accepted and queued for admin approval.
 */
test('reads a blog post and submits a comment for approval', async ({ page }) => {
  await page.goto('/blog');

  // Open the first published post via its "Read More" link.
  const readMore = page.getByRole('link', { name: /Read More/i }).first();
  await expect(readMore).toBeVisible();
  await readMore.click();
  await expect(page).toHaveURL(/\/blog\/.+/);

  // Fill and submit the comment form.
  await page.getByPlaceholder('Your name *').fill('E2E Commenter');
  await page.getByPlaceholder('Email').fill('e2e-comment@test.com');
  await page.getByPlaceholder(/Your comment/).fill('Automated E2E test comment.');
  await page.getByRole('button', { name: /Submit Comment/i }).click();

  // Comment is accepted and awaits moderation.
  await expect(page.getByText(/awaiting approval/i)).toBeVisible();
});
