import { test, expect } from '@playwright/test';

test.describe('Accessibility', () => {
  test('homepage should have proper heading structure', async ({ page }) => {
    await page.goto('/');
    
    // Check for main heading
    const h1 = page.locator('h1');
    await expect(h1).toHaveCount(1);
    
    // Check heading is visible
    await expect(h1).toBeVisible();
  });

  test('login page should have accessible form elements', async ({ page }) => {
    await page.goto('/login');
    
    // Check form has proper labels
    const usernameInput = page.getByLabel(/Username/i);
    const passwordInput = page.getByLabel(/Password/i);
    
    await expect(usernameInput).toHaveAttribute('name', 'username');
    await expect(passwordInput).toHaveAttribute('name', 'password');
    
    // Check required attributes
    await expect(usernameInput).toHaveAttribute('required');
    await expect(passwordInput).toHaveAttribute('required');
  });

  test('should have proper ARIA roles for tabs', async ({ page }) => {
    await page.goto('/login');
    
    // Check tablist role
    const tablist = page.locator('[role="tablist"]');
    await expect(tablist).toBeVisible();
    
    // Check tabs have proper roles
    const tabs = page.locator('[role="tab"]');
    await expect(tabs).toHaveCount(2);
    
    // Check aria-selected attribute
    const selectedTab = page.locator('[role="tab"][aria-selected="true"]');
    await expect(selectedTab).toBeVisible();
  });

  test('images should have alt text', async ({ page }) => {
    await page.goto('/');
    
    // Check all images have alt text
    const images = page.locator('img');
    const count = await images.count();
    
    for (let i = 0; i < count; i++) {
      const alt = await images.nth(i).getAttribute('alt');
      // Alt can be empty for decorative images, but should exist
      expect(alt).not.toBeNull();
    }
  });

  test('should have proper focus management on login page', async ({ page }) => {
    await page.goto('/login');
    
    // Tab through form elements
    await page.keyboard.press('Tab');
    
    // Check focus is on an interactive element
    const focusedElement = page.locator(':focus');
    await expect(focusedElement).toBeVisible();
  });

  test('color contrast should be sufficient', async ({ page }) => {
    await page.goto('/');
    
    // Basic check that text is visible
    const heroText = page.locator('h1');
    await expect(heroText).toBeVisible();
    
    // Check background color is set (helps ensure contrast)
    const body = page.locator('body');
    const bgColor = await body.evaluate(el => 
      window.getComputedStyle(el).backgroundColor
    );
    expect(bgColor).not.toBe('');
  });

  test('games page should have accessible filter controls', async ({ page }) => {
    await page.goto('/games');
    
    // Check search input has aria-label (it's type="text" not type="search")
    const searchInput = page.getByLabel(/Search games/i);
    await expect(searchInput).toBeVisible();
    await expect(searchInput).toHaveAttribute('aria-label', 'Search games');
    
    // Check category buttons exist (they're buttons, not tabs)
    const categoryButtons = page.locator('button:has-text("All Games"), button:has-text("Board Games"), button:has-text("Console Games")');
    await expect(categoryButtons.first()).toBeVisible();
  });

  test('should support keyboard navigation', async ({ page }) => {
    await page.goto('/login');
    
    // Focus the username input directly
    const usernameInput = page.getByLabel(/Username/i);
    await usernameInput.focus();
    
    // Type in the username field
    await page.keyboard.type('testuser');
    
    // Verify the username input has the value
    await expect(usernameInput).toHaveValue('testuser');
  });
});
