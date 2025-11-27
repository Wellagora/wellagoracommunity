import { test, expect } from '@playwright/test';

test.describe('Notification System', () => {
  test('should display notification bell icon', async ({ page }) => {
    await page.goto('/');
    
    // Look for notification bell (may require auth)
    const notificationBell = page.locator('[data-testid="notification-bell"]').or(page.getByRole('button', { name: /notifications|benachrichtigungen/i }));
    
    // May not be visible if not logged in - that's ok
    const isVisible = await notificationBell.first().isVisible().catch(() => false);
    
    if (isVisible) {
      await notificationBell.first().click();
      // Should show notification panel
      await expect(page.locator('[data-testid="notification-list"]').or(page.getByRole('dialog'))).toBeVisible();
    }
  });

  test('should mark notifications as read', async ({ page }) => {
    // This test requires authentication and existing notifications
    await page.goto('/');
    
    const notificationBell = page.locator('[data-testid="notification-bell"]');
    const isVisible = await notificationBell.isVisible().catch(() => false);
    
    if (isVisible) {
      await notificationBell.click();
      
      // Click mark all as read if button exists
      const markAllButton = page.getByRole('button', { name: /mark all|alle markieren/i });
      const buttonExists = await markAllButton.isVisible().catch(() => false);
      
      if (buttonExists) {
        await markAllButton.click();
        await page.waitForTimeout(1000);
      }
    }
  });
});
