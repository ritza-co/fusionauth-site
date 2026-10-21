import {
  logInAsAdminRichardViaTheHostedLoginPage,
  deleteAdminRichardTwoFactorMethodsViaTheApi,
  computeOneTimeCodeFromBase32Secret,
} from './shared.mjs';

async function openAuthenticatorEnrollment(page, baseUrl, appId) {
  await deleteAdminRichardTwoFactorMethodsViaTheApi();

  const twoFactorUrl = `${baseUrl}/account/two-factor/?client_id=${appId}`;
  await page.goto(twoFactorUrl, { waitUntil: 'networkidle' });
  if (await page.$('#loginId')) {
    await logInAsAdminRichardViaTheHostedLoginPage(page);
    await page.goto(twoFactorUrl, { waitUntil: 'networkidle' });
  }

  await page.locator('a, button').filter({ hasText: /add two-factor/i }).first().click({ timeout: 5000 });
  await page.waitForLoadState('networkidle');

  const methodPicker = page.getByLabel(/select a method/i);
  if (await methodPicker.count()) {
    await methodPicker.selectOption({ label: 'Authenticator app' });
  }
  await page.locator('input[placeholder*="one-time"], #code, [name="code"]').first().waitFor({ timeout: 5000 });
}

export async function setup1(page, ctx, baseUrl, tenantId) {
  if (ctx?.name !== 'lifecycle_manageUsers_accountManagement_twoFactorAuthenticator_1') return;
  try {
    await page.goto(`${baseUrl}/admin/tenant/edit/${tenantId}`, { waitUntil: 'networkidle' });
    const tab = page.locator('el-tab-list button').filter({ hasText: /^\s*Multi-Factor\s*$/ }).first();
    await tab.click({ timeout: 5000 });
    await page.getByText(/authenticator settings/i).waitFor({ timeout: 5000 });
    await page.waitForTimeout(300);
  } catch (e) {
    throw new Error(`lifecycle_manageUsers_accountManagement_twoFactorAuthenticator_1: setup failed: ${e.message}`, { cause: e });
  }
}

export async function setup2(page, ctx, baseUrl, appId) {
  if (ctx?.name !== 'lifecycle_manageUsers_accountManagement_twoFactorAuthenticator_2') return;
  try {
    await openAuthenticatorEnrollment(page, baseUrl, appId);
  } catch (e) {
    throw new Error(`lifecycle_manageUsers_accountManagement_twoFactorAuthenticator_2: setup failed: ${e.message}`, { cause: e });
  }
}

export async function setup3(page, ctx, baseUrl, appId, tenantId) {
  if (ctx?.name !== 'lifecycle_manageUsers_accountManagement_twoFactorAuthenticator_3') return;

  try {
    await openAuthenticatorEnrollment(page, baseUrl, appId);
    const secret = await page.evaluate(() => {
      const text = document.body.innerText;
      const named = text.match(/[Bb]ase32[^A-Z2-7]{0,40}([A-Z2-7]{16,})/) || text.match(/\b([A-Z2-7]{20,})\b/);
      return named && named[1];
    });
    if (!secret) throw new Error('TOTP secret not found on the enable page');

    const codeField = page.locator('input[placeholder*="one-time"], #code, [name="code"]').first();
    await codeField.fill(await computeOneTimeCodeFromBase32Secret(secret));
    await page.getByRole('button', { name: 'Enable', exact: true }).click({ timeout: 5000 });
    await page.getByText(/recovery codes/i).first().waitFor({ timeout: 5000 });

    const authorizeUrl = `${baseUrl}/oauth2/authorize?client_id=${appId}&response_type=code&redirect_uri=https%3A%2F%2Fexample.com&scope=openid&prompt=login&tenantId=${tenantId}`;
    await page.goto(authorizeUrl, { waitUntil: 'networkidle' });
    await page.locator('#loginId').waitFor({ timeout: 5000 });
    await page.fill('#loginId', 'richard@piedpiper.com');
    await page.fill('#password', 'password');
    await page.locator('#submit-button').click();
    await page.getByText(/authentication challenge/i).first().waitFor({ timeout: 10000 });
    await page.locator('input[placeholder*="verification code"], input[name="code"]').first().waitFor({ timeout: 5000 });
  } catch (e) {
    throw new Error(`lifecycle_manageUsers_accountManagement_twoFactorAuthenticator_3: setup failed: ${e.message}`, { cause: e });
  } finally {
    await deleteAdminRichardTwoFactorMethodsViaTheApi();
  }
}
