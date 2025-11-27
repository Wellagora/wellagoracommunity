import { test, expect } from '@playwright/test';

test.describe('Authentication Flow', () => {
  test('should display login form', async ({ page }) => {
    await page.goto('/');
    
    // Check if login button exists
    const loginButton = page.getByRole('button', { name: /login|anmelden|bejelentkezés/i });
    await expect(loginButton).toBeVisible();
  });

  test('should show validation errors for empty login', async ({ page }) => {
    await page.goto('/auth');
    
    // Try to submit empty form
    const submitButton = page.getByRole('button', { name: /login|anmelden|bejelentkezés/i });
    await submitButton.click();
    
    // Should show validation errors
    await expect(page.locator('text=/email|e-mail/i')).toBeVisible();
  });

  test('should navigate to register form', async ({ page }) => {
    await page.goto('/auth');
    
    // Click register link
    const registerLink = page.getByRole('link', { name: /register|registrieren|regisztráció/i });
    await registerLink.click();
    
    // Should see register form
    await expect(page.locator('text=/create account|konto erstellen|fiók létrehozása/i')).toBeVisible();
  });

  // Add actual login test with test credentials
  test('should login successfully with valid credentials', async ({ page }) => {
    // This requires test user setup in Supabase
    await page.goto('/auth');
    
    await page.fill('input[type="email"]', 'test@example.com');
    await page.fill('input[type="password"]', 'testpassword123');
    
    const submitButton = page.getByRole('button', { name: /login|anmelden|bejelentkezés/i });
    await submitButton.click();
    
    // Should redirect to dashboard or home
    await page.waitForURL(/\/(dashboard|home|$)/);
  });
});
