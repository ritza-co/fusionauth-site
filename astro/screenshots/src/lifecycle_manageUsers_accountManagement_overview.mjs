import { logInAsRichardHendricksViaTheHostedLoginPage, deleteRichardHendricksTwoFactorMethodsViaTheApi, computeOneTimeCodeFromBase32Secret } from './shared.mjs';

export async function setup_lifecycle_manageUsers_accountManagement_overview_1(page, ctx) {
  if (ctx?.name !== 'lifecycle_manageUsers_accountManagement_overview_1') return;
  try {
    await page.waitForFunction(
      () => [...document.querySelectorAll('td')].some(td => td.textContent.trim() === 'Pied Piper'),
      { timeout: 5000 }
    );
    // the row's actions live behind an el-dropdown: open it, then click the now-visible View item.
    // two gotchas: dropdown items have no rendered text until the popover is open, and element text
    // is whitespace-padded ("\n  View  \n"), so anchored hasText regexes need \s* tolerance.
    const row = page.locator('tr', { has: page.locator('td', { hasText: /^\s*Pied Piper\s*$/ }) }).first();
    await row.locator('button').first().click({ timeout: 5000 });
    await page.waitForTimeout(500);
    await page.locator('a:visible').filter({ hasText: /^\s*View\s*$/ }).first().click({ timeout: 5000 });
    // wait for the Details modal to render
    await page.getByText(/account url/i).first().waitFor({ timeout: 5000 });
    await page.waitForTimeout(300);
  } catch (e) {
    throw new Error(`lifecycle_manageUsers_accountManagement_overview_1: setup failed: ${e.message}`, { cause: e });
  }
}

export async function setup_lifecycle_manageUsers_accountManagement_overview_2(page, ctx, baseUrl, appId, tenantId) {
  if (ctx?.name !== 'lifecycle_manageUsers_accountManagement_overview_2') return;
  try {
    // the shared browser session is already logged in, so the self-service URL would capture the
    // account home; prompt=login on the authorize endpoint forces the login form to render instead
    const loginUrl = `${baseUrl}/oauth2/authorize?client_id=${appId}&redirect_uri=${encodeURIComponent(`/account/login?client_id=${appId}&tenantId=${tenantId}`)}&response_type=code&scope=offline_access&prompt=login&tenantId=${tenantId}`;
    await page.goto(loginUrl, { waitUntil: 'networkidle' });
    await page.waitForSelector('#loginId', { timeout: 5000 });
  } catch (e) {
    throw new Error(`lifecycle_manageUsers_accountManagement_overview_2: setup failed: ${e.message}`, { cause: e });
  }
}

export async function setup_lifecycle_manageUsers_accountManagement_overview_3(page, ctx, baseUrl, appId, tenantId) {
  if (ctx?.name !== 'lifecycle_manageUsers_accountManagement_overview_3') return;
  try {
    if (await page.$('#loginId')) await logInAsRichardHendricksViaTheHostedLoginPage(page);
    // the login hop always returns to /account/, so navigate back to the edit screen
    await page.goto(`${baseUrl}/account/edit?client_id=${appId}&tenantId=${tenantId}`);
    await page.locator('label', { hasText: /change password/i }).first().click({ timeout: 5000 });
    // the toggle reveals the password entry and confirmation fields
    await page.waitForSelector('input[type="password"]', { timeout: 5000 });
    await page.waitForTimeout(300);
  } catch (e) {
    throw new Error(`lifecycle_manageUsers_accountManagement_overview_3: setup failed: ${e.message}`, { cause: e });
  }
}

export async function setup_lifecycle_manageUsers_accountManagement_overview_4(page, ctx) {
  if (ctx?.name !== 'lifecycle_manageUsers_accountManagement_overview_4') return;
  try {
    if (await page.$('#loginId')) await logInAsRichardHendricksViaTheHostedLoginPage(page);
    await page.getByText(/manage two-factor/i).first().waitFor({ timeout: 5000 });
    await page.waitForTimeout(300);
  } catch (e) {
    throw new Error(`lifecycle_manageUsers_accountManagement_overview_4: setup failed: ${e.message}`, { cause: e });
  }
}

export async function setup_lifecycle_manageUsers_accountManagement_overview_5(page, ctx, baseUrl, appId) {
  if (ctx?.name !== 'lifecycle_manageUsers_accountManagement_overview_5') return;
  try {
    if (await page.$('#loginId')) await logInAsRichardHendricksViaTheHostedLoginPage(page);
    // remove any leftover method so the page shows an empty methods list
    await deleteRichardHendricksTwoFactorMethodsViaTheApi();
    await page.goto(`${baseUrl}/account/two-factor/?client_id=${appId}`);
    await page.getByText(/no methods have been configured|add two-factor/i).first().waitFor({ timeout: 5000 });
    await page.waitForTimeout(300);
  } catch (e) {
    throw new Error(`lifecycle_manageUsers_accountManagement_overview_5: setup failed: ${e.message}`, { cause: e });
  }
}

export async function setup_lifecycle_manageUsers_accountManagement_overview_6(page, ctx, baseUrl, appId) {
  if (ctx?.name !== 'lifecycle_manageUsers_accountManagement_overview_6') return;
  try {
    if (await page.$('#loginId')) await logInAsRichardHendricksViaTheHostedLoginPage(page);
    await deleteRichardHendricksTwoFactorMethodsViaTheApi();
    const codeField = page.locator('input[placeholder*="one-time"], #code, [name="code"]').first();
    if (!(await codeField.count())) {
      await page.goto(`${baseUrl}/account/two-factor/?client_id=${appId}`);
      await page.locator('a, button').filter({ hasText: /add two-factor/i }).first().click({ timeout: 5000 });
      await page.waitForLoadState('networkidle');
    }
    await codeField.waitFor({ timeout: 5000 });
    // the enable page shows the Base32 secret in the instructions text
    const secret = await page.evaluate(() => {
      const text = document.body.innerText;
      const named = text.match(/[Bb]ase32[^A-Z2-7]{0,40}([A-Z2-7]{16,})/) || text.match(/\b([A-Z2-7]{20,})\b/);
      return named && named[1];
    });
    if (!secret) throw new Error('TOTP secret not found on the enable page');
    await codeField.fill(await computeOneTimeCodeFromBase32Secret(secret));
    // the Enable button's text is whitespace-padded in the DOM, so hasText /^Enable$/ never matches;
    // use an exact accessible-name match instead
    await page.getByRole('button', { name: 'Enable', exact: true }).click({ timeout: 5000 });
    // the recovery codes render on the same page after enabling
    await page.getByText(/recovery codes/i).first().waitFor({ timeout: 5000 });
    // remove the method again; the codes stay rendered in the DOM for the capture
    await deleteRichardHendricksTwoFactorMethodsViaTheApi();
    await page.waitForTimeout(300);
  } catch (e) {
    throw new Error(`lifecycle_manageUsers_accountManagement_overview_6: setup failed: ${e.message}`, { cause: e });
  }
}
