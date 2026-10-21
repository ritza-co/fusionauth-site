import { logInAsAdminRichardViaTheHostedLoginPage } from './shared.mjs';

export async function setup_lifecycle_manageUsers_accountManagement_twoFactorPhone_1(page, ctx, baseUrl, tenantId) {
  if (ctx?.name !== 'lifecycle_manageUsers_accountManagement_twoFactorPhone_1') return;
  try {
    await page.goto(`${baseUrl}/admin/tenant/edit/${tenantId}`, { waitUntil: 'networkidle' });
    await page.locator('el-tab-list button').filter({ hasText: /^\s*Multi-Factor\s*$/ }).first().click({ timeout: 5000 });
    const phoneSettingsHeading = page.locator('legend').filter({ hasText: /Phone settings/i }).first();
    await phoneSettingsHeading.waitFor({ timeout: 5000 });
    await phoneSettingsHeading.evaluate(legend => {
      const phoneSettings = legend.closest('fieldset');
      if (!phoneSettings) throw new Error('Phone settings fieldset not found');
      phoneSettings.setAttribute('data-screenshot-highlight', 'sms-two-factor-settings');
      phoneSettings.scrollIntoView({ block: 'center', behavior: 'instant' });
    });
    await page.waitForTimeout(300);
  } catch (error) {
    throw new Error(`lifecycle_manageUsers_accountManagement_twoFactorPhone_1: setup failed: ${error.message}`, { cause: error });
  }
}

export async function setup_lifecycle_manageUsers_accountManagement_twoFactorPhone_2(page, ctx, baseUrl, tenantId, appId) {
  if (ctx?.name !== 'lifecycle_manageUsers_accountManagement_twoFactorPhone_2') return;
  try {
    const twoFactorUrl = `${baseUrl}/account/two-factor/?client_id=${appId}&tenantId=${tenantId}`;
    const loginUrl = `${baseUrl}/oauth2/authorize?client_id=${appId}&redirect_uri=${encodeURIComponent(`/account/login?client_id=${appId}&tenantId=${tenantId}`)}&response_type=code&scope=offline_access&prompt=login&tenantId=${tenantId}`;
    await page.goto(loginUrl, { waitUntil: 'networkidle' });
    await page.waitForSelector('#loginId', { timeout: 5000 });
    await logInAsAdminRichardViaTheHostedLoginPage(page);
    await page.goto(twoFactorUrl, { waitUntil: 'networkidle' });

    await page.locator('a, button').filter({ hasText: /add two-factor/i }).first().click({ timeout: 5000 });
    await page.waitForLoadState('networkidle');

    const methodPicker = page.getByLabel(/select a method/i);
    await methodPicker.waitFor({ timeout: 5000 });
    const phoneOptionValue = await methodPicker.locator('option').evaluateAll(options =>
      options.find(option => !option.disabled && /phone/i.test(option.textContent || ''))?.value ?? null,
    );
    if (!phoneOptionValue) {
      const options = (await methodPicker.locator('option').allTextContents()).map(text => text.trim()).filter(Boolean);
      throw new Error(`Phone method is unavailable; methods shown: ${options.join(', ') || '(none)'}`);
    }
    await methodPicker.selectOption(phoneOptionValue);

    const phoneField = page.getByLabel(/mobile phone/i).first();
    await phoneField.waitFor({ timeout: 5000 });
    await phoneField.fill('+15555551234');
    await page.getByRole('button', { name: /send a one-time[- ]code/i }).waitFor({ timeout: 5000 });
    await page.waitForTimeout(300);
  } catch (error) {
    throw new Error(`lifecycle_manageUsers_accountManagement_twoFactorPhone_2: setup failed: ${error.message}`, { cause: error });
  }
}
