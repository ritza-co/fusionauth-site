const { test, expect } = require('@playwright/test');

test('FusionAuth admin login', async ({ page }) => {
  await page.goto('http://localhost:9011');

  await page.getByRole('textbox', { name: /login/i }).fill('admin@example.com');
  await page.getByRole('textbox', { name: /password/i }).fill('password');
  await page.getByRole('button', { name: /submit/i }).click();

  await expect(page).toHaveURL(/\/admin\//);
  await expect(page.getByText('admin@example.com')).toBeVisible();
});

test('Rails app OAuth login via FusionAuth', async ({ page }) => {
  await page.goto('http://localhost:3000');

  await expect(page.getByRole('heading', { name: /Login to manage your account/i })).toBeVisible();

  await page.getByRole('button', { name: /Login/i }).click();

  await page.waitForURL(/localhost:9011/);

  await page.getByRole('textbox', { name: /login/i }).fill('richard@example.com');
  await page.getByRole('textbox', { name: /password/i }).fill('password');
  await page.getByRole('button', { name: /submit/i }).click();

  await page.waitForURL(/localhost:3000/);

  await expect(page.getByRole('heading', { name: /Welcome Richard/i })).toBeVisible();
  await expect(page.getByText('richard@example.com')).toBeVisible();
  await expect(page.getByRole('button', { name: /Logout/i })).toBeVisible();
});
