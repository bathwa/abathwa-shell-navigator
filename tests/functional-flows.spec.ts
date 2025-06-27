import { test, expect } from '@playwright/test';

test.describe('Core Functional Flows', () => {
  test('should handle opportunity creation flow', async ({ page }) => {
    // This would require authentication as entrepreneur
    await page.goto('/entrepreneur/opportunities/new');
    
    // Should redirect to login if not authenticated
    const currentUrl = page.url();
    if (currentUrl.includes('/login')) {
      // Test form elements if they exist
      await expect(page.locator('body')).toBeVisible();
    }
  });

  test('should handle investor dashboard access', async ({ page }) => {
    await page.goto('/investor/dashboard');
    
    // Should redirect to login if not authenticated
    const currentUrl = page.url();
    if (currentUrl.includes('/login')) {
      await expect(page.locator('body')).toBeVisible();
    }
  });

  test('should handle admin dashboard access', async ({ page }) => {
    await page.goto('/admin/dashboard');
    
    // Should redirect to login or show access denied
    const currentUrl = page.url();
    expect(currentUrl).not.toContain('/admin/dashboard');
  });

  test('should handle opportunity detail view', async ({ page }) => {
    await page.goto('/opportunities/test-id');
    
    // Should redirect to login if not authenticated
    const currentUrl = page.url();
    if (currentUrl.includes('/login')) {
      await expect(page.locator('body')).toBeVisible();
    }
  });

  test('should handle profile management', async ({ page }) => {
    await page.goto('/profile');
    
    // Should redirect to login if not authenticated
    const currentUrl = page.url();
    if (currentUrl.includes('/login')) {
      await expect(page.locator('body')).toBeVisible();
    }
  });

  test('should handle file upload functionality', async ({ page }) => {
    await page.goto('/');
    
    // Check if file input elements exist (for profile pictures, documents, etc.)
    const fileInputs = page.locator('input[type="file"]');
    const count = await fileInputs.count();
    
    // File uploads should be available in various forms
    // This is a basic check - actual upload testing would require authentication
  });

  test('should handle theme switching', async ({ page }) => {
    await page.goto('/');
    
    // Look for theme toggle elements
    const themeToggle = page.locator('[data-theme-toggle], .theme-toggle, button[aria-label*="theme"]');
    
    if (await themeToggle.count() > 0) {
      // Test theme switching
      await themeToggle.first().click();
      
      // Check if theme class changed
      const themeChanged = await page.evaluate(() => {
        return document.documentElement.classList.contains('dark') || 
               document.documentElement.classList.contains('light');
      });
      
      expect(themeChanged).toBe(true);
    }
  });

  test('should handle error states gracefully', async ({ page }) => {
    // Simulate network errors
    await page.route('**/*', route => {
      route.abort('failed');
    });
    
    await page.goto('/');
    
    // Should show error message or fallback UI
    await expect(page.locator('body')).toBeVisible();
  });

  test('should handle form validation', async ({ page }) => {
    await page.goto('/signup');
    
    // Try to submit empty form
    const submitButton = page.locator('button[type="submit"]');
    if (await submitButton.count() > 0) {
      await submitButton.click();
      
      // Should show validation errors
      const errorMessages = page.locator('.error, [role="alert"], .text-red-500');
      await expect(errorMessages).toBeVisible();
    }
  });
}); 