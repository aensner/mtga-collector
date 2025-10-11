# Test Suite Documentation

This directory contains automated tests for the MTGA Collection Scanner application using Playwright.

## Test Files

### 1. `app.spec.ts`
Basic application tests verifying:
- Application loads correctly
- Authentication UI is present

### 2. `database.spec.ts`
Database integration tests covering:
- User sign up and authentication flow
- Database persistence
- Calibration settings storage
- Collection data operations

### 3. `calibration.spec.ts` (NEW)
Comprehensive calibration feature tests organized into 5 main sections:

#### Grid Calibration Tests
- **Default parameters loading**: Verifies grid starts with calibrated defaults (2.7% start X, 19.3% start Y, etc.)
- **Drag functionality**: Tests interactive grid repositioning
- **Card gap adjustment**: Tests horizontal and vertical spacing sliders
- **localStorage persistence**: Verifies grid parameters are saved

#### OCR Region Calibration Tests
- **OCR region display**: Verifies red boxes showing name detection areas on all 36 cards
- **Region adjustment**: Tests Left Offset, Top Offset, Width, and Height sliders
- **localStorage persistence**: Verifies OCR parameters are saved

#### Quantity Calibration Tests
- **Detection region display**: Verifies yellow box showing diamond detection area
- **Card selection**: Tests switching between cards (1-36) to preview detection
- **Detection stats**: Verifies quantity detection output and diamond fill status
- **Debug view**: Tests zoomed pixel view with zone divisions
- **Threshold adjustment**: Tests brightness, saturation, and fill ratio sliders
- **Reset to defaults**: Tests "Reset to Default Values" button functionality
- **localStorage persistence**: Verifies quantity parameters are saved

#### Persistence Across Sessions Tests
- **Page refresh**: Verifies calibration parameters survive page reloads
- **Show saved values**: Tests localStorage inspection button

#### Integration Tests
- **Processing with calibration**: Verifies OCR uses calibrated parameters during card processing

## Test Data

The tests use real example data located in the `example/` directory:
- **Screenshot**: `MGTArena Collection Page 10.jpg`
- **Ground truth CSV**: `MTG Arena Collection Page 10 - Test data - Tabellenblatt1.csv`

This CSV contains 36 cards with known correct names and quantities for accuracy validation.

## Running Tests

### Prerequisites
1. Install dependencies: `npm install`
2. Install Playwright browsers: `npx playwright install`
3. Start dev server: `npm run dev` (default port 5173, or 5174 if 5173 is busy)
4. Set up authentication credentials (see Environment Variables section below)

### Run All Tests
```bash
npx playwright test
```

### Run Specific Test File
```bash
# Calibration tests (requires authentication)
TEST_EMAIL="your-email+calibtest@gmail.com" TEST_PASSWORD="YourPassword" PORT=5174 npx playwright test tests/calibration.spec.ts

# Database tests
TEST_EMAIL="your-email+dbtest@gmail.com" TEST_PASSWORD="YourPassword" npx playwright test tests/database.spec.ts

# Basic app tests (no auth required)
npx playwright test tests/app.spec.ts
```

### Run Tests in UI Mode (Interactive)
```bash
npx playwright test --ui
```

### Run Tests in Headed Mode (See Browser)
```bash
TEST_EMAIL="your-email+test@gmail.com" TEST_PASSWORD="YourPassword" PORT=5174 npx playwright test tests/calibration.spec.ts --headed
```

### Run Specific Test Case
```bash
npx playwright test -g "should load with default grid parameters"
```

### Run Tests with Specific Worker Count
```bash
# Single worker (recommended for headed mode or debugging)
npx playwright test tests/calibration.spec.ts --workers=1

# Limit failures to stop early
npx playwright test tests/calibration.spec.ts --max-failures=3
```

## Test Screenshots

All tests generate screenshots in the `screenshots/` directory:

### Calibration Tests
- `calibration-01-grid-defaults.png` - Grid with default parameters
- `calibration-02-grid-dragged.png` - After dragging grid
- `calibration-03-gap-adjusted.png` - After adjusting card gaps
- `calibration-04-ocr-regions.png` - OCR red boxes on all cards
- `calibration-05-ocr-adjusted.png` - After OCR region adjustment
- `calibration-06-quantity-region.png` - Quantity detection yellow box
- `calibration-07-quantity-stats.png` - Detection stats display
- `calibration-08-quantity-debug.png` - Debug view with zones
- `calibration-09-quantity-thresholds.png` - After threshold adjustment
- `calibration-10-quantity-reset.png` - After reset to defaults
- `calibration-11-persistence.png` - After page refresh
- `calibration-12-processing.png` - During card processing

### Database Tests
- `db-01-signin-page.png` through `db-05-final-state.png`

## Test Coverage

### Calibration Features (100% Coverage)
✅ Grid positioning and resizing
✅ Card gap adjustment (horizontal and vertical)
✅ OCR region positioning (4 parameters)
✅ Quantity detection region (position and size)
✅ Quantity detection thresholds (3 parameters)
✅ localStorage persistence for all parameters
✅ Parameter loading on page load
✅ Reset to defaults functionality
✅ Debug mode visualization
✅ Integration with card processing

### Default Calibration Values Tested
Based on `CLAUDE.md` specifications:

**Grid Parameters:**
- Start X: 2.7%
- Start Y: 19.3%
- Grid Width: 94.5%
- Grid Height: 78.8%
- Card Gap X: 0.8%
- Card Gap Y: 3.6%

**OCR Region Parameters:**
- Left: 5%
- Top: 4.3%
- Width: 80%
- Height: 7.5%

**Quantity Detection Parameters:**
- Offset X: 28%
- Offset Y: 8%
- Width: 44%
- Height: 7%
- Brightness Threshold: 50
- Saturation Threshold: 10
- Fill Ratio Threshold: 5%

## Debugging Tests

### View Test Results
```bash
npx playwright show-report
```

### Debug Specific Test
```bash
npx playwright test --debug -g "should load with default grid parameters"
```

### View Trace (Timeline, Screenshots, Logs)
```bash
npx playwright test --trace on
```

## Known Issues & Limitations

1. **Authentication Required**: Calibration and database tests require valid Supabase authentication credentials
2. **UI Element Detection**: Some tests may need adjustments if UI structure changes
3. **Timing Sensitivity**: Tests use `waitForTimeout()` for animations - may need adjustment on slow machines
4. **Debug Mode Requirement**: Many tests require debug mode to be enabled to access calibration UI
5. **Canvas Interaction**: Drag tests simulate mouse movements which may be flaky on some systems
6. **Port Flexibility**: Tests default to port 5174, but can be overridden with PORT environment variable

## Contributing New Tests

When adding new calibration features:

1. Add test cases to `calibration.spec.ts`
2. Follow the existing test structure (arrange, act, assert)
3. Take screenshots for visual verification
4. Test localStorage persistence
5. Test parameter loading after page refresh
6. Update this README with new test coverage

## Environment Variables

For tests requiring authentication, set these **required** environment variables:

```bash
TEST_EMAIL=your-email+testvariant@gmail.com
TEST_PASSWORD=YourTestPassword123!
```

**Important**:
- Use the `+variant` pattern in your email for test accounts (e.g., `yourname+calibtest@gmail.com`)
- Never commit credentials to git (already protected by `.gitignore`)
- If not set, authentication-required tests will be skipped

## CI/CD Integration

To run tests in CI:

```bash
npx playwright test --reporter=github
```

For headless environments, tests already run in headless mode by default.
