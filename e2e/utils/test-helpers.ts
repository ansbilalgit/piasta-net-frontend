/**
 * Test helpers for Playwright E2E tests
 */

import { Page, expect } from '@playwright/test';

/**
 * Login as a user with the given credentials
 */
export async function login(page: Page, username: string, password: string) {
  await page.goto('/login');
  await page.getByLabel(/Username/i).fill(username);
  await page.getByLabel(/Password/i).fill(password);
  await page.getByRole('button', { name: /Sign In/i }).click();
  
  // Wait for navigation or success indicator
  await page.waitForURL('/');
}

/**
 * Logout the current user
 */
export async function logout(page: Page) {
  // Clear localStorage
  await page.evaluate(() => {
    localStorage.removeItem('token');
    localStorage.removeItem('username');
  });
  
  // Navigate to home
  await page.goto('/');
}

/**
 * Wait for toast notification to appear
 */
export async function waitForToast(page: Page, message?: string) {
  const toast = page.locator('[role="status"], .toast, [data-testid="toast"]').first();
  await expect(toast).toBeVisible();
  
  if (message) {
    await expect(toast).toContainText(message);
  }
  
  return toast;
}

/**
 * Clear all form inputs in a container
 */
export async function clearForm(page: Page, containerSelector?: string) {
  const container = containerSelector 
    ? page.locator(containerSelector) 
    : page;
  
  const inputs = container.locator('input:not([type="submit"]):not([type="button"])');
  const count = await inputs.count();
  
  for (let i = 0; i < count; i++) {
    await inputs.nth(i).fill('');
  }
}

/**
 * Check if element exists (returns boolean instead of throwing)
 */
export async function elementExists(page: Page, selector: string): Promise<boolean> {
  return await page.locator(selector).count() > 0;
}

/**
 * Get text content of an element
 */
export async function getText(page: Page, selector: string): Promise<string | null> {
  return await page.locator(selector).textContent();
}

/**
 * Wait for API response
 */
export async function waitForApiResponse(page: Page, urlPattern: string) {
  return await page.waitForResponse(response => 
    response.url().includes(urlPattern)
  );
}
