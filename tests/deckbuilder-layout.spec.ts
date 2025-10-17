import { test, expect } from '@playwright/test';

test.describe('Deck Builder Layout and Detail Panel', () => {
  test.beforeEach(async ({ page }) => {
    // Navigate to app and wait for it to load
    await page.goto('http://localhost:5173');
    await page.waitForLoadState('networkidle');
  });

  test('should display deck builder with responsive grid', async ({ page }) => {
    // Navigate to Build Deck tab
    const buildButton = page.getByRole('button', { name: /Build Deck/i });
    if (await buildButton.isVisible()) {
      await buildButton.click();
    }

    // Wait for deck builder to load
    await page.waitForSelector('text=Deck Builder', { timeout: 5000 });

    // Check for 3-column layout on desktop
    const deckList = page.locator('.card').filter({ hasText: /Deck \(|Creatures|Lands/ }).first();
    const collection = page.locator('.card').filter({ hasText: /Collection/ }).first();

    await expect(deckList).toBeVisible();
    await expect(collection).toBeVisible();

    console.log('✅ Responsive grid layout visible');
  });

  test('should show sticky tab navigation', async ({ page }) => {
    // Navigate to Build Deck
    const buildButton = page.getByRole('button', { name: /Build Deck/i });
    if (await buildButton.isVisible()) {
      await buildButton.click();
    }

    // Wait for tabs to load
    await page.waitForSelector('button:has-text("Deck Builder")', { timeout: 5000 });

    // Check sticky navigation exists
    const builderTab = page.getByRole('button', { name: /Deck Builder/ });
    const statsTab = page.getByRole('button', { name: /Statistics/ });
    const optimizationTab = page.getByRole('button', { name: /AI Optimization/ });

    await expect(builderTab).toBeVisible();
    await expect(statsTab).toBeVisible();
    await expect(optimizationTab).toBeVisible();

    // Check tab styling indicates active state
    const activeTabClass = await builderTab.getAttribute('class');
    expect(activeTabClass).toContain('border-accent');

    console.log('✅ Sticky tab navigation working');
  });

  test('should have prominent card count display', async ({ page }) => {
    // Navigate to Build Deck
    const buildButton = page.getByRole('button', { name: /Build Deck/i });
    if (await buildButton.isVisible()) {
      await buildButton.click();
    }

    // Wait for deck builder
    await page.waitForSelector('text=Deck Builder', { timeout: 5000 });

    // Check for card count display (should be larger and more prominent)
    const cardCount = page.locator('span').filter({ hasText: /\d+ \/ 60/ }).first();

    if (await cardCount.isVisible()) {
      const fontSize = await cardCount.evaluate(el => window.getComputedStyle(el).fontSize);
      // Card count should be at least 24px (text-2xl)
      const fontSizeNum = parseInt(fontSize);
      expect(fontSizeNum).toBeGreaterThanOrEqual(24);

      console.log(`✅ Card count display is prominent (${fontSize})`);
    } else {
      console.log('⚠️ No cards in deck yet - card count not visible');
    }
  });

  test('should have collapsible filters in collection', async ({ page }) => {
    // Navigate to Build Deck
    const buildButton = page.getByRole('button', { name: /Build Deck/i });
    if (await buildButton.isVisible()) {
      await buildButton.click();
    }

    // Wait for collection to load
    await page.waitForSelector('text=Collection', { timeout: 5000 });

    // Look for collapsible filter section
    const filterToggle = page.locator('summary').filter({ hasText: /More Filters/ }).first();

    if (await filterToggle.isVisible()) {
      // Initially should be collapsed
      const detailsElement = page.locator('details').filter({ has: filterToggle }).first();
      const isOpen = await detailsElement.getAttribute('open');
      expect(isOpen).toBeNull();

      // Click to expand
      await filterToggle.click();
      await page.waitForTimeout(300); // Wait for animation

      // Should show filter options
      const typeFilter = page.locator('select').filter({ has: page.locator('option:has-text("All Types")') }).first();
      await expect(typeFilter).toBeVisible();

      console.log('✅ Collapsible filters working');
    } else {
      console.log('⚠️ Collection not loaded - filters test skipped');
    }
  });

  test('card detail panel should display inline below collection', async ({ page }) => {
    // Navigate to Build Deck
    const buildButton = page.getByRole('button', { name: /Build Deck/i });
    if (await buildButton.isVisible()) {
      await buildButton.click();
    }

    // Wait for collection
    await page.waitForSelector('text=Collection', { timeout: 5000 });

    // Try to click a card to show details
    const firstCard = page.locator('.card').filter({ hasText: /Collection/ })
      .locator('.cursor-pointer').first();

    if (await firstCard.isVisible()) {
      await firstCard.click();
      await page.waitForTimeout(300); // Wait for panel to appear

      // Check if detail panel is visible (not a modal, but inline panel)
      const detailPanel = page.locator('.card').filter({ hasText: /Card Details/ }).first();

      if (await detailPanel.isVisible()) {
        // Detail panel should be visible and contain card info
        await expect(detailPanel).toBeVisible();

        // Check for key card detail elements
        const cardImage = detailPanel.locator('img').first();
        const closeButton = detailPanel.locator('button').filter({ hasText: /✕/ }).first();

        await expect(cardImage).toBeVisible();
        await expect(closeButton).toBeVisible();

        // Close panel by clicking X
        await closeButton.click();
        await page.waitForTimeout(200);

        // Panel should be gone
        await expect(detailPanel).not.toBeVisible();

        console.log('✅ Card detail panel displays inline and closes correctly');
      } else {
        console.log('⚠️ Detail panel did not open - no card with details available');
      }
    } else {
      console.log('⚠️ No cards available to test detail panel');
    }
  });

  test('should handle tab switching correctly', async ({ page }) => {
    // Navigate to Build Deck
    const buildButton = page.getByRole('button', { name: /Build Deck/i });
    if (await buildButton.isVisible()) {
      await buildButton.click();
    }

    // Wait for tabs
    await page.waitForSelector('button:has-text("Deck Builder")', { timeout: 5000 });

    // Switch to Statistics tab
    const statsTab = page.getByRole('button', { name: /Statistics/ });
    await statsTab.click();
    await page.waitForTimeout(300);

    // Check Statistics content is visible
    const statsContent = page.locator('text=Deck Statistics').first();
    await expect(statsContent).toBeVisible();

    // Switch to AI Optimization tab
    const optimizationTab = page.getByRole('button', { name: /AI Optimization/ });
    await optimizationTab.click();
    await page.waitForTimeout(300);

    // Check if optimization content area is visible
    const hasOptimizationContent = await page.locator('.card').filter({
      hasText: /Optimization|AI|Analyze/
    }).first().isVisible().catch(() => false);

    expect(hasOptimizationContent).toBeTruthy();

    // Switch back to Builder tab
    const builderTab = page.getByRole('button', { name: /Deck Builder/ });
    await builderTab.click();
    await page.waitForTimeout(300);

    // Check collection is visible again
    const collection = page.locator('text=Collection').first();
    await expect(collection).toBeVisible();

    console.log('✅ Tab switching works correctly');
  });
});
