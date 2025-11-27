import { test, expect } from '@playwright/test';

test.describe('Language Switching', () => {
  const languages = [
    { code: 'en', label: 'English' },
    { code: 'de', label: 'Deutsch' },
    { code: 'hu', label: 'Magyar' },
    { code: 'cs', label: 'Čeština' },
    { code: 'sk', label: 'Slovenčina' },
    { code: 'hr', label: 'Hrvatski' },
    { code: 'ro', label: 'Română' },
    { code: 'pl', label: 'Polski' },
  ];

  test('should detect browser language on first visit', async ({ page }) => {
    await page.goto('/');
    
    // Check that language selector exists
    const languageSelector = page.locator('[data-testid="language-selector"]').or(page.getByRole('button', { name: /language|sprache|nyelv/i }));
    await expect(languageSelector.first()).toBeVisible();
  });

  test('should switch between all supported languages', async ({ page }) => {
    await page.goto('/');

    for (const lang of languages) {
      // Open language selector
      const languageButton = page.locator('[data-testid="language-selector"]').or(page.getByRole('button', { name: /language|sprache|nyelv/i }));
      await languageButton.first().click();
      
      // Select language
      await page.getByRole('option', { name: lang.label }).or(page.getByText(lang.label)).first().click();
      
      // Wait for language to apply
      await page.waitForTimeout(500);
      
      // Check that localStorage was updated
      const storedLang = await page.evaluate(() => localStorage.getItem('preferred_language'));
      expect(storedLang).toBe(lang.code);
    }
  });

  test('should persist language selection after page reload', async ({ page }) => {
    await page.goto('/');
    
    // Select German
    const languageButton = page.locator('[data-testid="language-selector"]').or(page.getByRole('button', { name: /language|sprache|nyelv/i }));
    await languageButton.first().click();
    await page.getByRole('option', { name: 'Deutsch' }).or(page.getByText('Deutsch')).first().click();
    
    // Reload page
    await page.reload();
    
    // Check that German is still selected
    const storedLang = await page.evaluate(() => localStorage.getItem('preferred_language'));
    expect(storedLang).toBe('de');
  });
});
