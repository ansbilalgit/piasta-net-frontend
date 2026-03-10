import { test, expect } from '@playwright/test';

test.describe('Homepage', () => {
  test.beforeEach(async ({ page }) => {
    await page.goto('/');
  });

  test('should display hero section with correct content', async ({ page }) => {
    await expect(page.getByText('Game Design & Technology')).toBeVisible();
    await expect(page.getByRole('heading', { name: 'Game Night Hub' })).toBeVisible();
    await expect(page.getByText('Your gateway to epic gaming sessions at GU')).toBeVisible();
  });

  test('should have working CTA button linking to games page', async ({ page }) => {
    const browseButton = page.getByRole('link', { name: /Browse Games/i });
    await expect(browseButton).toBeVisible();
    await expect(browseButton).toHaveAttribute('href', '/games');
    
    await browseButton.click();
    await expect(page).toHaveURL(/\/games/);
  });

  test('should display next game night section', async ({ page }) => {
    await expect(page.getByText('Next Game Night — Every Tuesday')).toBeVisible();
  });

  test('should have correct page title', async ({ page }) => {
    await expect(page).toHaveTitle(/Piasta|Game Night/i);
  });
});
