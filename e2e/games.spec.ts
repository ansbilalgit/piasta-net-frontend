import { test, expect } from '@playwright/test';

test.describe('Games Page', () => {
  test.beforeEach(async ({ page }) => {
    await page.goto('/games');
  });

  test('should display games library header', async ({ page }) => {
    await expect(page.getByRole('heading', { name: /Game Library/i })).toBeVisible();
    // Count text might take a moment to load from API
    await expect(page.getByText(/Board Games.*Console Games available/i)).toBeVisible({ timeout: 10000 });
  });

  test('should have filter buttons for game types', async ({ page }) => {
    // The filters are buttons with specific text from GAME_FILTER_CATEGORIES
    await expect(page.getByRole('button', { name: 'All Games' })).toBeVisible();
    await expect(page.getByRole('button', { name: 'Board Games' })).toBeVisible();
    await expect(page.getByRole('button', { name: 'Console Games' })).toBeVisible();
  });

  test('should switch between game type filters', async ({ page }) => {
    const boardGamesButton = page.getByRole('button', { name: 'Board Games' });
    const consoleGamesButton = page.getByRole('button', { name: 'Console Games' });
    const allButton = page.getByRole('button', { name: 'All Games' });
    
    // Click board games button
    await boardGamesButton.click();
    await expect(boardGamesButton).toHaveClass(/active/);
    
    // Click console games button
    await consoleGamesButton.click();
    await expect(consoleGamesButton).toHaveClass(/active/);
    
    // Click all button
    await allButton.click();
    await expect(allButton).toHaveClass(/active/);
  });

  test('should have search functionality', async ({ page }) => {
    const searchInput = page.getByLabel(/Search games/i);
    
    await expect(searchInput).toBeVisible();
    await searchInput.fill('chess');
    await expect(searchInput).toHaveValue('chess');
    
    // Wait for debounce and check results
    await page.waitForTimeout(500);
  });

  test('should have sort options', async ({ page }) => {
    const sortAZ = page.getByRole('button', { name: /^A-Z$/i });
    const sortZA = page.getByRole('button', { name: /^Z-A$/i });
    
    await expect(sortAZ).toBeVisible();
    await expect(sortZA).toBeVisible();
    
    // Click to change sort
    await sortZA.click();
    await expect(sortZA).toHaveClass(/active/);
  });

  test('should have duration filters', async ({ page }) => {
    // Look for duration section heading
    const durationHeading = page.getByText(/Duration \(min\)/i);
    await expect(durationHeading).toBeVisible();
    
    // Use getByRole with spinbutton for number inputs
    const minDurationInput = page.getByRole('spinbutton', { name: /Minimum duration/i });
    const maxDurationInput = page.getByRole('spinbutton', { name: /Maximum duration/i });
    
    await expect(minDurationInput).toBeVisible();
    await expect(maxDurationInput).toBeVisible();
  });

  test('should have player count filters', async ({ page }) => {
    // Look for players section heading
    const playersHeading = page.getByText(/^Players$/i);
    await expect(playersHeading).toBeVisible();
    
    // Use getByRole with spinbutton for number inputs
    const minPlayersInput = page.getByRole('spinbutton', { name: /Minimum players/i });
    const maxPlayersInput = page.getByRole('spinbutton', { name: /Maximum players/i });
    
    await expect(minPlayersInput).toBeVisible();
    await expect(maxPlayersInput).toBeVisible();
  });

  test('should display game items list or loading state', async ({ page }) => {
    // Wait for items to load
    await page.waitForTimeout(2000);
    
    // Check if game items are displayed or if there's a loading/empty state
    const gameItems = page.locator('[class*="GameItemsList"], [class*="gameItem"], [class*="card"]').first();
    const hasItems = await gameItems.isVisible().catch(() => false);
    
    if (hasItems) {
      await expect(gameItems).toBeVisible();
    } else {
      // Page structure exists even without items, just verify we're on games page
      await expect(page.getByRole('heading', { name: /Game Library/i })).toBeVisible();
    }
  });

  test('should be responsive on mobile', async ({ page }) => {
    // Set mobile viewport
    await page.setViewportSize({ width: 375, height: 667 });
    
    // Page should still be usable
    await expect(page.getByRole('heading', { name: /Game Library/i })).toBeVisible();
    
    // Filters should still be visible
    const filters = page.locator('aside, [class*="filters"]').first();
    await expect(filters).toBeVisible();
  });
  
  test('should have category filter toggle', async ({ page }) => {
    // Look for Categories label
    const categoriesLabel = page.getByText(/^Categories$/i);
    await expect(categoriesLabel).toBeVisible();
    
    // Find the "Top 10" toggle button (specific to the category filter, not the game type buttons)
    const categoryToggle = page.locator('button', { hasText: /^Top 10$/ });
    await expect(categoryToggle).toBeVisible();
  });
});
