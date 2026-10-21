import { logInAsRichardHendricksViaTheHostedLoginPage } from './shared.mjs';

export async function setup_lifecycle_manageUsers_accountManagement_updatingUserData_1(page, ctx, baseUrl, appId, tenantId) {
  if (ctx?.name !== 'lifecycle_manageUsers_accountManagement_updatingUserData_1') return;
  try {
    const loginUrl = `${baseUrl}/oauth2/authorize?client_id=${appId}&redirect_uri=${encodeURIComponent(`/account/login?client_id=${appId}&tenantId=${tenantId}`)}&response_type=code&scope=offline_access&prompt=login&tenantId=${tenantId}`;
    await page.goto(loginUrl, { waitUntil: 'networkidle' });
    await page.waitForSelector('#loginId', { timeout: 5000 });
    await logInAsRichardHendricksViaTheHostedLoginPage(page);

    const accountUrl = `${baseUrl}/account/?client_id=${appId}&tenantId=${tenantId}&_=${Date.now()}`;
    await page.goto(accountUrl, { waitUntil: 'networkidle' });
    await page.locator('a, button').filter({ hasText: /edit profile/i }).first().click({ timeout: 5000 });
    await page.getByText(/change password/i).waitFor({ timeout: 5000 });
    await page.waitForTimeout(300);
  } catch (error) {
    throw new Error(`lifecycle_manageUsers_accountManagement_updatingUserData_1: setup failed: ${error.message}`, { cause: error });
  }
}
