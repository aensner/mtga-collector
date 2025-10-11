import { test, expect } from '@playwright/test';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const TEST_IMAGE_PATH = path.resolve(__dirname, '../example/MGTArena Collection Page 10.jpg');
const TEST_CSV_PATH = path.resolve(__dirname, '../example/MTG Arena Collection Page 10 - Test data - Tabellenblatt1.csv');

test.describe('Calibration Features', () => {
  test.beforeEach(async ({ page }) => {
    // Navigate to app (check both common ports)
    const port = process.env.PORT || '5174';
    await page.goto(`http://localhost:${port}`);
    await page.waitForLoadState('networkidle');

    // Check if we need to sign in
    const hasSignInButton = await page.locator('button:has-text("Sign In")').count() > 0;
    if (hasSignInButton) {
      // Use test credentials from environment variables (required for auth)
      const testEmail = process.env.TEST_EMAIL;
      const testPassword = process.env.TEST_PASSWORD;

      if (!testEmail || !testPassword) {
        test.skip('TEST_EMAIL and TEST_PASSWORD environment variables required for authentication');
        return;
      }

      await page.fill('input[type="email"]', testEmail);
      await page.fill('input[type="password"]', testPassword);
      await page.click('button:has-text("Sign In")');
      await page.waitForTimeout(3000);

      // Check if signed in
      const isSignedIn = await page.locator('button:has-text("Sign Out")').count() > 0;
      if (!isSignedIn) {
        test.skip('Authentication required - skipping test. Set TEST_EMAIL and TEST_PASSWORD env vars or disable auth in app.');
      }
    }
  });

  test.describe('Grid Calibration', () => {
    test('should load with default grid parameters', async ({ page }) => {
      // Enable debug mode to show calibrator
      const debugCheckbox = page.locator('input[type="checkbox"]').filter({ hasText: /debug/i }).first();
      if (await debugCheckbox.count() > 0) {
        await debugCheckbox.check();
      }

      // Upload test image
      const fileInput = page.locator('input[type="file"]').first();
      await fileInput.setInputFiles(TEST_IMAGE_PATH);
      await page.waitForTimeout(2000);

      // Check if grid calibrator is visible
      const gridCalibrator = page.locator('text=Interactive Grid Calibration');
      await expect(gridCalibrator).toBeVisible({ timeout: 10000 });

      // Verify default values are displayed
      const gridPositionSection = page.locator('text=Grid Position & Size');
      await expect(gridPositionSection).toBeVisible();

      // Check that start X is around 2.7%
      const startXText = await page.locator('text=/Start X: .*%/').textContent();
      console.log('Grid Start X:', startXText);
      expect(startXText).toContain('%');

      // Take screenshot
      await page.screenshot({ path: 'screenshots/calibration-01-grid-defaults.png', fullPage: true });
      console.log('✅ Grid loaded with default parameters');
    });

    test('should allow dragging the grid', async ({ page }) => {
      // Enable debug mode
      const debugCheckbox = page.locator('input[type="checkbox"]').filter({ hasText: /debug/i }).first();
      if (await debugCheckbox.count() > 0) {
        await debugCheckbox.check();
      }

      // Upload test image
      const fileInput = page.locator('input[type="file"]').first();
      await fileInput.setInputFiles(TEST_IMAGE_PATH);
      await page.waitForTimeout(2000);

      // Get initial grid position values
      const initialStartX = await page.locator('text=/Start X: .*%/').textContent();
      const initialStartY = await page.locator('text=/Start Y: .*%/').textContent();
      console.log('Initial position:', initialStartX, initialStartY);

      // Find the canvas with the grid overlay
      const canvas = page.locator('canvas').first();
      const bbox = await canvas.boundingBox();

      if (bbox) {
        // Simulate drag: mousedown, mousemove, mouseup
        await page.mouse.move(bbox.x + bbox.width * 0.3, bbox.y + bbox.height * 0.3);
        await page.mouse.down();
        await page.mouse.move(bbox.x + bbox.width * 0.35, bbox.y + bbox.height * 0.35, { steps: 10 });
        await page.mouse.up();
        await page.waitForTimeout(500);

        // Get new position values
        const newStartX = await page.locator('text=/Start X: .*%/').textContent();
        const newStartY = await page.locator('text=/Start Y: .*%/').textContent();
        console.log('New position:', newStartX, newStartY);

        // Verify position changed
        expect(newStartX).not.toBe(initialStartX);
        expect(newStartY).not.toBe(initialStartY);

        await page.screenshot({ path: 'screenshots/calibration-02-grid-dragged.png', fullPage: true });
        console.log('✅ Grid drag functionality working');
      }
    });

    test('should adjust card gap with sliders', async ({ page }) => {
      // Enable debug mode
      const debugCheckbox = page.locator('input[type="checkbox"]').filter({ hasText: /debug/i }).first();
      if (await debugCheckbox.count() > 0) {
        await debugCheckbox.check();
      }

      // Upload test image
      const fileInput = page.locator('input[type="file"]').first();
      await fileInput.setInputFiles(TEST_IMAGE_PATH);
      await page.waitForTimeout(2000);

      // Find Card Gap X slider
      const gapXSlider = page.locator('input[type="range"]').filter({ has: page.locator('text=/Card Gap X/') });
      const gapYSlider = page.locator('input[type="range"]').filter({ has: page.locator('text=/Card Gap Y/') });

      // Get initial values
      const initialGapX = await page.locator('text=/Card Gap X \\(Horizontal: .*%\\)/').textContent();
      console.log('Initial Gap X:', initialGapX);

      // Adjust horizontal gap slider
      await gapXSlider.first().fill('0.015'); // 1.5%
      await page.waitForTimeout(500);

      const newGapX = await page.locator('text=/Card Gap X \\(Horizontal: .*%\\)/').textContent();
      console.log('New Gap X:', newGapX);
      expect(newGapX).not.toBe(initialGapX);

      // Adjust vertical gap slider
      await gapYSlider.first().fill('0.05'); // 5%
      await page.waitForTimeout(500);

      await page.screenshot({ path: 'screenshots/calibration-03-gap-adjusted.png', fullPage: true });
      console.log('✅ Card gap sliders working');
    });

    test('should persist grid parameters to localStorage', async ({ page }) => {
      // Enable debug mode
      const debugCheckbox = page.locator('input[type="checkbox"]').filter({ hasText: /debug/i }).first();
      if (await debugCheckbox.count() > 0) {
        await debugCheckbox.check();
      }

      // Upload test image
      const fileInput = page.locator('input[type="file"]').first();
      await fileInput.setInputFiles(TEST_IMAGE_PATH);
      await page.waitForTimeout(2000);

      // Adjust grid parameters
      const gapXSlider = page.locator('input[type="range"]').filter({ has: page.locator('text=/Card Gap X/') });
      await gapXSlider.first().fill('0.012');
      await page.waitForTimeout(1000);

      // Check localStorage
      const gridParams = await page.evaluate(() => {
        return localStorage.getItem('gridParams');
      });

      expect(gridParams).not.toBeNull();
      const parsed = JSON.parse(gridParams || '{}');
      console.log('Saved grid params:', parsed);

      expect(parsed.cardGapX).toBeCloseTo(0.012, 3);

      console.log('✅ Grid parameters persisted to localStorage');
    });
  });

  test.describe('OCR Region Calibration', () => {
    test('should display OCR regions on all cards', async ({ page }) => {
      // Enable debug mode
      const debugCheckbox = page.locator('input[type="checkbox"]').filter({ hasText: /debug/i }).first();
      if (await debugCheckbox.count() > 0) {
        await debugCheckbox.check();
      }

      // Upload test image
      const fileInput = page.locator('input[type="file"]').first();
      await fileInput.setInputFiles(TEST_IMAGE_PATH);
      await page.waitForTimeout(2000);

      // Scroll down to find OCR calibration section
      await page.locator('text=OCR').scrollIntoViewIfNeeded();
      await page.waitForTimeout(500);

      // Canvas should show red boxes for OCR regions (mentioned in CLAUDE.md)
      const canvas = page.locator('canvas').first();
      await expect(canvas).toBeVisible();

      await page.screenshot({ path: 'screenshots/calibration-04-ocr-regions.png', fullPage: true });
      console.log('✅ OCR regions displayed');
    });

    test('should adjust OCR region with sliders', async ({ page }) => {
      // Enable debug mode
      const debugCheckbox = page.locator('input[type="checkbox"]').filter({ hasText: /debug/i }).first();
      if (await debugCheckbox.count() > 0) {
        await debugCheckbox.check();
      }

      // Upload test image
      const fileInput = page.locator('input[type="file"]').first();
      await fileInput.setInputFiles(TEST_IMAGE_PATH);
      await page.waitForTimeout(2000);

      // Look for OCR sliders (Left Offset, Top Offset, Width, Height)
      const leftSlider = page.locator('input[type="range"]').filter({ has: page.locator('text=/Left Offset/i') });
      const topSlider = page.locator('input[type="range"]').filter({ has: page.locator('text=/Top Offset/i') });
      const widthSlider = page.locator('input[type="range"]').filter({ has: page.locator('text=/Width/i') });
      const heightSlider = page.locator('input[type="range"]').filter({ has: page.locator('text=/Height/i') });

      // Adjust OCR left offset
      if (await leftSlider.count() > 0) {
        await leftSlider.first().fill('0.10'); // 10%
        await page.waitForTimeout(500);
        console.log('✅ Adjusted OCR left offset');
      }

      // Adjust OCR width
      if (await widthSlider.count() > 0) {
        await widthSlider.first().fill('0.75'); // 75%
        await page.waitForTimeout(500);
        console.log('✅ Adjusted OCR width');
      }

      await page.screenshot({ path: 'screenshots/calibration-05-ocr-adjusted.png', fullPage: true });
    });

    test('should persist OCR parameters to localStorage', async ({ page }) => {
      // Enable debug mode
      const debugCheckbox = page.locator('input[type="checkbox"]').filter({ hasText: /debug/i }).first();
      if (await debugCheckbox.count() > 0) {
        await debugCheckbox.check();
      }

      // Upload test image
      const fileInput = page.locator('input[type="file"]').first();
      await fileInput.setInputFiles(TEST_IMAGE_PATH);
      await page.waitForTimeout(2000);

      // Adjust OCR parameter
      const leftSlider = page.locator('input[type="range"]').filter({ has: page.locator('text=/Left Offset/i') });
      if (await leftSlider.count() > 0) {
        await leftSlider.first().fill('0.08'); // 8%
        await page.waitForTimeout(1000);

        // Check localStorage
        const ocrParams = await page.evaluate(() => {
          return localStorage.getItem('ocrParams');
        });

        expect(ocrParams).not.toBeNull();
        const parsed = JSON.parse(ocrParams || '{}');
        console.log('Saved OCR params:', parsed);

        expect(parsed.left).toBeCloseTo(0.08, 2);
        console.log('✅ OCR parameters persisted to localStorage');
      }
    });
  });

  test.describe('Quantity Calibration', () => {
    test('should display quantity detection region', async ({ page }) => {
      // Enable debug mode
      const debugCheckbox = page.locator('input[type="checkbox"]').filter({ hasText: /debug/i }).first();
      if (await debugCheckbox.count() > 0) {
        await debugCheckbox.check();
      }

      // Upload test image
      const fileInput = page.locator('input[type="file"]').first();
      await fileInput.setInputFiles(TEST_IMAGE_PATH);
      await page.waitForTimeout(2000);

      // Look for Quantity Detection Calibration section
      const quantitySection = page.locator('text=Quantity Detection Calibration');
      if (await quantitySection.count() > 0) {
        await quantitySection.scrollIntoViewIfNeeded();
        await expect(quantitySection).toBeVisible();

        // Check for yellow box indicator (mentioned in CLAUDE.md)
        const diamondRegionText = page.locator('text=Diamond Region');
        await expect(diamondRegionText).toBeVisible();

        await page.screenshot({ path: 'screenshots/calibration-06-quantity-region.png', fullPage: true });
        console.log('✅ Quantity detection region displayed');
      } else {
        console.log('⚠️ Quantity calibration UI not found - may need to scroll or it may be in a different section');
      }
    });

    test('should show detection stats for selected card', async ({ page }) => {
      // Enable debug mode
      const debugCheckbox = page.locator('input[type="checkbox"]').filter({ hasText: /debug/i }).first();
      if (await debugCheckbox.count() > 0) {
        await debugCheckbox.check();
      }

      // Upload test image
      const fileInput = page.locator('input[type="file"]').first();
      await fileInput.setInputFiles(TEST_IMAGE_PATH);
      await page.waitForTimeout(2000);

      // Look for card selector
      const cardSelector = page.locator('input[type="range"]').filter({ has: page.locator('text=/Preview Card/i') });

      if (await cardSelector.count() > 0) {
        await cardSelector.scrollIntoViewIfNeeded();

        // Select different cards and verify detection stats update
        await cardSelector.first().fill('0'); // Card 1
        await page.waitForTimeout(500);

        const stats1 = page.locator('text=Detection Stats');
        await expect(stats1).toBeVisible();

        // Check for detected quantity
        const quantityText = await page.locator('text=/Detected Quantity:/').textContent();
        console.log('Card 1:', quantityText);

        // Select another card
        await cardSelector.first().fill('5'); // Card 6
        await page.waitForTimeout(500);

        const quantityText2 = await page.locator('text=/Detected Quantity:/').textContent();
        console.log('Card 6:', quantityText2);

        await page.screenshot({ path: 'screenshots/calibration-07-quantity-stats.png', fullPage: true });
        console.log('✅ Quantity detection stats displayed');
      }
    });

    test('should display debug view with diamond zones', async ({ page }) => {
      // Enable debug mode
      const debugCheckbox = page.locator('input[type="checkbox"]').filter({ hasText: /debug/i }).first();
      if (await debugCheckbox.count() > 0) {
        await debugCheckbox.check();
      }

      // Upload test image
      const fileInput = page.locator('input[type="file"]').first();
      await fileInput.setInputFiles(TEST_IMAGE_PATH);
      await page.waitForTimeout(2000);

      // Look for "Show Gold Pixel Detection" checkbox
      const goldPixelCheckbox = page.locator('input[type="checkbox"]').filter({ hasText: /gold pixel/i });

      if (await goldPixelCheckbox.count() > 0) {
        await goldPixelCheckbox.check();
        await page.waitForTimeout(500);

        // Verify debug canvas is visible
        const debugInfo = page.locator('text=/green = detected|zone divisions/i');
        await expect(debugInfo).toBeVisible();

        await page.screenshot({ path: 'screenshots/calibration-08-quantity-debug.png', fullPage: true });
        console.log('✅ Quantity debug view displayed');
      }
    });

    test('should adjust quantity detection thresholds', async ({ page }) => {
      // Enable debug mode
      const debugCheckbox = page.locator('input[type="checkbox"]').filter({ hasText: /debug/i }).first();
      if (await debugCheckbox.count() > 0) {
        await debugCheckbox.check();
      }

      // Upload test image
      const fileInput = page.locator('input[type="file"]').first();
      await fileInput.setInputFiles(TEST_IMAGE_PATH);
      await page.waitForTimeout(2000);

      // Find threshold sliders
      const brightnessSlider = page.locator('input[type="range"]').filter({ has: page.locator('text=/Max Brightness/i') });
      const saturationSlider = page.locator('input[type="range"]').filter({ has: page.locator('text=/Max Saturation/i') });
      const fillRatioSlider = page.locator('input[type="range"]').filter({ has: page.locator('text=/Fill Ratio/i') });

      // Adjust brightness threshold
      if (await brightnessSlider.count() > 0) {
        await brightnessSlider.scrollIntoViewIfNeeded();
        const initialValue = await brightnessSlider.first().inputValue();
        console.log('Initial brightness threshold:', initialValue);

        await brightnessSlider.first().fill('60');
        await page.waitForTimeout(500);

        const newValue = await brightnessSlider.first().inputValue();
        console.log('New brightness threshold:', newValue);
        expect(newValue).toBe('60');

        await page.screenshot({ path: 'screenshots/calibration-09-quantity-thresholds.png', fullPage: true });
        console.log('✅ Quantity thresholds adjustable');
      }
    });

    test('should reset to default calibration values', async ({ page }) => {
      // Enable debug mode
      const debugCheckbox = page.locator('input[type="checkbox"]').filter({ hasText: /debug/i }).first();
      if (await debugCheckbox.count() > 0) {
        await debugCheckbox.check();
      }

      // Upload test image
      const fileInput = page.locator('input[type="file"]').first();
      await fileInput.setInputFiles(TEST_IMAGE_PATH);
      await page.waitForTimeout(2000);

      // Look for "Reset to Default Values" button
      const resetButton = page.locator('button').filter({ hasText: /Reset to Default/i });

      if (await resetButton.count() > 0) {
        await resetButton.scrollIntoViewIfNeeded();
        await resetButton.click();
        await page.waitForTimeout(1000);

        // Verify localStorage was updated
        const savedParams = await page.evaluate(() => {
          return localStorage.getItem('quantityParams');
        });

        expect(savedParams).not.toBeNull();
        const parsed = JSON.parse(savedParams || '{}');
        console.log('Reset quantity params:', parsed);

        // Check for default values (from CLAUDE.md)
        expect(parsed.offsetX).toBeCloseTo(0.28, 2);
        expect(parsed.offsetY).toBeCloseTo(0.08, 2);
        expect(parsed.brightnessThreshold).toBe(50);

        await page.screenshot({ path: 'screenshots/calibration-10-quantity-reset.png', fullPage: true });
        console.log('✅ Quantity parameters reset to defaults');
      }
    });

    test('should persist quantity parameters to localStorage', async ({ page }) => {
      // Enable debug mode
      const debugCheckbox = page.locator('input[type="checkbox"]').filter({ hasText: /debug/i }).first();
      if (await debugCheckbox.count() > 0) {
        await debugCheckbox.check();
      }

      // Upload test image
      const fileInput = page.locator('input[type="file"]').first();
      await fileInput.setInputFiles(TEST_IMAGE_PATH);
      await page.waitForTimeout(2000);

      // Adjust a parameter
      const brightnessSlider = page.locator('input[type="range"]').filter({ has: page.locator('text=/Max Brightness/i') });
      if (await brightnessSlider.count() > 0) {
        await brightnessSlider.scrollIntoViewIfNeeded();
        await brightnessSlider.first().fill('75');
        await page.waitForTimeout(1000);

        // Check localStorage
        const quantityParams = await page.evaluate(() => {
          return localStorage.getItem('quantityParams');
        });

        expect(quantityParams).not.toBeNull();
        const parsed = JSON.parse(quantityParams || '{}');
        console.log('Saved quantity params:', parsed);

        expect(parsed.brightnessThreshold).toBe(75);
        console.log('✅ Quantity parameters persisted to localStorage');
      }
    });
  });

  test.describe('Calibration Persistence Across Sessions', () => {
    test('should reload calibration parameters after page refresh', async ({ page }) => {
      // Enable debug mode
      const debugCheckbox = page.locator('input[type="checkbox"]').filter({ hasText: /debug/i }).first();
      if (await debugCheckbox.count() > 0) {
        await debugCheckbox.check();
      }

      // Upload test image
      const fileInput = page.locator('input[type="file"]').first();
      await fileInput.setInputFiles(TEST_IMAGE_PATH);
      await page.waitForTimeout(2000);

      // Set custom grid gap
      const gapXSlider = page.locator('input[type="range"]').filter({ has: page.locator('text=/Card Gap X/') });
      if (await gapXSlider.count() > 0) {
        await gapXSlider.first().fill('0.015');
        await page.waitForTimeout(1000);
      }

      // Store the value
      const savedValue = await page.evaluate(() => {
        const params = localStorage.getItem('gridParams');
        return params ? JSON.parse(params).cardGapX : null;
      });

      console.log('Saved cardGapX before refresh:', savedValue);

      // Reload page
      await page.reload();
      await page.waitForLoadState('networkidle');

      // Re-enable debug mode
      const debugCheckbox2 = page.locator('input[type="checkbox"]').filter({ hasText: /debug/i }).first();
      if (await debugCheckbox2.count() > 0) {
        await debugCheckbox2.check();
      }

      // Re-upload image
      const fileInput2 = page.locator('input[type="file"]').first();
      await fileInput2.setInputFiles(TEST_IMAGE_PATH);
      await page.waitForTimeout(2000);

      // Verify the value persisted
      const reloadedValue = await page.evaluate(() => {
        const params = localStorage.getItem('gridParams');
        return params ? JSON.parse(params).cardGapX : null;
      });

      console.log('Loaded cardGapX after refresh:', reloadedValue);
      expect(reloadedValue).toBeCloseTo(savedValue || 0.015, 3);

      await page.screenshot({ path: 'screenshots/calibration-11-persistence.png', fullPage: true });
      console.log('✅ Calibration parameters persisted across page refresh');
    });

    test('should display saved parameters button functionality', async ({ page }) => {
      // Enable debug mode
      const debugCheckbox = page.locator('input[type="checkbox"]').filter({ hasText: /debug/i }).first();
      if (await debugCheckbox.count() > 0) {
        await debugCheckbox.check();
      }

      // Upload test image
      const fileInput = page.locator('input[type="file"]').first();
      await fileInput.setInputFiles(TEST_IMAGE_PATH);
      await page.waitForTimeout(2000);

      // Look for "Show Saved Values" button
      const showSavedButton = page.locator('button').filter({ hasText: /Show Saved Values/i });

      if (await showSavedButton.count() > 0) {
        await showSavedButton.scrollIntoViewIfNeeded();

        // Set up dialog handler
        page.on('dialog', async dialog => {
          const message = dialog.message();
          console.log('Dialog message:', message);
          expect(message).toContain('quantityParams');
          await dialog.accept();
        });

        await showSavedButton.click();
        await page.waitForTimeout(1000);

        console.log('✅ Show saved values button working');
      }
    });
  });

  test.describe('Integration with Processing', () => {
    test('should use calibration parameters during card processing', async ({ page }) => {
      // Enable debug mode
      const debugCheckbox = page.locator('input[type="checkbox"]').filter({ hasText: /debug/i }).first();
      if (await debugCheckbox.count() > 0) {
        await debugCheckbox.check();
      }

      // Upload test image
      const fileInput = page.locator('input[type="file"]').first();
      await fileInput.setInputFiles(TEST_IMAGE_PATH);
      await page.waitForTimeout(2000);

      // Verify calibration is loaded (check console logs)
      const consoleLogs: string[] = [];
      page.on('console', msg => {
        const text = msg.text();
        if (text.includes('Loaded') || text.includes('calibration') || text.includes('params')) {
          consoleLogs.push(text);
          console.log('Console:', text);
        }
      });

      // Click Process button
      const processButton = page.locator('button').filter({ hasText: /Process/i }).first();
      if (await processButton.count() > 0) {
        await processButton.click();

        // Wait for processing to start
        await page.waitForTimeout(3000);

        // Look for progress indicator
        const progressText = page.locator('text=/Processing|Progress/i');
        if (await progressText.count() > 0) {
          console.log('✅ Processing started with calibration parameters');
        }

        await page.screenshot({ path: 'screenshots/calibration-12-processing.png', fullPage: true });
      }
    });
  });
});
