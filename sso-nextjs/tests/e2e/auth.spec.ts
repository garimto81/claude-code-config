import { test, expect } from '@playwright/test'

test.describe('Authentication Flow', () => {
  test('should show login page', async ({ page }) => {
    await page.goto('/login')

    await expect(page.locator('h2')).toContainText('로그인')
    await expect(page.locator('input[name="email"]')).toBeVisible()
    await expect(page.locator('input[name="password"]')).toBeVisible()
  })

  test('should login successfully with admin credentials', async ({ page }) => {
    await page.goto('/login')

    // Fill in admin credentials
    await page.fill('input[name="email"]', 'admin@example.com')
    await page.fill('input[name="password"]', 'Admin1234!')

    // Submit form
    await page.click('button[type="submit"]')

    // Should redirect to admin page
    await expect(page).toHaveURL('/admin')

    // Should show admin dashboard
    await expect(page.locator('h1')).toContainText('Admin Dashboard')
    await expect(page.locator('text=admin@example.com')).toBeVisible()
    await expect(page.locator('span.text-red-600.font-bold:has-text("admin")')).toBeVisible()
  })

  test('should login successfully with user credentials', async ({ page }) => {
    await page.goto('/login')

    // Fill in user credentials
    await page.fill('input[name="email"]', 'user@example.com')
    await page.fill('input[name="password"]', 'User1234!')

    // Submit form
    await page.click('button[type="submit"]')

    // Should redirect to admin page
    await expect(page).toHaveURL('/admin')

    // Should show user info
    await expect(page.locator('text=user@example.com')).toBeVisible()
    await expect(page.locator('span.text-blue-600:has-text("user")')).toBeVisible()
  })

  test('should show error with invalid credentials', async ({ page }) => {
    await page.goto('/login')

    // Fill in invalid credentials
    await page.fill('input[name="email"]', 'wrong@example.com')
    await page.fill('input[name="password"]', 'WrongPassword!')

    // Submit form
    await page.click('button[type="submit"]')

    // Should stay on login page
    await expect(page).toHaveURL('/login')

    // Should show error message
    await expect(page.locator('div.rounded-md.bg-red-50[role="alert"]')).toContainText('이메일 또는 비밀번호가 올바르지 않습니다')
  })

  test('should redirect to login when accessing admin without authentication', async ({ page }) => {
    await page.goto('/admin')

    // Should redirect to login
    await expect(page).toHaveURL('/login')
  })

  test('should logout successfully', async ({ page }) => {
    // Login first
    await page.goto('/login')
    await page.fill('input[name="email"]', 'admin@example.com')
    await page.fill('input[name="password"]', 'Admin1234!')
    await page.click('button[type="submit"]')

    await expect(page).toHaveURL('/admin')

    // Logout
    await page.click('button[type="submit"]:has-text("로그아웃")')

    // Should redirect to home
    await expect(page).toHaveURL('/')

    // Should show login button
    await expect(page.locator('a:has-text("로그인")')).toBeVisible()
  })

  test('should show user status on home page when logged in', async ({ page }) => {
    // Login
    await page.goto('/login')
    await page.fill('input[name="email"]', 'admin@example.com')
    await page.fill('input[name="password"]', 'Admin1234!')
    await page.click('button[type="submit"]')

    // Wait for redirect to admin page
    await expect(page).toHaveURL('/admin')

    // Go to home
    await page.goto('/')

    // Should show user email and role
    await expect(page.locator('text=admin@example.com')).toBeVisible()
    await expect(page.locator('text=(admin)')).toBeVisible()

    // Should show admin dashboard link
    await expect(page.locator('a:has-text("Admin Dashboard")')).toBeVisible()
  })
})
