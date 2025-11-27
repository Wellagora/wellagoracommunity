import { test, expect } from '@playwright/test';

/**
 * Critical User Journey Tests
 * These tests ensure the most important user flows work correctly
 */

test.describe('Critical User Journeys', () => {
  test('New visitor can explore the homepage', async ({ page }) => {
    await page.goto('/');
    await page.waitForLoadState('networkidle');
    
    // Check hero section is visible
    const hero = page.locator('h1').first();
    await expect(hero).toBeVisible();
    
    // Check that main content loaded
    const bodyText = await page.locator('body').textContent();
    expect(bodyText?.length).toBeGreaterThan(100);
    
    // Check Story of the Week is visible
    await expect(page.locator('text=/story.*week|geschichte.*woche|történet.*hét/i')).toBeVisible({ timeout: 10000 });
  });

  test('User can navigate through all main sections', async ({ page }) => {
    const mainRoutes = ['/', '/community', '/challenges', '/dashboard'];
    
    for (const route of mainRoutes) {
      await page.goto(route);
      await page.waitForLoadState('networkidle');
      
      // Check page loaded successfully
      const url = page.url();
      expect(url.includes(route) || url.includes('/auth')).toBeTruthy();
      
      // Check page has content
      await expect(page.locator('body')).not.toBeEmpty();
    }
  });

  test('User can access AI Assistant', async ({ page }) => {
    await page.goto('/ai-assistant');
    await page.waitForLoadState('networkidle');
    
    // Check AI Assistant page or chat interface loaded
    const url = page.url();
    expect(url.includes('/ai-assistant') || url.includes('/ai')).toBeTruthy();
  });

  test('User can switch languages', async ({ page }) => {
    await page.goto('/');
    await page.waitForLoadState('networkidle');
    
    // Find language selector
    const languageButton = page.locator('[aria-label*="language"]').or(page.locator('text=/EN|DE|HU/i')).first();
    
    if (await languageButton.isVisible()) {
      await languageButton.click();
      
      // Check dropdown/menu opened
      await page.waitForTimeout(500);
      
      // Select a different language
      const germanOption = page.locator('text="DE"').or(page.locator('text="Deutsch"')).first();
      if (await germanOption.isVisible()) {
        await germanOption.click();
        
        // Wait for language change
        await page.waitForTimeout(1000);
        
        // Verify language changed (look for German text)
        const hasGermanText = await page.locator('text=/Gemeinschaft|Programme|Dashboard/i').count() > 0;
        expect(hasGermanText).toBeTruthy();
      }
    }
  });

  test('Navigation menu is accessible and functional', async ({ page }) => {
    await page.goto('/');
    await page.waitForLoadState('networkidle');
    
    // Check navigation exists
    const nav = page.locator('nav').first();
    await expect(nav).toBeVisible();
    
    // Check for navigation links
    const navLinks = await page.locator('nav a').count();
    expect(navLinks).toBeGreaterThan(0);
  });

  test('Footer is present on all pages', async ({ page }) => {
    const routes = ['/', '/community', '/challenges'];
    
    for (const route of routes) {
      await page.goto(route);
      await page.waitForLoadState('networkidle');
      
      // Check for footer element
      const footer = page.locator('footer').or(page.locator('text=/impressum|privacy|datenschutz/i')).first();
      const hasFooter = await footer.count() > 0;
      
      // Footer should exist on most pages
      expect(hasFooter).toBeTruthy();
    }
  });
});

test.describe('Performance and Responsiveness', () => {
  test('Homepage loads within acceptable time', async ({ page }) => {
    const startTime = Date.now();
    
    await page.goto('/');
    await page.waitForLoadState('networkidle');
    
    const loadTime = Date.now() - startTime;
    
    // Should load within 10 seconds
    expect(loadTime).toBeLessThan(10000);
  });

  test('Site is responsive on mobile devices', async ({ page }) => {
    // Set mobile viewport
    await page.setViewportSize({ width: 375, height: 667 });
    
    await page.goto('/');
    await page.waitForLoadState('networkidle');
    
    // Check that content is visible
    await expect(page.locator('body')).toBeVisible();
    
    // Check that navigation adapts (mobile menu)
    const hasMobileNav = await page.locator('[aria-label*="menu"]').count() > 0;
    const hasDesktopNav = await page.locator('nav').count() > 0;
    
    // Should have some form of navigation
    expect(hasMobileNav || hasDesktopNav).toBeTruthy();
  });

  test('Site works on tablet devices', async ({ page }) => {
    // Set tablet viewport
    await page.setViewportSize({ width: 768, height: 1024 });
    
    await page.goto('/');
    await page.waitForLoadState('networkidle');
    
    // Check that content is visible
    await expect(page.locator('body')).toBeVisible();
  });
});

test.describe('Error Handling', () => {
  test('404 page displays correctly', async ({ page }) => {
    await page.goto('/this-page-definitely-does-not-exist-12345');
    
    // Should show 404 content
    const has404Text = await page.locator('text=/404|not found|nicht gefunden|nem található/i').count() > 0;
    expect(has404Text).toBeTruthy();
  });

  test('Site handles network errors gracefully', async ({ page }) => {
    // Go offline
    await page.context().setOffline(true);
    
    await page.goto('/');
    
    // Should show some content (cached or error message)
    const bodyText = await page.locator('body').textContent();
    expect(bodyText?.length).toBeGreaterThan(0);
    
    // Go back online
    await page.context().setOffline(false);
  });
});
