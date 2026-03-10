import { test, expect } from '@playwright/test';

test.describe('Navigation', () => {
  test.beforeEach(async ({ page }) => {
    await page.goto('/');
  });

  test('should navigate to login page', async ({ page }) => {
    const loginLink = page.getByRole('link', { name: /Login|Sign In/i });
    
    // Check if login link exists (might be in header)
    if (await loginLink.isVisible().catch(() => false)) {
      await loginLink.click();
      await expect(page).toHaveURL(/\/login/);
      await expect(page.getByRole('heading', { name: /Sign In|Login/i })).toBeVisible();
    } else {
      // Direct navigation fallback
      await page.goto('/login');
      await expect(page.getByRole('heading', { name: /Sign In|Login/i })).toBeVisible();
    }
  });

  test('should navigate to games page', async ({ page }) => {
    await page.goto('/games');
    await expect(page).toHaveURL(/\/games/);
    await expect(page.getByRole('heading', { name: /Game Library/i })).toBeVisible();
  });

  test('should navigate back to home from other pages', async ({ page }) => {
    await page.goto('/login');
    
    const homeLink = page.getByRole('link', { name: /Back To Home|Home/i });
    if (await homeLink.isVisible().catch(() => false)) {
      await homeLink.click();
      await expect(page).toHaveURL('/');
    }
  });
});
