const { test, expect } = require('@playwright/test');

const fusionAuthUrl = 'http://localhost:9011';
const appUrl = 'http://localhost:3000';
const apiKey = '33052c8a-c283-4e96-9d2a-eb1215c69f8f-not-for-prod';
const applicationId = 'e9fdb985-9173-4e01-9d73-ac2d60d1dc8e';
const userEmail = 'richard@example.com';
const userPassword = 'password';

async function loginViaUi(page) {
  await page.goto(`${appUrl}/`);
  await page.getByRole('link', { name: 'Login' }).click();
  await page.locator('input[name="loginId"]').fill(userEmail);
  await page.locator('input[name="password"]').fill(userPassword);
  await page.locator('input[name="password"]').press('Enter');
  await expect(page).toHaveURL(/\/todos/);
}

test('Admin can log in to FusionAuth Admin UI', { timeout: 60000 }, async ({ page }) => {
  await page.goto(`${fusionAuthUrl}/admin/`);
  await page.waitForLoadState('networkidle');
  await page.getByPlaceholder('Login').fill('admin@example.com');
  await page.getByPlaceholder('Password').fill('password');
  await page.getByRole('button', { name: 'Submit' }).click();
  await expect(page).toHaveURL(/\/admin\//);
  await expect(page.getByRole('heading', { name: 'Recent logins' })).toBeVisible();
});

test('Kickstart user can log in via the API', { timeout: 5000 }, async ({ request }) => {
  const loginResponse = await request.post(`${fusionAuthUrl}/api/login`, {
    headers: { Authorization: apiKey, 'Content-Type': 'application/json' },
    data: { loginId: userEmail, password: userPassword, applicationId },
  });
  expect(loginResponse.ok()).toBeTruthy();
  const loginData = await loginResponse.json();
  expect(loginData.token).toBeTruthy();
});

test('Todo API without cookies is rejected', { timeout: 5000 }, async ({ request }) => {
  const response = await request.get(`${appUrl}/api/todos`);
  expect(response.status()).toBe(403);
});

test('User logs in and sees the seeded todos', { timeout: 5000 }, async ({ page }) => {
  await loginViaUi(page);
  await expect(page.getByText(`Todos for ${userEmail}`)).toBeVisible();
  await expect(page.getByText('Get milk')).toBeVisible();
  await expect(page.getByText('Read OAuth guide')).toBeVisible();
  await expect(page.locator('.chk[data-id="1"]')).toBeChecked();
  await expect(page.locator('.chk[data-id="2"]')).not.toBeChecked();

  const apiResponse = await page.request.get(`${appUrl}/api/todos`);
  expect(apiResponse.ok()).toBeTruthy();
  expect(await apiResponse.json()).toEqual([
    { id: 1, task: 'Get milk', done: true },
    { id: 2, task: 'Read OAuth guide', done: false },
  ]);
});

test('Checking a todo persists it across refresh', { timeout: 5000 }, async ({ page }) => {
  await loginViaUi(page);
  await expect(page.getByText(`Todos for ${userEmail}`)).toBeVisible();
  await expect(page.locator('.chk[data-id="1"]')).toBeChecked();
  await expect(page.locator('.chk[data-id="2"]')).not.toBeChecked();

  const saved = page.waitForResponse((response) => response.url().includes('/api/todos/complete/2') && response.status() === 200);
  await page.locator('.chk[data-id="2"]').check();
  await saved;
  await expect(page.locator('.chk[data-id="2"]')).toBeChecked();

  await page.reload();
  await expect(page.getByText(`Todos for ${userEmail}`)).toBeVisible();
  await expect(page.locator('.chk[data-id="1"]')).toBeChecked();
  await expect(page.locator('.chk[data-id="2"]')).toBeChecked();
});

test('Unchecking a todo persists it across refresh', { timeout: 5000 }, async ({ page }) => {
  await loginViaUi(page);
  await expect(page.getByText(`Todos for ${userEmail}`)).toBeVisible();
  await expect(page.locator('.chk[data-id="1"]')).toBeChecked();
  await expect(page.locator('.chk[data-id="2"]')).toBeChecked();

  const uncompleted = page.waitForResponse(
    (response) => response.url().includes('/api/todos/uncomplete/1') && response.status() === 200
  );
  await page.locator('.chk[data-id="1"]').uncheck();
  await uncompleted;
  await expect(page.locator('.chk[data-id="1"]')).not.toBeChecked();

  await page.reload();
  await expect(page.getByText(`Todos for ${userEmail}`)).toBeVisible();
  await expect(page.locator('.chk[data-id="1"]')).not.toBeChecked();
  await expect(page.locator('.chk[data-id="2"]')).toBeChecked();

  // Re-check so the next test starts from both checked.
  const recompleted = page.waitForResponse(
    (response) => response.url().includes('/api/todos/complete/1') && response.status() === 200
  );
  await page.locator('.chk[data-id="1"]').check();
  await recompleted;
  await expect(page.locator('.chk[data-id="1"]')).toBeChecked();
});

test('Logout clears access, relogin keeps completed todos', { timeout: 5000 }, async ({ page }) => {
  await loginViaUi(page);
  await expect(page.getByText(`Todos for ${userEmail}`)).toBeVisible();
  await expect(page.locator('.chk[data-id="1"]')).toBeChecked();
  await expect(page.locator('.chk[data-id="2"]')).toBeChecked();

  await page.getByRole('link', { name: 'Logout' }).click();
  await expect(page.getByRole('link', { name: 'Login' })).toBeVisible();
  const afterLogout = await page.request.get(`${appUrl}/api/todos`);
  expect(afterLogout.status()).toBe(403);

  await loginViaUi(page);
  await expect(page.getByText(`Todos for ${userEmail}`)).toBeVisible();
  await expect(page.getByText('Get milk')).toBeVisible();
  await expect(page.getByText('Read OAuth guide')).toBeVisible();
  await expect(page.locator('.chk[data-id="1"]')).toBeChecked();
  await expect(page.locator('.chk[data-id="2"]')).toBeChecked();
});
