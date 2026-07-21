const { test, expect } = require('@playwright/test');

test('FusionAuth admin login', async ({ page }) => {
  test.setTimeout(60000);
  await page.goto('http://localhost:9011/admin/');
  await page.waitForLoadState('networkidle');

  await page.getByPlaceholder('Login').fill('admin@example.com');
  await page.getByPlaceholder('Password').fill('password');
  await page.getByRole('button', { name: 'Submit' }).click();

  await expect(page).toHaveURL(/\/admin\//);
  await expect(page.locator('body')).toContainText('admin@example.com');
});

test('App OAuth login via FusionAuth', async ({ page }) => {
  await page.goto('http://localhost:3000');

  await expect(page.getByRole('heading', { name: /Welcome to Changebank/i })).toBeVisible();

  await page.getByText(/log in or create a new account/i).click();

  await page.waitForURL(/\/api\/auth\/signin/);

  await page.getByRole('button', { name: /FusionAuth/i }).click();

  await page.waitForURL(/localhost:9011/);

  await page.getByPlaceholder('Login').fill('richard@example.com');
  await page.getByPlaceholder('Password').fill('password');
  await page.getByRole('button', { name: 'Submit' }).click();

  await page.waitForURL(/localhost:3000/);

  await expect(page.getByRole('heading', { name: /Your balance/i })).toBeVisible();
  await expect(page.getByText('richard@example.com')).toBeVisible();
  await expect(page.getByRole('button', { name: /Log out/i })).toBeVisible();
});
