import { test, expect } from '@playwright/test';

test.describe('Settings Feature', () => {
  test.use({ storageState: 'playwright/.auth/user.json' });

  test('should open settings modal when clicking Settings button', async ({ page }) => {
    console.log('🧪 Testing settings button functionality...');

    // Navigate to app
    await page.goto('http://localhost:5173');

    // Wait for page to load
    await page.waitForLoadState('networkidle');

    // Verify we're signed in
    await expect(page.getByRole('button', { name: /sign out/i })).toBeVisible();

    // Take screenshot before clicking settings
    await page.screenshot({ path: 'screenshots/settings-before.png', fullPage: true });

    // Find and click the Settings button
    const settingsButton = page.getByRole('button', { name: /settings/i });
    await expect(settingsButton).toBeVisible({ timeout: 5000 });

    console.log('✅ Settings button is visible');

    await settingsButton.click();

    // Wait for modal to appear
    await page.waitForTimeout(500);

    // Check if modal is visible by looking for the modal heading
    const modalHeading = page.getByRole('heading', { name: /⚙️ Settings/i });
    await expect(modalHeading).toBeVisible({ timeout: 5000 });

    console.log('✅ Settings modal opened successfully');

    // Take screenshot with modal open
    await page.screenshot({ path: 'screenshots/settings-modal-open.png', fullPage: true });
  });

  test('should have API Keys and Preferences tabs', async ({ page }) => {
    console.log('🧪 Testing settings modal tabs...');

    await page.goto('http://localhost:5173');
    await page.waitForLoadState('networkidle');

    // Open settings modal
    await page.getByRole('button', { name: /settings/i }).click();
    await page.waitForTimeout(500);

    // Check API Keys tab
    const apiKeysTab = page.getByRole('button', { name: /🔑 API Keys/i });
    await expect(apiKeysTab).toBeVisible();

    // Check Preferences tab
    const preferencesTab = page.getByRole('button', { name: /🎨 Preferences/i });
    await expect(preferencesTab).toBeVisible();

    console.log('✅ Both tabs are visible');

    // Take screenshot
    await page.screenshot({ path: 'screenshots/settings-tabs.png', fullPage: true });
  });

  test('should display API key input fields', async ({ page }) => {
    console.log('🧪 Testing API key input fields...');

    await page.goto('http://localhost:5173');
    await page.waitForLoadState('networkidle');

    // Open settings modal
    await page.getByRole('button', { name: /settings/i }).click();
    await page.waitForTimeout(500);

    // Ensure we're on API Keys tab
    const apiKeysTab = page.getByRole('button', { name: /🔑 API Keys/i });
    await apiKeysTab.click();

    // Check for OpenAI API Key input
    const openAILabel = page.getByText(/OpenAI API Key/i);
    await expect(openAILabel).toBeVisible();

    // Check for Anthropic API Key input
    const anthropicLabel = page.getByText(/Anthropic API Key/i);
    await expect(anthropicLabel).toBeVisible();

    // Check for AI Provider Preference dropdown
    const providerLabel = page.getByText(/Preferred AI Provider/i);
    await expect(providerLabel).toBeVisible();

    console.log('✅ All API key fields are visible');

    // Take screenshot
    await page.screenshot({ path: 'screenshots/settings-api-keys.png', fullPage: true });
  });

  test('should display preferences options', async ({ page }) => {
    console.log('🧪 Testing preferences options...');

    await page.goto('http://localhost:5173');
    await page.waitForLoadState('networkidle');

    // Open settings modal
    await page.getByRole('button', { name: /settings/i }).click();
    await page.waitForTimeout(500);

    // Click Preferences tab
    const preferencesTab = page.getByRole('button', { name: /🎨 Preferences/i });
    await preferencesTab.click();
    await page.waitForTimeout(300);

    // Check for Default Deck Format
    const deckFormatLabel = page.getByText(/Default Deck Format/i);
    await expect(deckFormatLabel).toBeVisible();

    // Check for Cards Per Page
    const cardsPerPageLabel = page.getByText(/Cards Per Page/i);
    await expect(cardsPerPageLabel).toBeVisible();

    // Check for Theme
    const themeLabel = page.getByText(/^Theme$/i);
    await expect(themeLabel).toBeVisible();

    console.log('✅ All preference options are visible');

    // Take screenshot
    await page.screenshot({ path: 'screenshots/settings-preferences.png', fullPage: true });
  });

  test('should close modal when clicking Cancel', async ({ page }) => {
    console.log('🧪 Testing modal close functionality...');

    await page.goto('http://localhost:5173');
    await page.waitForLoadState('networkidle');

    // Open settings modal
    await page.getByRole('button', { name: /settings/i }).click();
    await page.waitForTimeout(500);

    // Verify modal is open
    await expect(page.getByRole('heading', { name: /⚙️ Settings/i })).toBeVisible();

    // Click Cancel button
    const cancelButton = page.getByRole('button', { name: /^Cancel$/i });
    await expect(cancelButton).toBeVisible();
    await cancelButton.click();

    // Wait for modal to close
    await page.waitForTimeout(500);

    // Verify modal is closed
    const modalHeading = page.getByRole('heading', { name: /⚙️ Settings/i });
    await expect(modalHeading).not.toBeVisible();

    console.log('✅ Modal closed successfully');

    // Take screenshot
    await page.screenshot({ path: 'screenshots/settings-modal-closed.png', fullPage: true });
  });

  test('should close modal when clicking X button', async ({ page }) => {
    console.log('🧪 Testing modal X button...');

    await page.goto('http://localhost:5173');
    await page.waitForLoadState('networkidle');

    // Open settings modal
    await page.getByRole('button', { name: /settings/i }).click();
    await page.waitForTimeout(500);

    // Verify modal is open
    await expect(page.getByRole('heading', { name: /⚙️ Settings/i })).toBeVisible();

    // Click X button (the × close button)
    const closeButton = page.getByText('×').first();
    await expect(closeButton).toBeVisible();
    await closeButton.click();

    // Wait for modal to close
    await page.waitForTimeout(500);

    // Verify modal is closed
    const modalHeading = page.getByRole('heading', { name: /⚙️ Settings/i });
    await expect(modalHeading).not.toBeVisible();

    console.log('✅ X button closed modal successfully');
  });

  test('should toggle password visibility', async ({ page }) => {
    console.log('🧪 Testing password visibility toggle...');

    await page.goto('http://localhost:5173');
    await page.waitForLoadState('networkidle');

    // Open settings modal
    await page.getByRole('button', { name: /settings/i }).click();
    await page.waitForTimeout(500);

    // Find the first password input (OpenAI)
    const passwordInputs = page.locator('input[type="password"]');
    const count = await passwordInputs.count();

    if (count > 0) {
      // Get the first eye icon button
      const eyeButton = page.locator('button').filter({ hasText: /👁️/ }).first();
      await expect(eyeButton).toBeVisible();

      // Click to show password
      await eyeButton.click();
      await page.waitForTimeout(300);

      // Verify input type changed to text
      const textInputs = page.locator('input[type="text"]').filter({ has: page.locator('input[placeholder*="sk-"]') });
      const textCount = await textInputs.count();

      expect(textCount).toBeGreaterThan(0);

      console.log('✅ Password visibility toggle works');

      // Take screenshot
      await page.screenshot({ path: 'screenshots/settings-password-visible.png', fullPage: true });
    } else {
      console.log('ℹ️ No password fields found (may already be empty)');
    }
  });

  test('should have Save Settings button', async ({ page }) => {
    console.log('🧪 Testing Save Settings button...');

    await page.goto('http://localhost:5173');
    await page.waitForLoadState('networkidle');

    // Open settings modal
    await page.getByRole('button', { name: /settings/i }).click();
    await page.waitForTimeout(500);

    // Check for Save Settings button
    const saveButton = page.getByRole('button', { name: /Save Settings/i });
    await expect(saveButton).toBeVisible();
    await expect(saveButton).toBeEnabled();

    console.log('✅ Save Settings button is visible and enabled');

    // Take screenshot
    await page.screenshot({ path: 'screenshots/settings-save-button.png', fullPage: true });
  });
});
