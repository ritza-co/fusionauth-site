import { logInAsRichardHendricksViaTheHostedLoginPage } from './shared.mjs';

const screenshotApiKey = 'screenshot-dev-key-not-for-production';
const screenshotsThemeId = '00000000-0000-0000-0000-300000000001';
const richardId = '00000000-0000-0000-0000-100000000001';

async function apiJson(baseUrl, path, method = 'GET', payload) {
  const response = await fetch(`${baseUrl}${path}`, {
    method,
    headers: { Authorization: screenshotApiKey, ...(payload ? { 'Content-Type': 'application/json' } : {}) },
    ...(payload ? { body: JSON.stringify(payload) } : {}),
  });
  if (!response.ok) throw new Error(`${method} ${path} ${response.status} ${await response.text()}`);
  const text = await response.text();
  return text ? JSON.parse(text) : {};
}

async function ensureBirthdateField(baseUrl) {
  const { fields = [] } = await apiJson(baseUrl, '/api/form/field');
  const existing = fields.find(field => field.key === 'user.birthDate');
  if (existing) return { fieldId: existing.id, name: existing.name, created: false };

  const fieldId = crypto.randomUUID();
  await apiJson(baseUrl, `/api/form/field/${fieldId}`, 'POST', {
    field: { name: 'Birthdate', key: 'user.birthDate', required: false },
  });
  return { fieldId, name: 'Birthdate', created: true };
}

async function getApplicationForm(baseUrl, appId) {
  const { application } = await apiJson(baseUrl, `/api/application/${appId}`);
  const formId = application?.formConfiguration?.selfServiceFormId;
  if (!formId) throw new Error(`Application ${appId} has no self-service form configured`);
  const { form } = await apiJson(baseUrl, `/api/form/${formId}`);
  return { formId, form };
}

async function setFormSteps(baseUrl, formId, steps) {
  const { form } = await apiJson(baseUrl, `/api/form/${formId}`);
  await apiJson(baseUrl, `/api/form/${formId}`, 'PUT', {
    form: { name: form.name, type: form.type, data: form.data ?? {}, steps },
  });
}

async function loginRichard(page, baseUrl, appId, tenantId) {
  const loginUrl = `${baseUrl}/oauth2/authorize?client_id=${appId}&redirect_uri=${encodeURIComponent(`/account/login?client_id=${appId}&tenantId=${tenantId}`)}&response_type=code&scope=offline_access&prompt=login&tenantId=${tenantId}`;
  await page.goto(loginUrl, { waitUntil: 'networkidle' });
  await page.waitForSelector('#loginId', { timeout: 5000 });
  await logInAsRichardHendricksViaTheHostedLoginPage(page);
}

async function openAccountEdit(page, baseUrl, appId, tenantId) {
  const accountUrl = `${baseUrl}/account/?client_id=${appId}&tenantId=${tenantId}&_=${Date.now()}`;
  await page.goto(accountUrl, { waitUntil: 'networkidle' });
  await page.locator('a, button').filter({ hasText: /edit profile/i }).first().click({ timeout: 5000 });
}

export async function setup_lifecycle_manageUsers_accountManagement_customizingAccountManagement_1(page, ctx) {
  if (ctx?.name !== 'lifecycle_manageUsers_accountManagement_customizingAccountManagement_1') return;
  const marked = await page.evaluate(() => {
    const cell = [...document.querySelectorAll('td')].find(td => td.textContent.includes('Default User Self Service provided by FusionAuth'));
    const row = cell?.closest('tr');
    if (!row) return false;
    row.setAttribute('data-screenshot-highlight', 'self-service-form-row');
    row.scrollIntoView({ block: 'center', behavior: 'instant' });
    return true;
  });
  if (!marked) throw new Error('Default User Self Service form row not found');
}

export async function setup_lifecycle_manageUsers_accountManagement_customizingAccountManagement_2(page, ctx, baseUrl, appId) {
  if (ctx?.name !== 'lifecycle_manageUsers_accountManagement_customizingAccountManagement_2') return;
  try {
    const { formId } = await getApplicationForm(baseUrl, appId);
    await page.goto(`${baseUrl}/admin/form/edit/${formId}`, { waitUntil: 'networkidle' });
    await page.getByText(/Form Sections/i).waitFor({ timeout: 10000 });
    await page.waitForTimeout(300);
  } catch (error) {
    throw new Error(`lifecycle_manageUsers_accountManagement_customizingAccountManagement_2: setup failed: ${error.message}`, { cause: error });
  }
}

export async function setup_lifecycle_manageUsers_accountManagement_customizingAccountManagement_3(page, ctx, baseUrl, appId) {
  if (ctx?.name !== 'lifecycle_manageUsers_accountManagement_customizingAccountManagement_3') return;
  let birthdateField;
  try {
    birthdateField = await ensureBirthdateField(baseUrl);
    const { formId } = await getApplicationForm(baseUrl, appId);
    await page.goto(`${baseUrl}/admin/form/edit/${formId}`, { waitUntil: 'networkidle' });
    await page.locator('a[href="/ajax/form/field/add"]').click({ timeout: 5000 });
    await page.getByText(/^Add Field$/i).waitFor({ timeout: 5000 });
    await page.getByLabel(/^Field$/i).selectOption({ label: birthdateField.name });
    await page.waitForTimeout(300);
  } catch (error) {
    throw new Error(`lifecycle_manageUsers_accountManagement_customizingAccountManagement_3: setup failed: ${error.message}`, { cause: error });
  }
}

export async function setup_lifecycle_manageUsers_accountManagement_customizingAccountManagement_4(page, ctx, baseUrl, appId, tenantId) {
  if (ctx?.name !== 'lifecycle_manageUsers_accountManagement_customizingAccountManagement_4') return;
  let field;
  let form;
  let originalBirthDate;
  try {
    field = await ensureBirthdateField(baseUrl);
    const original = await getApplicationForm(baseUrl, appId);
    form = original.form;
    const steps = form.steps.map((step, index) => index === 0 && !step.fields.includes(field.fieldId)
      ? { ...step, fields: [...step.fields, field.fieldId] }
      : step,
    );
    if (steps.some((step, index) => step.fields !== form.steps[index].fields)) {
      await setFormSteps(baseUrl, original.formId, steps);
    }

    const { user } = await apiJson(baseUrl, `/api/user/${richardId}`);
    originalBirthDate = user.birthDate ?? null;
    await apiJson(baseUrl, `/api/user/${richardId}`, 'PATCH', { user: { birthDate: '1981-06-04' } });

    await loginRichard(page, baseUrl, appId, tenantId);
    await openAccountEdit(page, baseUrl, appId, tenantId);
    await page.getByText(/Birthdate/i).waitFor({ timeout: 5000 });
    await page.waitForTimeout(300);
  } catch (error) {
    throw new Error(`lifecycle_manageUsers_accountManagement_customizingAccountManagement_4: setup failed: ${error.message}`, { cause: error });
  } finally {
    if (form) {
      const { formId } = await getApplicationForm(baseUrl, appId);
      await setFormSteps(baseUrl, formId, form.steps);
    }
    if (originalBirthDate !== undefined) {
      await apiJson(baseUrl, `/api/user/${richardId}`, 'PATCH', { user: { birthDate: originalBirthDate } });
    }
  }
}

export async function setup_lifecycle_manageUsers_accountManagement_customizingAccountManagement_5(page, ctx, baseUrl) {
  if (ctx?.name !== 'lifecycle_manageUsers_accountManagement_customizingAccountManagement_5') return;
  try {
    await page.goto(`${baseUrl}/admin/theme/edit/${screenshotsThemeId}`, { waitUntil: 'networkidle' });
    await page.locator('button').filter({ hasText: /Account edit/i }).first().click({ timeout: 5000 });
    await page.waitForTimeout(300);
  } catch (error) {
    throw new Error(`lifecycle_manageUsers_accountManagement_customizingAccountManagement_5: setup failed: ${error.message}`, { cause: error });
  }
}

export async function setup_lifecycle_manageUsers_accountManagement_customizingAccountManagement_6(page, ctx, baseUrl, appId, tenantId) {
  if (ctx?.name !== 'lifecycle_manageUsers_accountManagement_customizingAccountManagement_6') return;
  let originalBirthDate;
  let originalUserData;
  try {
    const { user } = await apiJson(baseUrl, `/api/user/${richardId}`);
    originalBirthDate = user.birthDate ?? null;
    originalUserData = user.data ?? {};
    await apiJson(baseUrl, `/api/user/${richardId}`, 'PATCH', {
      user: { birthDate: '1981-06-04', data: { ...originalUserData, screenshotShowBirthdate: true } },
    });

    await page.evaluate(async () => {
      localStorage.clear();
      sessionStorage.clear();
      for (const registration of await navigator.serviceWorker.getRegistrations()) await registration.unregister();
      for (const cache of await caches.keys()) await caches.delete(cache);
    });
    await page.context().clearCookies();
    await loginRichard(page, baseUrl, appId, tenantId);
    const accountUrl = `${baseUrl}/account/?client_id=${appId}&tenantId=${tenantId}&_=${Date.now()}`;
    await page.goto(accountUrl, { waitUntil: 'networkidle' });
    await page.getByText(/This is now modified with a birthdate field/i).waitFor({ timeout: 5000 });
    await page.getByText(/^Birthdate$/i).waitFor({ timeout: 5000 });
    await page.waitForTimeout(300);
  } catch (error) {
    const pageState = await page.evaluate(() => ({
      url: location.href,
      text: document.body.innerText.replace(/\s+/g, ' ').slice(0, 400),
    })).catch(() => null);
    throw new Error(`lifecycle_manageUsers_accountManagement_customizingAccountManagement_6: setup failed: ${error.message}; page state: ${JSON.stringify(pageState)}`, { cause: error });
  } finally {
    if (originalBirthDate !== undefined) {
      await apiJson(baseUrl, `/api/user/${richardId}`, 'PATCH', {
        user: { birthDate: originalBirthDate, data: { ...(originalUserData ?? {}), screenshotShowBirthdate: false } },
      });
    }
  }
}
