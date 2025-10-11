// Test MTG Arena Collector app with Playwright
import { chromium } from 'playwright';

const APP_URL = 'http://localhost:5173';

async function testApp() {
  console.log('🚀 Starting Playwright test...\n');

  const browser = await chromium.launch({ headless: false });
  const context = await browser.newContext();
  const page = await context.newPage();

  try {
    // Step 1: Navigate to app
    console.log('📍 Step 1: Navigating to app...');
    await page.goto(APP_URL);
    await page.waitForLoadState('networkidle');
    console.log('✅ App loaded successfully\n');

    // Step 2: Check page title
    const title = await page.title();
    console.log(`📄 Page title: "${title}"\n`);

    // Step 3: Take screenshot of initial state
    await page.screenshot({ path: 'screenshots/01-initial-load.png', fullPage: true });
    console.log('📸 Screenshot saved: screenshots/01-initial-load.png\n');

    // Step 4: Check for authentication UI
    console.log('🔐 Step 2: Checking authentication state...');

    const hasSignInButton = await page.locator('button:has-text("Sign In"), button:has-text("sign in"), input[type="email"]').count() > 0;
    const hasSignOutButton = await page.locator('button:has-text("Sign Out"), button:has-text("sign out")').count() > 0;

    if (hasSignOutButton) {
      console.log('✅ User already signed in\n');
    } else if (hasSignInButton) {
      console.log('ℹ️  Sign in form detected\n');
      await page.screenshot({ path: 'screenshots/02-auth-screen.png', fullPage: true });
      console.log('📸 Screenshot saved: screenshots/02-auth-screen.png\n');
    } else {
      console.log('⚠️  No authentication UI found - checking if auth is disabled\n');
    }

    // Step 5: Check for console errors
    const consoleMessages = [];
    page.on('console', msg => {
      if (msg.type() === 'error') {
        consoleMessages.push(`❌ Console error: ${msg.text()}`);
      }
    });

    // Wait a bit to capture any async errors
    await page.waitForTimeout(2000);

    if (consoleMessages.length > 0) {
      console.log('🔴 Console Errors Found:\n');
      consoleMessages.forEach(msg => console.log(msg));
    } else {
      console.log('✅ No console errors detected\n');
    }

    // Step 6: Check main UI elements
    console.log('🔍 Step 3: Checking main UI elements...');
    const headerText = await page.locator('h1').first().textContent();
    console.log(`   Header: "${headerText}"`);

    const hasUploadArea = await page.locator('[role="button"], .dropzone, input[type="file"]').count() > 0;
    console.log(`   Upload area: ${hasUploadArea ? '✅ Found' : '❌ Not found'}`);

    // Step 7: Final screenshot
    await page.screenshot({ path: 'screenshots/03-final-state.png', fullPage: true });
    console.log('📸 Screenshot saved: screenshots/03-final-state.png\n');

    console.log('✅ Test completed successfully!\n');
    console.log('📁 Screenshots saved in: screenshots/\n');

  } catch (error) {
    console.error('❌ Test failed:', error);
    await page.screenshot({ path: 'screenshots/error.png', fullPage: true });
  } finally {
    // Keep browser open for manual inspection
    console.log('🔄 Browser will remain open for inspection...');
    console.log('Press Ctrl+C to close when done.\n');

    // Wait indefinitely
    await new Promise(() => {});
  }
}

// Run test
testApp().catch(console.error);
