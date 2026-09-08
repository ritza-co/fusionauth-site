const { test, expect } = require('@playwright/test');

function trackPageDiagnostics(page) {
  const consoleMessages = [];
  const pageErrors = [];

  page.on('console', msg => {
    consoleMessages.push(`[${msg.type()}] ${msg.text()}`);
  });

  page.on('pageerror', err => {
    pageErrors.push(err.message);
  });

  return async () => {
    console.log('\n=== DEBUG INFO ===');
    console.log('Page URL:', page.url());
    try {
      console.log('Page HTML:', await page.content());
    } catch (contentError) {
      console.log('Page HTML: <unavailable, page/context already closed>', contentError.message);
    }
    console.log('\nConsole messages:', consoleMessages);
    console.log('\nPage errors:', pageErrors);
    console.log('=== END DEBUG ===\n');
  };
}

test('FusionAuth admin login', async ({ page }) => {
  const dumpDiagnostics = trackPageDiagnostics(page);

  try {
    await page.goto('http://localhost:9011/admin/');
    await page.waitForLoadState('networkidle');

    await page.getByPlaceholder('Login').fill('admin@example.com');
    await page.getByPlaceholder('Password').fill('password');
    await page.getByRole('button', { name: 'Submit' }).click();

    await expect(page).toHaveURL(/\/admin\//);
    await expect(page.getByRole('heading', { name: 'Recent logins' })).toBeVisible();
  } catch (error) {
    await dumpDiagnostics();
    throw error;
  }
});

test('Angular app login and logout via FusionAuth', async ({ page }) => {
  const dumpDiagnostics = trackPageDiagnostics(page);

  try {
    await page.goto('http://localhost:4200/');

    await expect(page.getByRole('button', { name: 'Login' })).toBeVisible();
    await page.getByRole('button', { name: 'Login' }).click();

    await page.waitForURL(/localhost:9011/, { timeout: 15000 });
    await page.getByPlaceholder('Login').fill('richard@example.com');
    await page.getByPlaceholder('Password').fill('password');
    await page.getByRole('button', { name: 'Submit' }).click();

    await page.waitForURL(/localhost:4200\/account/, { timeout: 15000 });
    await expect(page.getByText('richard@example.com')).toBeVisible();
    await expect(page.locator('#logo-header').getByText('Logout')).toBeVisible();

    await page.locator('#logo-header').getByText('Logout').click();
    await page.waitForURL(/localhost:4200\/logged-out/, { timeout: 15000 });
    await expect(page.locator('#logo-header').getByText('Login')).toBeVisible();
  } catch (error) {
    await dumpDiagnostics();
    throw error;
  }
});

test('Make Change calculates change correctly', async ({ page }) => {
  const dumpDiagnostics = trackPageDiagnostics(page);

  try {
    await page.goto('http://localhost:4200/');
    await page.getByRole('button', { name: 'Login' }).click();

    await page.waitForURL(/localhost:9011/);
    await page.getByPlaceholder('Login').fill('richard@example.com');
    await page.getByPlaceholder('Password').fill('password');
    await page.getByRole('button', { name: 'Submit' }).click();

    await page.waitForURL(/localhost:4200\/account/);
    await page.goto('http://localhost:4200/make-change');

    // These amounts are the ones that expose floating-point error: computing
    // them as dollars rather than whole cents drops a cent, so 0.29 renders as
    // "$0.28 with 5 nickels and 3 pennies".
    const cases = [
      { amount: '0.29', total: '$0.29', nickels: '5', pennies: '4' },
      { amount: '0.58', total: '$0.58', nickels: '11', pennies: '3' },
      { amount: '1.02', total: '$1.02', nickels: '20', pennies: '2' },
      { amount: '0.15', total: '$0.15', nickels: '3', pennies: '0' },
    ];

    for (const { amount, total, nickels, pennies } of cases) {
      await page.locator('input[name="amount"]').fill(amount);
      await page.locator('input.change-submit').click();

      await expect(page.locator('.change-message')).toHaveText(
        `We can make change for ${total} with ${nickels} nickels and ${pennies} pennies!`
      );
    }
  } catch (error) {
    await dumpDiagnostics();
    throw error;
  }
});
