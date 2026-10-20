import {
  logInAsRichardHendricksViaTheHostedLoginPage,
  getRichardHendricksRegistrationViaTheApi,
  deleteRichardHendricksRegistrationViaTheApi,
  createRichardHendricksRegistrationViaTheApi,
  getSelfServiceFormIdOnApplicationViaTheApi,
  setSelfServiceFormIdOnApplicationViaTheApi,
} from './shared.mjs';

// unique query param so a cached page can never serve the pre-setup state
function freshUrl(url) {
  return `${url}${url.includes('?') ? '&' : '?'}_=${Date.now()}`;
}

// the banner is a dismissible toast and the harness screenshots with animations disabled, which
// fast-forwards the toast's exit animation to "hidden"; freeze the whole subtree, its wrappers and
// every timer so the banner is still on screen when the capture happens
async function freezeBanner(page, bannerText) {
  await page.evaluate((text) => {
    for (let i = 1; i < 99999; i++) { clearTimeout(i); clearInterval(i); }
    window.requestAnimationFrame = () => 0;
    const leaf = [...document.querySelectorAll('div, section, aside, p, span')]
      .reverse()
      .find(n => n.textContent.includes(text) && n.getClientRects().length && ![...n.children].some(c => c.textContent.includes(text)));
    const nodes = leaf ? [leaf, ...leaf.querySelectorAll('*')] : [];
    for (let n = leaf?.parentElement; n; n = n.parentElement) nodes.push(n);
    for (const n of nodes) {
      n.style.setProperty('animation', 'none', 'important');
      n.style.setProperty('transition', 'none', 'important');
      n.style.setProperty('opacity', '1', 'important');
      n.style.setProperty('visibility', 'visible', 'important');
      n.style.setProperty('transform', 'none', 'important');
    }
  }, bannerText);
}

export async function setup_lifecycle_manageUsers_accountManagement_troubleshooting_1(page, ctx, baseUrl, appId) {
  if (ctx?.name !== 'lifecycle_manageUsers_accountManagement_troubleshooting_1') return;
  try {
    const accountUrl = `${baseUrl}/account/?client_id=${appId}`;
    await page.goto(freshUrl(accountUrl), { waitUntil: 'networkidle' });
    if (await page.$('#loginId')) await logInAsRichardHendricksViaTheHostedLoginPage(page);
    // the banner needs a logged-in user without a registration; restoring the registration right
    // after it renders leaves the banner on screen for the capture
    const registration = await getRichardHendricksRegistrationViaTheApi(appId);
    try {
      await deleteRichardHendricksRegistrationViaTheApi(appId);
      await page.goto(freshUrl(accountUrl), { waitUntil: 'networkidle' });
      await page.getByText(/not registered for this application/i).filter({ visible: true }).first().waitFor({ timeout: 10000 });
      await freezeBanner(page, 'not registered for this application');
    } finally {
      await createRichardHendricksRegistrationViaTheApi(appId, registration);
    }
    await page.waitForTimeout(300);
  } catch (e) {
    throw new Error(`lifecycle_manageUsers_accountManagement_troubleshooting_1: setup failed: ${e.message}`, { cause: e });
  }
}

export async function setup_lifecycle_manageUsers_accountManagement_troubleshooting_2(page, ctx, baseUrl, appId) {
  if (ctx?.name !== 'lifecycle_manageUsers_accountManagement_troubleshooting_2') return;
  // the warning is only rendered on the account home's first render in a session, and the harness
  // session already rendered it without the warning; render in a throwaway session, then put the
  // shared session back for the remaining captures
  const sharedCookies = await page.context().cookies();
  const formId = await getSelfServiceFormIdOnApplicationViaTheApi(appId);
  try {
    await setSelfServiceFormIdOnApplicationViaTheApi(appId, '');
    await page.context().clearCookies();
    await page.goto(freshUrl(`${baseUrl}/account/?client_id=${appId}`), { waitUntil: 'networkidle' });
    if (await page.$('#loginId')) await logInAsRichardHendricksViaTheHostedLoginPage(page);
    await page.getByText(/configuration is incomplete/i).filter({ visible: true }).first().waitFor({ timeout: 10000 });
    await freezeBanner(page, 'configuration is incomplete');
  } catch (e) {
    const shown = await page.evaluate(() => document.body.innerText.replace(/\n+/g, ' | ').slice(0, 300)).catch(() => '');
    throw new Error(`lifecycle_manageUsers_accountManagement_troubleshooting_2: setup failed: ${e.message}\npage showed: ${shown}`, { cause: e });
  } finally {
    await setSelfServiceFormIdOnApplicationViaTheApi(appId, formId);
    await page.context().clearCookies();
    await page.context().addCookies(sharedCookies);
  }
  await page.waitForTimeout(300);
}

export async function setup_lifecycle_manageUsers_accountManagement_troubleshooting_3(page, ctx, baseUrl, appId) {
  if (ctx?.name !== 'lifecycle_manageUsers_accountManagement_troubleshooting_3') return;
  try {
    // the screenshot shows the "No form selected" state, so clear the form while the tab renders
    // and put it back before the capture
    const formId = await getSelfServiceFormIdOnApplicationViaTheApi(appId);
    try {
      await setSelfServiceFormIdOnApplicationViaTheApi(appId, '');
      await page.goto(freshUrl(`${baseUrl}/admin/application/edit?applicationId=${appId}`), { waitUntil: 'networkidle' });
      await page.getByRole('tab', { name: 'Registration', exact: true }).click({ timeout: 5000 });
      await page.waitForSelector('#application_formConfiguration_selfServiceFormId-form-row', { timeout: 5000 });
      await page.waitForTimeout(300);
    } finally {
      await setSelfServiceFormIdOnApplicationViaTheApi(appId, formId);
    }
  } catch (e) {
    throw new Error(`lifecycle_manageUsers_accountManagement_troubleshooting_3: setup failed: ${e.message}`, { cause: e });
  }
}
