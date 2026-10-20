import {
  logInAsRichardHendricksViaTheHostedLoginPage,
  getTenantEmailTwoFactorConfigurationViaTheApi,
  setTenantEmailTwoFactorConfigurationViaTheApi,
  getApplicationMultiFactorDebugInfoViaTheApi,
  getDefaultTwoFactorEmailTemplateIdViaTheApi,
} from './shared.mjs';

async function withTenantEmailTwoFactorEnabled(tenantId, callback) {
  const originalConfiguration = await getTenantEmailTwoFactorConfigurationViaTheApi(tenantId);
  const templateId = originalConfiguration.templateId || await getDefaultTwoFactorEmailTemplateIdViaTheApi();
  try {
    await setTenantEmailTwoFactorConfigurationViaTheApi(tenantId, {
      ...originalConfiguration,
      enabled: true,
      templateId,
    });
    return await callback();
  } finally {
    await setTenantEmailTwoFactorConfigurationViaTheApi(tenantId, originalConfiguration);
  }
}

export async function setup_lifecycle_manageUsers_accountManagement_twoFactorEmail_1(page, ctx, baseUrl, tenantId) {
  if (ctx?.name !== 'lifecycle_manageUsers_accountManagement_twoFactorEmail_1') return;
  try {
    await withTenantEmailTwoFactorEnabled(tenantId, async () => {
      await page.goto(`${baseUrl}/admin/tenant/edit/${tenantId}`, { waitUntil: 'networkidle' });
      await page.locator('el-tab-list button').filter({ hasText: /^\s*Multi-Factor\s*$/ }).first().click({ timeout: 5000 });
      const emailMfaLabel = page.getByText(/enable email MFA/i).first();
      await emailMfaLabel.waitFor({ timeout: 5000 });
      await emailMfaLabel.evaluate(el => {
        let target = el;
        for (let parent = el.parentElement, depth = 0; parent && depth < 5; parent = parent.parentElement, depth++) {
          if (parent.querySelector('input[type="checkbox"], [role="switch"], button[aria-checked]')) {
            target = parent;
            break;
          }
        }
        target.setAttribute('data-screenshot-highlight', 'email-two-factor-settings');
        target.scrollIntoView({ block: 'center', behavior: 'instant' });
      });
      await page.waitForTimeout(300);
    });
  } catch (e) {
    throw new Error(`lifecycle_manageUsers_accountManagement_twoFactorEmail_1: setup failed: ${e.message}`, { cause: e });
  }
}

export async function setup_lifecycle_manageUsers_accountManagement_twoFactorEmail_2(page, ctx, baseUrl, tenantId, appId) {
  if (ctx?.name !== 'lifecycle_manageUsers_accountManagement_twoFactorEmail_2') return;
  try {
    await withTenantEmailTwoFactorEnabled(tenantId, async () => {
      const twoFactorUrl = `${baseUrl}/account/two-factor/?client_id=${appId}&tenantId=${tenantId}`;
      const loginUrl = `${baseUrl}/oauth2/authorize?client_id=${appId}&redirect_uri=${encodeURIComponent(`/account/login?client_id=${appId}&tenantId=${tenantId}`)}&response_type=code&scope=offline_access&prompt=login&tenantId=${tenantId}`;
      await page.goto(loginUrl, { waitUntil: 'networkidle' });
      await page.waitForSelector('#loginId', { timeout: 5000 });
      await logInAsRichardHendricksViaTheHostedLoginPage(page);
      await page.goto(twoFactorUrl, { waitUntil: 'networkidle' });

      await page.locator('a, button').filter({ hasText: /add two-factor/i }).first().click({ timeout: 5000 });
      await page.waitForLoadState('networkidle');

      const methodPicker = page.getByLabel(/select a method/i);
      if (await methodPicker.count()) {
        const emailOptionValue = await methodPicker.locator('option').evaluateAll(options =>
          options.find(option => !option.disabled && /email/i.test(option.textContent || ''))?.value ?? null,
        );
        if (!emailOptionValue) {
          const options = (await methodPicker.locator('option').allTextContents()).map(text => text.trim()).filter(Boolean);
          const [tenantEmail, appInfo] = await Promise.all([
            getTenantEmailTwoFactorConfigurationViaTheApi(tenantId),
            getApplicationMultiFactorDebugInfoViaTheApi(appId),
          ]);
          throw new Error(`Email method is unavailable; methods shown: ${options.join(', ') || '(none)'}. Tenant email MFA: ${JSON.stringify(tenantEmail)}. Application tenant/MFA: ${JSON.stringify(appInfo)}`);
        }
        await methodPicker.selectOption(emailOptionValue);
      }

      const emailField = page.locator('input[type="email"], input[name="email"], #email').first();
      await emailField.waitFor({ timeout: 5000 });
      await emailField.fill('example@email.com');
      await page.getByRole('button', { name: /send a one-time[- ]code/i }).waitFor({ timeout: 5000 });
      await page.waitForTimeout(300);
    });
  } catch (e) {
    throw new Error(`lifecycle_manageUsers_accountManagement_twoFactorEmail_2: setup failed: ${e.message}`, { cause: e });
  }
}
