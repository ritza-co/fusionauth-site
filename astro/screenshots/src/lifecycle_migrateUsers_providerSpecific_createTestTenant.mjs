let tenantCreatedForCapture = false;

async function requestImportTenant(baseUrl, screenshotApiKey, importTenantId, method, body) {
  const response = await fetch(`${baseUrl}/api/tenant/${importTenantId}`, {
    method,
    headers: { Authorization: screenshotApiKey, 'Content-Type': 'application/json' },
    body: body && JSON.stringify(body),
  });
  if (!response.ok && !(method === 'GET' && response.status === 404)) {
    throw new Error(`test tenant ${method} failed: ${response.status} ${await response.text()}`);
  }
  return response.ok;
}

export async function setup1(page, ctx, baseUrl, screenshotApiKey, importTenantId) {
  const importTenantExists = await requestImportTenant(baseUrl, screenshotApiKey, importTenantId, 'GET');

  if (ctx?.name === 'migration-tenant-list') {
    if (!importTenantExists) {
      await requestImportTenant(baseUrl, screenshotApiKey, importTenantId, 'POST', { tenant: { name: 'Import test' } });
      tenantCreatedForCapture = true;
      await page.reload({ waitUntil: 'networkidle' });
    }
    await page.evaluate(id => {
      const cell = [...document.querySelectorAll('td')].find(td => td.textContent.trim() === id);
      if (cell) cell.setAttribute('data-hl', 'import-tenant-id');
    }, importTenantId);
    return;
  }

  if (importTenantExists) {
    await requestImportTenant(baseUrl, screenshotApiKey, importTenantId, 'DELETE');
    tenantCreatedForCapture = false;
    // the admin UI caches the tenant count; two tenants adds a Tenant field to some forms
    await page.waitForTimeout(5000);
    await page.reload({ waitUntil: 'networkidle' });
  }
}

export async function setup2(page, ctx) {
  if (ctx?.name !== 'migration-tenant-add') return;
  await page.fill('#tenant_name', 'Import test');
}

export async function cleanup1(page, ctx, baseUrl, screenshotApiKey, importTenantId) {
  if (ctx?.name !== 'migration-tenant-list' || !tenantCreatedForCapture) return;
  await requestImportTenant(baseUrl, screenshotApiKey, importTenantId, 'DELETE');
  tenantCreatedForCapture = false;
}
