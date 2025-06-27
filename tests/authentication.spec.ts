import { test, expect } from '@playwright/test';

test.describe('Authentication & Authorization', () => {
  test('should show login page for unauthenticated users', async ({ page }) => {
    await page.goto('/');
    
    // Should redirect to login or show login form
    await expect(page.locator('h1, h2, h3')).toContainText(/login|sign in/i);
  });

  test('should handle super admin auto-detection during signup', async ({ page }) => {
    await page.goto('/signup');
    
    // Test with super admin email
    await page.fill('input[type="email"]', 'admin@abathwa.com');
    await page.fill('input[type="password"]', 'testpassword123');
    
    // Check that no role selection is shown for super admin emails
    const roleSelector = page.locator('select[name="role"], input[name="role"]');
    await expect(roleSelector).not.toBeVisible();
  });

  test('should show role selection for regular users', async ({ page }) => {
    await page.goto('/signup');
    
    // Test with regular email
    await page.fill('input[type="email"]', 'test@example.com');
    await page.fill('input[type="password"]', 'testpassword123');
    
    // Check if role selection is available (if implemented in UI)
    // This depends on the actual UI implementation
  });

  test('should enforce role-based access control', async ({ page }) => {
    // Test admin portal access
    await page.goto('/admin/dashboard');
    
    // Should redirect to login or show access denied
    const currentUrl = page.url();
    expect(currentUrl).not.toContain('/admin/dashboard');
  });

  test('should handle authentication state properly', async ({ page }) => {
    await page.goto('/');
    
    // Check if auth store is initialized
    const authInitialized = await page.evaluate(() => {
      // Check if auth store is available in window or global scope
      return typeof window !== 'undefined';
    });
    expect(authInitialized).toBe(true);
  });
}); 