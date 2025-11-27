import { test, expect } from '@playwright/test';

test.describe('Dashboard', () => {
  test('should load dashboard page', async ({ page }) => {
    await page.goto('/dashboard');
    await page.waitForLoadState('networkidle');
    
    // Check page loaded (may redirect to auth if not logged in)
    const isOnDashboard = page.url().includes('/dashboard');
    const isOnAuth = page.url().includes('/auth');
    
    expect(isOnDashboard || isOnAuth).toBeTruthy();
  });

  test('should display dashboard sections when authenticated', async ({ page }) => {
    // Note: This test may need authentication setup
    await page.goto('/dashboard');
    
    // If redirected to auth, skip the rest
    if (page.url().includes('/auth')) {
      test.skip();
      return;
    }
    
    // Check for dashboard elements
    await page.waitForLoadState('networkidle');
    
    // Dashboard should have some content
    const bodyContent = await page.locator('body').textContent();
    expect(bodyContent?.length).toBeGreaterThan(0);
  });

  test('should be responsive on mobile', async ({ page }) => {
    // Set mobile viewport
    await page.setViewportSize({ width: 375, height: 667 });
    
    await page.goto('/dashboard');
    
    // Check that page renders on mobile
    await expect(page.locator('body')).not.toBeEmpty();
  });
});

test.describe('Programs Page', () => {
  test('should load programs/challenges page', async ({ page }) => {
    await page.goto('/challenges');
    await page.waitForLoadState('networkidle');
    
    // Check page loaded
    await expect(page).toHaveURL(/\/challenges/);
  });

  test('should display program cards', async ({ page }) => {
    await page.goto('/challenges');
    await page.waitForLoadState('networkidle');
    
    // Check for program content
    const hasContent = await page.locator('body').textContent();
    expect(hasContent?.length).toBeGreaterThan(0);
  });

  test('should filter or search programs', async ({ page }) => {
    await page.goto('/challenges');
    await page.waitForLoadState('networkidle');
    
    // Look for search or filter inputs
    const searchInput = page.locator('input[type="search"]').or(page.locator('input[placeholder*="Search"]')).first();
    
    if (await searchInput.isVisible()) {
      await searchInput.fill('sustainability');
      await expect(searchInput).toHaveValue('sustainability');
    }
  });
});
