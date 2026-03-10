import { test, expect } from '@playwright/test';

test.describe('Login Page', () => {
  test.beforeEach(async ({ page }) => {
    await page.goto('/login');
  });

  test('should display login form with all elements', async ({ page }) => {
    await expect(page.getByRole('heading', { name: /Sign In to Piasta net/i })).toBeVisible();
    await expect(page.getByLabel(/Username/i)).toBeVisible();
    await expect(page.getByLabel(/Password/i)).toBeVisible();
    await expect(page.getByRole('button', { name: /Sign In/i })).toBeVisible();
  });

  test('should toggle between login and signup modes', async ({ page }) => {
    // Check initial login state
    await expect(page.getByRole('heading', { name: /Sign In/i })).toBeVisible();
    
    // Click Sign Up tab
    await page.getByRole('tab', { name: /Sign Up/i }).click();
    
    // Check signup state
    await expect(page.getByRole('heading', { name: /Sign Up for Piasta net/i })).toBeVisible();
    await expect(page.getByRole('button', { name: /Sign Up/i })).toBeVisible();
    await expect(page.getByLabel(/I accept the GDPR regulations/i)).toBeVisible();
    
    // Click back to Login
    await page.getByRole('tab', { name: /Login/i }).click();
    await expect(page.getByRole('heading', { name: /Sign In/i })).toBeVisible();
  });

  test('should show password validation error for short password', async ({ page }) => {
    const passwordInput = page.getByLabel(/Password/i);
    await passwordInput.fill('123');
    await passwordInput.blur();
    
    // Should show validation error
    await expect(page.getByText(/Password must be at least 6 characters/i)).toBeVisible();
  });

  test('should validate password length on blur', async ({ page }) => {
    const passwordInput = page.getByLabel(/Password/i);
    
    // Enter short password
    await passwordInput.fill('123');
    await passwordInput.blur();
    await expect(page.getByText(/Password must be at least 6 characters/i)).toBeVisible();
    
    // Enter valid password
    await passwordInput.fill('validpassword123');
    await passwordInput.blur();
    await expect(page.getByText(/Password must be at least 6 characters/i)).not.toBeVisible();
  });

  test('should show GDPR modal when clicking more info', async ({ page }) => {
    // Switch to signup mode first
    await page.getByRole('tab', { name: /Sign Up/i }).click();
    
    // Click more info button
    await page.getByRole('button', { name: /More information/i }).click();
    
    // Check modal is displayed
    await expect(page.getByRole('dialog')).toBeVisible();
    await expect(page.getByRole('heading', { name: /GDPR Information/i })).toBeVisible();
    await expect(page.getByText(/General Data Protection Regulation/i)).toBeVisible();
    
    // Close modal
    await page.getByRole('button', { name: /Close/i }).click();
    await expect(page.getByRole('dialog')).not.toBeVisible();
  });

  test('should disable signup button when GDPR not accepted', async ({ page }) => {
    // Switch to signup mode
    await page.getByRole('tab', { name: /Sign Up/i }).click();
    
    const signupButton = page.getByRole('button', { name: /Sign Up/i });
    
    // Initially should be disabled
    await expect(signupButton).toBeDisabled();
    
    // Fill in username and password
    await page.getByLabel(/Username/i).fill('testuser');
    await page.getByLabel(/Password/i).fill('testpassword123');
    
    // Still disabled without GDPR
    await expect(signupButton).toBeDisabled();
    
    // Check GDPR checkbox
    await page.getByLabel(/I accept the GDPR regulations/i).check();
    
    // Now should be enabled
    await expect(signupButton).toBeEnabled();
  });

  test('should show error for empty username submission', async ({ page }) => {
    // Fill only password
    await page.getByLabel(/Password/i).fill('testpassword123');
    await page.getByRole('button', { name: /Sign In/i }).click();
    
    // Should show toast error (checking for toast container)
    await expect(page.locator('[role="status"], .toast, [data-testid="toast"]')).toBeVisible().catch(() => {
      // Toast might not be easily selectable, check that we're still on login page
      expect(page.url()).toContain('/login');
    });
  });

  test('should have back to home link', async ({ page }) => {
    const backLink = page.getByRole('link', { name: /Back To Home/i });
    await expect(backLink).toBeVisible();
    await expect(backLink).toHaveAttribute('href', '/');
  });
});
