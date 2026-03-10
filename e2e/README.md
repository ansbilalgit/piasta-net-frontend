# E2E Tests with Playwright

This directory contains end-to-end tests for the Piasta Net Frontend application using [Playwright](https://playwright.dev/).

## Test Structure

```
e2e/
├── homepage.spec.ts      # Homepage tests
├── navigation.spec.ts    # Navigation flow tests
├── login.spec.ts         # Authentication tests
├── games.spec.ts         # Games library tests
├── accessibility.spec.ts # Accessibility tests
└── README.md             # This file
```

## Running Tests

### Run all tests
```bash
npm run test:e2e
```

### Run tests with UI mode (for debugging)
```bash
npm run test:e2e:ui
```

### Run tests in debug mode
```bash
npm run test:e2e:debug
```

### View test report
```bash
npm run test:e2e:report
```

### Run specific test file
```bash
npx playwright test e2e/login.spec.ts
```

### Run tests in headed mode (see browser)
```bash
npx playwright test --headed
```

### Run tests on specific project (browser)
```bash
npx playwright test --project=chromium
npx playwright test --project="Mobile Chrome"
```

## Test Coverage

### Homepage Tests
- Hero section display
- CTA button functionality
- Next game night section
- Page title verification

### Navigation Tests
- Login page navigation
- Games page navigation
- Home navigation

### Login Tests
- Form element visibility
- Login/Signup mode toggle
- Password validation
- GDPR modal functionality
- Form validation

### Games Tests
- Library header display
- Filter tabs functionality
- Search functionality
- Sort options
- Duration and player filters
- Responsive design

### Accessibility Tests
- Heading structure
- Form labels
- ARIA roles
- Image alt text
- Keyboard navigation
- Focus management

## Configuration

The Playwright configuration is in `playwright.config.ts` at the project root:

- **Test directory**: `./e2e`
- **Base URL**: `http://localhost:3000`
- **Browsers**: Chromium (Desktop Chrome, Mobile Chrome)
- **Web server**: Automatically starts `npm run dev` before tests

## Writing New Tests

1. Create a new `.spec.ts` file in the `e2e/` directory
2. Import the test utilities:
   ```typescript
   import { test, expect } from '@playwright/test';
   ```
3. Use `test.describe()` to group related tests
4. Use `test.beforeEach()` for setup
5. Use page locators and assertions for test steps

Example:
```typescript
import { test, expect } from '@playwright/test';

test.describe('Feature Name', () => {
  test.beforeEach(async ({ page }) => {
    await page.goto('/route');
  });

  test('should do something', async ({ page }) => {
    await expect(page.getByRole('heading')).toBeVisible();
  });
});
```

## Best Practices

1. **Use role-based selectors**: `page.getByRole('button', { name: 'Submit' })`
2. **Add data-testid for complex selectors**: `<div data-testid="game-card">`
3. **Avoid hardcoded waits**: Use `await expect(...).toBeVisible()` instead of `await page.waitForTimeout()`
4. **Test user flows**: Test complete user journeys, not just individual elements
5. **Keep tests independent**: Each test should be able to run independently

## CI/CD Integration

Tests are configured to run in CI mode with:
- 2 retries on failure
- Parallel execution disabled
- Screenshots and videos on failure

Set `CI=true` environment variable to enable CI mode:
```bash
CI=true npm run test:e2e
```
