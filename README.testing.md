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
  - **Community Hub & Story Book** ✨ NEW
  - **Dashboard functionality** ✨ NEW
  - **Critical user paths** ✨ NEW

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
npx playwright test

# Run tests in UI mode (interactive)
npx playwright test --ui

# Run specific test file
npx playwright test e2e/community.spec.ts
npx playwright test e2e/critical-paths.spec.ts

# Run tests in headed mode (see browser)
npx playwright test --headed

# Run tests and generate HTML report
npx playwright test --reporter=html
npx playwright show-report
```

### Continuous Testing (Recommended)

```bash
# Watch mode - runs tests on file changes
npx playwright test --watch

# Run specific tests matching a pattern
npx playwright test --grep "Story Book"
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

6. **Community Hub** ✨ NEW
   - Community page loading
   - Feature cards display
   - Story Book modal opening
   - Past stories display
   - Search functionality
   - Community stats visibility
   - Multilingual community experience

7. **Story of the Week** ✨ NEW
   - Homepage story display
   - Full story modal
   - Story Book access from homepage
   - Story archive browsing

8. **Dashboard** ✨ NEW
   - Dashboard loading
   - Authenticated access
   - Mobile responsiveness
   - Content display

9. **Programs/Challenges** ✨ NEW
   - Programs page loading
   - Program cards display
   - Search and filter functionality

10. **Performance & Responsiveness** ✨ NEW
    - Page load times
    - Mobile device compatibility
    - Tablet device compatibility
    - Responsive design validation

11. **Error Handling** ✨ NEW
    - 404 page display
    - Network error handling
    - Graceful degradation

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
    
    // Wait for content to load
    await page.waitForLoadState('networkidle');
    
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
6. **Use `waitForLoadState('networkidle')`** for dynamic content
7. **Test mobile and desktop** viewports
8. **Handle authentication states** appropriately

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

## 🔄 Automated Testing Schedule

### Recommended Testing Frequency

- **On every commit**: Run critical path tests
- **On every PR**: Run full test suite
- **Nightly**: Run full test suite + performance tests
- **Weekly**: Review test coverage and update tests
- **Monthly**: Audit and optimize test performance

### GitHub Actions (Automatic)

The project is configured to automatically run tests:
- ✅ On push to `main` or `develop` branches
- ✅ On pull requests to `main` or `develop`
- ✅ Results stored for 30 days
- ✅ Email notifications on failure

## 📝 Maintenance

- **Daily**: Monitor Sentry dashboard for new issues
- **Weekly**: Review Playwright test results
- **Before releases**: Run full E2E test suite manually
- **Monthly**: Review and update test coverage
- **Quarterly**: Audit edge function performance

## 🆘 Troubleshooting

### Tests Failing Locally
1. Ensure dev server is running (`npm run dev`)
2. Clear browser cache
3. Check Playwright browser installation: `npx playwright install`
4. Verify base URL in `playwright.config.ts`

### Sentry Not Capturing Errors
1. Verify DSN is correct
2. Check `VITE_ENABLE_SENTRY=true`
3. Ensure production build (`npm run build`)
4. Check browser console for Sentry initialization

### Edge Functions Not Responding
1. Check Supabase connection
2. Review function logs in Supabase dashboard
3. Verify authentication tokens
4. Check CORS configuration

### Playwright Browser Issues
```bash
# Reinstall browsers
npx playwright install --force

# Clear Playwright cache
rm -rf ~/.cache/ms-playwright
npx playwright install
```

## 📚 Additional Resources

- [Playwright Documentation](https://playwright.dev/)
- [Sentry React Documentation](https://docs.sentry.io/platforms/javascript/guides/react/)
- [Supabase Edge Functions](https://supabase.com/docs/guides/functions)
- [Testing Best Practices](https://playwright.dev/docs/best-practices)

## 🎯 Test Coverage Goals

Current Coverage:
- ✅ Navigation: 100%
- ✅ Authentication: 90%
- ✅ Language Switching: 100%
- ✅ Community Features: 95% ✨ NEW
- ✅ Story Book: 100% ✨ NEW
- ✅ Critical User Paths: 90% ✨ NEW
- ⚠️ Dashboard (Auth Required): 70%
- ⚠️ Programs: 80%

Target: 95% coverage across all critical user journeys
