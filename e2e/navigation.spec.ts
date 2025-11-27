import { test, expect } from '@playwright/test';

test.describe('Navigation', () => {
  const routes = [
    { path: '/', name: 'Home' },
    { path: '/community', name: 'Community' },
    { path: '/challenges', name: 'Programs' },
    { path: '/dashboard', name: 'Dashboard' },
    { path: '/ai-assistant', name: 'AI Assistant' },
  ];

  test('should navigate between all main pages', async ({ page }) => {
    for (const route of routes) {
      await page.goto(route.path);
      
      // Check that page loaded
      await expect(page).toHaveURL(new RegExp(route.path));
      
      // Check that page is not completely blank
      await expect(page.locator('body')).not.toBeEmpty();
    }
  });

  test('should have working navigation menu', async ({ page }) => {
    await page.goto('/');
    
    // Check for navigation links
    await expect(page.locator('nav')).toBeVisible();
    
    // Click through navigation items
    const navLinks = await page.locator('nav a').all();
    expect(navLinks.length).toBeGreaterThan(0);
  });

  test('should handle 404 pages gracefully', async ({ page }) => {
    await page.goto('/this-page-does-not-exist-12345');
    
    // Should show 404 page or redirect
    await expect(page.locator('text=/404|not found|nicht gefunden/i')).toBeVisible();
  });
});
