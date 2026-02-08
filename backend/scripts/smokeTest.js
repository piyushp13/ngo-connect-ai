#!/usr/bin/env node
'use strict';

// End-to-end API smoke test runner (CLI only).
//
// Prereqs:
// - Backend server running (default: http://localhost:5001)
// - Database schema applied + seeded users/NGOs/admin available

const DEFAULT_API_BASE = 'http://localhost:5001/api';

const API_BASE = String(process.env.API_BASE || DEFAULT_API_BASE).replace(/\/+$/, '');

const credentials = {
  user: {
    email: process.env.SMOKE_USER_EMAIL || 'rahul@example.com',
    password: process.env.SMOKE_USER_PASSWORD || 'password123'
  },
  ngo: {
    email: process.env.SMOKE_NGO_EMAIL || 'akshayapatra@ngo.org',
    password: process.env.SMOKE_NGO_PASSWORD || 'password123'
  },
  admin: {
    email: process.env.SMOKE_ADMIN_EMAIL || 'admin@ngoconnect.org',
    password: process.env.SMOKE_ADMIN_PASSWORD || 'password123'
  }
};

const toApiUrl = (path) => {
  const cleaned = path.startsWith('/') ? path : `/${path}`;
  return `${API_BASE}${cleaned}`;
};

const toOriginUrl = (path) => {
  const origin = new URL(API_BASE).origin;
  const cleaned = path.startsWith('/') ? path : `/${path}`;
  return `${origin}${cleaned}`;
};

const decodeBase64Url = (input) => {
  const normalized = String(input || '').replace(/-/g, '+').replace(/_/g, '/');
  const padded = normalized.padEnd(Math.ceil(normalized.length / 4) * 4, '=');
  return Buffer.from(padded, 'base64').toString('utf8');
};

const decodeJwt = (token) => {
  const parts = String(token || '').split('.');
  if (parts.length < 2) return null;
  try {
    return JSON.parse(decodeBase64Url(parts[1]));
  } catch (err) {
    return null;
  }
};

const safeJsonParse = (text) => {
  if (!text) return null;
  try {
    return JSON.parse(text);
  } catch (err) {
    return null;
  }
};

const formatPreview = (value) => {
  if (value === null || value === undefined) return '';
  if (typeof value === 'string') return value.slice(0, 500);
  try {
    return JSON.stringify(value).slice(0, 700);
  } catch (err) {
    return String(value).slice(0, 500);
  }
};

const expect = (condition, message) => {
  if (!condition) {
    const error = new Error(message);
    error.name = 'SmokeTestAssertionError';
    throw error;
  }
};

const requestJson = async (method, path, { token, body, expectedStatus } = {}) => {
  const url = toApiUrl(path);
  const headers = {
    Accept: 'application/json'
  };

  let payload;
  if (body !== undefined) {
    headers['Content-Type'] = 'application/json';
    payload = JSON.stringify(body);
  }

  if (token) {
    headers.Authorization = `Bearer ${token}`;
  }

  const res = await fetch(url, {
    method,
    headers,
    body: payload
  });

  const contentType = String(res.headers.get('content-type') || '');
  const text = await res.text();
  const data = contentType.includes('application/json') ? safeJsonParse(text) : text;

  if (expectedStatus !== undefined) {
    const allowed = Array.isArray(expectedStatus) ? expectedStatus : [expectedStatus];
    if (!allowed.includes(res.status)) {
      throw new Error(`${method} ${path} -> ${res.status} (expected ${allowed.join(' or ')}): ${formatPreview(data)}`);
    }
  } else if (!res.ok) {
    throw new Error(`${method} ${path} -> ${res.status}: ${formatPreview(data)}`);
  }

  return { status: res.status, headers: res.headers, data };
};

const requestText = async (method, path, { token, body, expectedStatus } = {}) => {
  const url = toApiUrl(path);
  const headers = {
    Accept: '*/*'
  };

  let payload;
  if (body !== undefined) {
    headers['Content-Type'] = 'application/json';
    payload = JSON.stringify(body);
  }

  if (token) {
    headers.Authorization = `Bearer ${token}`;
  }

  const res = await fetch(url, {
    method,
    headers,
    body: payload
  });

  const text = await res.text();

  if (expectedStatus !== undefined) {
    const allowed = Array.isArray(expectedStatus) ? expectedStatus : [expectedStatus];
    if (!allowed.includes(res.status)) {
      throw new Error(`${method} ${path} -> ${res.status} (expected ${allowed.join(' or ')}): ${text.slice(0, 400)}`);
    }
  } else if (!res.ok) {
    throw new Error(`${method} ${path} -> ${res.status}: ${text.slice(0, 400)}`);
  }

  return { status: res.status, headers: res.headers, data: text };
};

const step = async (name, fn) => {
  const started = Date.now();
  process.stdout.write(`- ${name}... `);
  const result = await fn();
  const duration = Date.now() - started;
  process.stdout.write(`OK (${duration}ms)\n`);
  return result;
};

const login = async (role) => {
  const creds = credentials[role];
  expect(creds?.email && creds?.password, `Missing credentials for role: ${role}`);
  const res = await requestJson('POST', '/auth/login', {
    body: { email: creds.email, password: creds.password },
    expectedStatus: 200
  });
  const token = res.data?.token;
  expect(token, `Login token missing for ${role}`);
  return token;
};

const findFirst = (items, predicate) => {
  if (!Array.isArray(items)) return null;
  for (const item of items) {
    if (predicate(item)) return item;
  }
  return null;
};

const main = async () => {
  console.log(`API_BASE=${API_BASE}`);

  await step('API health', async () => {
    const res = await requestJson('GET', '/', { expectedStatus: [200, 404] }).catch(async () => {
      // Health is mounted at origin '/' not '/api' in this project.
      const originRes = await fetch(toOriginUrl('/'));
      expect(originRes.ok, `Origin health failed: ${originRes.status}`);
      const json = safeJsonParse(await originRes.text());
      expect(json && json.ok === true, 'Origin health response invalid');
      return { status: originRes.status, data: json };
    });
    if (res?.data && typeof res.data === 'object' && res.data.ok === true) return;
    // Accept unknown body for /api root (depending on setup), as long as origin health works.
    const originRes = await fetch(toOriginUrl('/'));
    expect(originRes.ok, `Origin health failed: ${originRes.status}`);
    const json = safeJsonParse(await originRes.text());
    expect(json && json.ok === true, 'Origin health response invalid');
  });

  const tokens = {};
  const identities = {};

  tokens.user = await step('Login as user', () => login('user'));
  identities.user = decodeJwt(tokens.user);
  expect(identities.user?.id && identities.user?.role === 'user', 'User JWT payload invalid');

  tokens.ngo = await step('Login as NGO', () => login('ngo'));
  identities.ngo = decodeJwt(tokens.ngo);
  expect(identities.ngo?.id && identities.ngo?.role === 'ngo', 'NGO JWT payload invalid');

  tokens.admin = await step('Login as admin', () => login('admin'));
  identities.admin = decodeJwt(tokens.admin);
  expect(identities.admin?.id && identities.admin?.role === 'admin', 'Admin JWT payload invalid');

  const ngoMe = await step('Fetch NGO profile', async () => {
    const res = await requestJson('GET', '/ngos/me', { token: tokens.ngo, expectedStatus: 200 });
    expect(res.data?.id, 'NGO profile missing id');
    return res.data;
  });

  const ngos = await step('List NGOs', async () => {
    const res = await requestJson('GET', '/ngos', { expectedStatus: 200 });
    expect(Array.isArray(res.data) && res.data.length > 0, 'NGO list empty');
    return res.data;
  });

  const campaigns = await step('List campaigns', async () => {
    const res = await requestJson('GET', '/campaigns', { expectedStatus: 200 });
    expect(Array.isArray(res.data) && res.data.length > 0, 'Campaign list empty');
    return res.data;
  });

  const ownedCampaigns = campaigns.filter((campaign) => String(campaign?.ngo?.id || campaign?.ngo || '') === String(ngoMe.id));
  expect(ownedCampaigns.length > 0, 'No campaigns found for seeded NGO account. Seed may not match SMOKE_NGO_EMAIL.');

  const donationCampaign = findFirst(
    ownedCampaigns,
    (campaign) => Number(campaign?.goalAmount || 0) > 0
  ) || ownedCampaigns[0];
  expect(donationCampaign?.id, 'Unable to pick campaign for donation');

  const volunteerCampaign = findFirst(
    ownedCampaigns,
    (campaign) => Array.isArray(campaign?.volunteersNeeded) && campaign.volunteersNeeded.length > 0
  ) || ownedCampaigns[0];
  expect(volunteerCampaign?.id, 'Unable to pick campaign for volunteering');

  const donationFlow = await step('Donation: initiate + confirm + receipt', async () => {
    const initiate = await requestJson('POST', `/donations/campaign/${donationCampaign.id}/initiate`, {
      token: tokens.user,
      body: {
        amount: 2453,
        paymentMethod: 'upi',
        donorName: 'Rahul Kumar',
        donorEmail: credentials.user.email,
        donorPhone: '9999999999',
        message: 'Smoke test donation',
        paymentDetails: { upiId: 'rahul@upi' }
      },
      expectedStatus: 200
    });

    const donationId = initiate.data?.donation?.id;
    expect(donationId, 'Donation initiate missing donation.id');

    const confirm = await requestJson('POST', `/donations/${donationId}/confirm`, {
      token: tokens.user,
      body: {
        orderId: initiate.data?.gatewayOrder?.orderId,
        paymentId: `mock_payment_${Date.now().toString(36)}`
      },
      expectedStatus: 200
    });

    expect(confirm.data?.donation?.status === 'completed', `Donation not completed: ${formatPreview(confirm.data?.donation)}`);

    const receipt = await requestJson('GET', `/donations/${donationId}/receipt`, {
      token: tokens.user,
      expectedStatus: 200
    });

    expect(receipt.data?.receiptNumber, 'Receipt payload missing receiptNumber');

    return { donationId };
  });

  await step('Donation: NGO certificate approve + user certificate visible', async () => {
    const pending = await requestJson('GET', '/donations/ngo/pending-approvals', {
      token: tokens.ngo,
      expectedStatus: 200
    });
    const pendingIds = new Set((pending.data || []).map((d) => String(d?.id || '')));
    expect(pendingIds.has(String(donationFlow.donationId)), 'Donation not found in NGO pending approvals queue');

    const decision = await requestJson('POST', `/donations/${donationFlow.donationId}/certificate/decision`, {
      token: tokens.ngo,
      body: { decision: 'approve', note: 'Approved in smoke test' },
      expectedStatus: 200
    });
    expect(decision.data?.certificate?.id, 'Donation certificate approve missing certificate.id');

    const myCerts = await requestJson('GET', '/certificates/my', { token: tokens.user, expectedStatus: 200 });
    expect(Array.isArray(myCerts.data), 'User certificates payload invalid');
    const hasDonationCert = myCerts.data.some((cert) => String(cert?.id || '') === String(decision.data.certificate.id));
    expect(hasDonationCert, 'Approved donation certificate not visible to user');
  });

  const volunteerOpportunity = await step('Volunteer opportunity: create (NGO)', async () => {
    const now = new Date();
    const end = new Date(now.getTime() + 1000 * 60 * 60 * 24 * 30);
    const res = await requestJson('POST', '/volunteering', {
      token: tokens.ngo,
      body: {
        title: 'Volunteer: Bengaluru Outreach Sprint',
        description: 'Short on-ground outreach sprint for smoke test validation.',
        location: 'Indiranagar, Bengaluru, Karnataka',
        skills: ['Community Outreach', 'Data Entry Support'],
        commitment: 'One-time',
        dateRange: { startDate: now.toISOString(), endDate: end.toISOString() },
        spots: 12
      },
      expectedStatus: 200
    });
    expect(res.data?.id, 'Created volunteer opportunity missing id');
    return res.data;
  });

  const volunteerApplication = await step('Volunteer opportunity: apply + complete (user)', async () => {
    const applyRes = await requestJson('POST', `/volunteering/${volunteerOpportunity.id}/apply`, {
      token: tokens.user,
      body: {
        fullName: 'Rahul Kumar',
        email: credentials.user.email,
        phone: '9999999999',
        preferredActivities: ['Community Outreach'],
        availability: 'Weekends',
        motivation: 'Smoke test'
      },
      expectedStatus: [200, 201]
    });
    const applicationId = applyRes.data?.application?.id;
    expect(applicationId, `Volunteer apply missing application.id: ${formatPreview(applyRes.data)}`);

    const completeRes = await requestJson('POST', `/volunteering/${volunteerOpportunity.id}/complete`, {
      token: tokens.user,
      body: { activityHours: 4 },
      expectedStatus: 200
    });
    expect(completeRes.data?.application?.status === 'completed', 'Volunteer complete did not mark completed');

    return { applicationId };
  });

  await step('Volunteer opportunity: NGO certificate approve', async () => {
    const pendingRes = await requestJson('GET', '/volunteering/approvals/ngo/pending', {
      token: tokens.ngo,
      expectedStatus: 200
    });
    const pendingIds = new Set((pendingRes.data || []).map((row) => String(row?.id || '')));
    expect(pendingIds.has(String(volunteerApplication.applicationId)), 'Volunteer application not found in NGO pending approvals');

    const decisionRes = await requestJson('POST', `/volunteering/applications/${volunteerApplication.applicationId}/certificate/decision`, {
      token: tokens.ngo,
      body: { decision: 'approve', note: 'Approved in smoke test' },
      expectedStatus: 200
    });
    expect(decisionRes.data?.certificate?.id, 'Volunteer certificate decision missing certificate.id');
  });

  await step('Campaign volunteering: submit + NGO approve', async () => {
    const joinRes = await requestJson('POST', `/campaigns/${volunteerCampaign.id}/volunteer`, {
      token: tokens.user,
      body: {
        fullName: 'Rahul Kumar',
        email: credentials.user.email,
        phone: '9999999999',
        preferredActivities: ['Field Communications'],
        availability: 'Weekends',
        motivation: 'Smoke test'
      },
      expectedStatus: 200
    });
    expect(joinRes.data?.registration, 'Campaign volunteer join missing registration');

    const decisionRes = await requestJson('POST', `/campaigns/${volunteerCampaign.id}/volunteer/decision`, {
      token: tokens.ngo,
      body: {
        userId: identities.user.id,
        decision: 'approve',
        note: 'Approved in smoke test',
        activityHours: 3.5
      },
      expectedStatus: 200
    });
    expect(decisionRes.data?.registration?.certificateApprovalStatus === 'approved', 'Campaign volunteer approval did not set approved');
    expect(decisionRes.data?.certificate?.id || decisionRes.data?.registration?.certificate, 'Campaign volunteer approval missing certificate');

    const myRegs = await requestJson('GET', '/campaigns/my/volunteer-registrations', {
      token: tokens.user,
      expectedStatus: 200
    });
    expect(Array.isArray(myRegs.data), 'Campaign volunteer registrations payload invalid');
    const row = myRegs.data.find((entry) => String(entry?.campaign?.id || '') === String(volunteerCampaign.id));
    expect(row, 'Campaign volunteer registration missing from /campaigns/my/volunteer-registrations');
    expect(row.registration, 'Campaign volunteer registration missing details');
  });

  const supportRequest = await step('Support request: create (user)', async () => {
    const res = await requestJson('POST', '/requests', {
      token: tokens.user,
      body: {
        ngoId: ngoMe.id,
        age: 24,
        location: 'Koramangala, Bengaluru, Karnataka',
        helpType: 'Medical Support',
        description: 'Smoke test support request'
      },
      expectedStatus: 200
    });
    expect(res.data?.id, 'Support request create missing id');
    return res.data;
  });

  await step('Support request: appears in NGO inbox + status update', async () => {
    const ngoInbox = await requestJson('GET', '/requests/ngo', { token: tokens.ngo, expectedStatus: 200 });
    const inboxHas = (ngoInbox.data || []).some((row) => String(row?.id || '') === String(supportRequest.id));
    expect(inboxHas, 'Support request not visible to selected NGO');

    await requestJson('PUT', `/requests/${supportRequest.id}/status`, {
      token: tokens.ngo,
      body: { status: 'Approved' },
      expectedStatus: 200
    });

    const myRequests = await requestJson('GET', '/requests/my', { token: tokens.user, expectedStatus: 200 });
    const updated = (myRequests.data || []).find((row) => String(row?.id || '') === String(supportRequest.id));
    expect(updated && String(updated.status || '').toLowerCase() === 'approved', 'Support request status did not update for user');
  });

  await step('Messaging: user -> NGO -> user thread roundtrip', async () => {
    await requestJson('POST', `/messages/to-ngo/${ngoMe.id}`, {
      token: tokens.user,
      body: { body: 'Smoke test: hello NGO team!' },
      expectedStatus: 201
    });

    const ngoConversations = await requestJson('GET', '/messages/conversations', {
      token: tokens.ngo,
      expectedStatus: 200
    });
    expect(Array.isArray(ngoConversations.data), 'NGO conversations payload invalid');

    await requestJson('POST', `/messages/to-user/${identities.user.id}`, {
      token: tokens.ngo,
      body: { body: 'Smoke test: hello user, we received your message.' },
      expectedStatus: 201
    });

    const userThread = await requestJson('GET', `/messages/thread/${ngoMe.id}`, {
      token: tokens.user,
      expectedStatus: 200
    });
    const messages = userThread.data?.messages || [];
    expect(Array.isArray(messages) && messages.length > 0, 'User thread missing messages');
    const hasNgoReply = messages.some((m) => m?.senderRole === 'ngo' && String(m?.body || '').includes('we received your message'));
    expect(hasNgoReply, 'NGO reply not present in user thread');
  });

  await step('Flag request: submit + admin approve (best effort)', async () => {
    const candidate = findFirst(ngos, (ngo) => String(ngo?.id || '') !== String(ngoMe.id)) || ngos[0];
    expect(candidate?.id, 'Unable to pick NGO for flag request');

    const create = await requestJson('POST', `/ngos/${candidate.id}/flag-request`, {
      token: tokens.user,
      body: { reason: 'Smoke test moderation request' },
      expectedStatus: [200, 400]
    });

    let requestId = create.data?.request?.id || create.data?.id || null;

    const list = await requestJson('GET', '/admin/flag-requests', {
      token: tokens.admin,
      expectedStatus: 200
    });
    expect(Array.isArray(list.data), 'Admin flag request list payload invalid');

    if (!requestId) {
      // If the create call was rejected due to duplicate pending requests, find an existing pending row.
      const pending = list.data.find((row) => (
        String(row?.targetType || '').toLowerCase() === 'ngo' &&
        String(row?.targetId || '') === String(candidate.id) &&
        String(row?.status || '').toLowerCase() === 'pending'
      ));
      requestId = pending?.id || null;
    }

    if (!requestId) {
      // Don’t fail the full smoke test if moderation request already exists but is not discoverable.
      return;
    }

    await requestJson('PUT', `/admin/flag-requests/${requestId}/approve`, {
      token: tokens.admin,
      body: { note: 'Approved via smoke test' },
      expectedStatus: 200
    });
  });

  await step('Admin dashboard snapshot', async () => {
    const dashboard = await requestJson('GET', '/admin/dashboard?noCache=true', {
      token: tokens.admin,
      expectedStatus: 200
    });
    expect(dashboard.data && typeof dashboard.data === 'object', 'Admin dashboard snapshot invalid');
    expect(dashboard.data.supportRequestsSummary, 'Admin dashboard snapshot missing supportRequestsSummary');

    const ssr = await requestText('GET', '/admin/dashboard/ssr?noCache=true', {
      token: tokens.admin,
      expectedStatus: 200
    });
    expect(typeof ssr.data === 'string' && ssr.data.length > 100, 'Admin dashboard SSR HTML response invalid');
  });

  console.log('\nSmoke test completed successfully.');
};

main().catch((err) => {
  console.error('\nSmoke test failed.');
  console.error(err && err.stack ? err.stack : err);
  process.exit(1);
});

