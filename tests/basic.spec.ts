import { test, expect } from '@playwright/test';

test.describe('Basic App Functionality', () => {
  test('should load the landing page', async ({ page }) => {
    await page.goto('/');
    
    // Check if the page loads
    await expect(page.locator('body')).toBeVisible();
    
    // Check for the main heading
    await expect(page.locator('h1')).toContainText('Connect');
    
    // Check for navigation links
    await expect(page.locator('a[href="/login"]')).toBeVisible();
    await expect(page.locator('a[href="/signup"]')).toBeVisible();
  });

  test('should handle navigation to login page', async ({ page }) => {
    await page.goto('/login');
    
    // Should show login form
    await expect(page.locator('body')).toBeVisible();
  });

  test('should handle navigation to signup page', async ({ page }) => {
    await page.goto('/signup');
    
    // Should show signup form
    await expect(page.locator('body')).toBeVisible();
  });
}); 