import { test, expect } from '@playwright/test';

test.describe('Comprehensive App Testing', () => {
  test.beforeEach(async ({ page }) => {
    // Set viewport for mobile testing
    await page.setViewportSize({ width: 375, height: 667 });
  });

  test.describe('Authentication & Routing', () => {
    test('should handle authentication flow correctly', async ({ page }) => {
      await page.goto('/');
      
      // Check if landing page loads
      await expect(page.locator('h1')).toContainText('Abathwa Capital');
      
      // Navigate to signup
      await page.click('text=Get Started');
      await expect(page).toHaveURL('/signup');
      
      // Test role selection
      await expect(page.locator('[data-testid="role-selection"]')).toBeVisible();
      
      // Fill signup form
      await page.fill('input[name="email"]', 'test@example.com');
      await page.fill('input[name="password"]', 'password123');
      await page.fill('input[name="fullName"]', 'Test User');
      
      // Select entrepreneur role
      await page.click('[data-testid="role-entrepreneur"]');
      
      // Submit form
      await page.click('button[type="submit"]');
      
      // Should redirect to entrepreneur dashboard
      await expect(page).toHaveURL('/entrepreneur/dashboard');
    });

    test('should route users to correct dashboard based on role', async ({ page }) => {
      // Test entrepreneur routing
      await page.goto('/login');
      await page.fill('input[name="email"]', 'entrepreneur@example.com');
      await page.fill('input[name="password"]', 'password123');
      await page.click('button[type="submit"]');
      await expect(page).toHaveURL('/entrepreneur/dashboard');
      
      // Test investor routing
      await page.goto('/login');
      await page.fill('input[name="email"]', 'investor@example.com');
      await page.fill('input[name="password"]', 'password123');
      await page.click('button[type="submit"]');
      await expect(page).toHaveURL('/investor/dashboard');
      
      // Test admin routing
      await page.goto('/login');
      await page.fill('input[name="email"]', 'admin@example.com');
      await page.fill('input[name="password"]', 'password123');
      await page.click('button[type="submit"]');
      await expect(page).toHaveURL('/admin/dashboard');
    });
  });

  test.describe('Dashboard Functionality', () => {
    test('entrepreneur dashboard should load with data', async ({ page }) => {
      // Login as entrepreneur
      await page.goto('/login');
      await page.fill('input[name="email"]', 'entrepreneur@example.com');
      await page.fill('input[name="password"]', 'password123');
      await page.click('button[type="submit"]');
      
      await expect(page).toHaveURL('/entrepreneur/dashboard');
      
      // Check if dashboard loads
      await expect(page.locator('h1')).toContainText('Entrepreneur Dashboard');
      
      // Check if stats cards are visible
      await expect(page.locator('[data-testid="total-opportunities"]')).toBeVisible();
      await expect(page.locator('[data-testid="published-opportunities"]')).toBeVisible();
      
      // Check if logout button is present
      await expect(page.locator('[data-testid="logout-button"]')).toBeVisible();
      
      // Test create opportunity button
      await page.click('text=Create Opportunity');
      await expect(page).toHaveURL('/entrepreneur/opportunities/new');
    });

    test('investor dashboard should load with data', async ({ page }) => {
      // Login as investor
      await page.goto('/login');
      await page.fill('input[name="email"]', 'investor@example.com');
      await page.fill('input[name="password"]', 'password123');
      await page.click('button[type="submit"]');
      
      await expect(page).toHaveURL('/investor/dashboard');
      
      // Check if dashboard loads
      await expect(page.locator('h1')).toContainText('Investor Dashboard');
      
      // Check if portfolio stats are visible
      await expect(page.locator('[data-testid="portfolio-value"]')).toBeVisible();
      await expect(page.locator('[data-testid="total-invested"]')).toBeVisible();
      
      // Check if navigation buttons work
      await page.click('text=Portfolio');
      await expect(page).toHaveURL('/investor/portfolio');
      
      await page.goBack();
      await page.click('text=Payments');
      await expect(page).toHaveURL('/investor/payments');
    });

    test('admin dashboard should load with data', async ({ page }) => {
      // Login as admin
      await page.goto('/login');
      await page.fill('input[name="email"]', 'admin@example.com');
      await page.fill('input[name="password"]', 'password123');
      await page.click('button[type="submit"]');
      
      await expect(page).toHaveURL('/admin/dashboard');
      
      // Check if dashboard loads
      await expect(page.locator('h1')).toContainText('Admin Dashboard');
      
      // Check if system stats are visible
      await expect(page.locator('[data-testid="total-users"]')).toBeVisible();
      await expect(page.locator('[data-testid="total-opportunities"]')).toBeVisible();
      
      // Check if tabs work
      await page.click('text=Opportunities');
      await expect(page.locator('[data-testid="opportunities-tab"]')).toBeVisible();
      
      await page.click('text=Users');
      await expect(page.locator('[data-testid="users-tab"]')).toBeVisible();
    });
  });

  test.describe('Opportunity Management', () => {
    test('should create and edit opportunities', async ({ page }) => {
      // Login as entrepreneur
      await page.goto('/login');
      await page.fill('input[name="email"]', 'entrepreneur@example.com');
      await page.fill('input[name="password"]', 'password123');
      await page.click('button[type="submit"]');
      
      // Create opportunity
      await page.click('text=Create Opportunity');
      await page.fill('input[name="name"]', 'Test Opportunity');
      await page.fill('textarea[name="description"]', 'Test description');
      await page.fill('input[name="amount_sought"]', '10000');
      await page.fill('input[name="expected_roi"]', '15');
      await page.selectOption('select[name="industry"]', 'Technology');
      
      await page.click('text=Save as Draft');
      
      // Should return to dashboard
      await expect(page).toHaveURL('/entrepreneur/dashboard');
      
      // Edit opportunity
      await page.click('[data-testid="edit-opportunity"]');
      await expect(page).toHaveURL(/\/entrepreneur\/edit-opportunity\/.+/);
      
      // Check if form is pre-filled
      await expect(page.locator('input[name="name"]')).toHaveValue('Test Opportunity');
    });

    test('should handle opportunity review process', async ({ page }) => {
      // Login as admin
      await page.goto('/login');
      await page.fill('input[name="email"]', 'admin@example.com');
      await page.fill('input[name="password"]', 'password123');
      await page.click('button[type="submit"]');
      
      // Navigate to opportunity review
      await page.click('text=Review Opportunities');
      await expect(page).toHaveURL('/admin/opportunities/review-list');
      
      // Check if opportunities are listed
      await expect(page.locator('[data-testid="opportunity-item"]')).toBeVisible();
      
      // Review an opportunity
      await page.click('[data-testid="review-opportunity"]');
      await expect(page).toHaveURL(/\/admin\/opportunities\/.+\/review/);
      
      // Approve opportunity
      await page.click('text=Approve');
      await expect(page.locator('[data-testid="success-message"]')).toBeVisible();
    });
  });

  test.describe('Mobile Optimization', () => {
    test('should be responsive on mobile devices', async ({ page }) => {
      await page.goto('/');
      
      // Check if navigation is mobile-friendly
      await expect(page.locator('[data-testid="mobile-menu"]')).toBeVisible();
      
      // Test mobile menu
      await page.click('[data-testid="mobile-menu-toggle"]');
      await expect(page.locator('[data-testid="mobile-menu-items"]')).toBeVisible();
      
      // Check if buttons are touch-friendly (minimum 44px)
      const buttons = page.locator('button');
      for (let i = 0; i < await buttons.count(); i++) {
        const button = buttons.nth(i);
        const box = await button.boundingBox();
        if (box) {
          expect(box.width).toBeGreaterThanOrEqual(44);
          expect(box.height).toBeGreaterThanOrEqual(44);
        }
      }
    });

    test('should handle mobile form inputs correctly', async ({ page }) => {
      await page.goto('/signup');
      
      // Test form inputs don't zoom on iOS
      await page.fill('input[name="email"]', 'test@example.com');
      await page.fill('input[name="password"]', 'password123');
      
      // Check if viewport remains stable
      const initialViewport = page.viewportSize();
      await page.fill('input[name="fullName"]', 'Test User');
      const finalViewport = page.viewportSize();
      
      expect(initialViewport).toEqual(finalViewport);
    });

    test('should have proper PWA installation experience', async ({ page }) => {
      await page.goto('/');
      
      // Check if PWA manifest is present
      const manifestLink = page.locator('link[rel="manifest"]');
      await expect(manifestLink).toBeVisible();
      
      // Check if service worker is registered
      const swRegistered = await page.evaluate(() => {
        return 'serviceWorker' in navigator;
      });
      expect(swRegistered).toBe(true);
      
      // Check if app is installable
      const installable = await page.evaluate(() => {
        return 'BeforeInstallPromptEvent' in window;
      });
      expect(installable).toBe(true);
    });
  });

  test.describe('Performance & Loading', () => {
    test('should load quickly and show loading states', async ({ page }) => {
      const startTime = Date.now();
      await page.goto('/');
      const loadTime = Date.now() - startTime;
      
      // Should load within 3 seconds
      expect(loadTime).toBeLessThan(3000);
      
      // Check if loading indicators are shown
      await expect(page.locator('[data-testid="loading-spinner"]')).toBeVisible();
    });

    test('should handle offline scenarios gracefully', async ({ page }) => {
      await page.goto('/');
      
      // Simulate offline mode
      await page.route('**/*', route => {
        route.abort('failed');
      });
      
      // Try to navigate
      await page.click('text=Login');
      
      // Should show offline message
      await expect(page.locator('[data-testid="offline-message"]')).toBeVisible();
    });
  });

  test.describe('Error Handling', () => {
    test('should handle 404 errors gracefully', async ({ page }) => {
      await page.goto('/nonexistent-page');
      
      // Should show 404 page
      await expect(page.locator('h1')).toContainText('Page Not Found');
      await expect(page.locator('text=Go Home')).toBeVisible();
    });

    test('should handle database errors gracefully', async ({ page }) => {
      // Login as entrepreneur
      await page.goto('/login');
      await page.fill('input[name="email"]', 'entrepreneur@example.com');
      await page.fill('input[name="password"]', 'password123');
      await page.click('button[type="submit"]');
      
      // Simulate database error
      await page.route('**/supabase/**', route => {
        route.fulfill({
          status: 500,
          contentType: 'application/json',
          body: JSON.stringify({ error: 'Database error' })
        });
      });
      
      // Refresh page
      await page.reload();
      
      // Should show error message
      await expect(page.locator('[data-testid="error-message"]')).toBeVisible();
    });
  });

  test.describe('Currency & Localization', () => {
    test('should handle currency switching correctly', async ({ page }) => {
      // Login as investor
      await page.goto('/login');
      await page.fill('input[name="email"]', 'investor@example.com');
      await page.fill('input[name="password"]', 'password123');
      await page.click('button[type="submit"]');
      
      // Check initial currency
      await expect(page.locator('[data-testid="portfolio-value"]')).toContainText('$');
      
      // Switch currency
      await page.click('[data-testid="currency-selector"]');
      await page.click('text=EUR');
      
      // Check if currency changed
      await expect(page.locator('[data-testid="portfolio-value"]')).toContainText('€');
    });
  });

  test.describe('Navigation & UX', () => {
    test('should have consistent navigation patterns', async ({ page }) => {
      // Login as entrepreneur
      await page.goto('/login');
      await page.fill('input[name="email"]', 'entrepreneur@example.com');
      await page.fill('input[name="password"]', 'password123');
      await page.click('button[type="submit"]');
      
      // Test back button
      await page.click('text=Create Opportunity');
      await page.click('[data-testid="back-button"]');
      await expect(page).toHaveURL('/entrepreneur/dashboard');
      
      // Test breadcrumbs
      await expect(page.locator('[data-testid="breadcrumbs"]')).toBeVisible();
    });

    test('should have proper button spacing', async ({ page }) => {
      // Login as entrepreneur
      await page.goto('/login');
      await page.fill('input[name="email"]', 'entrepreneur@example.com');
      await page.fill('input[name="password"]', 'password123');
      await page.click('button[type="submit"]');
      
      // Check button spacing in opportunities list
      const editButton = page.locator('[data-testid="edit-button"]').first();
      const deleteButton = page.locator('[data-testid="delete-button"]').first();
      
      const editBox = await editButton.boundingBox();
      const deleteBox = await deleteButton.boundingBox();
      
      if (editBox && deleteBox) {
        const spacing = deleteBox.x - (editBox.x + editBox.width);
        expect(spacing).toBeGreaterThan(8); // At least 8px spacing
      }
    });
  });
}); 