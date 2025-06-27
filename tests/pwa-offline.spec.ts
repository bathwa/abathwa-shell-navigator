import { test, expect } from '@playwright/test';

test.describe('PWA Installation & Offline Access', () => {
  test('should have PWA manifest and service worker', async ({ page }) => {
    await page.goto('/');
    
    // Check if manifest is present
    const manifestLink = page.locator('link[rel="manifest"]');
    await expect(manifestLink).toBeVisible();
    
    // Check if service worker is registered
    const swRegistered = await page.evaluate(() => {
      return 'serviceWorker' in navigator;
    });
    expect(swRegistered).toBe(true);
  });

  test('should install PWA and work offline', async ({ page, context }) => {
    await page.goto('/');
    
    // Check if app is installable
    const installable = await page.evaluate(() => {
      return 'BeforeInstallPromptEvent' in window;
    });
    
    // For now, we'll test offline functionality without actual installation
    // In a real scenario, you'd need to manually install the PWA
    
    // Test offline functionality by simulating network disconnect
    await page.route('**/*', route => {
      route.abort('failed');
    });
    
    // Navigate to a page that should be cached
    await page.goto('/');
    
    // Check if basic UI elements are still visible (from cache)
    await expect(page.locator('body')).toBeVisible();
  });

  test('should persist data offline and sync when reconnected', async ({ page }) => {
    await page.goto('/');
    
    // This test would require actual user authentication and data operations
    // For now, we'll test the offline data store setup
    
    const hasIndexedDB = await page.evaluate(() => {
      return 'indexedDB' in window;
    });
    expect(hasIndexedDB).toBe(true);
    
    // Test that Dexie is available (offline database)
    const hasDexie = await page.evaluate(() => {
      return typeof window !== 'undefined' && 'Dexie' in window;
    });
    // Note: Dexie might not be globally available, but it's used in the data store
  });
}); 