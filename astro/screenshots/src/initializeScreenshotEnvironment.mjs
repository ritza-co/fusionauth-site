const sleep = ms => new Promise(resolve => setTimeout(resolve, ms));

async function waitForKickstartApi({ baseUrl, apiKey, appId }) {
  const deadline = Date.now() + 150_000;
  let applicationReady = false;
  let lastStatus = 'no response';

  while (Date.now() < deadline) {
    try {
      const response = await fetch(`${baseUrl}/api/application/${appId}`, {
        headers: { Authorization: apiKey },
      });
      if (response.ok) {
        const { application } = await response.json();
        if (application?.id === appId) {
          applicationReady = true;
          break;
        }
        lastStatus = 'application is not available yet';
      } else {
        lastStatus = `GET /api/application/${appId} returned ${response.status}`;
        if (![401, 404, 500, 502, 503, 504].includes(response.status)) {
          throw new Error(`${lastStatus}: ${await response.text()}`);
        }
      }
    } catch (error) {
      if (error.message.startsWith('GET /api/application/')) throw error;
      lastStatus = error.message;
    }

    await sleep(2000);
  }

  if (!applicationReady) {
    throw new Error(`Timed out waiting for Kickstart/API readiness (${lastStatus})`);
  }

  // The license POST is the operation that previously returned 401 on a fresh
  // start, so confirm this exact API is ready before sending that request.
  while (Date.now() < deadline) {
    try {
      const response = await fetch(`${baseUrl}/api/reactor`, { headers: { Authorization: apiKey } });
      if (response.ok) {
        console.log('[screenshot] beforeAll: Kickstart and Reactor APIs ready');
        return;
      }
      lastStatus = `GET /api/reactor returned ${response.status}`;
      if (![401, 403, 404, 500, 502, 503, 504].includes(response.status)) {
        throw new Error(`${lastStatus}: ${await response.text()}`);
      }
    } catch (error) {
      if (error.message.startsWith('GET /api/reactor')) throw error;
      lastStatus = error.message;
    }
    await sleep(2000);
  }

  throw new Error(`Timed out waiting for Reactor API readiness (${lastStatus})`);
}

async function activateLicense({ baseUrl, apiKey, licenseKey, tenantId, appId, richardId }) {
  if (!licenseKey) return;

  try {
    const response = await fetch(`${baseUrl}/api/reactor`, {
      method: 'POST',
      headers: { Authorization: apiKey, 'Content-Type': 'application/json' },
      body: JSON.stringify({ licenseId: licenseKey }),
    });
    if (!response.ok && response.status !== 409) {
      throw new Error(`${response.status} ${await response.text()}`);
    }

    const deadline = Date.now() + 15_000;
    while (Date.now() < deadline) {
      const statusResponse = await fetch(`${baseUrl}/api/reactor`, { headers: { Authorization: apiKey } });
      if (statusResponse.ok) {
        const { status } = await statusResponse.json();
        if (status?.licensed === true) {
          console.log('[screenshot] beforeAll: license active, webAuthn:', status.webAuthn,
            'advanced MFA:', status.advancedMultiFactorAuthentication,
            'application MFA:', status.applicationMultiFactorAuthentication);
          break;
        }
      }
      await sleep(1000);
    }

    await fetch(`${baseUrl}/api/tenant/${tenantId}`, {
      method: 'PATCH',
      headers: { Authorization: apiKey, 'Content-Type': 'application/json' },
      body: JSON.stringify({ tenant: { webAuthnConfiguration: {
        enabled: true,
        bootstrapWorkflow: { enabled: true },
        reauthenticationWorkflow: { enabled: true },
      } } }),
    });
    await fetch(`${baseUrl}/api/user/registration/${richardId}`, {
      method: 'POST',
      headers: { Authorization: apiKey, 'Content-Type': 'application/json' },
      body: JSON.stringify({ registration: { applicationId: appId, roles: ['admin'] } }),
    });
  } catch (error) {
    throw new Error(`beforeAll: license setup failed: ${error.message}`, { cause: error });
  }
}

async function configureEmailMfa({ baseUrl, apiKey, tenantId, appId }) {
  const reactorResponse = await fetch(`${baseUrl}/api/reactor`, { headers: { Authorization: apiKey } });
  if (!reactorResponse.ok) throw new Error(`GET /api/reactor ${reactorResponse.status}`);
  const { status } = await reactorResponse.json();
  if (status?.advancedMultiFactorAuthentication !== 'ACTIVE') {
    throw new Error(`Email MFA screenshots require active Advanced MFA; status is ${status?.advancedMultiFactorAuthentication ?? 'unknown'}`);
  }

  const templatesResponse = await fetch(`${baseUrl}/api/email/template`, { headers: { Authorization: apiKey } });
  if (!templatesResponse.ok) throw new Error(`GET /api/email/template ${templatesResponse.status}`);
  const { emailTemplates = [] } = await templatesResponse.json();
  const template = emailTemplates.find(emailTemplate => emailTemplate.name === 'Two Factor Authentication');
  if (!template) throw new Error('Two Factor Authentication email template not found before browser setup');

  const tenantResponse = await fetch(`${baseUrl}/api/tenant/${tenantId}`, {
    method: 'PATCH',
    headers: { Authorization: apiKey, 'Content-Type': 'application/json' },
    body: JSON.stringify({ tenant: { multiFactorConfiguration: { email: { enabled: true, templateId: template.id } } } }),
  });
  if (!tenantResponse.ok) throw new Error(`PATCH /api/tenant/${tenantId} ${tenantResponse.status} ${await tenantResponse.text()}`);

  const appResponse = await fetch(`${baseUrl}/api/application/${appId}`, { headers: { Authorization: apiKey } });
  if (!appResponse.ok) throw new Error(`GET /api/application/${appId} ${appResponse.status}`);
  const { application } = await appResponse.json();
  const appPatchResponse = await fetch(`${baseUrl}/api/application/${appId}`, {
    method: 'PATCH',
    headers: { Authorization: apiKey, 'Content-Type': 'application/json' },
    body: JSON.stringify({ application: { multiFactorConfiguration: {
      ...application.multiFactorConfiguration,
      email: { ...(application.multiFactorConfiguration?.email ?? {}), templateId: template.id },
      loginPolicy: 'Enabled',
    } } }),
  });
  if (!appPatchResponse.ok) throw new Error(`PATCH /api/application/${appId} ${appPatchResponse.status} ${await appPatchResponse.text()}`);
}

export async function initializeScreenshotEnvironment({
  context,
  baseUrl,
  apiKey,
  tenantId,
  appId,
  richardId,
  licenseKey,
  prepareEmailMfa,
}) {
  await waitForKickstartApi({ baseUrl, apiKey, appId });
  await activateLicense({ baseUrl, apiKey, licenseKey, tenantId, appId, richardId });
  if (prepareEmailMfa) await configureEmailMfa({ baseUrl, apiKey, tenantId, appId });

  // Only create the admin browser session after screenshot-specific MFA settings
  // are in place; those settings affect methods offered in self-service flows.
  const page = await context.newPage();
  try {
    const deadline = Date.now() + 150_000;
    while (Date.now() < deadline) {
      await page.goto(`${baseUrl}/admin/login`, { waitUntil: 'load', timeout: 15000 }).catch(() => {});
      if (await page.$('#loginId')) break;
      await sleep(3000);
    }
    await page.fill('#loginId', 'richard@piedpiper.com');
    await page.fill('#password', 'password');
    await page.keyboard.press('Enter');
    await page.waitForURL(url => url.pathname.startsWith('/admin') && !url.pathname.startsWith('/admin/login'), { timeout: 30000 });
    return (await context.cookies(baseUrl)).find(cookie => cookie.name === 'fusionauth.locale')?.value;
  } finally {
    await page.close();
  }
}
