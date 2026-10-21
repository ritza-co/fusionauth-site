import { readFileSync } from 'fs';
import { fileURLToPath } from 'url';
import { dirname, join } from 'path';
import * as lifecycle_manageUsers_accountManagement_overview from './screenshots/src/lifecycle_manageUsers_accountManagement_overview.mjs';
import * as lifecycle_manageUsers_accountManagement_troubleshooting from './screenshots/src/lifecycle_manageUsers_accountManagement_troubleshooting.mjs';
import * as lifecycle_manageUsers_accountManagement_twoFactorAuthenticator from './screenshots/src/lifecycle_manageUsers_accountManagement_twoFactorAuthenticator.mjs';
import * as lifecycle_manageUsers_accountManagement_twoFactorEmail from './screenshots/src/lifecycle_manageUsers_accountManagement_twoFactorEmail.mjs';
import * as lifecycle_manageUsers_accountManagement_twoFactorPhone from './screenshots/src/lifecycle_manageUsers_accountManagement_twoFactorPhone.mjs';
import * as lifecycle_manageUsers_accountManagement_addWebAuthn from './screenshots/src/lifecycle_manageUsers_accountManagement_addWebAuthn.mjs';
import * as lifecycle_manageUsers_accountManagement_customizingAccountManagement from './screenshots/src/lifecycle_manageUsers_accountManagement_customizingAccountManagement.mjs';
import * as lifecycle_manageUsers_accountManagement_updatingUserData from './screenshots/src/lifecycle_manageUsers_accountManagement_updatingUserData.mjs';
import { setConstants } from './screenshots/src/shared.mjs';
import { loginScreenshotAdmin, setupScreenshotEnvironment } from './screenshots/src/setupScreenshotEnvironment.mjs';

// load .env from this directory for local development (no-op if file absent)
try {
  const envFile = join(dirname(fileURLToPath(import.meta.url)), '.env');
  readFileSync(envFile, 'utf-8').split('\n').forEach(line => {
    const m = line.match(/^([^#=\s][^=]*)=(.*)/);
    if (m && !(m[1] in process.env)) process.env[m[1]] = m[2].replace(/^(['"])(.*)\1$/, '$2');
  });
} catch {}

let adminLocale;

const baseUrl = 'http://localhost:9011';

export default {
  baseUrl,
  outputDir: 'public/img/docs/screenshots',
  window: { width: 1100, height: 800 },
  browser: 'webkit',
  // render in a pinned linux container so macos and ci produce identical text
  browserContainer: true,
  chrome: {
    style:    'golden-gate',
    renderIn: 'css',
    showUrl:  true,
    theme:    'light',
  },

  docker: {
    compose:  'screenshots/docker-compose.yml',
    service:  'fusionauth',
    healthcheck: {
      url:      'http://localhost:9011/api/status',
      timeout:  120000,
      interval: 3000,
    },
  },

  resetContextAfterScreenshots: [
    'lifecycle_manageUsers_accountManagement_troubleshooting_2',
    'lifecycle_manageUsers_accountManagement_troubleshooting_3',
    'lifecycle_manageUsers_accountManagement_overview_4',
    'lifecycle_manageUsers_accountManagement_addWebAuthn_1',
    'lifecycle_manageUsers_accountManagement_addWebAuthn_3',
    'lifecycle_manageUsers_accountManagement_customizingAccountManagement_4',
    'lifecycle_manageUsers_accountManagement_customizingAccountManagement_6',
    'lifecycle_manageUsers_accountManagement_overview_1',
    'lifecycle_manageUsers_accountManagement_overview_6',
  ],
  afterBrowserContextReset: async (context, screenshot) => {
    if (['lifecycle_manageUsers_accountManagement_addWebAuthn_1', 'lifecycle_manageUsers_accountManagement_overview_4', 'lifecycle_manageUsers_accountManagement_overview_1'].includes(screenshot?.name)) {
      adminLocale = undefined;
      return;
    }
    adminLocale = await loginScreenshotAdmin(context, baseUrl);
  },

  beforeAll: async (context) => {
    const apiKey = 'screenshot-dev-key-not-for-production';
    const tenantId = '30663132-6464-6665-3032-326466613934';
    const messengerId = '00000000-0000-0000-0000-500000000001';
    const appId = 'e9fdb985-9173-4e01-9d73-ac2d60d1dc8e';
    const richardId = '00000000-0000-0000-0000-100000000001';
    setConstants({ baseUrl, apiKey, richardHendricksUserId: richardId });

    await setupScreenshotEnvironment(baseUrl, apiKey, tenantId, appId, richardId, messengerId, process.env.FUSIONAUTH_LICENSE_KEY);

    // ensure self-service form is configured on Pied Piper app for account management
    // the built-in "Default User Self Service" form id is generated per install; look it up by name
    try {
      const formsResp = await fetch(`${baseUrl}/api/form`, { headers: { 'Authorization': apiKey } });
      if (!formsResp.ok) throw new Error(`GET /api/form ${formsResp.status}`);
      const { forms } = await formsResp.json();
      const selfServiceForm = forms.find(f => f.name === 'Default User Self Service provided by FusionAuth');
      if (!selfServiceForm) throw new Error('Default User Self Service form not found');
      const appResp = await fetch(`${baseUrl}/api/application/${appId}`, { headers: { 'Authorization': apiKey } });
      if (!appResp.ok) throw new Error(`GET /api/application ${appResp.status}`);
      const { application } = await appResp.json();
      if (application.formConfiguration?.selfServiceFormId !== selfServiceForm.id) {
        const patchResp = await fetch(`${baseUrl}/api/application/${appId}`, {
          method: 'PATCH',
          headers: { 'Authorization': apiKey, 'Content-Type': 'application/json' },
          body: JSON.stringify({ application: { formConfiguration: { selfServiceFormId: selfServiceForm.id } } }),
        });
        if (!patchResp.ok) throw new Error(`${patchResp.status} ${await patchResp.text()}`);
      }
      const verifyResp = await fetch(`${baseUrl}/api/application/${appId}`, { headers: { 'Authorization': apiKey } });
      if (!verifyResp.ok) throw new Error(`GET /api/application/${appId} ${verifyResp.status}`);
      const { application: verifiedApplication } = await verifyResp.json();
      if (verifiedApplication.formConfiguration?.selfServiceFormId !== selfServiceForm.id) {
        throw new Error(`selfServiceFormId did not persist; expected ${selfServiceForm.id}`);
      }
    } catch (e) {
      throw new Error(`beforeAll: selfServiceFormId patch failed: ${e.message}`, { cause: e });
    }

    // ensure Screenshots Theme exists (used by theme-localization-messages screenshot)
    try {
      const themeId = '00000000-0000-0000-0000-300000000001';
      const tResp = await fetch(`${baseUrl}/api/theme/${themeId}`, { headers: { 'Authorization': apiKey } });
      if (!tResp.ok) {
        await fetch(`${baseUrl}/api/theme/${themeId}`, {
          method: 'POST',
          headers: { 'Authorization': apiKey, 'Content-Type': 'application/json' },
          body: JSON.stringify({ sourceThemeId: '75a068fd-e94b-451a-9aeb-3ddb9a3b5987', theme: { id: themeId, name: 'Screenshots Theme' } }),
        });
        console.log('[screenshot] beforeAll: created Screenshots Theme');
      }
      const themeResp = await fetch(`${baseUrl}/api/theme/${themeId}`, { headers: { 'Authorization': apiKey } });
      if (!themeResp.ok) throw new Error(`GET /api/theme/${themeId} ${themeResp.status}`);
      const { theme } = await themeResp.json();
      const marker = 'This is now modified with a birthdate field';
      const accountIndex = theme.templates.accountIndex ?? '';
      if (!accountIndex.includes(marker)) {
        const birthdateTemplate = [
          '',
          '[#if user.data.screenshotShowBirthdate?? && user.data.screenshotShowBirthdate]',
          '<p>This is now modified with a birthdate field</p>',
          '<dl class="horizontal">',
          '<dt>${theme.message("user.birthDate")}</dt>',
          '<dd>${helpers.display(user, "birthDate")}</dd>',
          '</dl>',
          '[/#if]',
        ].join('\n');
        const patchResp = await fetch(`${baseUrl}/api/theme/${themeId}`, {
          method: 'PATCH',
          headers: { 'Authorization': apiKey, 'Content-Type': 'application/json' },
          body: JSON.stringify({ theme: { templates: { accountIndex: accountIndex + birthdateTemplate } } }),
        });
        if (!patchResp.ok) throw new Error(`PATCH /api/theme/${themeId} ${patchResp.status} ${await patchResp.text()}`);
      }
      const tenantThemeResp = await fetch(`${baseUrl}/api/tenant/${tenantId}`, { headers: { 'Authorization': apiKey } });
      if (!tenantThemeResp.ok) throw new Error(`GET /api/tenant/${tenantId} ${tenantThemeResp.status}`);
      const { tenant: screenshotTenant } = await tenantThemeResp.json();
      if (screenshotTenant.themeId !== themeId) {
        const patchResp = await fetch(`${baseUrl}/api/tenant/${tenantId}`, {
          method: 'PATCH',
          headers: { 'Authorization': apiKey, 'Content-Type': 'application/json' },
          body: JSON.stringify({ tenant: { themeId } }),
        });
        if (!patchResp.ok) throw new Error(`PATCH /api/tenant/${tenantId} ${patchResp.status} ${await patchResp.text()}`);
      }
    } catch (e) {
      throw new Error(`beforeAll: Screenshots Theme creation failed: ${e.message}`, { cause: e });
    }

    // always PUT the canonical email template content (matches the .ftl files referenced in the docs)
    try {
      const htmlTpl = '[#setting url_escaping_charset="UTF-8"]\nYou have requested to log into Pied Piper using this email address. If you do not recognize this request please ignore this email.\n\n[#if oneTimeCode??]\n<p>\n  Login code: ${oneTimeCode}\n</p>\n[#else]\n<p>\n  [#assign url = "${baseUrl}/oauth2/passwordless/${code}?tenantId=${user.tenantId}" /]\n  [#list state!{} as key, value][#if key != "tenantId" && value??][#assign url = url + "&" + key?url + "=" + value?url/][/#if][/#list]\n  <a href="${url?html}">${url?html}</a>\n</p>\n[/#if]\n- Pied Piper';
      const txtTpl = '[#setting url_escaping_charset="UTF-8"]\nYou have requested to log into Pied Piper using this email address. If you do not recognize this request please ignore this email.\n\n[#if oneTimeCode??]\nLogin code: ${oneTimeCode}\n[#else]\n[#assign url = "${baseUrl}/oauth2/passwordless/${code}?tenantId=${user.tenantId}" /]\n[#list state!{} as key, value][#if key != "tenantId" && value??][#assign url = url + "&" + key?url + "=" + value?url/][/#if][/#list]\n\n${url}\n\n[/#if]\n- Pied Piper';
      const etMethod = (await fetch(`${baseUrl}/api/email/template/00000000-0000-0000-0000-400000000001`, { headers: { 'Authorization': apiKey } })).ok ? 'PUT' : 'POST';
      await fetch(`${baseUrl}/api/email/template/00000000-0000-0000-0000-400000000001`, {
        method: etMethod,
        headers: { 'Authorization': apiKey, 'Content-Type': 'application/json' },
        body: JSON.stringify({ emailTemplate: { name: 'Pied Piper Passwordless Login', defaultSubject: 'Complete your Pied Piper login', defaultHtmlTemplate: htmlTpl, defaultTextTemplate: txtTpl } }),
      });
    } catch (e) {
      throw new Error(`beforeAll: email template update failed: ${e.message}`, { cause: e });
    }

    // always PUT the canonical message template content
    try {
      const smsTpl = '[#setting url_escaping_charset="UTF-8"]\nYou have requested to log into Pied Piper using this phone number. If you do not recognize this request please ignore this message.\n\n[#if oneTimeCode??]\n  Login code: ${oneTimeCode}\n[#else]\n  [#assign url = "${baseUrl}/oauth2/passwordless/${code}?tenantId=${user.tenantId}" /]\n  [#list state!{} as key, value][#if key != "tenantId" && value??][#assign url = url + "&" + key?url + "=" + value?url/][/#if][/#list]\n\n  ${url}\n[/#if]\n\n- Pied Piper';
      const mtMethod = (await fetch(`${baseUrl}/api/message/template/00000000-0000-0000-0000-400000000002`, { headers: { 'Authorization': apiKey } })).ok ? 'PUT' : 'POST';
      await fetch(`${baseUrl}/api/message/template/00000000-0000-0000-0000-400000000002`, {
        method: mtMethod,
        headers: { 'Authorization': apiKey, 'Content-Type': 'application/json' },
        body: JSON.stringify({ messageTemplate: { name: 'Pied Piper Passwordless SMS', type: 'SMS', defaultTemplate: smsTpl } }),
      });
    } catch (e) {
      throw new Error(`beforeAll: message template update failed: ${e.message}`, { cause: e });
    }

    // configure tenant email: set passwordless email template (needed for the login button to render)
    try {
      const r = await fetch(`${baseUrl}/api/tenant/${tenantId}`, {
        method: 'PATCH',
        headers: { 'Authorization': apiKey, 'Content-Type': 'application/json' },
        body: JSON.stringify({ tenant: { emailConfiguration: { passwordlessEmailTemplateId: '00000000-0000-0000-0000-400000000001' } } }),
      });
      if (!r.ok) throw new Error(`${r.status} ${await r.text()}`);
    } catch (e) {
      throw new Error(`beforeAll: email template PATCH failed: ${e.message}`, { cause: e });
    }

    // configure tenant phone: messenger + SMS template (separate PATCH so email config isn't blocked by phone errors)
    try {
      const r = await fetch(`${baseUrl}/api/tenant/${tenantId}`, {
        method: 'PATCH',
        headers: { 'Authorization': apiKey, 'Content-Type': 'application/json' },
        body: JSON.stringify({ tenant: { phoneConfiguration: { messengerId: messengerId, passwordlessTemplateId: '00000000-0000-0000-0000-400000000002' } } }),
      });
      if (!r.ok) throw new Error(`${r.status} ${await r.text()}`);
    } catch (e) {
      throw new Error(`beforeAll: phone PATCH failed: ${e.message}`, { cause: e });
    }

    // Initialize the shared browser session only after all app and tenant setup is complete.
    adminLocale = await loginScreenshotAdmin(context, baseUrl);
  },

  beforeScreenshot: async (page, ctx) => {
    // use the original URL from context -- page.url() may drop the hash after SPA navigation
    const url = ctx?.url ?? page.url();
    const { pathname, hash } = new URL(url);
    const fragment = hash.slice(1);

    // opening an /account page resets this to en
    if (adminLocale && pathname.startsWith('/admin')) {
      const context = page.context();
      const locale = (await context.cookies('http://localhost:9011')).find(c => c.name === 'fusionauth.locale');
      if (locale?.value !== adminLocale) {
        await context.addCookies([{ name: 'fusionauth.locale', value: adminLocale, url: 'http://localhost:9011' }]);
        await page.reload({ waitUntil: 'networkidle' });
      }
    }

    const oauthAppId = 'e9fdb985-9173-4e01-9d73-ac2d60d1dc8e';
    const oauthTenantId = '30663132-6464-6665-3032-326466613934';
    const oauthLoginUrl = `http://localhost:9011/oauth2/authorize?client_id=${oauthAppId}&redirect_uri=https%3A%2F%2Fexample.com&response_type=code&scope=openid`;

    // the migration test tenant should only appear in the tenant list screenshot
    const apiKey = 'screenshot-dev-key-not-for-production';
    // matches the example Id in the guide text
    const importTenantId = '25c9d123-8a79-4edd-9f76-8dd9c806b0f3';
    const importTenantUrl = `http://localhost:9011/api/tenant/${importTenantId}`;
    const importTenantApi = async (method, body) => {
      const r = await fetch(importTenantUrl, {
        method,
        headers: { 'Authorization': apiKey, 'Content-Type': 'application/json' },
        body: body && JSON.stringify(body),
      });
      if (!r.ok && !(method === 'GET' && r.status === 404)) {
        throw new Error(`test tenant ${method} failed: ${r.status} ${await r.text()}`);
      }
      return r.ok;
    };
    const importTenantExists = await importTenantApi('GET');

    if (ctx?.name === 'migration-tenant-list') {
      if (!importTenantExists) {
        await importTenantApi('POST', { tenant: { name: 'Import test' } });
        await page.reload({ waitUntil: 'networkidle' });
      }
      await page.evaluate(id => {
        const cell = [...document.querySelectorAll('td')].find(td => td.textContent.trim() === id);
        if (cell) cell.setAttribute('data-hl', 'import-tenant-id');
      }, importTenantId);
    } else if (importTenantExists) {
      await importTenantApi('DELETE');
      // the admin UI caches the tenant count; two tenants adds a Tenant field to some forms
      await page.waitForTimeout(5000);
      await page.reload({ waitUntil: 'networkidle' });
    }

    if (ctx?.name === 'migration-tenant-add') {
      await page.fill('#tenant_name', 'Import test');
    }

    // bootstrap-button: tag the "Fingerprint, device or key" link for highlighting
    if (ctx?.name === 'passkeys-bootstrap-button') {
      await page.evaluate(() => {
        const btns = [...document.querySelectorAll('a, button')];
        const btn = btns.find(el => /fingerprint|device or key/i.test(el.textContent.trim()));
        if (btn) btn.setAttribute('data-hl', 'webauthn-bootstrap-btn');
      });
    }

    // WebAuthn bootstrap login page: click "Fingerprint, device or key" from the OAuth login page
    if (ctx?.name === 'passkeys-bootstrap-login') {
      try {
        await page.locator('a').filter({ hasText: /Fingerprint, device or key/i }).first().click({ timeout: 5000 });
        await page.waitForLoadState('networkidle');
        await page.waitForTimeout(500);
      } catch (e) {
        throw new Error(`passkeys-bootstrap-login: click failed: ${e.message}`, { cause: e });
      }
    }

    // Self-service passkeys page: log in via OAuth then navigate to account webauthn management
    if (ctx?.name === 'passkeys-self-service') {
      try {
        await page.fill('#loginId', 'richard@piedpiper.com');
        await page.fill('#password', 'password');
        await page.locator('#submit-button').click();
        try { await page.waitForURL(/example\.com/, { timeout: 8000 }); } catch {}
        await page.goto(`http://localhost:9011/account/webauthn/?client_id=${oauthAppId}&tenantId=${oauthTenantId}`);
        await page.waitForLoadState('networkidle');
        await page.waitForTimeout(500);
      } catch (e) {
        throw new Error(`passkeys-self-service: login/navigate failed: ${e.message}`, { cause: e });
      }
    }

    // Reauth-enable page: mock WebAuthn so the page stays in "waiting" state rather than
    // erroring (WebKit headless does not implement navigator.credentials.create).
    if (ctx?.name === 'passkeys-reauth-enable') {
      try {
        await page.addInitScript(() => {
          if (typeof PublicKeyCredential !== 'undefined') {
            PublicKeyCredential.isUserVerifyingPlatformAuthenticatorAvailable = async () => true;
          }
          // return a never-resolving promise so the page's WebAuthn call hangs in
          // the "waiting for authenticator" state rather than throwing
          if (navigator.credentials) {
            navigator.credentials.create = () => new Promise(() => {});
            navigator.credentials.get = () => new Promise(() => {});
          }
        });
        // prompt=login forces the login form even when Richard has an active session
        await page.goto(oauthLoginUrl + '&prompt=login');
        await page.waitForLoadState('networkidle');
        await page.fill('#loginId', 'richard@piedpiper.com');
        await page.fill('#password', 'password');
        await page.locator('#submit-button').click();
        try {
          await Promise.race([
            page.waitForURL(/reauth-enable/, { timeout: 8000 }),
            page.waitForURL(/example\.com/, { timeout: 8000 }),
          ]);
        } catch {
          await page.waitForTimeout(4000);
        }
      } catch (e) {
        throw new Error(`passkeys-reauth-enable: setup failed: ${e.message}`, { cause: e });
      }
    }

    // user manage pages for Big Head and Erlich: the Angular SPA may land on the Users
    // list before routing to the specific user -- wait for the Manage User heading.
    if (url.includes('00000000-0000-0000-0000-10000000000')) {
      try {
        await page.waitForFunction(
          () => document.querySelector('h1')?.textContent?.trim() === 'Manage User',
          { timeout: 20000 }
        ).catch(async () => {
          // retry the navigation once if Angular didn't route to the manage page
          await page.goto(url, { waitUntil: 'networkidle', timeout: 20000 }).catch(() => {});
          await page.waitForFunction(
            () => document.querySelector('h1')?.textContent?.trim() === 'Manage User',
            { timeout: 15000 }
          );
        });
      } catch (e) {
        throw new Error(`manage page wait failed: ${e.message}`, { cause: e });
      }
    }

    // add registration screenshot: click Add registration on Erlich's manage page,
    // then select the first available application so the full form loads
    if (url.includes('00000000-0000-0000-0000-100000000003')) {
      try {
        await page.locator('a, button').filter({ hasText: /Add registration/i }).first().click({ timeout: 10000 });
        await page.waitForTimeout(1500);
        await page.locator('select').first().selectOption({ index: 1 });
        await page.waitForTimeout(2500);
        // remove focus so no field shows a browser focus ring in the screenshot
        await page.evaluate(() => document.activeElement?.blur());
        // registration form uses Angular bindings, not name attrs, for Languages --
        // walk up from the label until we find a container that also holds an input,
        // so the outline surrounds both the label and the field.
        await page.evaluate(() => {
          const label = [...document.querySelectorAll('label')]
            .find(l => /^Languages\b/.test(l.textContent.trim()));
          if (!label) return;
          // stop at the <form> boundary so the nav sidebar's selects don't pull
          // the walk all the way up to app-root, which would outline the full page
          const formBoundary = label.closest('form') || document.body;
          let container = label.parentElement;
          while (container && container !== formBoundary) {
            if (container.querySelector('input, select, textarea, a-tokenizer, [class*="token"], [class*="chosen"]')) break;
            container = container.parentElement;
          }
          if (container && container !== formBoundary && container !== document.body) {
            container.style.cssText += '; outline: 2px solid #f26522; outline-offset: 4px; border-radius: 2px;';
          }
        });
      } catch (e) {
        throw new Error(`registration setup failed: ${e.message}`, { cause: e });
      }
    }

    // application edit: click Security or WebAuthn tab based on URL fragment
    if (pathname.includes('/admin/application/edit')) {
      await page.waitForTimeout(500);
      try {
        const appTab = fragment === 'webauthn' ? 'WebAuthn' : 'Security';
        await page.locator('button').filter({ hasText: appTab }).first().click({ timeout: 3000 });
        await page.waitForTimeout(1000);
      } catch (e) {
        throw new Error(`application/edit tab failed: ${e.message}`, { cause: e });
      }
    }

    // tenant edit: click Email, Passwordless, or WebAuthn tab based on URL fragment
    if (pathname.includes('/admin/tenant/edit/') && fragment) {
      const tabLabel = { email: 'Email', 'email-test': 'Email', identities: 'Identities', passwordless: 'Advanced', webauthn: 'WebAuthn' }[fragment];
      if (tabLabel) {
        try {
          // Wait for Angular to render the tenant tab bar before selecting a tab.
          await page.waitForFunction(
            label => [...document.querySelectorAll('el-tab-list button')].some(button => button.textContent.trim() === label),
            tabLabel,
            { timeout: 15000 },
          );
          // use JS click to handle tabs that are scrolled off the visible tab bar
          const result = await page.evaluate((label) => {
            const btns = [...document.querySelectorAll('el-tab-list button')];
            const allLabels = btns.map(b => b.textContent.trim());
            const btn = btns.find(b => b.textContent.trim() === label);
            if (btn) { btn.click(); return { clicked: true }; }
            return { clicked: false, available: allLabels };
          }, tabLabel);
          if (!result.clicked) throw new Error(`tab "${tabLabel}" not found; available: ${JSON.stringify(result.available)}`);
          await page.waitForTimeout(1000);
        } catch (e) {
          const pageState = await page.evaluate(() => ({
            url: location.href,
            title: document.title,
            text: document.body.innerText.replace(/\s+/g, ' ').slice(0, 300),
            tabs: [...document.querySelectorAll('el-tab-list button')].map(button => button.textContent.trim()),
          })).catch(() => null);
          throw new Error(`tenant/edit ${tabLabel} tab failed: ${e.message}; page state: ${JSON.stringify(pageState)}`, { cause: e });
        }
      }

      // send-test-email screenshot: tag and scroll to the test email control
      if (ctx?.name === 'tenant-send-test-email') {
        const tagged = await page.evaluate(() => {
          const btn = [...document.querySelectorAll('a, button')]
            .find(el => /send test email/i.test(el.textContent.trim()));
          if (!btn) return false;
          const row = btn.closest('fieldset, .form-row, div') ?? btn;
          row.setAttribute('data-hl', 'send-test-email');
          row.scrollIntoView({ block: 'center', behavior: 'instant' });
          return true;
        });
        if (!tagged) throw new Error('send test email control not found');
        await page.waitForTimeout(300);
      }

      // webauthn tab: click enable toggle only if workflow fieldsets aren't already visible
      // (beforeAll enables WebAuthn when a license key is present; clicking again would disable it)
      if (fragment === 'webauthn') {
        await page.evaluate(() => {
          const alreadyEnabled = !!document.querySelector('#tenant_webAuthnConfiguration_bootstrapWorkflow_enabled-form-row');
          if (!alreadyEnabled) {
            const label = document.querySelector('#tenant_webAuthnConfiguration_enabled-form-row label');
            if (label) label.click();
          }
        });
        await page.waitForTimeout(400);
      }

      // email-config screenshot: tag and scroll to the Passwordless login row in the Email column
      if (ctx?.name === 'passwordless-tenant-email-config') {
        await page.evaluate(() => {
          const sel = document.querySelector('#tenant_emailConfiguration_passwordlessEmailTemplateId');
          if (!sel) return;
          const innerFieldset = sel.closest('fieldset');
          if (!innerFieldset) return;
          let cell = sel.parentElement;
          while (cell && cell.parentElement !== innerFieldset) cell = cell.parentElement;
          if (cell) {
            cell.setAttribute('data-hl', 'pw-email-template');
            cell.scrollIntoView({ block: 'center', behavior: 'instant' });
          }
        });
        await page.waitForTimeout(300);
      }

      // message-config screenshot: tag and scroll to the Passwordless login row in the Phone column
      if (ctx?.name === 'passwordless-tenant-message-config') {
        await page.evaluate(() => {
          const sel = document.querySelector('#tenant_phoneConfiguration_passwordlessTemplateId');
          if (!sel) return;
          const innerFieldset = sel.closest('fieldset');
          if (!innerFieldset) return;
          let cell = sel.parentElement;
          while (cell && cell.parentElement !== innerFieldset) cell = cell.parentElement;
          if (cell) {
            cell.setAttribute('data-hl', 'pw-message-template');
            cell.scrollIntoView({ block: 'center', behavior: 'instant' });
          }
        });
        await page.waitForTimeout(300);
      }

      // generation screenshot: expand the Warning accordion so the generation rows exist in DOM
      if (ctx?.name === 'passwordless-tenant-generation') {
        try {
          await page.locator('button, [role="button"], summary, a').filter({ hasText: /Warning/ }).first().click({ timeout: 5000 });
          await page.waitForTimeout(500);
        } catch (e) {
          throw new Error(`Warning accordion expand failed: ${e.message}`, { cause: e });
        }
      }
    }

    // email template edit: click the Localization inner tab
    if (pathname.includes('/admin/email/template/edit/') && fragment === 'localization') {
      try {
        const clicked = await page.evaluate(() => {
          const els = [...document.querySelectorAll('a, button, [role="tab"]')];
          const el = els.find(e => e.textContent.trim() === 'Localization');
          if (el) { el.click(); return true; }
          return false;
        });
        if (!clicked) throw new Error('Localization tab element not found');
        await page.waitForTimeout(800);
        // tag the Add localization button for highlighting
        await page.evaluate(() => {
          const btn = [...document.querySelectorAll('a, button')].find(el => /add localization/i.test(el.textContent));
          if (btn) btn.setAttribute('data-hl', 'add-localization');
        });
      } catch (e) {
        throw new Error(`email/template/edit localization tab failed: ${e.message}`, { cause: e });
      }
    }

    // oauth login page: click "Login with a magic link" to show the email request form
    if (pathname.includes('/oauth2/authorize') && fragment === 'email-request') {
      try {
        await page.locator('a, button').filter({ hasText: /magic link/i }).first().click({ timeout: 5000 });
        await page.waitForTimeout(1000);
      } catch (e) {
        throw new Error(`oauth magic link click failed: ${e.message}`, { cause: e });
      }
    }

    // phone-otp: navigate to the passwordless form, enter an identifier, and submit
    // to land on the OTP code-entry form (FormField strategy for phone passwordless)
    if (pathname.includes('/oauth2/authorize') && fragment === 'phone-otp') {
      try {
        await page.goto(`http://localhost:9011/oauth2/passwordless?client_id=${oauthAppId}&redirect_uri=http%3A%2F%2Flocalhost%3A3000%2Foauth-callback&response_type=code&scope=openid`);
        await page.waitForLoadState('networkidle');
        // Big Head has mobilePhone in kickstart -- enter it to trigger the phone OTP flow
        await page.fill('#loginId', '+15555551234');
        // the passwordless form submit is a plain <button> with text "Send" -- no type or id attr
        await page.locator('form[action="/oauth2/passwordless"] button').first().click();
        await page.waitForLoadState('networkidle');
        await page.waitForTimeout(500);
      } catch (e) {
        throw new Error(`phone otp flow failed: ${e.message}`, { cause: e });
      }
    }

    await lifecycle_manageUsers_accountManagement_overview.setup_lifecycle_manageUsers_accountManagement_overview_1(page, ctx);
    await lifecycle_manageUsers_accountManagement_overview.setup_lifecycle_manageUsers_accountManagement_overview_2(page, ctx, baseUrl, oauthAppId, oauthTenantId);
    await lifecycle_manageUsers_accountManagement_overview.setup_lifecycle_manageUsers_accountManagement_overview_3(page, ctx, baseUrl, oauthAppId, oauthTenantId);
    await lifecycle_manageUsers_accountManagement_overview.setup_lifecycle_manageUsers_accountManagement_overview_4(page, ctx);
    await lifecycle_manageUsers_accountManagement_overview.setup_lifecycle_manageUsers_accountManagement_overview_5(page, ctx, baseUrl, oauthAppId);
    await lifecycle_manageUsers_accountManagement_overview.setup_lifecycle_manageUsers_accountManagement_overview_6(page, ctx, baseUrl, oauthAppId);
    await lifecycle_manageUsers_accountManagement_troubleshooting.setup_lifecycle_manageUsers_accountManagement_troubleshooting_1(page, ctx, baseUrl, oauthAppId);
    await lifecycle_manageUsers_accountManagement_troubleshooting.setup_lifecycle_manageUsers_accountManagement_troubleshooting_2(page, ctx, baseUrl, oauthAppId);
    await lifecycle_manageUsers_accountManagement_troubleshooting.setup_lifecycle_manageUsers_accountManagement_troubleshooting_3(page, ctx, baseUrl, oauthAppId);
    await lifecycle_manageUsers_accountManagement_twoFactorAuthenticator.setup_lifecycle_manageUsers_accountManagement_twoFactorAuthenticator_1(page, ctx, baseUrl, oauthTenantId);
    await lifecycle_manageUsers_accountManagement_twoFactorAuthenticator.setup_lifecycle_manageUsers_accountManagement_twoFactorAuthenticator_2(page, ctx, baseUrl, oauthAppId);
    await lifecycle_manageUsers_accountManagement_twoFactorAuthenticator.setup_lifecycle_manageUsers_accountManagement_twoFactorAuthenticator_3(page, ctx, baseUrl, oauthAppId, oauthTenantId);
    await lifecycle_manageUsers_accountManagement_twoFactorEmail.setup_lifecycle_manageUsers_accountManagement_twoFactorEmail_1(page, ctx, baseUrl, oauthTenantId);
    await lifecycle_manageUsers_accountManagement_twoFactorEmail.setup_lifecycle_manageUsers_accountManagement_twoFactorEmail_2(page, ctx, baseUrl, oauthTenantId, oauthAppId);
    await lifecycle_manageUsers_accountManagement_twoFactorPhone.setup_lifecycle_manageUsers_accountManagement_twoFactorPhone_1(page, ctx, baseUrl, oauthTenantId);
    await lifecycle_manageUsers_accountManagement_twoFactorPhone.setup_lifecycle_manageUsers_accountManagement_twoFactorPhone_2(page, ctx, baseUrl, oauthTenantId, oauthAppId);
    await lifecycle_manageUsers_accountManagement_addWebAuthn.setup_lifecycle_manageUsers_accountManagement_addWebAuthn_1(page, ctx, baseUrl, oauthTenantId);
    await lifecycle_manageUsers_accountManagement_addWebAuthn.setup_lifecycle_manageUsers_accountManagement_addWebAuthn_2(page, ctx, baseUrl, oauthAppId, oauthTenantId);
    await lifecycle_manageUsers_accountManagement_addWebAuthn.setup_lifecycle_manageUsers_accountManagement_addWebAuthn_3(page, ctx, baseUrl, oauthAppId, oauthTenantId);
    await lifecycle_manageUsers_accountManagement_customizingAccountManagement.setup_lifecycle_manageUsers_accountManagement_customizingAccountManagement_1(page, ctx, baseUrl, oauthAppId);
    await lifecycle_manageUsers_accountManagement_customizingAccountManagement.setup_lifecycle_manageUsers_accountManagement_customizingAccountManagement_2(page, ctx, baseUrl, oauthAppId);
    await lifecycle_manageUsers_accountManagement_customizingAccountManagement.setup_lifecycle_manageUsers_accountManagement_customizingAccountManagement_3(page, ctx, baseUrl, oauthAppId);
    await lifecycle_manageUsers_accountManagement_customizingAccountManagement.setup_lifecycle_manageUsers_accountManagement_customizingAccountManagement_4(page, ctx, baseUrl, oauthAppId, oauthTenantId);
    await lifecycle_manageUsers_accountManagement_customizingAccountManagement.setup_lifecycle_manageUsers_accountManagement_customizingAccountManagement_5(page, ctx, baseUrl);
    await lifecycle_manageUsers_accountManagement_customizingAccountManagement.setup_lifecycle_manageUsers_accountManagement_customizingAccountManagement_6(page, ctx, baseUrl, oauthAppId, oauthTenantId);
    await lifecycle_manageUsers_accountManagement_updatingUserData.setup_lifecycle_manageUsers_accountManagement_updatingUserData_1(page, ctx, baseUrl, oauthAppId, oauthTenantId);

    if (url.includes('/theme/edit/') && ctx?.name === 'theme-localization-messages') {
      // viewport is already set to spec.height by capture.mjs before this hook runs.
      // scroll down to reach the Add Localization button (below the fold), click it,
      // then scroll back to top -- position:fixed dialog stays centred in the viewport.
      await page.waitForTimeout(2000); // code editor initialization takes time
      try {
        // wait for Angular to render the theme editor tab list before clicking Messages.
        // tabs are <a> elements; text includes trailing icon chars so use startsWith.
        // "Message Templates" in the nav starts with "Message" (no s) -- won't match.
        await page.waitForFunction(
          () => [...document.querySelectorAll('button, [role="tab"], a')].some(el => /^Messages\b/.test(el.textContent.trim())),
          null,
          { timeout: 20000 }
        );
        await page.evaluate(() => {
          const candidates = [...document.querySelectorAll('button, [role="tab"], a')]
            .filter(el => /^Messages\b/.test(el.textContent.trim()));
          // prefer the shortest match to avoid "Message Templates" nav link if regex somehow matches
          const btn = candidates.sort((a, b) => a.textContent.trim().length - b.textContent.trim().length)[0];
          if (btn) btn.click();
        });
        await page.waitForTimeout(1500);
        // scroll down far enough to bring Add Localization into the viewport
        const docH = await page.evaluate(() => document.documentElement.scrollHeight);
        await page.evaluate((h) => window.scrollTo(0, h), docH);
        await page.waitForTimeout(300);
        await page.getByText(/Add Localization/i).first().click({ timeout: 5000 });
        await page.waitForTimeout(800);
        // scroll back to top -- the fixed dialog stays centred in the viewport
        await page.evaluate(() => window.scrollTo(0, 0));
        await page.waitForTimeout(200);
        // a 2px empty div (class "border") sits at y=0, pushing the sticky header to y=2.
        // under the dialog backdrop this gap appears as a black bar. zero it out.
        await page.evaluate(() => {
          [...document.querySelectorAll('div')].filter(el => {
            const r = el.getBoundingClientRect();
            return r.top === 0 && r.height > 0 && r.height <= 3 && el.children.length === 0;
          }).forEach(el => {
            el.style.cssText += '; height:0 !important; min-height:0 !important; border:none !important; padding:0 !important; margin:0 !important;';
          });
        });
      } catch (e) {
        throw new Error(`theme/edit setup failed: ${e.message}`, { cause: e });
      }
    } else {
      // expand the viewport to fit the full inner-scroll content height;
      // this makes fullPage equivalent to a single viewport capture so fixed
      // elements stay at top: 0 rather than rendering at the wrong scroll offset.
      // cap at 2500px to avoid exploding on code-editor pages with huge scroll heights.
      const fullHeight = await page.evaluate(() => {
        return [...document.querySelectorAll('*')].reduce((max, el) => {
          const s = window.getComputedStyle(el);
          if ((s.overflowY === 'auto' || s.overflowY === 'scroll') && el.scrollHeight > max) {
            return el.scrollHeight;
          }
          return max;
        }, document.documentElement.scrollHeight);
      });
      if (fullHeight > 800) {
        await page.setViewportSize({ width: 1100, height: Math.min(fullHeight, 2500) });
        await page.waitForTimeout(300);
      }
    }

    await page.evaluate((screenshotName) => {
      const screenshotsThatNeedToShowToasts = ['lifecycle_manageUsers_accountManagement_troubleshooting_1','lifecycle_manageUsers_accountManagement_troubleshooting_2', ];
      if (!screenshotsThatNeedToShowToasts.includes(screenshotName)) document.querySelectorAll('.alert, [role=alert], .notification').forEach(el => el.remove());
      document.activeElement?.blur();
    }, ctx?.name);

    // pin run-time dates; a day over 12 shows the dd/mm order
    if (new URL(page.url()).pathname.startsWith('/admin')) {
      await page.evaluate(() => {
        const walker = document.createTreeWalker(document.body, NodeFilter.SHOW_TEXT);
        for (let node = walker.nextNode(); node; node = walker.nextNode()) {
          node.textContent = node.textContent
            .replace(/\b\d{2}\/\d{2}\/\d{4}\b/g, '24/09/2026')
            .replace(/\b\d{2}:\d{2} (AM|PM)\b/g, '09:00 AM');
        }
      });
    }
  },
};
