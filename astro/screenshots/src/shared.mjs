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
