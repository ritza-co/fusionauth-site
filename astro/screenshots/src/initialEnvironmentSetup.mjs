import { sleep } from './shared.mjs';

async function waitForKickstartApi(baseUrl, apiKey, appId) {
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

async function activateLicense(baseUrl, apiKey, licenseKey, tenantId, appId, adminRichardId) {
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
    await fetch(`${baseUrl}/api/user/registration/${adminRichardId}`, {
      method: 'POST',
      headers: { Authorization: apiKey, 'Content-Type': 'application/json' },
      body: JSON.stringify({ registration: { applicationId: appId, roles: ['admin'] } }),
    });
  } catch (error) {
    throw new Error(`beforeAll: license setup failed: ${error.message}`, { cause: error });
  }
}

async function configureEmailMfa(baseUrl, apiKey, tenantId, appId) {
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

async function ensureSmsMockMessenger(baseUrl, apiKey, messengerId) {
  const url = `${baseUrl}/api/messenger/${messengerId}`;
  const existing = await fetch(url, { headers: { Authorization: apiKey } });
  if (existing.ok) return;
  if (existing.status !== 404) throw new Error(`GET /api/messenger/${messengerId} ${existing.status}`);

  const response = await fetch(url, {
    method: 'POST',
    headers: { Authorization: apiKey, 'Content-Type': 'application/json' },
    body: JSON.stringify({ messenger: {
      id: messengerId,
      type: 'Generic',
      name: 'SMS Mock (screenshots)',
      url: 'http://sms-mock:8081/',
      connectTimeout: 2000,
      readTimeout: 2000,
      debug: false,
    } }),
  });
  if (!response.ok) throw new Error(`POST /api/messenger/${messengerId} ${response.status} ${await response.text()}`);
  console.log('[screenshot] beforeAll: created SMS mock messenger');
}

async function configurePhoneMfa(baseUrl, apiKey, tenantId, appId, messengerId) {
  const reactorResponse = await fetch(`${baseUrl}/api/reactor`, { headers: { Authorization: apiKey } });
  if (!reactorResponse.ok) throw new Error(`GET /api/reactor ${reactorResponse.status}`);
  const { status } = await reactorResponse.json();
  if (status?.advancedMultiFactorAuthentication !== 'ACTIVE') {
    throw new Error(`Phone MFA screenshots require active Advanced MFA; status is ${status?.advancedMultiFactorAuthentication ?? 'unknown'}`);
  }

  const templatesResponse = await fetch(`${baseUrl}/api/message/template`, { headers: { Authorization: apiKey } });
  if (!templatesResponse.ok) throw new Error(`GET /api/message/template ${templatesResponse.status}`);
  const { messageTemplates = [] } = await templatesResponse.json();
  const template = messageTemplates.find(messageTemplate =>
    messageTemplate.name === 'Default Two Factor Request' && messageTemplate.type === 'SMS',
  );
  if (!template) throw new Error('Default Two Factor Request SMS template not found before browser setup');

  const tenantResponse = await fetch(`${baseUrl}/api/tenant/${tenantId}`, { headers: { Authorization: apiKey } });
  if (!tenantResponse.ok) throw new Error(`GET /api/tenant/${tenantId} ${tenantResponse.status}`);
  const { tenant } = await tenantResponse.json();
  const tenantMfa = tenant.multiFactorConfiguration ?? {};
  const tenantPatchResponse = await fetch(`${baseUrl}/api/tenant/${tenantId}`, {
    method: 'PATCH',
    headers: { Authorization: apiKey, 'Content-Type': 'application/json' },
    body: JSON.stringify({ tenant: { multiFactorConfiguration: {
      ...tenantMfa,
      loginPolicy: 'Enabled',
      sms: { ...(tenantMfa.sms ?? {}), enabled: true, messengerId, templateId: template.id },
      voice: { ...(tenantMfa.voice ?? {}), enabled: false },
    } } }),
  });
  if (!tenantPatchResponse.ok) throw new Error(`PATCH /api/tenant/${tenantId} ${tenantPatchResponse.status} ${await tenantPatchResponse.text()}`);

  const appResponse = await fetch(`${baseUrl}/api/application/${appId}`, { headers: { Authorization: apiKey } });
  if (!appResponse.ok) throw new Error(`GET /api/application/${appId} ${appResponse.status}`);
  const { application } = await appResponse.json();
  const appMfa = application.multiFactorConfiguration ?? {};
  const appPatchResponse = await fetch(`${baseUrl}/api/application/${appId}`, {
    method: 'PATCH',
    headers: { Authorization: apiKey, 'Content-Type': 'application/json' },
    body: JSON.stringify({ application: { multiFactorConfiguration: {
      ...appMfa,
      loginPolicy: 'Enabled',
      sms: { ...(appMfa.sms ?? {}), templateId: template.id },
    } } }),
  });
  if (!appPatchResponse.ok) throw new Error(`PATCH /api/application/${appId} ${appPatchResponse.status} ${await appPatchResponse.text()}`);
}

async function resetScreenshotBirthdateFlag(baseUrl, apiKey, adminRichardId) {
  const url = `${baseUrl}/api/user/${adminRichardId}`;
  const response = await fetch(url, { headers: { Authorization: apiKey } });
  if (!response.ok) throw new Error(`GET /api/user/${adminRichardId} ${response.status}`);
  const { user } = await response.json();
  if (user.data?.screenshotShowBirthdate === false) return;
  const patchResponse = await fetch(url, {
    method: 'PATCH',
    headers: { Authorization: apiKey, 'Content-Type': 'application/json' },
    body: JSON.stringify({ user: { data: { ...(user.data ?? {}), screenshotShowBirthdate: false } } }),
  });
  if (!patchResponse.ok) throw new Error(`PATCH /api/user/${adminRichardId} ${patchResponse.status} ${await patchResponse.text()}`);
}

export async function setupScreenshotEnvironment(baseUrl, apiKey, tenantId, appId, adminRichardId, messengerId, licenseKey) {
  await waitForKickstartApi(baseUrl, apiKey, appId);
  await activateLicense(baseUrl, apiKey, licenseKey, tenantId, appId, adminRichardId);
  await ensureSmsMockMessenger(baseUrl, apiKey, messengerId);
  await configureEmailMfa(baseUrl, apiKey, tenantId, appId);
  await configurePhoneMfa(baseUrl, apiKey, tenantId, appId, messengerId);
  await resetScreenshotBirthdateFlag(baseUrl, apiKey, adminRichardId);
}

