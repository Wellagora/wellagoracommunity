# WellAgora E2E Tests

End-to-end tests for WellAgora using Playwright.

## Setup

Playwright is already installed. If you need to reinstall:

```bash
bun add -d @playwright/test
bunx playwright install chromium
```

## Running Tests

### Run all tests (headless)
```bash
bun run test:e2e
```

### Run tests with UI mode (interactive)
```bash
bun run test:e2e:ui
```

### Run tests in headed mode (see browser)
```bash
bun run test:e2e:headed
```

### Debug tests
```bash
bun run test:e2e:debug
```

## Test Files

### `purchase-flow.spec.ts`

Contains two main test scenarios:

#### 1. Complete Purchase Journey - Kézműves Kosárfonás
Tests the full purchase flow:
- Login with test credentials
- Navigate to programs page
- Click on "Kézműves Kosárfonás" program
- Complete purchase
- Verify transaction success (confetti/success message)
- Check program appears in "Aktív részvételeim" on /my-agora
- Verify revenue shows in Expert Studio "Üzlet" tab

#### 2. Voucher Flow - Fenntartható Életmód Alapjai
Tests the sponsored voucher claim flow:
- Login with test credentials
- Navigate to "Fenntartható Életmód Alapjai" program
- Claim sponsored voucher
- Verify program appears in Agórám with voucher badge

## Test Credentials

- Email: `attila.kelemen@proself.org`
- Password: `Kalandor13!`

## Configuration

Tests are configured in `playwright.config.ts`:
- Base URL: `http://localhost:8080`
- Browser: Chromium only (for faster execution)
- Screenshots: Only on failure
- Trace: On first retry

## Notes

- Tests use Hungarian UI text for selectors since the application is in Hungarian
- The dev server must be running on port 8080 (or will be auto-started by Playwright)
- Tests run in parallel by default
- Failed tests generate screenshots and traces in `test-results/`
