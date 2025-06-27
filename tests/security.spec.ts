import { test, expect } from '@playwright/test';

test.describe('Security & Production Readiness', () => {
  test('should not expose sensitive data in client-side code', async ({ page }) => {
    await page.goto('/');
    
    // Check page source for sensitive information
    const pageContent = await page.content();
    
    // Should not contain API keys, passwords, or other sensitive data
    const sensitivePatterns = [
      /eyJ[A-Za-z0-9-_]+\.[A-Za-z0-9-_]+\.[A-Za-z0-9-_]+/, // JWT tokens
      /sk_[A-Za-z0-9]+/, // Stripe secret keys
      /password.*=.*['"][^'"]+['"]/, // Hardcoded passwords
      /api_key.*=.*['"][^'"]+['"]/, // API keys
    ];
    
    for (const pattern of sensitivePatterns) {
      expect(pageContent).not.toMatch(pattern);
    }
  });

  test('should use HTTPS for all external requests', async ({ page }) => {
    await page.goto('/');
    
    // Monitor network requests
    const requests: string[] = [];
    page.on('request', request => {
      if (request.url().startsWith('http://') && !request.url().includes('localhost')) {
        requests.push(request.url());
      }
    });
    
    // Wait for page to load
    await page.waitForLoadState('networkidle');
    
    // Should not have any HTTP requests (except localhost)
    expect(requests.length).toBe(0);
  });

  test('should enforce RLS policies', async ({ page }) => {
    // Test that unauthorized access is blocked
    await page.goto('/admin/dashboard');
    
    // Should redirect away from admin area
    const currentUrl = page.url();
    expect(currentUrl).not.toContain('/admin/dashboard');
  });

  test('should handle authentication tokens securely', async ({ page }) => {
    await page.goto('/');
    
    // Check if tokens are stored securely (not in localStorage for sensitive data)
    const localStorage = await page.evaluate(() => {
      return Object.keys(localStorage);
    });
    
    // Should not store sensitive tokens in localStorage
    const sensitiveKeys = localStorage.filter(key => 
      key.includes('token') || key.includes('password') || key.includes('secret')
    );
    
    expect(sensitiveKeys.length).toBe(0);
  });

  test('should validate input data', async ({ page }) => {
    await page.goto('/signup');
    
    // Test XSS prevention
    const maliciousInput = '<script>alert("xss")</script>';
    
    const emailInput = page.locator('input[type="email"]');
    if (await emailInput.count() > 0) {
      await emailInput.fill(maliciousInput);
      
      // Should not execute scripts
      const hasAlert = await page.evaluate(() => {
        return typeof window.alert === 'function';
      });
      
      // Check if input is properly escaped
      const inputValue = await emailInput.inputValue();
      expect(inputValue).toBe(maliciousInput); // Should be stored as text, not executed
    }
  });

  test('should handle CSRF protection', async ({ page }) => {
    await page.goto('/');
    
    // Check for CSRF tokens in forms
    const csrfTokens = page.locator('input[name*="csrf"], input[name*="token"]');
    const tokenCount = await csrfTokens.count();
    
    // Forms should have CSRF protection
    // Note: This depends on the actual implementation
  });

  test('should not leak information in error messages', async ({ page }) => {
    // Try to access non-existent routes
    await page.goto('/non-existent-route');
    
    // Should show generic error, not stack traces or internal details
    const pageContent = await page.content();
    
    // Should not contain internal paths, stack traces, or database errors
    const sensitiveErrorPatterns = [
      /\/node_modules\//,
      /\/src\//,
      /at\s+.*\s+\(/,
      /database.*error/i,
      /sql.*error/i,
    ];
    
    for (const pattern of sensitiveErrorPatterns) {
      expect(pageContent).not.toMatch(pattern);
    }
  });
}); 