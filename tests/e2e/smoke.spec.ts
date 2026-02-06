import { test, expect } from '@playwright/test';

test.describe('Smoke Tests', () => {
  test('Homepage loads successfully', async ({ page }) => {
    await page.goto('/', { waitUntil: 'networkidle', timeout: 30000 });
    await expect(page).toHaveURL(/\//);
    
    // Take a screenshot for debugging
    await page.screenshot({ path: 'test-results/homepage.png' });
  });

  test('Auth page loads successfully', async ({ page }) => {
    await page.goto('/auth', { waitUntil: 'networkidle', timeout: 30000 });
    
    // Take a screenshot
    await page.screenshot({ path: 'test-results/auth-page.png' });
    
    // Check if page loaded
    const title = await page.title();
    console.log('Page title:', title);
    
    // Check if login tab exists
    const loginTab = page.locator('text=Bejelentkezés').first();
    await expect(loginTab).toBeVisible({ timeout: 5000 });
  });
});
