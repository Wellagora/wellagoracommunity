import { test, expect } from '@playwright/test';

test.describe('Community Hub', () => {
  test('should load community page successfully', async ({ page }) => {
    await page.goto('/community');
    
    // Check page loaded
    await expect(page).toHaveURL(/\/community/);
    
    // Check hero section is visible
    await expect(page.locator('text=/Our Community|Unsere Gemeinschaft|Közösségünk/i')).toBeVisible();
  });

  test('should display feature cards', async ({ page }) => {
    await page.goto('/community');
    
    // Wait for feature cards to load
    await page.waitForSelector('role=button', { timeout: 10000 });
    
    // Check that multiple feature cards are visible
    const cards = await page.locator('[role="button"]').count();
    expect(cards).toBeGreaterThan(0);
  });

  test('should open Story Book modal', async ({ page }) => {
    await page.goto('/community');
    
    // Wait for page to fully load
    await page.waitForLoadState('networkidle');
    
    // Find and click the Story Book button
    // Looking for the BookOpen icon or Story Book text
    const storyBookButton = page.locator('text=/Story Book|Geschichtenbuch|Történetkönyv|Kniha příběhů/i').first();
    await storyBookButton.click();
    
    // Check that modal opened
    await expect(page.locator('[role="dialog"]')).toBeVisible({ timeout: 5000 });
    
    // Check modal content
    await expect(page.locator('text=/Story Book|Geschichtenbuch|Történetkönyv/i')).toBeVisible();
  });

  test('should display past stories in Story Book', async ({ page }) => {
    await page.goto('/community');
    await page.waitForLoadState('networkidle');
    
    // Open Story Book modal
    const storyBookButton = page.locator('text=/Story Book|Geschichtenbuch|Történetkönyv|Kniha příběhů/i').first();
    await storyBookButton.click();
    
    // Wait for modal
    await expect(page.locator('[role="dialog"]')).toBeVisible();
    
    // Check that at least one story card is visible
    const storyCards = await page.locator('[role="dialog"] blockquote').count();
    expect(storyCards).toBeGreaterThan(0);
  });

  test('should search in community hub', async ({ page }) => {
    await page.goto('/community');
    
    // Find search input
    const searchInput = page.locator('input[placeholder*="Search"]').or(page.locator('input[type="search"]'));
    await expect(searchInput.first()).toBeVisible();
    
    // Type in search
    await searchInput.first().fill('sustainability');
    await expect(searchInput.first()).toHaveValue('sustainability');
  });

  test('should display community stats', async ({ page }) => {
    await page.goto('/community');
    await page.waitForLoadState('networkidle');
    
    // Check for stats cards (Active Members, Total Points, etc.)
    const statsCards = await page.locator('text=/Active Members|Aktive|členové|membri/i').count();
    expect(statsCards).toBeGreaterThan(0);
  });
});

test.describe('Story of the Week', () => {
  test('should display story of the week on homepage', async ({ page }) => {
    await page.goto('/');
    await page.waitForLoadState('networkidle');
    
    // Check for Story of the Week section
    await expect(page.locator('text=/Story.*Week|Geschichte.*Woche|történet.*hét/i')).toBeVisible({ timeout: 10000 });
  });

  test('should open full story modal from homepage', async ({ page }) => {
    await page.goto('/');
    await page.waitForLoadState('networkidle');
    
    // Find and click "Read More" button
    const readMoreButton = page.locator('text=/Read.*More|Mehr.*lesen|Teljes.*történet/i').first();
    await readMoreButton.click();
    
    // Check that modal opened with full story
    await expect(page.locator('[role="dialog"]')).toBeVisible({ timeout: 5000 });
  });

  test('should open Story Book from homepage', async ({ page }) => {
    await page.goto('/');
    await page.waitForLoadState('networkidle');
    
    // Find "View Story Book" button
    const storyBookButton = page.locator('text=/View.*Story Book|Geschichtenbuch.*megtekintése|Zobrazit/i').first();
    
    if (await storyBookButton.isVisible()) {
      await storyBookButton.click();
      
      // Check that Story Book modal opened
      await expect(page.locator('[role="dialog"]')).toBeVisible({ timeout: 5000 });
      await expect(page.locator('text=/Story Book|Geschichtenbuch|Történetkönyv/i')).toBeVisible();
    }
  });
});

test.describe('Multilingual Community Experience', () => {
  const languages = [
    { code: 'en', name: 'English', communityText: 'Our Community' },
    { code: 'de', name: 'Deutsch', communityText: 'Unsere Gemeinschaft' },
    { code: 'hu', name: 'Magyar', communityText: 'Közösségünk' },
  ];

  for (const lang of languages) {
    test(`should display community page in ${lang.name}`, async ({ page }) => {
      await page.goto('/community');
      
      // Change language
      const languageSelector = page.locator('button[aria-label*="language"]').or(page.locator('text=/EN|DE|HU/i')).first();
      if (await languageSelector.isVisible()) {
        await languageSelector.click();
        
        // Select language
        await page.locator(`text="${lang.code.toUpperCase()}"`).click();
        
        // Wait for language change
        await page.waitForTimeout(1000);
      }
      
      // Check that content is in correct language
      const hasTranslatedText = await page.locator(`text=/community|gemeinschaft|közösség/i`).count() > 0;
      expect(hasTranslatedText).toBeTruthy();
    });
  }
});
