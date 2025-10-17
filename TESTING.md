# Testing Guide

This document describes the comprehensive test suite for the MTGA Collection Scanner application.

## Test Structure

```
tests/                    # E2E tests (Playwright)
├── app.spec.ts          # Basic app functionality
├── database.spec.ts     # Database integration tests
├── calibration.spec.ts  # Calibration features tests
└── auth.setup.ts        # Authentication setup

src/
├── test/
│   ├── setup.ts         # Vitest test setup
│   └── performance.bench.ts  # Performance benchmarks
├── services/
│   ├── database.test.ts      # Database service unit tests
│   ├── deckDatabase.test.ts  # Deck database unit tests
│   └── imageProcessing.test.ts  # Image processing unit tests
└── utils/
    └── accuracyTester.test.ts   # OCR accuracy tests
```

## Test Categories

### 1. Unit Tests (Vitest)

Fast, isolated tests for individual functions and modules.

**Coverage:**
- `src/services/database.test.ts` - Database CRUD operations
- `src/services/deckDatabase.test.ts` - Deck management operations
- `src/services/imageProcessing.test.ts` - Grid detection, empty slot detection, quantity detection
- `src/utils/accuracyTester.test.ts` - OCR accuracy calculation

**Run unit tests:**
```bash
npm test                 # Watch mode (interactive)
npm run test:run        # Single run
npm run test:ui         # Visual UI
npm run test:coverage   # With coverage report
```

### 2. E2E Tests (Playwright)

Full application tests simulating real user workflows.

**Coverage:**
- Basic app loading and authentication
- Database persistence and sync
- Calibration system (grid, OCR, quantity)
- Multi-page processing
- Card validation and correction

**Run E2E tests:**
```bash
npm run test:e2e           # All E2E tests (headless)
npm run test:e2e:ui        # Interactive UI mode
npm run test:e2e:headed    # See browser
npm run test:db            # Database tests only
npm run test:calibration   # Calibration tests only
```

**Authentication required:**
Set environment variables for tests requiring login:
```bash
# Windows (PowerShell)
$env:TEST_EMAIL="your-email+test@gmail.com"
$env:TEST_PASSWORD="YourPassword123!"
npm run test:calibration

# Linux/Mac
TEST_EMAIL="your-email+test@gmail.com" TEST_PASSWORD="YourPassword123!" npm run test:calibration
```

### 3. Performance Benchmarks (Vitest Bench)

Measure performance of critical operations.

**Benchmarks:**
- Grid detection (36 cards)
- Empty slot detection optimization
- Quantity detection (single card and batch)
- Full pipeline simulation
- Levenshtein distance (fuzzy matching)
- Canvas operations and memory usage

**Run benchmarks:**
```bash
npm run test:bench
```

**Example output:**
```
✓ Grid Detection > detectCardGrid (36 cards) 2.45 ms/iter ±0.12
✓ Empty Slot Detection > isCardSlotEmpty (36 cards) 125 ms/iter ±8.3
✓ Quantity Detection > detectCardQuantity (36 cards) 89 ms/iter ±5.1
```

## Running All Tests

```bash
npm run test:all    # Unit tests + E2E tests
```

## Test Configuration

### Vitest (vitest.config.ts)
- **Environment:** happy-dom (fast DOM simulation)
- **Coverage:** v8 provider
- **Timeout:** 30 seconds
- **Setup:** Auto-imports @testing-library/jest-dom

### Playwright (playwright.config.ts)
- **Browser:** Chromium (headed mode for debugging)
- **Workers:** 1 (sequential execution)
- **Timeout:** 120 seconds (for email confirmation)
- **Screenshots:** On failure only
- **Base URL:** http://localhost:5173 (or PORT env var)

## Test Data

Located in `example/` directory:
- **Screenshot:** `MGTArena Collection Page 10.jpg`
- **Ground truth CSV:** Contains 36 known cards for accuracy validation

## Writing New Tests

### Unit Test Example

```typescript
import { describe, it, expect } from 'vitest';
import { myFunction } from './myModule';

describe('My Module', () => {
  it('should do something', () => {
    const result = myFunction('input');
    expect(result).toBe('expected');
  });
});
```

### E2E Test Example

```typescript
import { test, expect } from '@playwright/test';

test('should load app', async ({ page }) => {
  await page.goto('http://localhost:5173');
  await expect(page.locator('h1')).toBeVisible();
});
```

### Benchmark Example

```typescript
import { bench } from 'vitest';

bench('my operation', () => {
  // Code to benchmark
  myExpensiveOperation();
});
```

## Database Testing

Database tests use **mocked Supabase** for unit tests and **real Supabase** for E2E tests.

### Unit Tests (Mocked)
- Fast, no network calls
- Test business logic in isolation
- Verify correct database queries

### E2E Tests (Real Database)
- Require authentication
- Test full integration
- Verify data persistence

**Note:** E2E database tests create/delete test data. Use test accounts only!

## Coverage Reports

Generate coverage reports:
```bash
npm run test:coverage
```

View HTML report:
```bash
# Windows
start coverage\index.html

# Mac
open coverage/index.html

# Linux
xdg-open coverage/index.html
```

## Continuous Integration

For CI/CD environments:
```bash
# Run tests in CI mode
CI=true npm run test:all

# Or explicitly
npx vitest run --reporter=junit --outputFile=junit.xml
npx playwright test --reporter=github
```

## Troubleshooting

### Tests fail with "Canvas not supported"
- Make sure vitest.config.ts uses happy-dom environment
- Check that test/setup.ts mocks HTMLCanvasElement

### E2E tests timeout
- Increase timeout in playwright.config.ts
- Check that dev server is running on correct port
- Verify authentication credentials

### Database tests fail
- Check Supabase connection in .env
- Verify user has correct permissions
- Ensure migrations are applied

### Performance benchmarks vary widely
- Close other applications
- Run benchmarks multiple times
- Benchmarks are relative, not absolute

## Test Metrics

Current test coverage (target >80%):
- **Services:** Database, deckDatabase, imageProcessing
- **Utils:** accuracyTester
- **E2E:** App loading, calibration, database integration

## Best Practices

1. **Unit tests:** Test one thing at a time
2. **E2E tests:** Simulate real user workflows
3. **Benchmarks:** Focus on critical performance paths
4. **Mocking:** Mock external dependencies (Supabase, Scryfall)
5. **Test data:** Use realistic but deterministic data
6. **Assertions:** Clear, specific expectations
7. **Cleanup:** Reset state between tests

## Resources

- [Vitest Documentation](https://vitest.dev/)
- [Playwright Documentation](https://playwright.dev/)
- [Testing Library](https://testing-library.com/)
- [Jest DOM Matchers](https://github.com/testing-library/jest-dom)
