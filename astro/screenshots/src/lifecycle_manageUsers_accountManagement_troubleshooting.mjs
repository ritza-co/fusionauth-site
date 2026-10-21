import {
  logInAsAdminRichardViaTheHostedLoginPage,
  getAdminRichardRegistrationViaTheApi,
  deleteAdminRichardRegistrationViaTheApi,
  createAdminRichardRegistrationViaTheApi,
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

export async function setup1(page, ctx, baseUrl, appId) {
  if (ctx?.name !== 'lifecycle_manageUsers_accountManagement_troubleshooting_1') return;
  try {
    const accountUrl = `${baseUrl}/account/?client_id=${appId}`;
    await page.goto(freshUrl(accountUrl), { waitUntil: 'networkidle' });
    if (await page.$('#loginId')) await logInAsAdminRichardViaTheHostedLoginPage(page);
    // the banner needs a logged-in user without a registration; restoring the registration right
    // after it renders leaves the banner on screen for the capture
    const registration = await getAdminRichardRegistrationViaTheApi(appId);
    try {
      await deleteAdminRichardRegistrationViaTheApi(appId);
      await page.goto(freshUrl(accountUrl), { waitUntil: 'networkidle' });
      await page.getByText(/not registered for this application/i).filter({ visible: true }).first().waitFor({ timeout: 10000 });
      await freezeBanner(page, 'not registered for this application');
    } finally {
      await createAdminRichardRegistrationViaTheApi(appId, registration);
    }
    await page.waitForTimeout(300);
  } catch (e) {
    throw new Error(`lifecycle_manageUsers_accountManagement_troubleshooting_1: setup failed: ${e.message}`, { cause: e });
  }
}

async function addConfigurationIncompleteBanner(page) {
  const inserted = await page.evaluate(() => {
    const container = [...document.querySelectorAll('main > div')].find(element =>
      element.classList.contains('w-full') && [...element.classList].some(name => name.startsWith('max-w-[')),
    );
    if (!container) return false;

    const alert = document.createElement('div');
    alert.className = 'alert border-error-icon/50 border-1 bg-alert-background rounded-theme p-3 mb-4 w-full';
    alert.innerHTML = `<div class="flex items-center">
      <div class="flex items-center shrink-0"><svg aria-hidden="true" class="size-5 text-error-icon" fill="currentColor" viewBox="0 0 20 20"><path clip-rule="evenodd" d="M10 18a8 8 0 1 0 0-16 8 8 0 0 0 0 16ZM8.28 7.22a.75.75 0 0 0-1.06 1.06L8.94 10l-1.72 1.72a.75.75 0 1 0 1.06 1.06L10 11.06l1.72 1.72a.75.75 0 1 0 1.06-1.06L11.06 10l1.72-1.72a.75.75 0 0 0-1.06-1.06L10 8.94 8.28 7.22Z" fill-rule="evenodd"></path></svg></div>
      <div class="ml-3"><div class="flex items-center text-sm text-alert-font my-0"><span>Configuration is incomplete. The administrator must configure a form for this application.</span></div></div>
      <div class="ml-auto pl-3"><div class="-mx-1.5 -my-1.5"><button class="dismiss-button inline-flex rounded-theme p-1.5 text-error-icon" type="button"><span class="sr-only">Dismiss</span><span aria-hidden="true">×</span></button></div></div>
    </div>`;
    container.prepend(alert);
    return true;
  });
  if (!inserted) throw new Error('Self-service account content container not found');
}

export async function setup2(page, ctx, baseUrl, appId) {
  if (ctx?.name !== 'lifecycle_manageUsers_accountManagement_troubleshooting_2') return;
  try {
    const accountUrl = `${baseUrl}/account/?client_id=${appId}`;
    await page.goto(freshUrl(accountUrl), { waitUntil: 'networkidle' });
    if (await page.$('#loginId')) await logInAsAdminRichardViaTheHostedLoginPage(page);
    // Keep the application configured in the API; reproduce the genuine warning markup locally so
    // this screenshot cannot leave stale self-service configuration in the shared browser session.
    await addConfigurationIncompleteBanner(page);
    await freezeBanner(page, 'configuration is incomplete');
    await page.waitForTimeout(300);
  } catch (e) {
    const shown = await page.evaluate(() => document.body.innerText.replace(/\n+/g, ' | ').slice(0, 300)).catch(() => '');
    throw new Error(`lifecycle_manageUsers_accountManagement_troubleshooting_2: setup failed: ${e.message}\npage showed: ${shown}`, { cause: e });
  }
}

export async function setup3(page, ctx, baseUrl, appId) {
  if (ctx?.name !== 'lifecycle_manageUsers_accountManagement_troubleshooting_3') return;
  try {
    await page.goto(freshUrl(`${baseUrl}/admin/application/edit?applicationId=${appId}`), { waitUntil: 'networkidle' });
    await page.getByRole('tab', { name: 'Registration', exact: true }).click({ timeout: 5000 });
    const formSelector = page.locator('#application_formConfiguration_selfServiceFormId');
    await formSelector.waitFor({ timeout: 5000 });
    // Show the unselected state without saving it, so later account screenshots keep a valid form.
    await formSelector.selectOption('');
    await page.waitForTimeout(300);
  } catch (e) {
    throw new Error(`lifecycle_manageUsers_accountManagement_troubleshooting_3: setup failed: ${e.message}`, { cause: e });
  }
}
