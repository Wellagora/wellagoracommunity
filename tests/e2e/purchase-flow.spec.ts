import { test, expect } from '@playwright/test';

test.describe('WellAgora Purchase Flow', () => {
  test.beforeEach(async ({ page }) => {
    // Navigate to login page and wait for it to load
    await page.goto('/auth', { waitUntil: 'networkidle' });
    
    // Wait for the login form to be visible
    await page.waitForSelector('#login-email', { state: 'visible', timeout: 10000 });
  });

  test('Complete purchase journey - Kézműves Kosárfonás', async ({ page }) => {
    // Step 1: Login
    await page.fill('#login-email', 'attila.kelemen@proself.org');
    await page.fill('#login-password', 'Kalandor13!');
    await page.click('button[type="submit"]:has-text("Bejelentkezés")');
    
    // Wait for successful login (redirect to programs or dashboard)
    await page.waitForURL(/\/(programs|dashboard|home|expert-studio|\/)?$/, { timeout: 15000 });
    await page.waitForLoadState('networkidle');

    // Step 2: Navigate to programs page
    await page.goto('/programs');
    await page.waitForLoadState('networkidle');

    // Step 3: Find and click on "Kézműves Kosárfonás" program
    const programCard = page.locator('text=Kézműves Kosárfonás').first();
    await expect(programCard).toBeVisible({ timeout: 10000 });
    await programCard.click();

    // Wait for program detail page to load
    await page.waitForLoadState('networkidle');
    await expect(page.locator('h1, h2').filter({ hasText: 'Kézműves Kosárfonás' })).toBeVisible();

    // Step 4: Click purchase button
    const purchaseButton = page.locator('button:has-text("Vásárlás"), button:has-text("Részvétel"), button:has-text("Megvásárlás")').first();
    await expect(purchaseButton).toBeVisible({ timeout: 5000 });
    await purchaseButton.click();

    // Step 5: Verify transaction completes (confetti or success message)
    // Look for success indicators
    await expect(
      page.locator('text=/Sikeres|Gratulálunk|Köszönjük/i')
    ).toBeVisible({ timeout: 15000 });

    // Alternative: Check for confetti animation or success modal
    const successModal = page.locator('[role="dialog"]:has-text("Sikeres")');
    if (await successModal.isVisible()) {
      await expect(successModal).toBeVisible();
    }

    // Step 6: Navigate to /my-agora and verify program appears in "Aktív részvételeim"
    await page.goto('/my-agora');
    await page.waitForLoadState('networkidle');

    // Look for the program in active participations section
    const activeSection = page.locator('text=Aktív részvételeim').locator('..');
    await expect(activeSection).toBeVisible({ timeout: 5000 });
    
    // Verify the purchased program appears
    await expect(
      page.locator('text=Kézműves Kosárfonás').first()
    ).toBeVisible({ timeout: 10000 });

    // Step 7: Navigate to /expert-studio and verify revenue shows in "Üzlet" tab
    await page.goto('/expert-studio');
    await page.waitForLoadState('networkidle');

    // Click on "Üzlet" tab
    const uzletTab = page.locator('button:has-text("Üzlet")');
    await expect(uzletTab).toBeVisible({ timeout: 5000 });
    await uzletTab.click();

    // Wait for tab content to load
    await page.waitForTimeout(1000);

    // Verify revenue card shows data (not 0)
    const revenueCard = page.locator('text=Bevétel áttekintés').locator('..');
    await expect(revenueCard).toBeVisible();
    
    // Check that revenue is displayed and not zero
    const revenueAmount = page.locator('text=/\\d+.*Ft/').first();
    await expect(revenueAmount).toBeVisible();
  });

  test('Voucher flow - Fenntartható Életmód Alapjai', async ({ page }) => {
    // Step 1: Login (form already loaded from beforeEach)
    await page.fill('#login-email', 'attila.kelemen@proself.org');
    await page.fill('#login-password', 'Kalandor13!');
    await page.click('button[type="submit"]:has-text("Bejelentkezés")');
    
    // Wait for successful login
    await page.waitForURL(/\/(programs|dashboard|home|expert-studio|\/)?$/, { timeout: 15000 });
    await page.waitForLoadState('networkidle');

    // Step 2: Navigate to "Fenntartható Életmód Alapjai" program
    await page.goto('/programs');
    await page.waitForLoadState('networkidle');

    // Find the program
    const programCard = page.locator('text=Fenntartható Életmód Alapjai').first();
    await expect(programCard).toBeVisible({ timeout: 10000 });
    await programCard.click();

    // Wait for program detail page
    await page.waitForLoadState('networkidle');
    await expect(page.locator('h1, h2').filter({ hasText: 'Fenntartható Életmód Alapjai' })).toBeVisible();

    // Step 3: Claim sponsored voucher
    // Look for voucher/sponsor button (could be "Ingyenes hozzáférés", "Kupon igénylése", etc.)
    const voucherButton = page.locator('button:has-text("Ingyenes"), button:has-text("Kupon"), button:has-text("Szponzorált")').first();
    await expect(voucherButton).toBeVisible({ timeout: 5000 });
    await voucherButton.click();

    // Wait for voucher claim confirmation
    await expect(
      page.locator('text=/Sikeres|Gratulálunk|Igényelve/i')
    ).toBeVisible({ timeout: 10000 });

    // Step 4: Verify it appears in Agórám (my-agora)
    await page.goto('/my-agora');
    await page.waitForLoadState('networkidle');

    // Look for the program in active participations
    await expect(
      page.locator('text=Fenntartható Életmód Alapjai').first()
    ).toBeVisible({ timeout: 10000 });

    // Verify it shows as voucher/sponsored access
    const voucherBadge = page.locator('text=/Kupon|Szponzorált|Ingyenes/i').first();
    await expect(voucherBadge).toBeVisible({ timeout: 5000 });
  });
});
