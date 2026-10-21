let FUSIONAUTH_BASE_URL;
let FUSIONAUTH_API_KEY;
let FUSIONAUTH_API_HEADERS;
let RICHARD_HENDRICKS_USER_ID;

export function setConstants({ baseUrl, apiKey, richardHendricksUserId }) {
  FUSIONAUTH_BASE_URL = baseUrl;
  FUSIONAUTH_API_KEY = apiKey;
  FUSIONAUTH_API_HEADERS = { 'Authorization': FUSIONAUTH_API_KEY, 'Content-Type': 'application/json' };
  RICHARD_HENDRICKS_USER_ID = richardHendricksUserId;
}

export async function logInAsRichardHendricksViaTheHostedLoginPage(page) {
  await page.fill('#loginId', 'richard@piedpiper.com');
  await page.fill('#password', 'password');
  await page.locator('#submit-button').click();
  // the hosted login redirects back to the /account/ page that initiated it
  await page.waitForURL(/\/account\//, { timeout: 5000 });
  await page.waitForLoadState('networkidle');
}

export async function deleteRichardHendricksTwoFactorMethodsViaTheApi() {
  const userResp = await fetch(`${FUSIONAUTH_BASE_URL}/api/user/${RICHARD_HENDRICKS_USER_ID}`, { headers: FUSIONAUTH_API_HEADERS });
  if (!userResp.ok) throw new Error(`GET /api/user/${RICHARD_HENDRICKS_USER_ID} ${userResp.status}`);
  const { user } = await userResp.json();
  const methods = user?.twoFactor?.methods ?? [];
  if (!methods.length) return;

  // the disable endpoint requires a verification code we cannot compute (the TOTP secret is gone by
  // cleanup time), but a recovery code is accepted too and, per the API docs, removes ALL methods.
  const codesResp = await fetch(`${FUSIONAUTH_BASE_URL}/api/user/two-factor/recovery-code/${RICHARD_HENDRICKS_USER_ID}`, { method: 'POST', headers: FUSIONAUTH_API_HEADERS });
  if (!codesResp.ok) throw new Error(`POST /api/user/two-factor/recovery-code ${codesResp.status} ${await codesResp.text()}`);
  const { recoveryCodes } = await codesResp.json();

  const delResp = await fetch(`${FUSIONAUTH_BASE_URL}/api/user/two-factor/${RICHARD_HENDRICKS_USER_ID}`, {
    method: 'DELETE',
    headers: FUSIONAUTH_API_HEADERS,
    body: JSON.stringify({ methodId: methods[0].id, code: recoveryCodes[0] }),
  });
  if (!delResp.ok) throw new Error(`DELETE /api/user/two-factor ${delResp.status} ${await delResp.text()}`);

  const verifyResp = await fetch(`${FUSIONAUTH_BASE_URL}/api/user/${RICHARD_HENDRICKS_USER_ID}`, { headers: FUSIONAUTH_API_HEADERS });
  if (!verifyResp.ok) throw new Error(`GET /api/user/${RICHARD_HENDRICKS_USER_ID} ${verifyResp.status}`);
  const { user: after } = await verifyResp.json();
  if (after?.twoFactor?.methods?.length) throw new Error('two-factor methods still present after delete');
}

export async function getRichardHendricksRegistrationViaTheApi(appId) {
  const resp = await fetch(`${FUSIONAUTH_BASE_URL}/api/user/registration/${RICHARD_HENDRICKS_USER_ID}/${appId}`, { headers: FUSIONAUTH_API_HEADERS });
  if (!resp.ok) throw new Error(`GET /api/user/registration ${resp.status} ${await resp.text()}`);
  return (await resp.json()).registration;
}

export async function deleteRichardHendricksRegistrationViaTheApi(appId) {
  const resp = await fetch(`${FUSIONAUTH_BASE_URL}/api/user/registration/${RICHARD_HENDRICKS_USER_ID}/${appId}`, { method: 'DELETE', headers: FUSIONAUTH_API_HEADERS });
  if (!resp.ok) throw new Error(`DELETE /api/user/registration ${resp.status} ${await resp.text()}`);
}

export async function createRichardHendricksRegistrationViaTheApi(appId, registration) {
  const resp = await fetch(`${FUSIONAUTH_BASE_URL}/api/user/registration/${RICHARD_HENDRICKS_USER_ID}/${appId}`, {
    method: 'POST',
    headers: FUSIONAUTH_API_HEADERS,
    body: JSON.stringify({ registration }),
  });
  if (!resp.ok) throw new Error(`POST /api/user/registration ${resp.status} ${await resp.text()}`);
}

export async function getSelfServiceFormIdOnApplicationViaTheApi(appId) {
  const resp = await fetch(`${FUSIONAUTH_BASE_URL}/api/application/${appId}`, { headers: FUSIONAUTH_API_HEADERS });
  if (!resp.ok) throw new Error(`GET /api/application/${appId} ${resp.status}`);
  return (await resp.json()).application?.formConfiguration?.selfServiceFormId ?? '';
}

export async function setSelfServiceFormIdOnApplicationViaTheApi(appId, selfServiceFormId) {
  const url = `${FUSIONAUTH_BASE_URL}/api/application/${appId}`;
  const resp = await fetch(url, {
    method: 'PATCH',
    headers: FUSIONAUTH_API_HEADERS,
    body: JSON.stringify({ application: { formConfiguration: { selfServiceFormId } } }),
  });
  if (!resp.ok) throw new Error(`PATCH /api/application/${appId} ${resp.status} ${await resp.text()}`);

  const expected = selfServiceFormId ?? '';
  let actual = '';
  for (let attempt = 0; attempt < 5; attempt++) {
    const verifyResp = await fetch(url, { headers: FUSIONAUTH_API_HEADERS });
    if (!verifyResp.ok) throw new Error(`GET /api/application/${appId} ${verifyResp.status} ${await verifyResp.text()}`);
    const { application } = await verifyResp.json();
    actual = application?.formConfiguration?.selfServiceFormId ?? '';
    if (actual === expected) return;
    await new Promise(resolve => setTimeout(resolve, 200));
  }
  throw new Error(`selfServiceFormId did not persist on application ${appId}: expected ${expected || '(empty)'}, received ${actual || '(empty)'}`);
}

export async function getTenantEmailTwoFactorConfigurationViaTheApi(tenantId) {
  const resp = await fetch(`${FUSIONAUTH_BASE_URL}/api/tenant/${tenantId}`, { headers: FUSIONAUTH_API_HEADERS });
  if (!resp.ok) throw new Error(`GET /api/tenant/${tenantId} ${resp.status} ${await resp.text()}`);
  const { tenant } = await resp.json();
  const email = tenant?.multiFactorConfiguration?.email;
  return { enabled: email?.enabled ?? false, templateId: email?.templateId ?? null };
}

export async function setTenantEmailTwoFactorConfigurationViaTheApi(tenantId, emailConfiguration) {
  const resp = await fetch(`${FUSIONAUTH_BASE_URL}/api/tenant/${tenantId}`, {
    method: 'PATCH',
    headers: FUSIONAUTH_API_HEADERS,
    body: JSON.stringify({ tenant: { multiFactorConfiguration: { email: emailConfiguration } } }),
  });
  if (!resp.ok) throw new Error(`PATCH /api/tenant/${tenantId} ${resp.status} ${await resp.text()}`);
}

export async function getApplicationMultiFactorDebugInfoViaTheApi(appId) {
  const resp = await fetch(`${FUSIONAUTH_BASE_URL}/api/application/${appId}`, { headers: FUSIONAUTH_API_HEADERS });
  if (!resp.ok) throw new Error(`GET /api/application/${appId} ${resp.status} ${await resp.text()}`);
  const { application } = await resp.json();
  return { tenantId: application?.tenantId, multiFactorConfiguration: application?.multiFactorConfiguration ?? null };
}

export async function getDefaultTwoFactorEmailTemplateIdViaTheApi() {
  const resp = await fetch(`${FUSIONAUTH_BASE_URL}/api/email/template`, { headers: FUSIONAUTH_API_HEADERS });
  if (!resp.ok) throw new Error(`GET /api/email/template ${resp.status} ${await resp.text()}`);
  const { emailTemplates = [] } = await resp.json();
  const template = emailTemplates.find(t => t.name === 'Two Factor Authentication');
  if (!template) throw new Error('Default Two Factor Authentication email template not found');
  return template.id;
}

export async function computeOneTimeCodeFromBase32Secret(secret) {
  const { createHmac } = await import('node:crypto');
  const alphabet = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ234567';
  let bits = '';
  for (const c of secret.toUpperCase()) bits += alphabet.indexOf(c).toString(2).padStart(5, '0');
  const key = Buffer.alloc(Math.floor(bits.length / 8));
  for (let i = 0; i < key.length; i++) key[i] = parseInt(bits.slice(i * 8, i * 8 + 8), 2);
  const counter = Buffer.alloc(8);
  counter.writeBigUInt64BE(BigInt(Math.floor(Date.now() / 30000)));
  const digest = createHmac('sha1', key).update(counter).digest();
  const offset = digest[digest.length - 1] & 0xf;
  const code = ((digest[offset] & 0x7f) << 24 | digest[offset + 1] << 16 | digest[offset + 2] << 8 | digest[offset + 3]) % 1_000_000;
  return String(code).padStart(6, '0');
}
