export async function logInAsRichardHendricksViaTheHostedLoginPage(page) {
  await page.fill('#loginId', 'richard@piedpiper.com');
  await page.fill('#password', 'password');
  await page.locator('#submit-button').click();
  // the hosted login redirects back to the /account/ page that initiated it
  await page.waitForURL(/\/account\//, { timeout: 5000 });
  await page.waitForLoadState('networkidle');
}

export async function deleteRichardHendricksTwoFactorMethodsViaTheApi() {
  const richardId = '00000000-0000-0000-0000-100000000001';
  await fetch(`http://localhost:9011/api/user/two-factor/${richardId}`, {
    method: 'DELETE',
    headers: { 'Authorization': 'screenshot-dev-key-not-for-production' },
  });
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
