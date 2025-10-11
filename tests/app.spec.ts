import { test, expect } from '@playwright/test';

test.describe('MTG Arena Collector App', () => {
  test('should load the application', async ({ page }) => {
    await page.goto('http://localhost:5173');

    // Check page loaded
    await expect(page).toHaveTitle(/MTG|Arena|Collector/i);

    // Check header exists
    const header = page.locator('h1').first();
    await expect(header).toBeVisible();

    // Take screenshot
    await page.screenshot({ path: 'screenshots/01-app-loaded.png', fullPage: true });

    console.log('✅ App loaded successfully');
  });

  test('should show authentication UI', async ({ page }) => {
    await page.goto('http://localhost:5173');

    // Wait for page to load
    await page.waitForLoadState('networkidle');

    // Check for sign in or sign out button
    const hasAuth = await page.locator('button').filter({ hasText: /sign (in|out)/i }).count() > 0;

    expect(hasAuth).toBeTruthy();

    // Take screenshot
    await page.screenshot({ path: 'screenshots/02-auth-state.png', fullPage: true });

    console.log('✅ Authentication UI detected');
  });
});
