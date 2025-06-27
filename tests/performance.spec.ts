import { test, expect } from '@playwright/test';

test.describe('Performance & Responsiveness', () => {
  test('should load dashboard quickly', async ({ page }) => {
    const startTime = Date.now();
    await page.goto('/');
    const loadTime = Date.now() - startTime;
    
    // Target: < 2-3 seconds for initial load
    expect(loadTime).toBeLessThan(3000);
    
    // Check if main content is visible
    await expect(page.locator('body')).toBeVisible();
  });

  test('should have responsive UI elements', async ({ page }) => {
    await page.goto('/');
    
    // Test mobile viewport
    await page.setViewportSize({ width: 375, height: 667 });
    await expect(page.locator('body')).toBeVisible();
    
    // Test tablet viewport
    await page.setViewportSize({ width: 768, height: 1024 });
    await expect(page.locator('body')).toBeVisible();
    
    // Test desktop viewport
    await page.setViewportSize({ width: 1920, height: 1080 });
    await expect(page.locator('body')).toBeVisible();
  });

  test('should handle high latency gracefully', async ({ page }) => {
    // Simulate high latency
    await page.route('**/*', route => {
      route.continue();
    });
    
    // Add artificial delay to simulate slow network
    await page.addInitScript(() => {
      const originalFetch = window.fetch;
      window.fetch = async (...args) => {
        await new Promise(resolve => setTimeout(resolve, 1000)); // 1 second delay
        return originalFetch(...args);
      };
    });
    
    await page.goto('/');
    
    // Should still load and be responsive
    await expect(page.locator('body')).toBeVisible();
  });

  test('should have optimized bundle size', async ({ page }) => {
    await page.goto('/');
    
    // Check network requests for bundle size
    const response = await page.waitForResponse('**/*.js');
    const contentLength = response.headers()['content-length'];
    
    if (contentLength) {
      const sizeInKB = parseInt(contentLength) / 1024;
      // Target: < 2MB initial load
      expect(sizeInKB).toBeLessThan(2048);
    }
  });

  test('should have smooth transitions', async ({ page }) => {
    await page.goto('/');
    
    // Check if CSS transitions are present
    const hasTransitions = await page.evaluate(() => {
      const style = getComputedStyle(document.body);
      return style.transition !== 'all 0s ease 0s';
    });
    
    // Transitions should be smooth
    expect(hasTransitions).toBe(true);
  });
}); 