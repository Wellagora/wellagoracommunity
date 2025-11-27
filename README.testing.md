# Wellagora Testing Documentation

## 🧪 Testing Stack

This project uses a comprehensive 3-layer testing approach:

### Layer 1: Real-Time Monitoring (Sentry)
- **Purpose**: Catch production errors and track user sessions
- **Setup**: Add `VITE_SENTRY_DSN` to your `.env` file
- **Features**:
  - Error tracking with stack traces
  - Session replay for debugging
  - Performance monitoring
  - User context tracking

### Layer 2: E2E Testing (Playwright)
- **Purpose**: Automated testing of critical user journeys
- **Location**: `/e2e` directory
- **Coverage**:
  - Authentication flows
  - Language switching (8 languages)
  - AI Assistant interactions
  - Navigation and routing
  - Notification system
  - Program browsing

### Layer 3: Backend Monitoring
- **Purpose**: Edge function health monitoring
- **Features**:
  - Response time tracking
  - Status monitoring (healthy/degraded/down)
  - Automated health checks
  - Real-time alerts

## 🚀 Quick Start

### Running E2E Tests

```bash
# Install Playwright browsers (first time only)
npx playwright install

# Run all tests
npm run test:e2e

# Run tests in UI mode
npx playwright test --ui

# Run specific test file
npx playwright test e2e/auth.spec.ts

# Run tests in headed mode (see browser)
npx playwright test --headed
```

### Setting Up Sentry

1. Create a Sentry account at https://sentry.io
2. Create a new project for Wellagora
3. Copy your DSN
4. Add to `.env`:
```
VITE_SENTRY_DSN=https://your-dsn@sentry.io/project-id
VITE_ENABLE_SENTRY=true
```

### Edge Function Monitoring

The monitoring service runs automatically in the background:

```typescript
import { edgeFunctionMonitor } from '@/lib/edgeFunctionMonitor';

// Start monitoring (checks every 5 minutes)
edgeFunctionMonitor.startMonitoring(5);

// Get current health status
const status = edgeFunctionMonitor.getAllHealthStatus();
```

## 📊 Test Coverage

### Critical User Journeys Tested

1. **Authentication**
   - Login with valid/invalid credentials
   - Registration flow
   - Form validation
   - Session persistence

2. **Language Support**
   - Auto-detection of browser language
   - Manual language switching
   - Persistence across page reloads
   - All 8 languages (EN, DE, HU, CS, SK, HR, RO, PL)

3. **AI Assistant**
   - Chat interface functionality
   - Message sending/receiving
   - Multilingual support
   - Error handling

4. **Navigation**
   - All major routes accessible
   - Navigation menu functionality
   - 404 page handling
   - Route transitions

5. **Notifications**
   - Notification bell display
   - Mark as read functionality
   - Real-time updates

## 🔧 Configuration

### Playwright Configuration
Located in `playwright.config.ts`:
- Tests on Chrome, Firefox, Safari, and Mobile Chrome
- Screenshots on failure
- Trace on retry
- Parallel execution

### CI/CD Integration
GitHub Actions workflow (`.github/workflows/playwright.yml`):
- Runs on push to main/develop
- Runs on pull requests
- Generates HTML report
- Stores artifacts for 30 days

## 📈 Monitoring Dashboard

### Sentry Dashboard
- View at: https://sentry.io/organizations/your-org/issues/
- Real-time error tracking
- Performance metrics
- User session replays

### Edge Function Health
Access via admin dashboard or programmatically:

```typescript
// Check specific function
const aiChatHealth = await edgeFunctionMonitor.checkFunctionHealth('ai-chat');

// Check all functions
const allHealth = await edgeFunctionMonitor.checkAllFunctions();
```

## 🛠️ Writing New Tests

### Example: Testing a new feature

```typescript
import { test, expect } from '@playwright/test';

test.describe('My New Feature', () => {
  test('should work correctly', async ({ page }) => {
    await page.goto('/my-feature');
    
    // Your test logic
    await expect(page.locator('h1')).toContainText('My Feature');
  });
});
```

### Best Practices

1. **Use data-testid attributes** for stable selectors
2. **Test in multiple languages** where applicable
3. **Handle async operations** with proper waits
4. **Add meaningful assertions** not just "page loads"
5. **Clean up after tests** (logout, clear data)

## 🚨 Alerts and Notifications

### Sentry Alerts
Configure in Sentry dashboard:
- Email notifications for new issues
- Slack integration
- Custom alert rules

### Edge Function Alerts
Implement custom alerting:

```typescript
edgeFunctionMonitor.checkAllFunctions().then(results => {
  const unhealthy = results.filter(r => r.status !== 'healthy');
  if (unhealthy.length > 0) {
    // Send alert (email, Slack, etc.)
    console.error('Unhealthy functions:', unhealthy);
  }
});
```

## 📝 Maintenance

- **Weekly**: Review Sentry issues
- **Before releases**: Run full E2E test suite
- **Monthly**: Review and update test coverage
- **Quarterly**: Audit edge function performance

## 🆘 Troubleshooting

### Tests Failing Locally
1. Ensure dev server is running (`npm run dev`)
2. Clear browser cache
3. Check Playwright browser installation

### Sentry Not Capturing Errors
1. Verify DSN is correct
2. Check `VITE_ENABLE_SENTRY=true`
3. Ensure production build (`npm run build`)

### Edge Functions Not Responding
1. Check Supabase connection
2. Review function logs
3. Verify authentication tokens

## 📚 Additional Resources

- [Playwright Documentation](https://playwright.dev/)
- [Sentry React Documentation](https://docs.sentry.io/platforms/javascript/guides/react/)
- [Supabase Edge Functions](https://supabase.com/docs/guides/functions)
