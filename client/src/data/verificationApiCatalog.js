const API_BASE = '/api';

const methodColors = {
  GET: 'bg-emerald-50 text-emerald-700 ring-emerald-600/20',
  POST: 'bg-blue-50 text-blue-700 ring-blue-600/20',
  PUT: 'bg-amber-50 text-amber-700 ring-amber-600/20',
};

function slugFromId(id) {
  return id.replace(/-/g, '_');
}

function defaultFields(item) {
  return [
    { name: 'reference_id', type: 'string', required: true, description: 'Your unique request id for idempotency' },
    { name: 'consent', type: 'boolean', required: true, description: 'User consent captured before verify' },
    { name: 'document_number', type: 'string', required: true, description: `${item.label} number to verify` },
  ];
}

function defaultResponse(item) {
  return {
    success: true,
    message: `${item.label} verified`,
    data: {
      request_id: 'vrf_8f2a1c',
      status: 'verified',
      document_type: item.label,
      masked_id: 'XXXX-XXXX-1234',
      verified_at: '2026-08-17T09:30:00Z',
    },
  };
}

const apiOverrides = {
  aadhaar: {
    method: 'POST',
    path: `${API_BASE}/kyc/aadhaar`,
    auth: 'Public (pre-login) · Bearer optional',
    summary: 'Validate Aadhaar checksum and return masked last-4 digits.',
    requestFields: [
      { name: 'aadhaar', type: 'string', required: true, description: '12-digit Aadhaar number' },
    ],
    sampleRequest: { aadhaar: '234567890123' },
    sampleResponse: {
      success: true,
      message: 'Aadhaar checksum verified',
      data: { valid: true, last4: '0123', masked: 'XXXX-XXXX-0123' },
    },
    webhook: 'verification.aadhaar.completed',
    latency: '< 30s',
  },
  pan: {
    method: 'POST',
    path: `${API_BASE}/kyc/pan`,
    auth: 'Public (pre-login) · Bearer optional',
    summary: 'Validate PAN format, holder type, and checksum.',
    requestFields: [
      { name: 'pan', type: 'string', required: true, description: '10-character PAN' },
      { name: 'intent', type: 'string', required: false, description: 'personal | business' },
    ],
    sampleRequest: { pan: 'ABCDE1234F', intent: 'personal' },
    sampleResponse: {
      success: true,
      message: 'PAN verified · Individual',
      data: { valid: true, pan: 'ABCDE1234F', holderType: 'Individual' },
    },
    webhook: 'verification.pan.completed',
    latency: '< 10s',
  },
  'pan-verify': {
    method: 'POST',
    path: `${API_BASE}/kyc/pan`,
    auth: 'Bearer JWT or API key',
    summary: 'Number, name, and status check against the Income Tax format.',
    requestFields: [
      { name: 'pan', type: 'string', required: true, description: '10-character PAN' },
      { name: 'intent', type: 'string', required: false, description: 'personal | business' },
    ],
    sampleRequest: { pan: 'ABCDE1234F' },
    sampleResponse: {
      success: true,
      data: { valid: true, pan: 'ABCDE1234F', holderType: 'Individual' },
    },
    webhook: 'verification.pan.completed',
    latency: '< 10s',
  },
  gstin: {
    method: 'POST',
    path: `${API_BASE}/kyc/gstin`,
    auth: 'Bearer JWT',
    summary: 'Validate GSTIN checksum and fetch registered state.',
    requestFields: [{ name: 'gstin', type: 'string', required: true, description: '15-character GSTIN' }],
    sampleRequest: { gstin: '27AABCU9603R1ZM' },
    sampleResponse: {
      success: true,
      message: 'GSTIN verified · Maharashtra',
      data: { valid: true, gstin: '27AABCU9603R1ZM', state: 'Maharashtra' },
    },
    webhook: 'verification.gstin.completed',
    latency: '< 15s',
  },
  'ifsc-lookup': {
    method: 'GET',
    path: `${API_BASE}/kyc/ifsc/:code`,
    auth: 'Public',
    summary: 'Look up bank and branch from RBI IFSC directory.',
    requestFields: [{ name: 'code', type: 'string', required: true, description: '11-character IFSC (path param)' }],
    sampleRequest: null,
    sampleResponse: {
      success: true,
      data: { valid: true, ifsc: 'HDFC0001234', bank: 'HDFC Bank', branch: 'Mumbai Main' },
    },
    webhook: null,
    latency: '< 5s',
  },
  'bank-account': {
    method: 'POST',
    path: `${API_BASE}/v1/verify/bank_account`,
    auth: 'Bearer JWT or API key',
    summary: 'Penny-drop style account verification with name match.',
    requestFields: [
      { name: 'account_number', type: 'string', required: true, description: 'Beneficiary account number' },
      { name: 'ifsc', type: 'string', required: true, description: '11-character IFSC' },
      { name: 'account_holder_name', type: 'string', required: true, description: 'Name to match against bank record' },
    ],
    sampleRequest: {
      account_number: '50100123456789',
      ifsc: 'HDFC0001234',
      account_holder_name: 'Harshit Sharma',
    },
    sampleResponse: {
      success: true,
      data: {
        status: 'verified',
        name_match_score: 0.98,
        bank: 'HDFC Bank',
        branch: 'Mumbai Main',
      },
    },
    webhook: 'verification.bank_account.completed',
    latency: '< 45s',
  },
  'face-match': {
    method: 'POST',
    path: `${API_BASE}/v1/verify/face_match`,
    auth: 'Bearer JWT',
    summary: 'Liveness check plus selfie-to-ID photo compare.',
    requestFields: [
      { name: 'selfie_base64', type: 'string', required: true, description: 'Base64 selfie image' },
      { name: 'id_image_base64', type: 'string', required: true, description: 'Base64 photo from ID document' },
    ],
    sampleRequest: { selfie_base64: '<base64>', id_image_base64: '<base64>' },
    sampleResponse: {
      success: true,
      data: { liveness: 'pass', match_score: 0.94, status: 'verified' },
    },
    webhook: 'verification.face_match.completed',
    latency: '< 20s',
  },
  'credit-score': {
    method: 'POST',
    path: `${API_BASE}/v1/verify/credit_score`,
    auth: 'Bearer JWT',
    summary: 'Soft credit pull with user consent for lending decisions.',
    requestFields: [
      { name: 'pan', type: 'string', required: true, description: 'PAN linked to credit file' },
      { name: 'mobile', type: 'string', required: true, description: 'Mobile for OTP consent' },
    ],
    sampleRequest: { pan: 'ABCDE1234F', mobile: '9876543210' },
    sampleResponse: {
      success: true,
      data: { score: 742, bureau: 'mock', range: 'good' },
    },
    webhook: 'verification.credit_score.completed',
    latency: '< 30s',
  },
  'full-kyc': {
    method: 'POST',
    path: `${API_BASE}/kyc`,
    auth: 'Bearer JWT',
    summary: 'Submit PAN + Aadhaar together and mark profile KYC verified.',
    requestFields: [
      { name: 'pan', type: 'string', required: true, description: '10-character PAN' },
      { name: 'aadhaar', type: 'string', required: true, description: '12-digit Aadhaar' },
    ],
    sampleRequest: { pan: 'ABCDE1234F', aadhaar: '234567890123' },
    sampleResponse: {
      success: true,
      message: 'KYC verified',
      data: { kycStatus: 'verified', pan: 'ABCDE1234F', holderType: 'Individual', aadhaarLast4: '0123' },
    },
    webhook: 'verification.kyc.completed',
    latency: '< 60s',
  },
  'ckyc-search': {
    method: 'POST',
    path: `${API_BASE}/v1/verify/ckyc/search`,
    auth: 'Bearer JWT or API key',
    summary: 'Search CKYC registry by PAN or mobile with consent.',
    requestFields: [
      { name: 'pan', type: 'string', required: false, description: 'PAN to search CKYC' },
      { name: 'mobile', type: 'string', required: false, description: 'Mobile linked to CKYC' },
    ],
    sampleRequest: { pan: 'ABCDE1234F' },
    sampleResponse: {
      success: true,
      data: { found: true, ckyc_number: 'XXXXXXXXXX1234', kyc_date: '2024-01-15' },
    },
    webhook: 'verification.ckyc.found',
    latency: '< 25s',
  },
  'video-kyc': {
    method: 'POST',
    path: `${API_BASE}/v1/verify/video_kyc/session`,
    auth: 'Bearer JWT',
    summary: 'Create a hosted video KYC session for agent-assisted verification.',
    requestFields: [
      { name: 'reference_id', type: 'string', required: true, description: 'Your unique session id' },
      { name: 'redirect_url', type: 'string', required: true, description: 'Return URL after session' },
    ],
    sampleRequest: { reference_id: 'vkyc_001', redirect_url: 'https://app.example/kyc/done' },
    sampleResponse: {
      success: true,
      data: { session_id: 'vkyc_9f2a', join_url: 'https://verify.indiapaynow.com/vkyc/vkyc_9f2a' },
    },
    webhook: 'verification.video_kyc.completed',
    latency: '< 5 min',
  },
  digilocker: {
    method: 'POST',
    path: `${API_BASE}/v1/verify/digilocker/init`,
    auth: 'Bearer JWT',
    summary: 'Start DigiLocker OAuth flow to import issued documents.',
    requestFields: [
      { name: 'documents', type: 'string[]', required: true, description: 'aadhaar | pan | dl | rc' },
      { name: 'redirect_url', type: 'string', required: true, description: 'Callback after consent' },
    ],
    sampleRequest: { documents: ['aadhaar', 'pan'], redirect_url: 'https://app.example/digi/callback' },
    sampleResponse: {
      success: true,
      data: { auth_url: 'https://digilocker.gov.in/...', request_id: 'digi_7ab2' },
    },
    webhook: 'verification.digilocker.imported',
    latency: '< 2 min',
  },
};

export function getVerificationApi(item) {
  const override = apiOverrides[item.id];
  if (override) {
    return {
      method: override.method,
      path: override.path,
      auth: override.auth,
      summary: override.summary,
      requestFields: override.requestFields,
      sampleRequest: override.sampleRequest,
      sampleResponse: override.sampleResponse,
      webhook: override.webhook ?? `verification.${slugFromId(item.id)}.completed`,
      latency: override.latency ?? item.stats?.[0]?.[1] ?? '< 30s',
      rateLimit: '120 req/min (test) · 600 req/min (live)',
    };
  }

  const slug = slugFromId(item.id);
  return {
    method: 'POST',
    path: `${API_BASE}/v1/verify/${slug}`,
    auth: 'Bearer JWT or API key',
    summary: item.description,
    requestFields: defaultFields(item),
    sampleRequest: {
      reference_id: `ref_${slug}`,
      consent: true,
      document_number: '<number>',
    },
    sampleResponse: defaultResponse(item),
    webhook: `verification.${slug}.completed`,
    latency: item.stats?.[0]?.[1] ?? '< 30s',
    rateLimit: '120 req/min (test) · 600 req/min (live)',
  };
}

export function relatedApiEndpoints(item) {
  const primary = getVerificationApi(item);
  const slug = slugFromId(item.id);

  const endpoints = [
    {
      name: `${item.label} — primary`,
      method: primary.method,
      path: primary.path,
      auth: primary.auth.split('·')[0].trim(),
      description: primary.summary,
    },
  ];

  if (primary.method === 'POST') {
    endpoints.push({
      name: `${item.label} — status`,
      method: 'GET',
      path: `${API_BASE}/v1/verify/${slug}/:request_id`,
      auth: 'Bearer JWT or API key',
      description: 'Poll verification status by request id.',
    });
  }

  endpoints.push({
    name: `${item.label} — sandbox`,
    method: primary.method,
    path: primary.path.replace('/api/', '/api/sandbox/'),
    auth: 'Test API key',
    description: 'Sandbox endpoint with fixed OTPs and mock responses.',
  });

  if (item.id === 'aadhaar' || item.id.includes('aadhaar')) {
    endpoints.push({
      name: 'Aadhaar OTP send',
      method: 'POST',
      path: `${API_BASE}/v1/verify/aadhaar/otp/send`,
      auth: 'Bearer JWT or API key',
      description: 'Send OTP to Aadhaar-linked mobile after checksum pass.',
    });
  }

  return endpoints;
}

export function buildCurl(api, sampleRequest) {
  const url = `https://api.indiapaynow.com${api.path.replace(':code', 'HDFC0001234')}`;
  if (api.method === 'GET') {
    return `curl -X GET "${url}" \\
  -H "Authorization: Bearer YOUR_JWT" \\
  -H "Content-Type: application/json"`;
  }
  const body = JSON.stringify(sampleRequest || {}, null, 2);
  return `curl -X POST "${url}" \\
  -H "Authorization: Bearer YOUR_JWT" \\
  -H "Content-Type: application/json" \\
  -d '${body.replace(/'/g, "'\\''")}'`;
}

export { methodColors };
