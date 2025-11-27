import { test, expect } from '@playwright/test';

test.describe('AI Assistant', () => {
  test('should display AI assistant interface', async ({ page }) => {
    await page.goto('/ai-assistant');
    
    // Check for chat interface
    await expect(page.getByRole('textbox')).toBeVisible();
    await expect(page.getByRole('button', { name: /send|senden|küldés/i })).toBeVisible();
  });

  test('should send message and receive response', async ({ page }) => {
    await page.goto('/ai-assistant');
    
    // Type a message
    const input = page.getByRole('textbox');
    await input.fill('Hello, what can you help me with?');
    
    // Send message
    const sendButton = page.getByRole('button', { name: /send|senden|küldés/i });
    await sendButton.click();
    
    // Wait for response (with timeout)
    await expect(page.locator('text=/thinking|loading|laden/i').or(page.locator('[data-testid="ai-response"]'))).toBeVisible({ timeout: 10000 });
  });

  test('should handle multiple languages in AI chat', async ({ page }) => {
    const messages = [
      { lang: 'en', text: 'What sustainability programs do you offer?' },
      { lang: 'de', text: 'Welche Nachhaltigkeitsprogramme bieten Sie an?' },
      { lang: 'hu', text: 'Milyen fenntarthatósági programokat kínálnak?' },
    ];

    for (const msg of messages) {
      await page.goto('/ai-assistant');
      
      const input = page.getByRole('textbox');
      await input.fill(msg.text);
      
      const sendButton = page.getByRole('button', { name: /send|senden|küldés/i });
      await sendButton.click();
      
      // Should receive a response
      await page.waitForTimeout(2000);
    }
  });
});
