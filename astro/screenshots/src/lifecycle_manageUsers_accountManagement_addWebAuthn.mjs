const bootstrapSettingsSelector = 'fieldset:has(#tenant_webAuthnConfiguration_bootstrapWorkflow_enabled-form-row):not(:has(#tenant_webAuthnConfiguration_reauthenticationWorkflow_enabled-form-row))';

export async function setup_lifecycle_manageUsers_accountManagement_addWebAuthn_1(page, ctx) {
  if (ctx?.name !== 'lifecycle_manageUsers_accountManagement_addWebAuthn_1') return;
  try {
    const bootstrapSettings = page.locator(bootstrapSettingsSelector).first();
    await bootstrapSettings.waitFor({ timeout: 5000 });
    await bootstrapSettings.evaluate(element => element.scrollIntoView({ block: 'center', behavior: 'instant' }));
    await page.waitForTimeout(300);
  } catch (error) {
    throw new Error(`lifecycle_manageUsers_accountManagement_addWebAuthn_1: setup failed: ${error.message}`, { cause: error });
  }
}

export async function setup_lifecycle_manageUsers_accountManagement_addWebAuthn_2(page, ctx, baseUrl, appId, tenantId) {
  if (ctx?.name !== 'lifecycle_manageUsers_accountManagement_addWebAuthn_2') return;
  try {
    const loginUrl = `${baseUrl}/oauth2/authorize?client_id=${appId}&response_type=code&redirect_uri=https%3A%2F%2Fexample.com&scope=openid&prompt=login&tenantId=${tenantId}`;
    await page.goto(loginUrl, { waitUntil: 'networkidle' });
    await page.waitForSelector('#loginId', { timeout: 5000 });
    await page.fill('#loginId', 'richard@piedpiper.com');
    await page.fill('#password', 'password');
    await page.locator('#submit-button').click();
    try { await page.waitForURL(/example\.com/, { timeout: 8000 }); } catch {}

    const passkeysUrl = `${baseUrl}/account/webauthn/?client_id=${appId}&tenantId=${tenantId}`;
    await page.goto(passkeysUrl, { waitUntil: 'networkidle' });
    await page.locator('a, button').filter({ hasText: /add passkey/i }).first().click({ timeout: 5000 });
    const displayName = page.getByLabel(/display name/i).first();
    await displayName.waitFor({ timeout: 5000 });
    await displayName.fill('Safari Touch ID');
    await page.getByRole('button', { name: /submit/i }).waitFor({ timeout: 5000 });
    // Do not submit: that would start a native WebAuthn ceremony in the screenshot browser.
    await page.waitForTimeout(300);
  } catch (error) {
    const pageState = await page.evaluate(() => ({ url: location.href, text: document.body.innerText.replace(/\s+/g, ' ').slice(0, 300) })).catch(() => null);
    throw new Error(`lifecycle_manageUsers_accountManagement_addWebAuthn_2: setup failed: ${error.message}; page state: ${JSON.stringify(pageState)}`, { cause: error });
  }
}

export async function setup_lifecycle_manageUsers_accountManagement_addWebAuthn_3(page, ctx, baseUrl, appId, tenantId) {
  if (ctx?.name !== 'lifecycle_manageUsers_accountManagement_addWebAuthn_3') return;
  try {
    const loginUrl = `${baseUrl}/oauth2/authorize?client_id=${appId}&response_type=code&redirect_uri=https%3A%2F%2Fexample.com&scope=openid&prompt=login&tenantId=${tenantId}`;
    await page.addInitScript(() => {
      if (navigator.credentials) navigator.credentials.get = () => new Promise(() => {});
    });
    await page.goto(loginUrl, { waitUntil: 'networkidle' });
    await page.waitForSelector('#loginId', { timeout: 5000 });
    await page.locator('a, button').filter({ hasText: /Fingerprint, device or key/i }).first().click({ timeout: 5000 });
    await page.waitForLoadState('networkidle');
    await page.waitForSelector('#loginId', { timeout: 5000 });
    await page.fill('#loginId', 'richard@piedpiper.com');
    await page.getByRole('button', { name: /submit/i }).click();
    await page.waitForLoadState('networkidle');
    await page.waitForTimeout(800);
  } catch (error) {
    const pageState = await page.evaluate(() => ({ url: location.href, text: document.body.innerText.replace(/\s+/g, ' ').slice(0, 300) })).catch(() => null);
    throw new Error(`lifecycle_manageUsers_accountManagement_addWebAuthn_3: setup failed: ${error.message}; page state: ${JSON.stringify(pageState)}`, { cause: error });
  }
}
