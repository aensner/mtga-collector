import { test as setup, expect } from '@playwright/test';
import path from 'path';
import fs from 'fs';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const authFile = path.join(__dirname, '../playwright/.auth/user.json');

setup('authenticate', async ({ page }) => {
  // Ensure .auth directory exists
  const authDir = path.dirname(authFile);
  if (!fs.existsSync(authDir)) {
    fs.mkdirSync(authDir, { recursive: true });
  }

  // Get test credentials from environment
  const testEmail = process.env.TEST_EMAIL || 'adrian.ensner+collectortest@gmail.com';
  const testPassword = process.env.TEST_PASSWORD || 'test1234';

  console.log(`🔐 Authenticating as: ${testEmail}`);

  // Navigate to app
  await page.goto('http://localhost:5173', { waitUntil: 'load' });

  // Wait a bit for the page to settle
  await page.waitForTimeout(1000);

  // Check if already signed in
  const signOutVisible = await page.getByRole('button', { name: /sign out/i }).isVisible().catch(() => false);

  if (signOutVisible) {
    console.log('✅ Already authenticated');
    await page.context().storageState({ path: authFile });
    return;
  }

  console.log('📝 Need to sign in...');

  // Try to fill and submit login form
  try {
    // Fill in credentials
    const emailInput = page.getByPlaceholder(/email/i).or(page.getByLabel(/email/i));
    const passwordInput = page.getByPlaceholder(/password/i).or(page.getByLabel(/password/i));

    await emailInput.fill(testEmail);
    await passwordInput.fill(testPassword);

    // Click sign in button
    const signInButton = page.getByRole('button', { name: /^sign in$/i });
    await signInButton.click();

    // Wait for navigation/authentication
    await page.waitForTimeout(3000);

    // Check if signed in now
    const isSignedIn = await page.getByRole('button', { name: /sign out/i }).isVisible({ timeout: 5000 }).catch(() => false);

    if (isSignedIn) {
      console.log('✅ Authentication successful');
      await page.context().storageState({ path: authFile });
      return;
    }

    console.log('⚠️ Sign in may have failed, but continuing...');
    await page.context().storageState({ path: authFile });

  } catch (error) {
    console.error('❌ Authentication error:', error);
    throw error;
  }
});
